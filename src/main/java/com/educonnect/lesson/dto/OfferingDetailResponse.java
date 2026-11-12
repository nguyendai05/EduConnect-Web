package com.educonnect.lesson.dto;

import java.time.LocalDate;
import java.util.List;

/** Tác giả: Trường Đạt. Chi tiết công khai, không chứa thông tin tài khoản/xét duyệt riêng tư. */
public record OfferingDetailResponse(
        OfferingCardResponse offering, // Thông tin tóm tắt của dịch vụ hoặc lớp học.
        String description, // Nội dung mô tả chi tiết.
        String termsText, // Nội dung điều khoản học.
        Integer termsVersion, // Số phiên bản điều khoản để xác định nội dung người dùng đồng ý.
        Integer capacity, // Sĩ số tối đa của lớp nhóm.
        LocalDate startsOn, // Ngày bắt đầu lớp học.
        LocalDate endsOn, // Ngày kết thúc lớp học.
        List<OfferingTimeSlotResponse> slots, // Danh sách khung lịch học gồm thứ, giờ và múi giờ.
        long availableSeats, // Số chỗ còn có thể đăng ký.
        String registrationIssue // Lý do hiện chưa thể đăng ký dịch vụ hoặc lớp.
) {
    public OfferingDetailResponse {
        slots = List.copyOf(slots);
    }
}
