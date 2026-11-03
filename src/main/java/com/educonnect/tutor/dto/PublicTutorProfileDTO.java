package com.educonnect.tutor.dto;

import com.educonnect.lesson.dto.OfferingCardResponse;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DAI-02 / A02 cho trang công khai /tutor/profile: chỉ gồm thông tin được phép công khai của gia sư đã được duyệt.
 * Không có email, số điện thoại, minh chứng hay lý do duyệt.
 */
public record PublicTutorProfileDTO(
        Long id, // ID tài khoản gia sư.
        String displayName, // Tên người dùng hiển thị trên giao diện.
        String headline, // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
        int experienceYears, // Số năm kinh nghiệm giảng dạy của gia sư.
        String bio, // Nội dung giới thiệu bản thân.
        List<String> subjects, // Danh sách môn gia sư có thể dạy.
        List<String> gradeLevels, // Danh sách cấp học.
        List<String> areas, // Danh sách khu vực học.
        List<String> deliveryModes, // Danh sách hình thức gia sư có thể dạy.
        Page<OfferingCardResponse> offerings // Các dịch vụ hoặc lớp học của gia sư.
) {

    public String initials() {
        String[] parts = displayName == null ? new String[0] : displayName.strip().split("\\s+");
        if (parts.length == 0 || parts[0].isEmpty()) return "?";
        String first = parts[0].substring(0, 1);
        return (parts.length == 1 ? first : first + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    public String experienceLabel() {
        return experienceYears <= 0 ? "Mới vào nghề" : experienceYears + " năm kinh nghiệm";
    }
}
