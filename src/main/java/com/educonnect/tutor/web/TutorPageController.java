package com.educonnect.tutor.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Hồ sơ riêng do luồng tài khoản quản lý; trang công khai nằm ở controller khám phá. */
@Controller
public class TutorPageController {

    @GetMapping("/tutor/my-profile")
    public String myProfile() {
        return "pages/tutor/my-profile";
    }

}
