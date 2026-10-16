package com.educonnect.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

/** Opt-in real MySQL tests; every created record is rolled back, existing accounts are untouched. */
@SpringBootTest
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_MYSQL_TESTS", matches = "true")
@Transactional
class MySqlAuthTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder encoder;
    @MockitoBean OtpMailSender mail;
    final AtomicReference<String> otp = new AtomicReference<>();

    @BeforeEach void captureMail() {
        doAnswer(invocation -> { otp.set(invocation.getArgument(1)); return null; })
                .when(mail).send(anyString(), anyString(), anyString(), any(Duration.class));
    }

    private void registerAndVerify(String email, String name, String role) throws Exception {
        var pending = mvc.perform(post("/auth/register").with(csrf()).param("name", name)
                        .param("email", email).param("phone", "0912345678").param("role", role)
                        .param("password", "MySqlTest!123").param("confirmPassword", "MySqlTest!123"))
                .andExpect(redirectedUrl("/auth/verify-email")).andReturn();
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE email = ?", Integer.class, email));
        mvc.perform(post("/auth/verify-email").with(csrf()).param("otp", otp.get())
                        .session((MockHttpSession) pending.getRequest().getSession(false)))
                .andExpect(redirectedUrl("/auth/login?verified"));
    }

    @Test void registerLearnerThenLoginReadCurrentUserAndLogout() throws Exception {
        String email = "auth-test-" + UUID.randomUUID() + "@example.test";
        registerAndVerify(email, "Học viên kiểm thử", "learner");
        var account = jdbc.queryForMap("SELECT * FROM user_accounts WHERE email = ?", email);
        assertTrue(encoder.matches("MySqlTest!123", (String) account.get("password_hash")));
        assertNotNull(account.get("email_verified_at"));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM learner_profiles WHERE user_id = ?", Integer.class, account.get("id")));
        var login = mvc.perform(post("/auth/login").with(csrf()).param("email", email).param("password", "MySqlTest!123"))
                .andExpect(authenticated().withRoles("LEARNER")).andExpect(redirectedUrl("/home")).andReturn();
        var session = (MockHttpSession) login.getRequest().getSession(false);
        mvc.perform(get("/home").session(session)).andExpect(status().isOk())
                .andExpect(content().string(containsString("Học viên kiểm thử")))
                .andExpect(content().string(containsString("action=\"/auth/logout\"")));
        mvc.perform(get("/admin/dashboard").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/auth/logout").session(session).with(csrf()))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?logout"));
        assertTrue(session.isInvalid());
    }

    @Test void tutorStartsAsDraftAndRoleFromDatabaseControlsRedirect() throws Exception {
        String email = "auth-test-" + UUID.randomUUID() + "@example.test";
        registerAndVerify(email, "Gia sư kiểm thử", "tutor");
        assertEquals("DRAFT", jdbc.queryForObject("""
                SELECT tp.review_status FROM tutor_profiles tp JOIN user_accounts u ON u.id = tp.user_id WHERE u.email = ?
                """, String.class, email));
        mvc.perform(post("/auth/login").with(csrf()).param("email", email).param("password", "MySqlTest!123").param("role", "ADMIN"))
                .andExpect(authenticated().withRoles("TUTOR")).andExpect(redirectedUrl("/tutor/manage"));
    }
}
