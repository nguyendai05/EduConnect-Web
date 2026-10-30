package com.educonnect.contract.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Nội dung hợp đồng dạy – học đã ký: các giá trị điền vào mẫu hợp đồng (bản v4.1) từ dữ liệu thực tế của hợp đồng.
 * Chuỗi "theo thỏa thuận" nghĩa là nguồn hình thành hợp đồng không chốt giá trị đó.
 */
public record ContractDocumentDTO(
        Long id, String code, Instant createdAt, String statusLabel, boolean viewerIsTutor,
        String learnerName, String learnerCode, String learnerEmail, String learnerPhone,
        String tutorName, String tutorCode, String tutorEmail, String tutorPhone, String tutorVerification,
        String sourceLabel, String sourceCode,
        String subject, String grade, String mode, String place, String startDate, int sessionCount, String perWeek,
        String duration, List<String> schedule, String terms,
        BigDecimal unitPrice, BigDecimal total, BigDecimal feePercent, BigDecimal feePerSession, BigDecimal tutorNetPerSession,
        int termsVersion, String feePolicy, long autoConfirmHours, Instant payDeadline,
        boolean groupClass, String className, String capacity, int seatCount,
        Instant learnerAcceptedAt, Instant tutorAcceptedAt, Instant activatedAt) {
}
