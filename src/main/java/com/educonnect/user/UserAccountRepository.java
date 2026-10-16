package com.educonnect.user;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

@Repository
@Profile("db-dev")
public class UserAccountRepository {
    private final JdbcTemplate jdbc;

    public UserAccountRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<UserAccount> findByEmail(String email) {
        return find("email", email);
    }

    public Optional<UserAccount> findById(Long id) {
        return find("id", id);
    }

    private Optional<UserAccount> find(String column, Object value) {
        // Column is supplied only by the two methods above; values are bound parameters.
        return jdbc.query("SELECT id, email, password_hash, display_name, status, email_verified_at, authentication_version "
                        + "FROM user_accounts WHERE " + column + " = ?",
                (rs, row) -> new UserAccount(rs.getLong("id"), rs.getString("email"),
                        rs.getString("password_hash"), rs.getString("display_name"), rs.getString("status"), rs.getTimestamp("email_verified_at") != null,
                        rs.getLong("authentication_version"), new HashSet<>(jdbc.queryForList(
                                "SELECT role_code FROM user_roles WHERE user_id = ?", String.class, rs.getLong("id")))),
                value).stream().findFirst();
    }

    /** Must run in RegistrationService's transaction: account, role and profile succeed together. */
    public void createVerified(String email, String hash, String name, String phone, String role) {
        var key = new GeneratedKeyHolder();
        Timestamp now = Timestamp.from(Instant.now());
        jdbc.update(connection -> {
            var statement = connection.prepareStatement("""
                    INSERT INTO user_accounts
                    (public_code, email, password_hash, status, display_name, phone, created_at, updated_at, email_verified_at)
                    VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, "USER-" + UUID.randomUUID());
            statement.setString(2, email);
            statement.setString(3, hash);
            statement.setString(4, name);
            statement.setString(5, phone);
            statement.setTimestamp(6, now);
            statement.setTimestamp(7, now);
            statement.setTimestamp(8, now);
            return statement;
        }, key);
        long userId = key.getKey().longValue();
        jdbc.update("INSERT INTO user_roles (user_id, role_code) VALUES (?, ?)", userId, role);
        if ("TUTOR".equals(role)) {
            jdbc.update("""
                    INSERT INTO tutor_profiles (user_id, review_status, headline, experience_years, updated_at)
                    VALUES (?, 'DRAFT', '', 0, ?)
                    """, userId, now);
        } else {
            jdbc.update("INSERT INTO learner_profiles (user_id, learner_kind) VALUES (?, 'SELF')", userId);
        }
    }

    public int markEmailVerified(Long id) {
        return jdbc.update("""
                UPDATE user_accounts SET email_verified_at = ?, updated_at = ?, authentication_version = authentication_version + 1, version = version + 1
                WHERE id = ? AND email_verified_at IS NULL AND status = 'ACTIVE'
                """, Timestamp.from(Instant.now()), Timestamp.from(Instant.now()), id);
    }
}
