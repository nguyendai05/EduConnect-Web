package com.educonnect.job.dto;

import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Quyết định duyệt tin để admin và người đăng xem.
 * Thuộc trang: /admin/job-review-detail.
 */
public record JobReviewResponse(
        Long actorId, // ID tài khoản thực hiện xét duyệt.
        String action, // Thao tác người dùng yêu cầu thực hiện.
        String reason, // Lý do thực hiện thao tác quản trị.
        Long previousVersion, // Phiên bản tin trước khi xét duyệt.
        Long resultingVersion, // Phiên bản tin sau khi xét duyệt.
        Instant createdAt // Thời điểm tạo bản ghi.
) {}
