package com.educonnect.admin.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.Map;

/** Mapping audit_logs; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "actor_user_id", nullable = true)
    private Long actorUserId;

    @Column(name = "action_code", nullable = false, length = 64)
    private String actionCode;

    @Column(name = "order_id", nullable = true)
    private Long orderId;

    @Column(name = "report_id", nullable = true)
    private Long reportId;

    @Column(name = "target_user_id", nullable = true)
    private Long targetUserId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", nullable = false, columnDefinition = "json")
    private Map<String, Object> metadata;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "actor_user_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount actorUserReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "order_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.order.domain.Order orderReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "report_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.admin.domain.Report reportReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "target_user_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount targetUserReference;

    protected AuditLog() {}

    public static AuditLog create() { return new AuditLog(); }

    public Long getId() { return id; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public String getActionCode() { return actionCode; }
    public void setActionCode(String actionCode) { this.actionCode = actionCode; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.user.domain.UserAccount getActorUserReference() { return actorUserReference; }

    public com.educonnect.order.domain.Order getOrderReference() { return orderReference; }

    public com.educonnect.admin.domain.Report getReportReference() { return reportReference; }

    public com.educonnect.user.domain.UserAccount getTargetUserReference() { return targetUserReference; }
}
