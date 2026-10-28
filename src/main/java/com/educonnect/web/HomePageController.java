package com.educonnect.web;

import com.educonnect.tutor.service.TutorDiscoveryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

/**
 * Tác giả: Trường Đạt. DAT-02: trang chủ hiển thị dịch vụ công khai từ DB qua Service.
 */
@Controller
@Profile("db-dev")
public class HomePageController {

    private final TutorDiscoveryService service;

    public HomePageController(TutorDiscoveryService service) {
        this.service = service;
    }

    /**
     * GET / hoặc /home: Hiển thị tối đa 6 dịch vụ/lớp đang nhận đăng ký.
     */
    @GetMapping({"/", "/home"})
    public String home(Model model, HttpServletResponse response) {
        model.addAttribute("uiPreviewEnabled", false);
        try {
            model.addAttribute("offerings", service.homeOfferings());
        } catch (DataAccessException unavailable) {
            response.setStatus(503);
            model.addAttribute("offerings", List.of());
            model.addAttribute("pageError", "Chưa thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
        }
        return "pages/home";
    }
}
