package com.educonnect.auth.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class AuthPageController {

    @GetMapping("/auth/forgot-password")
    public String forgotPassword() {
        return "pages/auth/forgot-password";
    }

    @GetMapping("/auth/login")
    public String login() {
        return "pages/auth/login";
    }

    @GetMapping("/auth/register")
    public String register() {
        return "pages/auth/register";
    }

    @GetMapping("/auth/reset-password")
    public String resetPassword() {
        return "pages/auth/reset-password";
    }

    @GetMapping("/auth/verify-email")
    public String verifyEmail() {
        return "pages/auth/verify-email";
    }
}
