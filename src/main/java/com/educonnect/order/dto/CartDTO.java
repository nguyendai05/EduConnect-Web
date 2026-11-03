package com.educonnect.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDTO(
        Long learnerId, // ID tài khoản học viên.
        List<CartItemDTO> items // Danh sách mục dịch vụ hoặc lớp trong giỏ hàng.
) {
    public CartDTO() { this(null, List.of()); }

    public boolean isEmpty() { return items.isEmpty(); }

    public int totalItems() { return items.size(); }

    public long totalSeats() {
        return items.stream().mapToLong(CartItemDTO::seatCount).sum();
    }

    public BigDecimal totalAmount() {
        return items.stream().map(CartItemDTO::totalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
