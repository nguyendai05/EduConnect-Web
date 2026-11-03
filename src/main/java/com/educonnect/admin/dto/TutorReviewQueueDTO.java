package com.educonnect.admin.dto;

import com.educonnect.common.util.DateLabels;
import com.educonnect.tutor.domain.TutorReviewStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** DAI-02: một trang của hàng đợi duyệt gia sư cùng số lượng theo từng trạng thái (cho các tab). */
public record TutorReviewQueueDTO(
        List<Row> rows, // Danh sách các dòng dữ liệu để hiển thị.
        int page, // Chỉ số trang hiện tại, bắt đầu từ 0.
        int size, // Số kết quả tối đa trên mỗi trang.
        long total, // Tổng số bản ghi khớp điều kiện lọc.
        Map<TutorReviewStatus, Long> counts // Số bản ghi theo từng trạng thái.
) {

    public record Row(
            Long userId, // ID tài khoản người dùng.
            String name, // Tên hiển thị của người dùng.
            String email, // Địa chỉ email của tài khoản.
            String headline, // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
            int experienceYears, // Số năm kinh nghiệm giảng dạy của gia sư.
            TutorReviewStatus status, // Trạng thái hiện tại.
            Instant updatedAt, // Thời điểm cập nhật gần nhất.
            int evidenceCount, // Số tệp minh chứng trong hồ sơ gia sư.
            String subjects // Tên các môn gia sư có thể dạy, gộp để hiển thị.
    ) {
        public String updatedLabel() { return DateLabels.vietnam(updatedAt); }
        public String initials() {
            String[] parts = name == null ? new String[0] : name.strip().split("\s+");
            if (parts.length == 0 || parts[0].isEmpty()) return "?";
            String first = parts[0].substring(0, 1);
            return (parts.length == 1 ? first : first + parts[parts.length - 1].substring(0, 1)).toUpperCase();
        }
    }

    public int totalPages() { return (int) Math.max(1, (total + size - 1) / size); }
    public boolean hasPrevious() { return page > 0; }
    public boolean hasNext() { return page + 1 < totalPages(); }
    public long count(TutorReviewStatus status) { return counts.getOrDefault(status, 0L); }
}
