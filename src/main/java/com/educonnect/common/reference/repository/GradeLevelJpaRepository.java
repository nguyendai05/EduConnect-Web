package com.educonnect.common.reference.repository;

import com.educonnect.common.reference.domain.GradeLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface GradeLevelJpaRepository extends JpaRepository<GradeLevel, Long> {
    /** Tìm cấp học theo tên, không phân biệt hoa thường và dấu (theo collation của bảng). */
    java.util.Optional<GradeLevel> findFirstByName(String name);

    long countByCreatedBy(Long createdBy);
}
