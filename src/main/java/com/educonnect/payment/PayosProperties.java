package com.educonnect.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

/** Cấu hình PayOS; khóa lấy từ biến môi trường (.env.local), không commit giá trị thật. */
@ConfigurationProperties("app.payos")
public record PayosProperties(
        @DefaultValue("") String clientId,
        @DefaultValue("") String apiKey,
        @DefaultValue("") String checksumKey,
        @DefaultValue("https://api-merchant.payos.vn") String baseUrl,
        @DefaultValue("http://localhost:8080") String publicBaseUrl,
        @DefaultValue("15m") Duration linkTtl) {

    /** Đã điền đủ ba khóa PayOS chưa. */
    public boolean configured() {
        return !clientId.isBlank() && !apiKey.isBlank() && !checksumKey.isBlank();
    }
}
