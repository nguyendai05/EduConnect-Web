package com.educonnect.tutor.repository;

import com.educonnect.tutor.domain.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface TutorProfileJpaRepository extends JpaRepository<TutorProfile, Long> {}
