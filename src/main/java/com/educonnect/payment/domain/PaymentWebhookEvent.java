package com.educonnect.payment.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping payment_webhook_events; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "payment_webhook_events", uniqueConstraints = {@UniqueConstraint(name = "uq_webhook_event", columnNames = {"provider", "event_key"})})
public class PaymentWebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "provider", nullable = false, length = 24)
    private String provider;

    @Column(name = "event_key", nullable = false, length = 128)
    private String eventKey;

    @Column(name = "payment_attempt_id", nullable = true)
    private Long paymentAttemptId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "payload_hash", nullable = false, length = 32, columnDefinition = "binary(32)")
    private byte[] payloadHash;

    @JdbcTypeCode(SqlTypes.BIT)
    @Column(name = "signature_verified", nullable = false)
    private Boolean signatureVerified;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private WebhookEventStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "received_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant receivedAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "processed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant processedAt;

    @Column(name = "error_code", nullable = true, length = 64)
    private String errorCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "payment_attempt_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private PaymentAttempt paymentAttemptReference;

    protected PaymentWebhookEvent() {}

    public static PaymentWebhookEvent create() { return new PaymentWebhookEvent(); }

    public Long getId() { return id; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getEventKey() { return eventKey; }
    public void setEventKey(String eventKey) { this.eventKey = eventKey; }

    public Long getPaymentAttemptId() { return paymentAttemptId; }
    public void setPaymentAttemptId(Long paymentAttemptId) { this.paymentAttemptId = paymentAttemptId; }

    public byte[] getPayloadHash() { return payloadHash == null ? null : payloadHash.clone(); }
    public void setPayloadHash(byte[] payloadHash) { this.payloadHash = payloadHash == null ? null : payloadHash.clone(); }

    public Boolean getSignatureVerified() { return signatureVerified; }
    public void setSignatureVerified(Boolean signatureVerified) { this.signatureVerified = signatureVerified; }

    public WebhookEventStatus getStatus() { return status; }
    public void setStatus(WebhookEventStatus status) { this.status = status; }

    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }

    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public PaymentAttempt getPaymentAttemptReference() { return paymentAttemptReference; }
}
