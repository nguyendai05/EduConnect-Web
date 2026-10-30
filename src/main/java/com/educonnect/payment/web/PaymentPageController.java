package com.educonnect.payment.web;

import com.educonnect.payment.service.PaymentService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import java.util.Map;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class PaymentPageController {
    private ObjectProvider<PaymentService> services;

    public PaymentPageController(ObjectProvider<PaymentService> services) { this.services = services; }

    /** Trang thanh toán của một hợp đồng: tổng tiền, phần ví và phần thiếu. */
    @GetMapping("/payment/checkout")
    public String checkout(@RequestParam(value = "contract", required = false) Long contractId,
                           @AuthenticationPrincipal AccountPrincipal user, Model model) {
        PaymentService service = services.getIfAvailable();
        if (service != null && contractId != null) model.addAttribute("payment", service.checkout(user, contractId));
        return "pages/payment/checkout";
    }

    /** Bắt đầu thanh toán rồi chuyển tới trang kết quả. */
    @PostMapping("/payment/start")
    public String start(@RequestParam Long contract, @RequestParam(defaultValue = "false") boolean useWallet,
                        @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        PaymentService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        try {
            Long id = service.start(user, contract, useWallet);
            var summary = service.summary(user, id);
            // Còn phần phải trả qua PayOS thì đi thẳng tới trang thanh toán của PayOS; ví đủ tiền thì tới kết quả.
            if (!summary.isPaid() && summary.payUrl() != null) return "redirect:" + summary.payUrl();
            return "redirect:/payment/" + (summary.isPaid() ? "result" : "qr") + "?payment=" + id;
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
            return "redirect:/payment/checkout?contract=" + contract;
        }
    }

    /** Trang chờ thanh toán: link PayOS và tự chuyển sang kết quả khi đã trả. */
    @GetMapping("/payment/qr")
    public String qr(@RequestParam(value = "payment", required = false) Long paymentId,
                     @AuthenticationPrincipal AccountPrincipal user, Model model) {
        PaymentService service = services.getIfAvailable();
        if (service != null && paymentId != null) model.addAttribute("payment", service.summary(user, paymentId));
        return "pages/payment/qr";
    }

    /** Trạng thái thanh toán dạng JSON để trang QR hỏi định kỳ. */
    @GetMapping("/payment/status")
    @ResponseBody
    public Map<String, String> status(@RequestParam Long payment, @AuthenticationPrincipal AccountPrincipal user) {
        PaymentService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        return service.poll(user, payment);
    }

    /** Trang kết quả thanh toán. */
    @GetMapping("/payment/result")
    public String result(@RequestParam(value = "payment", required = false) Long paymentId,
                         @AuthenticationPrincipal AccountPrincipal user, Model model) {
        PaymentService service = services.getIfAvailable();
        if (service != null && paymentId != null) {
            service.poll(user, paymentId); // vừa quay về từ PayOS: đồng bộ ngay, không chờ webhook
            model.addAttribute("payment", service.summary(user, paymentId));
        }
        return "pages/payment/result";
    }
}
