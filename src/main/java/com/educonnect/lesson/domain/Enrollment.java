package com.educonnect.lesson.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import com.educonnect.contract.domain.Contract;
import com.educonnect.user.domain.LearnerProfile;

/** Mapping enrollments; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "enrollments", uniqueConstraints = {@UniqueConstraint(name = "uq_enroll_contract", columnNames = {"contract_id"})})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "offering_id", nullable = false)
    private Long offeringId;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private EnrollmentStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "reserved_until", nullable = true, columnDefinition = "datetime(6)")
    private Instant reservedUntil;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "confirmed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant confirmedAt;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Contract contractReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offering_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Offering offeringReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private LearnerProfile learnerReference;

    protected Enrollment() {}

    public static Enrollment create() { return new Enrollment(); }

    public Long getId() { return id; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public Long getOfferingId() { return offeringId; }
    public void setOfferingId(Long offeringId) { this.offeringId = offeringId; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public Integer getSeatCount() { return seatCount; }
    public void setSeatCount(Integer seatCount) { this.seatCount = seatCount; }

    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }

    public Instant getReservedUntil() { return reservedUntil; }
    public void setReservedUntil(Instant reservedUntil) { this.reservedUntil = reservedUntil; }

    public Instant getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(Instant confirmedAt) { this.confirmedAt = confirmedAt; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Contract getContractReference() { return contractReference; }

    public Offering getOfferingReference() { return offeringReference; }

    public LearnerProfile getLearnerReference() { return learnerReference; }
}
