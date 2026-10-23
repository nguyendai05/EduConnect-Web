package com.educonnect.contract;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ContractConfirmationForm(
        @NotNull @Positive Long cartItemId,
        @NotNull Long version,
        @AssertTrue(message = "Vui lòng xác nhận nội dung và điều khoản.") boolean acceptTerms,
        @AssertTrue(message = "Vui lòng xác nhận học phí.") boolean acceptPayment,
        @AssertTrue(message = "Vui lòng xác nhận chính sách hủy và hoàn tiền.") boolean acceptCancellation) {}
