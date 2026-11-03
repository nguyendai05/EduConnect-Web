package com.educonnect.job.dto;

import com.educonnect.job.domain.JobApplicationStatus;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Chỉ người đăng và chính ứng viên được đọc đề xuất ứng tuyển.
 * Thuộc trang: /job/detail và /job/applicants.
 */
public record JobApplicationResponse(
        Long id, // ID đơn ứng tuyển.
        Long tutorId, // ID tài khoản gia sư.
        String tutorName, // Tên hiển thị của gia sư.
        String headline, // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
        BigDecimal proposedUnitPrice, // Học phí mỗi buổi được đề xuất khi thương lượng.
        String message, // Lời nhắn gia sư gửi khi ứng tuyển.
        JobApplicationStatus status, // Trạng thái hiện tại.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        Instant createdAt, // Thời điểm tạo bản ghi.
        boolean canSelect, // Cho biết chủ tin có thể chọn gia sư ứng tuyển hay không.
        boolean canReject, // Cho biết chủ tin có thể từ chối đơn ứng tuyển hay không.
        boolean canWithdraw, // Cho biết gia sư có thể rút đơn ứng tuyển hay không.
        boolean canEdit // Cho biết người xem có thể chỉnh sửa hay không.
) {
    public String getStatusLabel() {
        return switch (status) {
            case SUBMITTED -> "Đã ứng tuyển";
            case SELECTED -> "Đã được chọn";
            case REJECTED -> "Không được chọn";
            case WITHDRAWN -> "Đã rút ứng tuyển";
        };
    }
}
