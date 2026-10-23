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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
     * GET /contract/confirm: Hiển thị dự thảo hợp đồng thật từ Entity đẩy ra Thymeleaf Model.
     */
    @GetMapping("/contract/confirm")
    public String confirm(@RequestParam(value = "contract", required = false) Long contractId,
                          @RequestParam(value = "cartItemId", required = false) Long cartItemId,
                          @AuthenticationPrincipal AccountPrincipal user, Model model,
                          RedirectAttributes redirect) {
        ContractService service = contractServiceProvider.getIfAvailable();
        if (service == null || user == null) return "redirect:/auth/login";

        // 1. Nếu có cartItemId: tạo hợp đồng cho đúng khóa học được chọn trong giỏ
        if (cartItemId != null) {
            try {
                Long newContractId = service.createContractFromCartItem(user.getId(), cartItemId);
                return "redirect:/contract/confirm?contract=" + newContractId;
            } catch (Exception e) {
                redirect.addFlashAttribute("error", e.getMessage());
                return "redirect:/cart/index";
            }
        }

        // 2. Nếu có contractId: hiển thị hợp đồng đó
        if (contractId != null) {
            Optional<Contract> contract = service.getContract(contractId);
            if (contract.isPresent() && contract.get().getLearnerId().equals(user.getId())) {
                model.addAttribute("contract", contract.get());
                return "pages/contract/confirm";
            }
        }

        // 3. Fallback: lấy hợp đồng gần nhất nếu không có tham số
        Optional<Contract> latest = service.getLatestContract(user.getId());
        if (latest.isPresent()) {
            model.addAttribute("contract", latest.get());
            return "pages/contract/confirm";
        }

        return "redirect:/cart/index";
    }

    /**
     * POST /contract/create: Tiếp nhận yêu cầu chốt giỏ hàng tạo hợp đồng cho 1 khóa học được chọn (HUY-02).
     */
    @PostMapping("/contract/create")
    public String createFromCart(@RequestParam(value = "cartItemId", required = false) Long cartItemId,
                                 @AuthenticationPrincipal AccountPrincipal user,
                                 RedirectAttributes redirect) {
        ContractService contractService = contractServiceProvider.getIfAvailable();
        if (contractService == null || user == null) {
            return "redirect:/auth/login";
        }
        try {
            Long contractId = contractService.createContractFromCartItem(user.getId(), cartItemId);
            return "redirect:/contract/confirm?contract=" + contractId;
        } catch (Exception e) {
            redirect.addFlashAttribute("error", e.getMessage());
            return "redirect:/cart/index";
        }
    }

    /**
     * POST /contract/sign: Học viên xác nhận ký hợp đồng điện tử và chuyển sang thanh toán ký quỹ (HUY-02 -> HUY-03).
     */
    @PostMapping("/contract/sign")
    public String signContract(@RequestParam Long contractId,
                               @AuthenticationPrincipal AccountPrincipal user,
                               RedirectAttributes redirect) {
        ContractService service = contractServiceProvider.getIfAvailable();
        if (service == null || user == null) return "redirect:/auth/login";
        try {
            service.signContract(user.getId(), contractId);
            // Sau khi ký thành công -> Chuyển sang thanh toán ký quỹ PayOS (HUY-03)
            return "redirect:/payment/checkout?contract=" + contractId;
        } catch (Exception e) {
            redirect.addFlashAttribute("error", e.getMessage());
            return "redirect:/contract/confirm?contract=" + contractId;
        }
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
