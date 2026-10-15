package com.educonnect.admin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class PayoutPageController {

    @GetMapping("/admin/payout-request-detail")
    public String payoutRequestDetail() {
        return "pages/admin/payout-request-detail";
    }

    @GetMapping("/admin/payout-requests")
    public String payoutRequests() {
        return "pages/admin/payout-requests";
    }
}
