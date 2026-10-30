package com.educonnect.contract;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Bật tác vụ định kỳ (tự xác nhận buổi học quá hạn) chỉ khi chạy với DB. */
@Configuration
@Profile("db-dev")
@EnableScheduling
class SchedulingConfiguration {}
