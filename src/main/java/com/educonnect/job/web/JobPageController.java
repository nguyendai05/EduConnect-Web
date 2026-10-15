package com.educonnect.job.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class JobPageController {

    @GetMapping("/job/applicants")
    public String applicants() {
        return "pages/job/applicants";
    }

    @GetMapping("/job/create")
    public String create() {
        return "pages/job/create";
    }

    @GetMapping("/job/detail")
    public String detail() {
        return "pages/job/detail";
    }

    @GetMapping("/job/discover")
    public String discover() {
        return "pages/job/discover";
    }

    @GetMapping("/job/my-job")
    public String myJob() {
        return "pages/job/my-job";
    }
}
