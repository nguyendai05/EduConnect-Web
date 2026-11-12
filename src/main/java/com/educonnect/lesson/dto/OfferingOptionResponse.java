package com.educonnect.lesson.dto;

/** Một lựa chọn trả về cho các ô chọn môn, cấp học, khu vực hoặc hình thức học. */
public record OfferingOptionResponse(
        Long id, // ID mục danh mục.
        String label // Nhãn hiển thị của mục.
) {
}
