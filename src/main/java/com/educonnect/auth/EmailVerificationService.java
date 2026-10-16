package com.educonnect.auth;

import com.educonnect.auth.PendingRegistrationRepository.Pending;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Profile("db-dev")
public class EmailVerificationService {
    public enum Result { SUCCESS, INVALID, EXPIRED, LOCKED, USED, MISSING, CONFLICT }
    public record View(String email, String requestCode, long expiresInSeconds, long resendInSeconds, boolean completed) {}
    private static final Map<String, String> PUBLIC_ROLES = Map.of("learner", "LEARNER", "tutor", "TUTOR");
    private final PendingRegistrationRepository pending;
    private final UserAccountRepository accounts;
    private final PasswordEncoder encoder;
    private final OtpMailSender mail;
    private final Clock clock;
    private final OtpProperties properties;
    private final SecureRandom random = new SecureRandom();

    public EmailVerificationService(PendingRegistrationRepository pending, UserAccountRepository accounts,
                                    PasswordEncoder encoder, OtpMailSender mail, Clock clock, OtpProperties properties) {
        this.pending = pending; this.accounts = accounts; this.encoder = encoder;
        this.mail = mail; this.clock = clock; this.properties = properties;
    }

    @Transactional
    public String start(RegistrationForm form) {
        String role = PUBLIC_ROLES.get(form.getRole());
        if (role == null) throw new IllegalArgumentException("Vai trò đăng ký không hợp lệ.");
        Pending previous = pending.lockEmail(form.getEmail());
        var existing = accounts.findByEmail(form.getEmail());
        if (existing.filter(UserAccount::emailVerified).isPresent()) throw new DuplicateKeyException("Email đã được sử dụng.");
        if (existing.isPresent() && (!"ACTIVE".equals(existing.get().status())
                || !encoder.matches(form.getPassword(), existing.get().passwordHash()))) {
            throw new OtpException("Email này đã có tài khoản chờ xác minh. Hãy nhập đúng mật khẩu đăng ký ban đầu để tiếp tục.");
        }
        return issue(previous, form.getName(), form.getPhone(), role, encoder.encode(form.getPassword()),
                existing.map(UserAccount::id).orElse(null));
    }

    @Transactional
    public String resend(String challenge) {
        Pending value = pending.findChallenge(challenge, true)
                .orElseThrow(() -> new OtpException("Lượt đăng ký không còn hiệu lực. Vui lòng đăng ký lại."));
        if (value.completedAt() != null) throw new OtpException("Email đã được xác minh. Vui lòng đăng nhập.");
        return issue(value, value.name(), value.phone(), value.role(), value.passwordHash(), value.existingUserId());
    }

    private String issue(Pending previous, String name, String phone, String role, String hash, Long existingUserId) {
        Instant now = clock.instant();
        if (previous.lastSentAt() != null && now.isBefore(previous.lastSentAt().plus(properties.resendCooldown()))) {
            long remaining = secondsUntil(previous.lastSentAt().plus(properties.resendCooldown()));
            throw new OtpException("Vui lòng chờ " + remaining + " giây trước khi yêu cầu mã mới.");
        }
        boolean sameWindow = previous.windowStartedAt() != null && now.isBefore(previous.windowStartedAt().plus(Duration.ofHours(1)));
        int count = sameWindow ? previous.sendCount() : 0;
        if (count >= properties.maxSendsPerHour()) throw new OtpException("Đã đạt giới hạn gửi mã cho email này. Vui lòng thử lại sau một giờ.");
        String otp;
        do { otp = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000)); }
        while (previous.otpHash() != null && encoder.matches(otp, previous.otpHash()));
        String challenge = UUID.randomUUID().toString();
        pending.issue(new Pending(previous.email(), challenge, hash, name, phone, role, existingUserId,
                encoder.encode(otp), now.plus(properties.ttl()), now, sameWindow ? previous.windowStartedAt() : now,
                count + 1, 0, null));
        // SMTP has bounded timeouts. A send failure rolls back the new challenge and preserves the previous one.
        mail.send(previous.email(), otp, challenge, properties.ttl());
        return challenge;
    }

    @Transactional
    public Result verify(String challenge, String otp) {
        var found = pending.findChallenge(challenge, true);
        if (found.isEmpty()) return Result.MISSING;
        Pending value = found.get();
        if (value.completedAt() != null) return Result.USED;
        if (!clock.instant().isBefore(value.expiresAt())) return Result.EXPIRED;
        if (value.failedAttempts() >= properties.maxAttempts()) return Result.LOCKED;
        if (otp == null || !otp.matches("[0-9]{6}") || !encoder.matches(otp, value.otpHash())) {
            pending.failedAttempt(value.email());
            return value.failedAttempts() + 1 >= properties.maxAttempts() ? Result.LOCKED : Result.INVALID;
        }
        var existing = accounts.findByEmail(value.email());
        if (value.existingUserId() == null) {
            if (existing.isPresent()) return Result.CONFLICT;
            accounts.createVerified(value.email(), value.passwordHash(), value.name(), value.phone(), value.role());
        } else {
            if (existing.isEmpty() || !value.existingUserId().equals(existing.get().id())
                    || !"ACTIVE".equals(existing.get().status())) return Result.CONFLICT;
            if (accounts.markEmailVerified(value.existingUserId()) != 1) {
                throw new org.springframework.dao.OptimisticLockingFailureException("Tài khoản đã thay đổi; lượt xác minh chưa được hoàn tất.");
            }
        }
        pending.complete(value.email(), clock.instant());
        return Result.SUCCESS;
    }

    @Transactional(readOnly = true)
    public View view(String challenge) {
        if (challenge == null) return null;
        return pending.findChallenge(challenge, false).map(value -> new View(mask(value.email()),
                value.challenge().substring(0, 8), secondsUntil(value.expiresAt()),
                secondsUntil(value.lastSentAt().plus(properties.resendCooldown())),
                value.completedAt() != null)).orElse(null);
    }

    private String mask(String email) {
        int at = email.indexOf('@');
        return email.substring(0, Math.min(2, at)) + "***" + email.substring(at);
    }

    private long secondsUntil(Instant deadline) {
        long millis = Duration.between(clock.instant(), deadline).toMillis();
        return millis <= 0 ? 0 : (millis + 999) / 1000;
    }
}
