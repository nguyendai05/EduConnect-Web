package com.educonnect.payment.repository;

import java.util.Optional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import com.educonnect.payment.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface PaymentJpaRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    /** Thanh toán thuộc đơn của đúng người học. */
    @Query("select p from Payment p where p.id = :id and exists (select 1 from Order o where o.id = p.orderId and o.learnerId = :learnerId)")
    Optional<Payment> findOwned(@Param("id") Long id, @Param("learnerId") Long learnerId);
}
