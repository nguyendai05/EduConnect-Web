package com.educonnect.auth;

import com.educonnect.auth.domain.AuthToken;
import com.educonnect.auth.domain.AuthTokenPurpose;
import com.educonnect.auth.repository.AuthTokenJpaRepository;
import com.educonnect.user.domain.AccountStatus;
import com.educonnect.user.domain.UserAccount;
import com.educonnect.user.repository.UserAccountJpaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/** DAI-01 reset uses the shared auth_tokens mapping. Registration/OTP retains its JDBC path. */
@Service
@Profile("db-dev")
@Validated
public class PasswordResetService {
    public enum State { VALID, MISSING, INVALID, EXPIRED, USED }

    private static final AuthTokenPurpose PURPOSE = AuthTokenPurpose.RESET_PASSWORD;
    private final AuthTokenJpaRepository tokens;
    private final UserAccountJpaRepository accounts;
    private final PasswordEncoder encoder;
    private final PasswordResetMailSender mail;
    private final PasswordResetProperties properties;
    private final Clock clock;
    private final EntityManager entityManager;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(AuthTokenJpaRepository tokens, UserAccountJpaRepository accounts,
                                PasswordEncoder encoder, PasswordResetMailSender mail,
                                PasswordResetProperties properties, Clock clock, EntityManager entityManager) {
        this.tokens = tokens;
        this.accounts = accounts;
        this.encoder = encoder;
        this.mail = mail;
        this.properties = properties;
        this.clock = clock;
        this.entityManager = entityManager;
    }

    @Transactional
    public void request(String email) {
        var found = accounts.findLockedByEmail(email);
        if (found.isEmpty() || !eligible(found.get())) return;
        var user = found.get();
        Instant now = clock.instant();
        var last = tokens.findFirstByUserIdAndPurposeOrderByCreatedAtDesc(user.getId(), PURPOSE);
        if (last.filter(t -> now.isBefore(t.getCreatedAt().plus(properties.resendCooldown()))).isPresent()
                || tokens.countByUserIdAndPurposeAndCreatedAtAfter(user.getId(), PURPOSE, now.minus(Duration.ofHours(1)))
                    >= properties.maxSendsPerHour()) return;

        // The account row serializes issue/use/reissue. A failed send rolls back revocation and insertion.
        revokeUnused(user.getId(), now);
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        var token = AuthToken.create();
        token.setUserId(user.getId());
        token.setPurpose(PURPOSE);
        token.setTokenHash(hash(secret));
        token.setCreatedAt(now);
        token.setExpiresAt(now.plus(properties.ttl()));
        tokens.saveAndFlush(token);
        String base = properties.baseUrl().toString().replaceAll("/+$", "");
        mail.send(user.getEmail(), base + "/auth/reset-password?token=" + secret, properties.ttl());
    }

    @Transactional(readOnly = true)
    public State state(String secret) {
        if (secret == null || secret.isBlank()) return State.MISSING;
        if (!wellFormed(secret)) return State.INVALID;
        return tokens.findByTokenHashAndPurpose(hash(secret), PURPOSE).map(t -> {
            if (accounts.findById(t.getUserId()).filter(PasswordResetService::eligible).isEmpty()) return State.INVALID;
            return state(t);
        }).orElse(State.INVALID);
    }

    @Transactional
    public State reset(@Valid ResetPasswordForm form) {
        if (!wellFormed(form.getToken())) return State.INVALID;
        var candidate = tokens.findByTokenHashAndPurpose(hash(form.getToken()), PURPOSE);
        if (candidate.isEmpty()) return State.INVALID;
        var user = accounts.findLockedById(candidate.get().getUserId()).orElse(null);
        if (user == null || !eligible(user)) return State.INVALID;
        // Read after the account lock: a concurrent use/reissue may have committed while waiting.
        // Locking refresh uses a current read even under MySQL REPEATABLE READ.
        var token = candidate.get();
        entityManager.refresh(token, LockModeType.PESSIMISTIC_WRITE);
        State tokenState = state(token);
        if (tokenState != State.VALID) return tokenState;
        Instant now = clock.instant();
        user.setPasswordHash(encoder.encode(form.getPassword()));
        user.setAuthenticationVersion(user.getAuthenticationVersion() + 1);
        user.setUpdatedAt(now);
        token.setUsedAt(now);
        revokeUnused(user.getId(), now);
        accounts.flush();
        return State.VALID;
    }

    private void revokeUnused(Long id, Instant now) {
        tokens.findByUserIdAndPurposeAndUsedAtIsNullAndRevokedAtIsNull(id, PURPOSE)
                .forEach(t -> t.setRevokedAt(now));
    }

    private State state(AuthToken token) {
        if (token.getUsedAt() != null) return State.USED;
        if (token.getRevokedAt() != null) return State.INVALID;
        return clock.instant().isBefore(token.getExpiresAt()) ? State.VALID : State.EXPIRED;
    }

    private static boolean eligible(UserAccount user) {
        return user.getStatus() == AccountStatus.ACTIVE && user.getEmailVerifiedAt() != null;
    }

    private static boolean wellFormed(String secret) {
        return secret != null && secret.matches("[A-Za-z0-9_-]{43}");
    }

    private static byte[] hash(String secret) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.US_ASCII));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
