package com.educonnect.order.dto;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

/**
 * DTO tổng quan giỏ hàng chứa danh sách các khóa học và các chỉ số tổng hợp.
 */
public record CartDTO(Long learnerId, List<CartItemDTO> items) {

    /** Khởi tạo giỏ hàng rỗng */
    public CartDTO() {
        this(null, Collections.emptyList());
    }

    /** Kiểm tra giỏ hàng có trống hay không */
    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }

    /** Tổng số lượng khóa học khác nhau trong giỏ */
    public int totalItems() {
        return items != null ? items.size() : 0;
    }

    /** Tổng số chỗ học viên đăng ký trên toàn bộ các khóa học */
    public int totalSeats() {
        if (items == null || items.isEmpty()) return 0;
        int seats = 0;
        for (CartItemDTO item : items) {
            seats += (item.seatCount() != null ? item.seatCount() : 1);
        }
        return seats;
    }

    /** Tổng số tiền tạm tính của toàn bộ giỏ hàng */
    public BigDecimal totalAmount() {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = BigDecimal.ZERO;
        for (CartItemDTO item : items) {
            sum = sum.add(item.totalPrice());
        }
        return sum;
    }
}
