package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface EnrollmentJpaRepository extends JpaRepository<Enrollment, Long> {}
