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
}
