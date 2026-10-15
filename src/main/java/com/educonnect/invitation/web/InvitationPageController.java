package com.educonnect.invitation.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class InvitationPageController {

    @GetMapping("/invitation/create")
    public String create() {
        return "pages/invitation/create";
    }

    @GetMapping("/invitation/negotiation")
    public String negotiation() {
        return "pages/invitation/negotiation";
    }
}
