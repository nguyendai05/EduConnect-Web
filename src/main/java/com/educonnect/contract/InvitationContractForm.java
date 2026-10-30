package com.educonnect.contract;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Form xác nhận hợp đồng từ lời mời đã được hai bên chấp thuận. */
public record InvitationContractForm(
        @NotNull @Positive Long invitationId,
        @NotNull @Min(0) Long version,
        @AssertTrue(message = "Vui lòng xác nhận nội dung và điều khoản") boolean acceptTerms,
        @AssertTrue(message = "Vui lòng xác nhận học phí") boolean acceptPayment,
        @AssertTrue(message = "Vui lòng xác nhận chính sách hủy và hoàn tiền") boolean acceptCancellation) {}
