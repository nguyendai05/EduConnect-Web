package com.educonnect.contract;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("db-dev")
@EnableConfigurationProperties(CheckoutProperties.class)
class CheckoutConfiguration {}
