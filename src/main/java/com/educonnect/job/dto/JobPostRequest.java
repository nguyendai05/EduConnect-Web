package com.educonnect.job.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu biểu mẫu, không nhận danh tính người thao tác.
 * Thuộc trang: /job/create.
 */
public class JobPostRequest {
    @NotBlank
    @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String requestKey; // Khóa nhận diện yêu cầu để tránh tạo trùng khi gửi lại.
    @PositiveOrZero
    private Long version; // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
    @NotBlank
    @Size(max = 220)
    private String title; // Tiêu đề hiển thị.
    @NotBlank
    @Size(max = 8000)
    private String description; // Nội dung mô tả chi tiết.
    @Positive
    private Long subjectId; // ID môn học.
    @Size(max = 120)
    private String subjectName; // Tên môn học tự nhập.
    @Positive
    private Long gradeLevelId; // ID cấp học.
    @Size(max = 120)
    private String gradeLevelName; // Tên cấp học tự nhập.
    @NotNull
    @Positive
    private Long areaId; // ID khu vực học.
    @NotNull
    @Positive
    private Long deliveryModeId; // ID hình thức học.
    @NotNull
    @DecimalMin("1")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal budgetPerSession; // Ngân sách dự kiến cho mỗi buổi học.
    @NotNull
    @Min(1)
    @Max(32767)
    private Short sessionCount; // Tổng số buổi học.
    @NotBlank
    @Pattern(regexp = "draft|submit")
    private String action; // Thao tác người dùng yêu cầu thực hiện.

    @AssertTrue(message = "Tổng ngân sách vượt giới hạn 19 chữ số.")
    public boolean isTotalValid() {
        return budgetPerSession == null || sessionCount == null
                || budgetPerSession.multiply(BigDecimal.valueOf(sessionCount))
                .compareTo(new BigDecimal("9999999999999999999")) <= 0;
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

    public String getGradeLevelName() {
        return gradeLevelName;
    }

    public void setGradeLevelName(String gradeLevelName) {
        this.gradeLevelName = gradeLevelName;
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

    public BigDecimal getBudgetPerSession() {
        return budgetPerSession;
    }

    public void setBudgetPerSession(BigDecimal budgetPerSession) {
        this.budgetPerSession = budgetPerSession;
    }

    public Short getSessionCount() {
        return sessionCount;
    }

    public void setSessionCount(Short sessionCount) {
        this.sessionCount = sessionCount;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}
