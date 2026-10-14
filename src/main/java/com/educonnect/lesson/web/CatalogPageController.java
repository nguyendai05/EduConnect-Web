package com.educonnect.lesson.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class CatalogPageController {

    @GetMapping("/catalog/detail")
    public String detail() {
        return "pages/catalog/detail";
    }
}
