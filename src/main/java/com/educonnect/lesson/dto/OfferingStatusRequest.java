package com.educonnect.lesson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

/** DTO chỉ nhận phiên bản và thao tác gửi duyệt/đóng dịch vụ. */
public class OfferingStatusRequest {

    @NotNull(message = "Thiếu phiên bản dữ liệu. Hãy tải lại trang.")
    @PositiveOrZero(message = "Phiên bản dữ liệu không hợp lệ.")
    private Long version;

    @NotBlank(message = "Chọn thao tác cần thực hiện.")
    @Pattern(regexp = "submit|close", message = "Thao tác không được hỗ trợ.")
    private String action;

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
}
