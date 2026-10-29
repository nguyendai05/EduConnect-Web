package com.educonnect.job.dto;

import com.educonnect.job.domain.JobApplicationStatus;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Chỉ người đăng và chính ứng viên được đọc đề xuất ứng tuyển.
 * Thuộc trang: /job/detail và /job/applicants.
 */
public record JobApplicationResponse(Long id, Long tutorId, String tutorName, String headline,
        BigDecimal proposedUnitPrice, String message, JobApplicationStatus status, Long version,
        Instant createdAt, boolean canSelect, boolean canReject, boolean canWithdraw, boolean canEdit) {
    public String getStatusLabel() {
        return switch (status) {
            case SUBMITTED -> "Đã ứng tuyển";
            case SELECTED -> "Đã được chọn";
            case REJECTED -> "Không được chọn";
            case WITHDRAWN -> "Đã rút ứng tuyển";
        };
    }
}
