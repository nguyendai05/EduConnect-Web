package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.OfferingTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import java.util.List;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface OfferingTimeSlotJpaRepository extends JpaRepository<OfferingTimeSlot, Long> {
    List<OfferingTimeSlot> findByOfferingIdOrderByWeekdayAscStartTimeAsc(Long offeringId);
}
