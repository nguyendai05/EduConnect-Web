package com.educonnect.admin.web;

import com.educonnect.job.domain.JobPostStatus;
import com.educonnect.job.dto.JobReviewRequest;
import com.educonnect.job.dto.JobSearchRequest;
import com.educonnect.job.service.JobReviewService;
import com.educonnect.security.AccountPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: hai trang admin duyệt tin, gọi cùng Service nghiệp vụ tin.
 */
@Controller
@Profile("db-dev")
public class JobReviewPageController {
    private final JobReviewService reviews;

    public JobReviewPageController(JobReviewService reviews) {
        this.reviews = reviews;
    }

    @ModelAttribute
    void context(Model model) { model.addAttribute("uiPreviewEnabled", false); }

    /**
     * Tác giả: Trường Đạt.
     * Nhận bộ lọc và hiển thị hàng đợi tin sau khi Service kiểm quyền admin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/admin/job-review-queue")
    public String queue(@AuthenticationPrincipal AccountPrincipal principal,
            @Valid
            @ModelAttribute("search") JobSearchRequest form, BindingResult errors,
            @RequestParam(defaultValue = "PENDING") JobPostStatus status, Model model, HttpServletResponse response) {
        if (errors.hasErrors()) {
            response.setStatus(400);
            model.addAttribute("pageError", "Bộ lọc hoặc số trang không hợp lệ.");
        } else {
            model.addAttribute("jobs", reviews.queue(principal, form, status));
        }
        model.addAttribute("selectedStatus", status);
        return "pages/admin/job-review-queue";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp tin, quyết định gần nhất và form duyệt cho admin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/admin/job-review-detail")
    public String detail(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id, Model model) {
        detailModel(principal, id, model);
        model.addAttribute("reviewRequest", new JobReviewRequest());
        return "pages/admin/job-review-detail";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận lý do/quyết định, giao Service xử lý rồi chuyển về kết quả.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @PostMapping("/admin/job-review-detail")
    public String review(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id,
            @Valid
            @ModelAttribute("reviewRequest") JobReviewRequest form, BindingResult errors,
            Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            detailModel(principal, id, model);
            response.setStatus(400);
            model.addAttribute("pageError", errors.getAllErrors().get(0).getDefaultMessage());
            return "pages/admin/job-review-detail";
        }
        reviews.review(principal, id, form);
        redirect.addFlashAttribute("success", "Đã lưu quyết định và lý do duyệt tin.");
        return "redirect:/admin/job-review-detail?id=" + id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp nội dung tin và quyết định gần nhất qua cùng Service duyệt tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private void detailModel(AccountPrincipal principal, Long id, Model model) {
        model.addAttribute("job", reviews.detail(principal, id));
        model.addAttribute("decision", reviews.lastDecision(principal, id));
    }
}
