package com.educonnect.order.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartSelectionForm(
        @NotNull(message = "Số chỗ không được để trống")
        @Positive(message = "Số chỗ phải lớn hơn 0")
        Integer seats,
        @NotNull(message = "Vui lòng tải lại thông tin dịch vụ") Long version) {}
