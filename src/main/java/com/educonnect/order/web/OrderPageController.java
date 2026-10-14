package com.educonnect.order.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class OrderPageController {

    @GetMapping("/order/history")
    public String history() {
        return "pages/order/history";
    }
}
