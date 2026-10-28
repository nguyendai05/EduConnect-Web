package com.educonnect.contract.repository;

import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** Repository JPA quản lý buổi học của hợp đồng (bảng contract_sessions). */
@Profile("db-dev")
public interface ContractSessionJpaRepository extends JpaRepository<ContractSession, Long> {
    List<ContractSession> findByContractIdOrderBySessionNumber(Long contractId);

    List<ContractSession> findByContractIdAndStatusIn(Long contractId, List<ContractSessionStatus> statuses);

    Optional<ContractSession> findFirstByContractIdAndStatusOrderBySessionNumber(Long contractId, ContractSessionStatus status);

    long countByContractIdAndStatusNot(Long contractId, ContractSessionStatus status);

    /** Các buổi đã điểm danh quá hạn chờ học viên xác nhận. */
    List<ContractSession> findByStatusAndAttendedAtBefore(ContractSessionStatus status, Instant before);
}
