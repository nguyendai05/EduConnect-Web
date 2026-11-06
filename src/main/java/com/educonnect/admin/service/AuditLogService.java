package com.educonnect.admin.service;

import com.educonnect.admin.dto.AuditLogDTO;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.service.AccountGuard;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * DAI-03 (BB12): tra cứu nhật ký hệ thống chỉ đọc cho ADMIN.
 * Mọi truy vấn kiểm vai trò ADMIN tại máy chủ và tự động che các trường nhạy cảm trong metadata JSON.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class AuditLogService {
    public static final int PAGE_SIZE = 10;
    public static final String REDACTED_VALUE = "[ĐÃ CHE]";

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Set<String> ALLOWED_GROUPS = Set.of("all", "tutor", "offering", "job", "account", "order", "dispute");
    private static final Set<String> ALLOWED_ACTORS = Set.of("all", "admin", "tutor", "learner", "system");
    private static final Set<String> ALLOWED_RANGES = Set.of("all", "today", "7d", "30d", "custom");
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final AccountGuard guard;
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public AuditLogService(AccountGuard guard, JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.guard = guard;
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public AuditLogDTO load(AccountPrincipal principal, String group, String keyword, String actor,
                            String range, String from, String to, String sort, int page) {
        guard.require(principal, "ADMIN");

        String safeGroup = normalizeGroup(group);
        String safeActor = normalizeOption(actor, ALLOWED_ACTORS, "all");
        String safeRange = normalizeOption(range, ALLOWED_RANGES, "all");
        String safeSort = "oldest".equalsIgnoreCase(sort) ? "oldest" : "newest";
        int safePage = Math.max(0, page);

        String q = keyword == null ? "" : keyword.strip();
        if (q.length() > 100) {
            throw ServiceProblem.invalid("Từ khóa tìm kiếm tối đa 100 ký tự.");
        }

        String safeFrom = from == null ? "" : from.strip();
        String safeTo = to == null ? "" : to.strip();
        LocalDate fromDate = parseDate(safeFrom, "Từ ngày");
        LocalDate toDate = parseDate(safeTo, "Đến ngày");
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw ServiceProblem.invalid("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        }

        List<Object> where = new ArrayList<>();
        StringBuilder filter = new StringBuilder(" WHERE 1=1");

        appendGroupFilter(filter, safeGroup);
        appendActorFilter(filter, safeActor);
        appendDateRangeFilter(filter, where, safeRange, fromDate, toDate);
        appendKeywordFilter(filter, where, q);

        String fromSql = """
                 FROM audit_logs a
                 LEFT JOIN user_accounts actor ON actor.id = a.actor_user_id
                 LEFT JOIN user_accounts target_u ON target_u.id = a.target_user_id
                 LEFT JOIN orders o ON o.id = a.order_id
                 LEFT JOIN reports r ON r.id = a.report_id""";

        Long total = jdbc.queryForObject("SELECT COUNT(*)" + fromSql + filter, Long.class, where.toArray());
        String orderSql = "oldest".equals(safeSort)
                ? " ORDER BY a.created_at ASC, a.id ASC"
                : " ORDER BY a.created_at DESC, a.id DESC";

        List<Object> args = new ArrayList<>(where);
        args.add(PAGE_SIZE);
        args.add((long) safePage * PAGE_SIZE);

        List<AuditLogDTO.Row> rows = jdbc.query("""
                SELECT a.id, a.actor_user_id, actor.public_code AS actor_code, actor.display_name AS actor_name,
                       actor.email AS actor_email,
                       (SELECT ur.role_code FROM user_roles ur WHERE ur.user_id = a.actor_user_id
                          ORDER BY FIELD(ur.role_code, 'ADMIN', 'TUTOR', 'LEARNER') LIMIT 1) AS actor_role,
                       a.action_code, a.order_id, o.public_code AS order_code,
                       a.report_id, r.public_code AS report_code,
                       a.target_user_id, target_u.public_code AS target_user_code,
                       target_u.display_name AS target_user_name,
                       a.metadata, a.created_at
                """ + fromSql + filter + orderSql + " LIMIT ? OFFSET ?",
                this::mapRow,
                args.toArray());

        Map<String, Long> groupCounts = loadGroupCounts();
        return new AuditLogDTO(
                safeGroup,
                q,
                safeActor,
                safeRange,
                safeFrom,
                safeTo,
                safeSort,
                rows,
                safePage,
                PAGE_SIZE,
                total == null ? 0L : total,
                groupCounts);
    }

    private Map<String, Long> loadGroupCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (AuditLogDTO.GroupTab tab : AuditLogDTO.GROUPS) {
            counts.put(tab.code(), 0L);
        }
        jdbc.query("SELECT action_code, COUNT(*) AS total FROM audit_logs GROUP BY action_code", rs -> {
            String actionCode = rs.getString("action_code");
            long count = rs.getLong("total");
            counts.compute("all", (k, v) -> (v == null ? 0L : v) + count);
            String groupCode = toGroupCode(actionCode);
            if (counts.containsKey(groupCode)) {
                counts.compute(groupCode, (k, v) -> (v == null ? 0L : v) + count);
            }
        });
        return counts;
    }

    private AuditLogDTO.Row mapRow(ResultSet rs, int rowNum) throws SQLException {
        long id = rs.getLong("id");
        Long actorUserId = (Long) rs.getObject("actor_user_id");
        String actorCode = rs.getString("actor_code");
        String actorName = rs.getString("actor_name");
        String actorEmail = rs.getString("actor_email");
        String actorRole = rs.getString("actor_role");
        String actionCode = rs.getString("action_code");
        String groupCode = toGroupCode(actionCode);
        Long orderId = (Long) rs.getObject("order_id");
        String orderCode = rs.getString("order_code");
        Long reportId = (Long) rs.getObject("report_id");
        String reportCode = rs.getString("report_code");
        Long targetUserId = (Long) rs.getObject("target_user_id");
        String targetUserCode = rs.getString("target_user_code");
        String targetUserName = rs.getString("target_user_name");
        String rawMetadata = rs.getString("metadata");
        Instant createdAt = rs.getObject("created_at", LocalDateTime.class).toInstant(ZoneOffset.UTC);

        Map<String, Object> parsedMetadata = parseMetadata(rawMetadata);
        Map<String, Object> sanitizedMetadata = sanitizeMetadata(parsedMetadata);
        String sanitizedJson = toPrettyJson(sanitizedMetadata);

        TargetView target = resolveTarget(actionCode, sanitizedMetadata, targetUserId, targetUserCode, targetUserName,
                orderId, orderCode, reportId, reportCode);
        String summary = buildSummary(actionCode, sanitizedMetadata, orderCode, reportCode);

        return new AuditLogDTO.Row(
                id,
                actorUserId,
                actorCode,
                actorName,
                actorEmail,
                actorRole,
                actionCode,
                groupCode,
                orderId,
                orderCode,
                reportId,
                reportCode,
                targetUserId,
                targetUserCode,
                targetUserName,
                target.label(),
                target.ref(),
                target.href(),
                summary,
                sanitizedJson,
                createdAt);
    }

    private record TargetView(String label, String ref, String href) {}

    private TargetView resolveTarget(String actionCode, Map<String, Object> metadata,
                                     Long targetUserId, String targetUserCode, String targetUserName,
                                     Long orderId, String orderCode, Long reportId, String reportCode) {
        String code = actionCode == null ? "" : actionCode;
        switch (code) {
            case "TUTOR_REVIEW", "TUTOR_PROFILE_SUBMIT", "TUTOR_PROFILE_REREVIEW" -> {
                Long tutorId = targetUserId != null ? targetUserId : longVal(metadata.get("tutorId"));
                String label = "Hồ sơ gia sư" + (targetUserName != null && !targetUserName.isBlank() ? ": " + targetUserName : "");
                String ref = targetUserCode != null && !targetUserCode.isBlank()
                        ? targetUserCode
                        : (tutorId != null ? "USR-" + tutorId : "");
                String href = tutorId != null ? "/admin/tutor-review-detail?id=" + tutorId : "/admin/tutor-review-queue";
                return new TargetView(label, ref, href);
            }
            case "OFFERING_REVIEW" -> {
                Long offeringId = longVal(metadata.get("offeringId"));
                String offeringCode = str(metadata.get("offeringCode"));
                String label = "Khóa học" + (targetUserName != null && !targetUserName.isBlank() ? " · " + targetUserName : "");
                String ref = !offeringCode.isEmpty() ? offeringCode : (offeringId != null ? "#" + offeringId : "");
                String href = offeringId != null ? "/admin/offering-review-detail?id=" + offeringId : "/admin/manage?tab=offerings";
                return new TargetView(label, ref, href);
            }
            case "JOB_REVIEW" -> {
                Long jobId = longVal(metadata.get("jobId"));
                String label = "Tin tìm gia sư" + (targetUserName != null && !targetUserName.isBlank() ? " · " + targetUserName : "");
                String ref = jobId != null ? "JOB-" + jobId : (targetUserCode != null ? targetUserCode : "");
                String href = jobId != null ? "/admin/job-review-detail?id=" + jobId : "/admin/job-review-queue";
                return new TargetView(label, ref, href);
            }
            case "USER_STATUS_CHANGE" -> {
                String label = "Tài khoản" + (targetUserName != null && !targetUserName.isBlank() ? ": " + targetUserName : "");
                String ref = targetUserCode != null ? targetUserCode : (targetUserId != null ? "#" + targetUserId : "");
                String href = targetUserCode != null && !targetUserCode.isBlank()
                        ? "/admin/manage?tab=users&q=" + targetUserCode
                        : "/admin/manage?tab=users";
                return new TargetView(label, ref, href);
            }
            default -> {
                if (reportId != null) {
                    String ref = reportCode != null && !reportCode.isBlank() ? reportCode : "RPT-" + reportId;
                    String label = "Báo cáo" + (targetUserName != null && !targetUserName.isBlank() ? " · " + targetUserName : "");
                    return new TargetView(label, ref, "/admin/reports");
                }
                if (orderId != null) {
                    String ref = orderCode != null && !orderCode.isBlank() ? orderCode : "ORD-" + orderId;
                    String label = "Đơn đăng ký" + (targetUserName != null && !targetUserName.isBlank() ? " · " + targetUserName : "");
                    String href = orderCode != null && !orderCode.isBlank()
                            ? "/admin/manage?tab=orders&q=" + orderCode
                            : "/admin/manage?tab=orders";
                    return new TargetView(label, ref, href);
                }
                if (targetUserId != null) {
                    String label = targetUserName != null && !targetUserName.isBlank() ? targetUserName : "Tài khoản #" + targetUserId;
                    String ref = targetUserCode != null ? targetUserCode : "USR-" + targetUserId;
                    return new TargetView(label, ref, "/admin/manage?tab=users");
                }
                return new TargetView("Hệ thống", "", null);
            }
        }
    }

    private String buildSummary(String actionCode, Map<String, Object> metadata, String orderCode, String reportCode) {
        String code = actionCode == null ? "" : actionCode;
        String reason = str(metadata.get("reason"));
        return switch (code) {
            case "USER_STATUS_CHANGE" -> {
                String prev = accountStatusLabel(str(metadata.get("previousStatus")));
                String next = accountStatusLabel(str(metadata.get("newStatus")));
                yield prev + " → " + next + (reason.isEmpty() ? "" : " · Lý do: " + reason);
            }
            case "TUTOR_REVIEW", "OFFERING_REVIEW", "JOB_REVIEW" -> {
                String decision = str(metadata.get("decision"));
                String decisionLabel = "approve".equalsIgnoreCase(decision)
                        ? "Đã duyệt"
                        : ("reject".equalsIgnoreCase(decision) ? "Đã từ chối" : (decision.isEmpty() ? "Đã xử lý" : decision));
                String prevVer = str(metadata.get("previousVersion"));
                String nextVer = str(metadata.get("resultingVersion"));
                String verLabel = !prevVer.isEmpty() && !nextVer.isEmpty() ? " (v" + prevVer + " → v" + nextVer + ")" : "";
                yield decisionLabel + verLabel + (reason.isEmpty() ? "" : " · Lý do: " + reason);
            }
            case "TUTOR_PROFILE_SUBMIT", "TUTOR_PROFILE_REREVIEW" -> {
                String prev = str(metadata.get("previousStatus"));
                String ver = str(metadata.get("version"));
                yield "Trạng thái trước: " + (prev.isEmpty() ? "—" : prev)
                        + (ver.isEmpty() ? "" : " · Phiên bản v" + ver);
            }
            case "ORDER_CREATED" -> {
                String ord = orderCode != null && !orderCode.isBlank() ? orderCode : str(metadata.get("order_code"));
                yield ord.isEmpty() ? "Tạo đơn đăng ký học mới" : "Mã đơn: " + ord;
            }
            case "REPORT_CREATED", "REPORT_DECIDED" -> {
                String rpt = reportCode != null && !reportCode.isBlank() ? reportCode : str(metadata.get("report_code"));
                yield (rpt.isEmpty() ? "Ghi nhận báo cáo" : "Mã báo cáo: " + rpt)
                        + (reason.isEmpty() ? "" : " · Lý do: " + reason);
            }
            default -> !reason.isEmpty() ? "Lý do: " + reason : "Bản ghi đối soát hệ thống";
        };
    }

    private static String accountStatusLabel(String status) {
        return switch (status) {
            case "ACTIVE" -> "Hoạt động";
            case "LOCKED" -> "Tạm khóa";
            case "DISABLED" -> "Vô hiệu hóa";
            default -> status.isEmpty() ? "—" : status;
        };
    }

    public static String toGroupCode(String actionCode) {
        if (actionCode == null) return "other";
        return switch (actionCode) {
            case "TUTOR_REVIEW", "TUTOR_PROFILE_SUBMIT", "TUTOR_PROFILE_REREVIEW" -> "tutor";
            case "OFFERING_REVIEW" -> "offering";
            case "JOB_REVIEW" -> "job";
            case "USER_STATUS_CHANGE" -> "account";
            case "ORDER_CREATED" -> "order";
            case "REPORT_CREATED", "REPORT_DECIDED" -> "dispute";
            default -> "other";
        };
    }

    /** Đệ quy che các trường nhạy cảm trong metadata trước khi hiển thị cho giao diện quản trị. */
    public static Map<String, Object> sanitizeMetadata(Map<String, Object> raw) {
        if (raw == null || raw.isEmpty()) return Map.of();
        Map<String, Object> out = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            String key = entry.getKey();
            if (isSensitiveKey(key)) {
                out.put(key, REDACTED_VALUE);
            } else {
                out.put(key, sanitizeValue(entry.getValue()));
            }
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private static Object sanitizeValue(Object value) {
        if (value instanceof Map<?, ?> nestedMap) {
            return sanitizeMetadata((Map<String, Object>) nestedMap);
        }
        if (value instanceof Collection<?> list) {
            return list.stream().map(AuditLogService::sanitizeValue).toList();
        }
        return value;
    }

    public static boolean isSensitiveKey(String key) {
        if (key == null || key.isBlank()) return false;
        String norm = key.toLowerCase(Locale.ROOT).replaceAll("[_\\-.\\s]", "");
        return norm.contains("password")
                || norm.contains("passwd")
                || norm.contains("passcode")
                || norm.contains("token")
                || norm.contains("secret")
                || norm.contains("apikey")
                || norm.contains("privatekey")
                || norm.equals("otp")
                || norm.startsWith("otp")
                || norm.endsWith("otp")
                || norm.contains("session")
                || norm.contains("cookie")
                || norm.contains("authorization")
                || norm.contains("credential")
                || norm.contains("cccd")
                || norm.contains("cmnd")
                || norm.contains("bankaccount")
                || norm.contains("cardnumber")
                || norm.equals("cvv")
                || norm.equals("pin")
                || norm.contains("signature");
    }

    private Map<String, Object> parseMetadata(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) return Map.of();
        try {
            Map<String, Object> parsed = objectMapper.readValue(rawJson, MAP_TYPE);
            return parsed == null ? Map.of() : parsed;
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private String toPrettyJson(Map<String, Object> sanitized) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(sanitized);
        } catch (Exception ignored) {
            return "{}";
        }
    }

    private static void appendGroupFilter(StringBuilder filter, String group) {
        switch (group) {
            case "tutor" -> filter.append(" AND a.action_code IN ('TUTOR_REVIEW', 'TUTOR_PROFILE_SUBMIT', 'TUTOR_PROFILE_REREVIEW')");
            case "offering" -> filter.append(" AND a.action_code = 'OFFERING_REVIEW'");
            case "job" -> filter.append(" AND a.action_code = 'JOB_REVIEW'");
            case "account" -> filter.append(" AND a.action_code = 'USER_STATUS_CHANGE'");
            case "order" -> filter.append(" AND a.action_code = 'ORDER_CREATED'");
            case "dispute" -> filter.append(" AND a.action_code IN ('REPORT_CREATED', 'REPORT_DECIDED')");
            default -> {}
        }
    }

    private static void appendActorFilter(StringBuilder filter, String actor) {
        switch (actor) {
            case "system" -> filter.append(" AND a.actor_user_id IS NULL");
            case "admin" -> filter.append(" AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = a.actor_user_id AND ur.role_code = 'ADMIN')");
            case "tutor" -> filter.append(" AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = a.actor_user_id AND ur.role_code = 'TUTOR')");
            case "learner" -> filter.append(" AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = a.actor_user_id AND ur.role_code = 'LEARNER')");
            default -> {}
        }
    }

    private static void appendDateRangeFilter(StringBuilder filter, List<Object> where,
                                              String range, LocalDate fromDate, LocalDate toDate) {
        LocalDate todayVn = LocalDate.now(VIETNAM);
        switch (range) {
            case "today" -> {
                filter.append(" AND a.created_at >= ? AND a.created_at < ?");
                where.add(toUtcDateTime(todayVn));
                where.add(toUtcDateTime(todayVn.plusDays(1)));
            }
            case "7d" -> {
                filter.append(" AND a.created_at >= ?");
                where.add(toUtcDateTime(todayVn.minusDays(6)));
            }
            case "30d" -> {
                filter.append(" AND a.created_at >= ?");
                where.add(toUtcDateTime(todayVn.minusDays(29)));
            }
            case "custom" -> {
                if (fromDate != null) {
                    filter.append(" AND a.created_at >= ?");
                    where.add(toUtcDateTime(fromDate));
                }
                if (toDate != null) {
                    filter.append(" AND a.created_at < ?");
                    where.add(toUtcDateTime(toDate.plusDays(1)));
                }
            }
            default -> {}
        }
    }

    private static void appendKeywordFilter(StringBuilder filter, List<Object> where, String q) {
        if (q.isEmpty()) return;
        String like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
        boolean ascii = q.chars().allMatch(c -> c < 128);
        Long refId = parseAuditId(q);
        if (ascii) {
            filter.append("""
                     AND (actor.display_name LIKE ? OR target_u.display_name LIKE ?
                          OR CAST(a.metadata AS CHAR CHARACTER SET utf8mb4) LIKE ?
                          OR a.action_code LIKE ? OR actor.email LIKE ? OR actor.public_code LIKE ?
                          OR target_u.email LIKE ? OR target_u.public_code LIKE ?
                          OR o.public_code LIKE ? OR r.public_code LIKE ?""");
            for (int i = 0; i < 10; i++) where.add(like);
            if (refId != null) {
                filter.append(" OR a.id = ?)");
                where.add(refId);
            } else {
                filter.append(")");
            }
        } else {
            filter.append("""
                     AND (actor.display_name LIKE ? OR target_u.display_name LIKE ?
                          OR CAST(a.metadata AS CHAR CHARACTER SET utf8mb4) LIKE ?)""");
            where.add(like);
            where.add(like);
            where.add(like);
        }
    }

    private static LocalDateTime toUtcDateTime(LocalDate vietnamDate) {
        return LocalDateTime.ofInstant(vietnamDate.atStartOfDay(VIETNAM).toInstant(), ZoneOffset.UTC);
    }

    private static LocalDate parseDate(String raw, String fieldLabel) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return LocalDate.parse(raw);
        } catch (DateTimeParseException ex) {
            throw ServiceProblem.invalid(fieldLabel + " không đúng định dạng YYYY-MM-DD.");
        }
    }

    private static Long parseAuditId(String q) {
        String normalized = q.toUpperCase(Locale.ROOT);
        if (normalized.startsWith("AUD-")) {
            normalized = normalized.substring(4);
        }
        if (normalized.isEmpty() || !normalized.chars().allMatch(Character::isDigit)) {
            return null;
        }
        try {
            return Long.parseLong(normalized);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String normalizeGroup(String group) {
        if (group == null || group.isBlank()) return "all";
        String lower = group.strip().toLowerCase(Locale.ROOT);
        if ("contract".equals(lower)) return "order";
        return ALLOWED_GROUPS.contains(lower) ? lower : "all";
    }

    private static String normalizeOption(String value, Set<String> allowed, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        String lower = value.strip().toLowerCase(Locale.ROOT);
        return allowed.contains(lower) ? lower : fallback;
    }

    private static String str(Object value) {
        return value == null ? "" : String.valueOf(value).strip();
    }

    private static Long longVal(Object value) {
        if (value instanceof Number n) return n.longValue();
        if (value instanceof String s && !s.isBlank()) {
            try {
                return Long.parseLong(s.strip());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
