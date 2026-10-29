package com.educonnect.contract.service;

import com.educonnect.common.reference.domain.Area;
import com.educonnect.common.reference.domain.DeliveryMode;
import com.educonnect.common.reference.domain.GradeLevel;
import com.educonnect.common.reference.domain.Subject;
import com.educonnect.contract.CheckoutProperties;
import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.dto.ContractDocumentDTO;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.invitation.domain.Invitation;
import com.educonnect.job.domain.JobPost;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.RegistrationSource;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.UserAccount;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** Dựng nội dung hợp đồng dạy – học (mẫu v4.1) từ dữ liệu đã chốt của một hợp đồng; chỉ hai bên được xem. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class ContractDocumentService {
    private static final String AGREED = "Theo thỏa thuận của hai bên";
    private static final String[] WEEKDAYS = {"", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"};

    private ContractJpaRepository contracts;
    private CheckoutProperties properties;
    private EntityManager entityManager;

    public ContractDocumentService(ContractJpaRepository contracts, CheckoutProperties properties, EntityManager entityManager) {
        this.contracts = contracts;
        this.properties = properties;
        this.entityManager = entityManager;
    }

    /** Nội dung hợp đồng của một trong hai bên; người ngoài nhận 404. */
    public ContractDocumentDTO document(AccountPrincipal user, Long id) {
        Contract contract = contracts.findForParticipant(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng"));
        OrderItem item = contract.getOrderItemReference();
        RegistrationSource source = item.getRegistrationSourceReference();
        UserAccount learner = contract.getLearnerReference().getAccount();
        UserAccount tutor = contract.getTutorReference().getAccount();

        String sourceLabel, sourceCode, startDate = AGREED, perWeek = AGREED, duration = AGREED, capacity = "Không giới hạn";
        Subject subject; GradeLevel grade; DeliveryMode mode; Area area;
        List<String> schedule = List.of();
        switch (source.getSourceKind()) {
            case CATALOG -> {
                Offering offering = entityManager.find(Offering.class, source.getOfferingId());
                sourceLabel = "Học viên đăng ký dịch vụ/lớp trong danh mục";
                sourceCode = offering.getPublicCode();
                subject = offering.getSubjectReference();
                grade = offering.getGradeLevelReference();
                mode = offering.getDeliveryModeReference();
                area = offering.getAreaReference();
                duration = offering.getDurationMinutes() + " phút";
                if (offering.getStartsOn() != null) startDate = offering.getStartsOn().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                if (offering.getCapacity() != null) capacity = String.valueOf(offering.getCapacity());
                List<OfferingTimeSlot> slots = entityManager.createQuery("select s from OfferingTimeSlot s where s.offeringId = :id"
                        + " order by s.weekday, s.startTime", OfferingTimeSlot.class).setParameter("id", offering.getId()).getResultList();
                schedule = slots.stream().map(s -> WEEKDAYS[s.getWeekday()] + " " + s.getStartTime() + " – " + s.getEndTime()).toList();
                if (!slots.isEmpty()) perWeek = String.valueOf(slots.size());
            }
            case INVITATION -> {
                Invitation invitation = entityManager.find(Invitation.class, source.getInvitationId());
                sourceLabel = "Lời mời dạy đã được hai bên chốt điều khoản";
                sourceCode = invitation.getPublicCode();
                subject = invitation.getSubjectReference();
                grade = invitation.getGradeLevelReference();
                mode = invitation.getDeliveryModeReference();
                area = invitation.getAreaReference();
            }
            default -> {
                JobPost job = entityManager.find(JobPost.class, source.getJobId());
                sourceLabel = "Học viên chọn hồ sơ ứng tuyển từ tin tìm gia sư";
                sourceCode = job.getPublicCode();
                subject = job.getSubjectReference();
                grade = job.getGradeLevelReference();
                mode = job.getDeliveryModeReference();
                area = job.getAreaReference();
            }
        }

        int count = item.getSessionCountSnapshot();
        BigDecimal each = item.getLineTotal().divide(BigDecimal.valueOf(count), 0, RoundingMode.HALF_UP);
        BigDecimal rate = item.getFeeRateSnapshot();
        BigDecimal fee = each.multiply(rate).setScale(0, RoundingMode.HALF_UP);
        BigDecimal percent = rate.multiply(BigDecimal.valueOf(100)).stripTrailingZeros();
        Instant activated = entityManager.createQuery("select min(h.changedAt) from ContractStatusHistory h"
                + " where h.contractId = :id and h.toStatus = 'ACTIVE'", Instant.class).setParameter("id", contract.getId()).getSingleResult();
        boolean group = item.getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS;
        String verified = contract.getTutorReference().getReviewStatus() == TutorReviewStatus.APPROVED ? "Hồ sơ đã được xác minh" : "Hồ sơ chưa được xác minh";

        return new ContractDocumentDTO(contract.getId(), contract.getPublicCode(), contract.getCreatedAt(),
                switch (contract.getStatus()) {
                    case AWAITING_PAYMENT -> "Chờ thanh toán";
                    case ACTIVE -> "Đang thực hiện";
                    case COMPLETED -> "Đã hoàn thành";
                    case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
                    case CANCELLED -> "Đã hủy";
                }, contract.getTutorId().equals(user.getId()),
                learner.getDisplayName(), learner.getPublicCode(), learner.getEmail(), phone(learner),
                tutor.getDisplayName(), tutor.getPublicCode(), tutor.getEmail(), phone(tutor), verified,
                sourceLabel, sourceCode, subject.getName(), grade.getName(), mode.getName(), area.getName(), startDate, count, perWeek,
                duration, schedule, contract.getAgreedTermsText(), item.getUnitPriceSnapshot(), item.getLineTotal(),
                percent.scale() < 0 ? percent.setScale(0) : percent, fee, each.subtract(fee), item.getTermsVersionSnapshot(),
                item.getFeePolicyVersion(), properties.autoConfirmAfter().toHours(), contract.getCreatedAt().plusSeconds(48 * 3600L),
                group, item.getTitleSnapshot(), capacity, item.getSeatCount(),
                contract.getLearnerAcceptedAt(), contract.getTutorAcceptedAt(), activated);
    }

    private static String phone(UserAccount account) {
        return account.getPhone() == null || account.getPhone().isBlank() ? "Chưa cung cấp" : account.getPhone();
    }
}
