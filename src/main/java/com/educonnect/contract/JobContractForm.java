package com.educonnect.contract;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Form xác nhận hợp đồng từ gia sư đã được chọn cho tin tìm gia sư. */
public record JobContractForm(
        @NotNull @Positive Long jobId,
        @NotNull @Min(0) Long jobVersion,
        @NotNull @Positive Long applicationId,
        @NotNull @Min(0) Long applicationVersion,
        @AssertTrue(message = "Vui lòng xác nhận nội dung và điều khoản") boolean acceptTerms,
        @AssertTrue(message = "Vui lòng xác nhận học phí") boolean acceptPayment,
        @AssertTrue(message = "Vui lòng xác nhận chính sách hủy và hoàn tiền") boolean acceptCancellation) {}
