package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class ReportPageController {

    @GetMapping("/admin/report-detail")
    public String reportDetail() {
        return "pages/admin/report-detail";
    }

    @GetMapping("/admin/reports")
    public String reports() {
        return "pages/admin/reports";
    }
}
