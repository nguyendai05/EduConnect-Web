package com.educonnect.contract.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Nội dung hợp đồng dạy – học đã ký: các giá trị điền vào mẫu hợp đồng (bản v4.1) từ dữ liệu thực tế của hợp đồng.
 * Chuỗi "theo thỏa thuận" nghĩa là nguồn hình thành hợp đồng không chốt giá trị đó.
 */
public record ContractDocumentDTO(
        Long id, // ID hợp đồng.
        String code, // Mã hợp đồng hiển thị cho người dùng.
        Instant createdAt, // Thời điểm tạo bản ghi.
        String statusLabel, // Tên trạng thái để hiển thị trên giao diện.
        boolean viewerIsTutor, // Cho biết người đang xem là gia sư trong hợp đồng hay không.
        String learnerName, // Tên hiển thị của học viên.
        String learnerCode, // Mã công khai của học viên.
        String learnerEmail, // Email của học viên.
        String learnerPhone, // Số điện thoại của học viên.
        String tutorName, // Tên hiển thị của gia sư.
        String tutorCode, // Mã công khai của gia sư.
        String tutorEmail, // Email của gia sư.
        String tutorPhone, // Số điện thoại của gia sư.
        String tutorVerification, // Nội dung thể hiện tình trạng xác minh của gia sư.
        String sourceLabel, // Tên loại nguồn hình thành đơn hàng hoặc hợp đồng.
        String sourceCode, // Mã công khai của nguồn hình thành hợp đồng.
        String subject, // Tên môn học.
        String grade, // Tên cấp học.
        String mode, // Tên hình thức học.
        String place, // Địa điểm hoặc khu vực học được ghi trong hợp đồng.
        String startDate, // Ngày bắt đầu học dưới dạng hiển thị.
        int sessionCount, // Tổng số buổi học.
        String perWeek, // Số buổi học mỗi tuần dưới dạng hiển thị.
        String duration, // Thời lượng mỗi buổi học dưới dạng hiển thị.
        List<String> schedule, // Các khung lịch học dưới dạng văn bản.
        String terms, // Nội dung điều khoản đã thống nhất trong hợp đồng.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        BigDecimal total, // Tổng số tiền.
        BigDecimal feePercent, // Tỷ lệ phí nền tảng, tính theo phần trăm.
        BigDecimal feePerSession, // Phí nền tảng thu trên mỗi buổi học.
        BigDecimal tutorNetPerSession, // Số tiền gia sư thực nhận mỗi buổi sau phí nền tảng.
        int termsVersion, // Số phiên bản điều khoản để xác định nội dung người dùng đồng ý.
        String feePolicy, // Nội dung chính sách thu phí nền tảng.
        long autoConfirmHours, // Số giờ chờ trước khi hệ thống tự xác nhận buổi học.
        Instant payDeadline, // Hạn cuối thanh toán hợp đồng.
        boolean groupClass, // Cho biết hợp đồng thuộc lớp nhóm hay không.
        String className, // Tên lớp nhóm.
        String capacity, // Sĩ số tối đa của lớp nhóm.
        int seatCount, // Số chỗ học đăng ký trong hợp đồng hoặc giỏ hàng.
        Instant learnerAcceptedAt, // Thời điểm học viên đồng ý điều khoản.
        Instant tutorAcceptedAt, // Thời điểm gia sư đồng ý điều khoản.
        Instant activatedAt // Thời điểm hợp đồng bắt đầu có hiệu lực.
) {
}
