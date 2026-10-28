package com.educonnect.payment;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

/** Gọi API PayOS: tạo link thanh toán, hỏi trạng thái và kiểm chữ ký webhook. */
@Component
@Profile("db-dev")
public class PayosClient {
    /** Kết quả tạo link: mã link PayOS dùng để mở trang thanh toán. */
    public record Link(String paymentLinkId) {}

    private PayosProperties properties;
    private RestClient http;

    public PayosClient(PayosProperties properties) {
        this.properties = properties;
        this.http = RestClient.builder().baseUrl(properties.baseUrl())
                .defaultHeader("x-client-id", properties.clientId())
                .defaultHeader("x-api-key", properties.apiKey()).build();
    }

    public boolean configured() { return properties.configured(); }

    /** Địa chỉ trang thanh toán (có mã QR) do PayOS lưu trữ. */
    public String payUrl(String paymentLinkId) { return "https://pay.payos.vn/web/" + paymentLinkId; }

    /** Tạo link thanh toán cho một lần thử; amount là VND nguyên đồng. */
    public Link createLink(long orderCode, long amount, String description, String returnUrl, String cancelUrl, Instant expiresAt) {
        requireConfigured();
        String signed = "amount=" + amount + "&cancelUrl=" + cancelUrl + "&description=" + description
                + "&orderCode=" + orderCode + "&returnUrl=" + returnUrl;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", amount);
        body.put("description", description);
        body.put("returnUrl", returnUrl);
        body.put("cancelUrl", cancelUrl);
        body.put("expiredAt", expiresAt.getEpochSecond());
        body.put("signature", hmac(signed));
        JsonNode response = http.post().uri("/v2/payment-requests").contentType(MediaType.APPLICATION_JSON)
                .body(body).retrieve().body(JsonNode.class);
        if (response == null || !"00".equals(response.path("code").asText()) || response.path("data").path("paymentLinkId").isMissingNode()) {
            throw new IllegalArgumentException("Không tạo được liên kết thanh toán PayOS");
        }
        return new Link(response.path("data").path("paymentLinkId").asText());
    }

    /** Hỏi PayOS trạng thái một lần thử: PENDING, PAID, CANCELLED hoặc EXPIRED. */
    public String status(long orderCode) {
        requireConfigured();
        JsonNode response = http.get().uri("/v2/payment-requests/{code}", orderCode).retrieve().body(JsonNode.class);
        return response == null ? "PENDING" : response.path("data").path("status").asText("PENDING");
    }

    /** Kiểm chữ ký webhook: HMAC-SHA256 của các trường trong data, sắp theo tên, bằng checksum key. */
    public boolean verify(JsonNode webhook) {
        JsonNode data = webhook.path("data");
        if (!properties.configured() || !data.isObject()) return false;
        Map<String, String> sorted = new TreeMap<>();
        data.fields().forEachRemaining(e -> sorted.put(e.getKey(), e.getValue().isNull() ? "" : e.getValue().asText()));
        StringBuilder text = new StringBuilder();
        sorted.forEach((k, v) -> text.append(text.length() == 0 ? "" : "&").append(k).append('=').append(v));
        byte[] expected = hmac(text.toString()).getBytes(StandardCharsets.UTF_8);
        byte[] actual = webhook.path("signature").asText("").getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    private void requireConfigured() {
        if (!properties.configured()) throw new IllegalArgumentException("Chưa cấu hình PayOS (EDUCONNECT_PAYOS_*)");
    }

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.checksumKey().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
