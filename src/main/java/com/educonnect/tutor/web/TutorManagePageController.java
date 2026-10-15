package com.educonnect.tutor.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class TutorManagePageController {

    @GetMapping("/tutor/manage")
    public String manage() {
        return "pages/tutor/manage";
    }
}
