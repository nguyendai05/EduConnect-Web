package com.educonnect.admin.web;

import com.educonnect.admin.dto.AccountStatusForm;
import com.educonnect.admin.service.AdminManageService;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;

/** DAI-03: Quản lý nền tảng bằng dữ liệu thật. Chỉ ADMIN (kiểm ở SecurityConfig và lại ở Service). */
@Controller
@Profile("db-dev")
public class AdminManagePageController {
    private final AdminManageService service;
    private final com.educonnect.admin.service.OfferingReviewService offeringReviews;

    public AdminManagePageController(AdminManageService service, com.educonnect.admin.service.OfferingReviewService offeringReviews) {
        this.service = service;
        this.offeringReviews = offeringReviews;
    }

    @GetMapping("/admin/manage")
    public String manage(@AuthenticationPrincipal AccountPrincipal principal,
                         @RequestParam(defaultValue = "users") String tab,
                         @RequestParam(required = false) String q, @RequestParam(required = false) String role,
                         @RequestParam(required = false) String type, @RequestParam(required = false) String status,
                         @RequestParam(defaultValue = "0") int page, Model model, HttpServletResponse response) {
        String active = switch (tab) { case "offerings", "orders" -> tab; default -> "users"; };
        try {
            switch (active) {
                case "offerings" -> {
                    model.addAttribute("offerings", service.offerings(principal, q, type, status, page));
                    model.addAttribute("pendingOfferings", offeringReviews.pendingCount(principal));
                }
                case "orders" -> model.addAttribute("orders", service.orders(principal, q, status, page));
                default -> model.addAttribute("users", service.users(principal, q, role, status, page));
            }
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403) throw problem;
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
        }
        model.addAttribute("tab", active);
        model.addAttribute("q", q == null ? "" : q.strip());
        model.addAttribute("role", role == null ? "" : role);
        model.addAttribute("type", type == null ? "" : type);
        model.addAttribute("status", status == null ? "" : status);
        return "pages/admin/manage";
    }

    @PostMapping("/admin/manage/users/{id}/status")
    public String changeStatus(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id,
                               AccountStatusForm form, @RequestParam(required = false) String q,
                               @RequestParam(required = false) String role, @RequestParam(required = false) String filter,
                               @RequestParam(defaultValue = "0") int page, RedirectAttributes redirect) {
        try {
            service.changeStatus(principal, id, form);
            redirect.addFlashAttribute("success", switch (form.getStatus()) {
                case "LOCKED" -> "Đã khóa tài khoản. Các phiên đang đăng nhập của họ bị thu hồi.";
                case "DISABLED" -> "Đã vô hiệu hóa tài khoản. Các phiên đang đăng nhập của họ bị thu hồi.";
                default -> "Đã mở khóa tài khoản.";
            });
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403 && "Tài khoản không có quyền thực hiện thao tác này.".equals(problem.getMessage())) throw problem;
            redirect.addFlashAttribute("pageError", problem.getMessage());
        }
        return "redirect:" + UriComponentsBuilder.fromPath("/admin/manage").queryParam("tab", "users")
                .queryParamIfPresent("q", java.util.Optional.ofNullable(q).filter(v -> !v.isBlank()))
                .queryParamIfPresent("role", java.util.Optional.ofNullable(role).filter(v -> !v.isBlank()))
                .queryParamIfPresent("status", java.util.Optional.ofNullable(filter).filter(v -> !v.isBlank()))
                .queryParam("page", page).encode().build().toUriString();
    }
}
