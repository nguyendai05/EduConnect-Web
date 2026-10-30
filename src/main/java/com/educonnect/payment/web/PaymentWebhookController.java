package com.educonnect.payment.web;

import com.educonnect.payment.service.PaymentService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Điểm nhận webhook PayOS (công khai, không CSRF; bảo vệ bằng chữ ký). */
@RestController
public class PaymentWebhookController {
    private ObjectProvider<PaymentService> services;

    public PaymentWebhookController(ObjectProvider<PaymentService> services) { this.services = services; }

    /** PayOS gọi khi có kết quả thanh toán; luôn trả 200 nếu chữ ký đúng, kể cả sự kiện lặp. */
    @PostMapping("/payment/webhook")
    public ResponseEntity<Map<String, Boolean>> webhook(@RequestBody String body) {
        PaymentService service = services.getIfAvailable();
        if (service == null) return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        boolean ok = service.handleWebhook(body);
        return ResponseEntity.status(ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(Map.of("success", ok));
    }
}
