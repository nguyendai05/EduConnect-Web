package com.educonnect.invitation.dto;

import com.educonnect.invitation.domain.InvitationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Tác giả: Trường Đạt.
 * Chỉ trả cho hai bên của lời mời; không chứa dữ liệu tài khoản riêng tư.
 * Thuộc trang: /invitation/negotiation.
 */
public record InvitationResponse(
        Long id, // ID lời mời học.
        String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
        Long learnerId, // ID tài khoản học viên.
        String learnerName, // Tên hiển thị của học viên.
        Long tutorId, // ID tài khoản gia sư.
        String tutorName, // Tên hiển thị của gia sư.
        Long offeringId, // ID dịch vụ hoặc lớp học.
        String subject, // Tên môn học.
        String grade, // Tên cấp học.
        String area, // Tên khu vực học.
        String deliveryMode, // Tên hình thức học, chẳng hạn trực tuyến hoặc trực tiếp.
        BigDecimal proposedUnitPrice, // Học phí mỗi buổi được đề xuất khi thương lượng.
        Short sessionCount, // Tổng số buổi học.
        String termsText, // Nội dung điều khoản học.
        Integer termsVersion, // Số phiên bản điều khoản để xác định nội dung người dùng đồng ý.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        InvitationStatus status, // Trạng thái hiện tại.
        Instant createdAt, // Thời điểm tạo bản ghi.
        Instant expiresAt, // Thời điểm hết hạn.
        Instant acceptedAt, // Thời điểm lời mời được chấp nhận.
        boolean canAccept, // Cho biết người xem có thể chấp nhận lời mời hay không.
        boolean canDecline, // Cho biết người xem có thể từ chối lời mời hay không.
        boolean canCancel, // Cho biết người xem có thể hủy hay không.
        boolean sourceUsed // Cho biết nguồn đã được dùng để tạo hợp đồng hay chưa.
) {
    public String getStatusLabel() {
        return switch (status) {
            case PENDING -> "Chờ gia sư phản hồi";
            case ACCEPTED -> "Đã chấp nhận";
            case DECLINED -> "Đã từ chối";
            case CANCELLED -> "Đã hủy";
            case EXPIRED -> "Đã hết hạn phản hồi";
        };
    }

    public BigDecimal getTotalPrice() {
        return proposedUnitPrice.multiply(BigDecimal.valueOf(sessionCount));
    }

    public String getCreatedAtLabel() {
        return format(createdAt);
    }

    public String getExpiresAtLabel() {
        return format(expiresAt);
    }

    public String getAcceptedAtLabel() {
        return acceptedAt == null ? "—" : format(acceptedAt);
    }

    private static String format(Instant time) {
        return DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Ho_Chi_Minh")).format(time);
    }
}
