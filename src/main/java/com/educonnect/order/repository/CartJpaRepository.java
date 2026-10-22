package com.educonnect.order.repository;

import com.educonnect.order.domain.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

import java.util.Optional;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface CartJpaRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByLearnerId(Long learnerId);
}
