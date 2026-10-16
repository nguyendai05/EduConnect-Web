package com.educonnect.user.repository;

import com.educonnect.user.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface UserAccountJpaRepository extends JpaRepository<UserAccount, Long> {}
