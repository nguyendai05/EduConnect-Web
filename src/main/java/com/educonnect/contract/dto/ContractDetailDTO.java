package com.educonnect.contract.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

/** Chi tiết hợp đồng cho học viên và gia sư của hợp đồng đó. */
public record ContractDetailDTO(Long id, String publicCode, String orderCode, String title, String learnerName,
        String tutorName, String typeLabel, BigDecimal unitPrice, short sessionCount, int seatCount, BigDecimal total,
        String terms, String statusLabel, Instant createdAt, Instant learnerAcceptedAt, Instant tutorAcceptedAt,
        boolean payable, boolean canComplete, boolean canCancel) {

    /** viewerId là người đang xem: gia sư thấy nút hoàn thành, học viên thấy nút hủy (khi chờ thanh toán hoặc đang thực hiện). */
    public static ContractDetailDTO from(Contract contract, Long viewerId) {
        OrderItem item = contract.getOrderItemReference();
        String status = switch (contract.getStatus()) {
            case AWAITING_PAYMENT -> "Chờ thanh toán";
            case ACTIVE -> "Đang thực hiện";
            case COMPLETED -> "Đã hoàn thành";
            case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
            case CANCELLED -> "Đã hủy";
        };
        return new ContractDetailDTO(contract.getId(), contract.getPublicCode(), item.getOrderReference().getPublicCode(),
                item.getTitleSnapshot(), contract.getLearnerReference().getAccount().getDisplayName(),
                contract.getTutorReference().getAccount().getDisplayName(),
                item.getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS ? "Lớp nhóm" : "Dịch vụ 1 kèm 1",
                item.getUnitPriceSnapshot(), item.getSessionCountSnapshot(), item.getSeatCount(), item.getLineTotal(),
                contract.getAgreedTermsText(), status, contract.getCreatedAt(), contract.getLearnerAcceptedAt(),
                contract.getTutorAcceptedAt(), contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                        && item.getOrderReference().getStatus() == OrderStatus.AWAITING_PAYMENT,
                contract.getStatus() == ContractStatus.ACTIVE && contract.getTutorId().equals(viewerId),
                (contract.getStatus() == ContractStatus.ACTIVE || contract.getStatus() == ContractStatus.AWAITING_PAYMENT)
                        && contract.getLearnerId().equals(viewerId));
    }
}
