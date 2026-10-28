package com.educonnect.invitation.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Snapshot INVITATION đã kiểm/khóa để Huy dùng trong transaction tạo đơn.
 * Thuộc trang: nguồn INVITATION từ /invitation/negotiation.
 */
public record InvitationSourceResponse(
        String sourceKind,
        Long sourceId,
        Long sourceVersion,
        Long learnerId,
        Long tutorId,
        Long offeringId,
        Long subjectId,
        Long gradeLevelId,
        Long areaId,
        Long deliveryModeId,
        BigDecimal unitPrice,
        Short sessionCount,
        Integer termsVersion,
        String termsText,
        Instant learnerAcceptedAt,
        Instant tutorAcceptedAt
) {}
