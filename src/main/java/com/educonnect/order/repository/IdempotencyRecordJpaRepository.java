package com.educonnect.order.repository;

import com.educonnect.order.domain.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface IdempotencyRecordJpaRepository extends JpaRepository<IdempotencyRecord, Long> {}
