package com.educonnect.contract.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping contracts; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "contracts", uniqueConstraints = {@UniqueConstraint(name = "uq_contracts_code", columnNames = {"public_code"}), @UniqueConstraint(name = "uq_contracts_item", columnNames = {"order_item_id"})})
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "order_item_id", nullable = false)
    private Long orderItemId;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private ContractStatus status;

    @Column(name = "agreed_terms_text", nullable = false, columnDefinition = "text")
    private String agreedTermsText;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "agreed_terms_hash", nullable = false, length = 32, columnDefinition = "binary(32)")
    private byte[] agreedTermsHash;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "learner_accepted_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant learnerAcceptedAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "tutor_accepted_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant tutorAcceptedAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "completed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant completedAt;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.order.domain.OrderItem orderItemReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.LearnerProfile learnerReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    protected Contract() {}

    public static Contract create() { return new Contract(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public ContractStatus getStatus() { return status; }
    public void setStatus(ContractStatus status) { this.status = status; }

    public String getAgreedTermsText() { return agreedTermsText; }
    public void setAgreedTermsText(String agreedTermsText) { this.agreedTermsText = agreedTermsText; }

    public byte[] getAgreedTermsHash() { return agreedTermsHash == null ? null : agreedTermsHash.clone(); }
    public void setAgreedTermsHash(byte[] agreedTermsHash) { this.agreedTermsHash = agreedTermsHash == null ? null : agreedTermsHash.clone(); }

    public Instant getLearnerAcceptedAt() { return learnerAcceptedAt; }
    public void setLearnerAcceptedAt(Instant learnerAcceptedAt) { this.learnerAcceptedAt = learnerAcceptedAt; }

    public Instant getTutorAcceptedAt() { return tutorAcceptedAt; }
    public void setTutorAcceptedAt(Instant tutorAcceptedAt) { this.tutorAcceptedAt = tutorAcceptedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.order.domain.OrderItem getOrderItemReference() { return orderItemReference; }

    public com.educonnect.user.domain.LearnerProfile getLearnerReference() { return learnerReference; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }
}
