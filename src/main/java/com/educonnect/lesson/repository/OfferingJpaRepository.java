package com.educonnect.lesson.repository;

import com.educonnect.lesson.domain.Offering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface OfferingJpaRepository extends JpaRepository<Offering, Long> {}
