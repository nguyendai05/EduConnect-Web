package com.educonnect.lesson.dto;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import java.math.BigDecimal;
import java.time.Instant;

/** Tác giả: Trường Đạt. Dữ liệu công khai dùng cho home, khám phá và chi tiết dịch vụ. */
public record OfferingCardResponse(
        Long id,
        String publicCode,
        Long tutorId,
        String tutorName,
        String tutorHeadline,
        OfferingType offeringType,
        String title,
        String subject,
        String grade,
        String area,
        String deliveryMode,
        BigDecimal unitPrice,
        String currency,
        Short sessionCount,
        Short durationMinutes,
        OfferingStatus status,
        Long version,
        Instant publishedAt
) {
    public static OfferingCardResponse from(Offering offering) {
        var tutor = offering.getTutorReference();
        return new OfferingCardResponse(
                offering.getId(), offering.getPublicCode(), offering.getTutorId(),
                tutor.getAccount().getDisplayName(), tutor.getHeadline(), offering.getOfferingType(),
                offering.getTitle(), offering.getSubjectReference().getName(),
                offering.getGradeLevelReference().getName(), offering.getAreaReference().getName(),
                offering.getDeliveryModeReference().getName(), offering.getUnitPrice(), offering.getCurrency(),
                offering.getSessionCount(), offering.getDurationMinutes(), offering.getStatus(),
                offering.getVersion(), offering.getPublishedAt()
        );
    }

    public boolean isGroupClass() {
        return offeringType == OfferingType.GROUP_CLASS;
    }

    public BigDecimal getPackagePrice() {
        return unitPrice.multiply(BigDecimal.valueOf(sessionCount));
    }
}
