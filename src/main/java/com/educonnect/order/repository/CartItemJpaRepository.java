package com.educonnect.order.repository;

import com.educonnect.order.domain.CartItem;
import com.educonnect.order.dto.CartItemDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA quản lý các mục trong giỏ hàng (bảng cart_items).
 */
@Profile("db-dev")
public interface CartItemJpaRepository extends JpaRepository<CartItem, Long> {

    /**
     * Dùng JPA Constructor Expression (SELECT new ...) để:
     * 1. Query xuyên bảng: từ CartItem -> Cart -> lấy theo learnerId.
     * 2. Join lấy thông tin khóa học (Offering) và tên gia sư (UserAccount).
     * 3. Database tự động đóng gói thẳng vào CartItemDTO trong 1 câu SQL duy nhất.
     */
    @Query("SELECT new com.educonnect.order.dto.CartItemDTO(" +
           "i.id, o.id, o.title, COALESCE(u.displayName, 'Gia sư EduConnect'), " +
           "o.offeringType, o.unitPrice, o.sessionCount, o.durationMinutes, i.seatCount, o.termsText) " +
           "FROM CartItem i " +
           "JOIN i.offeringReference o " +
           "JOIN i.cartReference c " +
           "LEFT JOIN o.tutorReference t " +
           "LEFT JOIN t.account u " +
           "WHERE c.learnerId = :learnerId")
    List<CartItemDTO> findCartItemDtosByLearnerId(@Param("learnerId") Long learnerId);

    /** Tìm khóa học đã có trong giỏ để kiểm tra trùng lặp */
    Optional<CartItem> findByCartIdAndOfferingId(Long cartId, Long offeringId);

    /** Xóa toàn bộ các dòng thuộc một giỏ hàng cụ thể */
    void deleteByCartId(Long cartId);
}
