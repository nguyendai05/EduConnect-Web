package com.educonnect.lesson.web;

import com.educonnect.lesson.dto.OfferingDetailResponse;
import com.educonnect.lesson.service.CatalogService;
import com.educonnect.lesson.service.OfferingProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.web.PageModelAdvice;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** Tác giả: Trường Đạt. DAT-01: đọc danh sách/chi tiết dịch vụ công khai từ DB. */
@Controller
@Profile("db-dev")
@RequestMapping("/catalog/detail")
public class CatalogPageController {
    private final CatalogService service;

    public CatalogPageController(CatalogService service) {
        this.service = service;
    }

    @GetMapping
    public String detail(@RequestParam(required = false) Long id,
                         @RequestParam(defaultValue = "0") int page,
                         @AuthenticationPrincipal AccountPrincipal principal,
                         Model model, HttpServletResponse response) {
        prepare(model, principal);
        try {
            if (id == null) {
                model.addAttribute("offerings", service.publicPage(page));
                return "pages/catalog/index";
            }
            OfferingDetailResponse detail = service.detail(id);
            model.addAttribute("offering", detail.offering());
            model.addAttribute("detail", detail);
            model.addAttribute("timeSlots", detail.slots());
            model.addAttribute("availableSeats", detail.availableSeats());
            model.addAttribute("issue", detail.registrationIssue());
        } catch (OfferingProblem problem) {
            response.setStatus(problem.getStatus().value());
            model.addAttribute("error", problem.getMessage());
        } catch (DataAccessException unavailable) {
            response.setStatus(503);
            model.addAttribute("error", "Chưa thể tải dữ liệu dịch vụ/lớp. Vui lòng thử lại sau.");
        }
        return "pages/catalog/detail";
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public String invalidParameter(Model model, HttpServletResponse response,
                                   @AuthenticationPrincipal AccountPrincipal principal) {
        prepare(model, principal);
        response.setStatus(400);
        model.addAttribute("error", "Mã dịch vụ hoặc số trang không hợp lệ.");
        return "pages/catalog/detail";
    }

    private void prepare(Model model, AccountPrincipal principal) {
        model.addAttribute("uiPreviewEnabled", false);
        model.addAttribute("authenticationEnabled", true);
        boolean canRegister = principal != null
                && principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER"));
        model.addAttribute("canRegister", canRegister);
        model.addAttribute("currentUser", principal == null ? null : new PageModelAdvice.CurrentUser(
                principal.getId(), principal.getUsername(), principal.getDisplayName(), principal.getHomeUrl()));
    }
}
