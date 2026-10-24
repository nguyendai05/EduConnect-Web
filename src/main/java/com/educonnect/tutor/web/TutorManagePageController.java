package com.educonnect.tutor.web;

import com.educonnect.lesson.dto.OfferingFilterRequest;
import com.educonnect.lesson.dto.OfferingRequest;
import com.educonnect.lesson.dto.OfferingStatusRequest;
import com.educonnect.lesson.dto.OfferingTimeSlotRequest;
import com.educonnect.lesson.service.OfferingProblem;
import com.educonnect.lesson.service.TutorOfferingService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.web.PageModelAdvice;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import org.springframework.beans.InvalidPropertyException;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.UUID;

/**
 * DAT-01 — Nguyễn Khắc Trường Đạt.
 * Quản lý dịch vụ/lớp trong chế độ có database.
 */
@Controller
@Profile("db-dev")
@RequestMapping("/tutor/manage")
public class TutorManagePageController {

    private static final String VIEW = "pages/tutor/manage";

    private final TutorOfferingService service;

    public TutorManagePageController(TutorOfferingService service) {
        this.service = service;
    }

    @GetMapping
    public String manage(
            @AuthenticationPrincipal AccountPrincipal principal,
            Model model,
            @RequestParam(required = false) Long edit,
            @ModelAttribute("filterRequest") OfferingFilterRequest filter
    ) {
        var form = edit != null ? service.edit(principal, edit) : freshForm();

        model.addAttribute("offeringRequest", form);
        model.addAttribute("editingId", edit);
        model.addAttribute("publishedEdit", edit != null && service.isPublished(principal, edit));
        populate(principal, model, filter);
        return VIEW;
    }

    @PostMapping({"/offerings", "/offerings/{id}"})
    public String save(
            @AuthenticationPrincipal AccountPrincipal principal,
            @PathVariable(required = false) Long id,
            @Valid @ModelAttribute("offeringRequest") OfferingRequest form,
            BindingResult errors,
            Model model,
            HttpServletResponse response,
            RedirectAttributes redirect
    ) {
        // Cờ hiển thị lấy từ database, không nhận từ DTO của người dùng.
        boolean publishedEdit = false;
        if (id == null) {
            service.options(principal);
        } else {
            publishedEdit = service.isPublished(principal, id);
        }
        model.addAttribute("editingId", id);
        model.addAttribute("publishedEdit", publishedEdit);

        if (errors.hasErrors()) {
            response.setStatus(400);
            populate(principal, model, new OfferingFilterRequest());
            return VIEW;
        }

        try {
            service.save(principal, id, form);

            String message;
            if (id == null) {
                message = "Đã lưu bản nháp dịch vụ/lớp.";
            } else if (publishedEdit) {
                message = "Đã lưu thay đổi và gửi duyệt lại. Dịch vụ tạm ngừng công khai cho đến khi được duyệt.";
            } else {
                message = "Đã lưu thay đổi.";
            }

            redirect.addFlashAttribute("success", message);
            return "redirect:/tutor/manage";
        } catch (OfferingProblem problem) {
            errors.reject("operation", problem.getMessage());
            response.setStatus(problem.getStatus().value());
        } catch (ConstraintViolationException invalid) {
            errors.reject("invalid", "Dữ liệu hoặc lịch học chưa hợp lệ.");
            response.setStatus(400);
        }

        populate(principal, model, new OfferingFilterRequest());

        return VIEW;
    }

    @PostMapping("/offerings/{id}/status")
    public String transition(
            @AuthenticationPrincipal AccountPrincipal principal,
            @PathVariable Long id,
            @Valid @ModelAttribute("statusRequest") OfferingStatusRequest form,
            BindingResult errors,
            Model model,
            HttpServletResponse response,
            RedirectAttributes redirect
    ) {
        if (errors.hasErrors()) {
            response.setStatus(400);
            empty(model, principal);
            model.addAttribute("pageError", errors.getAllErrors().get(0).getDefaultMessage());
            return VIEW;
        }

        service.transition(principal, id, form.getVersion(), form.getAction());
        redirect.addFlashAttribute(
                "success",
                "submit".equals(form.getAction())
                        ? "Đã gửi duyệt. Dịch vụ chưa được công khai."
                        : "Đã đóng dịch vụ/lớp. Các giao dịch cũ được giữ nguyên."
        );

        return "redirect:/tutor/manage";
    }

    @ExceptionHandler(OfferingProblem.class)
    String problem(
            OfferingProblem problem,
            Model model,
            HttpServletResponse response,
            @AuthenticationPrincipal AccountPrincipal principal
    ) {
        response.setStatus(problem.getStatus().value());
        empty(model, principal);
        model.addAttribute("pageError", problem.getMessage());

        return VIEW;
    }

    @ExceptionHandler({
            DataAccessException.class,
            ConstraintViolationException.class,
            InvalidPropertyException.class
    })
    String unavailable(
            Exception problem,
            Model model,
            HttpServletResponse response,
            @AuthenticationPrincipal AccountPrincipal principal
    ) {
        boolean invalid = problem instanceof ConstraintViolationException
                || problem instanceof InvalidPropertyException;

        response.setStatus(invalid ? 400 : 503);
        empty(model, principal);
        model.addAttribute(
                "pageError",
                invalid
                        ? "Dữ liệu chưa hợp lệ. Hãy kiểm tra lại form."
                        : "Chưa thể đọc hoặc lưu dữ liệu. Hãy tải lại trang và kiểm tra kết quả trước khi thử lại."
        );

        return VIEW;
    }
    private void populate(
            AccountPrincipal principal,
            Model model,
            OfferingFilterRequest filter
    ) {
        if (filter.getQ().length() > 200) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Từ khóa tối đa 200 ký tự.");
        }

        model.addAttribute("dbReady", true);
        model.addAttribute("filterRequest", filter);
        model.addAttribute("offerings", service.list(
                principal,
                filter.getType(),
                filter.getStatus(),
                filter.getQ()
        ));
        model.addAttribute("options", service.options(principal));
    }

    private void empty(Model model, AccountPrincipal principal) {
        model.addAttribute("dbReady", false);
        model.addAttribute("offerings", List.of());
        model.addAttribute("filterRequest", new OfferingFilterRequest());
        // View trả về từ @ExceptionHandler cần thêm lại thông tin header.
        model.addAttribute("authenticationEnabled", true);
        model.addAttribute("uiPreviewEnabled", false);

        model.addAttribute(
                "currentUser",
                principal == null
                        ? null
                        : new PageModelAdvice.CurrentUser(
                                principal.getId(),
                                principal.getUsername(),
                                principal.getDisplayName(),
                                principal.getHomeUrl()
                        )
        );
    }

    private OfferingRequest freshForm() {
        var form = new OfferingRequest();
        form.setRequestKey(UUID.randomUUID().toString());
        form.getSlots().add(new OfferingTimeSlotRequest());

        return form;
    }
}
