package com.educonnect.job.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Thỏa thuận JOB bất biến, chỉ hiển thị cho hai bên và admin.
 * Thuộc trang: /job/detail và /admin/job-review-detail.
 */
public record JobSelectionResponse(Long applicationId, Long tutorId, String tutorName, BigDecimal unitPrice,
        Integer termsVersion, String termsText, Instant selectedAt, boolean sourceUsed) {}
