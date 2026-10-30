package com.educonnect.tutor.service;

import com.educonnect.admin.domain.AuditLog;
import com.educonnect.admin.repository.AuditLogJpaRepository;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.common.reference.repository.AreaJpaRepository;
import com.educonnect.common.reference.repository.DeliveryModeJpaRepository;
import com.educonnect.common.reference.repository.GradeLevelJpaRepository;
import com.educonnect.common.reference.repository.SubjectJpaRepository;
import com.educonnect.common.reference.service.CustomCatalogService;
import com.educonnect.file.domain.FilePurpose;
import com.educonnect.file.repository.PrivateFileJpaRepository;
import com.educonnect.file.service.PrivateFileService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.*;
import com.educonnect.tutor.dto.TutorProfileDTO;
import com.educonnect.tutor.dto.TutorProfileDTO.Choice;
import com.educonnect.tutor.dto.TutorProfileForm;
import com.educonnect.tutor.repository.*;
import com.educonnect.user.UserAccount;
import com.educonnect.user.repository.UserAccountJpaRepository;
import com.educonnect.user.service.AccountGuard;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;

/**
 * DAI-02 (TC01): hồ sơ gia sư — xem, sửa, gửi minh chứng, gửi duyệt/duyệt lại.
 *
 * <p>Quy tắc duyệt lại (đề xuất cho Q07, chờ nhóm xác nhận): sửa tiêu đề, số năm kinh nghiệm, môn hoặc cấp dạy,
 * thêm/xóa minh chứng của hồ sơ ĐÃ DUYỆT đưa hồ sơ về "Chờ duyệt" và tạm ẩn khỏi tìm kiếm công khai.
 * Giới thiệu, khu vực và hình thức dạy sửa tự do. Hồ sơ đang chờ duyệt bị khóa chỉnh sửa.</p>
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class TutorProfileService {
    public static final int MAX_EVIDENCE = 5;
    private static final int MAX_SELECTED = 20;
    private static final int MAX_CUSTOM_PER_SAVE = 5;
    private static final int MIN_BIO = 20;

    public enum SaveResult { SAVED, SENT_FOR_REREVIEW }

    private final AccountGuard guard;
    private final EntityManager em;
    private final UserAccountJpaRepository users;
    private final TutorProfileJpaRepository profiles;
    private final TutorSubjectJpaRepository tutorSubjects;
    private final TutorGradeLevelJpaRepository tutorGrades;
    private final TutorAreaJpaRepository tutorAreas;
    private final TutorDeliveryModeJpaRepository tutorModes;
    private final TutorProfileEvidenceJpaRepository evidence;
    private final PrivateFileJpaRepository files;
    private final PrivateFileService storage;
    private final SubjectJpaRepository subjects;
    private final GradeLevelJpaRepository grades;
    private final AreaJpaRepository areas;
    private final DeliveryModeJpaRepository modes;
    private final AuditLogJpaRepository audits;
    private final Validator validator;
    private final CustomCatalogService custom;

    public TutorProfileService(AccountGuard guard, EntityManager em, UserAccountJpaRepository users,
                               TutorProfileJpaRepository profiles, TutorSubjectJpaRepository tutorSubjects,
                               TutorGradeLevelJpaRepository tutorGrades, TutorAreaJpaRepository tutorAreas,
                               TutorDeliveryModeJpaRepository tutorModes, TutorProfileEvidenceJpaRepository evidence,
                               PrivateFileJpaRepository files, PrivateFileService storage, SubjectJpaRepository subjects,
                               GradeLevelJpaRepository grades, AreaJpaRepository areas, DeliveryModeJpaRepository modes,
                               AuditLogJpaRepository audits, Validator validator, CustomCatalogService custom) {
        this.guard = guard;
        this.em = em;
        this.users = users;
        this.profiles = profiles;
        this.tutorSubjects = tutorSubjects;
        this.tutorGrades = tutorGrades;
        this.tutorAreas = tutorAreas;
        this.tutorModes = tutorModes;
        this.evidence = evidence;
        this.files = files;
        this.storage = storage;
        this.subjects = subjects;
        this.grades = grades;
        this.areas = areas;
        this.modes = modes;
        this.audits = audits;
        this.validator = validator;
        this.custom = custom;
    }

    /** Hồ sơ của chính gia sư đang đăng nhập. */
    public TutorProfileDTO view(AccountPrincipal principal) {
        UserAccount account = guard.require(principal, "TUTOR");
        return load(account.id());
    }

    /** Dữ liệu ban đầu cho form từ DB. */
    public TutorProfileForm formOf(TutorProfileDTO profile) {
        var form = new TutorProfileForm();
        form.setBio(profile.bio());
        form.setHeadline(profile.headline());
        form.setExperienceYears(profile.experienceYears());
        form.setSubjectIds(selected(profile.subjects()));
        form.setGradeLevelIds(selected(profile.gradeLevels()));
        form.setAreaIds(selected(profile.areas()));
        form.setDeliveryModeIds(selected(profile.deliveryModes()));
        form.setUserVersion(profile.userVersion());
        form.setTutorVersion(profile.tutorVersion());
        return form;
    }

    /**
     * Dựng hồ sơ từ DB cho mọi người gọi đã tự kiểm quyền (chủ hồ sơ hoặc admin). Không kiểm quyền ở đây.
     */
    public TutorProfileDTO load(Long tutorId) {
        TutorProfile profile = profiles.findById(tutorId)
                .orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy hồ sơ gia sư."));
        var account = users.findById(tutorId).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy tài khoản."));
        Set<Long> chosenSubjects = ids(tutorSubjects.findByIdTutorId(tutorId), s -> s.getId().getSubjectId());
        Set<Long> chosenGrades = ids(tutorGrades.findByIdTutorId(tutorId), s -> s.getId().getGradeLevelId());
        Set<Long> chosenAreas = ids(tutorAreas.findByIdTutorId(tutorId), s -> s.getId().getAreaId());
        Set<Long> chosenModes = ids(tutorModes.findByIdTutorId(tutorId), s -> s.getId().getDeliveryModeId());

        // Chip hiển thị: danh mục hệ thống + mục đã chọn + mục chính mình thêm; mục của người khác chỉ làm gợi ý khi gõ.
        var allSubjects = subjects.findAll(Sort.by("id"));
        var allGrades = grades.findAll(Sort.by("id"));
        var subjectChoices = allSubjects.stream()
                .filter(s -> s.getCreatedBy() == null || tutorId.equals(s.getCreatedBy()) || chosenSubjects.contains(s.getId()))
                .map(s -> new Choice(s.getId(), s.getName(), chosenSubjects.contains(s.getId()))).toList();
        var gradeChoices = allGrades.stream()
                .filter(s -> s.getCreatedBy() == null || tutorId.equals(s.getCreatedBy()) || chosenGrades.contains(s.getId()))
                .map(s -> new Choice(s.getId(), s.getName(), chosenGrades.contains(s.getId()))).toList();
        var subjectSuggestions = allSubjects.stream().filter(s -> subjectChoices.stream().noneMatch(c -> c.id().equals(s.getId())))
                .map(com.educonnect.common.reference.domain.Subject::getName).toList();
        var gradeSuggestions = allGrades.stream().filter(s -> gradeChoices.stream().noneMatch(c -> c.id().equals(s.getId())))
                .map(com.educonnect.common.reference.domain.GradeLevel::getName).toList();
        var areaChoices = areas.findAll(Sort.by("id")).stream()
                .map(s -> new Choice(s.getId(), s.getName(), chosenAreas.contains(s.getId()))).toList();
        var modeChoices = modes.findAll(Sort.by("id")).stream()
                .map(s -> new Choice(s.getId(), s.getName(), chosenModes.contains(s.getId()))).toList();

        var links = evidence.findByIdTutorId(tutorId);
        Map<Long, com.educonnect.file.domain.PrivateFile> byId = new HashMap<>();
        files.findAllById(links.stream().map(l -> l.getId().getFileId()).toList()).forEach(f -> byId.put(f.getId(), f));
        List<TutorProfileDTO.Evidence> proofs = links.stream().map(l -> byId.get(l.getId().getFileId())).filter(Objects::nonNull)
                .sorted(Comparator.comparing(com.educonnect.file.domain.PrivateFile::getCreatedAt))
                .map(f -> new TutorProfileDTO.Evidence(f.getId(), f.getOriginalName(), f.getMimeType(), f.getByteSize(), f.getCreatedAt()))
                .toList();

        List<String> missing = missing(account.getBio(), profile.getHeadline(), chosenSubjects.size(), chosenGrades.size(),
                chosenAreas.size(), chosenModes.size(), proofs.size());
        TutorReviewStatus status = profile.getReviewStatus();
        boolean editable = status != TutorReviewStatus.PENDING;
        boolean canSubmit = (status == TutorReviewStatus.DRAFT || status == TutorReviewStatus.REJECTED) && missing.isEmpty();
        String reviewer = profile.getReviewedBy() == null ? null
                : users.findById(profile.getReviewedBy()).map(com.educonnect.user.domain.UserAccount::getDisplayName).orElse(null);
        return new TutorProfileDTO(tutorId, account.getDisplayName(), account.getEmail(), account.getPhone(), account.getBio(),
                profile.getHeadline(), profile.getExperienceYears(), status, profile.getReviewNote(), profile.getReviewedAt(),
                reviewer, account.getVersion(), profile.getVersion(), subjectChoices, gradeChoices, areaChoices, modeChoices,
                proofs, editable, canSubmit, missing, subjectSuggestions, gradeSuggestions);
    }

    @Transactional
    public SaveResult save(AccountPrincipal principal, TutorProfileForm form) {
        UserAccount auth = guard.require(principal, "TUTOR");
        var violations = validator.validate(form);
        if (!violations.isEmpty()) {
            throw ServiceProblem.invalid(violations.iterator().next().getMessage());
        }
        var locked = lock(auth.id());
        TutorProfile profile = locked.profile();
        var account = locked.account();
        requireEditable(profile);
        if (!profile.getVersion().equals(form.getTutorVersion()) || !account.getVersion().equals(form.getUserVersion())) {
            throw ServiceProblem.conflict("Hồ sơ đã được thay đổi ở nơi khác. Hãy tải lại trang rồi chỉnh sửa lại.");
        }
        Set<Long> subjectIds = checked(withCustomSubjects(auth.id(), form), subjects, "Môn dạy");
        Set<Long> gradeIds = checked(withCustomGrades(auth.id(), form), grades, "Cấp học");
        if (subjectIds.size() > MAX_SELECTED || gradeIds.size() > MAX_SELECTED) {
            throw ServiceProblem.invalid("Mỗi hồ sơ chọn tối đa " + MAX_SELECTED + " môn và " + MAX_SELECTED + " cấp học.");
        }
        Set<Long> areaIds = checked(form.getAreaIds(), areas, "Khu vực");
        Set<Long> modeIds = checked(form.getDeliveryModeIds(), modes, "Hình thức dạy");

        String headline = form.getHeadline().strip();
        short experience = form.getExperienceYears().shortValue();
        boolean professionalChanged = !headline.equals(profile.getHeadline()) || experience != profile.getExperienceYears()
                || !subjectIds.equals(ids(tutorSubjects.findByIdTutorId(profile.getUserId()), s -> s.getId().getSubjectId()))
                || !gradeIds.equals(ids(tutorGrades.findByIdTutorId(profile.getUserId()), s -> s.getId().getGradeLevelId()));

        String bio = form.getBio() == null || form.getBio().isBlank() ? null : form.getBio().strip();
        account.setBio(bio);
        account.setUpdatedAt(Instant.now());
        users.saveAndFlush(account);

        profile.setHeadline(headline);
        profile.setExperienceYears(experience);
        sync(subjectIds, tutorSubjects.findByIdTutorId(profile.getUserId()), s -> s.getId().getSubjectId(),
                id -> { var row = TutorSubject.create(); row.setId(new TutorSubjectId(profile.getUserId(), id)); return row; }, tutorSubjects);
        sync(gradeIds, tutorGrades.findByIdTutorId(profile.getUserId()), s -> s.getId().getGradeLevelId(),
                id -> { var row = TutorGradeLevel.create(); row.setId(new TutorGradeLevelId(profile.getUserId(), id)); return row; }, tutorGrades);
        sync(areaIds, tutorAreas.findByIdTutorId(profile.getUserId()), s -> s.getId().getAreaId(),
                id -> { var row = TutorArea.create(); row.setId(new TutorAreaId(profile.getUserId(), id)); return row; }, tutorAreas);
        sync(modeIds, tutorModes.findByIdTutorId(profile.getUserId()), s -> s.getId().getDeliveryModeId(),
                id -> { var row = TutorDeliveryMode.create(); row.setId(new TutorDeliveryModeId(profile.getUserId(), id)); return row; }, tutorModes);

        SaveResult result = SaveResult.SAVED;
        if (professionalChanged && profile.getReviewStatus() == TutorReviewStatus.APPROVED) {
            requireComplete(bio, headline, subjectIds.size(), gradeIds.size(), areaIds.size(), modeIds.size(),
                    (int) evidence.countByIdTutorId(profile.getUserId()), "gửi duyệt lại");
            reopen(profile);
            audit("TUTOR_PROFILE_REREVIEW", profile, Map.of("reason", "professional-fields-changed"));
            result = SaveResult.SENT_FOR_REREVIEW;
        }
        profile.setUpdatedAt(Instant.now());
        profiles.saveAndFlush(profile);
        return result;
    }

    /** DRAFT/REJECTED → PENDING. Gửi lặp khi đã PENDING không tạo thêm lần gửi. */
    @Transactional
    public void submit(AccountPrincipal principal, Long tutorVersion) {
        UserAccount auth = guard.require(principal, "TUTOR");
        var locked = lock(auth.id());
        TutorProfile profile = locked.profile();
        if (profile.getReviewStatus() == TutorReviewStatus.PENDING) {
            return;
        }
        if (profile.getReviewStatus() == TutorReviewStatus.APPROVED) {
            throw ServiceProblem.conflict("Hồ sơ đã được duyệt, không cần gửi lại.");
        }
        if (tutorVersion == null || !profile.getVersion().equals(tutorVersion)) {
            throw ServiceProblem.conflict("Hồ sơ đã được thay đổi ở nơi khác. Hãy tải lại trang trước khi gửi duyệt.");
        }
        var counts = counts(profile.getUserId());
        requireComplete(locked.account().getBio(), profile.getHeadline(), counts[0], counts[1], counts[2], counts[3], counts[4], "gửi duyệt");
        reopen(profile);
        profile.setUpdatedAt(Instant.now());
        profiles.saveAndFlush(profile);
        audit("TUTOR_PROFILE_SUBMIT", profile, Map.of("tutorVersion", profile.getVersion()));
    }

    @Transactional
    public SaveResult addEvidence(AccountPrincipal principal, MultipartFile upload) {
        UserAccount auth = guard.require(principal, "TUTOR");
        var locked = lock(auth.id());
        TutorProfile profile = locked.profile();
        requireEditable(profile);
        if (evidence.countByIdTutorId(profile.getUserId()) >= MAX_EVIDENCE) {
            throw ServiceProblem.invalid("Mỗi hồ sơ tối đa " + MAX_EVIDENCE + " tệp minh chứng.");
        }
        var file = storage.store(auth.id(), FilePurpose.TUTOR_EVIDENCE, upload);
        var link = TutorProfileEvidence.create();
        link.setId(new TutorProfileEvidenceId(profile.getUserId(), file.getId()));
        evidence.saveAndFlush(link);
        SaveResult result = SaveResult.SAVED;
        if (profile.getReviewStatus() == TutorReviewStatus.APPROVED) {
            reopen(profile);
            audit("TUTOR_PROFILE_REREVIEW", profile, Map.of("reason", "evidence-added"));
            result = SaveResult.SENT_FOR_REREVIEW;
        }
        profile.setUpdatedAt(Instant.now());
        profiles.saveAndFlush(profile);
        return result;
    }

    @Transactional
    public SaveResult removeEvidence(AccountPrincipal principal, Long fileId) {
        UserAccount auth = guard.require(principal, "TUTOR");
        var locked = lock(auth.id());
        TutorProfile profile = locked.profile();
        requireEditable(profile);
        var link = evidence.findByIdFileId(fileId).filter(e -> e.getId().getTutorId().equals(profile.getUserId()))
                .orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy tệp minh chứng."));
        boolean approved = profile.getReviewStatus() == TutorReviewStatus.APPROVED;
        if (approved && evidence.countByIdTutorId(profile.getUserId()) <= 1) {
            throw ServiceProblem.conflict("Hồ sơ đã duyệt cần giữ ít nhất một tệp minh chứng. Hãy tải tệp mới lên trước khi xóa tệp này.");
        }
        var file = files.findById(fileId).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy tệp minh chứng."));
        evidence.delete(link);
        evidence.flush();
        storage.delete(file);
        SaveResult result = SaveResult.SAVED;
        if (approved) {
            reopen(profile);
            audit("TUTOR_PROFILE_REREVIEW", profile, Map.of("reason", "evidence-removed"));
            result = SaveResult.SENT_FOR_REREVIEW;
        }
        profile.setUpdatedAt(Instant.now());
        profiles.saveAndFlush(profile);
        return result;
    }

    /** Môn đã chọn cộng với các môn tự nhập (tạo mới nếu chưa có trong danh mục). */
    private List<Long> withCustomSubjects(Long userId, TutorProfileForm form) {
        if (form.getCustomSubjects().size() > MAX_CUSTOM_PER_SAVE) {
            throw ServiceProblem.invalid("Mỗi lần lưu chỉ thêm tối đa " + MAX_CUSTOM_PER_SAVE + " môn mới.");
        }
        Set<Long> ids = new LinkedHashSet<>(form.getSubjectIds());
        form.getCustomSubjects().forEach(name -> ids.add(custom.subject(userId, name).getId()));
        return new ArrayList<>(ids);
    }

    /** Cấp học đã chọn cộng với các cấp tự nhập. */
    private List<Long> withCustomGrades(Long userId, TutorProfileForm form) {
        if (form.getCustomGradeLevels().size() > MAX_CUSTOM_PER_SAVE) {
            throw ServiceProblem.invalid("Mỗi lần lưu chỉ thêm tối đa " + MAX_CUSTOM_PER_SAVE + " cấp học mới.");
        }
        Set<Long> ids = new LinkedHashSet<>(form.getGradeLevelIds());
        form.getCustomGradeLevels().forEach(name -> ids.add(custom.gradeLevel(userId, name).getId()));
        return new ArrayList<>(ids);
    }

    // ---- nội bộ ----

    private record Locked(TutorProfile profile, com.educonnect.user.domain.UserAccount account) {}

    private Locked lock(Long userId) {
        var account = users.findLockedById(userId).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy tài khoản."));
        TutorProfile profile = em.find(TutorProfile.class, userId, LockModeType.PESSIMISTIC_WRITE);
        if (profile == null) {
            throw ServiceProblem.notFound("Không tìm thấy hồ sơ gia sư.");
        }
        return new Locked(profile, account);
    }

    private static void requireEditable(TutorProfile profile) {
        if (profile.getReviewStatus() == TutorReviewStatus.PENDING) {
            throw ServiceProblem.conflict("Hồ sơ đang chờ duyệt nên tạm thời không thể chỉnh sửa.");
        }
    }

    /** Gửi (lại) duyệt: xóa kết quả duyệt cũ; lý do cũ vẫn còn trong nhật ký. */
    private static void reopen(TutorProfile profile) {
        profile.setReviewStatus(TutorReviewStatus.PENDING);
        profile.setReviewedBy(null);
        profile.setReviewedAt(null);
        profile.setReviewNote(null);
    }

    private int[] counts(Long tutorId) {
        return new int[]{tutorSubjects.findByIdTutorId(tutorId).size(), tutorGrades.findByIdTutorId(tutorId).size(),
                tutorAreas.findByIdTutorId(tutorId).size(), tutorModes.findByIdTutorId(tutorId).size(),
                (int) evidence.countByIdTutorId(tutorId)};
    }

    private static List<String> missing(String bio, String headline, int subjectCount, int gradeCount, int areaCount,
                                        int modeCount, int proofCount) {
        List<String> missing = new ArrayList<>();
        if (bio == null || bio.strip().length() < MIN_BIO) missing.add("Giới thiệu bản thân (ít nhất " + MIN_BIO + " ký tự)");
        if (headline == null || headline.strip().length() < 5) missing.add("Tiêu đề hồ sơ");
        if (subjectCount == 0) missing.add("Ít nhất một môn dạy");
        if (gradeCount == 0) missing.add("Ít nhất một cấp học");
        if (areaCount == 0) missing.add("Ít nhất một khu vực dạy");
        if (modeCount == 0) missing.add("Ít nhất một hình thức dạy");
        if (proofCount == 0) missing.add("Ít nhất một tệp minh chứng (bằng cấp, chứng chỉ)");
        return missing;
    }

    private static void requireComplete(String bio, String headline, int subjectCount, int gradeCount, int areaCount,
                                        int modeCount, int proofCount, String action) {
        var missing = missing(bio, headline, subjectCount, gradeCount, areaCount, modeCount, proofCount);
        if (!missing.isEmpty()) {
            throw ServiceProblem.invalid("Hồ sơ chưa đủ điều kiện " + action + ". Còn thiếu: " + String.join("; ", missing) + ".");
        }
    }

    private static <E> Set<Long> ids(List<E> rows, Function<E, Long> key) {
        Set<Long> ids = new HashSet<>();
        rows.forEach(row -> ids.add(key.apply(row)));
        return ids;
    }

    private static List<Long> selected(List<Choice> choices) {
        return choices.stream().filter(Choice::selected).map(Choice::id).toList();
    }

    private static Set<Long> checked(List<Long> requested, JpaRepository<?, Long> catalog, String label) {
        Set<Long> unique = new LinkedHashSet<>(requested);
        if (unique.contains(null) || catalog.findAllById(unique).size() != unique.size()) {
            throw ServiceProblem.invalid(label + " có giá trị không hợp lệ.");
        }
        return unique;
    }

    /** Chỉ xóa mục bị bỏ và thêm mục mới (xóa-rồi-thêm cùng khóa trong một transaction sẽ va khóa chính). */
    private static <E, K> void sync(Set<K> wanted, List<E> existing, Function<E, K> key, Function<K, E> create,
                                    JpaRepository<E, ?> repository) {
        Set<K> present = new HashSet<>();
        List<E> removed = new ArrayList<>();
        for (E row : existing) {
            K id = key.apply(row);
            present.add(id);
            if (!wanted.contains(id)) removed.add(row);
        }
        if (!removed.isEmpty()) {
            repository.deleteAll(removed);
            repository.flush();
        }
        List<E> added = wanted.stream().filter(id -> !present.contains(id)).map(create).toList();
        if (!added.isEmpty()) {
            repository.saveAll(added);
            repository.flush();
        }
    }

    private void audit(String action, TutorProfile profile, Map<String, Object> details) {
        AuditLog log = AuditLog.create();
        log.setActorUserId(profile.getUserId());
        log.setTargetUserId(profile.getUserId());
        log.setActionCode(action);
        log.setMetadata(details);
        log.setCreatedAt(Instant.now());
        audits.saveAndFlush(log);
    }
}
