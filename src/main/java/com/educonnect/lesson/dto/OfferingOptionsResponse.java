package com.educonnect.lesson.dto;

import java.util.List;

/** Các danh mục trả về để hiển thị form dịch vụ/lớp. */
public record OfferingOptionsResponse(
        List<OfferingOptionResponse> subjects, // Danh sách môn học để hiển thị trong ô chọn.
        List<OfferingOptionResponse> grades, // Danh sách cấp học để hiển thị trong ô chọn.
        List<OfferingOptionResponse> areas, // Danh sách khu vực học.
        List<OfferingOptionResponse> modes // Danh sách hình thức học để hiển thị trong ô chọn.
) {
}
