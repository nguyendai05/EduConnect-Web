package com.educonnect.admin.web;

import com.educonnect.admin.dto.TutorReviewForm;
import com.educonnect.admin.service.TutorReviewService;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorReviewStatus;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/** DAI-02: hàng đợi và chi tiết duyệt hồ sơ gia sư (chỉ ADMIN, kiểm lại ở Service). */
@Controller
@Profile("db-dev")
public class TutorReviewPageController {
    private final TutorReviewService service;

    public TutorReviewPageController(TutorReviewService service) {
        this.service = service;
    }

    @GetMapping("/admin/tutor-review-queue")
    public String queue(@AuthenticationPrincipal AccountPrincipal principal,
                        @RequestParam(defaultValue = "PENDING") TutorReviewStatus status,
                        @RequestParam(required = false) String q, @RequestParam(defaultValue = "0") int page,
                        Model model, HttpServletResponse response) {
        try {
            model.addAttribute("queue", service.queue(principal, status, q, page));
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403) throw problem;
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
        }
        model.addAttribute("status", status);
        model.addAttribute("q", q == null ? "" : q.strip());
        return "pages/admin/tutor-review-queue";
    }

    @GetMapping("/admin/tutor-review-detail")
    public String detail(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id, Model model) {
        model.addAttribute("profile", service.detail(principal, id));
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new TutorReviewForm());
        }
        return "pages/admin/tutor-review-detail";
    }

    @PostMapping("/admin/tutor-review-detail")
    public String decide(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id, TutorReviewForm form,
                         Model model, HttpServletResponse response, RedirectAttributes redirect) {
        try {
            var result = service.decide(principal, id, form);
            redirect.addFlashAttribute("success", result == TutorReviewStatus.APPROVED
                    ? "Đã duyệt hồ sơ. Gia sư được công khai trong kết quả tìm kiếm và nhận thông báo."
                    : "Đã từ chối hồ sơ kèm lý do. Gia sư nhận thông báo để bổ sung.");
            return "redirect:/admin/tutor-review-detail?id=" + id;
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403 || problem.getStatus().value() == 404) throw problem;
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
            model.addAttribute("form", form);
            model.addAttribute("profile", service.detail(principal, id));
            return "pages/admin/tutor-review-detail";
        }
    }
}
