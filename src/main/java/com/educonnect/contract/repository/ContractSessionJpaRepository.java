package com.educonnect.contract.repository;

import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Repository JPA quản lý buổi học của hợp đồng (bảng contract_sessions). */
@Profile("db-dev")
public interface ContractSessionJpaRepository extends JpaRepository<ContractSession, Long> {
    List<ContractSession> findByContractIdOrderBySessionNumber(Long contractId);

    /** Số buổi đã điểm danh (không còn HELD) của mọi hợp đồng thuộc một lớp; lớn hơn 0 nghĩa là lớp đã bắt đầu. */
    @org.springframework.data.jpa.repository.Query("select count(s) from ContractSession s, Contract c where s.contractId = c.id"
            + " and c.orderItemReference.registrationSourceReference.offeringId = :offering"
            + " and s.status <> com.educonnect.contract.domain.ContractSessionStatus.HELD")
    long countStarted(@org.springframework.data.repository.query.Param("offering") Long offeringId);

    List<ContractSession> findByContractIdAndStatusIn(Long contractId, List<ContractSessionStatus> statuses);

    Optional<ContractSession> findFirstByContractIdAndStatusOrderBySessionNumber(Long contractId, ContractSessionStatus status);

    long countByContractIdAndStatusNot(Long contractId, ContractSessionStatus status);

    /** Các buổi đã điểm danh quá hạn chờ học viên xác nhận. */
    List<ContractSession> findByStatusAndAttendedAtBefore(ContractSessionStatus status, Instant before);

    /** Buổi học của nhiều hợp đồng cùng lúc, để hiện tiến độ trong danh sách. */
    List<ContractSession> findByContractIdInOrderByContractIdAscSessionNumberAsc(Collection<Long> contractIds);
}
