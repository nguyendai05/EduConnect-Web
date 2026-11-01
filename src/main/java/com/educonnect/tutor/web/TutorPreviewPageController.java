package com.educonnect.tutor.web;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Các trang tham chiếu chỉ dùng khi không chạy profile dữ liệu thật. */
@Controller
@Profile("!db-dev")
public class TutorPreviewPageController {
    @GetMapping("/tutor/search")
    public String search() { return "pages/tutor/search"; }

    @GetMapping("/tutor/profile")
    public String profile() { return "pages/tutor/profile"; }
}
