package com.educonnect.job.web;

import com.educonnect.job.domain.JobPostStatus;
import com.educonnect.job.dto.JobActionRequest;
import com.educonnect.job.dto.JobApplicationActionRequest;
import com.educonnect.job.dto.JobApplicationRequest;
import com.educonnect.job.dto.JobApplicationUpdateRequest;
import com.educonnect.job.dto.JobPostRequest;
import com.educonnect.job.dto.JobSearchRequest;
import com.educonnect.job.service.JobProblem;
import com.educonnect.job.service.JobService;
import com.educonnect.security.AccountPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: nhận form, gọi Service, đưa Response vào Thymeleaf.
 */
@Controller
@Profile("db-dev")
@RequestMapping("/job")
public class JobPageController {
    private final JobService jobs;

    public JobPageController(JobService jobs) {
        this.jobs = jobs;
    }

    @ModelAttribute
    void context(Model model, @AuthenticationPrincipal AccountPrincipal principal) {
        model.addAttribute("uiPreviewEnabled", false);
        model.addAttribute("canPostJob", principal != null
                && principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER")));
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận bộ lọc và hiển thị trang tin công khai từ Service.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/discover")
    public String discover(@Valid @ModelAttribute("search") JobSearchRequest form, BindingResult errors,
                           Model model, HttpServletResponse response) {
        model.addAttribute("options", jobs.options());
        if (errors.hasErrors()) {
            response.setStatus(400);
            model.addAttribute("pageError", "Bộ lọc không hợp lệ. Kiểm tra từ khóa, khoảng giá và số trang.");
        } else {
            model.addAttribute("jobs", jobs.discover(form));
        }
        return "pages/job/discover";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận bộ lọc và hiển thị danh sách tin của người đăng nhập.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/my-job")
    public String myJob(@AuthenticationPrincipal AccountPrincipal principal,
                        @Valid
                        @ModelAttribute("search") JobSearchRequest form, BindingResult errors,
                        @RequestParam(required = false) JobPostStatus status, Model model, HttpServletResponse response) {
        if (errors.hasErrors()) {
            response.setStatus(400);
            model.addAttribute("pageError", "Từ khóa hoặc số trang không hợp lệ.");
        } else {
            model.addAttribute("jobs", jobs.mine(principal, form, status));
        }
        model.addAttribute("selectedStatus", status);
        return "pages/job/my-job";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp Request tạo/sửa và danh mục để hiển thị form tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/create")
    public String create(@AuthenticationPrincipal AccountPrincipal principal,
                         @RequestParam(required = false) Long id, Model model) {
        model.addAttribute("jobRequest", jobs.prepare(principal, id));
        model.addAttribute("editingId", id);
        model.addAttribute("options", jobs.options());
        return "pages/job/create";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận form hợp lệ, gọi Service lưu tin và chuyển đến trang kết quả.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @PostMapping("/create")
    public String save(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam(required = false) Long id,
                       @Valid
                       @ModelAttribute("jobRequest") JobPostRequest form, BindingResult errors,
                       Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (!errors.hasErrors()) {
            try {
                Long savedId = jobs.save(principal, id, form);
                redirect.addFlashAttribute("success", "submit".equals(form.getAction()) ? "Đã gửi tin chờ admin duyệt." : "Đã lưu bản nháp.");
                return "redirect:/job/detail?id=" + savedId;
            } catch (JobProblem problem) {
                errors.reject("operation", problem.getMessage());
                response.setStatus(problem.getStatus().value());
            }
        } else {
            response.setStatus(400);
        }
        model.addAttribute("editingId", id);
        model.addAttribute("options", jobs.options());
        return "pages/job/create";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp dữ liệu được phép đọc cho trang chi tiết tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/detail")
    public String detail(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id, Model model) {
        detailModel(principal, id, model);
        return "pages/job/detail";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp danh sách ứng viên riêng của người đăng tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @GetMapping("/applicants")
    public String applicants(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam Long id,
                             @RequestParam(defaultValue = "0") int page, Model model) {
        model.addAttribute("applications", jobs.applicants(principal, id, page));
        model.addAttribute("job", jobs.detail(principal, id));
        return "pages/job/applicants";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận thao tác gửi duyệt hoặc đóng tin, để Service quyết định nghiệp vụ.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @PostMapping("/{id}/action")
    public String action(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id,
                         @Valid
                         @ModelAttribute JobActionRequest form, BindingResult errors,
                         Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            return invalidDetail(principal, id, errors, model, response);
        }
        jobs.change(principal, id, form);
        redirect.addFlashAttribute("success", "Đã cập nhật trạng thái tin.");
        return "redirect:/job/detail?id=" + id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận đề xuất ứng tuyển và chuyển xử lý cho Service.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @PostMapping("/{id}/apply")
    public String apply(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id,
                        @Valid
                        @ModelAttribute("applicationRequest") JobApplicationRequest form, BindingResult errors,
                        Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            return invalidDetail(principal, id, errors, model, response);
        }
        jobs.apply(principal, id, form);
        redirect.addFlashAttribute("success", "Đã gửi đề xuất ứng tuyển. Chưa tạo đơn hoặc thanh toán.");
        return "redirect:/job/detail?id=" + id;
    }

    /** Gia sư sửa giá và lời nhắn của đề xuất ứng tuyển đang chờ. */
    @PostMapping("/{id}/applications/{applicationId}/update")
    public String updateApplication(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id,
            @PathVariable Long applicationId,
            @Valid @ModelAttribute JobApplicationUpdateRequest form,
            BindingResult errors, Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            return invalidDetail(principal, id, errors, model, response);
        }
        jobs.updateApplication(principal, id, applicationId, form);
        redirect.addFlashAttribute("success", "Đã cập nhật đề xuất. Học viên cần xem lại đề xuất mới trước khi chọn.");
        return "redirect:/job/detail?id=" + id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận thao tác chọn, từ chối hoặc rút ứng tuyển để Service kiểm quyền/trạng thái.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @PostMapping("/{id}/applications/{applicationId}/action")
    public String applicationAction(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id,
            @PathVariable Long applicationId,
            @Valid
            @ModelAttribute JobApplicationActionRequest form,
            BindingResult errors, Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            return invalidDetail(principal, id, errors, model, response);
        }
        jobs.decideApplication(principal, id, applicationId, form);
        redirect.addFlashAttribute("success", "Đã xử lý ứng tuyển. Việc chọn gia sư chưa tạo đơn hoặc thu tiền.");
        return "redirect:/job/detail?id=" + id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp lại chi tiết đúng quyền và trình bày lỗi form mà không ghi dữ liệu.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private String invalidDetail(AccountPrincipal principal, Long id, BindingResult errors, Model model,
                                  HttpServletResponse response) {
        detailModel(principal, id, model);
        response.setStatus(400);
        model.addAttribute("pageError", errors.getAllErrors().get(0).getDefaultMessage());
        return "pages/job/detail";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp tin, ứng tuyển của chính người dùng và form cho trang chi tiết.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private void detailModel(AccountPrincipal principal, Long id, Model model) {
        model.addAttribute("job", jobs.detail(principal, id));
        model.addAttribute("ownApplication", jobs.ownApplication(principal, id));
        if (!model.containsAttribute("applicationRequest")) {
            model.addAttribute("applicationRequest", new JobApplicationRequest());
        }
    }
}
