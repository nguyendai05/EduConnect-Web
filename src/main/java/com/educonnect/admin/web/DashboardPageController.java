package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only preview views; no business logic. */
@Controller
public class DashboardPageController {

    @GetMapping("/admin/dashboard")
    public String dashboard() {
        return "pages/admin/dashboard";
    }
}
