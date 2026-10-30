package com.educonnect.user.dto;

import java.util.List;

/**
 * DAI-02 / A02: dữ liệu hồ sơ cá nhân cấp cho giao diện. Không chứa passwordHash hay token.
 *
 * @param learner      true nếu tài khoản có hồ sơ người học (cấp học/khu vực mặc định).
 * @param version      phiên bản user_accounts, gửi lại khi lưu để phát hiện sửa chồng.
 * @param roleLabels   nhãn vai trò hiển thị (không dùng làm quyền).
 */
public record AccountProfileDTO(Long userId, String publicCode, String email, String displayName, String phone,
                                String bio, Long version, List<String> roleLabels, boolean tutor, boolean learner,
                                String learnerKind, Long gradeLevelId, Long areaId,
                                List<Option> gradeLevels, List<Option> areas) {
    public record Option(Long id, String name) {}

    public String initials() {
        String[] parts = displayName == null ? new String[0] : displayName.strip().split("\\s+");
        if (parts.length == 0 || parts[0].isEmpty()) return "?";
        String first = parts[0].substring(0, 1);
        return (parts.length == 1 ? first : first + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
