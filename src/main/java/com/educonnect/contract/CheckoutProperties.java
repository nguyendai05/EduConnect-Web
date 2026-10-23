package com.educonnect.contract;

import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;
import java.math.BigDecimal;
import java.time.Duration;

/** Development proposals; Q02/Q04/Q06 require agreement before release. */
@Validated
@ConfigurationProperties("app.checkout")
public record CheckoutProperties(
        @DefaultValue("0.10") @DecimalMin("0") @DecimalMax("1") @Digits(integer = 1, fraction = 6) BigDecimal platformFeeRate,
        @DefaultValue("DEV-PROPOSAL") @NotBlank @Size(max = 64) String feePolicyVersion,
        @DefaultValue("30m") @NotNull Duration reservationTtl) {
    @AssertTrue public boolean isReservationTtlPositive() {
        return reservationTtl != null && !reservationTtl.isZero() && !reservationTtl.isNegative();
    }
}
