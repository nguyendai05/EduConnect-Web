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
public record TutorProfileDTO(
        Long userId, // ID tài khoản người dùng.
        String displayName, // Tên người dùng hiển thị trên giao diện.
        String email, // Địa chỉ email của tài khoản.
        String phone, // Số điện thoại liên hệ.
        String bio, // Nội dung giới thiệu bản thân.
        String headline, // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.
        int experienceYears, // Số năm kinh nghiệm giảng dạy của gia sư.
        TutorReviewStatus status, // Trạng thái hiện tại.
        String reviewNote, // Ghi chú hoặc lý do của người xét duyệt.
        Instant reviewedAt, // Thời điểm xét duyệt.
        String reviewerName, // Tên người xét duyệt.
        Long userVersion, // Phiên bản tài khoản để phát hiện cập nhật đồng thời.
        Long tutorVersion, // Phiên bản hồ sơ gia sư để phát hiện cập nhật đồng thời.
        List<Choice> subjects, // Danh sách môn gia sư có thể dạy.
        List<Choice> gradeLevels, // Danh sách cấp học.
        List<Choice> areas, // Danh sách khu vực học.
        List<Choice> deliveryModes, // Danh sách hình thức gia sư có thể dạy.
        List<Evidence> evidence, // Danh sách tệp minh chứng như bằng cấp, chứng chỉ.
        boolean editable, // Cho biết dữ liệu hiện có thể chỉnh sửa hay không.
        boolean canSubmit, // Cho biết có đủ điều kiện gửi duyệt hay không.
        List<String> missing, // Các mục hồ sơ còn thiếu để đủ điều kiện gửi duyệt.
        List<String> subjectSuggestions, // Các tên môn học gợi ý khi nhập hồ sơ gia sư.
        List<String> gradeSuggestions // Các tên cấp học gợi ý khi nhập hồ sơ gia sư.
) {

    /** Một mục danh mục; {@code selected} cho biết gia sư đã chọn. */
    public record Choice(
            Long id, // ID mục danh mục.
            String name, // Tên mục danh mục.
            boolean selected // Cho biết mục danh mục đã được gia sư chọn hay chưa.
    ) {}

    public record Evidence(
            Long fileId, // ID tệp minh chứng đã tải lên.
            String name, // Tên tệp minh chứng.
            String mimeType, // Loại nội dung của tệp, chẳng hạn application/pdf hoặc image/png.
            long size, // Kích thước tệp, tính bằng byte.
            Instant uploadedAt // Thời điểm tải tệp minh chứng lên.
    ) {
        public String kind() {
            return switch (mimeType) { case "application/pdf" -> "PDF"; case "image/png" -> "PNG"; default -> "JPG"; };
        }

        public String sizeLabel() {
            return size >= 1024 * 1024 ? String.format("%.1f MB", size / 1048576.0) : Math.max(1, size / 1024) + " KB";
        }
    }

    /** Một mục của danh sách hoàn thiện hồ sơ; {@code anchor} là id vùng nhập tương ứng trên trang. */
    public record Check(
            String label, // Nhãn hiển thị của mục.
            boolean done, // Cho biết mục hồ sơ đã hoàn thiện hay chưa.
            String anchor // ID vùng nhập trên trang để dẫn người dùng đến mục cần hoàn thiện.
    ) {}

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
