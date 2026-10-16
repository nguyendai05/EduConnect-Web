package com.educonnect.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.MailSendException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.educonnect.user.UserAccountRepository;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@SpringBootTest
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_MYSQL_TESTS", matches = "true")
@Transactional
class MySqlOtpTest {
    @Autowired RegistrationService registration;
    @Autowired EmailVerificationService verification;
    @Autowired JdbcTemplate jdbc;
    @org.springframework.test.context.bean.override.mockito.MockitoSpyBean UserAccountRepository users;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactionManager;
    @Autowired PasswordEncoder encoder;
    @MockitoBean OtpMailSender mail;
    @MockitoBean Clock clock;
    final AtomicReference<String> delivered = new AtomicReference<>();
    Instant now;
    String email;

    @BeforeEach void setup() {
        now = Instant.parse("2026-10-16T06:00:00Z");
        when(clock.instant()).thenAnswer(invocation -> now);
        email = "otp-test-" + UUID.randomUUID() + "@example.test";
        doAnswer(invocation -> { delivered.set(invocation.getArgument(1)); return null; })
                .when(mail).send(anyString(), anyString(), anyString(), any(Duration.class));
    }

    @Test void accountIsCreatedOnlyAfterSingleUseOtpSucceeds() {
        String challenge = registration.register(form());
        assertEquals(0, accounts());
        assertTrue(delivered.get().matches("[0-9]{6}"));
        String stored = jdbc.queryForObject("SELECT otp_hash FROM pending_registrations WHERE email = ?", String.class, email);
        assertNotEquals(delivered.get(), stored);
        assertEquals(EmailVerificationService.Result.SUCCESS, verification.verify(challenge, delivered.get()));
        assertEquals(1, accounts());
        assertNotNull(jdbc.queryForObject("SELECT email_verified_at FROM user_accounts WHERE email = ?", java.sql.Timestamp.class, email));
        assertEquals(EmailVerificationService.Result.USED, verification.verify(challenge, delivered.get()));
        assertNull(jdbc.queryForObject("SELECT password_hash FROM pending_registrations WHERE email = ?", String.class, email));
    }

    @Test void abandonedRegistrationCanRestartWithSameEmailAndOldChallengeIsInvalid() {
        String first = registration.register(form());
        String firstOtp = delivered.get();
        now = now.plus(Duration.ofDays(1));
        RegistrationForm replacement = form();
        replacement.setPassword("Replacement!123");
        replacement.setConfirmPassword("Replacement!123");
        String second = registration.register(replacement);
        assertNotEquals(first, second);
        assertEquals(EmailVerificationService.Result.MISSING, verification.verify(first, firstOtp));
        assertEquals(EmailVerificationService.Result.SUCCESS, verification.verify(second, delivered.get()));
        assertEquals(1, accounts());
        String hash = jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE email = ?", String.class, email);
        assertTrue(encoder.matches("Replacement!123", hash));
        assertFalse(encoder.matches("OtpPassword!123", hash));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM pending_registrations WHERE email = ?", Integer.class, email));
    }

    @Test void expiredCodeIsRejectedAndResendProducesAWorkingChallenge() {
        String challenge = registration.register(form());
        now = now.plusSeconds(600);
        assertEquals(EmailVerificationService.Result.EXPIRED, verification.verify(challenge, delivered.get()));
        String renewed = verification.resend(challenge);
        assertNotEquals(challenge, renewed);
        assertEquals(EmailVerificationService.Result.SUCCESS, verification.verify(renewed, delivered.get()));
    }

    @Test void countdownRoundsUpSoResendDoesNotEnableBeforeTheServerCooldownEnds() {
        String challenge = registration.register(form());
        now = now.plusMillis(59_001);
        assertEquals(1, verification.view(challenge).resendInSeconds());
        now = now.plusMillis(999);
        assertEquals(0, verification.view(challenge).resendInSeconds());
    }

    @Test void resendAndReregistrationCannotBypassCooldownOrHourlyLimit() {
        String challenge = registration.register(form());
        final String original = challenge;
        assertThrows(OtpException.class, () -> verification.resend(original));
        assertThrows(OtpException.class, () -> registration.register(form()));
        for (int i = 0; i < 4; i++) {
            now = now.plusSeconds(61);
            challenge = verification.resend(challenge);
        }
        now = now.plusSeconds(61);
        final String limited = challenge;
        assertThrows(OtpException.class, () -> verification.resend(limited));
        assertThrows(OtpException.class, () -> registration.register(form()));
        verify(mail, times(5)).send(anyString(), anyString(), anyString(), any(Duration.class));
    }

    @Test void fiveWrongGuessesBlockTheCorrectCodeUntilAnotherOtpIsRequested() {
        String challenge = registration.register(form());
        String wrong = delivered.get().equals("000000") ? "111111" : "000000";
        for (int i = 0; i < 4; i++) assertEquals(EmailVerificationService.Result.INVALID, verification.verify(challenge, wrong));
        assertEquals(EmailVerificationService.Result.LOCKED, verification.verify(challenge, wrong));
        assertEquals(EmailVerificationService.Result.LOCKED, verification.verify(challenge, delivered.get()));
        assertEquals(0, accounts());
    }

