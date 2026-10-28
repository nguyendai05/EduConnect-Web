package com.educonnect.invitation.web;

import com.educonnect.invitation.dto.InvitationActionRequest;
import com.educonnect.invitation.dto.InvitationRequest;
import com.educonnect.invitation.service.InvitationProblem;
import com.educonnect.invitation.service.InvitationService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.web.PageModelAdvice;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Tác giả: Trường Đạt.
 * DAT-03: nhận form lời mời, gọi Service và đưa Response vào Thymeleaf.
 */
@Controller
@Profile("db-dev")
@RequestMapping("/invitation")
public class InvitationPageController {
    private final InvitationService service;

    public InvitationPageController(InvitationService service) {
        this.service = service;
    }

    /**
     * Tác giả: Trường Đạt.
     * Nạp Request lời mời và các lựa chọn thật để hiển thị form.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @GetMapping("/create")
    public String create(@AuthenticationPrincipal AccountPrincipal principal,
                         @RequestParam(required = false) Long tutorId,
                         @RequestParam(required = false) Long offeringId, Model model) {
        context(model, principal);
        InvitationRequest form = service.prepare(principal, tutorId, offeringId);
        model.addAttribute("invitationRequest", form);
        model.addAttribute("options", service.options(principal, form.getTutorId()));
        return "pages/invitation/create";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận form lời mời, hiển thị lỗi hoặc chuyển đến chi tiết sau khi lưu.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @PostMapping("/create")
    public String send(@AuthenticationPrincipal AccountPrincipal principal,
                       @Valid
                       @ModelAttribute("invitationRequest") InvitationRequest form,
                       BindingResult errors, Model model, HttpServletResponse response,
                       RedirectAttributes redirect) {
        context(model, principal);
        if (!errors.hasErrors()) {
            try {
                Long id = service.create(principal, form);
                redirect.addFlashAttribute("success", "Đã gửi lời mời. Chưa phát sinh đơn hoặc thanh toán.");
                return "redirect:/invitation/negotiation?id=" + id;
            } catch (InvitationProblem problem) {
                errors.reject("operation", problem.getMessage());
                response.setStatus(problem.getStatus().value());
            }
        } else {
            response.setStatus(400);
        }
        model.addAttribute("options", service.options(principal, form.getTutorId()));
        return "pages/invitation/create";
    }

    /**
     * Tác giả: Trường Đạt.
     * Hiển thị danh sách hoặc chi tiết lời mời thuộc quyền người đăng nhập.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @GetMapping("/negotiation")
    public String negotiation(@AuthenticationPrincipal AccountPrincipal principal,
                              @RequestParam(required = false) Long id,
                              @RequestParam(defaultValue = "0") int page, Model model) {
        context(model, principal);
        if (id == null) {
            model.addAttribute("invitations", service.list(principal, page));
        } else {
            model.addAttribute("invitation", service.detail(principal, id));
        }
        return "pages/invitation/negotiation";
    }

    /**
     * Tác giả: Trường Đạt.
     * Nhận phản hồi, giao nghiệp vụ cho Service và chuyển về trang kết quả.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @PostMapping("/{id}/respond")
    public String respond(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id,
                          @Valid
                          @ModelAttribute("actionRequest") InvitationActionRequest form,
                          BindingResult errors, Model model, HttpServletResponse response,
                          RedirectAttributes redirect) {
        context(model, principal);
        if (errors.hasErrors()) {
            // Nạp qua Service trước để ID của người ngoài không bị lộ dữ liệu trong thông báo lỗi form.
            model.addAttribute("invitation", service.detail(principal, id));
            response.setStatus(400);
            model.addAttribute("pageError", errors.getAllErrors().get(0).getDefaultMessage());
            return "pages/invitation/negotiation";
        }
        try {
            service.respond(principal, id, form);
            String message = switch (form.getAction()) {
                case "accept" -> "Đã chấp nhận đúng bộ điều khoản hiện hành. Chưa phát sinh thanh toán.";
                case "decline" -> "Đã từ chối lời mời.";
                default -> "Đã hủy lời mời.";
            };
            redirect.addFlashAttribute("success", message);
            return "redirect:/invitation/negotiation?id=" + id;
        } catch (InvitationProblem problem) {
            response.setStatus(problem.getStatus().value());
            model.addAttribute("invitation", service.detail(principal, id));
            model.addAttribute("pageError", problem.getMessage());
            return "pages/invitation/negotiation";
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Hiển thị lỗi nghiệp vụ với đúng trạng thái HTTP.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @ExceptionHandler(InvitationProblem.class)
    public String problem(InvitationProblem problem, Model model, HttpServletResponse response,
                          HttpServletRequest request, @AuthenticationPrincipal AccountPrincipal principal) {
        errorContext(model, principal);
        response.setStatus(problem.getStatus().value());
        model.addAttribute("pageError", problem.getMessage());
        return errorView(request);
    }

    /**
     * Tác giả: Trường Đạt.
     * Hiển thị lỗi mã lời mời hoặc số trang sai định dạng.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public String invalidParameter(Model model, HttpServletResponse response, HttpServletRequest request,
                                   @AuthenticationPrincipal AccountPrincipal principal) {
        errorContext(model, principal);
        response.setStatus(400);
        model.addAttribute("pageError", "Mã tham chiếu hoặc số trang không hợp lệ.");
        return errorView(request);
    }

    /**
     * Tác giả: Trường Đạt.
     * Hiển thị lỗi truy cập DB hoặc phiên bản đã thay đổi, không dùng dữ liệu mẫu.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    @ExceptionHandler(DataAccessException.class)
    public String unavailable(DataAccessException problem, Model model, HttpServletResponse response,
                              HttpServletRequest request, @AuthenticationPrincipal AccountPrincipal principal) {
        errorContext(model, principal);
        boolean conflict = problem instanceof OptimisticLockingFailureException;
        response.setStatus(conflict ? 409 : 503);
        model.addAttribute("pageError", conflict ? "Dữ liệu đã thay đổi. Hãy tải lại lời mời."
                : "Chưa thể đọc hoặc lưu lời mời. Hãy tải lại và kiểm tra kết quả trước khi gửi lại.");
        return errorView(request);
    }

    /**
     * Tác giả: Trường Đạt.
     * Chọn trang hiển thị lỗi theo URL đang thao tác.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private String errorView(HttpServletRequest request) {
        return request.getRequestURI().endsWith("/create") ? "pages/invitation/create" : "pages/invitation/negotiation";
    }

    /**
     * Tác giả: Trường Đạt.
     * Phục hồi projection A01 vì ExceptionHandler nhận Model riêng, để header vẫn hiển thị khi lỗi.
     * Thuộc trang: /invitation/create và /invitation/negotiation.
     */
    private void errorContext(Model model, AccountPrincipal principal) {
        context(model, principal);
        model.addAttribute("authenticationEnabled", true);
        model.addAttribute("currentUser", principal == null ? null : new PageModelAdvice.CurrentUser(
                principal.getId(), principal.getUsername(), principal.getDisplayName(), principal.getHomeUrl()));
    }

    /**
     * Tác giả: Trường Đạt.
     * Chỉ thêm metadata riêng của lời mời; sử dụng currentUser do A01 cấp.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private void context(Model model, AccountPrincipal principal) {
        // Tác giả: Trường Đạt. A01: currentUser/authenticationEnabled do PageModelAdvice của Đại cấp.
        model.addAttribute("uiPreviewEnabled", false);
        model.addAttribute("canCreateInvitation", principal != null
                && principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER")));
    }
}
