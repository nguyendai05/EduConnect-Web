package com.educonnect.invitation.dto;

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
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Tác giả: Trường Đạt.
 * Form gửi lời mời; không nhận learnerId, trạng thái hoặc acceptedAt.
 * Thuộc trang: /invitation/create.
 */
public class InvitationRequest {
    @NotBlank
    @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String requestKey;
    @NotNull
    @Positive
    private Long tutorId;
    @Positive
    private Long offeringId;
    @PositiveOrZero
    private Long offeringVersion;
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
    private BigDecimal proposedUnitPrice;
    @NotNull
    @Min(1)
    @Max(32767)
    private Short sessionCount;
    @NotBlank(message = "Nhập điều khoản, thời lượng và lịch học đề xuất.")
    @Size(max = 10000)
    private String termsText;
    @NotNull(message = "Chọn hạn nhận phản hồi.")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime expiresAt;
    @AssertTrue(message = "Bạn cần xác nhận đồng ý với đề xuất trước khi gửi.")
    private boolean consent;

    @AssertTrue(message = "Thiếu phiên bản dịch vụ. Hãy chọn lại dịch vụ.")
    public boolean isOfferingVersionValid() {
        return offeringId == null || offeringVersion != null;
    }

    @AssertTrue(message = "Hạn phản hồi phải nằm trong khoảng ngày giờ được hệ thống hỗ trợ.")
    public boolean isExpirySupported() {
        return expiresAt == null || expiresAt.getYear() >= 1 && expiresAt.getYear() <= 9999;
    }

    @AssertTrue(message = "Tổng học phí đề xuất vượt giới hạn 19 chữ số.")
    public boolean isTotalPriceValid() {
        return proposedUnitPrice == null || sessionCount == null
                || proposedUnitPrice.multiply(BigDecimal.valueOf(sessionCount))
                .compareTo(new BigDecimal("9999999999999999999")) <= 0;
    }

    public String getRequestKey() {
        return requestKey;
    }

    public void setRequestKey(String requestKey) {
        this.requestKey = requestKey;
    }

    public Long getTutorId() {
        return tutorId;
    }

    public void setTutorId(Long tutorId) {
        this.tutorId = tutorId;
    }

    public Long getOfferingId() {
        return offeringId;
    }

    public void setOfferingId(Long offeringId) {
        this.offeringId = offeringId;
    }

    public Long getOfferingVersion() {
        return offeringVersion;
    }

    public void setOfferingVersion(Long offeringVersion) {
        this.offeringVersion = offeringVersion;
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

    public BigDecimal getProposedUnitPrice() {
        return proposedUnitPrice;
    }

    public void setProposedUnitPrice(BigDecimal proposedUnitPrice) {
        this.proposedUnitPrice = proposedUnitPrice;
    }

    public Short getSessionCount() {
        return sessionCount;
    }

    public void setSessionCount(Short sessionCount) {
        this.sessionCount = sessionCount;
    }

    public String getTermsText() {
        return termsText;
    }

    public void setTermsText(String termsText) {
        this.termsText = termsText;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isConsent() {
        return consent;
    }

    public void setConsent(boolean consent) {
        this.consent = consent;
    }
}
