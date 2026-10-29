package com.educonnect.job.service;

import com.educonnect.job.domain.JobApplication;
import com.educonnect.job.domain.JobApplicationStatus;
import com.educonnect.job.domain.JobPost;
import com.educonnect.job.domain.JobPostStatus;
import com.educonnect.job.domain.JobSelection;
import com.educonnect.job.dto.JobActionRequest;
import com.educonnect.job.dto.JobApplicationActionRequest;
import com.educonnect.job.dto.JobApplicationRequest;
import com.educonnect.job.dto.JobApplicationUpdateRequest;
import com.educonnect.job.dto.JobApplicationResponse;
import com.educonnect.job.dto.JobPostRequest;
import com.educonnect.job.dto.JobResponse;
import com.educonnect.job.dto.JobReviewResponse;
import com.educonnect.job.dto.JobSearchRequest;
import com.educonnect.job.dto.JobSelectionResponse;
import com.educonnect.job.dto.JobSourceResponse;
import com.educonnect.job.repository.JobApplicationJpaRepository;
import com.educonnect.job.repository.JobLookupRepository;
import com.educonnect.job.repository.JobPostJpaRepository;
import com.educonnect.job.repository.JobSelectionJpaRepository;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.order.domain.RegistrationSourceKind;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: tin tìm gia sư, ứng tuyển và chốt nguồn JOB.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class JobService {
    private final JobPostJpaRepository posts;
    private final JobApplicationJpaRepository applications;
    private final JobSelectionJpaRepository selections;
    private final JobLookupRepository lookup;
    private final JobAccess access;
    private final Clock clock;

    public JobService(JobPostJpaRepository posts, JobApplicationJpaRepository applications,
                      JobSelectionJpaRepository selections, JobLookupRepository lookup, JobAccess access, Clock clock) {
        this.posts = posts;
        this.applications = applications;
        this.selections = selections;
        this.lookup = lookup;
        this.access = access;
        this.clock = clock;
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/create: chỉ chủ tin mở được form sửa nháp/tin bị từ chối.
     */
    public JobPostRequest prepare(AccountPrincipal principal, Long id) {
        UserAccount actor = access.require(principal, "LEARNER");
        JobPostRequest form = new JobPostRequest();
        form.setRequestKey(UUID.randomUUID().toString());
        form.setAction("draft");
        if (id == null) {
            return form;
        }
        JobPost job = owned(id, actor.id(), false);
        if (!isEditable(job) || lookup.applicationCount(id) != 0) {
            throw conflict("Chỉ bản nháp hoặc tin bị từ chối chưa có ứng tuyển mới được sửa.");
        }
        form.setVersion(job.getVersion());
        form.setTitle(job.getTitle());
        form.setDescription(job.getDescription());
        form.setSubjectId(job.getSubjectId());
        form.setGradeLevelId(job.getGradeLevelId());
        form.setAreaId(job.getAreaId());
        form.setDeliveryModeId(job.getDeliveryModeId());
        form.setBudgetPerSession(job.getBudgetPerSession());
        form.setSessionCount(job.getSessionCount());
        return form;
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc danh mục thật để hiển thị các ô chọn trong form tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public OfferingOptionsResponse options() {
        return lookup.references();
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo/sửa và gửi duyệt; không cho sửa nội dung đã có ứng tuyển.
     */
    @Transactional
    public Long save(AccountPrincipal principal, Long id, JobPostRequest form) {
        UserAccount actor = access.require(principal, "LEARNER");
        access.validate(form);
        if (!lookup.referencesExist(form)) {
            throw invalid("Môn, cấp học, khu vực hoặc hình thức không tồn tại.");
        }
        JobPostStatus target = "submit".equals(form.getAction()) ? JobPostStatus.PENDING : JobPostStatus.DRAFT;
        return id == null ? createPost(actor.id(), form, target) : updatePost(actor.id(), id, form, target);
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm bộ lọc rồi trả trang tin đủ điều kiện công khai.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Page<JobResponse> discover(JobSearchRequest form) {
        access.validate(form);
        return lookup.search(form, null, null, true).map(job -> response(job, null));
    }

    /**
     * Tác giả: Trường Đạt.
     * Trả danh sách tin của đúng học viên, theo bộ lọc và trạng thái được chọn.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Page<JobResponse> mine(AccountPrincipal principal, JobSearchRequest form, JobPostStatus status) {
        UserAccount actor = access.require(principal, "LEARNER");
        access.validate(form);
        return lookup.search(form, actor.id(), status, false).map(job -> response(job, actor));
    }

    /**
     * Tác giả: Trường Đạt.
     * Không lộ tin chưa duyệt; ứng viên vẫn xem lại tin đã đóng/chốt của mình.
     */
    public JobResponse detail(AccountPrincipal principal, Long id) {
        UserAccount actor = principal == null ? null : access.require(principal, null);
        JobPost job = find(id, false);
        boolean owner = actor != null && actor.id().equals(job.getLearnerId()) && actor.roles().contains("LEARNER");
        boolean admin = actor != null && actor.roles().contains("ADMIN");
        boolean applicant = actor != null && actor.roles().contains("TUTOR")
                && (job.getStatus() == JobPostStatus.OPEN || job.getStatus() == JobPostStatus.MATCHED || job.getStatus() == JobPostStatus.CLOSED)
                && lookup.application(id, actor.id()).isPresent();
        if (!owner && !admin && !applicant && (job.getStatus() != JobPostStatus.OPEN || !access.activeLearner(job.getLearnerId()))) {
            throw missing();
        }
        return response(job, actor);
    }

    /**
     * Tác giả: Trường Đạt.
     * Chỉ trả đề xuất ứng tuyển của chính gia sư đang đăng nhập.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public JobApplicationResponse ownApplication(AccountPrincipal principal, Long id) {
        if (principal == null) {
            return null;
        }
        UserAccount actor = access.require(principal, null);
        if (!actor.roles().contains("TUTOR")) {
            return null;
        }
        detail(principal, id);
        JobPost job = find(id, false);
        return lookup.application(id, actor.id()).map(application -> applicationResponse(job, application, actor)).orElse(null);
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm chủ tin và phân trang danh sách ứng viên riêng của tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public Page<JobApplicationResponse> applicants(AccountPrincipal principal, Long id, int page) {
        UserAccount actor = access.require(principal, "LEARNER");
        if (page < 0 || page > 100000) {
            throw invalid("Số trang không hợp lệ.");
        }
        JobPost job = owned(id, actor.id(), false);
        return lookup.applications(id, page).map(application -> applicationResponse(job, application, actor));
    }

    /**
     * Tác giả: Trường Đạt.
     * Người đăng gửi duyệt hoặc đóng tin; không đóng nguồn đã chốt.
     */
    @Transactional
    public Long change(AccountPrincipal principal, Long id, JobActionRequest form) {
        UserAccount actor = access.require(principal, "LEARNER");
        access.validate(form);
        JobPost job = owned(id, actor.id(), true);
        JobPostStatus target = "submit".equals(form.getAction()) ? JobPostStatus.PENDING : JobPostStatus.CLOSED;
        if (job.getStatus() == target && isReplayVersion(job.getVersion(), form.getVersion())) {
            return id;
        }
        requireVersion(job.getVersion(), form.getVersion());
        boolean canClose = job.getStatus() != JobPostStatus.MATCHED && job.getStatus() != JobPostStatus.CLOSED;
        boolean allowed = target == JobPostStatus.PENDING ? isEditable(job) : canClose;
        if (!allowed) {
            throw conflict("Trạng thái tin không cho phép thao tác này.");
        }
        if (target == JobPostStatus.PENDING && lookup.applicationCount(id) != 0) {
            throw conflict("Tin đã có ứng tuyển; không thể gửi duyệt lại nội dung.");
        }
        job.setStatus(target);
        posts.saveAndFlush(job);
        return id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Gia sư đồng ý nội dung tin và đề xuất bất biến; unique job/tutor chống trùng.
     */
    @Transactional
    public Long apply(AccountPrincipal principal, Long id, JobApplicationRequest form) {
        UserAccount tutor = access.require(principal, "TUTOR");
        access.validate(form);
        requireTutor(tutor.id());
        JobPost job = find(id, true);
        if (tutor.id().equals(job.getLearnerId())) {
            throw invalid("Không thể ứng tuyển tin của chính mình.");
        }
        requireVersion(job.getVersion(), form.getJobVersion());
        var repeated = findRepeatedApplication(id, tutor.id(), form);
        if (repeated.isPresent()) {
            return repeated.get().getId();
        }
        if (job.getStatus() != JobPostStatus.OPEN || !access.activeLearner(job.getLearnerId())) {
            throw conflict("Tin hiện không nhận ứng tuyển.");
        }
        validateTotalPrice(form.getProposedUnitPrice(), job.getSessionCount());

        JobApplication application = JobApplication.create();
        application.setJobId(id);
        application.setTutorId(tutor.id());
        application.setProposedUnitPrice(form.getProposedUnitPrice());
        application.setMessage(normalize(form.getMessage()));
        application.setStatus(JobApplicationStatus.SUBMITTED);
        application.setCreatedAt(now());
        return applications.saveAndFlush(application).getId();
    }

    /**
     * Gia sư sửa giá và lời nhắn của đề xuất ứng tuyển còn chờ (tin còn nhận ứng tuyển). Phiên bản ứng tuyển tăng lên,
     * nên học viên đang xem bản cũ sẽ bị chặn khi chọn và phải tải lại đề xuất mới.
     */
    @Transactional
    public Long updateApplication(AccountPrincipal principal, Long id, Long applicationId, JobApplicationUpdateRequest form) {
        UserAccount tutor = access.require(principal, "TUTOR");
        access.validate(form);
        JobPost job = find(id, true);
        JobApplication application = lookup.lockApplication(id, applicationId);
        requireApplicationActor(job, application, tutor.id(), true);
        requireVersion(job.getVersion(), form.getJobVersion());
        requireVersion(application.getVersion(), form.getApplicationVersion());
        if (application.getStatus() != JobApplicationStatus.SUBMITTED || job.getStatus() != JobPostStatus.OPEN) {
            throw conflict("Tin hoặc ứng tuyển đã được xử lý. Hãy tải lại.");
        }
        validateTotalPrice(form.getProposedUnitPrice(), job.getSessionCount());
        application.setProposedUnitPrice(form.getProposedUnitPrice());
        application.setMessage(normalize(form.getMessage()));
        applications.saveAndFlush(application);
        return id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa tin trước ứng tuyển; chỉ một lựa chọn thắng trong cùng transaction.
     */
    @Transactional
    public Long decideApplication(AccountPrincipal principal, Long id, Long applicationId, JobApplicationActionRequest form) {
        boolean withdraw = form != null && "withdraw".equals(form.getAction());
        UserAccount actor = access.require(principal, withdraw ? "TUTOR" : "LEARNER");
        access.validate(form);
        JobPost job = find(id, true);
        JobApplication application = lookup.lockApplication(id, applicationId);
        requireApplicationActor(job, application, actor.id(), withdraw);

        JobApplicationStatus target = switch (form.getAction()) {
            case "withdraw" -> JobApplicationStatus.WITHDRAWN;
            case "reject" -> JobApplicationStatus.REJECTED;
            default -> JobApplicationStatus.SELECTED;
        };
        if (isRepeatedApplicationAction(job, application, target, form)) {
            return id;
        }
        requirePendingApplication(job, application, form, withdraw);
        if (target == JobApplicationStatus.SELECTED) {
            selectApplicant(job, application, actor.id());
        }
        application.setStatus(target);
        applications.saveAndFlush(application);
        return id;
    }

    /**
     * Tác giả: Trường Đạt.
     * Huy gọi trong transaction tạo đơn, giữ khóa học viên → tin → ứng tuyển → nguồn.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public JobSourceResponse lockSelectedSource(AccountPrincipal principal, Long id, Long jobVersion, Long applicationVersion) {
        UserAccount actor = access.require(principal, "LEARNER");
        if (!lookup.lockLearner(actor.id())) {
            throw missing();
        }
        JobPost job = owned(id, actor.id(), true);
        requireVersion(job.getVersion(), jobVersion);
        JobSelection selection = lookup.lockSelection(id).orElseThrow(() -> conflict("Tin chưa chốt nguồn JOB."));
        JobApplication application = lookup.lockApplication(id, selection.getApplicationId());
        if (application == null) {
            throw missing();
        }
        requireVersion(application.getVersion(), applicationVersion);
        if (job.getStatus() != JobPostStatus.MATCHED || application.getStatus() != JobApplicationStatus.SELECTED
                || !selection.getTutorId().equals(application.getTutorId()) || !selection.getSelectedBy().equals(actor.id())
                || !agreedTerms(job, application).equals(selection.getTermsText())) {
            throw conflict("Nguồn JOB chưa được chốt hợp lệ.");
        }
        requireTutor(application.getTutorId());
        if (lookup.lockSourceUsed(id)) {
            throw conflict("Tin đã được sử dụng làm nguồn giao dịch.");
        }
        return new JobSourceResponse(RegistrationSourceKind.JOB_APPLICATION.name(), id, job.getVersion(),
                application.getId(), application.getVersion(), actor.id(),
                application.getTutorId(), job.getSubjectId(), job.getGradeLevelId(), job.getAreaId(), job.getDeliveryModeId(),
                application.getProposedUnitPrice(), job.getSessionCount(), selection.getTermsVersion(), selection.getTermsText(),
                selection.getSelectedAt(), application.getCreatedAt());
    }

    /**
     * Tác giả: Trường Đạt.
     * Dựng Response của tin cùng quyền thao tác và dữ liệu riêng được phép xem.
     * Thuộc trang: các trang /job và duyệt tin /admin/job-review-*.
     */
    JobResponse response(JobPost job, UserAccount actor) {
        boolean owner = actor != null && actor.roles().contains("LEARNER") && actor.id().equals(job.getLearnerId());
        boolean admin = actor != null && actor.roles().contains("ADMIN");
        long applicationCount = lookup.applicationCount(job.getId());
        boolean canEdit = owner && isEditable(job) && applicationCount == 0;
        JobSelectionResponse snapshot = selectionResponse(job, actor, owner || admin);
        String reason = owner || admin ? lookup.lastReview(job.getId()).map(JobReviewResponse::reason).orElse(null) : null;
        boolean canApply = canApply(job, actor);
        return new JobResponse(job.getId(), job.getPublicCode(), job.getLearnerId(),
                job.getLearnerReference().getAccount().getDisplayName(), job.getTitle(), job.getDescription(),
                job.getSubjectId(), job.getGradeLevelId(), job.getAreaId(), job.getDeliveryModeId(),
                job.getSubjectReference().getName(), job.getGradeLevelReference().getName(), job.getAreaReference().getName(),
                job.getDeliveryModeReference().getName(), job.getBudgetPerSession(), job.getSessionCount(), job.getStatus(),
                job.getVersion(), job.getCreatedAt(), applicationCount, owner, canEdit,
                canEdit, owner && job.getStatus() != JobPostStatus.MATCHED && job.getStatus() != JobPostStatus.CLOSED,
                canApply, reason, snapshot);
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/create: khóa học viên, chống gửi trùng và lưu một tin mới.
     */
    private Long createPost(Long learnerId, JobPostRequest form, JobPostStatus target) {
        if (!lookup.lockLearner(learnerId)) {
            throw invalid("Chưa có hồ sơ học viên.");
        }
        String code = "JOB-" + UUID.fromString(form.getRequestKey());
        var previous = posts.findByPublicCode(code);
        if (previous.isPresent()) {
            JobPost stored = previous.get();
            if (!learnerId.equals(stored.getLearnerId())) {
                throw missing();
            }
            if (!sameContent(stored, form)) {
                throw conflict("Mã gửi đã dùng cho nội dung khác. Hãy mở form mới.");
            }
            return stored.getId();
        }
        JobPost job = JobPost.create();
        job.setPublicCode(code);
        job.setLearnerId(learnerId);
        job.setCreatedAt(now());
        applyPostForm(job, form, target);
        return posts.saveAndFlush(job).getId();
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/create: chỉ sửa đúng phiên bản tin còn được phép thay nội dung.
     */
    private Long updatePost(Long learnerId, Long id, JobPostRequest form, JobPostStatus target) {
        JobPost job = owned(id, learnerId, true);
        if (job.getStatus() == target && sameContent(job, form) && isReplayVersion(job.getVersion(), form.getVersion())) {
            return id;
        }
        requireVersion(job.getVersion(), form.getVersion());
        if (!isEditable(job) || lookup.applicationCount(id) != 0) {
            throw conflict("Tin đã gửi duyệt/công khai hoặc có ứng tuyển; không thể sửa đề xuất.");
        }
        applyPostForm(job, form, target);
        return posts.saveAndFlush(job).getId();
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/create: ánh xạ các trường được phép nhập, giữ riêng danh tính và phiên bản.
     */
    private void applyPostForm(JobPost job, JobPostRequest form, JobPostStatus target) {
        job.setTitle(form.getTitle().strip());
        job.setDescription(normalize(form.getDescription()));
        job.setSubjectId(form.getSubjectId());
        job.setGradeLevelId(form.getGradeLevelId());
        job.setAreaId(form.getAreaId());
        job.setDeliveryModeId(form.getDeliveryModeId());
        job.setBudgetPerSession(form.getBudgetPerSession());
        job.setSessionCount(form.getSessionCount());
        job.setStatus(target);
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/detail: gửi lại ứng tuyển chỉ nhận lại đúng đề xuất chưa kết thúc.
     */
    private Optional<JobApplication> findRepeatedApplication(Long jobId, Long tutorId, JobApplicationRequest form) {
        var previous = lookup.lockApplicationForTutor(jobId, tutorId);
        if (previous.isEmpty()) {
            return previous;
        }
        JobApplication application = previous.get();
        if (application.getProposedUnitPrice().compareTo(form.getProposedUnitPrice()) != 0
                || !application.getMessage().equals(normalize(form.getMessage()))) {
            throw conflict("Bạn đã ứng tuyển tin này với đề xuất khác.");
        }
        if (application.getStatus() == JobApplicationStatus.WITHDRAWN || application.getStatus() == JobApplicationStatus.REJECTED) {
            throw conflict("Lượt ứng tuyển đã kết thúc; không thể gửi lại.");
        }
        return previous;
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/detail và /job/applicants: kiểm đúng người rút/chọn/từ chối ứng tuyển.
     */
    private void requireApplicationActor(JobPost job, JobApplication application, Long actorId, boolean withdraw) {
        if (application == null) {
            throw missing();
        }
        Long allowedActorId = withdraw ? application.getTutorId() : job.getLearnerId();
        if (!actorId.equals(allowedActorId)) {
            throw missing();
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/applicants: nhận diện thao tác lặp theo cả phiên bản tin và ứng tuyển.
     */
    private boolean isRepeatedApplicationAction(JobPost job, JobApplication application, JobApplicationStatus target,
                                                JobApplicationActionRequest form) {
        boolean jobVersionMatches = target == JobApplicationStatus.SELECTED
                ? isReplayVersion(job.getVersion(), form.getJobVersion()) : Objects.equals(job.getVersion(), form.getJobVersion());
        return application.getStatus() == target && isReplayVersion(application.getVersion(), form.getApplicationVersion()) && jobVersionMatches;
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/detail và /job/applicants: kiểm phiên bản và trạng thái trước khi đổi ứng tuyển.
     */
    private void requirePendingApplication(JobPost job, JobApplication application, JobApplicationActionRequest form, boolean withdraw) {
        requireVersion(job.getVersion(), form.getJobVersion());
        requireVersion(application.getVersion(), form.getApplicationVersion());
        if (application.getStatus() != JobApplicationStatus.SUBMITTED || job.getStatus() == JobPostStatus.MATCHED
                || !withdraw && job.getStatus() != JobPostStatus.OPEN) {
            throw conflict("Tin hoặc ứng tuyển đã được xử lý. Hãy tải lại.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/applicants: chốt điều khoản, khóa tin nhận ứng tuyển và loại các ứng viên khác.
     */
    private void selectApplicant(JobPost job, JobApplication application, Long actorId) {
        requireTutor(application.getTutorId());
        if (!access.activeLearner(job.getLearnerId())) {
            throw conflict("Người đăng không còn đủ điều kiện.");
        }
        if (lookup.selection(job.getId()).isPresent()) {
            throw conflict("Tin đã có gia sư được chọn.");
        }
        validateTotalPrice(application.getProposedUnitPrice(), job.getSessionCount());

        JobSelection selection = JobSelection.create();
        selection.setJobId(job.getId());
        selection.setApplicationId(application.getId());
        selection.setTutorId(application.getTutorId());
        selection.setSelectedBy(actorId);
        selection.setTermsVersion(1);
        selection.setTermsText(agreedTerms(job, application));
        selection.setSelectedAt(now());
        selections.saveAndFlush(selection);
        job.setStatus(JobPostStatus.MATCHED);
        posts.saveAndFlush(job);
        lookup.rejectOtherApplications(job.getId(), application.getId());
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/detail: chỉ hai bên hoặc admin nhận dữ liệu thỏa thuận đã chốt.
     */
    private JobSelectionResponse selectionResponse(JobPost job, UserAccount actor, boolean canManage) {
        var selected = lookup.selection(job.getId());
        if (selected.isEmpty()) {
            return null;
        }
        JobSelection selection = selected.get();
        if (!canManage && (actor == null || !actor.id().equals(selection.getTutorId()))) {
            return null;
        }
        JobApplication application = applications.findById(selection.getApplicationId()).orElseThrow(JobService::missing);
        return new JobSelectionResponse(application.getId(), application.getTutorId(),
                application.getTutorReference().getAccount().getDisplayName(),
                application.getProposedUnitPrice(), selection.getTermsVersion(), selection.getTermsText(), selection.getSelectedAt(),
                lookup.sourceCount(job.getId()) > 0);
    }

    /**
     * Tác giả: Trường Đạt.
     * /job/detail: xác định khả năng hiển thị form ứng tuyển, vẫn kiểm lại khi POST.
     */
    private boolean canApply(JobPost job, UserAccount actor) {
        return actor != null && actor.roles().contains("TUTOR") && !actor.id().equals(job.getLearnerId())
                && job.getStatus() == JobPostStatus.OPEN && lookup.publicTutor(actor.id())
                && access.activeLearner(job.getLearnerId()) && lookup.application(job.getId(), actor.id()).isEmpty();
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuyển ứng tuyển sang Response cho người đăng hoặc chính ứng viên.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private JobApplicationResponse applicationResponse(JobPost job, JobApplication application, UserAccount actor) {
        boolean submitted = application.getStatus() == JobApplicationStatus.SUBMITTED;
        boolean owner = actor.id().equals(job.getLearnerId()) && actor.roles().contains("LEARNER");
        boolean canSelect = owner && submitted && job.getStatus() == JobPostStatus.OPEN
                && lookup.publicTutor(application.getTutorId()) && access.tutorRole(application.getTutorId());
        return new JobApplicationResponse(application.getId(), application.getTutorId(),
                application.getTutorReference().getAccount().getDisplayName(), application.getTutorReference().getHeadline(),
                application.getProposedUnitPrice(), application.getMessage(), application.getStatus(), application.getVersion(),
                application.getCreatedAt(), canSelect, owner && submitted && job.getStatus() == JobPostStatus.OPEN,
                actor.id().equals(application.getTutorId()) && actor.roles().contains("TUTOR") && submitted && job.getStatus() != JobPostStatus.MATCHED,
                actor.id().equals(application.getTutorId()) && actor.roles().contains("TUTOR") && submitted && job.getStatus() == JobPostStatus.OPEN);
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc hoặc khóa tin thuộc đúng học viên trước thao tác riêng tư.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private JobPost owned(Long id, Long actorId, boolean lock) {
        JobPost job = find(id, lock);
        if (!job.getLearnerId().equals(actorId)) {
            throw missing();
        }
        return job;
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm mã tin rồi nạp bản ghi cho luồng đọc hoặc luồng cần khóa.
     * Thuộc trang: các trang /job và duyệt tin /admin/job-review-*.
     */
    JobPost find(Long id, boolean lock) {
        if (id == null || id < 1) {
            throw invalid("Mã tin không hợp lệ.");
        }
        return (lock ? lookup.lockJob(id) : lookup.find(id)).orElseThrow(JobService::missing);
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm vai trò và trạng thái công khai của gia sư qua dữ liệu A01/A02 hiện có.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private void requireTutor(Long id) {
        if (!lookup.publicTutor(id) || !access.tutorRole(id)) {
            throw conflict("Gia sư chưa đủ điều kiện hoặc không còn công khai.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Xác định trạng thái được phép sửa nội dung tin.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private boolean isEditable(JobPost job) {
        return job.getStatus() == JobPostStatus.DRAFT || job.getStatus() == JobPostStatus.REJECTED;
    }

    /**
     * Tác giả: Trường Đạt.
     * So sánh nội dung chuẩn hóa của form và tin đã lưu khi nhận gửi lặp.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private boolean sameContent(JobPost job, JobPostRequest form) {
        return job.getTitle().equals(form.getTitle().strip()) && job.getDescription().equals(normalize(form.getDescription()))
                && Objects.equals(job.getSubjectId(), form.getSubjectId()) && Objects.equals(job.getGradeLevelId(), form.getGradeLevelId())
                && Objects.equals(job.getAreaId(), form.getAreaId()) && Objects.equals(job.getDeliveryModeId(), form.getDeliveryModeId())
                && job.getBudgetPerSession().compareTo(form.getBudgetPerSession()) == 0 && job.getSessionCount().equals(form.getSessionCount());
    }

    /**
     * Tác giả: Trường Đạt.
     * Ghép nội dung tin và đề xuất bất biến thành bộ điều khoản hai bên đã đồng ý.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private String agreedTerms(JobPost job, JobApplication application) {
        return job.getTitle() + "\n\n" + job.getDescription() + "\n\nĐề xuất gia sư:\n" + application.getMessage()
                + "\n\nGiá chốt: " + application.getProposedUnitPrice().toPlainString() + " VND/buổi; " + job.getSessionCount() + " buổi.";
    }

    /**
     * Tác giả: Trường Đạt.
     * Chặn thao tác dùng phiên bản tin hoặc ứng tuyển đã cũ.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    static void requireVersion(Long stored, Long submitted) {
        if (!Objects.equals(stored, submitted)) {
            throw conflict("Dữ liệu đã thay đổi. Hãy tải lại trước khi thao tác.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Chỉ nhận phiên bản hiện tại hoặc ngay trước thao tác đã hoàn tất khi gửi lặp.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private boolean isReplayVersion(Long stored, Long submitted) {
        return submitted != null && (Objects.equals(stored, submitted) || Objects.equals(stored - 1, submitted));
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm tổng học phí nguyên VND không vượt khả năng lưu của DB.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private void validateTotalPrice(BigDecimal price, Short count) {
        if (price.multiply(BigDecimal.valueOf(count)).compareTo(new BigDecimal("9999999999999999999")) > 0) {
            throw invalid("Tổng học phí vượt giới hạn 19 chữ số.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuẩn hóa xuống dòng và khoảng trắng ngoài nội dung trước khi lưu/so sánh.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private String normalize(String text) {
        return text.replace("\r\n", "\n").replace('\r', '\n').strip();
    }

    /**
     * Tác giả: Trường Đạt.
     * Lấy thời điểm từ Clock dùng chung, khớp độ chính xác microsecond của DB.
     * Thuộc các luồng ghi DAT-04.
     */
    Instant now() {
        return clock.instant().truncatedTo(ChronoUnit.MICROS);
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi không tìm thấy dữ liệu thuộc quyền truy cập.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    static JobProblem missing() {
        return JobAccess.problem(HttpStatus.NOT_FOUND, "Không tìm thấy tin/ứng tuyển thuộc quyền truy cập của bạn.");
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi dữ liệu đầu vào không hợp lệ.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    static JobProblem invalid(String message) {
        return JobAccess.problem(HttpStatus.BAD_REQUEST, message);
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi trạng thái hoặc phiên bản đã thay đổi.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    static JobProblem conflict(String message) {
        return JobAccess.problem(HttpStatus.CONFLICT, message);
    }
}
