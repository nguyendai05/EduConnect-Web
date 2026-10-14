package com.educonnect.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only preview views; no business logic. */
@Controller
public class HomePageController {

    @GetMapping({"/", "/home"})
    public String home() {
        return "pages/home";
    }
}
