package com.educonnect.admin.service;

import com.educonnect.admin.domain.AuditLog;
import com.educonnect.admin.dto.AccountStatusForm;
import com.educonnect.admin.dto.AdminManageDTO.*;
import com.educonnect.admin.repository.AuditLogJpaRepository;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.domain.AccountStatus;
import com.educonnect.user.repository.UserAccountJpaRepository;
import com.educonnect.user.service.AccountGuard;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

/**
 * DAI-03: trang Quản lý nền tảng. Người dùng: xem + đổi trạng thái tài khoản (luồng của Đại).
 * Dịch vụ/lớp và đơn: chỉ đọc; thao tác ghi thuộc Service của Đạt/Huy nên không ghi thẳng vào bảng của họ.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class AdminManageService {
    public static final int PAGE_SIZE = 10;

    private final AccountGuard guard;
    private final JdbcTemplate jdbc;
    private final UserAccountJpaRepository users;
    private final AuditLogJpaRepository audits;
    private final Validator validator;

    public AdminManageService(AccountGuard guard, JdbcTemplate jdbc, UserAccountJpaRepository users,
                              AuditLogJpaRepository audits, Validator validator) {
        this.guard = guard;
        this.jdbc = jdbc;
        this.users = users;
        this.audits = audits;
        this.validator = validator;
    }

    /** Điều kiện WHERE dùng chung cho đếm và lấy dữ liệu. */
    private static final class Filter {
        final StringBuilder sql = new StringBuilder(" WHERE 1=1");
        final List<Object> args = new ArrayList<>();
    }

    private static String keyword(String raw) {
        String q = raw == null ? "" : raw.strip();
        if (q.length() > 100) throw ServiceProblem.invalid("Từ khóa tối đa 100 ký tự.");
        return q;
    }

    private static <E extends Enum<E>> E enumOf(Class<E> type, String value) {
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException invalid) {
            throw ServiceProblem.invalid("Giá trị lọc không hợp lệ.");
        }
    }

    private static String like(String q) {
        return "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }

    /** Cột ASCII (email, mã) so với từ khóa có dấu sẽ lỗi collation, nên chỉ tìm các cột đó khi từ khóa thuần ASCII. */
    private static boolean ascii(String q) {
        return q.chars().allMatch(c -> c < 128);
    }

    private static Instant instant(java.sql.ResultSet rs, String column) throws java.sql.SQLException {
        LocalDateTime time = rs.getObject(column, LocalDateTime.class);
        return time == null ? null : time.toInstant(ZoneOffset.UTC);
    }

    public PageResult<UserRow> users(AccountPrincipal principal, String q, String role, String status, int page) {
        guard.require(principal, "ADMIN");
        String keyword = keyword(q);
        Filter f = new Filter();
        if (!keyword.isEmpty()) {
            String like = like(keyword);
            if (ascii(keyword)) {
                f.sql.append(" AND (u.display_name LIKE ? OR u.email LIKE ? OR u.public_code LIKE ?)");
                f.args.addAll(List.of(like, like, like));
            } else {
                f.sql.append(" AND u.display_name LIKE ?");
                f.args.add(like);
            }
        }
        if (role != null && !role.isBlank()) {
            if (!Set.of("LEARNER", "TUTOR", "ADMIN").contains(role)) throw ServiceProblem.invalid("Vai trò lọc không hợp lệ.");
            f.sql.append(" AND EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = u.id AND r.role_code = ?)");
            f.args.add(role);
        }
        if (status != null && !status.isBlank()) {
            f.sql.append(" AND u.status = ?");
            f.args.add(enumOf(AccountStatus.class, status).name());
        }
        String from = " FROM user_accounts u";
        return page("SELECT COUNT(*)" + from + f.sql, f.args, """
                SELECT u.id, u.public_code, u.display_name, u.email, u.status, u.email_verified_at, u.version, u.created_at,
                       (SELECT GROUP_CONCAT(r.role_code) FROM user_roles r WHERE r.user_id = u.id) AS roles,
                       (SELECT t.review_status FROM tutor_profiles t WHERE t.user_id = u.id) AS tutor_status
                """ + from + f.sql + " ORDER BY u.created_at DESC, u.id DESC LIMIT ? OFFSET ?",
                (rs, n) -> new UserRow(rs.getLong("id"), rs.getString("public_code"), rs.getString("display_name"),
                        rs.getString("email"), rs.getString("roles") == null ? Set.of() : Set.of(rs.getString("roles").split(",")),
                        rs.getString("status"), rs.getObject("email_verified_at") != null, rs.getString("tutor_status"),
                        rs.getLong("version"), instant(rs, "created_at")), page);
    }

    public PageResult<OfferingRow> offerings(AccountPrincipal principal, String q, String type, String status, int page) {
        guard.require(principal, "ADMIN");
        String keyword = keyword(q);
        Filter f = new Filter();
        if (!keyword.isEmpty()) {
            String like = like(keyword);
            if (ascii(keyword)) {
                f.sql.append(" AND (o.title LIKE ? OR u.display_name LIKE ? OR s.name LIKE ? OR o.public_code LIKE ?)");
                f.args.addAll(List.of(like, like, like, like));
            } else {
                f.sql.append(" AND (o.title LIKE ? OR u.display_name LIKE ? OR s.name LIKE ?)");
                f.args.addAll(List.of(like, like, like));
            }
        }
        if (type != null && !type.isBlank()) {
            f.sql.append(" AND o.offering_type = ?");
            f.args.add(enumOf(OfferingType.class, type).name());
        }
        if (status != null && !status.isBlank()) {
            f.sql.append(" AND o.status = ?");
            f.args.add(enumOf(OfferingStatus.class, status).name());
        }
        String from = " FROM offerings o JOIN user_accounts u ON u.id = o.tutor_id JOIN subjects s ON s.id = o.subject_id";
        return page("SELECT COUNT(*)" + from + f.sql, f.args,
                "SELECT o.id, o.public_code, o.title, o.tutor_id, u.display_name, o.offering_type, s.name AS subject, o.unit_price,"
                        + " o.session_count, o.status, o.updated_at" + from + f.sql + " ORDER BY o.updated_at DESC, o.id DESC LIMIT ? OFFSET ?",
                (rs, n) -> new OfferingRow(rs.getLong("id"), rs.getString("public_code"), rs.getString("title"),
                        rs.getString("display_name"), rs.getLong("tutor_id"), rs.getString("offering_type"), rs.getString("subject"),
                        rs.getBigDecimal("unit_price"), rs.getInt("session_count"), rs.getString("status"), instant(rs, "updated_at")), page);
    }

    public PageResult<OrderRow> orders(AccountPrincipal principal, String q, String status, int page) {
        guard.require(principal, "ADMIN");
        String keyword = keyword(q);
        Filter f = new Filter();
        if (!keyword.isEmpty()) {
            String like = like(keyword);
            String titles = "EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.id AND i.title_snapshot LIKE ?)";
            if (ascii(keyword)) {
                f.sql.append(" AND (l.display_name LIKE ? OR o.public_code LIKE ? OR ").append(titles).append(")");
                f.args.addAll(List.of(like, like, like));
            } else {
                f.sql.append(" AND (l.display_name LIKE ? OR ").append(titles).append(")");
                f.args.addAll(List.of(like, like));
            }
        }
        if (status != null && !status.isBlank()) {
            f.sql.append(" AND o.status = ?");
            f.args.add(enumOf(OrderStatus.class, status).name());
        }
        String from = " FROM orders o JOIN user_accounts l ON l.id = o.learner_id";
        return page("SELECT COUNT(*)" + from + f.sql, f.args, """
                SELECT o.id, o.public_code, l.display_name, o.total_amount, o.status, o.created_at,
                       (SELECT GROUP_CONCAT(i.title_snapshot ORDER BY i.line_number SEPARATOR ' · ') FROM order_items i WHERE i.order_id = o.id) AS titles,
                       (SELECT p.status FROM payments p WHERE p.order_id = o.id) AS payment_status
                """ + from + f.sql + " ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?",
                (rs, n) -> new OrderRow(rs.getLong("id"), rs.getString("public_code"), rs.getString("display_name"),
                        rs.getBigDecimal("total_amount"), rs.getString("status"), rs.getString("titles"),
                        rs.getString("payment_status"), instant(rs, "created_at")), page);
    }

    private <T> PageResult<T> page(String countSql, List<Object> args, String dataSql,
                                   org.springframework.jdbc.core.RowMapper<T> mapper, int page) {
        int safePage = Math.max(0, page);
        Long total = jdbc.queryForObject(countSql, Long.class, args.toArray());
        List<Object> dataArgs = new ArrayList<>(args);
        dataArgs.add(PAGE_SIZE);
        dataArgs.add((long) safePage * PAGE_SIZE);
        return new PageResult<>(jdbc.query(dataSql, mapper, dataArgs.toArray()), safePage, PAGE_SIZE, total == null ? 0 : total);
    }

    /**
     * Đổi trạng thái tài khoản (khóa / mở khóa / vô hiệu hóa) kèm lý do. Tăng authenticationVersion để mọi phiên
     * đang đăng nhập của tài khoản bị thu hồi. Không đổi vai trò, mật khẩu hay ví; không tự khóa mình; không đụng tài khoản quản trị.
     */
    @Transactional
    public void changeStatus(AccountPrincipal principal, Long userId, AccountStatusForm form) {
        UserAccount admin = guard.require(principal, "ADMIN");
        var violations = validator.validate(form);
        if (!violations.isEmpty()) throw ServiceProblem.invalid(violations.iterator().next().getMessage());
        if (admin.id().equals(userId)) throw ServiceProblem.conflict("Bạn không thể đổi trạng thái tài khoản của chính mình.");
        var account = users.findLockedById(userId).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy tài khoản."));
        boolean isAdmin = jdbc.queryForObject("SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role_code = 'ADMIN'", Integer.class, userId) > 0;
        if (isAdmin) throw ServiceProblem.forbidden("Không thể đổi trạng thái của tài khoản quản trị tại trang này.");
        AccountStatus target = AccountStatus.valueOf(form.getStatus());
        String reason = form.getReason().strip();
        if (account.getStatus() == target) return; // gửi lặp: đã ở trạng thái này
        if (!account.getVersion().equals(form.getVersion())) {
            throw ServiceProblem.conflict("Tài khoản vừa được thay đổi. Hãy tải lại trang để xem trạng thái mới nhất.");
        }
        AccountStatus before = account.getStatus();
        account.setStatus(target);
        account.setAuthenticationVersion(account.getAuthenticationVersion() + 1);
        account.setUpdatedAt(Instant.now());
        users.saveAndFlush(account);

        AuditLog log = AuditLog.create();
        log.setActorUserId(admin.id());
        log.setTargetUserId(userId);
        log.setActionCode("USER_STATUS_CHANGE");
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("from", before.name());
        metadata.put("to", target.name());
        metadata.put("reason", reason);
        log.setMetadata(metadata);
        log.setCreatedAt(Instant.now());
        audits.saveAndFlush(log);
    }
}
