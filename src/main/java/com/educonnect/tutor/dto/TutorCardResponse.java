package com.educonnect.tutor.dto;

import java.math.BigDecimal;

/** Tác giả: Trường Đạt. Một gia sư và giá thấp nhất trong các dịch vụ khớp bộ lọc. */
public record TutorCardResponse(
        Long id,
        String displayName,
        String headline,
        Short experienceYears,
        BigDecimal priceFrom,
        Long offeringCount
) {}
