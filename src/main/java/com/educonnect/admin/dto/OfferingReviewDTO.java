package com.educonnect.admin.dto;

import com.educonnect.common.util.DateLabels;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

/** DAI-03: một khóa học (dịch vụ/lớp) cho admin xem và duyệt. */
public record OfferingReviewDTO(
        Long id, // ID dịch vụ hoặc lớp học.
        String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
        String title, // Tiêu đề hiển thị.
        String description, // Nội dung mô tả chi tiết.
        String termsText, // Nội dung điều khoản học.
        Long tutorId, // ID tài khoản gia sư.
        String tutorName, // Tên hiển thị của gia sư.
        String tutorProfileStatus, // Trạng thái xét duyệt hồ sơ của gia sư.
        boolean tutorActive, // Cho biết tài khoản gia sư đang hoạt động hay không.
        String type, // Loại dịch vụ: dạy kèm 1-1 hoặc lớp nhóm.
        String subject, // Tên môn học.
        String grade, // Tên cấp học.
        String area, // Tên khu vực học.
        String mode, // Tên hình thức học.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        int sessionCount, // Tổng số buổi học.
        int durationMinutes, // Thời lượng mỗi buổi học, tính bằng phút.
        Integer capacity, // Sĩ số tối đa của lớp nhóm.
        LocalDate startsOn, // Ngày bắt đầu lớp học.
        LocalDate endsOn, // Ngày kết thúc lớp học.
        String status, // Trạng thái hiện tại.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        String reviewNote, // Ghi chú hoặc lý do của người xét duyệt.
        Instant reviewedAt, // Thời điểm xét duyệt.
        String reviewerName, // Tên người xét duyệt.
        Instant updatedAt, // Thời điểm cập nhật gần nhất.
        List<Slot> slots // Danh sách khung lịch học gồm thứ, giờ và múi giờ.
) {

    public record Slot(
            int weekday, // Thứ trong tuần: 1 là thứ Hai, 7 là Chủ nhật.
            String start, // Giờ bắt đầu buổi học dưới dạng hiển thị.
            String end, // Giờ kết thúc buổi học dưới dạng hiển thị.
            String timeZone // Múi giờ IANA áp dụng cho lịch học, chẳng hạn Asia/Ho_Chi_Minh.
    ) {
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
