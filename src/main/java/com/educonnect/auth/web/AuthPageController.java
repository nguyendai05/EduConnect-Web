package com.educonnect.auth.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import com.educonnect.auth.RegistrationForm;
import com.educonnect.security.AccountPrincipal;
import org.springframework.ui.Model;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import com.educonnect.auth.EmailVerificationService;
import jakarta.servlet.http.HttpServletRequest;

/** Account pages; authentication POST is handled by Spring Security. */
@Controller
public class AuthPageController {
    private final ObjectProvider<EmailVerificationService> verification;

    public AuthPageController(ObjectProvider<EmailVerificationService> verification) { this.verification = verification; }

    @GetMapping("/auth/forgot-password")
    public String forgotPassword() {
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
    public String resetPassword() {
        return "pages/auth/reset-password";
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
