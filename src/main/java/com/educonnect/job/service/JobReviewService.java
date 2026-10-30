package com.educonnect.job.service;

import com.educonnect.admin.domain.AuditLog;
import com.educonnect.admin.repository.AuditLogJpaRepository;
import com.educonnect.job.domain.JobPostStatus;
import com.educonnect.job.domain.JobPost;
import com.educonnect.job.dto.JobResponse;
import com.educonnect.job.dto.JobReviewRequest;
import com.educonnect.job.dto.JobReviewResponse;
import com.educonnect.job.dto.JobSearchRequest;
import com.educonnect.job.repository.JobLookupRepository;
import com.educonnect.job.repository.JobPostJpaRepository;
import com.educonnect.security.AccountPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Objects;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: admin duyệt tin có lý do, dùng nhật ký có sẵn của nền quản trị.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class JobReviewService {
    private final JobService jobs;
    private final JobPostJpaRepository posts;
    private final JobLookupRepository lookup;
    private final AuditLogJpaRepository audits;
    private final JobAccess access;

    public JobReviewService(JobService jobs, JobPostJpaRepository posts, JobLookupRepository lookup,
                            AuditLogJpaRepository audits, JobAccess access) {
        this.jobs = jobs;
        this.posts = posts;
        this.lookup = lookup;
        this.audits = audits;
        this.access = access;
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm quyền admin và đọc danh sách tin theo trạng thái, bộ lọc.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Page<JobResponse> queue(AccountPrincipal principal, JobSearchRequest form, JobPostStatus status) {
        var admin = access.require(principal, "ADMIN");
        access.validate(form);
        return lookup.search(form, null, status, false).map(job -> jobs.response(job, admin));
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm quyền admin trước khi hiển thị nội dung tin cần duyệt.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public JobResponse detail(AccountPrincipal principal, Long id) {
        var admin = access.require(principal, "ADMIN");
        return jobs.response(jobs.find(id, false), admin);
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc quyết định duyệt gần nhất cho đúng tin sau khi kiểm quyền admin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public JobReviewResponse lastDecision(AccountPrincipal principal, Long id) {
        access.require(principal, "ADMIN");
        jobs.find(id, false);
        return lookup.lastReview(id).orElse(null);
    }

    /**
     * Tác giả: Trường Đạt.
     * Điều phối kiểm phiên bản, đổi trạng thái và lưu nhật ký duyệt trong cùng transaction.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @Transactional
    public Long review(AccountPrincipal principal, Long id, JobReviewRequest form) {
        var admin = access.require(principal, "ADMIN");
        access.validate(form);
        String reason = form.getReason() == null || form.getReason().isBlank() ? null : form.getReason().strip();
        if (!"approve".equals(form.getAction()) && (reason == null || reason.length() < 10)) {
            throw JobService.invalid("Hãy nhập lý do từ chối (ít nhất 10 ký tự) để người đăng biết cần sửa gì.");
        }
        var job = jobs.find(id, true);
        var target = "approve".equals(form.getAction()) ? JobPostStatus.OPEN : JobPostStatus.REJECTED;
        var previous = lookup.lastReviewLocked(id);
        if (job.getStatus() == target && previous.isPresent()
                && isRepeatedDecision(job, admin.id(), form, previous.get())) {
            return id;
        }
        JobService.requireVersion(job.getVersion(), form.getVersion());
        if (job.getStatus() != JobPostStatus.PENDING) {
            throw JobService.conflict("Chỉ tin đang chờ duyệt mới nhận quyết định.");
        }
        if (target == JobPostStatus.OPEN && !access.activeLearner(job.getLearnerId())) {
            throw JobService.conflict("Người đăng không còn đủ điều kiện công khai tin.");
        }
        Long previousVersion = job.getVersion();
        job.setStatus(target);
        posts.saveAndFlush(job);
        recordDecision(job, admin.id(), form, previousVersion);
        return id;
    }

    /**
     * Tác giả: Trường Đạt.
     * /admin/job-review-detail: nhận diện đúng quyết định đã được admin gửi trước đó.
     */
    private boolean isRepeatedDecision(JobPost job, Long adminId, JobReviewRequest form, JobReviewResponse decision) {
        return Objects.equals(decision.actorId(), adminId)
                && Objects.equals(decision.previousVersion(), form.getVersion())
                && Objects.equals(decision.resultingVersion(), job.getVersion())
                && decision.action().equals(form.getAction())
                && decision.reason().equals(form.getReason() == null ? "" : form.getReason().strip());
    }

    /**
     * Tác giả: Trường Đạt.
     * /admin/job-review-detail: ghi lý do và phiên bản vào nhật ký trong transaction duyệt tin.
     */
    private void recordDecision(JobPost job, Long adminId, JobReviewRequest form, Long previousVersion) {
        AuditLog log = AuditLog.create();
        log.setActorUserId(adminId);
        log.setTargetUserId(job.getLearnerId());
        log.setActionCode("JOB_REVIEW");
        Map<String, Object> metadata = new java.util.LinkedHashMap<>();
        metadata.put("jobId", job.getId());
        metadata.put("previousVersion", previousVersion);
        metadata.put("resultingVersion", job.getVersion());
        metadata.put("decision", form.getAction());
        if (form.getReason() != null && !form.getReason().isBlank()) metadata.put("reason", form.getReason().strip());
        log.setMetadata(metadata);
        log.setCreatedAt(jobs.now());
        audits.saveAndFlush(log);
    }
}
