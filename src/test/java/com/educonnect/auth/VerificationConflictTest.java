package com.educonnect.auth;

import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VerificationConflictTest {
    @Test void failedAccountUpdateMustNotConsumeThePendingChallenge() {
        var pending = mock(PendingRegistrationRepository.class);
        var accounts = mock(UserAccountRepository.class);
        var encoder = mock(PasswordEncoder.class);
        Instant now = Instant.parse("2026-10-16T00:00:00Z");
        var value = new PendingRegistrationRepository.Pending("conflict@example.test", "challenge", "hash", "Test", "0900000000",
                "LEARNER", 1L, "otpHash", now.plusSeconds(600), now, now, 1, 0, null);
        when(pending.findChallenge("challenge", true)).thenReturn(Optional.of(value));
        when(encoder.matches("123456", "otpHash")).thenReturn(true);
        when(accounts.findByEmail(value.email())).thenReturn(Optional.of(new UserAccount(1L, value.email(), "hash", "Test", "ACTIVE", false, 0L, Set.of("LEARNER"))));
        // Mockito's default affected-row count is zero: an account changed after the read.
        var service = new EmailVerificationService(pending, accounts, encoder, mock(OtpMailSender.class), Clock.fixed(now, ZoneOffset.UTC),
                new OtpProperties(Duration.ofMinutes(10), Duration.ofSeconds(60), 5, 5));
        assertThrows(org.springframework.dao.OptimisticLockingFailureException.class, () -> service.verify("challenge", "123456"));
        verify(pending, never()).complete(anyString(), any());
    }
}
