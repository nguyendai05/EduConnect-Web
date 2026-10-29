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
        @DefaultValue("") String returnBaseUrl,
        @DefaultValue("15m") Duration linkTtl) {

    /** Địa chỉ trình duyệt được đưa về sau khi thanh toán; để trống thì dùng địa chỉ công khai (publicBaseUrl). */
    public String returnBase() {
        return returnBaseUrl.isBlank() ? publicBaseUrl : returnBaseUrl;
    }

    /** Đã điền đủ ba khóa PayOS chưa. */
    public boolean configured() {
        return !clientId.isBlank() && !apiKey.isBlank() && !checksumKey.isBlank();
    }
}
