package com.educonnect.payment.repository;

import com.educonnect.payment.domain.PaymentWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface PaymentWebhookEventJpaRepository extends JpaRepository<PaymentWebhookEvent, Long> {

    boolean existsByProviderAndEventKey(String provider, String eventKey);
}
