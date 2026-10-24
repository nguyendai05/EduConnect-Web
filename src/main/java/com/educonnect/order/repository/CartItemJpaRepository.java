package com.educonnect.order.repository;

import com.educonnect.order.domain.CartItem;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
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
     * Lấy các thực thể CartItem kèm Offering để chốt đơn tạo hợp đồng.
     */
    @Query("SELECT i FROM CartItem i JOIN FETCH i.offeringReference o WHERE i.cartId = :cartId")
    List<CartItem> findByCartIdWithOffering(@Param("cartId") Long cartId);

    /**
     * Lấy 1 dòng CartItem cụ thể kèm Offering để tạo hợp đồng đơn lẻ (HUY-02).
     */
    @Query("SELECT i FROM CartItem i JOIN FETCH i.offeringReference o WHERE i.id = :id")
    Optional<CartItem> findByIdWithOffering(@Param("id") Long id);

    @EntityGraph(attributePaths = {"offeringReference.tutorReference.account"})
    @Query("select i from CartItem i where i.cartReference.learnerId = :learnerId order by i.createdAt, i.id")
    List<CartItem> findItemsForLearner(@Param("learnerId") Long learnerId);

    @EntityGraph(attributePaths = {"cartReference", "offeringReference.tutorReference.account"})
    Optional<CartItem> findByIdAndCartReferenceLearnerId(Long id, Long learnerId);

    /** Tìm khóa học đã có trong giỏ để kiểm tra trùng lặp */
    Optional<CartItem> findByCartIdAndOfferingId(Long cartId, Long offeringId);

    /** Xóa toàn bộ các dòng thuộc một giỏ hàng cụ thể */
    void deleteByCartId(Long cartId);
}
