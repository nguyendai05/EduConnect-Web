package com.educonnect.tutor.repository;

import com.educonnect.tutor.domain.TutorProfileEvidence;
import com.educonnect.tutor.domain.TutorProfileEvidenceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface TutorProfileEvidenceJpaRepository extends JpaRepository<TutorProfileEvidence, TutorProfileEvidenceId> {}
