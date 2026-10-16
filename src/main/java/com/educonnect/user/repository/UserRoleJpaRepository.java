package com.educonnect.user.repository;

import com.educonnect.user.domain.UserRole;
import com.educonnect.user.domain.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface UserRoleJpaRepository extends JpaRepository<UserRole, UserRoleId> {}
