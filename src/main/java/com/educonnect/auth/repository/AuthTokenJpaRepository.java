package com.educonnect.auth.repository;

import com.educonnect.auth.domain.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import com.educonnect.auth.domain.AuthTokenPurpose;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface AuthTokenJpaRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByTokenHashAndPurpose(byte[] tokenHash, AuthTokenPurpose purpose);
    List<AuthToken> findByUserIdAndPurposeAndUsedAtIsNullAndRevokedAtIsNull(Long userId, AuthTokenPurpose purpose);
    Optional<AuthToken> findFirstByUserIdAndPurposeOrderByCreatedAtDesc(Long userId, AuthTokenPurpose purpose);
    long countByUserIdAndPurposeAndCreatedAtAfter(Long userId, AuthTokenPurpose purpose, Instant since);
}
