package com.educonnect.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;

/** Tóm tắt thanh toán của một hợp đồng cho các trang checkout, qr và result. */
public record PaymentSummaryDTO(
        Long paymentId, // ID giao dịch thanh toán.
        Long contractId, // ID hợp đồng học.
        String contractCode, // Mã hợp đồng liên quan đến thanh toán.
        String title, // Tiêu đề hiển thị.
        BigDecimal total, // Tổng số tiền.
        BigDecimal walletAmount, // Số tiền thanh toán bằng ví nội bộ.
        BigDecimal providerAmount, // Số tiền cần thanh toán qua nhà cung cấp bên ngoài.
        BigDecimal walletBalance, // Số dư ví hiện có của người thanh toán.
        String status, // Trạng thái hiện tại.
        String statusLabel, // Tên trạng thái để hiển thị trên giao diện.
        String payUrl, // Đường dẫn đến trang thanh toán của nhà cung cấp.
        Instant expiresAt, // Thời điểm hết hạn.
        boolean canPay, // Cho biết người dùng có thể thực hiện thanh toán hay không.
        String tutorName, // Tên hiển thị của gia sư.
        short sessionCount // Tổng số buổi học.
) {

    public boolean isPaid() { return "FUNDED".equals(status); }
}
