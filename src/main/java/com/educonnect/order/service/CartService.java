package com.educonnect.order.service;

import com.educonnect.order.domain.Cart;
import com.educonnect.order.domain.CartItem;
import com.educonnect.order.dto.CartDTO;
import com.educonnect.order.dto.CartItemDTO;
import com.educonnect.order.repository.CartJpaRepository;
import com.educonnect.order.repository.CartItemJpaRepository;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.service.CatalogService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.domain.LearnerProfile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.List;

@Service
@Profile("db-dev")
@Transactional
public class CartService {
    private CartJpaRepository carts;
    private CartItemJpaRepository items;
    private CatalogService catalog;
    private EntityManager entityManager;

    public CartService(CartJpaRepository carts, CartItemJpaRepository items,
                       CatalogService catalog, EntityManager entityManager) {
        this.carts = carts;
        this.items = items;
        this.catalog = catalog;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public CartDTO getCartDTO(AccountPrincipal user) {
        Long learnerId = learnerId(user);
        List<CartItemDTO> rows = items.findItemsForLearner(learnerId).stream()
                .map(item -> CartItemDTO.from(item,
                        catalog.registrationIssue(item.getOfferingReference(), item.getSeatCount())))
                .toList();
        return new CartDTO(learnerId, rows);
    }

    public void add(AccountPrincipal user, Long offeringId, int seats, Long version) {
        Long learnerId = lockLearner(user);
        Offering offering = checkedOffering(learnerId, offeringId, seats, version);
        Cart cart = carts.findByLearnerId(learnerId).orElseGet(() -> {
            Cart created = Cart.create();
            created.setLearnerId(learnerId);
            created.setUpdatedAt(Instant.now());
            return carts.save(created);
        });
        // Thêm lại cùng dịch vụ không cộng dồn số chỗ hoặc tạo dòng trùng
        if (items.findByCartIdAndOfferingId(cart.getId(), offeringId).isPresent()) return;
        CartItem item = CartItem.create();
        item.setCartId(cart.getId());
        item.setOfferingId(offeringId);
        item.setSeatCount(seats);
        item.setOfferingVersionSeen(offering.getVersion());
        item.setCreatedAt(Instant.now());
        items.save(item);
        cart.setUpdatedAt(Instant.now());
    }

    public void update(AccountPrincipal user, Long itemId, int seats, Long version) {
        Long learnerId = lockLearner(user);
        CartItem item = ownItem(itemId, learnerId);
        Offering offering = checkedOffering(learnerId, item.getOfferingId(), seats, version);
        item.setSeatCount(seats);
        item.setOfferingVersionSeen(offering.getVersion());
        item.getCartReference().setUpdatedAt(Instant.now());
    }

    public void remove(AccountPrincipal user, Long itemId) {
        Long learnerId = lockLearner(user);
        items.findByIdAndCartReferenceLearnerId(itemId, learnerId).ifPresent(item -> {
            item.getCartReference().setUpdatedAt(Instant.now());
            items.delete(item);
        });
    }

    public void clear(AccountPrincipal user) {
        Long learnerId = lockLearner(user);
        carts.findByLearnerId(learnerId).ifPresent(cart -> {
            items.deleteByCartId(cart.getId());
            cart.setUpdatedAt(Instant.now());
        });
    }

    /** Kiểm tra hợp lệ riêng cho 1 khóa học được chọn để ký hợp đồng */
    @Transactional(readOnly = true)
    public void checkItem(AccountPrincipal user, Long cartItemId) {
        CartItem item = ownItem(cartItemId, learnerId(user));
        checkedOffering(user.getId(), item.getOfferingId(), item.getSeatCount(), item.getOfferingVersionSeen());
    }

    private CartItem ownItem(Long itemId, Long learnerId) {
        return items.findByIdAndCartReferenceLearnerId(itemId, learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Lựa chọn không còn trong danh sách của bạn"));
    }

    private Offering checkedOffering(Long learnerId, Long id, int seats, Long version) {
        Offering offering = catalog.getPublicOffering(id);
        if (learnerId.equals(offering.getTutorId())) throw new IllegalArgumentException("Không thể đăng ký dịch vụ của chính mình");
        if (version == null || !offering.getVersion().equals(version)) {
            throw new IllegalArgumentException("Thông tin dịch vụ đã thay đổi, vui lòng mở lại chi tiết");
        }
        String issue = catalog.registrationIssue(offering, seats);
        if (issue != null) throw new IllegalArgumentException(issue);
        return offering;
    }

    private Long learnerId(AccountPrincipal user) {
        if (user == null || !user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vui lòng đăng nhập bằng tài khoản người học");
        }
        return user.getId();
    }

    private Long lockLearner(AccountPrincipal user) {
        Long id = learnerId(user);
        // Khóa bản ghi có sẵn để hai yêu cầu đầu tiên không tạo hai cart
        if (entityManager.find(LearnerProfile.class, id, LockModeType.PESSIMISTIC_WRITE) == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không tìm thấy hồ sơ người học");
        }
        return id;
    }
}
