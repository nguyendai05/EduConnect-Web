package com.educonnect.contract.service;

import com.educonnect.contract.CheckoutProperties;
import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.payment.domain.Payment;
import com.educonnect.payment.domain.PaymentAttempt;
import com.educonnect.payment.domain.PaymentAttemptStatus;
import com.educonnect.payment.domain.PaymentStatus;
import com.educonnect.payment.domain.Refund;
import com.educonnect.payment.domain.RefundDestination;
import com.educonnect.payment.domain.RefundStatus;
import com.educonnect.payment.domain.RefundStatusHistory;
import com.educonnect.payment.repository.PaymentAttemptJpaRepository;
import com.educonnect.payment.repository.PaymentJpaRepository;
import com.educonnect.payment.repository.RefundJpaRepository;
import com.educonnect.payment.repository.RefundStatusHistoryJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.domain.EntrySide;
import com.educonnect.wallet.domain.JournalKind;
import com.educonnect.wallet.domain.LedgerAccountKind;
import com.educonnect.wallet.domain.MoneyJournal;
import com.educonnect.wallet.service.LedgerService;
import com.educonnect.wallet.service.LedgerService.Line;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Hủy hợp đồng chưa thanh toán (học viên) và hoàn tiền phần chưa giải ngân (quản trị). */
@Service
@Profile("db-dev")
@Transactional
public class ContractLifecycleService {
    private ContractSessionJpaRepository sessions;
    private EnrollmentJpaRepository enrollments;
    private PaymentJpaRepository payments;
    private PaymentAttemptJpaRepository attempts;
    private RefundJpaRepository refunds;
    private RefundStatusHistoryJpaRepository refundHistory;
    private CheckoutProperties properties;
    private LedgerService ledger;
    private StatusRecorder status;
    private EntityManager entityManager;
    private Clock clock;

    public ContractLifecycleService(ContractSessionJpaRepository sessions, EnrollmentJpaRepository enrollments,
                                    PaymentJpaRepository payments, PaymentAttemptJpaRepository attempts,
                                    RefundJpaRepository refunds, RefundStatusHistoryJpaRepository refundHistory,
                                    CheckoutProperties properties, LedgerService ledger,
                                    StatusRecorder status, EntityManager entityManager, Clock clock) {
        this.sessions = sessions;
        this.enrollments = enrollments;
        this.payments = payments;
        this.attempts = attempts;
        this.refunds = refunds;
        this.refundHistory = refundHistory;
        this.properties = properties;
        this.ledger = ledger;
        this.status = status;
        this.entityManager = entityManager;
        this.clock = clock;
    }

    /** Học viên hủy hợp đồng chưa thanh toán: đơn và hợp đồng CANCELLED, nhả chỗ giữ, đóng thanh toán và lần thử đang chờ. */
    public void cancel(AccountPrincipal user, Long contractId, String reason) {
        if (reason == null || reason.trim().length() < 5 || reason.trim().length() > 400) {
            throw new IllegalArgumentException("Vui lòng nhập lý do hủy (5 đến 400 ký tự)");
        }
        Contract contract = lock(contractId);
        if (!contract.getLearnerId().equals(user.getId())) throw notFound();
        Order order = lockOrder(contract);
        if (contract.getStatus() != ContractStatus.AWAITING_PAYMENT || order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException("Hợp đồng đã thanh toán, vui lòng liên hệ quản trị để được hỗ trợ");
        }
        Instant now = clock.instant();
        String text = reason.trim();
        status.order(order, OrderStatus.CANCELLED, user.getId(), "LEARNER", text, now);
        status.contract(contract, ContractStatus.CANCELLED, user.getId(), text, now);
        enrollments.findByContractId(contractId).ifPresent(e -> e.setStatus(EnrollmentStatus.CANCELLED));
        payments.findByOrderId(order.getId()).ifPresent(payment -> {
            if (payment.getStatus() != PaymentStatus.PENDING) return;
            payment.setStatus(PaymentStatus.CANCELLED);
            for (PaymentAttempt a : attempts.findByPaymentIdAndStatus(payment.getId(), PaymentAttemptStatus.PENDING)) {
                a.setStatus(PaymentAttemptStatus.CANCELLED);
            }
        });
    }

