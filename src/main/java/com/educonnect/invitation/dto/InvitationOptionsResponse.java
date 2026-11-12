package com.educonnect.invitation.dto;

import com.educonnect.lesson.dto.OfferingCardResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import java.util.List;

/**
 * Tác giả: Trường Đạt.
 * Danh mục và dịch vụ tham khảo lấy từ DB.
 * Thuộc trang: /invitation/create.
 */
public record InvitationOptionsResponse(
        List<InvitationTutorResponse> tutors, // Danh sách gia sư có thể chọn để gửi lời mời.
        OfferingOptionsResponse references, // Các danh mục môn, cấp học, khu vực và hình thức học để tạo lời mời.
        List<OfferingCardResponse> offerings // Danh sách dịch vụ hoặc lớp có thể chọn khi tạo lời mời.
) {}
