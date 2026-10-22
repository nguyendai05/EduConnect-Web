package com.educonnect.order.service;

import com.educonnect.order.domain.Cart;
import com.educonnect.order.domain.CartItem;
import com.educonnect.order.dto.CartDTO;
import com.educonnect.order.repository.CartItemJpaRepository;
import com.educonnect.order.repository.CartJpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service xử lý toàn bộ nghiệp vụ giỏ hàng (HUY-01 / BB06).
 * Quản lý thêm, xóa, làm rỗng giỏ và hiển thị dữ liệu cho học viên.
 */
@Service
@Profile("db-dev")
@Transactional
public class CartService {

    private CartJpaRepository cartRepo;
    private CartItemJpaRepository cartItemRepo;

    public CartService(CartJpaRepository cartRepo, CartItemJpaRepository cartItemRepo) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
    }

    /**
     * Lấy thực thể giỏ hàng của học viên. Nếu chưa từng có giỏ thì tự động tạo mới.
     */
    public Cart getOrCreateCart(Long learnerId) {
        return cartRepo.findByLearnerId(learnerId).orElseGet(() -> {
            Cart cart = Cart.create();
            cart.setLearnerId(learnerId);
            cart.setUpdatedAt(Instant.now());
            // Tạo giỏ mới trong CSDL cho học viên lần đầu sử dụng
            return cartRepo.save(cart);
        });
    }

    /**
     * Lấy thông tin giỏ hàng đầy đủ dạng DTO để hiển thị lên giao diện Thymeleaf.
     */
    @Transactional(readOnly = true)
    public CartDTO getCartDTO(Long learnerId) {
        // Gọi query xuyên bảng: Database tự động join và map thẳng sang DTO trong 1 query duy nhất
        return new CartDTO(learnerId, cartItemRepo.findCartItemDtosByLearnerId(learnerId));
    }

    /**
     * Thêm một khóa học vào giỏ hàng.
     * Nếu khóa học đã có trong giỏ thì cộng dồn số chỗ; nếu chưa có thì tạo mới dòng giỏ hàng.
     */
    public void addToCart(Long learnerId, Long offeringId, Integer seats) {
        Cart cart = getOrCreateCart(learnerId);
        int seatCount = (seats != null && seats > 0) ? seats : 1;

        // Tìm món trong giỏ, nếu chưa có thì khởi tạo bản ghi CartItem mới
        CartItem item = cartItemRepo.findByCartIdAndOfferingId(cart.getId(), offeringId)
                .orElseGet(() -> {
                    CartItem ci = CartItem.create();
                    ci.setCartId(cart.getId());
                    ci.setOfferingId(offeringId);
                    ci.setSeatCount(0);
                    ci.setOfferingVersionSeen(1L);
                    ci.setCreatedAt(Instant.now());
                    return ci;
                });

        // Tăng số chỗ đăng ký theo số lượng người học chọn
        item.setSeatCount(item.getSeatCount() + seatCount);
        // Spring Data JPA tự động phân biệt: INSERT nếu là món mới, UPDATE nếu là món đã có
        cartItemRepo.save(item);
    }

    /**
     * Xóa một khóa học cụ thể ra khỏi giỏ hàng theo ID dòng giỏ hàng.
     */
    public void removeFromCart(Long learnerId, Long cartItemId) {
        // Xóa nhanh trực tiếp bằng khóa chính JPA
        cartItemRepo.deleteById(cartItemId);
    }

    /**
     * Xóa sạch toàn bộ các khóa học đang có trong giỏ của học viên.
     */
    public void clearCart(Long learnerId) {
        Cart cart = getOrCreateCart(learnerId);
        // Xóa tất cả các dòng CartItem thuộc về cartId này
        cartItemRepo.deleteByCartId(cart.getId());
    }
}
