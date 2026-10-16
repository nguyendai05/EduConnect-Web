package com.educonnect.wallet.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping releases; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "releases", uniqueConstraints = {@UniqueConstraint(name = "uq_release_key", columnNames = {"release_key"})})
public class Release {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "release_key", nullable = false, length = 96)
    private String releaseKey;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "reason_code", nullable = false, length = 32)
    private ReleaseReason reasonCode;

    @Column(name = "gross_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal grossAmount;

    @Column(name = "fee_rate_snapshot", nullable = false, precision = 9, scale = 6)
    private BigDecimal feeRateSnapshot;

    @Column(name = "fee_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal feeAmount;

    @Column(name = "tutor_net_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal tutorNetAmount;

    @Column(name = "fee_policy_version", nullable = false, length = 64)
    private String feePolicyVersion;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "rounding_mode", nullable = false, length = 24)
    private ReleaseRoundingMode roundingMode;

    @Column(name = "approved_by", nullable = false)
    private Long approvedBy;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "released_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant releasedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.contract.domain.Contract contractReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "approved_by", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount approvedByReference;

    protected Release() {}

    public static Release create() { return new Release(); }

    public Long getId() { return id; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public String getReleaseKey() { return releaseKey; }
    public void setReleaseKey(String releaseKey) { this.releaseKey = releaseKey; }

    public ReleaseReason getReasonCode() { return reasonCode; }
    public void setReasonCode(ReleaseReason reasonCode) { this.reasonCode = reasonCode; }

    public BigDecimal getGrossAmount() { return grossAmount; }
    public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }

    public BigDecimal getFeeRateSnapshot() { return feeRateSnapshot; }
    public void setFeeRateSnapshot(BigDecimal feeRateSnapshot) { this.feeRateSnapshot = feeRateSnapshot; }

    public BigDecimal getFeeAmount() { return feeAmount; }
    public void setFeeAmount(BigDecimal feeAmount) { this.feeAmount = feeAmount; }

    public BigDecimal getTutorNetAmount() { return tutorNetAmount; }
    public void setTutorNetAmount(BigDecimal tutorNetAmount) { this.tutorNetAmount = tutorNetAmount; }

    public String getFeePolicyVersion() { return feePolicyVersion; }
    public void setFeePolicyVersion(String feePolicyVersion) { this.feePolicyVersion = feePolicyVersion; }

    public ReleaseRoundingMode getRoundingMode() { return roundingMode; }
    public void setRoundingMode(ReleaseRoundingMode roundingMode) { this.roundingMode = roundingMode; }

    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }

    public Instant getReleasedAt() { return releasedAt; }
    public void setReleasedAt(Instant releasedAt) { this.releasedAt = releasedAt; }

    public com.educonnect.contract.domain.Contract getContractReference() { return contractReference; }

    public com.educonnect.user.domain.UserAccount getApprovedByReference() { return approvedByReference; }
}
