package com.educonnect.lesson.dto;

import java.time.LocalTime;

/** Khung lịch trả về để hiển thị trong danh sách dịch vụ/lớp. */
public record OfferingTimeSlotResponse(
        int weekday, // Thứ trong tuần: 1 là thứ Hai, 7 là Chủ nhật.
        LocalTime startTime, // Giờ bắt đầu khung học.
        LocalTime endTime, // Giờ kết thúc khung học.
        String timeZone // Múi giờ IANA áp dụng cho lịch học, chẳng hạn Asia/Ho_Chi_Minh.
) {

    public String getDayLabel() {
        if (weekday == 7) {
            return "Chủ nhật";
        }

        return "Thứ " + (weekday + 1);
    }
}
