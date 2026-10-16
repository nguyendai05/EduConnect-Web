package com.educonnect.user.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping user_accounts; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "user_accounts", uniqueConstraints = {@UniqueConstraint(name = "uq_users_code", columnNames = {"public_code"}), @UniqueConstraint(name = "uq_users_email", columnNames = {"email"})})
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private AccountStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "email_verified_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant emailVerifiedAt;

    @Column(name = "display_name", nullable = false, length = 120)
    private String displayName;

    @Column(name = "phone", nullable = true, length = 24)
    private String phone;

    @Column(name = "bio", nullable = true, columnDefinition = "text")
    private String bio;

    @ColumnDefault("0")
    @Column(name = "authentication_version", nullable = false)
    private Long authenticationVersion = 0L;

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

    protected UserAccount() {}

    public static UserAccount create() { return new UserAccount(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }

    public Instant getEmailVerifiedAt() { return emailVerifiedAt; }
    public void setEmailVerifiedAt(Instant emailVerifiedAt) { this.emailVerifiedAt = emailVerifiedAt; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Long getAuthenticationVersion() { return authenticationVersion; }
    public void setAuthenticationVersion(Long authenticationVersion) { this.authenticationVersion = authenticationVersion; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
