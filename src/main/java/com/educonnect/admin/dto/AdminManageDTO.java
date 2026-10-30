package com.educonnect.admin.dto;

import com.educonnect.common.util.DateLabels;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** DAI-03: dữ liệu trang Quản lý nền tảng (người dùng, dịch vụ/lớp, đơn đăng ký), chỉ để hiển thị. */
public final class AdminManageDTO {
    private AdminManageDTO() {}

    /** Một trang kết quả. */
    public record PageResult<T>(List<T> rows, int page, int size, long total) {
        public int totalPages() { return (int) Math.max(1, (total + size - 1) / size); }
        public boolean hasPrevious() { return page > 0; }
        public boolean hasNext() { return page + 1 < totalPages(); }
        public boolean isEmpty() { return rows.isEmpty(); }
    }

    public record UserRow(Long id, String publicCode, String name, String email, Set<String> roles, String status,
                          boolean emailVerified, String tutorStatus, Long version, Instant createdAt) {
        public String statusLabel() {
            return switch (status) { case "ACTIVE" -> "Đang hoạt động"; case "LOCKED" -> "Đang khóa"; default -> "Vô hiệu hóa"; };
        }
        public String badge() {
            return switch (status) { case "ACTIVE" -> "badge--success"; case "LOCKED" -> "badge--warning"; default -> "badge--neutral"; };
        }
        public String roleLabel() {
            var labels = new java.util.ArrayList<String>();
            if (roles.contains("ADMIN")) labels.add("Quản trị");
            if (roles.contains("TUTOR")) labels.add("Gia sư");
            if (roles.contains("LEARNER")) labels.add("Học viên / Phụ huynh");
            return labels.isEmpty() ? "—" : String.join(", ", labels);
        }
        public String tutorLabel() {
            if (tutorStatus == null) return null;
            return switch (tutorStatus) {
                case "APPROVED" -> "Hồ sơ gia sư: đã duyệt";
                case "PENDING" -> "Hồ sơ gia sư: chờ duyệt";
                case "REJECTED" -> "Hồ sơ gia sư: cần bổ sung";
                default -> "Hồ sơ gia sư: bản nháp";
            };
        }
        public boolean admin() { return roles.contains("ADMIN"); }
        public String createdLabel() { return DateLabels.vietnam(createdAt); }
    }

    public record OfferingRow(Long id, String publicCode, String title, String tutorName, Long tutorId, String type,
                              String subject, BigDecimal unitPrice, int sessionCount, String status, Instant updatedAt) {
        public String typeLabel() { return "GROUP_CLASS".equals(type) ? "Lớp nhóm" : "Dạy kèm 1-1"; }
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
        public String priceLabel() { return money(unitPrice) + "/buổi"; }
        public String updatedLabel() { return DateLabels.vietnam(updatedAt); }
    }

    public record OrderRow(Long id, String publicCode, String learnerName, BigDecimal total, String status,
                           String titles, String paymentStatus, Instant createdAt) {
        public String statusLabel() {
            return switch (status) {
                case "AWAITING_PAYMENT" -> "Chờ thanh toán"; case "PAID" -> "Đã thanh toán"; case "IN_PROGRESS" -> "Đang thực hiện";
                case "COMPLETED" -> "Hoàn tất"; case "CANCELLATION_PENDING" -> "Chờ hủy"; default -> "Đã hủy";
            };
        }
        public String badge() {
            return switch (status) { case "COMPLETED", "PAID", "IN_PROGRESS" -> "badge--success"; case "AWAITING_PAYMENT", "CANCELLATION_PENDING" -> "badge--warning";
                default -> "badge--neutral"; };
        }
        public String paymentLabel() {
            if (paymentStatus == null) return "Chưa có thanh toán";
            return switch (paymentStatus) {
                case "PENDING" -> "Thanh toán: đang chờ"; case "FUNDED" -> "Thanh toán: đã nhận tiền"; case "FAILED" -> "Thanh toán: thất bại";
                case "CANCELLED" -> "Thanh toán: đã hủy"; case "REFUND_PENDING" -> "Thanh toán: chờ hoàn"; case "PARTIALLY_REFUNDED" -> "Thanh toán: hoàn một phần";
                default -> "Thanh toán: đã hoàn";
            };
        }
        public String totalLabel() { return money(total); }
        public String createdLabel() { return DateLabels.vietnam(createdAt); }
    }

    static String money(BigDecimal value) {
        return NumberFormat.getIntegerInstance(Locale.forLanguageTag("vi-VN")).format(value) + " ₫";
    }
}
