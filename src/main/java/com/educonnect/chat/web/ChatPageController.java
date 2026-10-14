package com.educonnect.chat.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class ChatPageController {

    @GetMapping("/chat/messages")
    public String messages() {
        return "pages/chat/messages";
    }
}
