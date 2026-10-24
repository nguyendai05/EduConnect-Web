package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Offering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
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
}
