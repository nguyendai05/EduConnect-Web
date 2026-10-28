package com.educonnect.job.repository;

import com.educonnect.job.domain.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/**
 * Tác giả: Trường Đạt.
 * Lưu ứng tuyển và phiên bản; truy vấn đọc/khóa theo tin nằm trong JobLookupRepository.
 * Thuộc trang: /job/detail và /job/applicants.
 */
@Profile("db-dev")
public interface JobApplicationJpaRepository extends JpaRepository<JobApplication, Long> {}
