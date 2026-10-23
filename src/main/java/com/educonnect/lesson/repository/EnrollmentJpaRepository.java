package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Enrollment;
import com.educonnect.lesson.domain.EnrollmentStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

@Profile("db-dev")
public interface EnrollmentJpaRepository extends JpaRepository<Enrollment, Long> {
    @Query("""
            select coalesce(sum(e.seatCount), 0) from Enrollment e
            where e.offeringId = :id
              and (e.status in :occupied or (e.status = :reserved and e.reservedUntil > :now))
            """)
    long countSeats(@Param("id") Long id, @Param("occupied") List<EnrollmentStatus> occupied,
                    @Param("reserved") EnrollmentStatus reserved, @Param("now") Instant now);
}
