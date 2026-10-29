package com.educonnect.wallet.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import com.educonnect.wallet.domain.LedgerAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface LedgerAccountJpaRepository extends JpaRepository<LedgerAccount, Long> {

    /** Tìm tài khoản sổ cái theo mã, khóa dòng để kiểm số dư an toàn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<LedgerAccount> findByAccountCode(String accountCode);
}
