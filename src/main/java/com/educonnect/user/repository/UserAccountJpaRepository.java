package com.educonnect.user.repository;

import com.educonnect.user.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface UserAccountJpaRepository extends JpaRepository<UserAccount, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserAccount> findLockedByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserAccount> findLockedById(Long id);
}
