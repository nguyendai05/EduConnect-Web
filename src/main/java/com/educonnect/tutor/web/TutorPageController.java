package com.educonnect.tutor.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class TutorPageController {

    @GetMapping("/tutor/my-profile")
    public String myProfile() {
        return "pages/tutor/my-profile";
    }

    @GetMapping("/tutor/profile")
    public String profile() {
        return "pages/tutor/profile";
    }

    @GetMapping("/tutor/search")
    public String search() {
        return "pages/tutor/search";
    }
}
