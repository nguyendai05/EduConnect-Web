package com.educonnect.order.dto;

import com.educonnect.lesson.domain.OfferingType;

import java.math.BigDecimal;

/**
 * DTO đại diện cho một khóa học / lớp học trong giỏ hàng (Java Record).
 * Chứa sẵn các phương thức tính toán và hiển thị cho giao diện.
 */
public record CartItemDTO(
        Long id,
        Long offeringId,
        String title,
        String tutorName,
        OfferingType offeringType,
        BigDecimal unitPrice,
        Short sessionCount,
        Short durationMinutes,
        Integer seatCount,
        String termsText
) {
    /**
     * Tạm tính tiền cho dòng này: đơn giá × số chỗ đăng ký.
     */
    public BigDecimal totalPrice() {
        if (unitPrice == null) return BigDecimal.ZERO;
        // Đơn giá nhân với số chỗ (mặc định ít nhất 1 chỗ)
        return unitPrice.multiply(BigDecimal.valueOf(seatCount != null ? seatCount : 1));
    }

    public BigDecimal getTotalPrice() {
        return totalPrice();
    }

    /**
     * Nhãn loại hình học hiển thị tiếng Việt trên giao diện.
     */
    public String getOfferingTypeLabel() {
        return offeringType == OfferingType.GROUP_CLASS ? "Lớp nhóm" : "1 kèm 1";
    }

    /**
     * Tóm tắt lịch học hiển thị trên thẻ khóa học.
     */
    public String getSchedule() {
        return "Lịch thỏa thuận linh hoạt";
    }
}
