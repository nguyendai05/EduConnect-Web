package com.educonnect.tutor.dto;

import com.educonnect.lesson.domain.OfferingType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/** Tác giả: Trường Đạt. DAT-02: nhận điều kiện tìm kiếm bằng @ModelAttribute. */
public class TutorSearchRequest {
    @NotNull
    @Size(max = 200, message = "Từ khóa tối đa 200 ký tự.")
    private String q = "";

    @Positive
    private Long subjectId;

    @NotNull
    @Size(max = 30)
    private List<@NotNull @Positive Long> gradeLevelIds = new ArrayList<>();

    @Positive
    private Long areaId;

    @Positive
    private Long deliveryModeId;

    private OfferingType offeringType;

    @DecimalMin("0")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal minPrice;

    @DecimalMin("0")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal maxPrice;

    @NotNull
    @Size(max = 7)
    private List<@NotNull @Min(1) @Max(7) Integer> weekdays = new ArrayList<>();

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime endTime;

    @Size(max = 64)
    private String timeZone;

    // newest chờ Q10; rating chờ A08. Không tự thay bằng một cách sắp xếp khác.
    @NotBlank
    @Pattern(regexp = "name|price-asc|price-desc", message = "Tiêu chí sắp xếp chưa được hỗ trợ.")
    private String sort = "name";

    @Min(0)
    @Max(100000)
    private int page;

    @Min(1)
    @Max(48)
    private int size = 12;

    @AssertTrue(message = "Giá tối thiểu không được lớn hơn giá tối đa.")
    public boolean isPriceRangeValid() {
        return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <= 0;
    }

    @AssertTrue(message = "Nhập đủ giờ bắt đầu/kết thúc, giờ kết thúc phải sau giờ bắt đầu.")
    public boolean isTimeRangeValid() {
        return startTime == null && endTime == null
                || startTime != null && endTime != null && startTime.isBefore(endTime);
    }

    @AssertTrue(message = "Chọn múi giờ IANA hợp lệ khi lọc theo ngày hoặc giờ học.")
    public boolean isTimeZoneValid() {
        boolean hasSchedule = weekdays != null && !weekdays.isEmpty() || startTime != null || endTime != null;
        if (timeZone == null || timeZone.isBlank()) {
            return !hasSchedule;
        }
        return ZoneId.getAvailableZoneIds().contains(timeZone);
    }

    public String getQ() { return q; }
    public void setQ(String q) { this.q = q == null ? "" : q.strip(); }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public List<Long> getGradeLevelIds() { return gradeLevelIds; }
    public void setGradeLevelIds(List<Long> gradeLevelIds) { this.gradeLevelIds = gradeLevelIds; }
    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }
    public Long getDeliveryModeId() { return deliveryModeId; }
    public void setDeliveryModeId(Long deliveryModeId) { this.deliveryModeId = deliveryModeId; }
    public OfferingType getOfferingType() { return offeringType; }
    public void setOfferingType(OfferingType offeringType) { this.offeringType = offeringType; }
    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public List<Integer> getWeekdays() { return weekdays; }
    public void setWeekdays(List<Integer> weekdays) { this.weekdays = weekdays; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone == null || timeZone.isBlank() ? null : timeZone.strip();
    }
    public String getSort() { return sort; }
    public void setSort(String sort) { this.sort = sort; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
