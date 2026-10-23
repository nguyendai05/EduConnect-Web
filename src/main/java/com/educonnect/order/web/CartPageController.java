package com.educonnect.order.web;

import com.educonnect.order.dto.CartDTO;
import com.educonnect.order.service.CartService;
import com.educonnect.security.AccountPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class CartPageController {
    private ObjectProvider<CartService> services;

    public CartPageController(ObjectProvider<CartService> services) {
        this.services = services;
    }

    @GetMapping("/cart/index")
    public String index(@AuthenticationPrincipal AccountPrincipal user, Model model) {
        CartService service = services.getIfAvailable();
        model.addAttribute("cart", service == null ? new CartDTO() : service.getCartDTO(user));
        return "pages/cart/index";
    }

    @PostMapping("/cart/add")
    public String add(@RequestParam Long offeringId, @Valid @ModelAttribute CartSelectionForm form,
                      BindingResult errors, @AuthenticationPrincipal AccountPrincipal user,
                      RedirectAttributes redirect) {
        validate(errors);
        service().add(user, offeringId, form.seats(), form.version());
        return success(redirect, "Đã lưu lựa chọn trong danh sách đăng ký");
    }

    @PostMapping("/cart/update")
    public String update(@RequestParam Long itemId, @Valid @ModelAttribute CartSelectionForm form,
                         BindingResult errors, @AuthenticationPrincipal AccountPrincipal user,
                         RedirectAttributes redirect) {
        validate(errors);
        service().update(user, itemId, form.seats(), form.version());
        return success(redirect, "Đã cập nhật số chỗ thành công");
    }

    @PostMapping("/cart/remove")
    public String remove(@RequestParam Long itemId, @AuthenticationPrincipal AccountPrincipal user,
                         RedirectAttributes redirect) {
        service().remove(user, itemId);
        return success(redirect, "Lựa chọn đã được xóa khỏi danh sách");
    }

    @PostMapping("/cart/clear")
    public String clear(@AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        service().clear(user);
        return success(redirect, "Đã xóa toàn bộ danh sách đăng ký");
    }

    @PostMapping("/cart/check")
    public String check(@RequestParam(value = "cartItemId", required = false) Long cartItemId,
                        @AuthenticationPrincipal AccountPrincipal user,
                        RedirectAttributes redirect) {
        if (cartItemId != null) {
            service().checkItem(user, cartItemId);
            return "redirect:/contract/confirm?cartItemId=" + cartItemId;
        }
        CartDTO cart = service().getCartDTO(user);
        if (!cart.isEmpty()) {
            service().checkItem(user, cart.items().get(0).id());
            return "redirect:/contract/confirm?cartItemId=" + cart.items().get(0).id();
        }
        throw new IllegalArgumentException("Danh sách đăng ký đang trống");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public String invalidSelection(IllegalArgumentException error, RedirectAttributes redirect) {
        redirect.addFlashAttribute("error", error.getMessage());
        return "redirect:/cart/index";
    }

    private void validate(BindingResult errors) {
        if (errors.hasErrors()) {
            String defaultMessage = errors.getAllErrors().isEmpty() ? "Dữ liệu không hợp lệ" : errors.getAllErrors().get(0).getDefaultMessage();
            throw new IllegalArgumentException(defaultMessage);
        }
    }

    private CartService service() {
        CartService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        return service;
    }

    private String success(RedirectAttributes redirect, String message) {
        redirect.addFlashAttribute("message", message);
        return "redirect:/cart/index";
    }
}
