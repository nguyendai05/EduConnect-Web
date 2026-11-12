package com.educonnect.lesson.dto;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import java.math.BigDecimal;
import java.time.Instant;

/** Tác giả: Trường Đạt. Dữ liệu công khai dùng cho home, khám phá và chi tiết dịch vụ. */
public record OfferingCardResponse(
        Long id, // ID dịch vụ hoặc lớp học.
        String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
        Long tutorId, // ID tài khoản gia sư.
        String tutorName, // Tên hiển thị của gia sư.
        String tutorHeadline, // Tiêu đề giới thiệu ngắn của gia sư cung cấp dịch vụ.
        OfferingType offeringType, // Loại dịch vụ: dạy kèm 1-1 hoặc lớp nhóm.
        String title, // Tiêu đề hiển thị.
        String subject, // Tên môn học.
        String grade, // Tên cấp học.
        String area, // Tên khu vực học.
        String deliveryMode, // Tên hình thức học, chẳng hạn trực tuyến hoặc trực tiếp.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        String currency, // Mã loại tiền tệ của học phí.
        Short sessionCount, // Tổng số buổi học.
        Short durationMinutes, // Thời lượng mỗi buổi học, tính bằng phút.
        OfferingStatus status, // Trạng thái hiện tại.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        Instant publishedAt // Thời điểm dịch vụ hoặc lớp được công khai.
) {
    public static OfferingCardResponse from(Offering offering) {
        var tutor = offering.getTutorReference();
        return new OfferingCardResponse(
                offering.getId(), offering.getPublicCode(), offering.getTutorId(),
                tutor.getAccount().getDisplayName(), tutor.getHeadline(), offering.getOfferingType(),
                offering.getTitle(), offering.getSubjectReference().getName(),
                offering.getGradeLevelReference().getName(), offering.getAreaReference().getName(),
                offering.getDeliveryModeReference().getName(), offering.getUnitPrice(), offering.getCurrency(),
                offering.getSessionCount(), offering.getDurationMinutes(), offering.getStatus(),
                offering.getVersion(), offering.getPublishedAt()
        );
    }

    public boolean isGroupClass() {
        return offeringType == OfferingType.GROUP_CLASS;
    }

    public BigDecimal getPackagePrice() {
        return unitPrice.multiply(BigDecimal.valueOf(sessionCount));
    }
}
