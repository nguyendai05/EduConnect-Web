package com.educonnect.notification.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping notifications; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "notifications", uniqueConstraints = {@UniqueConstraint(name = "uq_notice_event", columnNames = {"recipient_user_id", "event_key"})})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(name = "event_key", nullable = false, length = 128)
    private String eventKey;

    @Column(name = "notification_type", nullable = false, length = 32)
    private String notificationType;

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "body", nullable = false, length = 1000)
    private String body;

    @Column(name = "order_id", nullable = true)
    private Long orderId;

    @Column(name = "refund_id", nullable = true)
    private Long refundId;

    @Column(name = "report_id", nullable = true)
    private Long reportId;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "read_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant readAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount recipientUserReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "order_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.order.domain.Order orderReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "refund_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.payment.domain.Refund refundReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "report_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.admin.domain.Report reportReference;

    protected Notification() {}

    public static Notification create() { return new Notification(); }

    public Long getId() { return id; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public String getEventKey() { return eventKey; }
    public void setEventKey(String eventKey) { this.eventKey = eventKey; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getRefundId() { return refundId; }
    public void setRefundId(Long refundId) { this.refundId = refundId; }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.user.domain.UserAccount getRecipientUserReference() { return recipientUserReference; }

    public com.educonnect.order.domain.Order getOrderReference() { return orderReference; }

    public com.educonnect.payment.domain.Refund getRefundReference() { return refundReference; }

    public com.educonnect.admin.domain.Report getReportReference() { return reportReference; }
}
