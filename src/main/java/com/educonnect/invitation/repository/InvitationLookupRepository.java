package com.educonnect.invitation.repository;

import com.educonnect.common.reference.domain.Area;
import com.educonnect.common.reference.domain.DeliveryMode;
import com.educonnect.common.reference.domain.GradeLevel;
import com.educonnect.common.reference.domain.Subject;
import com.educonnect.invitation.domain.Invitation;
import com.educonnect.invitation.dto.InvitationTutorResponse;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.dto.OfferingOptionResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.AccountStatus;
import com.educonnect.user.domain.LearnerProfile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Tác giả: Trường Đạt.
 * Query đọc danh mục/gia sư và khóa dữ liệu cho DAT-03.
 */
@Repository
@Profile("db-dev")
public class InvitationLookupRepository {
    private final EntityManager entityManager;

    public InvitationLookupRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc danh sách gia sư công khai, loại chính người gửi khỏi lựa chọn.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public List<InvitationTutorResponse> publicTutors(Long learnerId) {
        return entityManager.createQuery("""
                select new com.educonnect.invitation.dto.InvitationTutorResponse(t.userId, a.displayName, t.headline)
                from TutorProfile t join t.account a
                where t.reviewStatus = :approved and a.status = :active and a.emailVerifiedAt is not null
                  and t.userId <> :learnerId order by a.displayName, t.userId
                """, InvitationTutorResponse.class)
                .setParameter("approved", TutorReviewStatus.APPROVED)
                .setParameter("active", AccountStatus.ACTIVE)
                .setParameter("learnerId", learnerId).getResultList();
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc hồ sơ gia sư đã duyệt cùng tài khoản còn hoạt động và xác minh.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public Optional<TutorProfile> publicTutor(Long id) {
        var result = entityManager.createQuery("""
                select t from TutorProfile t join fetch t.account a
                where t.userId = :id and t.reviewStatus = :approved
                  and a.status = :active and a.emailVerifiedAt is not null
                """, TutorProfile.class).setParameter("id", id)
                .setParameter("approved", TutorReviewStatus.APPROVED)
                .setParameter("active", AccountStatus.ACTIVE).getResultList();
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc dịch vụ công khai để gợi ý nội dung lời mời.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public List<Offering> publicOfferings(Long tutorId) {
        return entityManager.createQuery("""
                select o from Offering o join fetch o.tutorReference t join fetch t.account a
                join fetch o.subjectReference join fetch o.gradeLevelReference
                join fetch o.areaReference join fetch o.deliveryModeReference
                where o.status = :published and t.reviewStatus = :approved
                  and a.status = :active and a.emailVerifiedAt is not null
                  and (:tutorId is null or o.tutorId = :tutorId) order by o.id desc
                """, Offering.class).setParameter("published", OfferingStatus.PUBLISHED)
                .setParameter("approved", TutorReviewStatus.APPROVED)
                .setParameter("active", AccountStatus.ACTIVE)
                .setParameter("tutorId", tutorId).getResultList();
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc bốn nhóm danh mục cho form lời mời.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public OfferingOptionsResponse references() {
        return new OfferingOptionsResponse(options("Subject"), options("GradeLevel"), options("Area"), options("DeliveryMode"));
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuyển một danh mục cố định sang các lựa chọn Response.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private List<OfferingOptionResponse> options(String entityName) {
        return entityManager.createQuery("select new com.educonnect.lesson.dto.OfferingOptionResponse(r.id, r.name) from "
                + entityName + " r order by r.name, r.id", OfferingOptionResponse.class).getResultList();
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm bốn ID danh mục trong đề xuất đều tồn tại.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public boolean referencesExist(Long subject, Long grade, Long area, Long mode) {
        return entityManager.find(Subject.class, subject) != null && entityManager.find(GradeLevel.class, grade) != null
                && entityManager.find(Area.class, area) != null && entityManager.find(DeliveryMode.class, mode) != null;
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa hồ sơ học viên để tuần tự hóa tạo lời mời và sử dụng nguồn.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public boolean lockLearner(Long id) {
        return entityManager.find(LearnerProfile.class, id, LockModeType.PESSIMISTIC_WRITE) != null;
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc lại trạng thái lời mời dưới khóa ghi hiện tại.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    public void refreshLocked(Invitation invitation) {
        entityManager.refresh(invitation, LockModeType.PESSIMISTIC_WRITE);
    }
}
