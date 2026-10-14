package com.educonnect.payment.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only preview views; no business logic. */
@Controller
public class PaymentPageController {

    @GetMapping("/payment/qr")
    public String qr() {
        return "pages/payment/qr";
    }
}
