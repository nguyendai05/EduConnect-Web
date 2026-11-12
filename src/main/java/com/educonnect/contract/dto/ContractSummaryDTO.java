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
public record ContractSummaryDTO(
        Long id, // ID hợp đồng.
        String code, // Mã hợp đồng hiển thị cho người dùng.
        String title, // Tiêu đề hiển thị.
        String partnerName, // Tên của bên còn lại trong hợp đồng đối với người đang xem.
        boolean viewerIsTutor, // Cho biết người đang xem là gia sư trong hợp đồng hay không.
        String statusLabel, // Tên trạng thái để hiển thị trên giao diện.
        boolean active, // Cho biết hợp đồng đang được thực hiện hay không.
        BigDecimal total, // Tổng số tiền.
        int doneSessions, // Số buổi học đã hoàn thành.
        int totalSessions, // Tổng số buổi học của hợp đồng.
        Integer attendSession, // Số thứ tự buổi học gia sư có thể điểm danh.
        Integer confirmSession, // Số thứ tự buổi học đang chờ học viên xác nhận.
        Long attendSessionId, // ID buổi học gia sư có thể điểm danh.
        Long confirmSessionId, // ID buổi học đang chờ học viên xác nhận.
        Instant createdAt, // Thời điểm tạo bản ghi.
        ContractStatus status, // Trạng thái hiện tại.
        Long partnerId // ID tài khoản của bên còn lại trong hợp đồng.
) {

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
