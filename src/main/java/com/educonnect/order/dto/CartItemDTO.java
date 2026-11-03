package com.educonnect.order.dto;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.order.domain.CartItem;
import java.math.BigDecimal;

public record CartItemDTO(
        Long id, // ID mục trong giỏ hàng.
        Long offeringId, // ID dịch vụ hoặc lớp học.
        String title, // Tiêu đề hiển thị.
        String tutorName, // Tên hiển thị của gia sư.
        OfferingType offeringType, // Loại dịch vụ: dạy kèm 1-1 hoặc lớp nhóm.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        Short sessionCount, // Tổng số buổi học.
        Short durationMinutes, // Thời lượng mỗi buổi học, tính bằng phút.
        Integer seatCount, // Số chỗ học đăng ký trong hợp đồng hoặc giỏ hàng.
        String termsText, // Nội dung điều khoản học.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        boolean changed, // Cho biết dịch vụ đã thay đổi so với lúc thêm vào giỏ hay không.
        String issue // Lý do mục trong giỏ hàng chưa thể tiếp tục đăng ký.
) {
    public static CartItemDTO from(CartItem item, String issue) {
        Offering offering = item.getOfferingReference();
        return new CartItemDTO(item.getId(), offering.getId(), offering.getTitle(),
                offering.getTutorReference().getAccount().getDisplayName(), offering.getOfferingType(),
                offering.getUnitPrice(), offering.getSessionCount(), offering.getDurationMinutes(),
                item.getSeatCount(), offering.getTermsText(), offering.getVersion(),
                !offering.getVersion().equals(item.getOfferingVersionSeen()), issue);
    }

    public BigDecimal totalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(sessionCount)).multiply(BigDecimal.valueOf(seatCount));
    }

    public BigDecimal getTotalPrice() { return totalPrice(); }

    public String getOfferingTypeLabel() {
        return offeringType == OfferingType.GROUP_CLASS ? "Lớp nhóm" : "Dạy kèm 1-1";
    }
}
