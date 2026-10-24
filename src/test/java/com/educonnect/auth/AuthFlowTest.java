package com.educonnect.auth;

import com.educonnect.auth.web.AuthPageController;
import com.educonnect.auth.web.RegistrationController;
import com.educonnect.auth.web.EmailVerificationController;
import com.educonnect.security.DatabaseSecurityConfig;
import com.educonnect.security.AccountUserDetailsService;
import com.educonnect.security.SessionAccountFilter;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import com.educonnect.web.HomePageController;
import com.educonnect.web.PageModelAdvice;
import com.educonnect.job.web.JobPageController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;

import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest({AuthPageController.class, RegistrationController.class, EmailVerificationController.class,
        HomePageController.class, JobPageController.class})
@ActiveProfiles("db-dev")
@Import({DatabaseSecurityConfig.class, AccountUserDetailsService.class, RegistrationService.class})
class AuthFlowTest {
    @Autowired MockMvc mvc;
    @Autowired PasswordEncoder encoder;
    @MockitoBean UserAccountRepository accounts;
    @MockitoBean EmailVerificationService verification;
    UserAccount learner;

    @BeforeEach void account() {
        learner = new UserAccount(1L, "learner@example.test", encoder.encode("Password!123"),
                "Nguyễn Văn An", "ACTIVE", true, 0L, Set.of("LEARNER"));
        when(accounts.findByEmail("learner@example.test")).thenReturn(Optional.of(learner));
        when(accounts.findById(1L)).thenReturn(Optional.of(learner));
        when(verification.start(any(RegistrationForm.class))).thenReturn("00000000-0000-4000-8000-000000000001");
    }

    @Test void realFormsRenderWithoutFixturesAndRespectContextPath() throws Exception {
        mvc.perform(get("/edu/auth/register").contextPath("/edu"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("action=\"/edu/auth/register\"")))
                .andExpect(content().string(containsString("name=\"_csrf\"")))
                .andExpect(content().string(not(containsString("/js/preview/"))));
        mvc.perform(get("/auth/login")).andExpect(status().isOk())
                .andExpect(content().string(containsString("type=\"submit\"")));
    }

    @Test void correctPasswordCreatesSessionAndCurrentUser() throws Exception {
        var result = mvc.perform(post("/auth/login").with(csrf())
                        .param("email", "  LEARNER@example.test ").param("password", "Password!123"))
                .andExpect(authenticated().withUsername("learner@example.test"))
                .andExpect(redirectedUrl("/home")).andReturn();
        mvc.perform(get("/auth/login").session((MockHttpSession) result.getRequest().getSession(false)))
                .andExpect(redirectedUrl("/home"));
    }

