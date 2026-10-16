package com.educonnect.order.repository;

import com.educonnect.order.domain.OrderStatusTransition;
import com.educonnect.order.domain.OrderStatusTransitionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface OrderStatusTransitionJpaRepository extends JpaRepository<OrderStatusTransition, OrderStatusTransitionId> {}
