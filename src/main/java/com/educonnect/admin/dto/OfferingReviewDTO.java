package com.educonnect.admin.dto;

import com.educonnect.common.util.DateLabels;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

/** DAI-03: một khóa học (dịch vụ/lớp) cho admin xem và duyệt. */
public record OfferingReviewDTO(Long id, String publicCode, String title, String description, String termsText,
                                Long tutorId, String tutorName, String tutorProfileStatus, boolean tutorActive,
                                String type, String subject, String grade, String area, String mode,
                                BigDecimal unitPrice, int sessionCount, int durationMinutes, Integer capacity,
                                LocalDate startsOn, LocalDate endsOn, String status, Long version,
                                String reviewNote, Instant reviewedAt, String reviewerName, Instant updatedAt,
                                List<Slot> slots) {

    public record Slot(int weekday, String start, String end, String timeZone) {
        public String dayLabel() { return weekday == 7 ? "Chủ nhật" : "Thứ " + (weekday + 1); }
    }

    public boolean groupClass() { return "GROUP_CLASS".equals(type); }
    public String typeLabel() { return groupClass() ? "Lớp nhóm" : "Dạy kèm 1-1"; }

    public String statusLabel() {
        return switch (status) {
            case "DRAFT" -> "Bản nháp"; case "IN_REVIEW" -> "Chờ duyệt"; case "PUBLISHED" -> "Đang công khai";
            case "UNPUBLISHED" -> "Ngừng công khai"; case "REJECTED" -> "Bị từ chối"; default -> "Đã đóng";
        };
    }

    public String badge() {
        return switch (status) { case "PUBLISHED" -> "badge--success"; case "IN_REVIEW" -> "badge--warning";
            case "REJECTED" -> "badge--danger"; default -> "badge--neutral"; };
    }

    public String priceLabel() {
        return NumberFormat.getIntegerInstance(Locale.forLanguageTag("vi-VN")).format(unitPrice) + " ₫/buổi";
    }

    public String totalLabel() {
        return NumberFormat.getIntegerInstance(Locale.forLanguageTag("vi-VN")).format(unitPrice.multiply(BigDecimal.valueOf(sessionCount))) + " ₫";
    }

    public String updatedLabel() { return DateLabels.vietnam(updatedAt); }
    public String reviewedLabel() { return DateLabels.vietnam(reviewedAt); }
}