    /**
     * Quản trị hoàn tiền cho học viên sau khi xem hợp đồng: hoàn phần ký quỹ của các buổi chưa giải ngân vào ví học viên
     * (theo tỷ lệ hoàn đang áp dụng, phần không hoàn vào doanh thu nền tảng), rồi hủy hợp đồng và nhả chỗ giữ.
     */
    public void refund(AccountPrincipal admin, Long contractId, String reason) {
        if (reason == null || reason.trim().length() < 5 || reason.trim().length() > 400) {
            throw new IllegalArgumentException("Vui lòng nhập lý do hoàn tiền (5 đến 400 ký tự)");
        }
        Contract contract = lock(contractId);
        Order order = lockOrder(contract);
        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("Chỉ hoàn tiền cho hợp đồng đang thực hiện");
        }
        List<ContractSession> open = sessions.findByContractIdAndStatusIn(contractId,
                List.of(ContractSessionStatus.HELD, ContractSessionStatus.ATTENDED));
        BigDecimal basis = open.stream().map(ContractSession::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Payment payment = payments.findByOrderId(order.getId()).filter(p -> p.getStatus() == PaymentStatus.FUNDED).orElse(null);
        if (basis.signum() == 0 || payment == null) throw new IllegalArgumentException("Không còn phần tiền nào để hoàn");
        Instant now = clock.instant();
        String text = reason.trim();

        BigDecimal rate = properties.refundRate();
        Refund refund = Refund.create();
        refund.setPaymentId(payment.getId());
        refund.setContractId(contractId);
        refund.setRequestKey("REFUND-" + contractId);
        refund.setBasisAmountSnapshot(basis);
        refund.setRefundRateSnapshot(rate);
        refund.setAmount(basis.multiply(rate).setScale(0, RoundingMode.HALF_UP));
        refund.setPolicyVersion(properties.feePolicyVersion());
        refund.setDestination(RefundDestination.WALLET);
        refund.setStatus(RefundStatus.SUCCEEDED);
        refund.setRequestedBy(admin.getId());
        refund.setReason(text);
        refund.setRequestedAt(now);
        refund.setProcessedAt(now);
        refunds.save(refund);
        RefundStatusHistory history = RefundStatusHistory.create();
        history.setRefundId(refund.getId());
        history.setToStatus(RefundStatus.SUCCEEDED.name());
        history.setActorUserId(admin.getId());
        history.setReason(text);
        history.setChangedAt(now);
        refundHistory.save(history);

        Long escrow = ledger.escrowAccount(contractId);
        ledger.lock(escrow);
        if (ledger.balance(escrow).compareTo(basis) < 0) throw new IllegalStateException("Ký quỹ không đủ để hoàn tiền");
        MoneyJournal journal = ledger.newJournal("REFUND-" + refund.getId(), JournalKind.REFUND,
                "Hoàn tiền hợp đồng " + contract.getPublicCode());
        journal.setRefundId(refund.getId());
        journal.setContractId(contractId);
        List<Line> lines = new ArrayList<>();
        lines.add(new Line(escrow, EntrySide.DEBIT, basis));
        lines.add(new Line(ledger.walletAccount(contract.getLearnerId()), EntrySide.CREDIT, refund.getAmount()));
        BigDecimal kept = basis.subtract(refund.getAmount());
        if (kept.signum() > 0) lines.add(new Line(ledger.systemAccount(LedgerAccountKind.PLATFORM_REVENUE), EntrySide.CREDIT, kept));
        ledger.post(journal, lines);

        open.forEach(s -> s.setStatus(ContractSessionStatus.REFUNDED));
        boolean anyReleased = !sessions.findByContractIdAndStatusIn(contractId, List.of(ContractSessionStatus.RELEASED)).isEmpty();
        payment.setStatus(kept.signum() > 0 || anyReleased ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED);
        status.order(order, OrderStatus.CANCELLATION_PENDING, admin.getId(), "ADMIN", text, now);
        status.order(order, OrderStatus.CANCELLED, admin.getId(), "ADMIN", text, now);
        status.contract(contract, ContractStatus.CANCELLED, admin.getId(), text, now);
        enrollments.findByContractId(contractId).ifPresent(e -> e.setStatus(EnrollmentStatus.CANCELLED));
    }

    private Contract lock(Long contractId) {
        Contract contract = entityManager.find(Contract.class, contractId, LockModeType.PESSIMISTIC_WRITE);
        if (contract == null) throw notFound();
        return contract;
    }

    private Order lockOrder(Contract contract) {
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        return order;
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng");
    }
}