    @Test void wrongPasswordAndLockedOrDisabledAccountsCannotLogin() throws Exception {
        mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email()).param("password", "wrong"))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?error"));
        for (String status : Set.of("LOCKED", "DISABLED")) {
            when(accounts.findByEmail(learner.email())).thenReturn(Optional.of(new UserAccount(
                    1L, learner.email(), learner.passwordHash(), learner.displayName(), status, true, 0L, learner.roles())));
            mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email()).param("password", "Password!123"))
                    .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?error"));
        }
    }

    @Test void privatePagesRequireAuthenticationAndRoles() throws Exception {
        mvc.perform(get("/account/profile")).andExpect(redirectedUrl("http://localhost/auth/login"));
        mvc.perform(get("/admin/dashboard").with(user("learner").roles("LEARNER"))).andExpect(status().isForbidden());
        mvc.perform(get("/tutor/manage").with(user("learner").roles("LEARNER"))).andExpect(status().isForbidden());
        mvc.perform(get("/job/applicants").with(user("learner").roles("LEARNER"))).andExpect(status().isOk());
        mvc.perform(get("/job/applicants").with(user("tutor").roles("TUTOR"))).andExpect(status().isForbidden());
    }

    @Test void a01ExposesOnlyTheFourAgreedCurrentUserFieldsAndNullForGuest() throws Exception {
        mvc.perform(get("/home")).andExpect(status().isOk()).andExpect(model().attributeDoesNotExist("currentUser"));
        var login = mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email())
                .param("password", "Password!123")).andReturn();
        mvc.perform(get("/home").session((MockHttpSession) login.getRequest().getSession(false)))
                .andExpect(status().isOk()).andExpect(model().attribute("currentUser",
                        new PageModelAdvice.CurrentUser(learner.id(), learner.email(), learner.displayName(), "/home")));
        org.junit.jupiter.api.Assertions.assertEquals(Set.of("id", "email", "displayName", "homeUrl"),
                java.util.Arrays.stream(PageModelAdvice.CurrentUser.class.getRecordComponents())
                        .map(java.lang.reflect.RecordComponent::getName).collect(java.util.stream.Collectors.toSet()));
    }

    @Test void registrationStartsEmailVerificationWithoutCreatingAnAccount() throws Exception {
        mvc.perform(registration().param("role", "tutor"))
                .andExpect(redirectedUrl("/auth/verify-email"));
        verify(verification).start(argThat(form -> form.getEmail().equals("new@example.test")
                && form.getName().equals("Nguyễn Văn Mới") && form.getPhone().equals("0912345678")
                && form.getRole().equals("tutor")));
        verify(accounts, never()).createVerified(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test void rejectsInvalidDataAndPrivilegeEscalation() throws Exception {
        mvc.perform(registration().param("role", "admin"))
                .andExpect(status().isOk()).andExpect(model().attributeHasFieldErrors("registrationForm", "role"));
        mvc.perform(post("/auth/register").with(csrf()).param("email", "bad")
                        .param("password", "short").param("confirmPassword", "different"))
                .andExpect(status().isOk()).andExpect(model().attributeHasErrors("registrationForm"))
                .andExpect(content().string(not(containsString("value=\"short\""))));
        verify(accounts, never()).createVerified(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test void duplicateEmailAndMailFailureShowErrors() throws Exception {
        doThrow(new DuplicateKeyException("duplicate")).when(verification).start(any(RegistrationForm.class));
        mvc.perform(registration().param("role", "learner")).andExpect(status().isOk())
                .andExpect(model().attributeHasFieldErrors("registrationForm", "email"));
        doThrow(new org.springframework.mail.MailSendException("SMTP unavailable")).when(verification).start(any(RegistrationForm.class));
        mvc.perform(registration().param("role", "learner")).andExpect(status().isOk())
                .andExpect(model().attributeHasErrors("registrationForm"))
                .andExpect(content().string(containsString("Chưa gửi được mã xác minh")));
    }

    @Test void unverifiedAccountCannotLogin() throws Exception {
        when(accounts.findByEmail(learner.email())).thenReturn(Optional.of(new UserAccount(1L, learner.email(),
                learner.passwordHash(), learner.displayName(), "ACTIVE", false, 0L, learner.roles())));
        mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email()).param("password", "Password!123"))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?error"));
    }

    @Test void otpCannotBeVerifiedWithoutItsBrowserSession() throws Exception {
        mvc.perform(post("/auth/verify-email").with(csrf()).param("otp", "123456").param("challenge", "another-browser"))
                .andExpect(redirectedUrl("/auth/register"));
        verify(verification, never()).verify(anyString(), anyString());
    }

    @Test void csrfRequiredForLoginRegistrationAndLogout() throws Exception {
        for (String path : Set.of("/auth/login", "/auth/register", "/auth/logout", "/auth/verify-email", "/auth/verify-email/resend")) {
            mvc.perform(post(path)).andExpect(status().isForbidden());
            mvc.perform(post(path).with(csrf().useInvalidToken())).andExpect(status().isForbidden());
        }
    }

    @Test void oversizedLoginPasswordFailsWithoutServerError() throws Exception {
        mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email())
                        .param("password", "x".repeat(1000)))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?error"));
    }

    @Test void registrationRejectsPasswordThatExceedsBcryptUtf8Limit() throws Exception {
        String password = "đ".repeat(40);
        mvc.perform(post("/auth/register").with(csrf()).param("name", "Nguyễn Văn Mới")
                        .param("email", "new@example.test").param("phone", "0912345678").param("role", "learner")
                        .param("password", password).param("confirmPassword", password))
                .andExpect(status().isOk()).andExpect(model().attributeHasErrors("registrationForm"));
        verify(accounts, never()).createVerified(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test void logoutInvalidatesSessionAndChangedAuthenticationVersionRevokesIt() throws Exception {
        var result = mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email())
                .param("password", "Password!123")).andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        mvc.perform(post("/auth/logout").session(session).with(csrf()))
                .andExpect(unauthenticated()).andExpect(redirectedUrl("/auth/login?logout"));
        var next = mvc.perform(post("/auth/login").with(csrf()).param("email", learner.email())
                .param("password", "Password!123")).andReturn();
        when(accounts.findById(1L)).thenReturn(Optional.of(new UserAccount(1L, learner.email(),
                learner.passwordHash(), learner.displayName(), "ACTIVE", true, 1L, learner.roles())));
        mvc.perform(get("/account/profile").session((MockHttpSession) next.getRequest().getSession(false)))
                .andExpect(redirectedUrl("/auth/login?expired"));
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder registration() {
        return post("/auth/register").with(csrf()).param("name", " Nguyễn Văn Mới ")
                .param("email", " NEW@example.test ").param("phone", "0912 345 678")
                .param("password", "Password!123").param("confirmPassword", "Password!123");
    }
}
