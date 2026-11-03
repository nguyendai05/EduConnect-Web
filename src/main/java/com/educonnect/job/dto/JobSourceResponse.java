package com.educonnect.job.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tác giả: Trường Đạt.
 * Nguồn JOB đã kiểm/khóa, Huy dùng trong transaction tạo đơn.
 * Thuộc trang: nguồn JOB_APPLICATION từ /job/detail.
 */
public record JobSourceResponse(
        String sourceKind, // Loại nguồn dùng để tạo hợp đồng, chẳng hạn lời mời hoặc tin tìm gia sư.
        Long sourceId, // ID nguồn dùng để tạo hợp đồng.
        Long sourceVersion, // Phiên bản nguồn để kiểm tra thay đổi khi tạo hợp đồng.
        Long applicationId, // ID đơn ứng tuyển của gia sư.
        Long applicationVersion, // Phiên bản đơn ứng tuyển để phát hiện cập nhật đồng thời.
        Long learnerId, // ID tài khoản học viên.
        Long tutorId, // ID tài khoản gia sư.
        Long subjectId, // ID môn học.
        Long gradeLevelId, // ID cấp học.
        Long areaId, // ID khu vực học.
        Long deliveryModeId, // ID hình thức học.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        Short sessionCount, // Tổng số buổi học.
        Integer termsVersion, // Số phiên bản điều khoản để xác định nội dung người dùng đồng ý.
        String termsText, // Nội dung điều khoản học.
        Instant learnerAcceptedAt, // Thời điểm học viên đồng ý điều khoản.
        Instant tutorAcceptedAt // Thời điểm gia sư đồng ý điều khoản.
) {}
