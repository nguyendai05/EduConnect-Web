package com.educonnect.payment.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.service.ContractSessionService;
import com.educonnect.contract.service.StatusRecorder;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.payment.PayosClient;
import com.educonnect.payment.PayosProperties;
import com.educonnect.payment.domain.Payment;
import com.educonnect.payment.domain.PaymentAttempt;
import com.educonnect.payment.domain.PaymentAttemptStatus;
import com.educonnect.payment.domain.PaymentProvider;
import com.educonnect.payment.domain.PaymentWebhookEvent;
import com.educonnect.payment.domain.WebhookEventStatus;
import com.educonnect.payment.domain.PaymentAllocation;
import com.educonnect.payment.domain.PaymentAllocationId;
import com.educonnect.payment.domain.PaymentStatus;
import com.educonnect.payment.dto.PaymentSummaryDTO;
import com.educonnect.payment.repository.PaymentAllocationJpaRepository;
import com.educonnect.payment.repository.PaymentAttemptJpaRepository;
import com.educonnect.payment.repository.PaymentJpaRepository;
import com.educonnect.payment.repository.PaymentWebhookEventJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.domain.EntrySide;
import com.educonnect.wallet.domain.JournalKind;
import com.educonnect.wallet.domain.LedgerAccountKind;
import com.educonnect.wallet.domain.MoneyJournal;
import com.educonnect.wallet.service.LedgerService;
import com.educonnect.wallet.service.LedgerService.Line;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Thanh toán hợp đồng: tính phần ví/phần thiếu, ghi sổ tiền và kích hoạt hợp đồng khi đủ tiền. */
@Service
@Profile("db-dev")
@Transactional
public class PaymentService {
    private PaymentJpaRepository payments;
    private PaymentAllocationJpaRepository allocations;
    private PaymentAttemptJpaRepository attempts;
    private PaymentWebhookEventJpaRepository webhooks;
    private PayosClient payos;
    private PayosProperties properties;
    private ObjectMapper json;
    private SecureRandom random = new SecureRandom();
    private ContractJpaRepository contracts;
    private EnrollmentJpaRepository enrollments;
    private LedgerService ledger;
    private StatusRecorder status;
    private ContractSessionService sessionService;
    private EntityManager entityManager;
    private Clock clock;

