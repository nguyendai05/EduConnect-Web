package com.educonnect.auth;

import com.educonnect.user.UserAccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.MailSendException;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static com.educonnect.auth.PasswordResetService.State.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Uses real shared JPA mappings + JDBC auth on MySQL; fixtures have unique emails, never seed accounts. */
@SpringBootTest
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_MYSQL_TESTS", matches = "true")
@Transactional
class MySqlPasswordResetTest {
    @Autowired PasswordResetService resets;
    @Autowired UserAccountRepository accounts;
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager entityManager;
    @Autowired PasswordEncoder encoder;
    @Autowired MockMvc mvc;
    @Autowired PlatformTransactionManager transactionManager;
    @MockitoBean PasswordResetMailSender mail;
    @MockitoBean OtpMailSender otpMail;
    @MockitoBean Clock clock;
    final AtomicReference<String> delivered = new AtomicReference<>();
    Instant now;

    @BeforeEach void setup() {
        now = Instant.parse("2026-10-23T06:00:00Z");
        when(clock.instant()).thenAnswer(invocation -> now);
        doAnswer(invocation -> { delivered.set(invocation.getArgument(1)); return null; })
                .when(mail).send(anyString(), anyString(), any(Duration.class));
    }

    @Test void hashedSingleUseTokenChangesRealLoginAndRevokesExistingSessions() throws Exception {
        String email = account();
        var login = mvc.perform(post("/auth/login").with(csrf()).param("email", email).param("password", "Original!123"))
                .andExpect(authenticated().withRoles("LEARNER")).andReturn();
        var oldSession = (MockHttpSession) login.getRequest().getSession(false);
        resets.request(email);
        String token = secret();
        assertTrue(token.matches("[A-Za-z0-9_-]{43}"));
        byte[] hash = jdbc.queryForObject("SELECT token_hash FROM auth_tokens WHERE user_id = ?", byte[].class, id(email));
        assertEquals(32, hash.length);
        assertEquals(VALID, resets.state(token));
        assertEquals(VALID, resets.state(token)); // Opening a mail link must not consume it.
        mvc.perform(post("/auth/reset-password").with(csrf()).param("token", token)
                        .param("password", "Replacement!123").param("confirmPassword", "Replacement!123"))
                .andExpect(redirectedUrl("/auth/login?reset"));
        assertEquals(USED, resets.state(token));
        assertEquals(USED, resets.reset(form(token)));
        var user = accounts.findByEmail(email).orElseThrow();
        assertEquals(1, user.authenticationVersion());
        assertTrue(encoder.matches("Replacement!123", user.passwordHash()));
        assertFalse(encoder.matches("Original!123", user.passwordHash()));
        assertEquals(1L, jdbc.queryForObject("SELECT version FROM user_accounts WHERE email = ?", Long.class, email));
        mvc.perform(get("/account/profile").session(oldSession)).andExpect(redirectedUrl("/auth/login?expired"));
        assertTrue(oldSession.isInvalid());
        mvc.perform(post("/auth/login").with(csrf()).param("email", email).param("password", "Original!123"))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?error"));
        mvc.perform(post("/auth/login").with(csrf()).param("email", email).param("password", "Replacement!123"))
                .andExpect(authenticated().withRoles("LEARNER"));
    }

    @Test void unknownLockedAndUnverifiedAccountsDoNotReceiveMail() {
        resets.request("missing-" + UUID.randomUUID() + "@example.test");
        String email = account();
        jdbc.update("UPDATE user_accounts SET status = 'LOCKED' WHERE email = ?", email);
        resets.request(email);
        jdbc.update("UPDATE user_accounts SET status = 'ACTIVE', email_verified_at = NULL WHERE email = ?", email);
        entityManager.clear();
        resets.request(email);
        verifyNoInteractions(mail);
        assertEquals(0, tokens(email));
    }

    @Test void expiryReissueAndWrongPurposeAreRejected() {
        String email = account();
        resets.request(email);
        String first = secret();
        now = now.plus(Duration.ofMinutes(30));
        assertEquals(EXPIRED, resets.state(first));
        assertEquals(EXPIRED, resets.reset(form(first)));
        resets.request(email);
        String replacement = secret();
        assertNotEquals(first, replacement);
        assertEquals(INVALID, resets.state(first));
        assertEquals(VALID, resets.state(replacement));
        entityManager.flush();
        jdbc.update("UPDATE auth_tokens SET purpose = 'VERIFY_EMAIL' WHERE user_id = ?", id(email));
        entityManager.clear();
        assertEquals(INVALID, resets.state(replacement));
        assertEquals(INVALID, resets.reset(form(replacement)));
        assertEquals(MISSING, resets.state(null));
        assertEquals(INVALID, resets.state("invalid"));
        assertEquals(INVALID, resets.state("z".repeat(43)));
        assertTrue(encoder.matches("Original!123", accounts.findByEmail(email).orElseThrow().passwordHash()));
    }

