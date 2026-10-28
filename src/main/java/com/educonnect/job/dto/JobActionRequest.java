package com.educonnect.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu biểu mẫu, không nhận danh tính người thao tác.
 * Thuộc trang: /job/detail.
 */
public class JobActionRequest {
    @NotNull
    @PositiveOrZero
    private Long version;
    @NotBlank
    @Pattern(regexp = "submit|close")
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
