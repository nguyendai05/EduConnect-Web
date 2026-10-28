package com.educonnect.job.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Nguồn JOB đã kiểm/khóa, Huy dùng trong transaction tạo đơn.
 * Thuộc trang: nguồn JOB_APPLICATION từ /job/detail.
 */
public record JobSourceResponse(String sourceKind, Long sourceId, Long sourceVersion, Long applicationId,
        Long applicationVersion, Long learnerId, Long tutorId, Long subjectId, Long gradeLevelId,
        Long areaId, Long deliveryModeId, BigDecimal unitPrice, Short sessionCount, Integer termsVersion,
        String termsText, Instant learnerAcceptedAt, Instant tutorAcceptedAt) {}
