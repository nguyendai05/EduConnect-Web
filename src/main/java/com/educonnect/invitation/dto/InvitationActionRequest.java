package com.educonnect.invitation.dto;

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
    private Long version;
    @NotNull
    @Min(1)
    private Integer termsVersion;
    @NotBlank
    @Pattern(regexp = "accept|decline|cancel")
    private String action;
    private boolean consent;

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
