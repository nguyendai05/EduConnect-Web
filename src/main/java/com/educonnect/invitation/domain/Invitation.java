package com.educonnect.invitation.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping invitations; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "invitations", uniqueConstraints = {@UniqueConstraint(name = "uq_inv_code", columnNames = {"public_code"}), @UniqueConstraint(name = "uq_inv_parties", columnNames = {"id", "learner_id", "tutor_id"})})
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "offering_id", nullable = true)
    private Long offeringId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "grade_level_id", nullable = false)
    private Long gradeLevelId;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    @Column(name = "delivery_mode_id", nullable = false)
    private Long deliveryModeId;

    @Column(name = "proposed_unit_price", nullable = false, precision = 19, scale = 0)
    private BigDecimal proposedUnitPrice;

    @Column(name = "session_count", nullable = false)
    private Short sessionCount;

    @Column(name = "terms_version", nullable = false)
    private Integer termsVersion;

    @Column(name = "terms_text", nullable = false, columnDefinition = "text")
    private String termsText;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private InvitationStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "accepted_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant acceptedAt;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "expires_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.LearnerProfile learnerReference;

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

    protected Invitation() {}

    public static Invitation create() { return new Invitation(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public Long getOfferingId() { return offeringId; }
    public void setOfferingId(Long offeringId) { this.offeringId = offeringId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public Long getDeliveryModeId() { return deliveryModeId; }
    public void setDeliveryModeId(Long deliveryModeId) { this.deliveryModeId = deliveryModeId; }

    public BigDecimal getProposedUnitPrice() { return proposedUnitPrice; }
    public void setProposedUnitPrice(BigDecimal proposedUnitPrice) { this.proposedUnitPrice = proposedUnitPrice; }

    public Short getSessionCount() { return sessionCount; }
    public void setSessionCount(Short sessionCount) { this.sessionCount = sessionCount; }

    public Integer getTermsVersion() { return termsVersion; }
    public void setTermsVersion(Integer termsVersion) { this.termsVersion = termsVersion; }

    public String getTermsText() { return termsText; }
    public void setTermsText(String termsText) { this.termsText = termsText; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public com.educonnect.user.domain.LearnerProfile getLearnerReference() { return learnerReference; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.common.reference.domain.Subject getSubjectReference() { return subjectReference; }

    public com.educonnect.common.reference.domain.GradeLevel getGradeLevelReference() { return gradeLevelReference; }

    public com.educonnect.common.reference.domain.Area getAreaReference() { return areaReference; }

    public com.educonnect.common.reference.domain.DeliveryMode getDeliveryModeReference() { return deliveryModeReference; }
}
