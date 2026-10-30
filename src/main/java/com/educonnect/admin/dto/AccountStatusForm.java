package com.educonnect.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** DAI-03: đổi trạng thái tài khoản — chỉ ACTIVE/LOCKED/DISABLED, bắt buộc lý do. Không có role hay mật khẩu. */
public class AccountStatusForm {
    @NotNull(message = "Thiếu trạng thái mới.")
    @Pattern(regexp = "ACTIVE|LOCKED|DISABLED", message = "Trạng thái không hợp lệ.")
    private String status;

    @NotBlank(message = "Hãy nhập lý do để lưu vào nhật ký.")
    @Size(min = 10, max = 500, message = "Lý do cần từ 10 đến 500 ký tự.")
    private String reason;

    @NotNull(message = "Thiếu phiên bản tài khoản, hãy tải lại trang.")
    private Long version;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
