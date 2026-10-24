package com.educonnect.lesson.dto;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.lesson.domain.OfferingType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** DTO hiển thị danh sách; không dùng để nhận dữ liệu từ form. */
public record OfferingResponse(
        Long id,
        String publicCode,
        String title,
        OfferingType offeringType,
        String subject,
        String grade,
        String area,
        String deliveryMode,
        BigDecimal unitPrice,
        Short sessionCount,
        Short durationMinutes,
        Integer capacity,
        LocalDate startsOn,
        LocalDate endsOn,
        OfferingStatus status,
        String statusLabel,
        int termsVersion,
        Long version,
        String reviewNote,
        boolean editable,
        boolean submittable,
        boolean closable,
        List<OfferingTimeSlotResponse> slots,
        String description,
        String termsText
) {

    public static OfferingResponse from(Offering offering, List<OfferingTimeSlot> slots) {
        boolean draft = offering.getStatus() == OfferingStatus.DRAFT || offering.getStatus() == OfferingStatus.REJECTED;
        boolean editable = draft || offering.getStatus() == OfferingStatus.PUBLISHED;
        String label = switch (offering.getStatus()) {
            case DRAFT -> "Bản nháp";
            case IN_REVIEW -> "Chờ duyệt";
            case PUBLISHED -> "Đang công khai";
            case UNPUBLISHED -> "Ngừng công khai";
            case REJECTED -> "Bị từ chối";
            case CLOSED -> "Đã đóng";
        };
        List<OfferingTimeSlotResponse> schedule = new ArrayList<>();
        for (OfferingTimeSlot slot : slots) {
            schedule.add(new OfferingTimeSlotResponse(
                    slot.getWeekday(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    slot.getTimeZone()
            ));
        }

        return new OfferingResponse(
                offering.getId(),
                offering.getPublicCode(),
                offering.getTitle(),
                offering.getOfferingType(),
                offering.getSubjectReference().getName(),
                offering.getGradeLevelReference().getName(),
                offering.getAreaReference().getName(),
                offering.getDeliveryModeReference().getName(),
                offering.getUnitPrice(),
                offering.getSessionCount(),
                offering.getDurationMinutes(),
                offering.getCapacity(),
                offering.getStartsOn(),
                offering.getEndsOn(),
                offering.getStatus(),
                label,
                offering.getTermsVersion(),
                offering.getVersion(),
                offering.getReviewNote(),
                editable,
                draft,
                offering.getStatus() != OfferingStatus.CLOSED,
                schedule,
                offering.getDescription(),
                offering.getTermsText()
        );
    }
}
