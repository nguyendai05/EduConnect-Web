package com.educonnect.tutor.dto;

import java.util.List;

/** Tác giả: Trường Đạt. Kết quả DAT-02; tổng kết quả đếm gia sư, không đếm dịch vụ. */
public record TutorSearchResponse(
        List<TutorCardResponse> items, // Danh sách gia sư trong trang kết quả hiện tại.
        int page, // Chỉ số trang hiện tại, bắt đầu từ 0.
        int size, // Số kết quả tối đa trên mỗi trang.
        long totalElements, // Tổng số kết quả trên tất cả các trang.
        int totalPages, // Tổng số trang kết quả.
        boolean hasPrevious, // Cho biết có trang kết quả trước đó hay không.
        boolean hasNext // Cho biết còn trang kết quả kế tiếp hay không.
) {
    public TutorSearchResponse {
        items = List.copyOf(items);
    }
}
