package com.educonnect.job.dto;

import com.educonnect.job.domain.JobPostStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu tin an toàn để hiển thị, không trả tài khoản riêng tư.
 * Thuộc trang: các trang /job và duyệt tin /admin/job-review-*.
 */
public record JobResponse(
        Long id, // ID tin tìm gia sư.
        String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
        Long learnerId, // ID tài khoản học viên.
        String learnerName, // Tên hiển thị của học viên.
        String title, // Tiêu đề hiển thị.
        String description, // Nội dung mô tả chi tiết.
        Long subjectId, // ID môn học.
        Long gradeLevelId, // ID cấp học.
        Long areaId, // ID khu vực học.
        Long deliveryModeId, // ID hình thức học.
        String subject, // Tên môn học.
        String grade, // Tên cấp học.
        String area, // Tên khu vực học.
        String deliveryMode, // Tên hình thức học, chẳng hạn trực tuyến hoặc trực tiếp.
        BigDecimal budgetPerSession, // Ngân sách dự kiến cho mỗi buổi học.
        Short sessionCount, // Tổng số buổi học.
        JobPostStatus status, // Trạng thái hiện tại.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        Instant createdAt, // Thời điểm tạo bản ghi.
        long applicationCount, // Số đơn ứng tuyển vào tin tìm gia sư.
        boolean owner, // Cho biết người đang xem có phải chủ tin tìm gia sư hay không.
        boolean canEdit, // Cho biết người xem có thể chỉnh sửa hay không.
        boolean canSubmit, // Cho biết có đủ điều kiện gửi duyệt hay không.
        boolean canClose, // Cho biết chủ tin có thể đóng tin tìm gia sư hay không.
        boolean canApply, // Cho biết người xem có thể ứng tuyển vào tin hay không.
        String reviewReason, // Lý do xét duyệt tin tìm gia sư.
        JobSelectionResponse selection // Thông tin gia sư được chọn và điều khoản đã thống nhất.
) {

    public String getStatusLabel() {
        return switch (status) {
            case DRAFT -> "Bản nháp";
            case PENDING -> "Chờ duyệt";
            case OPEN -> "Đang nhận ứng tuyển";
            case MATCHED -> "Đã chọn gia sư";
            case CLOSED -> "Đã đóng";
            case REJECTED -> "Bị từ chối duyệt";
        };
    }

    public String getCreatedAtLabel() {
        return DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Ho_Chi_Minh")).format(createdAt);
    }
}
