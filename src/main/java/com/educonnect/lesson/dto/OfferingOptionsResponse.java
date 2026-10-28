package com.educonnect.lesson.dto;

import java.util.List;

/** Các danh mục trả về để hiển thị form dịch vụ/lớp. */
public record OfferingOptionsResponse(
        List<OfferingOptionResponse> subjects,
        List<OfferingOptionResponse> grades,
        List<OfferingOptionResponse> areas,
        List<OfferingOptionResponse> modes
) {
}
