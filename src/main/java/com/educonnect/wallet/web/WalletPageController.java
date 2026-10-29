package com.educonnect.wallet.web;

import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.service.WalletService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
public class WalletPageController {
    private ObjectProvider<WalletService> services;

    public WalletPageController(ObjectProvider<WalletService> services) { this.services = services; }

    /** Trang ví: số dư, hợp đồng liên quan và lịch sử biến động lọc theo loại, khoảng ngày, có phân trang. */
    @GetMapping("/wallet/overview")
    public String overview(@RequestParam(defaultValue = "all") String type,
                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                           @RequestParam(defaultValue = "0") int page,
                           @AuthenticationPrincipal AccountPrincipal user, Model model) {
        WalletService service = services.getIfAvailable();
        if (service != null) {
            model.addAttribute("wallet", service.overview(user, type, from, to, page));
            model.addAttribute("type", type);
            model.addAttribute("from", from);
            model.addAttribute("to", to);
        }
        return "pages/wallet/overview";
    }
}
