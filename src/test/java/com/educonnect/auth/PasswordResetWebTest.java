package com.educonnect.auth;

import com.educonnect.auth.web.AuthPageController;
import com.educonnect.security.AccountUserDetailsService;
import com.educonnect.security.DatabaseSecurityConfig;
import com.educonnect.user.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mail.MailSendException;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthPageController.class)
@ActiveProfiles("db-dev")
@Import({DatabaseSecurityConfig.class, AccountUserDetailsService.class})
class PasswordResetWebTest {
    private static final String TOKEN = "a".repeat(43);
    @Autowired MockMvc mvc;
    @MockitoBean UserAccountRepository accounts;
    @MockitoBean EmailVerificationService verification;
    @MockitoBean PasswordResetService resets;

    @Test void formsUseContextPathCsrfAndNoDemoData() throws Exception {
        mvc.perform(get("/edu/auth/forgot-password").contextPath("/edu"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("action=\"/edu/auth/forgot-password\"")))
                .andExpect(content().string(containsString("name=\"_csrf\"")))
                .andExpect(content().string(not(containsString("fixtures.js"))));
        when(resets.state(TOKEN)).thenReturn(PasswordResetService.State.VALID);
        mvc.perform(get("/edu/auth/reset-password").contextPath("/edu").param("token", TOKEN))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(content().string(containsString("action=\"/edu/auth/reset-password\"")))
                .andExpect(content().string(containsString("name=\"_csrf\"")))
                .andExpect(content().string(containsString("name=\"token\"")))
                .andExpect(content().string(not(containsString("fixtures.js"))));
        verify(resets, never()).reset(any());
    }

    @Test void requestNormalizesEmailAndDoesNotClaimAccountExists() throws Exception {
        mvc.perform(post("/auth/forgot-password").with(csrf()).param("email", " UNKNOWN@Example.Test "))
                .andExpect(status().isOk()).andExpect(model().attribute("resetRequested", true))
                .andExpect(content().string(containsString("Nếu tài khoản đủ điều kiện")));
        verify(resets).request("unknown@example.test");
    }

    @Test void invalidEmailAndMailFailureAreHandledWithoutExposingInternalError() throws Exception {
        mvc.perform(post("/auth/forgot-password").with(csrf()).param("email", "bad"))
                .andExpect(model().attributeHasFieldErrors("forgotPasswordForm", "email"));
        verifyNoInteractions(resets);
        doThrow(new MailSendException("private SMTP detail")).when(resets).request(anyString());
        mvc.perform(post("/auth/forgot-password").with(csrf()).param("email", "user@example.test"))
                .andExpect(status().isOk()).andExpect(model().attributeDoesNotExist("resetRequested"))
                .andExpect(content().string(containsString("Hiện chưa gửi được email")))
                .andExpect(content().string(not(containsString("private SMTP detail"))));
    }

    @Test void nonValidLinksDoNotRenderPasswordInputs() throws Exception {
        for (var state : PasswordResetService.State.values()) {
            if (state == PasswordResetService.State.VALID) continue;
            when(resets.state(TOKEN)).thenReturn(state);
            mvc.perform(get("/auth/reset-password").param("token", TOKEN))
                    .andExpect(status().isOk()).andExpect(model().attribute("resetState", state))
                    .andExpect(content().string(not(containsString("name=\"password\""))));
        }
    }

    @Test void passwordValidationDoesNotEchoOrChangePassword() throws Exception {
        when(resets.state(TOKEN)).thenReturn(PasswordResetService.State.VALID);
        for (String password : new String[]{"short", "đ".repeat(40), "ValidPassword!123"}) {
            mvc.perform(post("/auth/reset-password").with(csrf()).param("token", TOKEN)
                            .param("password", password).param("confirmPassword", "different"))
                    .andExpect(status().isOk()).andExpect(model().attributeHasErrors("resetPasswordForm"))
                    .andExpect(content().string(not(containsString("value=\"" + password + "\""))));
        }
        verify(resets, never()).reset(any());
    }

    @Test void successRedirectsAndInvalidatesTheSubmittingSession() throws Exception {
        when(resets.state(TOKEN)).thenReturn(PasswordResetService.State.VALID);
        when(resets.reset(any())).thenReturn(PasswordResetService.State.VALID);
        var session = new MockHttpSession();
        mvc.perform(post("/auth/reset-password").session(session).with(csrf()).param("token", TOKEN)
                        .param("password", "Replacement!123").param("confirmPassword", "Replacement!123"))
                .andExpect(redirectedUrl("/auth/login?reset"));
        assertTrue(session.isInvalid());
    }

    @Test void concurrentConsumptionIsShownAsUsedAndBothPostsRequireCsrf() throws Exception {
        when(resets.state(TOKEN)).thenReturn(PasswordResetService.State.VALID);
        when(resets.reset(any())).thenReturn(PasswordResetService.State.USED);
        mvc.perform(post("/auth/reset-password").with(csrf()).param("token", TOKEN)
                        .param("password", "Replacement!123").param("confirmPassword", "Replacement!123"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("Liên kết đã được sử dụng")));
        for (String route : new String[]{"/auth/forgot-password", "/auth/reset-password"}) {
            mvc.perform(post(route)).andExpect(status().isForbidden());
            mvc.perform(post(route).with(csrf().useInvalidToken())).andExpect(status().isForbidden());
        }
    }
}
