package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.OfferingTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface OfferingTimeSlotJpaRepository extends JpaRepository<OfferingTimeSlot, Long> {
    List<OfferingTimeSlot> findByOfferingIdOrderByWeekdayAscStartTimeAsc(Long offeringId);

    List<OfferingTimeSlot> findByOfferingIdInOrderByWeekdayAscStartTimeAsc(Collection<Long> offeringIds);

    @Modifying
    @Query("delete from OfferingTimeSlot s where s.offeringId = :offeringId")
    void deleteSlots(@Param("offeringId") Long offeringId);
}
