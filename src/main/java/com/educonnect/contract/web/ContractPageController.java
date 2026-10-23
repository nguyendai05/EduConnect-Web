package com.educonnect.contract.web;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.service.ContractService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

/**
 * Controller điều phối hiển thị và xác nhận hợp đồng (HUY-02 / Chặng 2).
 */
@Controller
public class ContractPageController {

    private ObjectProvider<ContractService> contractServiceProvider;

    public ContractPageController(ObjectProvider<ContractService> contractServiceProvider) {
        this.contractServiceProvider = contractServiceProvider;
    }

    /**
     * GET /contract/confirm: Hiển thị hợp đồng thật từ Entity đẩy thẳng ra Thymeleaf Model.
     */
    @GetMapping("/contract/confirm")
    public String confirm(@RequestParam(value = "contract", required = false) Long contractId,
                          @RequestParam(value = "cartItemId", required = false) Long cartItemId,
                          @AuthenticationPrincipal AccountPrincipal user,
                          Model model) {
        ContractService contractService = contractServiceProvider.getIfAvailable();
        if (contractService == null || user == null) {
            return "pages/contract/confirm";
        }

        // 1. Nếu có ID hợp đồng: lấy đúng hợp đồng đó
        if (contractId != null) {
            Optional<Contract> contractOpt = contractService.getContract(contractId);
            contractOpt.ifPresent(c -> model.addAttribute("contract", c));
            return "pages/contract/confirm";
        }

        // 2. Tạo hợp đồng cho đúng khóa học được chọn trong giỏ (HUY-02)
        try {
            Long newContractId = contractService.createContractFromCartItem(user.getId(), cartItemId);
            if (newContractId != null) {
                return "redirect:/contract/confirm?contract=" + newContractId;
            }
        } catch (Exception ignored) {
            // Giỏ trống hoặc lỗi thì tìm hợp đồng gần nhất
        }

        // 3. Tìm hợp đồng gần nhất của người dùng
        Optional<Contract> latest = contractService.getLatestContract(user.getId());
        if (latest.isPresent()) {
            model.addAttribute("contract", latest.get());
        } else {
            return "redirect:/cart/index";
        }

        return "pages/contract/confirm";
    }

    /**
     * POST /contract/create: Tiếp nhận yêu cầu chốt giỏ hàng tạo hợp đồng.
     */
    @PostMapping("/contract/create")
    public String createFromCart(@AuthenticationPrincipal AccountPrincipal user) {
        ContractService contractService = contractServiceProvider.getIfAvailable();
        if (contractService != null && user != null) {
            try {
                Long contractId = contractService.createContractFromCart(user.getId());
                return "redirect:/contract/confirm?contract=" + contractId;
            } catch (Exception e) {
                return "redirect:/cart/index?error=" + e.getMessage();
            }
        }
        return "redirect:/auth/login";
    }

    @GetMapping("/contract/student-detail")
    public String studentDetail() {
        return "pages/contract/student-detail";
    }

    @GetMapping("/contract/tutor-detail")
    public String tutorDetail() {
        return "pages/contract/tutor-detail";
    }
}
