package com.educonnect.contract.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Chi tiết hợp đồng cho học viên và gia sư của hợp đồng đó. */
public record ContractDetailDTO(Long id, String publicCode, String orderCode, String title, String learnerName,
        String tutorName, String typeLabel, BigDecimal unitPrice, short sessionCount, int seatCount, BigDecimal total,
        String terms, String statusLabel, Instant createdAt, Instant learnerAcceptedAt, Instant tutorAcceptedAt,
        boolean payable, boolean canCancel, List<SessionDTO> sessions) {

    /** Một buổi học; canAttend cho gia sư (buổi kế tiếp), canConfirm cho học viên (buổi đã điểm danh). */
    public record SessionDTO(Long id, int number, BigDecimal amount, String statusLabel, Instant attendedAt,
            boolean canAttend, boolean canConfirm) {}


    /** viewerId là người đang xem: gia sư thấy nút điểm danh, học viên thấy nút xác nhận buổi và nút hủy (khi chờ thanh toán). */
    public static ContractDetailDTO from(Contract contract, Long viewerId, List<ContractSession> sessions) {
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
                contract.getStatus() == ContractStatus.AWAITING_PAYMENT && contract.getLearnerId().equals(viewerId),
                sessionRows(contract, viewerId, sessions));
    }

    private static List<SessionDTO> sessionRows(Contract contract, Long viewerId, List<ContractSession> sessions) {
        boolean active = contract.getStatus() == ContractStatus.ACTIVE;
        boolean tutor = contract.getTutorId().equals(viewerId);
        boolean learner = contract.getLearnerId().equals(viewerId);
        Long nextId = sessions.stream().filter(x -> x.getStatus() == ContractSessionStatus.HELD)
                .map(ContractSession::getId).findFirst().orElse(null);
        return sessions.stream().map(x -> new SessionDTO(x.getId(), x.getSessionNumber(), x.getAmount(), switch (x.getStatus()) {
            case HELD -> "Chưa học";
            case ATTENDED -> "Chờ học viên xác nhận";
            case RELEASED -> "Đã giải ngân";
            case REFUNDED -> "Đã hoàn tiền";
        }, x.getAttendedAt(), active && tutor && x.getId().equals(nextId),
                active && learner && x.getStatus() == ContractSessionStatus.ATTENDED)).toList();
    }
}
