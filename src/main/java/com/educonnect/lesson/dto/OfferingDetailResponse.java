package com.educonnect.lesson.dto;

import java.time.LocalDate;
import java.util.List;

/** Tác giả: Trường Đạt. Chi tiết công khai, không chứa thông tin tài khoản/xét duyệt riêng tư. */
public record OfferingDetailResponse(
        OfferingCardResponse offering,
        String description,
        String termsText,
        Integer termsVersion,
        Integer capacity,
        LocalDate startsOn,
        LocalDate endsOn,
        List<OfferingTimeSlotResponse> slots,
        long availableSeats,
        String registrationIssue
) {
    public OfferingDetailResponse {
        slots = List.copyOf(slots);
    }
}
