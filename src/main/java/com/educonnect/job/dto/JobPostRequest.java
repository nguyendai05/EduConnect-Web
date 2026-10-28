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
    private String requestKey;
    @PositiveOrZero
    private Long version;
    @NotBlank
    @Size(max = 220)
    private String title;
    @NotBlank
    @Size(max = 8000)
    private String description;
    @NotNull
    @Positive
    private Long subjectId;
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
    @DecimalMin("1")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal budgetPerSession;
    @NotNull
    @Min(1)
    @Max(32767)
    private Short sessionCount;
    @NotBlank
    @Pattern(regexp = "draft|submit")
    private String action;

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
