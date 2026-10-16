package com.educonnect.wallet.repository;

import com.educonnect.wallet.domain.Release;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface ReleaseJpaRepository extends JpaRepository<Release, Long> {}
