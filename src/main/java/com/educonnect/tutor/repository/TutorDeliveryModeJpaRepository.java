package com.educonnect.tutor.repository;

import com.educonnect.tutor.domain.TutorDeliveryMode;
import com.educonnect.tutor.domain.TutorDeliveryModeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface TutorDeliveryModeJpaRepository extends JpaRepository<TutorDeliveryMode, TutorDeliveryModeId> {}
