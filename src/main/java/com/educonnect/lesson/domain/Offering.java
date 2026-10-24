package com.educonnect.lesson.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** Mapping offerings; maintainer: Đạt. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "offerings", uniqueConstraints = {@UniqueConstraint(name = "uq_off_code", columnNames = {"public_code"}), @UniqueConstraint(name = "uq_off_owner", columnNames = {"id", "tutor_id"})})
public class Offering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "offering_type", nullable = false, length = 32)
    private OfferingType offeringType;

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

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 0)
    private BigDecimal unitPrice;

    @JdbcTypeCode(SqlTypes.CHAR)
    @ColumnDefault("'VND'")
    @Column(name = "currency", nullable = false, length = 3, columnDefinition = "char(3)")
    private String currency = "VND";

    @Column(name = "session_count", nullable = false)
    private Short sessionCount;

    @Column(name = "duration_minutes", nullable = false)
    private Short durationMinutes;

    @Column(name = "capacity", nullable = true)
    private Integer capacity;

    @Column(name = "starts_on", nullable = true)
    private LocalDate startsOn;

    @Column(name = "ends_on", nullable = true)
    private LocalDate endsOn;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private OfferingStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "first_published_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant firstPublishedAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "published_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant publishedAt;

    @Column(name = "reviewed_by", nullable = true)
    private Long reviewedBy;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "reviewed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant reviewedAt;

    @Column(name = "review_note", nullable = true, columnDefinition = "text")
    private String reviewNote;

    @Column(name = "terms_version", nullable = false)
    private Integer termsVersion;

    @Column(name = "terms_text", nullable = false, columnDefinition = "text")
    private String termsText;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "updated_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "reviewed_by", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount reviewedByReference;

    protected Offering() {}

    public static Offering create() { return new Offering(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public OfferingType getOfferingType() { return offeringType; }
    public void setOfferingType(OfferingType offeringType) { this.offeringType = offeringType; }

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

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Short getSessionCount() { return sessionCount; }
    public void setSessionCount(Short sessionCount) { this.sessionCount = sessionCount; }

    public Short getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Short durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public LocalDate getStartsOn() { return startsOn; }
    public void setStartsOn(LocalDate startsOn) { this.startsOn = startsOn; }

    public LocalDate getEndsOn() { return endsOn; }
    public void setEndsOn(LocalDate endsOn) { this.endsOn = endsOn; }

    public OfferingStatus getStatus() { return status; }
    public void setStatus(OfferingStatus status) { this.status = status; }

    public Instant getFirstPublishedAt() { return firstPublishedAt; }
    public void setFirstPublishedAt(Instant firstPublishedAt) { this.firstPublishedAt = firstPublishedAt; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public Long getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(Long reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }

    public Integer getTermsVersion() { return termsVersion; }
    public void setTermsVersion(Integer termsVersion) { this.termsVersion = termsVersion; }

    public String getTermsText() { return termsText; }
    public void setTermsText(String termsText) { this.termsText = termsText; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.common.reference.domain.Subject getSubjectReference() { return subjectReference; }

    public com.educonnect.common.reference.domain.GradeLevel getGradeLevelReference() { return gradeLevelReference; }

    public com.educonnect.common.reference.domain.Area getAreaReference() { return areaReference; }

    public com.educonnect.common.reference.domain.DeliveryMode getDeliveryModeReference() { return deliveryModeReference; }

    public com.educonnect.user.domain.UserAccount getReviewedByReference() { return reviewedByReference; }
}
