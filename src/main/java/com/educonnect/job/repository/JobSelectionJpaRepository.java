package com.educonnect.job.repository;

import com.educonnect.job.domain.JobSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

/**
 * Tác giả: Trường Đạt.
 * Lưu thỏa thuận lựa chọn duy nhất của mỗi tin trong transaction chọn gia sư.
 * Thuộc trang: /job/applicants và /job/detail.
 */
@Profile("db-dev")
public interface JobSelectionJpaRepository extends JpaRepository<JobSelection, Long> {}
