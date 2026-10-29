package com.educonnect.contract.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.order.domain.OrderItem;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Một dòng trong danh sách hợp đồng của người dùng. attendSession là buổi gia sư điểm danh tiếp,
 * confirmSession là buổi học viên cần xác nhận (null nếu không có).
 */
public record ContractSummaryDTO(Long id, String code, String title, String partnerName, boolean viewerIsTutor,
        String statusLabel, boolean active, BigDecimal total, int doneSessions, int totalSessions,
        Integer attendSession, Integer confirmSession, Long attendSessionId, Long confirmSessionId, Instant createdAt,
        ContractStatus status, Long partnerId) {

    /** Hợp đồng đang chờ người xem làm gì đó: gia sư điểm danh, học viên xác nhận buổi hoặc thanh toán. */
    public boolean needsAction() {
        return attendSession != null || confirmSession != null || (!viewerIsTutor && status == ContractStatus.AWAITING_PAYMENT);
    }

    public static ContractSummaryDTO from(Contract contract, Long viewerId, List<ContractSession> sessions) {
        OrderItem item = contract.getOrderItemReference();
        boolean tutor = contract.getTutorId().equals(viewerId);
        boolean active = contract.getStatus() == ContractStatus.ACTIVE;
        int done = (int) sessions.stream().filter(s -> s.getStatus() == ContractSessionStatus.RELEASED).count();
        ContractSession attend = !active || !tutor ? null : sessions.stream()
                .filter(s -> s.getStatus() == ContractSessionStatus.HELD).findFirst().orElse(null);
        ContractSession confirm = !active || tutor ? null : sessions.stream()
                .filter(s -> s.getStatus() == ContractSessionStatus.ATTENDED).findFirst().orElse(null);
        String partner = tutor ? contract.getLearnerReference().getAccount().getDisplayName()
                : contract.getTutorReference().getAccount().getDisplayName();
        return new ContractSummaryDTO(contract.getId(), contract.getPublicCode(), item.getTitleSnapshot(), partner, tutor,
                label(contract.getStatus()), active, item.getLineTotal(), done, sessions.size(),
                attend == null ? null : attend.getSessionNumber(), confirm == null ? null : confirm.getSessionNumber(),
                attend == null ? null : attend.getId(), confirm == null ? null : confirm.getId(), contract.getCreatedAt(),
                contract.getStatus(), tutor ? contract.getLearnerId() : contract.getTutorId());
    }

    private static String label(ContractStatus status) {
        return switch (status) {
            case AWAITING_PAYMENT -> "Chờ thanh toán";
            case ACTIVE -> "Đang thực hiện";
            case COMPLETED -> "Đã hoàn thành";
            case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
            case CANCELLED -> "Đã hủy";
        };
    }
}
