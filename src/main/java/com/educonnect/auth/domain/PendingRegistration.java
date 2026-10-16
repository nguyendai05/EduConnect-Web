package com.educonnect.auth.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping pending_registrations; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "pending_registrations", uniqueConstraints = {@UniqueConstraint(name = "uq_pending_challenge", columnNames = {"challenge_id"})})
public class PendingRegistration {

    @Id
    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "challenge_id", nullable = true, length = 36, columnDefinition = "char(36)")
    private String challengeId;

    @Column(name = "password_hash", nullable = true, length = 255)
    private String passwordHash;

    @Column(name = "display_name", nullable = true, length = 120)
    private String displayName;

    @Column(name = "phone", nullable = true, length = 24)
    private String phone;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "role_code", nullable = true, length = 24)
    private RegistrationRole roleCode;

    @Column(name = "existing_user_id", nullable = true)
    private Long existingUserId;

    @Column(name = "otp_hash", nullable = true, length = 255)
    private String otpHash;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "expires_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant expiresAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "last_sent_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant lastSentAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "send_window_started_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant sendWindowStartedAt;

    @ColumnDefault("0")
    @Column(name = "send_count", nullable = false)
    private Integer sendCount = 0;

    @ColumnDefault("0")
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "completed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant completedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "existing_user_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount existingUserReference;

    protected PendingRegistration() {}

    public static PendingRegistration create() { return new PendingRegistration(); }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getChallengeId() { return challengeId; }
    public void setChallengeId(String challengeId) { this.challengeId = challengeId; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public RegistrationRole getRoleCode() { return roleCode; }
    public void setRoleCode(RegistrationRole roleCode) { this.roleCode = roleCode; }

    public Long getExistingUserId() { return existingUserId; }
    public void setExistingUserId(Long existingUserId) { this.existingUserId = existingUserId; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }

    public Instant getSendWindowStartedAt() { return sendWindowStartedAt; }
    public void setSendWindowStartedAt(Instant sendWindowStartedAt) { this.sendWindowStartedAt = sendWindowStartedAt; }

    public Integer getSendCount() { return sendCount; }
    public void setSendCount(Integer sendCount) { this.sendCount = sendCount; }

    public Integer getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(Integer failedAttempts) { this.failedAttempts = failedAttempts; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public com.educonnect.user.domain.UserAccount getExistingUserReference() { return existingUserReference; }
}
