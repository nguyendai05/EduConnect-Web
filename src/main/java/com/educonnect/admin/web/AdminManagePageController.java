package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class AdminManagePageController {

    @GetMapping("/admin/manage")
    public String manage() {
        return "pages/admin/manage";
    }
}
