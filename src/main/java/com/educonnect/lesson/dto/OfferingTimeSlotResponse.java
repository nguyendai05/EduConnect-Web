package com.educonnect.lesson.dto;

import java.time.LocalTime;

/** Khung lịch trả về để hiển thị trong danh sách dịch vụ/lớp. */
public record OfferingTimeSlotResponse(
        int weekday,
        LocalTime startTime,
        LocalTime endTime,
        String timeZone
) {

    public String getDayLabel() {
        if (weekday == 7) {
            return "Chủ nhật";
        }

        return "Thứ " + (weekday + 1);
    }
}
