package com.educonnect.job.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Thỏa thuận JOB bất biến, chỉ hiển thị cho hai bên và admin.
 * Thuộc trang: /job/detail và /admin/job-review-detail.
 */
public record JobSelectionResponse(
        Long applicationId, // ID đơn ứng tuyển của gia sư.
        Long tutorId, // ID tài khoản gia sư.
        String tutorName, // Tên hiển thị của gia sư.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        Integer termsVersion, // Số phiên bản điều khoản để xác định nội dung người dùng đồng ý.
        String termsText, // Nội dung điều khoản học.
        Instant selectedAt, // Thời điểm chủ tin chọn gia sư.
        boolean sourceUsed // Cho biết nguồn đã được dùng để tạo hợp đồng hay chưa.
) {}
