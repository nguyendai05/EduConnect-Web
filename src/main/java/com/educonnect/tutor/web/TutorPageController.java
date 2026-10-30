package com.educonnect.tutor.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class TutorPageController {

    @GetMapping("/tutor/search")
    public String search() {
        return "pages/tutor/search";
    }
}
