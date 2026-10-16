package com.educonnect.job.repository;

import com.educonnect.job.domain.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface JobPostJpaRepository extends JpaRepository<JobPost, Long> {}
