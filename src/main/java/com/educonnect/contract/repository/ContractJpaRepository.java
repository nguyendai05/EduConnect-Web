package com.educonnect.contract.repository;

import com.educonnect.contract.domain.Contract;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import com.educonnect.order.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
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

    @EntityGraph(attributePaths = {"orderItemReference.orderReference", "tutorReference.account"})
    @Query("select c from Contract c where c.id = :id and c.learnerId = :learnerId")
    Optional<Contract> findByIdWithDetails(@Param("id") Long id, @Param("learnerId") Long learnerId);

    @EntityGraph(attributePaths = {"orderItemReference.orderReference", "tutorReference.account", "learnerReference.account"})
    @Query("select c from Contract c where c.learnerId = :learnerId order by c.id desc")
    List<Contract> findLatestByLearnerId(@Param("learnerId") Long learnerId);

    /** Lịch sử đơn của người học, mới nhất trước; status = null thì lấy tất cả. */
    @EntityGraph(attributePaths = {"orderItemReference.orderReference", "orderItemReference.registrationSourceReference", "tutorReference.account"})
    @Query(value = "select c from Contract c where c.learnerId = :learnerId"
            + " and (:status is null or c.orderItemReference.orderReference.status = :status) order by c.id desc",
            countQuery = "select count(c) from Contract c where c.learnerId = :learnerId"
            + " and (:status is null or c.orderItemReference.orderReference.status = :status)")
    Page<Contract> findHistory(@Param("learnerId") Long learnerId, @Param("status") OrderStatus status, Pageable pageable);

    /** Hợp đồng mà người dùng là học viên hoặc gia sư; người khác không đọc được. */
    @EntityGraph(attributePaths = {"orderItemReference.orderReference", "tutorReference.account", "learnerReference.account"})
    @Query("select c from Contract c where c.id = :id and (c.learnerId = :userId or c.tutorId = :userId)")
    Optional<Contract> findForParticipant(@Param("id") Long id, @Param("userId") Long userId);
}
