package com.educonnect.auth.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping auth_tokens; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "auth_tokens", uniqueConstraints = {@UniqueConstraint(name = "uq_tokens_hash", columnNames = {"token_hash"})})
public class AuthToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "purpose", nullable = false, length = 32)
    private AuthTokenPurpose purpose;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "token_hash", nullable = false, length = 32, columnDefinition = "binary(32)")
    private byte[] tokenHash;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "expires_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant expiresAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "used_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant usedAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "revoked_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant revokedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount userReference;

    protected AuthToken() {}

    public static AuthToken create() { return new AuthToken(); }

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public AuthTokenPurpose getPurpose() { return purpose; }
    public void setPurpose(AuthTokenPurpose purpose) { this.purpose = purpose; }

    public byte[] getTokenHash() { return tokenHash == null ? null : tokenHash.clone(); }
    public void setTokenHash(byte[] tokenHash) { this.tokenHash = tokenHash == null ? null : tokenHash.clone(); }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getUsedAt() { return usedAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }

    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }

    public com.educonnect.user.domain.UserAccount getUserReference() { return userReference; }
}
