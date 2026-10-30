package com.educonnect.payment.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import com.educonnect.user.domain.UserAccount;

/** Mapping refund_status_history; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "refund_status_history")
public class RefundStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "refund_id", nullable = false)
    private Long refundId;

    @Column(name = "from_status", nullable = true, length = 32)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 32)
    private String toStatus;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "reason", nullable = false, length = 600)
    private String reason;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "changed_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant changedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "refund_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Refund refundReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private UserAccount actorUserReference;

    protected RefundStatusHistory() {}

    public static RefundStatusHistory create() { return new RefundStatusHistory(); }

    public Long getId() { return id; }

    public Long getRefundId() { return refundId; }
    public void setRefundId(Long refundId) { this.refundId = refundId; }

    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }

    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }

    public Refund getRefundReference() { return refundReference; }

    public UserAccount getActorUserReference() { return actorUserReference; }
}
