package com.educonnect.job.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping job_selections; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "job_selections", uniqueConstraints = {@UniqueConstraint(name = "uq_sel_app", columnNames = {"application_id"}), @UniqueConstraint(name = "uq_sel_source", columnNames = {"job_id", "application_id", "tutor_id"})})
public class JobSelection {

    @Id
    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "selected_by", nullable = false)
    private Long selectedBy;

    @Column(name = "terms_version", nullable = false)
    private Integer termsVersion;

    @Column(name = "terms_text", nullable = false, columnDefinition = "text")
    private String termsText;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "selected_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant selectedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "selected_by", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount selectedByReference;

    protected JobSelection() {}

    public static JobSelection create() { return new JobSelection(); }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public Long getSelectedBy() { return selectedBy; }
    public void setSelectedBy(Long selectedBy) { this.selectedBy = selectedBy; }

    public Integer getTermsVersion() { return termsVersion; }
    public void setTermsVersion(Integer termsVersion) { this.termsVersion = termsVersion; }

    public String getTermsText() { return termsText; }
    public void setTermsText(String termsText) { this.termsText = termsText; }

    public Instant getSelectedAt() { return selectedAt; }
    public void setSelectedAt(Instant selectedAt) { this.selectedAt = selectedAt; }

    public com.educonnect.user.domain.UserAccount getSelectedByReference() { return selectedByReference; }
}
