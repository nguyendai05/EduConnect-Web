package com.educonnect.auth;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.*;
import java.time.Clock;

@Configuration
@Profile("db-dev")
@EnableConfigurationProperties({OtpProperties.class, PasswordResetProperties.class})
public class OtpConfiguration {
    @Bean Clock verificationClock() { return Clock.systemUTC(); }
}
