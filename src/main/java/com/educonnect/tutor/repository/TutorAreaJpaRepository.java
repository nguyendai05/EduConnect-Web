package com.educonnect.tutor.repository;

import com.educonnect.tutor.domain.TutorArea;
import com.educonnect.tutor.domain.TutorAreaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface TutorAreaJpaRepository extends JpaRepository<TutorArea, TutorAreaId> {
    java.util.List<TutorArea> findByIdTutorId(Long tutorId);
}
