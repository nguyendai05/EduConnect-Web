package com.educonnect.auth.web;

import com.educonnect.auth.EmailVerificationService;
import com.educonnect.auth.ForgotPasswordForm;
import com.educonnect.auth.PasswordResetService;
import com.educonnect.auth.RegistrationForm;
import com.educonnect.auth.ResetPasswordForm;
import com.educonnect.security.AccountPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

/** Account pages; authentication POST is handled by Spring Security. */
@Controller
public class AuthPageController {
    private final ObjectProvider<EmailVerificationService> verification;
    private final ObjectProvider<PasswordResetService> resets;

    public AuthPageController(ObjectProvider<EmailVerificationService> verification,
                              ObjectProvider<PasswordResetService> resets) {
        this.verification = verification;
        this.resets = resets;
    }

    @ModelAttribute
    void privateResponse(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Referrer-Policy", "no-referrer");
    }

    @GetMapping("/auth/forgot-password")
    public String forgotPassword(Model model) {
        model.addAttribute("forgotPasswordForm", new ForgotPasswordForm());
        return "pages/auth/forgot-password";
    }

    @PostMapping("/auth/forgot-password")
    public String requestReset(@Valid @ModelAttribute("forgotPasswordForm") ForgotPasswordForm form,
                               BindingResult errors, Model model) {
        if (!errors.hasErrors()) {
            try {
                resetService().request(form.getEmail());
                model.addAttribute("resetRequested", true);
            } catch (MailException error) {
                model.addAttribute("resetError", "Hiện chưa gửi được email. Vui lòng thử lại sau.");
            }
        }
        return "pages/auth/forgot-password";
    }

    @GetMapping("/auth/login")
    public String login(@AuthenticationPrincipal AccountPrincipal user) {
        if (user != null) return "redirect:" + user.getHomeUrl();
        return "pages/auth/login";
    }

    @GetMapping("/auth/register")
    public String register(Model model, @AuthenticationPrincipal AccountPrincipal user) {
        if (user != null) return "redirect:" + user.getHomeUrl();
        model.addAttribute("registrationForm", new RegistrationForm());
        return "pages/auth/register";
    }

    @GetMapping("/auth/reset-password")
    public String resetPassword(@RequestParam(required = false) String token, Model model) {
        var form = new ResetPasswordForm();
        form.setToken(token);
        model.addAttribute("resetPasswordForm", form);
        model.addAttribute("resetState", resets.getIfAvailable() == null ? PasswordResetService.State.MISSING : resetService().state(token));
        return "pages/auth/reset-password";
    }

    @PostMapping("/auth/reset-password")
    public String applyReset(@Valid @ModelAttribute("resetPasswordForm") ResetPasswordForm form,
                             BindingResult errors, Model model, HttpServletRequest request) {
        PasswordResetService.State state = resetService().state(form.getToken());
        if (!errors.hasErrors() && state == PasswordResetService.State.VALID) {
            state = resetService().reset(form);
            if (state == PasswordResetService.State.VALID) {
                if (request.getSession(false) != null) request.getSession(false).invalidate();
                SecurityContextHolder.clearContext();
                return "redirect:/auth/login?reset";
            }
        }
        form.setPassword(null);
        form.setConfirmPassword(null);
        model.addAttribute("resetState", state);
        return "pages/auth/reset-password";
    }

    private PasswordResetService resetService() {
        var service = resets.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        return service;
    }

    @GetMapping("/auth/verify-email")
    public String verifyEmail(Model model, HttpServletRequest request) {
        var service = verification.getIfAvailable();
        var session = request.getSession(false);
        String challenge = session == null ? null : (String) session.getAttribute(EmailVerificationController.SESSION_CHALLENGE);
        model.addAttribute("verification", service == null ? null : service.view(challenge));
        return "pages/auth/verify-email";
    }
}
