package com.educonnect.user.web;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccountRepository;
import com.educonnect.user.dto.AccountProfileForm;
import com.educonnect.user.service.AccountProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/** DAI-02 (TC01): trang hồ sơ cá nhân dùng dữ liệu thật; người dùng chỉ xem/sửa chính mình. */
@Controller
@Profile("db-dev")
public class AccountPageController {
    private static final String VIEW = "pages/account/profile";

    private final AccountProfileService service;
    private final UserAccountRepository accounts;
    private final HttpSessionSecurityContextRepository contexts = new HttpSessionSecurityContextRepository();

    public AccountPageController(AccountProfileService service, UserAccountRepository accounts) {
        this.service = service;
        this.accounts = accounts;
    }

    @GetMapping("/account/profile")
    public String profile(@AuthenticationPrincipal AccountPrincipal principal, Model model) {
        var profile = service.view(principal);
        model.addAttribute("profile", profile);
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", service.formOf(profile));
        }
        return VIEW;
    }

    @PostMapping("/account/profile")
    public String save(@AuthenticationPrincipal AccountPrincipal principal,
                       @Valid @ModelAttribute("form") AccountProfileForm form, BindingResult errors,
                       Model model, HttpServletRequest request, HttpServletResponse response, RedirectAttributes redirect) {
        if (!errors.hasErrors()) {
            try {
                service.update(principal, form);
                refreshSession(principal, request, response);
                redirect.addFlashAttribute("success", "Đã lưu thay đổi hồ sơ.");
                return "redirect:/account/profile";
            } catch (ServiceProblem problem) {
                if (problem.getStatus().value() == 403) throw problem;
                response.setStatus(problem.getStatus().value());
                model.addAttribute("pageError", problem.getMessage());
            }
        } else {
            response.setStatus(400);
        }
        model.addAttribute("profile", service.view(principal));
        model.addAttribute("editing", true);
        return VIEW;
    }

    /** Tên hiển thị nằm trong principal của phiên; nạp lại để header hiện tên mới ngay. */
    private void refreshSession(AccountPrincipal principal, HttpServletRequest request, HttpServletResponse response) {
        accounts.findById(principal.getId()).ifPresent(account -> {
            var fresh = new AccountPrincipal(account);
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(fresh, null, fresh.getAuthorities()));
            SecurityContextHolder.setContext(context);
            contexts.saveContext(context, request, response);
        });
    }
}
