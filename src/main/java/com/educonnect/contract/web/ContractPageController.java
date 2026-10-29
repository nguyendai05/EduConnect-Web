package com.educonnect.contract.web;

import com.educonnect.contract.ContractConfirmationForm;
import com.educonnect.contract.InvitationContractForm;
import com.educonnect.contract.JobContractForm;
import com.educonnect.contract.service.ContractLifecycleService;
import com.educonnect.contract.service.ContractListService;
import com.educonnect.contract.service.ContractService;
import com.educonnect.contract.service.ContractSessionService;
import com.educonnect.security.AccountPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class ContractPageController {
    private ObjectProvider<ContractService> services;
    private ObjectProvider<ContractLifecycleService> lifecycle;
    private ObjectProvider<ContractSessionService> sessions;
    private ObjectProvider<ContractListService> lists;

    public ContractPageController(ObjectProvider<ContractService> services, ObjectProvider<ContractLifecycleService> lifecycle,
                                  ObjectProvider<ContractSessionService> sessions,
                                  ObjectProvider<ContractListService> lists) {
        this.services = services;
        this.lists = lists;
        this.lifecycle = lifecycle;
        this.sessions = sessions;
    }

    @GetMapping("/contract/confirm")
    public String confirm(@RequestParam(value = "contract", required = false) Long contractId,
                          @RequestParam(required = false) Long cartItemId,
                          @RequestParam(required = false) Long invitationId,
                          @RequestParam(required = false) Long applicationId,
                          @AuthenticationPrincipal AccountPrincipal user, Model model) {
        ContractService service = services.getIfAvailable();
        if (service != null) {
            if (contractId != null) model.addAttribute("confirmation", service.getContract(user, contractId));
            else if (cartItemId != null || invitationId != null || applicationId != null) {
                try {
                    model.addAttribute("confirmation", cartItemId != null ? service.draft(user, cartItemId)
                            : invitationId != null ? service.draftInvitation(user, invitationId)
                            : service.draftJob(user, applicationId));
                } catch (IllegalArgumentException | ResponseStatusException error) {
                    model.addAttribute("error", error instanceof ResponseStatusException r ? r.getReason() : error.getMessage());
                }
            }
        }
        return "pages/contract/confirm";
    }

    /** Legacy POST only chooses a draft; neither it nor GET creates a transaction. */
    @PostMapping("/contract/create")
    public String createFromCart(@RequestParam Long cartItemId) {
        return "redirect:/contract/confirm?cartItemId=" + cartItemId;
    }

    @PostMapping("/contract/sign")
    public String sign(@Valid @ModelAttribute ContractConfirmationForm form, BindingResult errors,
                       @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        if (errors.hasErrors()) {
            redirect.addFlashAttribute("error", "Vui lòng chọn dịch vụ và xác nhận đầy đủ ba cam kết");
            return "redirect:/cart/index";
        }
        ContractService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            Long id = service.confirm(user, form);
            return "redirect:/contract/confirm?contract=" + id;
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
            return "redirect:/cart/index";
        }
    }

    /** Xác nhận hợp đồng từ lời mời đã chấp thuận. */
    @PostMapping("/contract/sign-invitation")
    public String signInvitation(@Valid @ModelAttribute InvitationContractForm form, BindingResult errors,
                                 @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ContractService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        String back = "redirect:/contract/confirm?invitationId=" + form.invitationId();
        if (errors.hasErrors()) {
            redirect.addFlashAttribute("error", "Vui lòng xác nhận đầy đủ ba cam kết");
            return back;
        }
        try {
            return "redirect:/contract/confirm?contract=" + service.confirmInvitation(user, form);
        } catch (IllegalArgumentException | ResponseStatusException error) {
            redirect.addFlashAttribute("error", error instanceof ResponseStatusException r ? r.getReason() : error.getMessage());
            return back;
        }
    }

    /** Xác nhận hợp đồng từ gia sư đã được chọn cho tin. */
    @PostMapping("/contract/sign-job")
    public String signJob(@Valid @ModelAttribute JobContractForm form, BindingResult errors,
                          @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ContractService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        String back = "redirect:/contract/confirm?applicationId=" + form.applicationId();
        if (errors.hasErrors()) {
            redirect.addFlashAttribute("error", "Vui lòng xác nhận đầy đủ ba cam kết");
            return back;
        }
        try {
            return "redirect:/contract/confirm?contract=" + service.confirmJob(user, form);
        } catch (IllegalArgumentException | ResponseStatusException error) {
            redirect.addFlashAttribute("error", error instanceof ResponseStatusException r ? r.getReason() : error.getMessage());
            return back;
        }
    }

    /** Gia sư điểm danh một buổi đã dạy. */
    @PostMapping("/contract/session/attend")
    public String attend(@RequestParam("contract") Long contractId, @RequestParam("session") Long sessionId,
                         @RequestParam(required = false) String back,
                         @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ContractSessionService service = sessions.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            service.attend(user, sessionId);
            redirect.addFlashAttribute("message", "Đã điểm danh buổi học, chờ học viên xác nhận");
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
        }
        return backTo(back, "redirect:/contract/tutor-detail?contract=" + contractId);
    }

    /** Gia sư điểm danh nhanh buổi kế tiếp của hợp đồng từ danh sách. */
    @PostMapping("/contract/session/attend-next")
    public String attendNext(@RequestParam("contract") Long contractId, @RequestParam(required = false) String back,
                             @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ContractSessionService service = sessions.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            service.attendNext(user, contractId);
            redirect.addFlashAttribute("message", "Đã điểm danh buổi học, chờ học viên xác nhận");
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
        }
        return backTo(back, "redirect:/contract/tutor-detail?contract=" + contractId);
    }

    /** Học viên xác nhận buổi đã học; tiền của buổi đó được giải ngân cho gia sư. */
    @PostMapping("/contract/session/confirm")
    public String confirmSession(@RequestParam("contract") Long contractId, @RequestParam("session") Long sessionId,
                                 @RequestParam(required = false) String back,
                                 @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ContractSessionService service = sessions.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            service.confirm(user, sessionId);
            redirect.addFlashAttribute("message", "Đã xác nhận buổi học và chuyển tiền cho gia sư");
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
        }
        return backTo(back, "redirect:/contract/student-detail?contract=" + contractId);
    }

    /** Học viên hủy hợp đồng chưa thanh toán. */
    @PostMapping("/contract/cancel")
    public String cancel(@RequestParam("contract") Long contractId, @RequestParam(defaultValue = "") String reason,
                         @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ContractLifecycleService service = lifecycle.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            service.cancel(user, contractId, reason);
            redirect.addFlashAttribute("message", "Đã hủy hợp đồng");
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
        }
        return "redirect:/contract/student-detail?contract=" + contractId;
    }

    /** Quản trị hoàn tiền phần chưa giải ngân cho học viên (nút trên trang quản trị do Đại gắn). */
    @PostMapping("/contract/refund")
    public String refund(@RequestParam("contract") Long contractId, @RequestParam(defaultValue = "") String reason,
                         @AuthenticationPrincipal AccountPrincipal admin, RedirectAttributes redirect) {
        ContractLifecycleService service = lifecycle.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            service.refund(admin, contractId, reason);
            redirect.addFlashAttribute("message", "Đã hoàn tiền cho học viên và hủy hợp đồng");
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
        }
        return "redirect:/admin/dashboard";
    }

    /** Danh sách hợp đồng của người đăng nhập (học viên hoặc gia sư). */
    @GetMapping("/contract/my")
    public String my(@AuthenticationPrincipal AccountPrincipal user, Model model) {
        ContractListService service = lists.getIfAvailable();
        if (service != null) model.addAttribute("contracts", service.mine(user));
        return "pages/contract/my";
    }

    /** Nơi quay lại sau thao tác từ danh sách: chỉ nhận các giá trị đã biết, tránh chuyển hướng tùy ý. */
    private static String backTo(String back, String fallback) {
        return switch (back == null ? "" : back) {
            case "my" -> "redirect:/contract/my";
            case "manage" -> "redirect:/tutor/manage";
            default -> fallback;
        };
    }

    /** Chi tiết hợp đồng của học viên. */
    @GetMapping("/contract/student-detail")
    public String studentDetail(@RequestParam(value = "contract", required = false) Long contractId,
                                @AuthenticationPrincipal AccountPrincipal user, Model model) {
        return detail(contractId, user, model, "pages/contract/student-detail");
    }

    /** Chi tiết hợp đồng của gia sư. */
    @GetMapping("/contract/tutor-detail")
    public String tutorDetail(@RequestParam(value = "contract", required = false) Long contractId,
                              @AuthenticationPrincipal AccountPrincipal user, Model model) {
        return detail(contractId, user, model, "pages/contract/tutor-detail");
    }

    private String detail(Long contractId, AccountPrincipal user, Model model, String view) {
        ContractService service = services.getIfAvailable();
        if (service != null && contractId != null) model.addAttribute("contract", service.detail(user, contractId));
        return view;
    }
}
