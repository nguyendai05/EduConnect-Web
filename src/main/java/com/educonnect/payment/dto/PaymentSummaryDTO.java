package com.educonnect.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;

/** Tóm tắt thanh toán của một hợp đồng cho các trang checkout, qr và result. */
public record PaymentSummaryDTO(Long paymentId, Long contractId, String contractCode, String title, BigDecimal total,
        BigDecimal walletAmount, BigDecimal providerAmount, BigDecimal walletBalance, String status,
        String statusLabel, String payUrl, Instant expiresAt, boolean canPay, String tutorName, short sessionCount) {

    public boolean isPaid() { return "FUNDED".equals(status); }
}
