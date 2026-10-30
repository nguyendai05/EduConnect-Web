package com.educonnect.admin.web;

import com.educonnect.admin.dto.OfferingReviewForm;
import com.educonnect.admin.service.OfferingReviewService;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.security.AccountPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/** DAI-03: chi tiết và duyệt khóa học của gia sư (chỉ ADMIN, kiểm lại ở Service). */
@Controller
@Profile("db-dev")
public class OfferingReviewPageController {
    private static final String VIEW = "pages/admin/offering-review-detail";

    private final OfferingReviewService service;

    public OfferingReviewPageController(OfferingReviewService service) {
        this.service = service;
    }

    @GetMapping("/admin/offering-review-detail")
    public String detail(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id, Model model) {
        model.addAttribute("offering", service.detail(principal, id));
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new OfferingReviewForm());
        }
        return VIEW;
    }

    @PostMapping("/admin/offering-review-detail")
    public String decide(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id, OfferingReviewForm form,
                         Model model, HttpServletResponse response, RedirectAttributes redirect) {
        try {
            var result = service.decide(principal, id, form);
            redirect.addFlashAttribute("success", result == OfferingStatus.PUBLISHED
                    ? "Đã duyệt khóa học. Khóa học được công khai và gia sư nhận thông báo."
                    : "Đã từ chối khóa học kèm lý do. Gia sư nhận thông báo để chỉnh sửa.");
            return "redirect:/admin/offering-review-detail?id=" + id;
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403 || problem.getStatus().value() == 404) throw problem;
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
            model.addAttribute("form", form);
            model.addAttribute("offering", service.detail(principal, id));
            return VIEW;
        }
    }
}
