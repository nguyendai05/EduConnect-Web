package com.educonnect.job.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping job_posts; maintainer: Đạt. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "job_posts", uniqueConstraints = {@UniqueConstraint(name = "uq_jobs_code", columnNames = {"public_code"})})
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Column(name = "title", nullable = false, length = 220)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "grade_level_id", nullable = false)
    private Long gradeLevelId;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    @Column(name = "delivery_mode_id", nullable = false)
    private Long deliveryModeId;

    @Column(name = "budget_per_session", nullable = false, precision = 19, scale = 0)
    private BigDecimal budgetPerSession;

    @Column(name = "session_count", nullable = false)
    private Short sessionCount;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private JobPostStatus status;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.LearnerProfile learnerReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.Subject subjectReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grade_level_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.GradeLevel gradeLevelReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.Area areaReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delivery_mode_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.DeliveryMode deliveryModeReference;

    protected JobPost() {}

    public static JobPost create() { return new JobPost(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public Long getDeliveryModeId() { return deliveryModeId; }
    public void setDeliveryModeId(Long deliveryModeId) { this.deliveryModeId = deliveryModeId; }

    public BigDecimal getBudgetPerSession() { return budgetPerSession; }
    public void setBudgetPerSession(BigDecimal budgetPerSession) { this.budgetPerSession = budgetPerSession; }

    public Short getSessionCount() { return sessionCount; }
    public void setSessionCount(Short sessionCount) { this.sessionCount = sessionCount; }

    public JobPostStatus getStatus() { return status; }
    public void setStatus(JobPostStatus status) { this.status = status; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.user.domain.LearnerProfile getLearnerReference() { return learnerReference; }

    public com.educonnect.common.reference.domain.Subject getSubjectReference() { return subjectReference; }

    public com.educonnect.common.reference.domain.GradeLevel getGradeLevelReference() { return gradeLevelReference; }

    public com.educonnect.common.reference.domain.Area getAreaReference() { return areaReference; }

    public com.educonnect.common.reference.domain.DeliveryMode getDeliveryModeReference() { return deliveryModeReference; }
}
