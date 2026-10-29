package com.educonnect.contract;

import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;
import java.math.BigDecimal;
import java.time.Duration;

/** Development proposals; Q02/Q04/Q05/Q06 require agreement before release (refundRate là đề xuất tạm cho Q05). */
@Validated
@ConfigurationProperties("app.checkout")
public record CheckoutProperties(
        @DefaultValue("0.10") @DecimalMin("0") @DecimalMax("1") @Digits(integer = 1, fraction = 6) BigDecimal platformFeeRate,
        @DefaultValue("DEV-PROPOSAL") @NotBlank @Size(max = 64) String feePolicyVersion,
        @DefaultValue("30m") @NotNull Duration reservationTtl,
        @DefaultValue("1") @DecimalMin("0.000001") @DecimalMax("1") @Digits(integer = 1, fraction = 6) BigDecimal refundRate,
        @DefaultValue("48h") @NotNull Duration autoConfirmAfter) {
    @AssertTrue public boolean isReservationTtlPositive() {
        return reservationTtl != null && !reservationTtl.isZero() && !reservationTtl.isNegative();
    }
}
