package com.educonnect.payment.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping payment_attempts; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "payment_attempts", uniqueConstraints = {@UniqueConstraint(name = "uq_attempt_number", columnNames = {"payment_id", "attempt_number"}), @UniqueConstraint(name = "uq_attempt_request", columnNames = {"request_key"}), @UniqueConstraint(name = "uq_attempt_provider_code", columnNames = {"provider", "provider_order_code"}), @UniqueConstraint(name = "uq_attempt_reference", columnNames = {"provider", "provider_reference"})})
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "provider", nullable = false, length = 24)
    private PaymentProvider provider;

    @Column(name = "provider_order_code", nullable = false)
    private Long providerOrderCode;

    @Column(name = "provider_reference", nullable = true, length = 128)
    private String providerReference;

    @Column(name = "request_key", nullable = false, length = 96)
    private String requestKey;

    @Column(name = "amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private PaymentAttemptStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "verified_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant verifiedAt;

    @Column(name = "failure_code", nullable = true, length = 64)
    private String failureCode;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "expires_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Payment paymentReference;

    protected PaymentAttempt() {}

    public static PaymentAttempt create() { return new PaymentAttempt(); }

    public Long getId() { return id; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }

    public PaymentProvider getProvider() { return provider; }
    public void setProvider(PaymentProvider provider) { this.provider = provider; }

    public Long getProviderOrderCode() { return providerOrderCode; }
    public void setProviderOrderCode(Long providerOrderCode) { this.providerOrderCode = providerOrderCode; }

    public String getProviderReference() { return providerReference; }
    public void setProviderReference(String providerReference) { this.providerReference = providerReference; }

    public String getRequestKey() { return requestKey; }
    public void setRequestKey(String requestKey) { this.requestKey = requestKey; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public PaymentAttemptStatus getStatus() { return status; }
    public void setStatus(PaymentAttemptStatus status) { this.status = status; }

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getFailureCode() { return failureCode; }
    public void setFailureCode(String failureCode) { this.failureCode = failureCode; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Payment getPaymentReference() { return paymentReference; }
}
