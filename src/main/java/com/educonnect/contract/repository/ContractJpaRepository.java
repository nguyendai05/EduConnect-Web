package com.educonnect.contract.repository;

import com.educonnect.contract.domain.Contract;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
