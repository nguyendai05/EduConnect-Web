package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class AuditLogsPageController {

    @GetMapping("/admin/audit-logs")
    public String auditLogs() {
        return "pages/admin/audit-logs";
    }
}
