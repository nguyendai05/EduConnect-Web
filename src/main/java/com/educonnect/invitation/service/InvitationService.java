package com.educonnect.invitation.service;

import com.educonnect.invitation.domain.Invitation;
import com.educonnect.invitation.domain.InvitationStatus;
import com.educonnect.invitation.dto.InvitationActionRequest;
import com.educonnect.invitation.dto.InvitationOptionsResponse;
import com.educonnect.invitation.dto.InvitationRequest;
import com.educonnect.invitation.dto.InvitationResponse;
import com.educonnect.invitation.dto.InvitationSourceResponse;
import com.educonnect.invitation.repository.InvitationJpaRepository;
import com.educonnect.invitation.repository.InvitationLookupRepository;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.dto.OfferingCardResponse;
import com.educonnect.lesson.service.CatalogService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Tác giả: Trường Đạt.
 * DAT-03: tạo, đọc, phản hồi và bàn giao nguồn lời mời.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class InvitationService {
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final InvitationJpaRepository invitations;
    private final InvitationLookupRepository lookup;
    private final UserAccountRepository accounts;
    private final CatalogService catalog;
    private final Validator validator;
    private final Clock clock;

    public InvitationService(InvitationJpaRepository invitations, InvitationLookupRepository lookup,
                             UserAccountRepository accounts, CatalogService catalog, Validator validator, Clock clock) {
        this.invitations = invitations;
        this.lookup = lookup;
        this.accounts = accounts;
        this.catalog = catalog;
        this.validator = validator;
        this.clock = clock;
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/create: tạo form từ gia sư/dịch vụ được chọn.
     */
    public InvitationRequest prepare(AccountPrincipal principal, Long tutorId, Long offeringId) {
        UserAccount learner = requireAccount(principal, "LEARNER");
        InvitationRequest form = new InvitationRequest();
        form.setRequestKey(UUID.randomUUID().toString());
        if (offeringId != null) {
            Offering offering = publicOffering(offeringId);
            if (tutorId != null && !tutorId.equals(offering.getTutorId())) {
                throw missing();
            }
            tutorId = offering.getTutorId();
            fillOfferingProposal(form, offering);
        }
        if (tutorId != null) {
            requirePublicTutor(tutorId, learner.id());
            form.setTutorId(tutorId);
        }
        return form;
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/create: danh mục thật, không dùng fixture/persona.
     */
    public InvitationOptionsResponse options(AccountPrincipal principal, Long tutorId) {
        UserAccount learner = requireAccount(principal, "LEARNER");
        var offerings = new ArrayList<OfferingCardResponse>();
        for (Offering offering : lookup.publicOfferings(tutorId)) {
            if (!offering.getTutorId().equals(learner.id())) {
                offerings.add(OfferingCardResponse.from(offering));
            }
        }
        return new InvitationOptionsResponse(lookup.publicTutors(learner.id()), lookup.references(), offerings);
    }

    /**
     * Tác giả: Trường Đạt.
     * Gửi lời mời; khóa học viên rồi kiểm mã ổn định để chống tạo trùng.
     */
    @Transactional
    public Long create(AccountPrincipal principal, InvitationRequest form) {
        UserAccount learner = requireAccount(principal, "LEARNER");
        validate(form);
        if (!lookup.lockLearner(learner.id())) {
            throw forbidden("Chưa có hồ sơ học viên.");
        }
        String code = "INV-" + form.getRequestKey().toLowerCase(Locale.ROOT);
        var repeated = findRepeatedProposal(code, learner.id(), form);
        if (repeated.isPresent()) {
            return repeated.get().getId();
        }

        validateProposal(learner.id(), form);
        Invitation invitation = buildInvitation(code, learner.id(), form);
        return invitations.saveAndFlush(invitation).getId();
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/create: nạp cùng một đề xuất từ dịch vụ và lịch tham khảo.
     */
    private void fillOfferingProposal(InvitationRequest form, Offering offering) {
        form.setOfferingId(offering.getId());
        form.setOfferingVersion(offering.getVersion());
        form.setSubjectId(offering.getSubjectId());
        form.setGradeLevelId(offering.getGradeLevelId());
        form.setAreaId(offering.getAreaId());
        form.setDeliveryModeId(offering.getDeliveryModeId());
        form.setProposedUnitPrice(offering.getUnitPrice());
        form.setSessionCount(offering.getSessionCount());

        StringBuilder terms = new StringBuilder(offering.getTermsText());
        terms.append("\n\nThời lượng: ").append(offering.getDurationMinutes()).append(" phút/buổi.");
        for (var slot : catalog.getSchedule(offering.getId())) {
            terms.append("\n").append(slot.getWeekday() == 7 ? "Chủ nhật" : "Thứ " + (slot.getWeekday() + 1))
                    .append(": ").append(slot.getStartTime()).append("–").append(slot.getEndTime())
                    .append(" (").append(slot.getTimeZone()).append(')');
        }
        if (offering.getStartsOn() != null && offering.getEndsOn() != null) {
            terms.append("\nThời gian lớp tham khảo: ").append(offering.getStartsOn())
                    .append(" – ").append(offering.getEndsOn()).append('.');
        }
        form.setTermsText(terms.toString());
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/create: gửi lại cùng mã chỉ nhận lại đúng đề xuất của học viên.
     */
    private Optional<Invitation> findRepeatedProposal(String code, Long learnerId, InvitationRequest form) {
        var previous = invitations.findByPublicCode(code);
        if (previous.isEmpty()) {
            return previous;
        }
        Invitation stored = previous.get();
        if (!stored.getLearnerId().equals(learnerId)) {
            throw missing();
        }
        if (!sameProposal(stored, form)) {
            throw conflict("Mã gửi đã dùng cho đề xuất khác. Hãy mở form mới.");
        }
        return previous;
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/create: kiểm gia sư, danh mục và phiên bản dịch vụ tham khảo.
     */
    private void validateProposal(Long learnerId, InvitationRequest form) {
        requirePublicTutor(form.getTutorId(), learnerId);
        if (!lookup.referencesExist(form.getSubjectId(), form.getGradeLevelId(), form.getAreaId(), form.getDeliveryModeId())) {
            throw invalid("Môn, cấp học, khu vực hoặc hình thức học không tồn tại.");
        }
        if (form.getOfferingId() != null) {
            Offering offering = publicOffering(form.getOfferingId());
            if (!offering.getTutorId().equals(form.getTutorId())) {
                throw missing();
            }
            if (!Objects.equals(offering.getVersion(), form.getOfferingVersion())) {
                throw conflict("Dịch vụ đã thay đổi. Hãy chọn lại dịch vụ trước khi gửi lời mời.");
            }
            if (!Objects.equals(offering.getSubjectId(), form.getSubjectId())
                    || !Objects.equals(offering.getGradeLevelId(), form.getGradeLevelId())
                    || !Objects.equals(offering.getAreaId(), form.getAreaId())
                    || !Objects.equals(offering.getDeliveryModeId(), form.getDeliveryModeId())) {
                throw invalid("Danh mục phải khớp dịch vụ tham khảo đã chọn.");
            }
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/create: dựng lời mời mới với thời điểm và điều khoản bất biến.
     */
    private Invitation buildInvitation(String code, Long learnerId, InvitationRequest form) {
        Instant createdAt = now();
        Instant expiresAt = expiry(form);
        if (!expiresAt.isAfter(createdAt)) {
            throw invalid("Hạn nhận phản hồi phải ở tương lai (giờ Việt Nam).");
        }
        Invitation invitation = Invitation.create();
        invitation.setPublicCode(code);
        invitation.setLearnerId(learnerId);
        invitation.setTutorId(form.getTutorId());
        invitation.setOfferingId(form.getOfferingId());
        invitation.setSubjectId(form.getSubjectId());
        invitation.setGradeLevelId(form.getGradeLevelId());
        invitation.setAreaId(form.getAreaId());
        invitation.setDeliveryModeId(form.getDeliveryModeId());
        invitation.setProposedUnitPrice(form.getProposedUnitPrice());
        invitation.setSessionCount(form.getSessionCount());
        invitation.setTermsText(normalizeTerms(form.getTermsText()));
        invitation.setTermsVersion(1);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setCreatedAt(createdAt);
        invitation.setExpiresAt(expiresAt);
        return invitation;
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/negotiation: danh sách chỉ thuộc tài khoản hiện tại.
     */
    public Page<InvitationResponse> list(AccountPrincipal principal, int page) {
        UserAccount actor = requireParticipant(principal);
        if (page < 0 || page > 100000) {
            throw invalid("Số trang không hợp lệ.");
        }
        Page<Invitation> result = invitations.findForParticipant(actor.id(),
                PageRequest.of(page, 12, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
        var responses = new ArrayList<InvitationResponse>();
        for (Invitation invitation : result.getContent()) {
            responses.add(response(invitation, actor));
        }
        return new PageImpl<>(responses, result.getPageable(), result.getTotalElements());
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc chi tiết lời mời; ID của người khác trả 404.
     */
    public InvitationResponse detail(AccountPrincipal principal, Long id) {
        UserAccount actor = requireParticipant(principal);
        requireId(id);
        Invitation invitation = invitations.findOwned(id, actor.id()).orElseThrow(this::missing);
        return response(invitation, actor);
    }

    /**
     * Tác giả: Trường Đạt.
     * Chấp nhận đúng điều khoản, từ chối hoặc hủy; không chỉnh đề xuất đã gửi.
     */
    @Transactional
    public Long respond(AccountPrincipal principal, Long id, InvitationActionRequest form) {
        UserAccount actor = requireParticipant(principal);
        validate(form);
        Invitation invitation = lockOwned(id, actor.id());
        InvitationStatus target = requireAllowedResponse(invitation, actor, form);
        if (isRepeatedResponse(invitation, target, form.getVersion())) {
            return invitation.getId();
        }

        Instant respondedAt = now();
        requirePendingResponse(invitation, form.getVersion(), respondedAt);
        if (target == InvitationStatus.ACCEPTED) {
            acceptProposal(invitation, respondedAt);
        }
        invitation.setStatus(target);
        invitations.saveAndFlush(invitation);
        return invitation.getId();
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/negotiation: xác định phản hồi đúng vai trò và bộ điều khoản.
     */
    private InvitationStatus requireAllowedResponse(Invitation invitation, UserAccount actor, InvitationActionRequest form) {
        boolean learner = invitation.getLearnerId().equals(actor.id()) && actor.roles().contains("LEARNER");
        boolean tutor = invitation.getTutorId().equals(actor.id()) && actor.roles().contains("TUTOR");
        InvitationStatus target = switch (form.getAction()) {
            case "accept" -> InvitationStatus.ACCEPTED;
            case "decline" -> InvitationStatus.DECLINED;
            case "cancel" -> InvitationStatus.CANCELLED;
            default -> throw invalid("Thao tác không hợp lệ.");
        };
        if (target == InvitationStatus.CANCELLED ? !learner : !tutor) {
            throw forbidden("Bạn không có quyền thực hiện thao tác này.");
        }
        if (!Objects.equals(invitation.getTermsVersion(), form.getTermsVersion())) {
            throw conflict("Điều khoản đã thay đổi. Hãy tải lại lời mời.");
        }
        return target;
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/negotiation: nhận diện phản hồi lặp mà không ghi lần nữa.
     */
    private boolean isRepeatedResponse(Invitation invitation, InvitationStatus target, Long submittedVersion) {
        return invitation.getStatus() == target
                && (Objects.equals(invitation.getVersion(), submittedVersion)
                || Objects.equals(invitation.getVersion() - 1, submittedVersion));
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/negotiation: chỉ xử lý bản đang chờ, đúng phiên bản và còn hạn.
     */
    private void requirePendingResponse(Invitation invitation, Long submittedVersion, Instant respondedAt) {
        requireVersion(invitation, submittedVersion);
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw conflict("Lời mời đã được xử lý và không thể thay đổi.");
        }
        if (!invitation.getExpiresAt().isAfter(respondedAt)) {
            throw conflict("Lời mời đã hết hạn nhận phản hồi.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * /invitation/negotiation: kiểm hai tài khoản rồi ghi mốc gia sư chấp thuận.
     */
    private void acceptProposal(Invitation invitation, Instant respondedAt) {
        requirePublicTutor(invitation.getTutorId(), invitation.getLearnerId());
        UserAccount learnerAccount = accounts.findById(invitation.getLearnerId()).orElseThrow(this::missing);
        if (!"ACTIVE".equals(learnerAccount.status()) || !learnerAccount.emailVerified()
                || !learnerAccount.roles().contains("LEARNER")) {
            throw conflict("Tài khoản người học hiện không đủ điều kiện nhận chấp thuận.");
        }
        invitation.setAcceptedAt(respondedAt);
    }

    /**
     * Tác giả: Trường Đạt. A05: Huy gọi trong transaction tạo đơn, trước khi ghi RegistrationSource.
     * Giữ khóa học viên → lời mời → nguồn; không tạo Order/Contract/Enrollment ở đây.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public InvitationSourceResponse lockAcceptedSource(AccountPrincipal principal, Long id, Long version) {
        UserAccount learner = requireAccount(principal, "LEARNER");
        if (!lookup.lockLearner(learner.id())) {
            throw forbidden("Chưa có hồ sơ học viên.");
        }
        Invitation invitation = lockOwned(id, learner.id());
        if (!invitation.getLearnerId().equals(learner.id())) {
            throw missing();
        }
        requireVersion(invitation, version);
        if (invitation.getStatus() != InvitationStatus.ACCEPTED || invitation.getAcceptedAt() == null
                || invitation.getAcceptedAt().isAfter(invitation.getExpiresAt())) {
            throw conflict("Nguồn lời mời chưa được hai bên chấp thuận hợp lệ.");
        }
        requirePublicTutor(invitation.getTutorId(), learner.id());
        if (!invitations.lockSources(id).isEmpty()) {
            throw conflict("Lời mời đã được sử dụng để tạo giao dịch.");
        }
        if (invitation.getOfferingId() != null) {
            publicOffering(invitation.getOfferingId());
        }
        return new InvitationSourceResponse("INVITATION", invitation.getId(), invitation.getVersion(),
                invitation.getLearnerId(), invitation.getTutorId(), invitation.getOfferingId(),
                invitation.getSubjectId(), invitation.getGradeLevelId(), invitation.getAreaId(), invitation.getDeliveryModeId(),
                invitation.getProposedUnitPrice(), invitation.getSessionCount(), invitation.getTermsVersion(),
                invitation.getTermsText(), invitation.getCreatedAt(), invitation.getAcceptedAt());
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuyển lời mời sang Response và xác định thao tác theo vai trò, trạng thái hiện tại.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private InvitationResponse response(Invitation invitation, UserAccount actor) {
        InvitationStatus status = invitation.getStatus();
        if (status == InvitationStatus.PENDING && !invitation.getExpiresAt().isAfter(now())) {
            status = InvitationStatus.EXPIRED;
        }
        boolean pending = status == InvitationStatus.PENDING;
        boolean tutor = actor.id().equals(invitation.getTutorId()) && actor.roles().contains("TUTOR");
        boolean learner = actor.id().equals(invitation.getLearnerId()) && actor.roles().contains("LEARNER");
        return new InvitationResponse(invitation.getId(), invitation.getPublicCode(), invitation.getLearnerId(),
                invitation.getLearnerReference().getAccount().getDisplayName(), invitation.getTutorId(),
                invitation.getTutorReference().getAccount().getDisplayName(), invitation.getOfferingId(),
                invitation.getSubjectReference().getName(), invitation.getGradeLevelReference().getName(),
                invitation.getAreaReference().getName(), invitation.getDeliveryModeReference().getName(),
                invitation.getProposedUnitPrice(), invitation.getSessionCount(), invitation.getTermsText(),
                invitation.getTermsVersion(), invitation.getVersion(), status, invitation.getCreatedAt(),
                invitation.getExpiresAt(), invitation.getAcceptedAt(), pending && tutor, pending && tutor,
                pending && learner, invitations.countSources(invitation.getId()) > 0);
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm tài khoản thuộc một trong hai vai trò học viên/gia sư trước khi đọc lời mời.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private UserAccount requireParticipant(AccountPrincipal principal) {
        UserAccount actor = requireAccount(principal, null);
        if (!actor.roles().contains("LEARNER") && !actor.roles().contains("TUTOR")) {
            throw forbidden("Chỉ học viên hoặc gia sư liên quan được xem lời mời.");
        }
        return actor;
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm lại trạng thái, email, vai trò và phiên xác thực từ nền A01.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private UserAccount requireAccount(AccountPrincipal principal, String role) {
        if (principal == null) {
            throw forbidden("Bạn cần đăng nhập.");
        }
        UserAccount account = accounts.findById(principal.getId()).orElseThrow(() -> forbidden("Tài khoản không khả dụng."));
        if (!"ACTIVE".equals(account.status()) || !account.emailVerified()
                || account.authenticationVersion() != principal.getAuthenticationVersion()
                || role != null && !account.roles().contains(role)) {
            throw forbidden("Tài khoản không có quyền thực hiện thao tác này.");
        }
        return account;
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm gia sư công khai, có vai trò hợp lệ và khác người gửi.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private void requirePublicTutor(Long tutorId, Long learnerId) {
        requireId(tutorId);
        if (tutorId.equals(learnerId)) {
            throw invalid("Không thể gửi lời mời cho chính mình.");
        }
        lookup.publicTutor(tutorId).orElseThrow(this::missing);
        UserAccount tutor = accounts.findById(tutorId).orElseThrow(this::missing);
        if (!tutor.roles().contains("TUTOR")) {
            throw missing();
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc dịch vụ tham khảo còn nhận đăng ký qua CatalogService.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private Offering publicOffering(Long id) {
        requireId(id);
        try {
            Offering offering = catalog.getPublicOffering(id);
            String issue = catalog.registrationIssue(offering, 1);
            if (issue != null) {
                throw conflict(issue);
            }
            return offering;
        } catch (IllegalArgumentException missing) {
            throw missing();
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Khóa và đọc lại đúng lời mời thuộc quyền của người thao tác.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private Invitation lockOwned(Long id, Long actorId) {
        requireId(id);
        Invitation invitation = invitations.lockOwned(id, actorId).orElseThrow(this::missing);
        lookup.refreshLocked(invitation);
        return invitation;
    }

    /**
     * Tác giả: Trường Đạt.
     * Chặn thao tác sử dụng phiên bản lời mời đã cũ.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private void requireVersion(Invitation invitation, Long version) {
        if (!Objects.equals(invitation.getVersion(), version)) {
            throw conflict("Lời mời đã thay đổi. Hãy tải lại trước khi phản hồi.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * So sánh toàn bộ nội dung chuẩn hóa của đề xuất khi gửi lại cùng mã.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private boolean sameProposal(Invitation invitation, InvitationRequest form) {
        return Objects.equals(invitation.getTutorId(), form.getTutorId())
                && Objects.equals(invitation.getOfferingId(), form.getOfferingId())
                && Objects.equals(invitation.getSubjectId(), form.getSubjectId())
                && Objects.equals(invitation.getGradeLevelId(), form.getGradeLevelId())
                && Objects.equals(invitation.getAreaId(), form.getAreaId())
                && Objects.equals(invitation.getDeliveryModeId(), form.getDeliveryModeId())
                && invitation.getProposedUnitPrice().compareTo(form.getProposedUnitPrice()) == 0
                && Objects.equals(invitation.getSessionCount(), form.getSessionCount())
                && invitation.getTermsText().equals(normalizeTerms(form.getTermsText()))
                && invitation.getExpiresAt().equals(expiry(form));
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm ràng buộc Request kể cả khi Service được gọi trực tiếp.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private void validate(Object form) {
        if (form == null) {
            throw invalid("Thiếu dữ liệu biểu mẫu.");
        }
        var errors = validator.validate(form);
        if (!errors.isEmpty()) {
            throw invalid(errors.iterator().next().getMessage());
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuyển hạn nhập theo giờ Việt Nam thành thời điểm UTC với độ chính xác DB.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private Instant expiry(InvitationRequest form) {
        return form.getExpiresAt().atZone(ZONE).toInstant().truncatedTo(ChronoUnit.MICROS);
    }

    /**
     * Tác giả: Trường Đạt.
     * Chuẩn hóa xuống dòng và khoảng trắng ngoài điều khoản trước khi lưu/so sánh.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private String normalizeTerms(String terms) {
        return terms.replace("\r\n", "\n").replace('\r', '\n').strip();
    }

    /**
     * Tác giả: Trường Đạt.
     * Lấy thời điểm từ Clock dùng chung với độ chính xác microsecond của DB.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private Instant now() {
        return clock.instant().truncatedTo(ChronoUnit.MICROS);
    }

    /**
     * Tác giả: Trường Đạt.
     * Từ chối mã tham chiếu thiếu hoặc không dương.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private void requireId(Long id) {
        if (id == null || id < 1) {
            throw invalid("Mã tham chiếu không hợp lệ.");
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi không tìm thấy dữ liệu thuộc quyền truy cập.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private InvitationProblem missing() {
        return new InvitationProblem(HttpStatus.NOT_FOUND, "Không tìm thấy dữ liệu thuộc quyền truy cập của bạn.");
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi dữ liệu đầu vào không hợp lệ.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private InvitationProblem invalid(String message) {
        return new InvitationProblem(HttpStatus.BAD_REQUEST, message);
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi trạng thái hoặc phiên bản đã thay đổi.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private InvitationProblem conflict(String message) {
        return new InvitationProblem(HttpStatus.CONFLICT, message);
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi người thao tác không có quyền.
     * Thuộc DAT-03, /invitation/create và /invitation/negotiation.
     */
    private InvitationProblem forbidden(String message) {
        return new InvitationProblem(HttpStatus.FORBIDDEN, message);
    }
}
