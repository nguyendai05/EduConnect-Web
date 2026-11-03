package com.educonnect.invitation.dto;

/**
 * Tác giả: Trường Đạt.
 * Lựa chọn gia sư công khai cho form mời.
 * Thuộc trang: /invitation/create.
 */
public record InvitationTutorResponse(
        Long id, // ID tài khoản gia sư.
        String displayName, // Tên người dùng hiển thị trên giao diện.
        String headline // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
) {}
