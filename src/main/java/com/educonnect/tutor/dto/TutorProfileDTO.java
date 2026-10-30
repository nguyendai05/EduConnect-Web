package com.educonnect.tutor.dto;

import com.educonnect.tutor.domain.TutorReviewStatus;

import java.time.Instant;
import java.util.List;

/**
 * DAI-02 / A02: hồ sơ gia sư cấp cho trang của gia sư và trang duyệt của admin.
 * {@code reviewNote} chỉ được đưa vào khi người xem là chủ hồ sơ hoặc admin.
 *
 * @param editable  false khi đang chờ duyệt (khóa chỉnh sửa).
 * @param missing   các mục còn thiếu để được gửi duyệt; rỗng nghĩa là đủ điều kiện.
 */
public record TutorProfileDTO(Long userId, String displayName, String email, String phone, String bio,
                              String headline, int experienceYears, TutorReviewStatus status,
                              String reviewNote, Instant reviewedAt, String reviewerName,
                              Long userVersion, Long tutorVersion,
                              List<Choice> subjects, List<Choice> gradeLevels, List<Choice> areas, List<Choice> deliveryModes,
                              List<Evidence> evidence, boolean editable, boolean canSubmit, List<String> missing,
                              List<String> subjectSuggestions, List<String> gradeSuggestions) {

    /** Một mục danh mục; {@code selected} cho biết gia sư đã chọn. */
    public record Choice(Long id, String name, boolean selected) {}

    public record Evidence(Long fileId, String name, String mimeType, long size, Instant uploadedAt) {
        public String kind() {
            return switch (mimeType) { case "application/pdf" -> "PDF"; case "image/png" -> "PNG"; default -> "JPG"; };
        }

        public String sizeLabel() {
            return size >= 1024 * 1024 ? String.format("%.1f MB", size / 1048576.0) : Math.max(1, size / 1024) + " KB";
        }
    }

    /** Một mục của danh sách hoàn thiện hồ sơ; {@code anchor} là id vùng nhập tương ứng trên trang. */
    public record Check(String label, boolean done, String anchor) {}

    /** Bảy điều kiện để gửi duyệt (cùng quy tắc với TutorProfileService), dùng để hiện tiến độ. */
    public List<Check> checklist() {
        return List.of(
                new Check("Giới thiệu bản thân (từ 20 ký tự)", bio != null && bio.strip().length() >= 20, "tutor-bio"),
                new Check("Tiêu đề hồ sơ", headline != null && headline.strip().length() >= 5, "tutor-headline"),
                new Check("Môn dạy", !selectedNames(subjects).isEmpty(), "group-subjects"),
                new Check("Cấp học", !selectedNames(gradeLevels).isEmpty(), "group-grades"),
                new Check("Khu vực dạy", !selectedNames(areas).isEmpty(), "group-areas"),
                new Check("Hình thức dạy", !selectedNames(deliveryModes).isEmpty(), "group-modes"),
                new Check("Minh chứng (bằng cấp, chứng chỉ)", !evidence.isEmpty(), "evidence-title"));
    }

    public long doneCount() { return checklist().stream().filter(Check::done).count(); }

    public int percent() { return (int) Math.round(doneCount() * 100.0 / checklist().size()); }

    public String statusLabel() {
        return switch (status) {
            case DRAFT -> "Bản nháp";
            case PENDING -> "Chờ duyệt";
            case APPROVED -> "Đã duyệt";
            case REJECTED -> "Cần bổ sung";
        };
    }

    public List<String> selectedNames(List<Choice> choices) {
        return choices.stream().filter(Choice::selected).map(Choice::name).toList();
    }

    public String initials() {
        String[] parts = displayName == null ? new String[0] : displayName.strip().split("\\s+");
        if (parts.length == 0 || parts[0].isEmpty()) return "?";
        String first = parts[0].substring(0, 1);
        return (parts.length == 1 ? first : first + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
