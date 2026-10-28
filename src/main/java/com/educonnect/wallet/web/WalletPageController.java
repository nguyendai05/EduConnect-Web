package com.educonnect.wallet.web;

import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.service.WalletService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WalletPageController {
    private ObjectProvider<WalletService> services;

    public WalletPageController(ObjectProvider<WalletService> services) { this.services = services; }

    /** Trang ví: số dư và lịch sử biến động có phân trang. */
    @GetMapping("/wallet/overview")
    public String overview(@RequestParam(defaultValue = "0") int page,
                           @AuthenticationPrincipal AccountPrincipal user, Model model) {
        WalletService service = services.getIfAvailable();
        if (service != null) model.addAttribute("wallet", service.overview(user, page));
        return "pages/wallet/overview";
    }
}
