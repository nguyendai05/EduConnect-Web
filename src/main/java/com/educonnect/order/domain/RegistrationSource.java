package com.educonnect.order.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping registration_sources; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "registration_sources", uniqueConstraints = {@UniqueConstraint(name = "uq_sources_invitation", columnNames = {"invitation_id"}), @UniqueConstraint(name = "uq_sources_application", columnNames = {"application_id"})})
public class RegistrationSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "source_kind", nullable = false, length = 32)
    private RegistrationSourceKind sourceKind;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "invitation_id", nullable = true)
    private Long invitationId;

    @Column(name = "job_id", nullable = true)
    private Long jobId;

    @Column(name = "application_id", nullable = true)
    private Long applicationId;

    @Column(name = "offering_id", nullable = true)
    private Long offeringId;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.LearnerProfile learnerReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    protected RegistrationSource() {}

    public static RegistrationSource create() { return new RegistrationSource(); }

    public Long getId() { return id; }

    public RegistrationSourceKind getSourceKind() { return sourceKind; }
    public void setSourceKind(RegistrationSourceKind sourceKind) { this.sourceKind = sourceKind; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public Long getInvitationId() { return invitationId; }
    public void setInvitationId(Long invitationId) { this.invitationId = invitationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getOfferingId() { return offeringId; }
    public void setOfferingId(Long offeringId) { this.offeringId = offeringId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.user.domain.LearnerProfile getLearnerReference() { return learnerReference; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }
}
