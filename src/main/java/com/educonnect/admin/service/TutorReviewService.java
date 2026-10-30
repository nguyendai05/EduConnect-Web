package com.educonnect.admin.service;

import com.educonnect.admin.domain.AuditLog;
import com.educonnect.admin.dto.TutorReviewForm;
import com.educonnect.admin.dto.TutorReviewQueueDTO;
import com.educonnect.admin.repository.AuditLogJpaRepository;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.notification.domain.Notification;
import com.educonnect.notification.repository.NotificationJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.tutor.dto.TutorProfileDTO;
import com.educonnect.tutor.repository.TutorProfileEvidenceJpaRepository;
import com.educonnect.tutor.repository.TutorProfileJpaRepository;
import com.educonnect.tutor.service.TutorProfileService;
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
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * DAI-02 (phần duyệt của BB12): admin xem hàng đợi, xem hồ sơ + minh chứng, duyệt hoặc từ chối có lý do.
 * Mọi thao tác kiểm vai trò ADMIN ở máy chủ; quyết định, nhật ký và thông báo ghi trong cùng một transaction.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class TutorReviewService {
    public static final int PAGE_SIZE = 10;

    private final AccountGuard guard;
    private final JdbcTemplate jdbc;
    private final EntityManager em;
    private final TutorProfileService profiles;
    private final TutorProfileJpaRepository profileRepository;
    private final TutorProfileEvidenceJpaRepository evidence;
    private final AuditLogJpaRepository audits;
    private final NotificationJpaRepository notifications;
    private final Validator validator;

    public TutorReviewService(AccountGuard guard, JdbcTemplate jdbc, EntityManager em, TutorProfileService profiles,
                              TutorProfileJpaRepository profileRepository, TutorProfileEvidenceJpaRepository evidence,
                              AuditLogJpaRepository audits, NotificationJpaRepository notifications, Validator validator) {
        this.guard = guard;
        this.jdbc = jdbc;
        this.em = em;
        this.profiles = profiles;
        this.profileRepository = profileRepository;
        this.evidence = evidence;
        this.audits = audits;
        this.notifications = notifications;
        this.validator = validator;
    }

    public TutorReviewQueueDTO queue(AccountPrincipal principal, TutorReviewStatus status, String keyword, int page) {
        guard.require(principal, "ADMIN");
        int safePage = Math.max(0, page);
        String q = keyword == null ? "" : keyword.strip();
        if (q.length() > 100) {
            throw ServiceProblem.invalid("Từ khóa tối đa 100 ký tự.");
        }
        List<Object> where = new ArrayList<>();
        StringBuilder filter = new StringBuilder(" WHERE t.review_status = ?");
        where.add(status.name());
        if (!q.isEmpty()) {
            String like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
            // Cột email là ASCII: so khớp với từ khóa có dấu sẽ lỗi collation, nên chỉ tìm email khi từ khóa thuần ASCII.
            boolean ascii = q.chars().allMatch(c -> c < 128);
            filter.append(ascii ? " AND (u.display_name LIKE ? OR u.email LIKE ? OR t.headline LIKE ?)"
                    : " AND (u.display_name LIKE ? OR t.headline LIKE ?)");
            where.add(like);
            if (ascii) where.add(like);
            where.add(like);
        }
        String from = " FROM tutor_profiles t JOIN user_accounts u ON u.id = t.user_id";
        Long total = jdbc.queryForObject("SELECT COUNT(*)" + from + filter, Long.class, where.toArray());

        List<Object> args = new ArrayList<>(where);
        args.add(PAGE_SIZE);
        args.add((long) safePage * PAGE_SIZE);
        String order = status == TutorReviewStatus.PENDING ? "t.updated_at ASC" : "t.updated_at DESC";
        List<TutorReviewQueueDTO.Row> rows = jdbc.query("""
                SELECT t.user_id, u.display_name, u.email, t.headline, t.experience_years, t.review_status, t.updated_at,
                       (SELECT COUNT(*) FROM tutor_profile_evidence e WHERE e.tutor_id = t.user_id) AS evidence_count,
                       (SELECT GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR ', ') FROM tutor_subjects ts
                          JOIN subjects s ON s.id = ts.subject_id WHERE ts.tutor_id = t.user_id) AS subject_names
                """ + from + filter + " ORDER BY " + order + ", t.user_id ASC LIMIT ? OFFSET ?",
                (rs, n) -> new TutorReviewQueueDTO.Row(rs.getLong("user_id"), rs.getString("display_name"),
                        rs.getString("email"), rs.getString("headline"), rs.getInt("experience_years"),
                        TutorReviewStatus.valueOf(rs.getString("review_status")),
                        rs.getObject("updated_at", LocalDateTime.class).toInstant(ZoneOffset.UTC),
                        rs.getInt("evidence_count"), rs.getString("subject_names")),
                args.toArray());

        Map<TutorReviewStatus, Long> counts = new EnumMap<>(TutorReviewStatus.class);
        jdbc.query("SELECT review_status, COUNT(*) AS total FROM tutor_profiles GROUP BY review_status",
                rs -> { counts.put(TutorReviewStatus.valueOf(rs.getString("review_status")), rs.getLong("total")); });
        return new TutorReviewQueueDTO(rows, safePage, PAGE_SIZE, total == null ? 0 : total, counts);
    }

    public TutorProfileDTO detail(AccountPrincipal principal, Long tutorId) {
        guard.require(principal, "ADMIN");
        return profiles.load(tutorId);
    }

    /** @return trạng thái sau xử lý; gửi lặp cùng một quyết định trả về nguyên kết quả cũ mà không ghi thêm. */
    @Transactional
    public TutorReviewStatus decide(AccountPrincipal principal, Long tutorId, TutorReviewForm form) {
        UserAccount admin = guard.require(principal, "ADMIN");
        var violations = validator.validate(form);
        if (!violations.isEmpty()) {
            throw ServiceProblem.invalid(violations.iterator().next().getMessage());
        }
        boolean approve = "approve".equals(form.getAction());
        String reason = form.getReason() == null || form.getReason().isBlank() ? null : form.getReason().strip();
        if (!approve && (reason == null || reason.length() < 10)) {
            throw ServiceProblem.invalid("Hãy nhập lý do từ chối (ít nhất 10 ký tự) để gia sư biết cần bổ sung gì.");
        }
        TutorProfile profile = em.find(TutorProfile.class, tutorId, LockModeType.PESSIMISTIC_WRITE);
        if (profile == null) {
            throw ServiceProblem.notFound("Không tìm thấy hồ sơ gia sư.");
        }
        TutorReviewStatus target = approve ? TutorReviewStatus.APPROVED : TutorReviewStatus.REJECTED;
        if (profile.getReviewStatus() == target && Objects.equals(profile.getReviewedBy(), admin.id())
                && Objects.equals(profile.getReviewNote(), reason)) {
            return target;
        }
        if (profile.getReviewStatus() != TutorReviewStatus.PENDING) {
            throw ServiceProblem.conflict("Hồ sơ không còn ở trạng thái chờ duyệt. Hãy quay về hàng đợi để xem trạng thái mới nhất.");
        }
        if (!profile.getVersion().equals(form.getVersion())) {
            throw ServiceProblem.conflict("Gia sư vừa cập nhật hồ sơ. Hãy tải lại trang để xem nội dung mới nhất trước khi quyết định.");
        }
        var account = em.find(com.educonnect.user.domain.UserAccount.class, tutorId);
        if (approve) {
            if (account == null || account.getStatus() != com.educonnect.user.domain.AccountStatus.ACTIVE
                    || account.getEmailVerifiedAt() == null) {
                throw ServiceProblem.conflict("Tài khoản gia sư chưa xác minh email hoặc đang bị khóa nên chưa thể duyệt.");
            }
            if (evidence.countByIdTutorId(tutorId) == 0) {
                throw ServiceProblem.conflict("Hồ sơ chưa có minh chứng nên chưa thể duyệt.");
            }
        }
        long previousVersion = profile.getVersion();
        Instant now = Instant.now();
        profile.setReviewStatus(target);
        profile.setReviewedBy(admin.id());
        profile.setReviewedAt(now);
        profile.setReviewNote(reason);
        profile.setUpdatedAt(now);
        profileRepository.saveAndFlush(profile);

        AuditLog log = AuditLog.create();
        log.setActorUserId(admin.id());
        log.setTargetUserId(tutorId);
        log.setActionCode("TUTOR_REVIEW");
        Map<String, Object> metadata = new java.util.LinkedHashMap<>();
        metadata.put("tutorId", tutorId);
        metadata.put("decision", form.getAction());
        metadata.put("previousVersion", previousVersion);
        metadata.put("resultingVersion", profile.getVersion());
        if (reason != null) metadata.put("reason", reason);
        log.setMetadata(metadata);
        log.setCreatedAt(now);
        audits.saveAndFlush(log);

        Notification notice = Notification.create();
        notice.setRecipientUserId(tutorId);
        notice.setEventKey("tutor-review:" + tutorId + ":" + profile.getVersion());
        notice.setNotificationType("TUTOR_REVIEW");
        notice.setTitle(approve ? "Hồ sơ gia sư đã được duyệt" : "Hồ sơ gia sư cần bổ sung");
        notice.setBody(approve
                ? "Hồ sơ của bạn đã được duyệt và hiển thị công khai trong kết quả tìm gia sư."
                : "Hồ sơ của bạn chưa được duyệt. Lý do: " + abbreviate(reason, 800));
        notice.setCreatedAt(now);
        notifications.saveAndFlush(notice);
        return target;
    }

    private static String abbreviate(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max - 1) + "…";
    }
}
