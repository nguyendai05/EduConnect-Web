package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class JobReviewPageController {

    @GetMapping("/admin/job-review-detail")
    public String jobReviewDetail() {
        return "pages/admin/job-review-detail";
    }

    @GetMapping("/admin/job-review-queue")
    public String jobReviewQueue() {
        return "pages/admin/job-review-queue";
    }
}
