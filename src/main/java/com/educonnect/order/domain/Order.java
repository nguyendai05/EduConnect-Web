package com.educonnect.order.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import com.educonnect.user.domain.LearnerProfile;

/** Mapping orders; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "orders", uniqueConstraints = {@UniqueConstraint(name = "uq_orders_code", columnNames = {"public_code"}), @UniqueConstraint(name = "uq_orders_creation", columnNames = {"learner_id", "creation_key"})})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private OrderStatus status;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal totalAmount;

    @JdbcTypeCode(SqlTypes.CHAR)
    @ColumnDefault("'VND'")
    @Column(name = "currency", nullable = false, length = 3, columnDefinition = "char(3)")
    private String currency = "VND";

    @Column(name = "creation_key", nullable = false, length = 96)
    private String creationKey;

    @Column(name = "cancellation_reason", nullable = true, length = 600)
    private String cancellationReason;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "cancelled_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant cancelledAt;

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
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private LearnerProfile learnerReference;

    protected Order() {}

    public static Order create() { return new Order(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getCreationKey() { return creationKey; }
    public void setCreationKey(String creationKey) { this.creationKey = creationKey; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Instant getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public LearnerProfile getLearnerReference() { return learnerReference; }
}
