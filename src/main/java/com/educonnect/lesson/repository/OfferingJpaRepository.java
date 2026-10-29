package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.AccountStatus;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** Repository JPA quản lý khóa học / dịch vụ (bảng offerings). */
@Profile("db-dev")
public interface OfferingJpaRepository extends JpaRepository<Offering, Long> {
    @EntityGraph(attributePaths = {"subjectReference", "gradeLevelReference", "areaReference", "deliveryModeReference"})
    List<Offering> findByTutorIdOrderByUpdatedAtDescIdDesc(Long tutorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Offering o where o.id = :id and o.tutorId = :tutorId")
    Optional<Offering> findOwnedForUpdate(@Param("id") Long id, @Param("tutorId") Long tutorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Offering o where o.publicCode = :code")
    Optional<Offering> findCodeForUpdate(@Param("code") String code);

    Optional<Offering> findByIdAndTutorId(Long id, Long tutorId);

    @Query("select count(e) from Enrollment e where e.offeringId = :id")
    long countEnrollments(@Param("id") Long id);

    @EntityGraph(attributePaths = {"tutorReference.account", "subjectReference",
            "gradeLevelReference", "areaReference", "deliveryModeReference"})
    @Query("select o from Offering o where o.id = :id")
    Optional<Offering> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"tutorReference.account", "subjectReference",
            "gradeLevelReference", "areaReference", "deliveryModeReference"})
    @Query("select o from Offering o where o.status = :status order by o.id")
    List<Offering> findByStatusWithDetails(@Param("status") OfferingStatus status);

    @EntityGraph(attributePaths = {"tutorReference", "tutorReference.account", "subjectReference",
            "gradeLevelReference", "areaReference", "deliveryModeReference"})
    Page<Offering> findByStatusAndTutorReferenceReviewStatusAndTutorReferenceAccountStatus(
            OfferingStatus status, TutorReviewStatus reviewStatus, AccountStatus accountStatus, Pageable pageable);

    /** Danh sách catalog chỉ nhận dịch vụ công khai của gia sư và tài khoản đủ điều kiện. */
    @EntityGraph(attributePaths = {"tutorReference", "tutorReference.account", "subjectReference",
            "gradeLevelReference", "areaReference", "deliveryModeReference"})
    @Query("""
            select o from Offering o join o.tutorReference t join t.account a
            where o.status = :status and t.reviewStatus = :reviewStatus
              and a.status = :accountStatus and a.emailVerifiedAt is not null
            """)
    Page<Offering> findPublicPage(@Param("status") OfferingStatus status,
                                  @Param("reviewStatus") TutorReviewStatus reviewStatus,
                                  @Param("accountStatus") AccountStatus accountStatus,
                                  Pageable pageable);
}
