package com.educonnect.payment.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class PaymentPageController {

    @GetMapping("/payment/checkout")
    public String checkout() {
        return "pages/payment/checkout";
    }

    @GetMapping("/payment/qr")
    public String qr() {
        return "pages/payment/qr";
    }

    @GetMapping("/payment/result")
    public String result() {
        return "pages/payment/result";
    }
}
