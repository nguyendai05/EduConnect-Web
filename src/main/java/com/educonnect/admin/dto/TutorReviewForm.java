package com.educonnect.admin.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** DAI-02: quyết định duyệt hồ sơ gia sư. Từ chối bắt buộc có lý do (Service kiểm thêm). */
public class TutorReviewForm {
    @NotNull(message = "Thiếu quyết định.")
    @Pattern(regexp = "approve|reject", message = "Quyết định không hợp lệ.")
    private String action;

    @Size(max = 2000, message = "Lý do tối đa 2000 ký tự.")
    private String reason;

    @NotNull(message = "Thiếu phiên bản hồ sơ, hãy tải lại trang.")
    private Long version;

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
