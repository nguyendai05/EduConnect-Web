package com.educonnect.lesson.dto;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Dữ liệu công khai cho trang chi tiết lớp (A04) */
public record OfferingDetail(
        Long id, String publicCode, OfferingType type, String title, String description,
        Long tutorId, String tutorName, String subject, String gradeLevel,
        String area, String deliveryMode, BigDecimal unitPrice, String currency,
        short sessionCount, short durationMinutes, LocalDate startsOn, LocalDate endsOn,
        Integer capacity, Long remainingSeats, OfferingStatus status,
        int termsVersion, String termsText, List<TimeSlot> schedule,
        boolean registrationOpen, String registrationMessage) {

    public static OfferingDetail from(Offering offering, Long remainingSeats, List<TimeSlot> schedule,
                                      boolean registrationOpen, String registrationMessage) {
        return new OfferingDetail(offering.getId(), offering.getPublicCode(), offering.getOfferingType(),
                offering.getTitle(), offering.getDescription(), offering.getTutorId(),
                offering.getTutorReference().getAccount().getDisplayName(), offering.getSubjectReference().getName(),
                offering.getGradeLevelReference().getName(), offering.getAreaReference().getName(),
                offering.getDeliveryModeReference().getName(), offering.getUnitPrice(), offering.getCurrency(),
                offering.getSessionCount(), offering.getDurationMinutes(), offering.getStartsOn(),
                offering.getEndsOn(), offering.getCapacity(), remainingSeats, offering.getStatus(),
                offering.getTermsVersion(), offering.getTermsText(), schedule, registrationOpen, registrationMessage);
    }

    public record TimeSlot(byte weekday, LocalTime startTime, LocalTime endTime, String timeZone) {
        public static TimeSlot from(OfferingTimeSlot slot) {
            return new TimeSlot(slot.getWeekday(), slot.getStartTime(), slot.getEndTime(), slot.getTimeZone());
        }
    }
}
