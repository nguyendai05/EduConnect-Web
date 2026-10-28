package com.educonnect.tutor.dto;

import com.educonnect.lesson.dto.OfferingCardResponse;
import org.springframework.data.domain.Page;

/** Tác giả: Trường Đạt. Hồ sơ công khai tối thiểu; A02/A08 bổ sung sau khi được bàn giao. */
public record TutorProfileResponse(
        Long id,
        String displayName,
        String headline,
        Short experienceYears,
        Page<OfferingCardResponse> offerings
) {}
