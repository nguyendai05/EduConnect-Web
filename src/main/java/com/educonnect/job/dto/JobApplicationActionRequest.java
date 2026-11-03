package com.educonnect.job.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu biểu mẫu, không nhận danh tính người thao tác.
 * Thuộc trang: /job/detail và /job/applicants.
 */
public class JobApplicationActionRequest {
    @NotNull
    @PositiveOrZero
    private Long jobVersion; // Phiên bản tin tìm gia sư để phát hiện cập nhật đồng thời.
    @NotNull
    @PositiveOrZero
    private Long applicationVersion; // Phiên bản đơn ứng tuyển để phát hiện cập nhật đồng thời.
    @NotBlank
    @Pattern(regexp = "select|reject|withdraw")
    private String action; // Thao tác người dùng yêu cầu thực hiện.
    private boolean consent; // Cho biết người dùng đã đồng ý với điều khoản hay chưa.

    @AssertTrue(message = "Bạn cần đồng ý toàn bộ nội dung và giá của ứng viên trước khi chọn.")
    public boolean isConsentValid() {
        return !"select".equals(action) || consent;
    }

    public Long getJobVersion() {
        return jobVersion;
    }

    public void setJobVersion(Long jobVersion) {
        this.jobVersion = jobVersion;
    }

    public Long getApplicationVersion() {
        return applicationVersion;
    }

    public void setApplicationVersion(Long applicationVersion) {
        this.applicationVersion = applicationVersion;
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
