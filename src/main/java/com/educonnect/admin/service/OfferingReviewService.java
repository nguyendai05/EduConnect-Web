package com.educonnect.admin.service;

import com.educonnect.admin.domain.AuditLog;
import com.educonnect.admin.dto.OfferingReviewDTO;
import com.educonnect.admin.dto.OfferingReviewForm;
import com.educonnect.admin.repository.AuditLogJpaRepository;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.repository.OfferingJpaRepository;
import com.educonnect.notification.domain.Notification;
import com.educonnect.notification.repository.NotificationJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.service.AccountGuard;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * DAI-03: admin duyệt khóa học (dịch vụ/lớp) do gia sư gửi: IN_REVIEW → PUBLISHED hoặc REJECTED (có lý do).
 * Chỉ đổi trạng thái và các trường duyệt của chính khóa học; không đụng tới đơn, lịch hay tiền. Quyết định, nhật ký và
 * thông báo cho gia sư ghi trong cùng một transaction.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class OfferingReviewService {
    private final AccountGuard guard;
    private final JdbcTemplate jdbc;
    private final EntityManager em;
    private final OfferingJpaRepository offerings;
    private final AuditLogJpaRepository audits;
    private final NotificationJpaRepository notifications;
    private final Validator validator;
    private final com.educonnect.lesson.repository.OfferingTimeSlotJpaRepository slotRepository;

    public OfferingReviewService(AccountGuard guard, JdbcTemplate jdbc, EntityManager em, OfferingJpaRepository offerings,
                                 AuditLogJpaRepository audits, NotificationJpaRepository notifications, Validator validator,
                                 com.educonnect.lesson.repository.OfferingTimeSlotJpaRepository slotRepository) {
        this.guard = guard;
        this.jdbc = jdbc;
        this.em = em;
        this.offerings = offerings;
        this.audits = audits;
        this.notifications = notifications;
        this.validator = validator;
        this.slotRepository = slotRepository;
    }

    public OfferingReviewDTO detail(AccountPrincipal principal, Long id) {
        guard.require(principal, "ADMIN");
        List<OfferingReviewDTO> rows = jdbc.query("""
                SELECT o.id, o.public_code, o.title, o.description, o.terms_text, o.tutor_id, u.display_name AS tutor_name,
                       tp.review_status AS tutor_profile_status, (u.status = 'ACTIVE' AND u.email_verified_at IS NOT NULL) AS tutor_active,
                       o.offering_type, s.name AS subject, g.name AS grade, a.name AS area, d.name AS mode,
                       o.unit_price, o.session_count, o.duration_minutes, o.capacity, o.starts_on, o.ends_on, o.status, o.version,
                       o.review_note, o.reviewed_at, r.display_name AS reviewer_name, o.updated_at
                  FROM offerings o
                  JOIN user_accounts u ON u.id = o.tutor_id
                  LEFT JOIN tutor_profiles tp ON tp.user_id = o.tutor_id
                  JOIN subjects s ON s.id = o.subject_id
                  JOIN grade_levels g ON g.id = o.grade_level_id
                  JOIN areas a ON a.id = o.area_id
                  JOIN delivery_modes d ON d.id = o.delivery_mode_id
                  LEFT JOIN user_accounts r ON r.id = o.reviewed_by
                 WHERE o.id = ?
                """, (rs, n) -> new OfferingReviewDTO(rs.getLong("id"), rs.getString("public_code"), rs.getString("title"),
                rs.getString("description"), rs.getString("terms_text"), rs.getLong("tutor_id"), rs.getString("tutor_name"),
                rs.getString("tutor_profile_status"), rs.getBoolean("tutor_active"), rs.getString("offering_type"),
                rs.getString("subject"), rs.getString("grade"), rs.getString("area"), rs.getString("mode"),
                rs.getBigDecimal("unit_price"), rs.getInt("session_count"), rs.getInt("duration_minutes"),
                rs.getObject("capacity") == null ? null : rs.getInt("capacity"),
                rs.getObject("starts_on", java.time.LocalDate.class), rs.getObject("ends_on", java.time.LocalDate.class),
                rs.getString("status"), rs.getLong("version"), rs.getString("review_note"), instant(rs, "reviewed_at"),
                rs.getString("reviewer_name"), instant(rs, "updated_at"), List.of()), id);
        if (rows.isEmpty()) {
            throw ServiceProblem.notFound("Không tìm thấy khóa học.");
        }
        var base = rows.get(0);
        // Đọc khung giờ qua JPA (cùng cách với trang quản lý của gia sư) để giờ hiển thị khớp với giờ gia sư đã nhập.
        List<OfferingReviewDTO.Slot> slots = slotRepository.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id).stream()
                .map(slot -> new OfferingReviewDTO.Slot(slot.getWeekday(), slot.getStartTime().toString(),
                        slot.getEndTime().toString(), slot.getTimeZone()))
                .toList();
        return new OfferingReviewDTO(base.id(), base.publicCode(), base.title(), base.description(), base.termsText(),
                base.tutorId(), base.tutorName(), base.tutorProfileStatus(), base.tutorActive(), base.type(), base.subject(),
                base.grade(), base.area(), base.mode(), base.unitPrice(), base.sessionCount(), base.durationMinutes(),
                base.capacity(), base.startsOn(), base.endsOn(), base.status(), base.version(), base.reviewNote(),
                base.reviewedAt(), base.reviewerName(), base.updatedAt(), slots);
    }

    /** Số khóa học đang chờ duyệt, hiển thị trên tab Khóa học. */
    public long pendingCount(AccountPrincipal principal) {
        guard.require(principal, "ADMIN");
        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM offerings WHERE status = 'IN_REVIEW'", Long.class);
        return total == null ? 0 : total;
    }

    /** @return trạng thái sau xử lý; gửi lặp cùng một quyết định trả về kết quả cũ mà không ghi thêm. */
    @Transactional
    public OfferingStatus decide(AccountPrincipal principal, Long id, OfferingReviewForm form) {
        UserAccount admin = guard.require(principal, "ADMIN");
        var violations = validator.validate(form);
        if (!violations.isEmpty()) {
            throw ServiceProblem.invalid(violations.iterator().next().getMessage());
        }
        boolean approve = "approve".equals(form.getAction());
        String reason = form.getReason() == null || form.getReason().isBlank() ? null : form.getReason().strip();
        if (!approve && (reason == null || reason.length() < 10)) {
            throw ServiceProblem.invalid("Hãy nhập lý do từ chối (ít nhất 10 ký tự) để gia sư biết cần sửa gì.");
        }
        Offering offering = em.find(Offering.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (offering == null) {
            throw ServiceProblem.notFound("Không tìm thấy khóa học.");
        }
        OfferingStatus target = approve ? OfferingStatus.PUBLISHED : OfferingStatus.REJECTED;
        if (offering.getStatus() == target && Objects.equals(offering.getReviewedBy(), admin.id())
                && Objects.equals(offering.getReviewNote(), reason)) {
            return target;
        }
        if (offering.getStatus() != OfferingStatus.IN_REVIEW) {
            throw ServiceProblem.conflict("Khóa học không còn ở trạng thái chờ duyệt. Hãy quay về danh sách để xem trạng thái mới nhất.");
        }
        if (!offering.getVersion().equals(form.getVersion())) {
            throw ServiceProblem.conflict("Gia sư vừa cập nhật khóa học. Hãy tải lại trang để xem nội dung mới nhất trước khi quyết định.");
        }
        if (approve) {
            Integer ready = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM tutor_profiles tp JOIN user_accounts u ON u.id = tp.user_id
                     WHERE tp.user_id = ? AND tp.review_status = 'APPROVED' AND u.status = 'ACTIVE' AND u.email_verified_at IS NOT NULL
                    """, Integer.class, offering.getTutorId());
            if (ready == null || ready == 0) {
                throw ServiceProblem.conflict("Hồ sơ gia sư chưa được duyệt hoặc tài khoản không hoạt động nên chưa thể công khai khóa học.");
            }
        }
        long previousVersion = offering.getVersion();
        Instant now = Instant.now();
        offering.setStatus(target);
        offering.setReviewedBy(admin.id());
        offering.setReviewedAt(now);
        offering.setReviewNote(reason);
        offering.setUpdatedAt(now);
        if (approve) {
            offering.setPublishedAt(now);
            if (offering.getFirstPublishedAt() == null) offering.setFirstPublishedAt(now);
        }
        offerings.saveAndFlush(offering);

        AuditLog log = AuditLog.create();
        log.setActorUserId(admin.id());
        log.setTargetUserId(offering.getTutorId());
        log.setActionCode("OFFERING_REVIEW");
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("offeringId", id);
        metadata.put("decision", form.getAction());
        metadata.put("previousVersion", previousVersion);
        metadata.put("resultingVersion", offering.getVersion());
        if (reason != null) metadata.put("reason", reason);
        log.setMetadata(metadata);
        log.setCreatedAt(now);
        audits.saveAndFlush(log);

        Notification notice = Notification.create();
        notice.setRecipientUserId(offering.getTutorId());
        notice.setEventKey("offering-review:" + id + ":" + offering.getVersion());
        notice.setNotificationType("OFFERING_REVIEW");
        notice.setTitle(approve ? "Khóa học đã được duyệt" : "Khóa học cần chỉnh sửa");
        String title = abbreviate(offering.getTitle(), 120);
        notice.setBody(approve
                ? "Khóa học \"" + title + "\" đã được duyệt và hiển thị công khai."
                : "Khóa học \"" + title + "\" chưa được duyệt. Lý do: " + abbreviate(reason, 700));
        notice.setCreatedAt(now);
        notifications.saveAndFlush(notice);
        return target;
    }

    private static Instant instant(java.sql.ResultSet rs, String column) throws java.sql.SQLException {
        LocalDateTime time = rs.getObject(column, LocalDateTime.class);
        return time == null ? null : time.toInstant(ZoneOffset.UTC);
    }

    private static String abbreviate(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max - 1) + "…";
    }
}
