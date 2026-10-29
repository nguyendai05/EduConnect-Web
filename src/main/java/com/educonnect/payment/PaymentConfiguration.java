package com.educonnect.payment;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("db-dev")
@EnableConfigurationProperties(PayosProperties.class)
class PaymentConfiguration {}
