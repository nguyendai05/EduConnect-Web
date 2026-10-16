package com.educonnect.admin.repository;

import com.educonnect.admin.domain.ReportEvidence;
import com.educonnect.admin.domain.ReportEvidenceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface ReportEvidenceJpaRepository extends JpaRepository<ReportEvidence, ReportEvidenceId> {}
