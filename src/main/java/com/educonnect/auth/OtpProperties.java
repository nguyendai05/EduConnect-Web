package com.educonnect.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties("app.email-verification")
public record OtpProperties(Duration ttl, Duration resendCooldown, int maxAttempts, int maxSendsPerHour) {
    public OtpProperties {
        if (ttl == null || ttl.isNegative() || ttl.isZero() || resendCooldown == null
                || resendCooldown.isNegative() || resendCooldown.isZero() || maxAttempts < 1 || maxSendsPerHour < 1) {
            throw new IllegalArgumentException("Cấu hình thời hạn và giới hạn OTP phải lớn hơn 0.");
        }
    }
}
