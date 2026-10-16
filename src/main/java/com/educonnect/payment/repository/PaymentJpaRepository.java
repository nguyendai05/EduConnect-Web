package com.educonnect.payment.repository;

import com.educonnect.payment.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface PaymentJpaRepository extends JpaRepository<Payment, Long> {}
