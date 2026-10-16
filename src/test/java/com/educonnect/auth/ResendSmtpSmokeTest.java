package com.educonnect.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Explicit opt-in: sends one real OTP email, then rolls back every database change. */
@SpringBootTest
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_RESEND_SMOKE", matches = "true")
@Transactional
class ResendSmtpSmokeTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @MockitoSpyBean OtpMailSender mail;

    @Test void actualResendSmtpAndRegistrationVerificationLoginLogout() throws Exception {
        String recipient = System.getenv("EDUCONNECT_SMTP_TEST_RECIPIENT");
        assertNotNull(recipient, "Set EDUCONNECT_SMTP_TEST_RECIPIENT to an explicitly authorized recipient.");
        recipient = recipient.strip().toLowerCase(java.util.Locale.ROOT);
        assertTrue(recipient.matches("[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"), "Invalid test recipient.");
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE email = ?", Integer.class, recipient),
                "Recipient already has an account; no existing account will be modified.");
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM pending_registrations WHERE email = ?", Integer.class, recipient),
                "Recipient already has a pending registration; no existing registration will be modified.");

        var otp = new AtomicReference<String>();
        doAnswer(invocation -> {
            otp.set(invocation.getArgument(1));
            try {
                Object result = invocation.callRealMethod();
                System.out.println("RESEND_SMOKE: real SMTP send accepted; OTP omitted from output.");
                return result;
            } catch (RuntimeException error) {
                String message = String.valueOf(error.getMessage());
                String key = System.getenv("EDUCONNECT_MAIL_PASSWORD");
                if (key != null && !key.isEmpty()) message = message.replace(key, "[REDACTED]");
                if (otp.get() != null) message = message.replace(otp.get(), "[OTP REDACTED]");
                System.out.println("RESEND_SMOKE: send failed: " + message);
                throw error;
            }
        }).when(mail).send(eq(recipient), anyString(), anyString(), any(Duration.class));

        String password = "Smoke!" + UUID.randomUUID();
        var registration = mvc.perform(post("/auth/register").with(csrf()).param("name", "Kiểm thử Resend")
                        .param("email", recipient).param("phone", "0912345678").param("role", "learner")
                        .param("password", password).param("confirmPassword", password))
                .andExpect(redirectedUrl("/auth/verify-email")).andReturn();
        assertNotNull(otp.get(), "OTP must be generated before sending.");
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE email = ?", Integer.class, recipient));
        var session = (MockHttpSession) registration.getRequest().getSession(false);
        mvc.perform(post("/auth/verify-email").with(csrf()).session(session).param("otp", otp.get()))
                .andExpect(redirectedUrl("/auth/login?verified"));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE email = ? AND email_verified_at IS NOT NULL", Integer.class, recipient));
        var login = mvc.perform(post("/auth/login").with(csrf()).session(session)
                        .param("email", recipient).param("password", password))
                .andExpect(authenticated().withUsername(recipient)).andExpect(redirectedUrl("/home")).andReturn();
        mvc.perform(post("/auth/logout").with(csrf()).session((MockHttpSession) login.getRequest().getSession(false)))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?logout"));
        System.out.println("RESEND_SMOKE: registration -> real SMTP -> OTP verification -> login -> logout passed; database will roll back.");
    }
}
