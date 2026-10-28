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
        List<InvitationTutorResponse> tutors,
        OfferingOptionsResponse references,
        List<OfferingCardResponse> offerings
) {}
