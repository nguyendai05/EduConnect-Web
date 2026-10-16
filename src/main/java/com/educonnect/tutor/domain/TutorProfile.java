package com.educonnect.tutor.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping tutor_profiles; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "tutor_profiles")
public class TutorProfile {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "review_status", nullable = false, length = 32)
    private TutorReviewStatus reviewStatus;

    @Column(name = "headline", nullable = false, length = 180)
    private String headline;

    @Column(name = "experience_years", nullable = false)
    private Short experienceYears;

    @Column(name = "reviewed_by", nullable = true)
    private Long reviewedBy;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "reviewed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant reviewedAt;

    @Column(name = "review_note", nullable = true, columnDefinition = "text")
    private String reviewNote;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "updated_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant updatedAt;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private com.educonnect.user.domain.UserAccount account;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "reviewed_by", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount reviewedByReference;

    protected TutorProfile() {}

    public static TutorProfile create() { return new TutorProfile(); }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public TutorReviewStatus getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(TutorReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public Short getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Short experienceYears) { this.experienceYears = experienceYears; }

    public Long getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(Long reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }

    public Long getVersion() { return version; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public com.educonnect.user.domain.UserAccount getAccount() { return account; }
    public void setAccount(com.educonnect.user.domain.UserAccount account) { this.account = account; }

    public com.educonnect.user.domain.UserAccount getReviewedByReference() { return reviewedByReference; }
}
