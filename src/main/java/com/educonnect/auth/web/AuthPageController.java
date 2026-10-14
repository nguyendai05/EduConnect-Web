package com.educonnect.auth.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only preview views; no business logic. */
@Controller
public class AuthPageController {

    @GetMapping("/auth/login")
    public String login() {
        return "pages/auth/login";
    }
}
