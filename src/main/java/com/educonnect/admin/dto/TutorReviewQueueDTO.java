package com.educonnect.admin.dto;

import com.educonnect.common.util.DateLabels;
import com.educonnect.tutor.domain.TutorReviewStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** DAI-02: một trang của hàng đợi duyệt gia sư cùng số lượng theo từng trạng thái (cho các tab). */
public record TutorReviewQueueDTO(List<Row> rows, int page, int size, long total, Map<TutorReviewStatus, Long> counts) {

    public record Row(Long userId, String name, String email, String headline, int experienceYears,
                      TutorReviewStatus status, Instant updatedAt, int evidenceCount, String subjects) {
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
