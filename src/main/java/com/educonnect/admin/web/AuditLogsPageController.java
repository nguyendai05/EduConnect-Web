package com.educonnect.admin.web;

import com.educonnect.admin.service.AuditLogService;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** DAI-03 (BB12): nhật ký hệ thống chỉ đọc cho ADMIN. */
@Controller
@Profile("db-dev")
public class AuditLogsPageController {
    private final AuditLogService service;

    public AuditLogsPageController(AuditLogService service) {
        this.service = service;
    }

    @GetMapping("/admin/audit-logs")
    public String auditLogs(@AuthenticationPrincipal AccountPrincipal principal,
                            @RequestParam(required = false) String group,
                            @RequestParam(required = false) String action,
                            @RequestParam(required = false) String q,
                            @RequestParam(required = false) String query,
                            @RequestParam(defaultValue = "all") String actor,
                            @RequestParam(defaultValue = "all") String range,
                            @RequestParam(required = false) String from,
                            @RequestParam(required = false) String dateFrom,
                            @RequestParam(required = false) String to,
                            @RequestParam(required = false) String dateTo,
                            @RequestParam(defaultValue = "newest") String sort,
                            @RequestParam(defaultValue = "0") int page,
                            Model model, HttpServletResponse response) {
        String resolvedGroup = firstNonBlank(group, action, "all");
        String resolvedQ = firstNonBlank(q, query, "");
        String resolvedFrom = firstNonBlank(from, dateFrom, "");
        String resolvedTo = firstNonBlank(to, dateTo, "");
        try {
            model.addAttribute("logs", service.load(principal, resolvedGroup, resolvedQ, actor,
                    range, resolvedFrom, resolvedTo, sort, page));
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403) throw problem;
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
            model.addAttribute("logs", service.load(principal, resolvedGroup, "", actor,
                    "all", "", "", sort, 0));
        }
        return "pages/admin/audit-logs";
    }

    private static String firstNonBlank(String primary, String fallback, String defaultValue) {
        if (primary != null && !primary.isBlank()) return primary.strip();
        if (fallback != null && !fallback.isBlank()) return fallback.strip();
        return defaultValue;
    }
}
