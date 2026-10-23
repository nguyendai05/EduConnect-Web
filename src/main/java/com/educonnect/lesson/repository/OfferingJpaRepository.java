package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.AccountStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** Repository JPA quản lý khóa học / dịch vụ (bảng offerings). */
@Profile("db-dev")
public interface OfferingJpaRepository extends JpaRepository<Offering, Long> {

    /**
     * Nạp khóa học kèm toàn bộ quan hệ (Gia sư, Tài khoản, Môn học, Khối lớp, Khu vực, Hình thức) trong 1 query.
     */
    @Query("SELECT o FROM Offering o " +
           "LEFT JOIN FETCH o.tutorReference t " +
           "LEFT JOIN FETCH t.account ta " +
           "LEFT JOIN FETCH o.subjectReference " +
           "LEFT JOIN FETCH o.gradeLevelReference " +
           "LEFT JOIN FETCH o.areaReference " +
           "LEFT JOIN FETCH o.deliveryModeReference " +
           "WHERE o.id = :id")
    Optional<Offering> findByIdWithDetails(@Param("id") Long id);

    /**
     * Lấy danh sách khóa học theo trạng thái kèm thông tin chi tiết để hiển thị lên Trang chủ.
     */
    @Query("SELECT o FROM Offering o " +
           "LEFT JOIN FETCH o.tutorReference t " +
           "LEFT JOIN FETCH t.account ta " +
           "LEFT JOIN FETCH o.subjectReference " +
           "LEFT JOIN FETCH o.gradeLevelReference " +
           "LEFT JOIN FETCH o.areaReference " +
           "LEFT JOIN FETCH o.deliveryModeReference " +
           "WHERE o.status = :status ORDER BY o.id ASC")
    List<Offering> findByStatusWithDetails(@Param("status") OfferingStatus status);

    @EntityGraph(attributePaths = {"tutorReference", "tutorReference.account"})
    Page<Offering> findByStatusAndTutorReferenceReviewStatusAndTutorReferenceAccountStatus(
            OfferingStatus status, TutorReviewStatus reviewStatus, AccountStatus accountStatus, Pageable pageable);
}