    public PaymentService(PaymentJpaRepository payments, PaymentAllocationJpaRepository allocations,
                          PaymentAttemptJpaRepository attempts, PaymentWebhookEventJpaRepository webhooks,
                          PayosClient payos, PayosProperties properties, ObjectMapper json,
                          ContractJpaRepository contracts, EnrollmentJpaRepository enrollments, LedgerService ledger,
                          StatusRecorder status, ContractSessionService sessionService, EntityManager entityManager, Clock clock) {
        this.payments = payments;
        this.allocations = allocations;
        this.attempts = attempts;
        this.webhooks = webhooks;
        this.payos = payos;
        this.properties = properties;
        this.json = json;
        this.contracts = contracts;
        this.enrollments = enrollments;
        this.ledger = ledger;
        this.status = status;
        this.sessionService = sessionService;
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
     * Bắt đầu thanh toán hợp đồng. Ví đủ tiền thì nạp đủ ngay; phần thiếu mở một lần thử qua PayOS
     * (dùng lại lần thử đang chờ nếu còn hạn). Gọi lại khi thanh toán đã có sẽ trả về thanh toán đó.
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
            startAttempt(payment, now);
        }
        return payment.getId();
    }

    /** Mở một lần thử PayOS mới, trừ khi lần thử gần nhất còn chờ và chưa hết hạn. */
    private void startAttempt(Payment payment, Instant now) {
        PaymentAttempt last = attempts.findTopByPaymentIdOrderByAttemptNumberDesc(payment.getId()).orElse(null);
        if (last != null && last.getStatus() == PaymentAttemptStatus.PENDING && last.getExpiresAt().isAfter(now)) return;
        int number = last == null ? 1 : last.getAttemptNumber() + 1;
        long orderCode = System.currentTimeMillis() * 100 + random.nextInt(100);
        Instant expiresAt = now.plus(properties.linkTtl());
        String back = properties.publicBaseUrl() + "/payment/result?payment=" + payment.getId();
        var link = payos.createLink(orderCode, payment.getProviderAmount().longValueExact(),
                "EduConnect " + payment.getId(), back, back, expiresAt);
        PaymentAttempt attempt = PaymentAttempt.create();
        attempt.setPaymentId(payment.getId());
        attempt.setAttemptNumber(number);
        attempt.setProvider(PaymentProvider.PAYOS);
        attempt.setProviderOrderCode(orderCode);
        attempt.setProviderReference(link.paymentLinkId());
        attempt.setRequestKey("PAY-" + payment.getId() + "-" + number);
        attempt.setAmount(payment.getProviderAmount());
        attempt.setStatus(PaymentAttemptStatus.PENDING);
        attempt.setCreatedAt(now);
        attempt.setExpiresAt(expiresAt);
        attempts.save(attempt);
    }

    /**
     * Trạng thái để trang QR hỏi định kỳ. Nếu lần thử còn chờ thì hỏi lại PayOS (dự phòng khi webhook
     * chưa tới) và áp dụng kết quả bằng cùng logic với webhook.
     */
    public Map<String, String> poll(AccountPrincipal user, Long paymentId) {
        Payment payment = ownPayment(user, paymentId);
        PaymentAttempt last = attempts.findTopByPaymentIdOrderByAttemptNumberDesc(paymentId).orElse(null);
        if (payment.getStatus() == PaymentStatus.PENDING && last != null && last.getStatus() == PaymentAttemptStatus.PENDING) {
            refreshFromPayos(last);
            payment = ownPayment(user, paymentId);
            last = attempts.findTopByPaymentIdOrderByAttemptNumberDesc(paymentId).orElse(null);
        }
        return Map.of("status", payment.getStatus().name(), "attempt", last == null ? "NONE" : last.getStatus().name());
    }

    /** Hỏi PayOS về một lần thử đang chờ và cập nhật nếu đã trả, hủy hoặc hết hạn. */
    private void refreshFromPayos(PaymentAttempt attempt) {
        if (!payos.configured()) return;
        String state;
        try {
            state = payos.status(attempt.getProviderOrderCode());
        } catch (RuntimeException error) {
            return; // PayOS tạm lỗi: lần hỏi sau sẽ thử lại
        }
        Instant now = clock.instant();
        switch (state) {
            case "PAID" -> applyPaid(attempt, now);
            case "CANCELLED" -> attempt.setStatus(PaymentAttemptStatus.CANCELLED);
            case "EXPIRED" -> attempt.setStatus(PaymentAttemptStatus.EXPIRED);
            default -> {
                if (!attempt.getExpiresAt().isAfter(now)) attempt.setStatus(PaymentAttemptStatus.EXPIRED);
            }
        }
    }

    /**
     * Nhận webhook PayOS. Chỉ tin sau khi kiểm chữ ký; mỗi sự kiện chỉ xử lý một lần (khóa theo mã đơn + tham chiếu).
     * Trả false nếu chữ ký sai hoặc nội dung không đọc được.
     */
    public boolean handleWebhook(String body) {
        JsonNode root;
        try {
            root = json.readTree(body);
        } catch (Exception error) {
            return false;
        }
        Instant now = clock.instant();
        byte[] hash = sha256(body);
        if (root == null || !payos.verify(root)) {
            saveEvent("invalid-" + HexFormat.of().formatHex(hash), null, hash, false, WebhookEventStatus.REJECTED, now, "BAD_SIGNATURE");
            return false;
        }
        JsonNode data = root.path("data");
        long orderCode = data.path("orderCode").asLong();
        String key = orderCode + ":" + data.path("reference").asText("paid");
        if (webhooks.existsByProviderAndEventKey("PAYOS", key)) return true; // đã xử lý, PayOS gọi lặp
        PaymentAttempt attempt = attempts.findByProviderOrderCode(orderCode).orElse(null);
        if (attempt == null) {
            saveEvent(key, null, hash, true, WebhookEventStatus.REJECTED, now, "UNKNOWN_ORDER");
        } else if (!root.path("success").asBoolean() || !"00".equals(data.path("code").asText())) {
            saveEvent(key, attempt.getId(), hash, true, WebhookEventStatus.REJECTED, now, "NOT_SUCCESS");
        } else if (attempt.getAmount().compareTo(BigDecimal.valueOf(data.path("amount").asLong())) != 0) {
            saveEvent(key, attempt.getId(), hash, true, WebhookEventStatus.REJECTED, now, "AMOUNT_MISMATCH");
        } else {
            String error = applyPaid(attempt, now);
            saveEvent(key, attempt.getId(), hash, true, error == null ? WebhookEventStatus.APPLIED : WebhookEventStatus.REJECTED, now, error);
        }
        return true;
    }

    /**
     * Áp dụng kết quả "đã trả tiền" cho một lần thử: đánh dấu lần thử thành công rồi nạp tiền vào ký quỹ.
     * Trả mã lỗi nếu thanh toán không còn chờ hoặc ví không đủ; null nếu thành công hoặc đã xử lý trước đó.
     */
    private String applyPaid(PaymentAttempt attempt, Instant now) {
        Payment payment = payments.findById(attempt.getPaymentId()).orElseThrow();
        Contract contract = contractOf(payment);
        Order order = contract.getOrderItemReference().getOrderReference();
        // Cùng thứ tự khóa với start(): đơn trước, thanh toán sau.
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        entityManager.refresh(payment, LockModeType.PESSIMISTIC_WRITE);
        entityManager.refresh(attempt, LockModeType.PESSIMISTIC_WRITE);
        if (attempt.getStatus() != PaymentAttemptStatus.SUCCEEDED) {
            attempt.setStatus(PaymentAttemptStatus.SUCCEEDED);
            attempt.setVerifiedAt(now);
        }
        if (payment.getStatus() == PaymentStatus.FUNDED) return null;
        if (payment.getStatus() != PaymentStatus.PENDING) return "PAYMENT_NOT_PENDING"; // đã hủy: cần hoàn tiền thủ công
        try {
            fund(payment, contract, order, now);
            return null;
        } catch (IllegalArgumentException error) {
            return "WALLET_SHORTFALL";
        }
    }

    private void saveEvent(String key, Long attemptId, byte[] hash, boolean verified, WebhookEventStatus state, Instant now, String error) {
        if (webhooks.existsByProviderAndEventKey("PAYOS", key)) return;
        PaymentWebhookEvent event = PaymentWebhookEvent.create();
        event.setProvider("PAYOS");
        event.setEventKey(key);
        event.setPaymentAttemptId(attemptId);
        event.setPayloadHash(hash);
        event.setSignatureVerified(verified);
        event.setStatus(state);
        event.setReceivedAt(now);
        if (state != WebhookEventStatus.RECEIVED) event.setProcessedAt(now);
        event.setErrorCode(error);
        webhooks.save(event);
    }

    private static byte[] sha256(String text) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    /** Tạo thanh toán và phân bổ cho hợp đồng; phần ví lấy tối đa theo số dư hiện có. */
    private Payment createPayment(Order order, Contract contract, boolean useWallet, Instant now) {
        BigDecimal total = order.getTotalAmount();
        BigDecimal balance = useWallet ? ledger.walletBalance(contract.getLearnerId()) : BigDecimal.ZERO;
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
        sessionService.create(contract);
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
        BigDecimal balance = ledger.walletBalance(contract.getLearnerId());
        BigDecimal total = item.getOrderReference().getTotalAmount();
        BigDecimal wallet = payment != null ? payment.getWalletAmount() : balance.min(total).max(BigDecimal.ZERO);
        BigDecimal provider = payment != null ? payment.getProviderAmount() : total.subtract(wallet);
        String state = payment != null ? payment.getStatus().name() : "NONE";
        boolean canPay = contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                && (payment == null || payment.getStatus() == PaymentStatus.PENDING);
        PaymentAttempt last = payment == null ? null
                : attempts.findTopByPaymentIdOrderByAttemptNumberDesc(payment.getId()).orElse(null);
        String text = label(state);
        String payUrl = null;
        Instant expiresAt = null;
        if (last != null && "PENDING".equals(state)) {
            if (last.getStatus() == PaymentAttemptStatus.PENDING && last.getExpiresAt().isAfter(clock.instant())) {
                payUrl = payos.payUrl(last.getProviderReference());
                expiresAt = last.getExpiresAt();
            } else if (last.getStatus() != PaymentAttemptStatus.PENDING) {
                text = "Phiên thanh toán chưa hoàn tất";
            } else {
                text = "Phiên thanh toán đã hết hạn";
            }
        }
        return new PaymentSummaryDTO(payment != null ? payment.getId() : null, contract.getId(), contract.getPublicCode(),
                item.getTitleSnapshot(), total, wallet, provider, balance, state, text, payUrl, expiresAt, canPay);
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
