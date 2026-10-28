package com.educonnect.payment.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.service.StatusRecorder;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.payment.domain.Payment;
import com.educonnect.payment.domain.PaymentAllocation;
import com.educonnect.payment.domain.PaymentAllocationId;
import com.educonnect.payment.domain.PaymentStatus;
import com.educonnect.payment.dto.PaymentSummaryDTO;
import com.educonnect.payment.repository.PaymentAllocationJpaRepository;
import com.educonnect.payment.repository.PaymentJpaRepository;
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
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Thanh toán hợp đồng: tính phần ví/phần thiếu, ghi sổ tiền và kích hoạt hợp đồng khi đủ tiền. */
@Service
@Profile("db-dev")
@Transactional
public class PaymentService {
    private PaymentJpaRepository payments;
    private PaymentAllocationJpaRepository allocations;
    private ContractJpaRepository contracts;
    private EnrollmentJpaRepository enrollments;
    private LedgerService ledger;
    private StatusRecorder status;
    private EntityManager entityManager;
    private Clock clock;

    public PaymentService(PaymentJpaRepository payments, PaymentAllocationJpaRepository allocations,
                          ContractJpaRepository contracts, EnrollmentJpaRepository enrollments, LedgerService ledger,
                          StatusRecorder status, EntityManager entityManager, Clock clock) {
        this.payments = payments;
        this.allocations = allocations;
        this.contracts = contracts;
        this.enrollments = enrollments;
        this.ledger = ledger;
        this.status = status;
        this.entityManager = entityManager;
        this.clock = clock;
    }

    /** Dữ liệu trang checkout: hợp đồng, số dư ví và cách chia tiền gợi ý (hoặc thanh toán đang có). */
    @Transactional(readOnly = true)
    public PaymentSummaryDTO checkout(AccountPrincipal user, Long contractId) {
        Contract contract = ownContract(user, contractId);
        Payment payment = payments.findByOrderId(contract.getOrderItemReference().getOrderId()).orElse(null);
        return summary(payment, contract);
    }

    /** Dữ liệu trang kết quả của một thanh toán thuộc người đăng nhập. */
    @Transactional(readOnly = true)
    public PaymentSummaryDTO summary(AccountPrincipal user, Long paymentId) {
        Payment payment = ownPayment(user, paymentId);
        return summary(payment, contractOf(payment));
    }

