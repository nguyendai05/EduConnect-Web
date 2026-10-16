package com.educonnect.payment.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

/** Mapping refunds; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "refunds", uniqueConstraints = {@UniqueConstraint(name = "uq_refund_key", columnNames = {"request_key"}), @UniqueConstraint(name = "uq_refund_pending", columnNames = {"pending_contract_id"}), @UniqueConstraint(name = "uq_refund_provider_ref", columnNames = {"provider_reference"})})
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "request_key", nullable = false, length = 96)
    private String requestKey;

    @Column(name = "basis_amount_snapshot", nullable = false, precision = 19, scale = 0)
    private BigDecimal basisAmountSnapshot;

    @Column(name = "refund_rate_snapshot", nullable = false, precision = 9, scale = 6)
    private BigDecimal refundRateSnapshot;

    @Column(name = "amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @Column(name = "policy_version", nullable = false, length = 64)
    private String policyVersion;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "destination", nullable = false, length = 32)
    private RefundDestination destination;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private RefundStatus status;

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;

    @Column(name = "reason", nullable = false, length = 600)
    private String reason;

    @Column(name = "provider_reference", nullable = true, length = 128)
    private String providerReference;

    @Column(name = "failure_code", nullable = true, length = 64)
    private String failureCode;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "requested_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant requestedAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "processed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant processedAt;

    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(name = "pending_contract_id", nullable = true, insertable = false, updatable = false)
    private Long pendingContractId;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount requestedByReference;

    protected Refund() {}

    public static Refund create() { return new Refund(); }

    public Long getId() { return id; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public String getRequestKey() { return requestKey; }
    public void setRequestKey(String requestKey) { this.requestKey = requestKey; }

    public BigDecimal getBasisAmountSnapshot() { return basisAmountSnapshot; }
    public void setBasisAmountSnapshot(BigDecimal basisAmountSnapshot) { this.basisAmountSnapshot = basisAmountSnapshot; }

    public BigDecimal getRefundRateSnapshot() { return refundRateSnapshot; }
    public void setRefundRateSnapshot(BigDecimal refundRateSnapshot) { this.refundRateSnapshot = refundRateSnapshot; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPolicyVersion() { return policyVersion; }
    public void setPolicyVersion(String policyVersion) { this.policyVersion = policyVersion; }

    public RefundDestination getDestination() { return destination; }
    public void setDestination(RefundDestination destination) { this.destination = destination; }

    public RefundStatus getStatus() { return status; }
    public void setStatus(RefundStatus status) { this.status = status; }

    public Long getRequestedBy() { return requestedBy; }
    public void setRequestedBy(Long requestedBy) { this.requestedBy = requestedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getProviderReference() { return providerReference; }
    public void setProviderReference(String providerReference) { this.providerReference = providerReference; }

    public String getFailureCode() { return failureCode; }
    public void setFailureCode(String failureCode) { this.failureCode = failureCode; }

    public Instant getRequestedAt() { return requestedAt; }
    public void setRequestedAt(Instant requestedAt) { this.requestedAt = requestedAt; }

    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }

    public Long getPendingContractId() { return pendingContractId; }

    public Long getVersion() { return version; }

    public com.educonnect.user.domain.UserAccount getRequestedByReference() { return requestedByReference; }
}
