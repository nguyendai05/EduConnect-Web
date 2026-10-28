package com.educonnect.contract.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.invitation.dto.InvitationSourceResponse;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.order.domain.CartItem;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

/** Safe confirmation view; no managed entities or account credentials leave the service. */
public record ContractConfirmationDTO(Long id, Long cartItemId, Long invitationId, Long version, String publicCode,
        String orderCode, Instant createdAt, String learnerName, String tutorName, String title,
        String typeLabel, BigDecimal unitPrice, short sessionCount, int seatCount,
        BigDecimal total, String terms, String statusLabel, boolean payable) {
    public boolean isDraft() { return id == null; }

    public static ContractConfirmationDTO draft(CartItem item, String learnerName) {
        Offering offering = item.getOfferingReference();
        BigDecimal total = offering.getUnitPrice().multiply(BigDecimal.valueOf(offering.getSessionCount()))
                .multiply(BigDecimal.valueOf(item.getSeatCount()));
        String type = offering.getOfferingType() == OfferingType.GROUP_CLASS ? "Lớp nhóm" : "Dịch vụ 1 kèm 1";
        return new ContractConfirmationDTO(null, item.getId(), null, offering.getVersion(), "Chưa tạo", "Chưa tạo",
                null, learnerName, offering.getTutorReference().getAccount().getDisplayName(),
                offering.getTitle(), type, offering.getUnitPrice(),
                offering.getSessionCount(), item.getSeatCount(), total, offering.getTermsText(),
                "Chưa xác nhận", false);
    }

    /** Dự thảo từ lời mời đã chấp thuận: 1 kèm 1, 1 chỗ. */
    public static ContractConfirmationDTO draftInvitation(InvitationSourceResponse src, String subject,
            String learnerName, String tutorName) {
        BigDecimal total = src.unitPrice().multiply(BigDecimal.valueOf(src.sessionCount()));
        return new ContractConfirmationDTO(null, null, src.sourceId(), src.sourceVersion(), "Chưa tạo", "Chưa tạo",
                null, learnerName, tutorName, "Lời mời học " + subject, "Dịch vụ 1 kèm 1", src.unitPrice(),
                src.sessionCount(), 1, total, src.termsText(), "Chưa xác nhận", false);
    }

    public static ContractConfirmationDTO from(Contract contract, String learnerName) {
        OrderItem item = contract.getOrderItemReference();
        return new ContractConfirmationDTO(contract.getId(), null, null, contract.getVersion(), contract.getPublicCode(),
                item.getOrderReference().getPublicCode(), contract.getCreatedAt(), learnerName,
                contract.getTutorReference().getAccount().getDisplayName(), item.getTitleSnapshot(),
                item.getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS ? "Lớp nhóm" : "Dịch vụ 1 kèm 1",
                item.getUnitPriceSnapshot(), item.getSessionCountSnapshot(), item.getSeatCount(),
                item.getLineTotal(), contract.getAgreedTermsText(), switch (contract.getStatus()) {
                    case AWAITING_PAYMENT -> "Chờ thanh toán";
                    case ACTIVE -> "Đang thực hiện";
                    case COMPLETED -> "Đã hoàn thành";
                    case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
                    case CANCELLED -> "Đã hủy";
                }, contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                        && item.getOrderReference().getStatus() == OrderStatus.AWAITING_PAYMENT);
    }
}
