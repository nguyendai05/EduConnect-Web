package com.educonnect.contract.repository;

import com.educonnect.contract.domain.Contract;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA quản lý hợp đồng (bảng contracts).
 */
@Profile("db-dev")
public interface ContractJpaRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByLearnerIdAndOrderItemReferenceOrderReferenceCreationKey(Long learnerId, String creationKey);

    /**
     * Nạp hợp đồng kèm toàn bộ thông tin liên quan (OrderItem, Order, Học viên, Gia sư) trong 1 query.
     */
    @Query("SELECT c FROM Contract c " +
           "JOIN FETCH c.orderItemReference oi " +
           "JOIN FETCH oi.orderReference o " +
           "LEFT JOIN FETCH c.learnerReference l " +
           "LEFT JOIN FETCH l.account la " +
           "LEFT JOIN FETCH c.tutorReference t " +
           "LEFT JOIN FETCH t.account ta " +
           "WHERE c.id = :id AND c.learnerId = :learnerId")
    Optional<Contract> findByIdWithDetails(@Param("id") Long id, @Param("learnerId") Long learnerId);

    /**
     * Tìm danh sách hợp đồng mới nhất của học viên theo thứ tự giảm dần.
     */
    @Query("SELECT c FROM Contract c " +
           "JOIN FETCH c.orderItemReference oi " +
           "JOIN FETCH oi.orderReference o " +
           "LEFT JOIN FETCH c.learnerReference l " +
           "LEFT JOIN FETCH l.account la " +
           "LEFT JOIN FETCH c.tutorReference t " +
           "LEFT JOIN FETCH t.account ta " +
           "WHERE c.learnerId = :learnerId ORDER BY c.id DESC")
    List<Contract> findLatestByLearnerId(@Param("learnerId") Long learnerId);
}
