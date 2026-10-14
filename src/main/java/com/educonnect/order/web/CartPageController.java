package com.educonnect.order.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class CartPageController {

    @GetMapping("/cart/index")
    public String index() {
        return "pages/cart/index";
    }
}
