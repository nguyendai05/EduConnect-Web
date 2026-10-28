package com.educonnect.lesson.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalTime;
import java.time.ZoneId;

/** Khung lịch nhận từ form tạo/sửa dịch vụ. */
public class OfferingTimeSlotRequest {

    @NotNull
    @Min(1)
    @Max(7)
    private Byte weekday;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime startTime;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime endTime;

    @NotBlank
    @Size(max = 64)
    private String timeZone = "Asia/Ho_Chi_Minh";

    @AssertTrue(message = "Giờ kết thúc phải sau giờ bắt đầu, trong cùng ngày.")
    public boolean isTimeRangeValid() {
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }

    @AssertTrue(message = "Múi giờ không hợp lệ; ví dụ Asia/Ho_Chi_Minh.")
    public boolean isZoneValid() {
        return timeZone == null || ZoneId.getAvailableZoneIds().contains(timeZone);
    }

    public Byte getWeekday() {
        return weekday;
    }

    public void setWeekday(Byte weekday) {
        this.weekday = weekday;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }
}