    @Test void verifiedEmailCannotBeRegisteredAgainOrHaveItsPasswordReplaced() {
        String challenge = registration.register(form());
        verification.verify(challenge, delivered.get());
        now = now.plusSeconds(61);
        assertThrows(org.springframework.dao.DuplicateKeyException.class, () -> registration.register(form()));
        assertEquals(1, accounts());
    }

    @Test void existingUnverifiedAccountRequiresOriginalPasswordAndKeepsItsProfileAndRoles() {
        users.createVerified(email, encoder.encode("OtpPassword!123"), "Tên ban đầu", "0912345678", "LEARNER");
        jdbc.update("UPDATE user_accounts SET email_verified_at = NULL WHERE email = ?", email);
        String originalHash = jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE email = ?", String.class, email);
        var incorrect = form();
        incorrect.setPassword("AnotherPassword!123"); incorrect.setConfirmPassword("AnotherPassword!123");
        assertThrows(OtpException.class, () -> registration.register(incorrect));
        var resume = form(); resume.setRole("tutor"); resume.setName("Tên thay thế");
        String challenge = registration.register(resume);
        assertEquals(EmailVerificationService.Result.SUCCESS, verification.verify(challenge, delivered.get()));
        assertEquals(originalHash, jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE email = ?", String.class, email));
        assertEquals("Tên ban đầu", jdbc.queryForObject("SELECT display_name FROM user_accounts WHERE email = ?", String.class, email));
        assertEquals("LEARNER", jdbc.queryForObject("SELECT role_code FROM user_roles WHERE user_id = (SELECT id FROM user_accounts WHERE email = ?)", String.class, email));
        assertEquals(1, accounts());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void smtpFailureRollsBackInitialRequestAndKeepsPreviousChallengeOnResend() {
        try {
            doThrow(new MailSendException("SMTP unavailable")).when(mail).send(anyString(), anyString(), anyString(), any(Duration.class));
            assertThrows(MailSendException.class, () -> registration.register(form()));
            assertEquals(0, accounts());
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM pending_registrations WHERE email = ?", Integer.class, email));
            doAnswer(invocation -> { delivered.set(invocation.getArgument(1)); return null; })
                    .when(mail).send(anyString(), anyString(), anyString(), any(Duration.class));
            String first = registration.register(form());
            now = now.plusSeconds(61);
            doThrow(new MailSendException("SMTP unavailable")).when(mail).send(anyString(), anyString(), anyString(), any(Duration.class));
            assertThrows(MailSendException.class, () -> verification.resend(first));
            assertEquals(first, jdbc.queryForObject("SELECT challenge_id FROM pending_registrations WHERE email = ?", String.class, email));
            assertEquals(1, jdbc.queryForObject("SELECT send_count FROM pending_registrations WHERE email = ?", Integer.class, email));
            assertEquals(0, accounts());
        } finally {
            jdbc.update("DELETE FROM pending_registrations WHERE email = ?", email);
        }
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void conflictingVerificationRollsBackWritesAndDoesNotConsumeChallenge() {
        var tx = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        try {
            tx.executeWithoutResult(status -> {
                users.createVerified(email, encoder.encode("OtpPassword!123"), "Tên ban đầu", "0912345678", "LEARNER");
                jdbc.update("UPDATE user_accounts SET email_verified_at=NULL, version=version+1 WHERE email=?", email);
            });
            Long id = jdbc.queryForObject("SELECT id FROM user_accounts WHERE email=?", Long.class, email);
            String challenge = registration.register(form());
            doAnswer(invocation -> {
                // A partial write must be rolled back when the required verification CAS fails.
                jdbc.update("UPDATE user_accounts SET display_name='Partial write', version=version+1 WHERE id=?", id);
                return 0;
            }).when(users).markEmailVerified(id);
            assertThrows(org.springframework.dao.OptimisticLockingFailureException.class,
                    () -> verification.verify(challenge, delivered.get()));
            assertEquals("Tên ban đầu", jdbc.queryForObject("SELECT display_name FROM user_accounts WHERE id=?", String.class, id));
            assertNull(jdbc.queryForObject("SELECT completed_at FROM pending_registrations WHERE email=?", java.sql.Timestamp.class, email));
            assertNotNull(jdbc.queryForObject("SELECT otp_hash FROM pending_registrations WHERE email=?", String.class, email));
            assertNull(jdbc.queryForObject("SELECT email_verified_at FROM user_accounts WHERE id=?", java.sql.Timestamp.class, id));
        } finally {
            tx.executeWithoutResult(status -> {
                jdbc.update("DELETE FROM pending_registrations WHERE email=?", email);
                jdbc.update("DELETE FROM learner_profiles WHERE user_id IN (SELECT id FROM user_accounts WHERE email=?)", email);
                jdbc.update("DELETE FROM user_roles WHERE user_id IN (SELECT id FROM user_accounts WHERE email=?)", email);
                jdbc.update("DELETE FROM user_accounts WHERE email=?", email);
            });
        }
    }
    private int accounts() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE email = ?", Integer.class, email);
    }

    private RegistrationForm form() {
        var form = new RegistrationForm();
        form.setName("Người dùng OTP"); form.setEmail(email); form.setPhone("0912345678");
        form.setPassword("OtpPassword!123"); form.setConfirmPassword("OtpPassword!123"); form.setRole("learner");
        return form;
    }
}
