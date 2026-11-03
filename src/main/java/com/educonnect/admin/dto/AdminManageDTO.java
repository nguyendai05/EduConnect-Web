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
    public record PageResult<T>(
            List<T> rows, // Danh sách các dòng dữ liệu để hiển thị.
            int page, // Chỉ số trang hiện tại, bắt đầu từ 0.
            int size, // Số kết quả tối đa trên mỗi trang.
            long total // Tổng số bản ghi khớp điều kiện lọc.
    ) {
        public int totalPages() { return (int) Math.max(1, (total + size - 1) / size); }
        public boolean hasPrevious() { return page > 0; }
        public boolean hasNext() { return page + 1 < totalPages(); }
        public boolean isEmpty() { return rows.isEmpty(); }
    }

    public record UserRow(
            Long id, // ID tài khoản người dùng.
            String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
            String name, // Tên hiển thị của người dùng.
            String email, // Địa chỉ email của tài khoản.
            Set<String> roles, // Tập hợp vai trò của tài khoản.
            String status, // Trạng thái hiện tại.
            boolean emailVerified, // Cho biết tài khoản đã xác minh email hay chưa.
            String tutorStatus, // Trạng thái xét duyệt hồ sơ gia sư.
            Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
            Instant createdAt // Thời điểm tạo bản ghi.
    ) {
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

    public record OfferingRow(
            Long id, // ID dịch vụ hoặc lớp học.
            String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
            String title, // Tiêu đề hiển thị.
            String tutorName, // Tên hiển thị của gia sư.
            Long tutorId, // ID tài khoản gia sư.
            String type, // Loại dịch vụ: dạy kèm 1-1 hoặc lớp nhóm.
            String subject, // Tên môn học.
            BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
            int sessionCount, // Tổng số buổi học.
            String status, // Trạng thái hiện tại.
            Instant updatedAt // Thời điểm cập nhật gần nhất.
    ) {
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

    public record OrderRow(
            Long id, // ID đơn hàng.
            String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
            String learnerName, // Tên hiển thị của học viên.
            BigDecimal total, // Tổng số tiền.
            String status, // Trạng thái hiện tại.
            String titles, // Các tiêu đề dịch vụ hoặc lớp trong đơn hàng.
            String paymentStatus, // Trạng thái thanh toán của đơn hàng.
            Instant createdAt // Thời điểm tạo bản ghi.
    ) {
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
