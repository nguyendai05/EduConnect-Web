package com.educonnect.invitation.repository;

import com.educonnect.invitation.domain.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface InvitationJpaRepository extends JpaRepository<Invitation, Long> {}
