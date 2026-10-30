package com.educonnect.tutor.web;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.dto.TutorProfileForm;
import com.educonnect.tutor.service.TutorProfileService;
import com.educonnect.tutor.service.TutorProfileService.SaveResult;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/** DAI-02: hồ sơ gia sư của tôi — sửa hồ sơ, tải minh chứng, gửi duyệt. Tách khỏi TutorPageController. */
@Controller
@Profile("db-dev")
@RequestMapping("/tutor/my-profile")
public class TutorProfilePageController {
    private static final String VIEW = "pages/tutor/my-profile";
    private static final String REREVIEW = "Đã lưu. Thay đổi này cần được duyệt lại nên hồ sơ tạm ẩn khỏi tìm kiếm công khai cho đến khi quản trị viên duyệt.";

    private final TutorProfileService service;

    public TutorProfilePageController(TutorProfileService service) {
        this.service = service;
    }

    @GetMapping
    public String view(@AuthenticationPrincipal AccountPrincipal principal, Model model) {
        var profile = service.view(principal);
        model.addAttribute("profile", profile);
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", service.formOf(profile));
        }
        return VIEW;
    }

    @PostMapping
    public String save(@AuthenticationPrincipal AccountPrincipal principal,
                       @Valid @ModelAttribute("form") TutorProfileForm form, BindingResult errors,
                       Model model, HttpServletResponse response, RedirectAttributes redirect) {
        if (!errors.hasErrors()) {
            try {
                SaveResult result = service.save(principal, form);
                redirect.addFlashAttribute("success", result == SaveResult.SENT_FOR_REREVIEW ? REREVIEW : "Đã lưu thay đổi hồ sơ.");
                return "redirect:/tutor/my-profile";
            } catch (ServiceProblem problem) {
                if (problem.getStatus().value() == 403) throw problem;
                response.setStatus(problem.getStatus().value());
                model.addAttribute("pageError", problem.getMessage());
            }
        } else {
            response.setStatus(400);
        }
        model.addAttribute("profile", service.view(principal));
        return VIEW;
    }

    @PostMapping("/submit")
    public String submit(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam(required = false) Long tutorVersion,
                         RedirectAttributes redirect) {
        try {
            service.submit(principal, tutorVersion);
            redirect.addFlashAttribute("success", "Đã gửi hồ sơ để quản trị viên duyệt. Bạn sẽ nhận thông báo khi có kết quả.");
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403) throw problem;
            redirect.addFlashAttribute("pageError", problem.getMessage());
        }
        return "redirect:/tutor/my-profile";
    }

    @PostMapping("/evidence")
    public String upload(@AuthenticationPrincipal AccountPrincipal principal, @RequestParam("file") MultipartFile file,
                         RedirectAttributes redirect) {
        try {
            SaveResult result = service.addEvidence(principal, file);
            redirect.addFlashAttribute("success", result == SaveResult.SENT_FOR_REREVIEW ? REREVIEW : "Đã tải minh chứng lên.");
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403) throw problem;
            redirect.addFlashAttribute("pageError", problem.getMessage());
        }
        return "redirect:/tutor/my-profile";
    }

    @PostMapping("/evidence/{fileId}/delete")
    public String delete(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long fileId,
                         RedirectAttributes redirect) {
        try {
            SaveResult result = service.removeEvidence(principal, fileId);
            redirect.addFlashAttribute("success", result == SaveResult.SENT_FOR_REREVIEW ? REREVIEW : "Đã xóa tệp minh chứng.");
        } catch (ServiceProblem problem) {
            if (problem.getStatus().value() == 403) throw problem;
            redirect.addFlashAttribute("pageError", problem.getMessage());
        }
        return "redirect:/tutor/my-profile";
    }
}
