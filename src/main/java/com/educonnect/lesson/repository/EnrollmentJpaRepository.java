package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface EnrollmentJpaRepository extends JpaRepository<Enrollment, Long> {
    @Query("""
            select coalesce(sum(e.seatCount), 0) from Enrollment e
            where e.offeringId = :offeringId
              and (e.status in (com.educonnect.lesson.domain.EnrollmentStatus.CONFIRMED,
                                com.educonnect.lesson.domain.EnrollmentStatus.COMPLETED)
                   or (e.status = com.educonnect.lesson.domain.EnrollmentStatus.RESERVED
                       and e.reservedUntil > :now))
            """)
    long countOccupiedSeats(@Param("offeringId") Long offeringId,
                            @Param("now") Instant now);
}
