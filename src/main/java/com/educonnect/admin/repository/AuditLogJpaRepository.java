package com.educonnect.admin.repository;

import com.educonnect.admin.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface AuditLogJpaRepository extends JpaRepository<AuditLog, Long> {}
