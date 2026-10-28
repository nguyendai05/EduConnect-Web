package com.educonnect.job.repository;

import com.educonnect.admin.domain.AuditLog;
import com.educonnect.common.reference.domain.Area;
import com.educonnect.common.reference.domain.DeliveryMode;
import com.educonnect.common.reference.domain.GradeLevel;
import com.educonnect.common.reference.domain.Subject;
import com.educonnect.job.domain.JobApplication;
import com.educonnect.job.domain.JobApplicationStatus;
import com.educonnect.job.domain.JobPost;
import com.educonnect.job.domain.JobPostStatus;
import com.educonnect.job.domain.JobSelection;
import com.educonnect.job.dto.JobPostRequest;
import com.educonnect.job.dto.JobReviewResponse;
import com.educonnect.job.dto.JobSearchRequest;
import com.educonnect.lesson.dto.OfferingOptionResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.order.domain.RegistrationSource;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.AccountStatus;
import com.educonnect.user.domain.LearnerProfile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: tìm/lọc/phân trang và khóa trên mapping dùng chung hiện có.
 */
@Repository
@Profile("db-dev")
public class JobLookupRepository {
    private final EntityManager entityManager;

    public JobLookupRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Tác giả: Trường Đạt.
     * Ghép phạm vi và bộ lọc, rồi thực thi cùng điều kiện cho data/count.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Page<JobPost> search(JobSearchRequest form, Long learnerId, JobPostStatus status, boolean publicOnly) {
        StringBuilder where = new StringBuilder(" where 1=1");
        Map<String, Object> parameters = new LinkedHashMap<>();
        appendScope(where, parameters, learnerId, status, publicOnly);
        appendFilters(where, parameters, form);
        return executeSearch(where.toString(), parameters, form);
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/discover, /job/my-job và hàng đợi duyệt: giới hạn phạm vi dữ liệu được đọc.
     */
    private void appendScope(StringBuilder where, Map<String, Object> parameters, Long learnerId,
                             JobPostStatus status, boolean publicOnly) {
        if (learnerId != null) {
            where.append(" and j.learnerId = :learner");
            parameters.put("learner", learnerId);
        }
        if (status != null) {
            where.append(" and j.status = :status");
            parameters.put("status", status);
        }
        if (publicOnly) {
            where.append(" and j.status = :open and j.learnerReference.account.status = :active")
                    .append(" and j.learnerReference.account.emailVerifiedAt is not null")
                    .append(" and exists (select r from UserRole r where r.id.userId = j.learnerId and r.id.roleCode = 'LEARNER')");
            parameters.put("open", JobPostStatus.OPEN);
            parameters.put("active", AccountStatus.ACTIVE);
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Các danh sách tin: ghép từ khóa, danh mục và khoảng ngân sách bằng tham số bind.
     */
    private void appendFilters(StringBuilder where, Map<String, Object> parameters, JobSearchRequest form) {
        String q = form.getQ() == null ? "" : form.getQ().strip();
        if (!q.isEmpty()) {
            where.append(" and (lower(j.title) like :q escape '!' or lower(j.description) like :q escape '!')");
            parameters.put("q", "%" + q.toLowerCase(Locale.ROOT).replace("!", "!!").replace("%", "!%")
                    .replace("_", "!_") + "%");
        }
        Long[] values = {form.getSubjectId(), form.getGradeLevelId(), form.getAreaId(), form.getDeliveryModeId()};
        String[] fields = {"subjectId", "gradeLevelId", "areaId", "deliveryModeId"};
        for (int index = 0; index < fields.length; index++) {
            if (values[index] != null) {
                where.append(" and j.").append(fields[index]).append(" = :").append(fields[index]);
                parameters.put(fields[index], values[index]);
            }
        }
        if (form.getMinPrice() != null) {
            where.append(" and j.budgetPerSession >= :min");
            parameters.put("min", form.getMinPrice());
        }
        if (form.getMaxPrice() != null) {
            where.append(" and j.budgetPerSession <= :max");
            parameters.put("max", form.getMaxPrice());
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Các danh sách tin: data/count dùng cùng bộ lọc, sort ổn định và phân trang tại DB.
     */
    private Page<JobPost> executeSearch(String where, Map<String, Object> parameters, JobSearchRequest form) {
        String sort = switch (form.getSort()) {
            case "budget-asc" -> "j.budgetPerSession asc, j.id desc";
            case "budget-desc" -> "j.budgetPerSession desc, j.id desc";
            default -> "j.createdAt desc, j.id desc";
        };
        var count = entityManager.createQuery("select count(j) from JobPost j" + where, Long.class);
        var data = entityManager.createQuery("select j from JobPost j join fetch j.learnerReference l join fetch l.account"
                + " join fetch j.subjectReference join fetch j.gradeLevelReference"
                + " join fetch j.areaReference join fetch j.deliveryModeReference" + where + " order by " + sort, JobPost.class);
        parameters.forEach((name, value) -> {
            count.setParameter(name, value);
            data.setParameter(name, value);
        });
        var page = PageRequest.of(form.getPage(), form.getSize());
        return new PageImpl<>(data.setFirstResult((int) page.getOffset()).setMaxResults(page.getPageSize()).getResultList(),
                page, count.getSingleResult());
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc bản ghi tin qua mapping hiện có, không tự quyết định quyền truy cập.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobPost> find(Long id) {
        return Optional.ofNullable(entityManager.find(JobPost.class, id));
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa tin và refresh để đọc trạng thái mới nhất dưới MySQL REPEATABLE READ.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobPost> lockJob(Long id) {
        JobPost job = entityManager.find(JobPost.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (job != null) {
            entityManager.refresh(job, LockModeType.PESSIMISTIC_WRITE);
        }
        return Optional.ofNullable(job);
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa hồ sơ học viên trước khi tạo tin hoặc sử dụng nguồn giao dịch.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public boolean lockLearner(Long id) {
        return entityManager.find(LearnerProfile.class, id, LockModeType.PESSIMISTIC_WRITE) != null;
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm hồ sơ được duyệt, tài khoản hoạt động/xác minh và vai trò gia sư.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public boolean publicTutor(Long id) {
        return !entityManager.createQuery("""
                select t.userId from TutorProfile t join t.account a
                where t.userId = :id and t.reviewStatus = :approved and a.status = :active
                  and a.emailVerifiedAt is not null
                  and exists (select r from UserRole r where r.id.userId = t.userId and r.id.roleCode = 'TUTOR')
                """, Long.class).setParameter("id", id).setParameter("approved", TutorReviewStatus.APPROVED)
                .setParameter("active", AccountStatus.ACTIVE).setMaxResults(1).getResultList().isEmpty();
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc lượt ứng tuyển duy nhất của một gia sư cho một tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobApplication> application(Long jobId, Long tutorId) {
        return entityManager.createQuery("select a from JobApplication a where a.jobId = :job and a.tutorId = :tutor", JobApplication.class)
                .setParameter("job", jobId).setParameter("tutor", tutorId).getResultStream().findFirst();
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa và refresh lượt ứng tuyển trước khi kiểm gửi lặp.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobApplication> lockApplicationForTutor(Long jobId, Long tutorId) {
        var results = entityManager.createQuery("select a from JobApplication a where a.jobId = :job and a.tutorId = :tutor", JobApplication.class)
                .setParameter("job", jobId).setParameter("tutor", tutorId)
                .setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList();
        if (results.isEmpty()) {
            return Optional.empty();
        }
        entityManager.refresh(results.get(0), LockModeType.PESSIMISTIC_WRITE);
        return Optional.of(results.get(0));
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa đúng ứng tuyển thuộc tin và đọc lại phiên bản hiện tại.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public JobApplication lockApplication(Long jobId, Long id) {
        var result = entityManager.createQuery("select a from JobApplication a where a.id = :id and a.jobId = :job", JobApplication.class)
                .setParameter("id", id).setParameter("job", jobId).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList();
        if (result.isEmpty()) {
            return null;
        }
        entityManager.refresh(result.get(0), LockModeType.PESSIMISTIC_WRITE);
        return result.get(0);
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc trang ứng viên cùng tên/headline; data/count cùng giới hạn theo tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Page<JobApplication> applications(Long jobId, int page) {
        var data = entityManager.createQuery("""
                select a from JobApplication a join fetch a.tutorReference t join fetch t.account
                where a.jobId = :job order by a.createdAt desc, a.id desc
                """, JobApplication.class).setParameter("job", jobId).setFirstResult(page * 12).setMaxResults(12).getResultList();
        return new PageImpl<>(data, PageRequest.of(page, 12), applicationCount(jobId));
    }

    /**
     * Tác giả: Trường Đạt.
     * Đếm các lượt ứng tuyển gắn với tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public long applicationCount(Long jobId) {
        return entityManager.createQuery("select count(a) from JobApplication a where a.jobId = :job", Long.class)
                .setParameter("job", jobId).getSingleResult();
    }

    /**
     * Tác giả: Trường Đạt.
     * Từ chối các ứng viên chưa xử lý khác và tăng phiên bản sau khi chọn một người.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public void rejectOtherApplications(Long jobId, Long selectedId) {
        entityManager.createQuery("""
                update JobApplication a set a.status = :rejected, a.version = a.version + 1
                where a.jobId = :job and a.id <> :selected and a.status = :submitted
                """).setParameter("rejected", JobApplicationStatus.REJECTED).setParameter("job", jobId)
                .setParameter("selected", selectedId).setParameter("submitted", JobApplicationStatus.SUBMITTED).executeUpdate();
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc thỏa thuận đã chốt cho một tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobSelection> selection(Long jobId) {
        return Optional.ofNullable(entityManager.find(JobSelection.class, jobId));
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa và refresh thỏa thuận khi Huy kiểm nguồn trong transaction tạo đơn.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobSelection> lockSelection(Long jobId) {
        var selection = entityManager.find(JobSelection.class, jobId, LockModeType.PESSIMISTIC_WRITE);
        if (selection != null) {
            entityManager.refresh(selection, LockModeType.PESSIMISTIC_WRITE);
        }
        return Optional.ofNullable(selection);
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc số nguồn giao dịch đã sử dụng tin; không ghi bảng giao dịch của Huy.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public long sourceCount(Long jobId) {
        return entityManager.createQuery("select count(s) from RegistrationSource s where s.jobId = :job", Long.class)
                .setParameter("job", jobId).getSingleResult();
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa các nguồn đã có để kiểm tin đã được dùng trong transaction giao dịch.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public boolean lockSourceUsed(Long jobId) {
        return !entityManager.createQuery("select s from RegistrationSource s where s.jobId = :job", RegistrationSource.class)
                .setParameter("job", jobId).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList().isEmpty();
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc quyết định duyệt gần nhất; luồng ghi dùng current read khi cần khóa.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobReviewResponse> lastReview(Long jobId) {
        return lastReview(jobId, false);
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc quyết định duyệt mới nhất dưới khóa để kiểm gửi lặp.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Optional<JobReviewResponse> lastReviewLocked(Long jobId) {
        return lastReview(jobId, true);
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc quyết định duyệt gần nhất; luồng ghi dùng current read khi cần khóa.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @SuppressWarnings("unchecked")
    private Optional<JobReviewResponse> lastReview(Long jobId, boolean lock) {
        List<AuditLog> logs = entityManager.createNativeQuery("""
                select * from audit_logs where action_code = 'JOB_REVIEW'
                and json_unquote(json_extract(metadata, '$.jobId')) = :job
                order by id desc limit 1
                """ + (lock ? " for update" : ""), AuditLog.class).setParameter("job", jobId.toString()).getResultList();
        if (logs.isEmpty()) {
            return Optional.empty();
        }
        var log = logs.get(0);
        var metadata = log.getMetadata();
        return Optional.of(new JobReviewResponse(log.getActorUserId(), Objects.toString(metadata.get("decision"), ""),
                Objects.toString(metadata.get("reason"), ""), Long.valueOf(metadata.get("previousVersion").toString()),
                Long.valueOf(metadata.get("resultingVersion").toString()), log.getCreatedAt()));
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc bốn nhóm danh mục cho form đăng tin và bộ lọc.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public OfferingOptionsResponse references() {
        return new OfferingOptionsResponse(options("Subject"), options("GradeLevel"), options("Area"), options("DeliveryMode"));
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuyển một danh mục cố định sang các lựa chọn Response.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private List<OfferingOptionResponse> options(String entityName) {
        return entityManager.createQuery("select new com.educonnect.lesson.dto.OfferingOptionResponse(r.id, r.name) from "
                + entityName + " r order by r.name, r.id", OfferingOptionResponse.class).getResultList();
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm các ID danh mục được gửi trong form đều tồn tại.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public boolean referencesExist(JobPostRequest form) {
        return entityManager.find(Subject.class, form.getSubjectId()) != null && entityManager.find(GradeLevel.class, form.getGradeLevelId()) != null
                && entityManager.find(Area.class, form.getAreaId()) != null && entityManager.find(DeliveryMode.class, form.getDeliveryModeId()) != null;
    }
}
