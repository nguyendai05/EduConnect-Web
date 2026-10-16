package com.educonnect.contract.repository;

import com.educonnect.contract.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface ContractJpaRepository extends JpaRepository<Contract, Long> {}
