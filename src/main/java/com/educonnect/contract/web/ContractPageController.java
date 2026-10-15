package com.educonnect.contract.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class ContractPageController {

    @GetMapping("/contract/confirm")
    public String confirm() {
        return "pages/contract/confirm";
    }

    @GetMapping("/contract/student-detail")
    public String studentDetail() {
        return "pages/contract/student-detail";
    }

    @GetMapping("/contract/tutor-detail")
    public String tutorDetail() {
        return "pages/contract/tutor-detail";
    }
}
