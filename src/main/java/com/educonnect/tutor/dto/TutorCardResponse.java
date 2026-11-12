package com.educonnect.tutor.dto;

import java.math.BigDecimal;

/** Tác giả: Trường Đạt. Một gia sư và giá thấp nhất trong các dịch vụ khớp bộ lọc. */
public record TutorCardResponse(
        Long id, // ID tài khoản gia sư.
        String displayName, // Tên người dùng hiển thị trên giao diện.
        String headline, // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
        Short experienceYears, // Số năm kinh nghiệm giảng dạy của gia sư.
        BigDecimal priceFrom, // Giá thấp nhất trong các dịch vụ của gia sư khớp bộ lọc.
        Long offeringCount // Số dịch vụ hoặc lớp của gia sư khớp bộ lọc.
) {}
