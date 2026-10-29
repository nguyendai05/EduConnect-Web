package com.educonnect.order.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import com.educonnect.user.domain.UserAccount;

/** Mapping idempotency_records; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "idempotency_records", uniqueConstraints = {@UniqueConstraint(name = "uq_idem_scope", columnNames = {"scope", "actor_user_id", "request_key"})})
public class IdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "scope", nullable = false, length = 48)
    private String scope;

    @Column(name = "request_key", nullable = false, length = 128)
    private String requestKey;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "request_hash", nullable = false, length = 32, columnDefinition = "binary(32)")
    private byte[] requestHash;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private IdempotencyStatus status;

    @Column(name = "order_id", nullable = true)
    private Long orderId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "response_hash", nullable = true, length = 32, columnDefinition = "binary(32)")
    private byte[] responseHash;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "expires_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private UserAccount actorUserReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "order_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private Order orderReference;

    protected IdempotencyRecord() {}

    public static IdempotencyRecord create() { return new IdempotencyRecord(); }

    public Long getId() { return id; }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }

    public String getRequestKey() { return requestKey; }
    public void setRequestKey(String requestKey) { this.requestKey = requestKey; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public byte[] getRequestHash() { return requestHash == null ? null : requestHash.clone(); }
    public void setRequestHash(byte[] requestHash) { this.requestHash = requestHash == null ? null : requestHash.clone(); }

    public IdempotencyStatus getStatus() { return status; }
    public void setStatus(IdempotencyStatus status) { this.status = status; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public byte[] getResponseHash() { return responseHash == null ? null : responseHash.clone(); }
    public void setResponseHash(byte[] responseHash) { this.responseHash = responseHash == null ? null : responseHash.clone(); }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public UserAccount getActorUserReference() { return actorUserReference; }

    public Order getOrderReference() { return orderReference; }
}
