package com.educonnect.admin.dto;

import com.educonnect.common.util.DateLabels;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** DAI-03 (BB12): dữ liệu trang nhật ký hệ thống chỉ đọc cho ADMIN. */
public record AuditLogDTO(
        String group,
        String q,
        String actor,
        String range,
        String from,
        String to,
        String sort,
        List<Row> rows,
        int page,
        int size,
        long total,
        Map<String, Long> groupCounts) {

    public static final List<GroupTab> GROUPS = List.of(
            new GroupTab("all", "Tất cả"),
            new GroupTab("tutor", "Hồ sơ gia sư"),
            new GroupTab("offering", "Khóa học"),
            new GroupTab("job", "Tin tìm gia sư"),
            new GroupTab("account", "Tài khoản"),
            new GroupTab("order", "Đơn đăng ký"),
            new GroupTab("dispute", "Báo cáo"));

    public record GroupTab(String code, String label) {}

    public record Row(
            Long id,
            Long actorUserId,
            String actorCode,
            String actorName,
            String actorEmail,
            String actorRole,
            String actionCode,
            String groupCode,
            Long orderId,
            String orderCode,
            Long reportId,
            String reportCode,
            Long targetUserId,
            String targetUserCode,
            String targetUserName,
            String targetLabel,
            String targetRef,
            String targetHref,
            String summary,
            String sanitizedJson,
            Instant createdAt) {

        public String refCode() {
            return "AUD-" + String.format("%04d", id == null ? 0L : id);
        }

        public String createdLabel() {
            return DateLabels.vietnam(createdAt);
        }

        public String actorDisplayName() {
            return actorUserId == null || actorName == null || actorName.isBlank()
                    ? "Hệ thống tự động"
                    : actorName;
        }

        public String actorRoleLabel() {
            if (actorUserId == null || actorRole == null || actorRole.isBlank()) return "Hệ thống";
            return switch (actorRole) {
                case "ADMIN" -> "Quản trị viên";
                case "TUTOR" -> "Gia sư";
                case "LEARNER" -> "Người học";
                default -> actorRole;
            };
        }

        public String actorSubline() {
            if (actorUserId == null) return "Tác vụ hệ thống";
            String role = actorRoleLabel();
            if (actorEmail != null && !actorEmail.isBlank()) return role + " · " + actorEmail;
            if (actorCode != null && !actorCode.isBlank()) return role + " · " + actorCode;
            return role;
        }

        public String actionLabel() {
            if (actionCode == null) return "Thao tác hệ thống";
            return switch (actionCode) {
                case "TUTOR_PROFILE_SUBMIT" -> "Gửi duyệt hồ sơ gia sư";
                case "TUTOR_PROFILE_REREVIEW" -> "Gửi duyệt lại hồ sơ gia sư";
                case "TUTOR_REVIEW" -> "Duyệt hồ sơ gia sư";
                case "OFFERING_REVIEW" -> "Duyệt khóa học";
                case "JOB_REVIEW" -> "Duyệt tin tìm gia sư";
                case "USER_STATUS_CHANGE" -> "Đổi trạng thái tài khoản";
                case "ORDER_CREATED" -> "Tạo đơn đăng ký học";
                case "REPORT_CREATED" -> "Tạo báo cáo vi phạm";
                case "REPORT_DECIDED" -> "Xử lý báo cáo vi phạm";
                default -> actionCode;
            };
        }

        public String groupLabel() {
            return switch (groupCode == null ? "" : groupCode) {
                case "tutor" -> "Hồ sơ gia sư";
                case "offering" -> "Khóa học";
                case "job" -> "Tin tìm gia sư";
                case "account" -> "Tài khoản";
                case "order" -> "Đơn đăng ký";
                case "dispute" -> "Báo cáo";
                default -> "Hệ thống";
            };
        }

        public String badgeClass() {
            return switch (groupCode == null ? "" : groupCode) {
                case "tutor", "offering", "job" -> "badge--info";
                case "account", "dispute" -> "badge--warning";
                case "order" -> "badge--success";
                default -> "badge--neutral";
            };
        }
    }

    public int totalPages() {
        return (int) Math.max(1, (total + size - 1) / size);
    }

    public boolean hasPrevious() {
        return page > 0;
    }

    public boolean hasNext() {
        return page + 1 < totalPages();
    }

    public long count(String code) {
        return groupCounts == null ? 0L : groupCounts.getOrDefault(code, 0L);
    }

    public boolean hasActiveFilters() {
        return (group != null && !"all".equals(group))
                || (q != null && !q.isBlank())
                || (actor != null && !"all".equals(actor))
                || (range != null && !"all".equals(range))
                || (sort != null && !"newest".equals(sort));
    }
}
