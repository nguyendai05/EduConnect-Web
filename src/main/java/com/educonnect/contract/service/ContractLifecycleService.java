package com.educonnect.contract.service;

import com.educonnect.contract.CheckoutProperties;
import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderItem;
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
import com.educonnect.wallet.domain.Release;
import com.educonnect.wallet.domain.ReleaseReason;
import com.educonnect.wallet.domain.ReleaseRoundingMode;
import com.educonnect.wallet.repository.ReleaseJpaRepository;
import com.educonnect.wallet.service.LedgerService;
import com.educonnect.wallet.service.LedgerService.Line;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Vòng đời sau thanh toán của hợp đồng: hoàn thành (chuyển tiền cho gia sư) và hủy/hoàn tiền. */
@Service
@Profile("db-dev")
@Transactional
public class ContractLifecycleService {
    private EnrollmentJpaRepository enrollments;
    private ReleaseJpaRepository releases;
    private PaymentJpaRepository payments;
    private PaymentAttemptJpaRepository attempts;
    private RefundJpaRepository refunds;
    private RefundStatusHistoryJpaRepository refundHistory;
    private CheckoutProperties properties;
    private LedgerService ledger;
    private StatusRecorder status;
    private EntityManager entityManager;
    private Clock clock;

    public ContractLifecycleService(EnrollmentJpaRepository enrollments, ReleaseJpaRepository releases,
                                    PaymentJpaRepository payments, PaymentAttemptJpaRepository attempts,
                                    RefundJpaRepository refunds, RefundStatusHistoryJpaRepository refundHistory,
                                    CheckoutProperties properties, LedgerService ledger,
                                    StatusRecorder status, EntityManager entityManager, Clock clock) {
        this.enrollments = enrollments;
        this.releases = releases;
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

    /**
     * Gia sư của hợp đồng (hoặc admin) xác nhận hoàn thành: đơn và hợp đồng sang COMPLETED, chỗ giữ sang COMPLETED,
     * rồi giải ngân ký quỹ cho gia sư sau khi trừ phí nền tảng. Chỉ làm được khi hợp đồng đang thực hiện.
     */
    public void complete(AccountPrincipal user, Long contractId) {
        Contract contract = lock(contractId);
        boolean admin = user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        if (!admin && !contract.getTutorId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng");
        }
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        if (contract.getStatus() != ContractStatus.ACTIVE
                || (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.IN_PROGRESS)) {
            throw new IllegalArgumentException("Hợp đồng chưa ở trạng thái đang thực hiện");
        }
        Instant now = clock.instant();
        String role = admin ? "ADMIN" : "TUTOR";
        if (order.getStatus() == OrderStatus.PAID) {
            status.order(order, OrderStatus.IN_PROGRESS, user.getId(), role, "Bắt đầu thực hiện", now);
        }
        status.order(order, OrderStatus.COMPLETED, user.getId(), role, "Hoàn thành hợp đồng", now);
        contract.setCompletedAt(now);
        status.contract(contract, ContractStatus.COMPLETED, user.getId(), "Hoàn thành hợp đồng", now);
        enrollments.findByContractId(contractId).ifPresent(e -> e.setStatus(EnrollmentStatus.COMPLETED));
        release(contract, contract.getOrderItemReference(), user.getId(), now);
    }

    /** Giải ngân: trừ phí theo tỷ lệ đã chốt trong đơn (làm tròn HALF_UP), phần còn lại vào ví gia sư. */
    private void release(Contract contract, OrderItem item, Long actorId, Instant now) {
        BigDecimal gross = item.getLineTotal();
        BigDecimal fee = gross.multiply(item.getFeeRateSnapshot()).setScale(0, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee);
        Long escrow = ledger.escrowAccount(contract.getId());
        ledger.lock(escrow);
        if (ledger.balance(escrow).compareTo(gross) < 0) throw new IllegalStateException("Ký quỹ không đủ để giải ngân");

        Release release = Release.create();
        release.setContractId(contract.getId());
        release.setReleaseKey("COMPLETION-" + contract.getId());
        release.setReasonCode(ReleaseReason.COMPLETION);
        release.setGrossAmount(gross);
        release.setFeeRateSnapshot(item.getFeeRateSnapshot());
        release.setFeeAmount(fee);
        release.setTutorNetAmount(net);
        release.setFeePolicyVersion(item.getFeePolicyVersion());
        release.setRoundingMode(ReleaseRoundingMode.HALF_UP);
        release.setApprovedBy(actorId);
        release.setReleasedAt(now);
        releases.save(release);

        MoneyJournal journal = ledger.newJournal("RELEASE-" + contract.getId(), JournalKind.RELEASE,
                "Giải ngân hợp đồng " + contract.getPublicCode());
        journal.setReleaseId(release.getId());
        journal.setContractId(contract.getId());
        List<Line> lines = new ArrayList<>();
        lines.add(new Line(escrow, EntrySide.DEBIT, gross));
        if (net.signum() > 0) lines.add(new Line(ledger.walletAccount(contract.getTutorId()), EntrySide.CREDIT, net));
        if (fee.signum() > 0) lines.add(new Line(ledger.systemAccount(LedgerAccountKind.PLATFORM_REVENUE), EntrySide.CREDIT, fee));
        ledger.post(journal, lines);
    }

    /**
     * Học viên hủy hợp đồng của mình. Chưa thanh toán thì hủy ngay và nhả chỗ giữ; đã thanh toán thì gửi yêu cầu hủy
     * (kèm yêu cầu hoàn tiền) để quản trị duyệt. Trả lời nhắn gửi người dùng.
     */
    public String cancel(AccountPrincipal user, Long contractId, String reason) {
        if (reason == null || reason.trim().length() < 5 || reason.trim().length() > 400) {
            throw new IllegalArgumentException("Vui lòng nhập lý do hủy (5 đến 400 ký tự)");
        }
        Contract contract = lock(contractId);
        if (!contract.getLearnerId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng");
        }
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        Instant now = clock.instant();
        String text = reason.trim();
        if (contract.getStatus() == ContractStatus.AWAITING_PAYMENT && order.getStatus() == OrderStatus.AWAITING_PAYMENT) {
            cancelUnpaid(contract, order, user.getId(), text, now);
            return "Đã hủy hợp đồng";
        }
        if (contract.getStatus() == ContractStatus.ACTIVE
                && (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.IN_PROGRESS)) {
            requestRefund(contract, order, user.getId(), text, now);
            return "Đã gửi yêu cầu hủy, đang chờ quản trị duyệt hoàn tiền";
        }
        throw new IllegalArgumentException("Hợp đồng không thể hủy ở trạng thái hiện tại");
    }

    /** Hủy khi chưa trả tiền: đơn và hợp đồng CANCELLED, nhả chỗ giữ, đóng thanh toán và các lần thử đang chờ. */
    private void cancelUnpaid(Contract contract, Order order, Long actorId, String reason, Instant now) {
        status.order(order, OrderStatus.CANCELLED, actorId, "LEARNER", reason, now);
        status.contract(contract, ContractStatus.CANCELLED, actorId, reason, now);
        enrollments.findByContractId(contract.getId()).ifPresent(e -> e.setStatus(EnrollmentStatus.CANCELLED));
        payments.findByOrderId(order.getId()).ifPresent(payment -> {
            if (payment.getStatus() != PaymentStatus.PENDING) return;
            payment.setStatus(PaymentStatus.CANCELLED);
            for (PaymentAttempt a : attempts.findByPaymentIdAndStatus(payment.getId(), PaymentAttemptStatus.PENDING)) {
                a.setStatus(PaymentAttemptStatus.CANCELLED);
            }
        });
    }

    /** Hủy khi đã trả tiền: đơn và hợp đồng chờ hủy, tạo yêu cầu hoàn tiền (vào ví) theo tỷ lệ đang áp dụng. */
    private void requestRefund(Contract contract, Order order, Long actorId, String reason, Instant now) {
        Payment payment = payments.findByOrderId(order.getId())
                .filter(p -> p.getStatus() == PaymentStatus.FUNDED)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khoản thanh toán để hoàn"));
        BigDecimal basis = payment.getAmount();
        BigDecimal rate = properties.refundRate();
        Refund refund = Refund.create();
        refund.setPaymentId(payment.getId());
        refund.setContractId(contract.getId());
        refund.setRequestKey("REFUND-" + contract.getId());
        refund.setBasisAmountSnapshot(basis);
        refund.setRefundRateSnapshot(rate);
        refund.setAmount(basis.multiply(rate).setScale(0, RoundingMode.HALF_UP));
        refund.setPolicyVersion(properties.feePolicyVersion());
        refund.setDestination(RefundDestination.WALLET);
        refund.setStatus(RefundStatus.REQUESTED);
        refund.setRequestedBy(actorId);
        refund.setReason(reason);
        refund.setRequestedAt(now);
        refunds.save(refund);
        recordRefund(refund, null, RefundStatus.REQUESTED, actorId, reason, now);
        payment.setStatus(PaymentStatus.REFUND_PENDING);
        status.order(order, OrderStatus.CANCELLATION_PENDING, actorId, "LEARNER", reason, now);
        status.contract(contract, ContractStatus.CANCELLATION_PENDING, actorId, reason, now);
    }

    /**
     * Quản trị duyệt yêu cầu hủy: hoàn tiền vào ví người học từ ký quỹ (phần không hoàn, nếu có, vào doanh thu nền tảng),
     * rồi đóng đơn và hợp đồng ở CANCELLED và nhả chỗ giữ. Chỉ duyệt được khi đang chờ hủy.
     */
    public void approveCancel(AccountPrincipal admin, Long contractId) {
        Contract contract = lock(contractId);
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        Refund refund = refunds.findByContractIdAndStatus(contractId, RefundStatus.REQUESTED).orElse(null);
        if (contract.getStatus() != ContractStatus.CANCELLATION_PENDING || refund == null) {
            throw new IllegalArgumentException("Hợp đồng không có yêu cầu hủy đang chờ duyệt");
        }
        Instant now = clock.instant();
        BigDecimal basis = refund.getBasisAmountSnapshot();
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

        refund.setStatus(RefundStatus.SUCCEEDED);
        refund.setProcessedAt(now);
        recordRefund(refund, RefundStatus.REQUESTED, RefundStatus.SUCCEEDED, admin.getId(), "Quản trị duyệt hoàn tiền", now);
        payments.findById(refund.getPaymentId()).ifPresent(p ->
                p.setStatus(kept.signum() > 0 ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED));
        status.order(order, OrderStatus.CANCELLED, admin.getId(), "ADMIN", "Quản trị duyệt hủy và hoàn tiền", now);
        status.contract(contract, ContractStatus.CANCELLED, admin.getId(), "Quản trị duyệt hủy và hoàn tiền", now);
        enrollments.findByContractId(contractId).ifPresent(e -> e.setStatus(EnrollmentStatus.CANCELLED));
    }

    private void recordRefund(Refund refund, RefundStatus from, RefundStatus to, Long actorId, String reason, Instant now) {
        RefundStatusHistory h = RefundStatusHistory.create();
        h.setRefundId(refund.getId());
        h.setFromStatus(from == null ? null : from.name());
        h.setToStatus(to.name());
        h.setActorUserId(actorId);
        h.setReason(reason);
        h.setChangedAt(now);
        refundHistory.save(h);
    }

    /** Khóa dòng hợp đồng trước khi đổi trạng thái; không có thì 404. */
    private Contract lock(Long contractId) {
        Contract contract = entityManager.find(Contract.class, contractId, LockModeType.PESSIMISTIC_WRITE);
        if (contract == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng");
        return contract;
    }
}
