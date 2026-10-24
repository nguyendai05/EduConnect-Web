package com.educonnect.lesson.service;

import com.educonnect.common.reference.repository.AreaJpaRepository;
import com.educonnect.common.reference.repository.DeliveryModeJpaRepository;
import com.educonnect.common.reference.repository.GradeLevelJpaRepository;
import com.educonnect.common.reference.repository.SubjectJpaRepository;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.lesson.dto.OfferingResponse;
import com.educonnect.lesson.dto.OfferingOptionResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.lesson.dto.OfferingRequest;
import com.educonnect.lesson.dto.OfferingTimeSlotRequest;
import com.educonnect.lesson.repository.OfferingJpaRepository;
import com.educonnect.lesson.repository.OfferingTimeSlotJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.tutor.repository.TutorProfileJpaRepository;
import com.educonnect.user.UserAccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Nghiệp vụ quản lý dịch vụ/lớp; không ghi dữ liệu đơn, đăng ký hoặc thanh toán.
 * <p>Tác giả: Trường Đạt.</p>
 * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}).</p>
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class TutorOfferingService {

    // Truy vấn, lưu dịch vụ/lớp của gia sư và kiểm tra số lượt đăng ký.
    private final OfferingJpaRepository offerings;

    // Truy vấn, xóa và lưu các khung lịch học của từng dịch vụ/lớp.
    private final OfferingTimeSlotJpaRepository slots;

    // Đọc tài khoản để kiểm tra trạng thái, xác minh email, vai trò và phiên xác thực.
    private final UserAccountRepository accounts;

    // Tìm hồ sơ gia sư của người đăng nhập trước khi cho phép quản lý dịch vụ/lớp.
    private final TutorProfileJpaRepository tutors;

    // Lấy danh mục môn học cho form và kiểm tra môn học được chọn có tồn tại.
    private final SubjectJpaRepository subjects;

    // Lấy danh mục cấp học cho form và kiểm tra cấp học được chọn có tồn tại.
    private final GradeLevelJpaRepository grades;

    // Lấy danh mục khu vực cho form và kiểm tra khu vực được chọn có tồn tại.
    private final AreaJpaRepository areas;

    // Lấy danh mục hình thức học cho form và kiểm tra hình thức được chọn có tồn tại.
    private final DeliveryModeJpaRepository modes;

    // Khóa ghi bản ghi hồ sơ gia sư trong giao dịch để điều phối các thao tác ghi đồng thời.
    private final EntityManager em;

    // Kiểm tra các ràng buộc Bean Validation trên form và lịch học trước khi lưu hoặc gửi duyệt.
    private final Validator validator;

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Nhận các repository, EntityManager và Validator để xử lý dữ liệu,
     * khóa bản ghi và kiểm tra đầu vào khi quản lý dịch vụ/lớp.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}).</p>
     */
    public TutorOfferingService(
            OfferingJpaRepository offerings,
            OfferingTimeSlotJpaRepository slots,
            UserAccountRepository accounts,
            TutorProfileJpaRepository tutors,
            SubjectJpaRepository subjects,
            GradeLevelJpaRepository grades,
            AreaJpaRepository areas,
            DeliveryModeJpaRepository modes,
            EntityManager em,
            Validator validator
    ) {
        this.offerings = offerings;
        this.slots = slots;
        this.accounts = accounts;
        this.tutors = tutors;
        this.subjects = subjects;
        this.grades = grades;
        this.areas = areas;
        this.modes = modes;
        this.em = em;
        this.validator = validator;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Lấy danh sách dịch vụ/lớp và lịch học của gia sư đang đăng nhập,
     * lọc theo loại, trạng thái và từ khóa trong mã, tiêu đề hoặc tên môn học.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}).</p>
     */
    public List<OfferingResponse> list(
            AccountPrincipal principal,
            OfferingType type,
            OfferingStatus status,
            String query
    ) {
        TutorProfile tutor = requireTutor(principal, false);
        List<Offering> all = offerings.findByTutorIdOrderByUpdatedAtDescIdDesc(tutor.getUserId());
        if (all.isEmpty()) {
            return List.of();
        }

        List<Long> offeringIds = new ArrayList<>();
        for (Offering offering : all) {
            offeringIds.add(offering.getId());
        }

        Map<Long, List<OfferingTimeSlot>> timetable = new HashMap<>();
        for (OfferingTimeSlot slot : slots.findByOfferingIdInOrderByWeekdayAscStartTimeAsc(offeringIds)) {
            if (!timetable.containsKey(slot.getOfferingId())) {
                timetable.put(slot.getOfferingId(), new ArrayList<>());
            }
            timetable.get(slot.getOfferingId()).add(slot);
        }

        String text = query == null ? "" : query.strip().toLowerCase(Locale.ROOT);
        List<OfferingResponse> result = new ArrayList<>();
        for (Offering offering : all) {
            if (type != null && offering.getOfferingType() != type) {
                continue;
            }
            if (status != null && offering.getStatus() != status) {
                continue;
            }

            OfferingResponse item = OfferingResponse.from(
                    offering,
                    timetable.getOrDefault(offering.getId(), List.of())
            );
            String searchableText = item.publicCode() + " " + item.title() + " " + item.subject();
            if (searchableText.toLowerCase(Locale.ROOT).contains(text)) {
                result.add(item);
            }
        }

        return result;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Kiểm tra quyền gia sư và lấy danh mục môn học, cấp học, khu vực,
     * hình thức học theo tên để hiển thị các ô lựa chọn trong form.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}).</p>
     */
    public OfferingOptionsResponse options(AccountPrincipal principal) {
        requireTutor(principal, false);
        Sort sort = Sort.by("name");
        List<OfferingOptionResponse> subjectOptions = new ArrayList<>(); // các môn học
        List<OfferingOptionResponse> gradeOptions = new ArrayList<>();//các cấp học
        List<OfferingOptionResponse> areaOptions = new ArrayList<>();// các khu vực
        List<OfferingOptionResponse> modeOptions = new ArrayList<>(); //hình thức học

        for (var subject : subjects.findAll(sort)) {
            subjectOptions.add(new OfferingOptionResponse(subject.getId(), subject.getName()));
        }
        for (var grade : grades.findAll(sort)) {
            gradeOptions.add(new OfferingOptionResponse(grade.getId(), grade.getName()));
        }
        for (var area : areas.findAll(sort)) {
            areaOptions.add(new OfferingOptionResponse(area.getId(), area.getName()));
        }
        for (var mode : modes.findAll(sort)) {
            modeOptions.add(new OfferingOptionResponse(mode.getId(), mode.getName()));
        }

        return new OfferingOptionsResponse(subjectOptions, gradeOptions, areaOptions, modeOptions);
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Nạp thông tin và lịch học của dịch vụ/lớp thuộc gia sư vào form sửa,
     * kèm phiên bản dữ liệu và mã yêu cầu; chỉ nạp bản có trạng thái được phép sửa.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), form chỉnh sửa.</p>
     */
    public OfferingRequest edit(AccountPrincipal principal, Long id) {
        requireTutor(principal, false);
        var offering = offerings.findByIdAndTutorId(id, principal.getId()).orElseThrow(this::missing); //missing được gọi khi offering rỗng
        requireEditable(offering);
        var form = new OfferingRequest();
        form.setRequestKey(UUID.randomUUID().toString()); //tạo chống trùng dịch vụ khi gửi 1 form
        form.setVersion(offering.getVersion());
        form.setOfferingType(offering.getOfferingType());
        form.setTitle(offering.getTitle());
        form.setDescription(offering.getDescription());
        form.setSubjectId(offering.getSubjectId());
        form.setGradeLevelId(offering.getGradeLevelId());
        form.setAreaId(offering.getAreaId());
        form.setDeliveryModeId(offering.getDeliveryModeId());
        form.setUnitPrice(offering.getUnitPrice());
        form.setSessionCount(offering.getSessionCount());
        form.setDurationMinutes(offering.getDurationMinutes());
        form.setCapacity(offering.getCapacity());
        form.setStartsOn(offering.getStartsOn());
        form.setEndsOn(offering.getEndsOn());
        form.setTermsText(offering.getTermsText());
        for (OfferingTimeSlot slot : slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id)) {
            OfferingTimeSlotRequest input = new OfferingTimeSlotRequest();
            input.setWeekday(slot.getWeekday());
            input.setStartTime(slot.getStartTime());
            input.setEndTime(slot.getEndTime());
            input.setTimeZone(slot.getTimeZone());
            form.getSlots().add(input);
        }
        if (form.getSlots().isEmpty()) {
            form.getSlots().add(new OfferingTimeSlotRequest());
        }

        return form;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Kiểm tra dịch vụ/lớp thuộc gia sư và được phép sửa có đang công khai
     * hay không, để trang hiển thị thông báo gửi duyệt lại khi lưu thay đổi.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), form chỉnh sửa.</p>
     */
    public boolean isPublished(AccountPrincipal principal, Long id) {
        requireTutor(principal, false);
        Offering offering = offerings.findByIdAndTutorId(id, principal.getId())
                .orElseThrow(this::missing);
        requireEditable(offering);
        return offering.getStatus() == OfferingStatus.PUBLISHED;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Tạo bản nháp hoặc lưu sửa dịch vụ/lớp cùng lịch học trong một giao dịch;
     * kiểm tra quyền, dữ liệu, danh mục và phiên bản, chống tạo trùng khi gửi lại form.
     * Bản đang công khai được chuyển sang chờ duyệt lại; bản đã có đăng ký phải giữ kế hoạch học.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), form tạo/sửa.</p>
     */
    @Transactional
    public Long save(AccountPrincipal principal, Long id, OfferingRequest form) {
        var tutor = requireTutor(principal, true);
        validate(form);
        Offering offering;
        boolean creating = id == null;
        boolean reReview = false;
        boolean keepSchedule = false;

        if (creating) {
            // Khóa gia sư và dùng mã ổn định để gửi lại form không tạo hai bản ghi.
            String code = "OFF-" + form.getRequestKey().toLowerCase(Locale.ROOT);
            var previous = offerings.findCodeForUpdate(code);
            if (previous.isPresent()) {
                if (!previous.get().getTutorId().equals(tutor.getUserId())) {
                    throw missing();
                }
                return previous.get().getId();
            }

            offering = Offering.create();
            offering.setPublicCode(code);
            offering.setTutorId(tutor.getUserId());
            offering.setStatus(OfferingStatus.DRAFT);
            offering.setTermsVersion(1);
            offering.setCreatedAt(Instant.now());
        } else {
            offering = offerings.findOwnedForUpdate(id, tutor.getUserId()).orElseThrow(this::missing);
            requireVersion(offering, form.getVersion());
            requireEditable(offering);

            if (offering.getOfferingType() != form.getOfferingType()) {
                throw conflict("Không thể đổi loại của dịch vụ/lớp đã tạo.");
            }

            reReview = offering.getStatus() == OfferingStatus.PUBLISHED;
            keepSchedule = offerings.countEnrollments(id) > 0;
            if (keepSchedule) {
                requireUnchangedTeachingPlan(offering, form);
            }
        }

        if (!subjects.existsById(form.getSubjectId()) || !grades.existsById(form.getGradeLevelId())
                || !areas.existsById(form.getAreaId()) || !modes.existsById(form.getDeliveryModeId())) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Môn, cấp học, khu vực hoặc hình thức học không tồn tại. Hãy chọn lại.");
        }
        if (!creating) {
            offering.setTermsVersion(Math.addExact(offering.getTermsVersion(), 1));
        }

        offering.setTitle(form.getTitle().strip());
        offering.setDescription(form.getDescription().strip());
        offering.setOfferingType(form.getOfferingType());
        offering.setSubjectId(form.getSubjectId());
        offering.setGradeLevelId(form.getGradeLevelId());
        offering.setAreaId(form.getAreaId());
        offering.setDeliveryModeId(form.getDeliveryModeId());
        offering.setUnitPrice(form.getUnitPrice());
        offering.setSessionCount(form.getSessionCount());
        offering.setDurationMinutes(form.getDurationMinutes());

        boolean group = form.getOfferingType() == OfferingType.GROUP_CLASS;
        offering.setCapacity(group ? form.getCapacity() : null);
        offering.setStartsOn(group ? form.getStartsOn() : null);
        offering.setEndsOn(group ? form.getEndsOn() : null);
        offering.setTermsText(form.getTermsText().strip());

        // Theo yêu cầu của Đạt: sửa bản công khai thì chờ duyệt lại.
        // Giữ ngày công khai cũ làm lịch sử.
        offering.setStatus(reReview ? OfferingStatus.IN_REVIEW : OfferingStatus.DRAFT);
        offering.setReviewedBy(null);
        offering.setReviewedAt(null);
        offering.setReviewNote(null);
        offering.setUpdatedAt(Instant.now());
        offering = offerings.saveAndFlush(offering);

        if (keepSchedule) {
            return offering.getId();
        }

        slots.deleteSlots(offering.getId());
        Long offeringId = offering.getId();
        List<OfferingTimeSlot> rows = new ArrayList<>();
        for (OfferingTimeSlotRequest input : form.getSlots()) {
            OfferingTimeSlot row = OfferingTimeSlot.create();
            row.setOfferingId(offeringId);
            row.setWeekday(input.getWeekday());
            row.setStartTime(input.getStartTime());
            row.setEndTime(input.getEndTime());
            row.setTimeZone(input.getTimeZone());
            rows.add(row);
        }

        slots.saveAll(rows);
        slots.flush();
        return offeringId;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Gửi bản nháp/bản bị từ chối sang chờ duyệt với thao tác submit,
     * hoặc đóng dịch vụ/lớp với thao tác close; kiểm tra quyền và phiên bản trước khi đổi trạng thái.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), nút Gửi duyệt/Đóng.</p>
     */
    @Transactional
    public void transition(AccountPrincipal principal, Long id, Long version, String action) {
        var tutor = requireTutor(principal, true);
        var offering = offerings.findOwnedForUpdate(id, tutor.getUserId()).orElseThrow(this::missing);
        OfferingStatus target = switch (action) {
            case "submit" -> OfferingStatus.IN_REVIEW;
            case "close" -> OfferingStatus.CLOSED;
            default -> throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Thao tác không được hỗ trợ.");
        };
        if (offering.getStatus() == target) {
            return;
        }

        requireVersion(offering, version);
        if (target == OfferingStatus.IN_REVIEW) {
            if (offering.getStatus() != OfferingStatus.DRAFT && offering.getStatus() != OfferingStatus.REJECTED) {
                throw conflict("Chỉ gửi duyệt bản nháp hoặc bản bị từ chối.");
            }
            validate(edit(principal, id));
        }
        offering.setStatus(target);
        offering.setUpdatedAt(Instant.now());
        offerings.saveAndFlush(offering);
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Kiểm tra tài khoản còn hoạt động, email đã xác minh, vai trò gia sư,
     * phiên xác thực còn hợp lệ và hồ sơ gia sư tồn tại; khóa hồ sơ khi chuẩn bị ghi dữ liệu.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), kiểm tra quyền dùng chung.</p>
     */
    private TutorProfile requireTutor(AccountPrincipal principal, boolean lock) {
        if (principal == null) {
            throw new OfferingProblem(HttpStatus.FORBIDDEN, "Bạn cần đăng nhập bằng tài khoản gia sư.");
        }

        var account = accounts.findById(principal.getId()).orElseThrow(() -> new OfferingProblem(
                HttpStatus.FORBIDDEN,
                "Tài khoản không còn khả dụng."
        ));
        if (!"ACTIVE".equals(account.status()) || !account.emailVerified() || !account.roles().contains("TUTOR")
                || account.authenticationVersion() != principal.getAuthenticationVersion()) {
            throw new OfferingProblem(HttpStatus.FORBIDDEN, "Tài khoản không có quyền quản lý dịch vụ gia sư.");
        }
        var tutor = tutors.findById(principal.getId()).orElseThrow(() -> new OfferingProblem(
                HttpStatus.FORBIDDEN,
                "Chưa có hồ sơ gia sư."
        ));
        if (lock) {
            em.lock(tutor, LockModeType.PESSIMISTIC_WRITE);
        }

        return tutor;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Kiểm tra các ràng buộc trên form và lịch học; yêu cầu các khung lịch
     * dùng cùng múi giờ và không trùng giờ trong cùng ngày trước khi lưu hoặc gửi duyệt.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), tạo/sửa và gửi duyệt.</p>
     */
    private void validate(OfferingRequest form) {
        // Kiểm lại khi service được gọi trực tiếp hoặc gửi duyệt dữ liệu đã lưu trong DB.
        var violations = validator.validate(form);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        List<OfferingTimeSlotRequest> schedule = form.getSlots();
        String zone = schedule.get(0).getTimeZone();
        for (int i = 0; i < schedule.size(); i++) {
            OfferingTimeSlotRequest current = schedule.get(i);
            if (!zone.equals(current.getTimeZone())) {
                throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Các khung lịch phải dùng cùng múi giờ.");
            }

            for (int j = i + 1; j < schedule.size(); j++) {
                OfferingTimeSlotRequest other = schedule.get(j);
                boolean sameDay = current.getWeekday().equals(other.getWeekday());
                boolean overlapping = current.getStartTime().isBefore(other.getEndTime())
                        && other.getStartTime().isBefore(current.getEndTime());
                if (sameDay && overlapping) {
                    throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Các khung lịch trong cùng ngày không được trùng nhau.");
                }
            }
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Chỉ cho phép chỉnh sửa bản nháp, bản bị từ chối hoặc bản đang công khai;
     * báo lỗi khi dịch vụ/lớp đang chờ duyệt hoặc đã đóng.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), form chỉnh sửa.</p>
     */
    private void requireEditable(Offering offering) {
        if (offering.getStatus() != OfferingStatus.DRAFT && offering.getStatus() != OfferingStatus.REJECTED
                && offering.getStatus() != OfferingStatus.PUBLISHED) {
            throw conflict("Chỉ sửa bản nháp, bản bị từ chối hoặc dịch vụ đang công khai. Bản đang chờ duyệt hoặc đã đóng không được sửa.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Khi dịch vụ/lớp đã có đăng ký, chặn thay đổi môn, cấp học, khu vực,
     * hình thức học, số buổi, thời lượng, sức chứa, ngày học và lịch tuần để giữ kế hoạch đã đăng ký.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), lưu sửa bản đã có đăng ký.</p>
     */
    private void requireUnchangedTeachingPlan(Offering offering, OfferingRequest form) {
        boolean unchanged = Objects.equals(offering.getSubjectId(), form.getSubjectId())
                && Objects.equals(offering.getGradeLevelId(), form.getGradeLevelId())
                && Objects.equals(offering.getAreaId(), form.getAreaId())
                && Objects.equals(offering.getDeliveryModeId(), form.getDeliveryModeId())
                && Objects.equals(offering.getSessionCount(), form.getSessionCount())
                && Objects.equals(offering.getDurationMinutes(), form.getDurationMinutes())
                && Objects.equals(offering.getCapacity(), form.getOfferingType() == OfferingType.GROUP_CLASS ? form.getCapacity() : null)
                && Objects.equals(offering.getStartsOn(), form.getOfferingType() == OfferingType.GROUP_CLASS ? form.getStartsOn() : null)
                && Objects.equals(offering.getEndsOn(), form.getOfferingType() == OfferingType.GROUP_CLASS ? form.getEndsOn() : null)
                && hasSameSchedule(offering.getId(), form.getSlots());
        if (!unchanged) {
            throw conflict("Dịch vụ đã có đăng ký: có thể sửa tiêu đề, mô tả, giá và điều khoản cho đăng ký mới. Việc đổi lịch, sức chứa hoặc kế hoạch học còn chờ thống nhất với luồng giao dịch.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Đối chiếu số lượng khung lịch, thứ trong tuần, giờ bắt đầu/kết thúc
     * và múi giờ giữa form với dữ liệu đã lưu để xác định lịch học có được giữ nguyên.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), kiểm tra lịch khi lưu sửa.</p>
     */
    private boolean hasSameSchedule(Long offeringId, List<OfferingTimeSlotRequest> inputs) {
        List<OfferingTimeSlot> stored = slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(offeringId);
        if (stored.size() != inputs.size()) {
            return false;
        }

        for (OfferingTimeSlot slot : stored) {
            boolean found = false;
            for (OfferingTimeSlotRequest input : inputs) {
                if (Objects.equals(slot.getWeekday(), input.getWeekday())
                        && Objects.equals(slot.getStartTime(), input.getStartTime())
                        && Objects.equals(slot.getEndTime(), input.getEndTime())
                        && Objects.equals(slot.getTimeZone(), input.getTimeZone())) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }

        return true;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: So sánh phiên bản gửi từ form với phiên bản hiện tại của dịch vụ/lớp;
     * báo lỗi nếu dữ liệu đã thay đổi ở phiên khác để người dùng tải lại trang.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), lưu sửa và đổi trạng thái.</p>
     */
    private void requireVersion(Offering offering, Long version) {
        if (!Objects.equals(offering.getVersion(), version)) {
            throw conflict("Dữ liệu đã thay đổi ở phiên khác. Hãy tải lại trang trước khi thao tác.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Tạo lỗi HTTP 404 khi không tìm thấy dịch vụ/lớp thuộc tài khoản đang thao tác.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), xử lý bản ghi không tồn tại.</p>
     */
    private OfferingProblem missing() {
        return new OfferingProblem(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ/lớp thuộc tài khoản của bạn.");
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Tạo lỗi HTTP 409 kèm thông báo khi thao tác xung đột với trạng thái,
     * phiên bản dữ liệu hoặc kế hoạch học đã có đăng ký.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), xử lý xung đột nghiệp vụ.</p>
     */
    private OfferingProblem conflict(String message) {
        return new OfferingProblem(HttpStatus.CONFLICT, message);
    }
}
