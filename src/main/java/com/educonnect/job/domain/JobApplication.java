package com.educonnect.job.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping job_applications; maintainer: Đạt. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "job_applications", uniqueConstraints = {@UniqueConstraint(name = "uq_apps_tutor", columnNames = {"job_id", "tutor_id"}), @UniqueConstraint(name = "uq_apps_selection", columnNames = {"job_id", "id", "tutor_id"})})
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "proposed_unit_price", nullable = false, precision = 19, scale = 0)
    private BigDecimal proposedUnitPrice;

    @Column(name = "message", nullable = false, columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private JobApplicationStatus status;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.job.domain.JobPost jobReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    protected JobApplication() {}

    public static JobApplication create() { return new JobApplication(); }

    public Long getId() { return id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public BigDecimal getProposedUnitPrice() { return proposedUnitPrice; }
    public void setProposedUnitPrice(BigDecimal proposedUnitPrice) { this.proposedUnitPrice = proposedUnitPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public JobApplicationStatus getStatus() { return status; }
    public void setStatus(JobApplicationStatus status) { this.status = status; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.job.domain.JobPost getJobReference() { return jobReference; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }
}
