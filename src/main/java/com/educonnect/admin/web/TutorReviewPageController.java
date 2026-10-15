package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class TutorReviewPageController {

    @GetMapping("/admin/tutor-review-detail")
    public String tutorReviewDetail() {
        return "pages/admin/tutor-review-detail";
    }

    @GetMapping("/admin/tutor-review-queue")
    public String tutorReviewQueue() {
        return "pages/admin/tutor-review-queue";
    }
}
