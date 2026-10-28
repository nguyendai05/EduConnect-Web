package com.educonnect.order.web;

import com.educonnect.order.domain.OrderStatus;
import com.educonnect.order.service.OrderService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class OrderPageController {
    private ObjectProvider<OrderService> services;

    public OrderPageController(ObjectProvider<OrderService> services) { this.services = services; }

    /** Trang lịch sử đơn: lọc theo trạng thái và phân trang. */
    @GetMapping("/order/history")
    public String history(@RequestParam(required = false) OrderStatus status,
                          @RequestParam(defaultValue = "0") int page,
                          @AuthenticationPrincipal AccountPrincipal user, Model model) {
        OrderService service = services.getIfAvailable();
        if (service != null) {
            model.addAttribute("orders", service.history(user, status, page));
            model.addAttribute("status", status);
        }
        return "pages/order/history";
    }
}
