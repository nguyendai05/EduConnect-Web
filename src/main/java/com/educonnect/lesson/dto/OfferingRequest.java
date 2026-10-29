package com.educonnect.lesson.dto;

import com.educonnect.lesson.domain.OfferingType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** DTO nhận dữ liệu tạo/sửa; không chứa chủ sở hữu, trạng thái duyệt hoặc cờ hiển thị. */
public class OfferingRequest {

    @NotBlank
    @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String requestKey;

    @PositiveOrZero
    private Long version;

    @NotNull
    private OfferingType offeringType = OfferingType.SERVICE;

    @NotBlank(message = "Nhập tiêu đề.")
    @Size(max = 220)
    private String title;

    @NotBlank(message = "Nhập mô tả.")
    @Size(max = 10000)
    private String description;

    private Long subjectId;

    @Size(max = 120, message = "Tên môn tối đa 120 ký tự.")
    private String subjectName;

    @NotNull
    @Positive
    private Long gradeLevelId;

    @NotNull
    @Positive
    private Long areaId;

    @NotNull
    @Positive
    private Long deliveryModeId;

    @NotNull
    @DecimalMin(value = "1", message = "Giá phải lớn hơn 0.")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal unitPrice;

    @NotNull
    @Min(1)
    @Max(32767)
    private Short sessionCount;

    @NotNull
    @Min(1)
    @Max(32767)
    private Short durationMinutes;

    @Positive
    private Integer capacity;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startsOn;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endsOn;

    @NotBlank(message = "Nhập điều khoản dịch vụ.")
    @Size(max = 10000)
    private String termsText;

    @NotEmpty(message = "Thêm ít nhất một khung lịch.")
    @Size(max = 14, message = "Chỉ được nhập tối đa 14 khung lịch.")
    @Valid
    private List<@NotNull OfferingTimeSlotRequest> slots = new ArrayList<>();

    @AssertTrue(message = "Lớp nhóm cần sức chứa, ngày bắt đầu và ngày kết thúc không trước ngày bắt đầu.")
    public boolean isGroupDatesValid() {
        if (offeringType != OfferingType.GROUP_CLASS) {
            return true;
        }

        return capacity != null && capacity > 0
                && startsOn != null && endsOn != null
                && !endsOn.isBefore(startsOn);
    }

    public String getRequestKey() {
        return requestKey;
    }

    public void setRequestKey(String requestKey) {
        this.requestKey = requestKey;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public OfferingType getOfferingType() {
        return offeringType;
    }

    public void setOfferingType(OfferingType offeringType) {
        this.offeringType = offeringType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Long getGradeLevelId() {
        return gradeLevelId;
    }

    public void setGradeLevelId(Long gradeLevelId) {
        this.gradeLevelId = gradeLevelId;
    }

    public Long getAreaId() {
        return areaId;
    }

    public void setAreaId(Long areaId) {
        this.areaId = areaId;
    }

    public Long getDeliveryModeId() {
        return deliveryModeId;
    }

    public void setDeliveryModeId(Long deliveryModeId) {
        this.deliveryModeId = deliveryModeId;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Short getSessionCount() {
        return sessionCount;
    }

    public void setSessionCount(Short sessionCount) {
        this.sessionCount = sessionCount;
    }

    public Short getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Short durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public LocalDate getStartsOn() {
        return startsOn;
    }

    public void setStartsOn(LocalDate startsOn) {
        this.startsOn = startsOn;
    }

    public LocalDate getEndsOn() {
        return endsOn;
    }

    public void setEndsOn(LocalDate endsOn) {
        this.endsOn = endsOn;
    }

    public String getTermsText() {
        return termsText;
    }

    public void setTermsText(String termsText) {
        this.termsText = termsText;
    }

    public List<OfferingTimeSlotRequest> getSlots() {
        return slots;
    }

    public void setSlots(List<OfferingTimeSlotRequest> slots) {
        this.slots = slots;
    }
}
