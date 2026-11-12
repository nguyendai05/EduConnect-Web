package com.educonnect.invitation.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Tác giả: Trường Đạt.
 * Form phản hồi đúng phiên bản lời mời/điều khoản.
 * Thuộc trang: /invitation/negotiation.
 */
public class InvitationActionRequest {
    @NotNull
    @PositiveOrZero
    private Long version; // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
    @NotNull
    @Min(1)
    private Integer termsVersion; // Số phiên bản điều khoản để xác định nội dung người dùng đồng ý.
    @NotBlank
    @Pattern(regexp = "accept|decline|cancel|counter")
    private String action; // Thao tác người dùng yêu cầu thực hiện.
    private boolean consent;// Cho biết người dùng đã đồng ý với điều khoản hay chưa.
    @DecimalMin("1")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal proposedPrice;

    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal price) { this.proposedPrice = price; }


    @AssertTrue(message = "Cần đồng ý điều khoản hiện hành để chấp nhận lời mời.")
    public boolean isAcceptanceValid() {
        return !"accept".equals(action) || consent;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Integer getTermsVersion() {
        return termsVersion;
    }

    public void setTermsVersion(Integer termsVersion) {
        this.termsVersion = termsVersion;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public boolean isConsent() {
        return consent;
    }

    public void setConsent(boolean consent) {
        this.consent = consent;
    }
}
