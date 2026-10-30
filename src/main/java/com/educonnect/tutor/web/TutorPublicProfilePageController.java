package com.educonnect.tutor.web;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.tutor.service.PublicTutorProfileService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** DAI-02: trang hồ sơ công khai của gia sư (/tutor/profile?id=), dùng dữ liệu thật; ai cũng xem được. */
@Controller
@Profile("db-dev")
public class TutorPublicProfilePageController {
    private final PublicTutorProfileService service;

    public TutorPublicProfilePageController(PublicTutorProfileService service) {
        this.service = service;
    }

    @GetMapping("/tutor/profile")
    public String profile(@RequestParam(required = false) Long id, @RequestParam(defaultValue = "0") int page,
                          Model model, HttpServletResponse response) {
        if (id == null) {
            response.setStatus(404);
            return "pages/tutor/profile";
        }
        try {
            model.addAttribute("tutor", service.profile(id, page));
        } catch (ServiceProblem problem) {
            response.setStatus(problem.getStatus().value());
        }
        return "pages/tutor/profile";
    }
}
