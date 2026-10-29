package com.educonnect.order.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.order.domain.Order;

import java.math.BigDecimal;
import java.time.Instant;

/** Một dòng trong danh sách đơn đăng ký của gia sư: đơn, học viên, nội dung đã chốt, trạng thái đơn và thanh toán. */
public record TutorOrderRowDTO(String orderCode, String sourceLabel, String learnerName, String title, BigDecimal total,
        String statusLabel, String paymentLabel, Long contractId, Instant createdAt) {

    public static TutorOrderRowDTO from(Contract contract) {
        OrderRowDTO row = OrderRowDTO.from(contract);
        Order order = contract.getOrderItemReference().getOrderReference();
        String payment = switch (order.getStatus()) {
            case AWAITING_PAYMENT -> "Chờ thanh toán";
            case CANCELLED -> "Đã hủy";
            default -> "Đã thanh toán";
        };
        return new TutorOrderRowDTO(row.orderCode(), row.sourceLabel(), contract.getLearnerReference().getAccount().getDisplayName(),
                row.title(), row.total(), row.statusLabel(), payment, contract.getId(), row.createdAt());
    }
}
