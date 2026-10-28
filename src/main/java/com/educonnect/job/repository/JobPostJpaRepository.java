package com.educonnect.job.repository;

import com.educonnect.job.domain.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;

/**
 * Tác giả: Trường Đạt.
 * Lưu tin và phiên bản; truy vấn tìm/lọc/phân trang nằm trong JobLookupRepository.
 * Thuộc các trang /job và duyệt tin /admin/job-review-*.
 */
@Profile("db-dev")
public interface JobPostJpaRepository extends JpaRepository<JobPost, Long> {
    /** Khóa theo mã gửi để tạo tin lặp không sinh bản ghi thứ hai. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<JobPost> findByPublicCode(String publicCode);
}
