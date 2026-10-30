package com.educonnect.tutor.web;

import com.educonnect.lesson.service.OfferingProblem;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.web.PageModelAdvice;
import com.educonnect.tutor.dto.TutorSearchRequest;
import com.educonnect.tutor.service.TutorDiscoveryService;
import com.educonnect.tutor.service.PublicTutorProfileService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** DAT-02/DAI-02: tìm kiếm và hồ sơ gia sư công khai, mỗi URL có một handler khi chạy DB. */
@Controller
@Profile("db-dev")
public class TutorDiscoveryPageController {
    private final TutorDiscoveryService tutors;
    private final PublicTutorProfileService profiles;

    public TutorDiscoveryPageController(TutorDiscoveryService tutors, PublicTutorProfileService profiles) {
        this.tutors = tutors;
        this.profiles = profiles;
    }

    @ModelAttribute
    void presentation(Model model, @AuthenticationPrincipal AccountPrincipal principal) {
        model.addAttribute("uiPreviewEnabled", false);
        model.addAttribute("authenticationEnabled", true);
        model.addAttribute("currentUser", principal == null ? null : new PageModelAdvice.CurrentUser(
                principal.getId(), principal.getUsername(), principal.getDisplayName(), principal.getHomeUrl()));
    }

    @GetMapping("/tutor/search")
    public String search(@Valid @ModelAttribute("search") TutorSearchRequest request, BindingResult errors,
                         Model model, HttpServletResponse response) {
        try {
            model.addAttribute("options", tutors.options());
            if (errors.hasErrors()) {
                response.setStatus(400);
                model.addAttribute("pageError", "Bộ lọc không hợp lệ. Kiểm tra khoảng học phí, ngày giờ và số trang.");
            } else {
                model.addAttribute("discovery", tutors.search(request));
            }
        } catch (OfferingProblem problem) {
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
        } catch (DataAccessException unavailable) {
            response.setStatus(503);
            model.addAttribute("pageError", "Chưa thể tải danh sách gia sư. Vui lòng thử lại sau.");
        }
        return "pages/tutor/search";
    }

    @GetMapping("/tutor/profile")
    public String profile(@RequestParam(required = false) Long id,
                          @RequestParam(defaultValue = "0") int page,
                          Model model, HttpServletResponse response) {
        if (id == null) {
            response.setStatus(404);
            return "pages/tutor/profile";
        }
        try {
            model.addAttribute("tutor", profiles.profile(id, page));
        } catch (ServiceProblem problem) {
            response.setStatus(problem.getStatus().value());
            model.addAttribute("pageError", problem.getMessage());
        } catch (DataAccessException unavailable) {
            response.setStatus(503);
            model.addAttribute("pageError", "Chưa thể tải hồ sơ gia sư. Vui lòng thử lại sau.");
        }
        return "pages/tutor/profile";
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public String invalidParameter(Model model, HttpServletResponse response,
                                   @AuthenticationPrincipal AccountPrincipal principal) {
        presentation(model, principal);
        model.addAttribute("pageError", "Mã gia sư hoặc số trang không hợp lệ.");
        response.setStatus(400);
        return "pages/tutor/profile";
    }
}
