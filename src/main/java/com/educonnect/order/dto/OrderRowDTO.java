package com.educonnect.order.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

/** Một dòng trong lịch sử đơn của người học. */
public record OrderRowDTO(
        String orderCode, // Mã đơn hàng hiển thị cho người dùng.
        Long contractId, // ID hợp đồng học.
        String title, // Tiêu đề hiển thị.
        String tutorName, // Tên hiển thị của gia sư.
        String sourceLabel, // Tên loại nguồn hình thành đơn hàng hoặc hợp đồng.
        BigDecimal total, // Tổng số tiền.
        String statusLabel, // Tên trạng thái để hiển thị trên giao diện.
        boolean payable, // Cho biết có thể thanh toán hợp đồng hay không.
        Instant createdAt // Thời điểm tạo bản ghi.
) {

    public static OrderRowDTO from(Contract contract) {
        OrderItem item = contract.getOrderItemReference();
        Order order = item.getOrderReference();
        String source = switch (item.getRegistrationSourceReference().getSourceKind()) {
            case CATALOG -> "Danh mục dịch vụ";
            case INVITATION -> "Lời mời";
            case JOB_APPLICATION -> "Tin tìm gia sư";
        };
        String status = switch (order.getStatus()) {
            case AWAITING_PAYMENT -> "Chờ thanh toán";
            case PAID -> "Đã thanh toán";
            case IN_PROGRESS -> "Đang thực hiện";
            case COMPLETED -> "Hoàn tất";
            case CANCELLATION_PENDING -> "Đang chờ hủy";
            case CANCELLED -> "Đã hủy";
        };
        return new OrderRowDTO(order.getPublicCode(), contract.getId(), item.getTitleSnapshot(),
                contract.getTutorReference().getAccount().getDisplayName(), source, order.getTotalAmount(), status,
                order.getStatus() == OrderStatus.AWAITING_PAYMENT, order.getCreatedAt());
    }
}
