package com.educonnect.order.web;

import com.educonnect.order.domain.OrderStatus;
import com.educonnect.order.domain.RegistrationSourceKind;
import com.educonnect.order.service.OrderService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
public class OrderPageController {
    private ObjectProvider<OrderService> services;

    public OrderPageController(ObjectProvider<OrderService> services) { this.services = services; }

    /** Trang lịch sử đơn: thống kê, tab trạng thái, tìm kiếm, lọc nguồn và ngày, sắp xếp, phân trang. */
    @GetMapping("/order/history")
    public String history(@RequestParam(required = false) OrderStatus status,
                          @RequestParam(required = false) String q,
                          @RequestParam(required = false) RegistrationSourceKind source,
                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                          @RequestParam(defaultValue = "newest") String sort,
                          @RequestParam(defaultValue = "0") int page,
                          @AuthenticationPrincipal AccountPrincipal user, Model model) {
        OrderService service = services.getIfAvailable();
        if (service != null) {
            model.addAttribute("history", service.history(user, status, q, source, from, to, sort.equals("oldest"), page));
            model.addAttribute("status", status);
            model.addAttribute("q", q);
            model.addAttribute("source", source);
            model.addAttribute("from", from);
            model.addAttribute("to", to);
            model.addAttribute("sort", sort);
        }
        return "pages/order/history";
    }
}
