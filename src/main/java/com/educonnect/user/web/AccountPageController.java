package com.educonnect.user.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class AccountPageController {

    @GetMapping("/account/profile")
    public String profile() {
        return "pages/account/profile";
    }
}
