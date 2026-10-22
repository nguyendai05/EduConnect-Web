package com.educonnect.order.web;

import com.educonnect.order.dto.CartDTO;
import com.educonnect.order.service.CartService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller điều hướng trang giỏ hàng và tiếp nhận các API AJAX từ giao diện (HUY-01).
 */
@Controller
public class CartPageController {

    // Sử dụng ObjectProvider để tương thích linh hoạt giữa profile db-dev và ui-preview
    private ObjectProvider<CartService> cartServiceProvider;

    public CartPageController(ObjectProvider<CartService> cartServiceProvider) {
        this.cartServiceProvider = cartServiceProvider;
    }

    /**
     * GET /cart/index: Hiển thị giao diện giỏ hàng của học viên đang đăng nhập.
     */
    @GetMapping("/cart/index")
    public String index(Model model, @AuthenticationPrincipal AccountPrincipal user) {
        CartService cartService = cartServiceProvider.getIfAvailable();
        if (cartService != null && user != null) {
            // Lấy dữ liệu giỏ hàng thật từ database dựa vào ID người dùng đăng nhập
            CartDTO cart = cartService.getCartDTO(user.getId());
            model.addAttribute("cart", cart);
        } else {
            // Trường hợp chưa đăng nhập hoặc chạy preview: trả về giỏ rỗng
            model.addAttribute("cart", new CartDTO());
        }
        return "pages/cart/index";
    }

    /**
     * POST /cart/add: API thêm một khóa học vào giỏ (gọi từ jQuery AJAX hoặc Form).
     */
    @PostMapping("/cart/add")
    @ResponseBody
    public Map<String, Object> addToCart(@RequestParam("offeringId") Long offeringId,
                                         @RequestParam(value = "seats", defaultValue = "1") Integer seats,
                                         @AuthenticationPrincipal AccountPrincipal user) {
        Map<String, Object> response = new HashMap<>();
        CartService cartService = cartServiceProvider.getIfAvailable();
        if (cartService == null) {
            response.put("success", false);
            response.put("message", "Chế độ xem trước không hỗ trợ lưu dữ liệu.");
            return response;
        }
        if (user == null) {
            // Bắt buộc đăng nhập để thêm vào giỏ hàng
            response.put("success", false);
            response.put("message", "Vui lòng đăng nhập để thêm vào giỏ.");
            return response;
        }

        try {
            // Gọi Service lưu vào database
            cartService.addToCart(user.getId(), offeringId, seats);
            response.put("success", true);
            response.put("message", "Đã thêm vào giỏ đăng ký thành công!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    /**
     * POST /cart/remove: API xóa một khóa học khỏi giỏ hàng.
     */
    @PostMapping("/cart/remove")
    @ResponseBody
    public Map<String, Object> removeFromCart(@RequestParam("itemId") Long itemId,
                                              @AuthenticationPrincipal AccountPrincipal user) {
        Map<String, Object> response = new HashMap<>();
        CartService cartService = cartServiceProvider.getIfAvailable();
        if (cartService != null && user != null) {
            // Thực hiện xóa dòng giỏ hàng theo ID
            cartService.removeFromCart(user.getId(), itemId);
            response.put("success", true);
        } else {
            response.put("success", false);
            response.put("message", "Thao tác không hợp lệ.");
        }
        return response;
    }

    /**
     * POST /cart/clear: API xóa sạch toàn bộ các món trong giỏ hàng.
     */
    @PostMapping("/cart/clear")
    @ResponseBody
    public Map<String, Object> clearCart(@AuthenticationPrincipal AccountPrincipal user) {
        Map<String, Object> response = new HashMap<>();
        CartService cartService = cartServiceProvider.getIfAvailable();
        if (cartService != null && user != null) {
            // Xóa sạch toàn bộ các item của người dùng này
            cartService.clearCart(user.getId());
            response.put("success", true);
        } else {
            response.put("success", false);
            response.put("message", "Thao tác không hợp lệ.");
        }
        return response;
    }
}
