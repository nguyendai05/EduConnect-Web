package com.educonnect.lesson.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping reviews; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "reviews", uniqueConstraints = {@UniqueConstraint(name = "uq_review_contract", columnNames = {"contract_id"})})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "reviewer_user_id", nullable = false)
    private Long reviewerUserId;

    @Column(name = "rating", nullable = false)
    private Byte rating;

    @Column(name = "comment", nullable = false, length = 1000)
    private String comment;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 24)
    private ReviewStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.contract.domain.Contract contractReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount reviewerUserReference;

    protected Review() {}

    public static Review create() { return new Review(); }

    public Long getId() { return id; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public Long getReviewerUserId() { return reviewerUserId; }
    public void setReviewerUserId(Long reviewerUserId) { this.reviewerUserId = reviewerUserId; }

    public Byte getRating() { return rating; }
    public void setRating(Byte rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public ReviewStatus getStatus() { return status; }
    public void setStatus(ReviewStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.contract.domain.Contract getContractReference() { return contractReference; }

    public com.educonnect.user.domain.UserAccount getReviewerUserReference() { return reviewerUserReference; }
}
