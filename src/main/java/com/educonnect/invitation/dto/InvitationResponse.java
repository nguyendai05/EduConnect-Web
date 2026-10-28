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
        Long id,
        String publicCode,
        Long learnerId,
        String learnerName,
        Long tutorId,
        String tutorName,
        Long offeringId,
        String subject,
        String grade,
        String area,
        String deliveryMode,
        BigDecimal proposedUnitPrice,
        Short sessionCount,
        String termsText,
        Integer termsVersion,
        Long version,
        InvitationStatus status,
        Instant createdAt,
        Instant expiresAt,
        Instant acceptedAt,
        boolean canAccept,
        boolean canDecline,
        boolean canCancel,
        boolean sourceUsed
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
