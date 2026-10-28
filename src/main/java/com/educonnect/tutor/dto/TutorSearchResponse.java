package com.educonnect.tutor.dto;

import java.util.List;

/** Tác giả: Trường Đạt. Kết quả DAT-02; tổng kết quả đếm gia sư, không đếm dịch vụ. */
public record TutorSearchResponse(
        List<TutorCardResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasPrevious,
        boolean hasNext
) {
    public TutorSearchResponse {
        items = List.copyOf(items);
    }
}
