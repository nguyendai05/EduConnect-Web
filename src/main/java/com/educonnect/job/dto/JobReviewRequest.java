package com.educonnect.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu biểu mẫu, không nhận danh tính người thao tác.
 * Thuộc trang: /admin/job-review-detail.
 */
public class JobReviewRequest {
    @NotNull
    @PositiveOrZero
    private Long version;
    @NotBlank
    @Pattern(regexp = "approve|reject")
    private String action;
    // Phê duyệt không cần lý do; từ chối bắt buộc có lý do (JobReviewService kiểm).
    @Size(max = 2000)
    private String reason;

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
