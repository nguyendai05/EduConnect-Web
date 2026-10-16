package com.educonnect.auth;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

@Repository
@Profile("db-dev")
public class PendingRegistrationRepository {
    public record Pending(String email, String challenge, String passwordHash, String name, String phone,
                          String role, Long existingUserId, String otpHash, Instant expiresAt,
                          Instant lastSentAt, Instant windowStartedAt, int sendCount, int failedAttempts,
                          Instant completedAt) {
        @Override public String toString() { return "PendingRegistration[redacted]"; }
    }

    private final JdbcTemplate jdbc;
    private static Instant instant(Timestamp value) { return value == null ? null : value.toInstant(); }
    private static final RowMapper<Pending> MAPPER = (rs, row) -> new Pending(rs.getString("email"),
            rs.getString("challenge_id"), rs.getString("password_hash"), rs.getString("display_name"),
            rs.getString("phone"), rs.getString("role_code"), rs.getObject("existing_user_id", Long.class),
            rs.getString("otp_hash"), instant(rs.getTimestamp("expires_at")), instant(rs.getTimestamp("last_sent_at")),
            instant(rs.getTimestamp("send_window_started_at")), rs.getInt("send_count"), rs.getInt("failed_attempts"),
            instant(rs.getTimestamp("completed_at")));

    public PendingRegistrationRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Pending lockEmail(String email) {
        jdbc.update("INSERT INTO pending_registrations (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email", email);
        return jdbc.queryForObject("SELECT * FROM pending_registrations WHERE email = ? FOR UPDATE", MAPPER, email);
    }

    public Optional<Pending> findChallenge(String challenge, boolean lock) {
        return jdbc.query("SELECT * FROM pending_registrations WHERE challenge_id = ?" + (lock ? " FOR UPDATE" : ""),
                MAPPER, challenge).stream().findFirst();
    }

    public void issue(Pending value) {
        jdbc.update("""
                UPDATE pending_registrations SET challenge_id = ?, password_hash = ?, display_name = ?, phone = ?,
                role_code = ?, existing_user_id = ?, otp_hash = ?, expires_at = ?, last_sent_at = ?,
                send_window_started_at = ?, send_count = ?, failed_attempts = 0, completed_at = NULL WHERE email = ?
                """, value.challenge(), value.passwordHash(), value.name(), value.phone(), value.role(), value.existingUserId(),
                value.otpHash(), Timestamp.from(value.expiresAt()), Timestamp.from(value.lastSentAt()),
                Timestamp.from(value.windowStartedAt()), value.sendCount(), value.email());
    }

    public void failedAttempt(String email) {
        jdbc.update("UPDATE pending_registrations SET failed_attempts = failed_attempts + 1 WHERE email = ?", email);
    }

    public void complete(String email, Instant now) {
        jdbc.update("""
                UPDATE pending_registrations SET completed_at = ?, otp_hash = NULL, password_hash = NULL,
                display_name = NULL, phone = NULL, role_code = NULL WHERE email = ?
                """, Timestamp.from(now), email);
    }
}
