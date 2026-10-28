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
public record JobResponse(Long id, String publicCode, Long learnerId, String learnerName,
        String title, String description, Long subjectId, Long gradeLevelId, Long areaId, Long deliveryModeId,
        String subject, String grade, String area, String deliveryMode, BigDecimal budgetPerSession,
        Short sessionCount, JobPostStatus status, Long version, Instant createdAt, long applicationCount,
        boolean owner, boolean canEdit, boolean canSubmit, boolean canClose, boolean canApply,
        String reviewReason, JobSelectionResponse selection) {

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