    /**
     * Bắt đầu thanh toán hợp đồng. Nếu ví đủ tiền thì nạp đủ ngay; phần thiếu qua PayOS sẽ làm ở bước sau.
     * Gọi lại khi thanh toán đã có sẽ trả về thanh toán đó.
     */
    public Long start(AccountPrincipal user, Long contractId, boolean useWallet) {
        Contract contract = ownContract(user, contractId);
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE); // chặn hai yêu cầu cùng lúc
        if (order.getStatus() != OrderStatus.AWAITING_PAYMENT || contract.getStatus() != ContractStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException("Đơn không còn chờ thanh toán");
        }
        Instant now = clock.instant();
        enrollments.findByContractId(contractId).ifPresent(e -> {
            if (e.getStatus() == EnrollmentStatus.RESERVED && !e.getReservedUntil().isAfter(now)) {
                throw new IllegalArgumentException("Đã hết thời gian giữ chỗ, vui lòng đăng ký lại");
            }
        });
        Payment payment = payments.findByOrderId(order.getId())
                .orElseGet(() -> createPayment(order, contract, useWallet, now));
        if (payment.getStatus() == PaymentStatus.PENDING && payment.getProviderAmount().signum() == 0) {
            fund(payment, contract, order, now);
        } else if (payment.getStatus() == PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Thanh toán qua PayOS chưa được bật");
        }
        return payment.getId();
    }

    /** Tạo thanh toán và phân bổ cho hợp đồng; phần ví lấy tối đa theo số dư hiện có. */
    private Payment createPayment(Order order, Contract contract, boolean useWallet, Instant now) {
        BigDecimal total = order.getTotalAmount();
        BigDecimal balance = useWallet ? ledger.balance(ledger.walletAccount(contract.getLearnerId())) : BigDecimal.ZERO;
        BigDecimal wallet = balance.min(total).max(BigDecimal.ZERO);
        Payment payment = Payment.create();
        payment.setPublicCode("PAY-" + UUID.randomUUID());
        payment.setOrderId(order.getId());
        payment.setAmount(total);
        payment.setWalletAmount(wallet);
        payment.setProviderAmount(total.subtract(wallet));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(now);
        payments.save(payment);
        PaymentAllocation allocation = PaymentAllocation.create();
        allocation.setId(new PaymentAllocationId(payment.getId(), contract.getId()));
        allocation.setAmount(total);
        allocation.setWalletAmount(wallet);
        allocation.setProviderAmount(payment.getProviderAmount());
        allocations.save(allocation);
        return payment;
    }

    /**
     * Ghi sổ tiền vào ký quỹ rồi kích hoạt hợp đồng: PayOS (nếu có) và ví cùng vào tài khoản ký quỹ,
     * đơn thành PAID, hợp đồng ACTIVE, chỗ giữ thành CONFIRMED. Gọi lại khi đã FUNDED thì bỏ qua.
     */
    public void fund(Payment payment, Contract contract, Order order, Instant now) {
        if (payment.getStatus() == PaymentStatus.FUNDED) return;
        Long escrow = ledger.escrowAccount(contract.getId());
        if (payment.getWalletAmount().signum() > 0) {
            Long wallet = ledger.walletAccount(contract.getLearnerId());
            ledger.lock(wallet);
            if (ledger.balance(wallet).compareTo(payment.getWalletAmount()) < 0) {
                throw new IllegalArgumentException("Số dư ví không đủ để thanh toán");
            }
            post("WALLET-PAY-" + payment.getId(), JournalKind.WALLET_PAYMENT, payment, contract, wallet, escrow, payment.getWalletAmount());
        }
        if (payment.getProviderAmount().signum() > 0) {
            Long clearing = ledger.systemAccount(LedgerAccountKind.PROVIDER_CLEARING);
            post("PROVIDER-PAY-" + payment.getId(), JournalKind.PROVIDER_PAYMENT, payment, contract, clearing, escrow, payment.getProviderAmount());
        }
        payment.setStatus(PaymentStatus.FUNDED);
        payment.setFundedAt(now);
        status.order(order, OrderStatus.PAID, contract.getLearnerId(), null, "Thanh toán thành công", now);
        status.contract(contract, ContractStatus.ACTIVE, contract.getLearnerId(), "Thanh toán thành công", now);
        enrollments.findByContractId(contract.getId()).ifPresent(e -> {
            e.setStatus(EnrollmentStatus.CONFIRMED);
            e.setConfirmedAt(now);
            e.setReservedUntil(null);
        });
    }

    /** Ghi một bút toán chuyển tiền từ tài khoản nguồn vào ký quỹ. */
    private void post(String key, JournalKind kind, Payment payment, Contract contract, Long from, Long escrow, BigDecimal amount) {
        MoneyJournal journal = ledger.newJournal(key, kind, "Thanh toán hợp đồng " + contract.getPublicCode());
        journal.setPaymentId(payment.getId());
        journal.setContractId(contract.getId());
        ledger.post(journal, List.of(new Line(from, EntrySide.DEBIT, amount), new Line(escrow, EntrySide.CREDIT, amount)));
    }

    private PaymentSummaryDTO summary(Payment payment, Contract contract) {
        var item = contract.getOrderItemReference();
        BigDecimal balance = ledger.balance(ledger.walletAccount(contract.getLearnerId()));
        BigDecimal total = item.getOrderReference().getTotalAmount();
        BigDecimal wallet = payment != null ? payment.getWalletAmount() : balance.min(total).max(BigDecimal.ZERO);
        BigDecimal provider = payment != null ? payment.getProviderAmount() : total.subtract(wallet);
        String state = payment != null ? payment.getStatus().name() : "NONE";
        boolean canPay = contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                && (payment == null || payment.getStatus() == PaymentStatus.PENDING);
        return new PaymentSummaryDTO(payment != null ? payment.getId() : null, contract.getId(), contract.getPublicCode(),
                item.getTitleSnapshot(), total, wallet, provider, balance, state, label(state), null, null, canPay);
    }

    private static String label(String state) {
        return switch (state) {
            case "NONE", "PENDING" -> "Chờ thanh toán";
            case "FUNDED" -> "Đã thanh toán";
            case "FAILED" -> "Thanh toán thất bại";
            case "CANCELLED" -> "Đã hủy";
            case "REFUND_PENDING" -> "Đang hoàn tiền";
            case "PARTIALLY_REFUNDED" -> "Đã hoàn một phần";
            default -> "Đã hoàn tiền";
        };
    }

    private Contract ownContract(AccountPrincipal user, Long contractId) {
        return contracts.findByIdWithDetails(contractId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng"));
    }

    private Payment ownPayment(AccountPrincipal user, Long paymentId) {
        return payments.findOwned(paymentId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thanh toán"));
    }

    private Contract contractOf(Payment payment) {
        return contracts.findByOrderItemReferenceOrderReferenceId(payment.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng"));
    }
}
