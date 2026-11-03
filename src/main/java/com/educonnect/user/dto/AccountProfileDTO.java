package com.educonnect.user.dto;

import java.util.List;

/**
 * DAI-02 / A02: dữ liệu hồ sơ cá nhân cấp cho giao diện. Không chứa passwordHash hay token.
 *
 * @param learner      true nếu tài khoản có hồ sơ người học (cấp học/khu vực mặc định).
 * @param version      phiên bản user_accounts, gửi lại khi lưu để phát hiện sửa chồng.
 * @param roleLabels   nhãn vai trò hiển thị (không dùng làm quyền).
 */
public record AccountProfileDTO(
        Long userId, // ID tài khoản người dùng.
        String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
        String email, // Địa chỉ email của tài khoản.
        String displayName, // Tên người dùng hiển thị trên giao diện.
        String phone, // Số điện thoại liên hệ.
        String bio, // Nội dung giới thiệu bản thân.
        Long version, // Phiên bản dữ liệu để phát hiện cập nhật đồng thời.
        List<String> roleLabels, // Tên các vai trò để hiển thị.
        boolean tutor, // Cho biết tài khoản có vai trò gia sư hay không.
        boolean learner, // Cho biết tài khoản có vai trò học viên hay không.
        String learnerKind, // Loại người học, chẳng hạn học sinh hoặc phụ huynh.
        Long gradeLevelId, // ID cấp học.
        Long areaId, // ID khu vực học.
        List<Option> gradeLevels, // Danh sách cấp học.
        List<Option> areas // Danh sách khu vực học.
) {
    public record Option(
            Long id, // ID mục danh mục.
            String name // Tên mục danh mục.
    ) {}

    public String initials() {
        String[] parts = displayName == null ? new String[0] : displayName.strip().split("\\s+");
        if (parts.length == 0 || parts[0].isEmpty()) return "?";
        String first = parts[0].substring(0, 1);
        return (parts.length == 1 ? first : first + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
