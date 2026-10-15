package com.educonnect.wallet.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** GET-only page routes; no business logic. */
@Controller
public class WalletPageController {

    @GetMapping("/wallet/overview")
    public String overview() {
        return "pages/wallet/overview";
    }
}
