package com.educonnect.tutor.dto;

import com.educonnect.lesson.dto.OfferingCardResponse;
import org.springframework.data.domain.Page;

/** Tác giả: Trường Đạt. Hồ sơ công khai tối thiểu; A02/A08 bổ sung sau khi được bàn giao. */
public record TutorProfileResponse(
        Long id, // ID tài khoản gia sư.
        String displayName, // Tên người dùng hiển thị trên giao diện.
        String headline, // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
        Short experienceYears, // Số năm kinh nghiệm giảng dạy của gia sư.
        Page<OfferingCardResponse> offerings // Các dịch vụ hoặc lớp học của gia sư.
) {}