    @Test void cooldownAndHourlyLimitApplyToReissues() {
        String email = account();
        resets.request(email);
        String first = secret();
        resets.request(email);
        assertEquals(first, secret());
        assertEquals(1, tokens(email));
        for (int i = 0; i < 6; i++) {
            now = now.plusSeconds(61);
            resets.request(email);
        }
        verify(mail, times(5)).send(eq(email), anyString(), eq(Duration.ofMinutes(30)));
        assertEquals(5, tokens(email));
        assertEquals(VALID, resets.state(secret()));
    }

    @Test void lockedAccountAndInvalidPasswordCannotConsumeToken() {
        String email = account();
        resets.request(email);
        String token = secret();
        var invalid = form(token);
        invalid.setPassword("đ".repeat(40));
        invalid.setConfirmPassword(invalid.getPassword());
        assertThrows(ConstraintViolationException.class, () -> resets.reset(invalid));
        assertEquals(VALID, resets.state(token));
        entityManager.flush();
        jdbc.update("UPDATE user_accounts SET status = 'LOCKED' WHERE email = ?", email);
        entityManager.clear();
        assertEquals(INVALID, resets.reset(form(token)));
        assertEquals(INVALID, resets.state(token));
        assertNull(jdbc.queryForObject("SELECT used_at FROM auth_tokens WHERE user_id = ?", java.sql.Timestamp.class, id(email)));
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void failedSmtpRollsBackNewTokenAndKeepsPreviouslyDeliveredLinkUsable() {
        String email = new TransactionTemplate(transactionManager).execute(status -> account());
        try {
            resets.request(email);
            String first = secret();
            now = now.plusSeconds(61);
            doThrow(new MailSendException("offline")).when(mail).send(anyString(), anyString(), any());
            assertThrows(MailSendException.class, () -> resets.request(email));
            assertEquals(1, tokens(email));
            assertEquals(VALID, resets.state(first));
        } finally { deleteOwnFixture(email); }
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentResetHasExactlyOneWinner() throws Exception {
        String email = new TransactionTemplate(transactionManager).execute(status -> account());
        var workers = Executors.newFixedThreadPool(2);
        try {
            resets.request(email);
            String token = secret();
            var ready = new CountDownLatch(2);
            var start = new CountDownLatch(1);
            java.util.concurrent.Callable<PasswordResetService.State> action = () -> {
                ready.countDown();
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return resets.reset(form(token));
            };
            var one = workers.submit(action);
            var two = workers.submit(action);
            assertTrue(ready.await(10, TimeUnit.SECONDS));
            start.countDown();
            var results = java.util.List.of(one.get(15, TimeUnit.SECONDS), two.get(15, TimeUnit.SECONDS));
            assertEquals(1, results.stream().filter(s -> s == VALID).count());
            assertEquals(1, results.stream().filter(s -> s == USED).count());
            assertEquals(1L, accounts.findByEmail(email).orElseThrow().authenticationVersion());
        } finally {
            workers.shutdownNow();
            assertTrue(workers.awaitTermination(10, TimeUnit.SECONDS));
            deleteOwnFixture(email);
        }
    }

    private String account() {
        String email = "reset-test-" + UUID.randomUUID() + "@example.test";
        accounts.createVerified(email, encoder.encode("Original!123"), "Tài khoản kiểm thử reset", "0912345678", "LEARNER");
        return email;
    }
    private long id(String email) { return accounts.findByEmail(email).orElseThrow().id(); }
    private int tokens(String email) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM auth_tokens WHERE user_id = ?", Integer.class, id(email));
    }
    private String secret() { return delivered.get().substring(delivered.get().lastIndexOf('=') + 1); }
    private ResetPasswordForm form(String token) {
        var form = new ResetPasswordForm();
        form.setToken(token); form.setPassword("Replacement!123"); form.setConfirmPassword("Replacement!123");
        return form;
    }
    private void deleteOwnFixture(String email) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            long id = id(email);
            jdbc.update("DELETE FROM auth_tokens WHERE user_id = ?", id);
            jdbc.update("DELETE FROM learner_profiles WHERE user_id = ?", id);
            jdbc.update("DELETE FROM user_roles WHERE user_id = ?", id);
            jdbc.update("DELETE FROM user_accounts WHERE id = ? AND email = ?", id, email);
        });
    }
}
