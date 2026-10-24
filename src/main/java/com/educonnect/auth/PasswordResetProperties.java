package com.educonnect.auth;

import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import java.net.URI;
import java.time.Duration;

@Validated
@ConfigurationProperties("app.password-reset")
public record PasswordResetProperties(@NotNull Duration ttl, @NotNull Duration resendCooldown,
                                      @Min(1) int maxSendsPerHour, @NotNull URI baseUrl) {
    @AssertTrue(message = "Reset TTL/cooldown must be positive; base-url must be an absolute HTTP(S) URL without query or fragment")
    public boolean isValid() {
        return ttl != null && !ttl.isNegative() && !ttl.isZero() && resendCooldown != null
                && !resendCooldown.isNegative() && !resendCooldown.isZero() && baseUrl != null
                && baseUrl.getHost() != null && baseUrl.getUserInfo() == null && baseUrl.getQuery() == null
                && baseUrl.getFragment() == null && ("https".equals(baseUrl.getScheme()) || "http".equals(baseUrl.getScheme()));
    }
}
