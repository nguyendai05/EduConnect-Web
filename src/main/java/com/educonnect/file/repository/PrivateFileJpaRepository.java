package com.educonnect.file.repository;

import com.educonnect.file.domain.PrivateFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface PrivateFileJpaRepository extends JpaRepository<PrivateFile, Long> {}
