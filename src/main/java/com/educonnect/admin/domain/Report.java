package com.educonnect.admin.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping reports; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "reports", uniqueConstraints = {@UniqueConstraint(name = "uq_report_code", columnNames = {"public_code"})})
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "reporter_user_id", nullable = false)
    private Long reporterUserId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(name = "related_contract_id", nullable = true)
    private Long relatedContractId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "reason_code", nullable = false, length = 32)
    private ReportReason reasonCode;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private ReportStatus status;

    @Column(name = "assigned_admin_id", nullable = true)
    private Long assignedAdminId;

    @Column(name = "resolution", nullable = true, columnDefinition = "text")
    private String resolution;

    @Column(name = "resolved_by", nullable = true)
    private Long resolvedBy;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "resolved_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant resolvedAt;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount reporterUserReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount targetUserReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "related_contract_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.contract.domain.Contract relatedContractReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "assigned_admin_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount assignedAdminReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "resolved_by", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount resolvedByReference;

    protected Report() {}

    public static Report create() { return new Report(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getReporterUserId() { return reporterUserId; }
    public void setReporterUserId(Long reporterUserId) { this.reporterUserId = reporterUserId; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public Long getRelatedContractId() { return relatedContractId; }
    public void setRelatedContractId(Long relatedContractId) { this.relatedContractId = relatedContractId; }

    public ReportReason getReasonCode() { return reasonCode; }
    public void setReasonCode(ReportReason reasonCode) { this.reasonCode = reasonCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public Long getAssignedAdminId() { return assignedAdminId; }
    public void setAssignedAdminId(Long assignedAdminId) { this.assignedAdminId = assignedAdminId; }

    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }

    public Long getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(Long resolvedBy) { this.resolvedBy = resolvedBy; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.user.domain.UserAccount getReporterUserReference() { return reporterUserReference; }

    public com.educonnect.user.domain.UserAccount getTargetUserReference() { return targetUserReference; }

    public com.educonnect.contract.domain.Contract getRelatedContractReference() { return relatedContractReference; }

    public com.educonnect.user.domain.UserAccount getAssignedAdminReference() { return assignedAdminReference; }

    public com.educonnect.user.domain.UserAccount getResolvedByReference() { return resolvedByReference; }
}
