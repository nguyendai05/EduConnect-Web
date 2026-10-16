package com.educonnect.auth.repository;

import com.educonnect.auth.domain.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface PendingRegistrationJpaRepository extends JpaRepository<PendingRegistration, String> {}
