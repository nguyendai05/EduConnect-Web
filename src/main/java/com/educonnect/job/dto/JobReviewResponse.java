package com.educonnect.job.dto;

import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Quyết định duyệt tin để admin và người đăng xem.
 * Thuộc trang: /admin/job-review-detail.
 */
public record JobReviewResponse(Long actorId, String action, String reason, Long previousVersion,
        Long resultingVersion, Instant createdAt) {}
