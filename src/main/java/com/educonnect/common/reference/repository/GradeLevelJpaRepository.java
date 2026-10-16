package com.educonnect.common.reference.repository;

import com.educonnect.common.reference.domain.GradeLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface GradeLevelJpaRepository extends JpaRepository<GradeLevel, Long> {}
