package com.educonnect.contract.service;

import com.educonnect.contract.CheckoutProperties;
import com.educonnect.contract.ContractConfirmationForm;
import com.educonnect.contract.InvitationContractForm;
import com.educonnect.contract.JobContractForm;
import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.dto.ContractConfirmationDTO;
import com.educonnect.contract.dto.ContractDetailDTO;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.invitation.domain.Invitation;
import com.educonnect.invitation.dto.InvitationSourceResponse;
import com.educonnect.invitation.service.InvitationProblem;
import com.educonnect.invitation.service.InvitationService;
import com.educonnect.job.domain.JobApplication;
import com.educonnect.job.domain.JobPost;
import com.educonnect.job.dto.JobSourceResponse;
import com.educonnect.job.service.JobProblem;
import com.educonnect.job.service.JobService;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.lesson.domain.Enrollment;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.lesson.service.CatalogService;
import com.educonnect.order.domain.CartItem;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.RegistrationSource;
import com.educonnect.order.domain.RegistrationSourceKind;
import com.educonnect.order.repository.CartItemJpaRepository;
import com.educonnect.order.repository.OrderJpaRepository;
import com.educonnect.order.repository.OrderItemJpaRepository;
import com.educonnect.order.repository.RegistrationSourceJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.domain.LearnerProfile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Tạo đơn + hợp đồng từ giỏ (CATALOG), lời mời đã chấp thuận (INVITATION) hoặc gia sư được chọn cho tin (JOB). Xem dự thảo không tạo giao dịch. */
@Service
@Profile("db-dev")
@Validated
@Transactional
public class ContractService {
    private CartItemJpaRepository cartItems;
    private OrderJpaRepository orders;
    private OrderItemJpaRepository orderItems;
    private ContractJpaRepository contracts;
    private RegistrationSourceJpaRepository sources;
    private EnrollmentJpaRepository enrollments;
    private CatalogService catalog;
    private EntityManager entityManager;
    private CheckoutProperties properties;
    private Clock clock;
    private InvitationService invitations;
    private JobService jobs;
    private ContractSessionJpaRepository sessionRepo;

    /** Dữ liệu chung của một giao dịch, dù nguồn là giỏ hàng hay lời mời. */
    private record Deal(Long tutorId, String currency, String title, OrderItemType type, BigDecimal unitPrice,
                        short sessions, int seats, int termsVersion, String terms, Instant tutorAcceptedAt) {
        BigDecimal total() { return unitPrice.multiply(BigDecimal.valueOf(sessions)).multiply(BigDecimal.valueOf(seats)); }
    }

    public ContractService(CartItemJpaRepository cartItems, OrderJpaRepository orders,
                           OrderItemJpaRepository orderItems, ContractJpaRepository contracts,
                           RegistrationSourceJpaRepository sources, EnrollmentJpaRepository enrollments,
                           CatalogService catalog, EntityManager entityManager,
                           CheckoutProperties properties, Clock clock, InvitationService invitations, JobService jobs,
                           ContractSessionJpaRepository sessionRepo) {
        this.cartItems = cartItems;
        this.orders = orders;
        this.orderItems = orderItems;
        this.contracts = contracts;
        this.sources = sources;
        this.enrollments = enrollments;
        this.catalog = catalog;
        this.entityManager = entityManager;
        this.properties = properties;
        this.clock = clock;
        this.invitations = invitations;
        this.jobs = jobs;
        this.sessionRepo = sessionRepo;
    }

    @Transactional(readOnly = true)
    public ContractConfirmationDTO draft(AccountPrincipal user, Long cartItemId) {
        Long learnerId = learnerId(user);
        CartItem item = ownItem(learnerId, cartItemId);
        Offering offering = item.getOfferingReference();
        validateOffering(learnerId, item, offering, item.getOfferingVersionSeen());
        return ContractConfirmationDTO.draft(item, user.getDisplayName());
    }

    @Transactional(readOnly = true)
    public ContractConfirmationDTO getContract(AccountPrincipal user, Long id) {
        Long learnerId = learnerId(user);
        Contract contract = contracts.findByIdWithDetails(id, learnerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng"));
        return ContractConfirmationDTO.from(contract, user.getDisplayName());
    }

    public Long confirm(AccountPrincipal user, @Valid ContractConfirmationForm form) {
        Long learnerId = learnerId(user);
        // Same lock order as CartService: learner first, offering second.
        if (entityManager.find(LearnerProfile.class, learnerId, LockModeType.PESSIMISTIC_WRITE) == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        String creationKey = "CART-ITEM-" + form.cartItemId();
        Optional<Contract> existing = contracts.findByLearnerIdAndOrderItemReferenceOrderReferenceCreationKey(learnerId, creationKey);
        if (existing.isPresent()) return existing.get().getId();

        CartItem item = ownItem(learnerId, form.cartItemId());
        Offering offering = entityManager.find(Offering.class, item.getOfferingId(), LockModeType.PESSIMISTIC_WRITE);
        entityManager.refresh(offering, LockModeType.PESSIMISTIC_WRITE);
        validateOffering(learnerId, item, offering, form.version());
        Instant now = clock.instant();
        if (offering.getOfferingType() == OfferingType.GROUP_CLASS) {
            // Locking query is a current read under MySQL REPEATABLE READ, including a waiter after another checkout.
            long occupied = enrollments.findLockedByOfferingId(offering.getId()).stream()
                    .filter(e -> e.getStatus() == EnrollmentStatus.CONFIRMED || e.getStatus() == EnrollmentStatus.COMPLETED
                            || (e.getStatus() == EnrollmentStatus.RESERVED && e.getReservedUntil().isAfter(now)))
                    .mapToLong(Enrollment::getSeatCount).sum();
            if (item.getSeatCount() > offering.getCapacity() - occupied) {
                throw new IllegalArgumentException("Lớp không còn đủ chỗ theo lựa chọn");
            }
        }

        Deal deal = new Deal(offering.getTutorId(), offering.getCurrency(), offering.getTitle(),
                OrderItemType.valueOf(offering.getOfferingType().name()), offering.getUnitPrice(),
                offering.getSessionCount(), item.getSeatCount(), offering.getTermsVersion(),
                offering.getTermsText(), offering.getPublishedAt()); // catalog = lời đề nghị công khai của gia sư
        RegistrationSource source = RegistrationSource.create();
        source.setSourceKind(RegistrationSourceKind.CATALOG);
        source.setOfferingId(offering.getId());
        Contract contract = book(learnerId, source, deal, creationKey, now);
        reserve(contract, item.getOfferingId(), item.getSeatCount(), now);
        item.getCartReference().setUpdatedAt(now);
        cartItems.delete(item);
        contracts.flush();
        return contract.getId();
    }

    /** Chi tiết hợp đồng cho học viên hoặc gia sư của hợp đồng; người khác nhận 404. */
    @Transactional(readOnly = true)
    public ContractDetailDTO detail(AccountPrincipal user, Long id) {
        return contracts.findForParticipant(id, user.getId()).map(c -> ContractDetailDTO.from(c, user.getId(), sessionRepo.findByContractIdOrderBySessionNumber(c.getId())))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng"));
    }

    /** Xem dự thảo hợp đồng từ lời mời đã được hai bên chấp thuận; không tạo đơn. */
    public ContractConfirmationDTO draftInvitation(AccountPrincipal user, Long invitationId) {
        Long learnerId = learnerId(user);
        Invitation invitation = entityManager.find(Invitation.class, invitationId);
        if (invitation == null || !invitation.getLearnerId().equals(learnerId)) {
            throw new IllegalArgumentException("Không tìm thấy lời mời");
        }
        InvitationSourceResponse source = lockInvitation(user, invitationId, invitation.getVersion());
        return ContractConfirmationDTO.draftInvitation(source, invitation.getSubjectReference().getName(),
                user.getDisplayName(), invitation.getTutorReference().getAccount().getDisplayName());
    }

    /** Tạo đơn + hợp đồng từ lời mời đã chấp thuận. Gọi lại cùng lời mời trả về hợp đồng cũ. */
    public Long confirmInvitation(AccountPrincipal user, @Valid InvitationContractForm form) {
        Long learnerId = learnerId(user);
        // Cùng thứ tự khóa với luồng giỏ hàng: học viên trước.
        if (entityManager.find(LearnerProfile.class, learnerId, LockModeType.PESSIMISTIC_WRITE) == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        String creationKey = "INVITATION-" + form.invitationId();
        Optional<Contract> existing = contracts.findByLearnerIdAndOrderItemReferenceOrderReferenceCreationKey(learnerId, creationKey);
        if (existing.isPresent()) return existing.get().getId();

        // Kiểm lại và khóa nguồn tại thời điểm tạo giao dịch.
        InvitationSourceResponse src = lockInvitation(user, form.invitationId(), form.version());
        Invitation invitation = entityManager.find(Invitation.class, src.sourceId());
        Deal deal = new Deal(src.tutorId(), "VND", "Lời mời học " + invitation.getSubjectReference().getName(),
                OrderItemType.DIRECT, src.unitPrice(), src.sessionCount(), 1, src.termsVersion(),
                src.termsText(), src.tutorAcceptedAt());
        RegistrationSource source = RegistrationSource.create();
        source.setSourceKind(RegistrationSourceKind.INVITATION);
        source.setInvitationId(src.sourceId());
        source.setOfferingId(src.offeringId()); // chỉ để tham khảo, không giữ chỗ
        Contract contract = book(learnerId, source, deal, creationKey, clock.instant());
        contracts.flush();
        return contract.getId();
    }

    /** Xem dự thảo hợp đồng từ gia sư đã được chọn cho tin; không tạo đơn. */
    public ContractConfirmationDTO draftJob(AccountPrincipal user, Long applicationId) {
        Long learnerId = learnerId(user);
        JobApplication application = entityManager.find(JobApplication.class, applicationId);
        if (application == null || !application.getJobReference().getLearnerId().equals(learnerId)) {
            throw new IllegalArgumentException("Không tìm thấy ứng tuyển");
        }
        JobPost job = application.getJobReference();
        JobSourceResponse source = lockJob(user, job.getId(), job.getVersion(), application.getVersion());
        return ContractConfirmationDTO.draftJob(source, job.getTitle(), user.getDisplayName(),
                application.getTutorReference().getAccount().getDisplayName());
    }

    /** Tạo đơn + hợp đồng từ gia sư đã được chọn. Gọi lại cùng tin trả về hợp đồng cũ. */
    public Long confirmJob(AccountPrincipal user, @Valid JobContractForm form) {
        Long learnerId = learnerId(user);
        // Cùng thứ tự khóa với các luồng khác: học viên trước.
        if (entityManager.find(LearnerProfile.class, learnerId, LockModeType.PESSIMISTIC_WRITE) == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        String creationKey = "JOB-" + form.jobId();
        Optional<Contract> existing = contracts.findByLearnerIdAndOrderItemReferenceOrderReferenceCreationKey(learnerId, creationKey);
        if (existing.isPresent()) return existing.get().getId();

        // Kiểm lại và khóa nguồn tại thời điểm tạo giao dịch.
        JobSourceResponse src = lockJob(user, form.jobId(), form.jobVersion(), form.applicationVersion());
        if (!src.applicationId().equals(form.applicationId())) {
            throw new IllegalArgumentException("Gia sư được chọn đã thay đổi, vui lòng kiểm tra lại");
        }
        JobPost job = entityManager.find(JobPost.class, src.sourceId());
        Deal deal = new Deal(src.tutorId(), "VND", job.getTitle(), OrderItemType.DIRECT, src.unitPrice(),
                src.sessionCount(), 1, src.termsVersion(), src.termsText(), src.tutorAcceptedAt());
        RegistrationSource source = RegistrationSource.create();
        source.setSourceKind(RegistrationSourceKind.JOB_APPLICATION);
        source.setJobId(src.sourceId());
        source.setApplicationId(src.applicationId());
        Contract contract = book(learnerId, source, deal, creationKey, clock.instant());
        contracts.flush();
        return contract.getId();
    }

    /** Kiểm lại và khóa nguồn lời mời; lỗi nghiệp vụ của luồng lời mời được hiển thị như lỗi thường của trang hợp đồng. */
    private InvitationSourceResponse lockInvitation(AccountPrincipal user, Long invitationId, Long version) {
        try {
            return invitations.lockAcceptedSource(user, invitationId, version);
        } catch (InvitationProblem error) {
            throw new IllegalArgumentException(error.getMessage());
        }
    }

    /** Kiểm lại và khóa nguồn tin tìm gia sư; lỗi nghiệp vụ của luồng tin được hiển thị như lỗi thường của trang hợp đồng. */
    private JobSourceResponse lockJob(AccountPrincipal user, Long jobId, Long jobVersion, Long applicationVersion) {
        try {
            return jobs.lockSelectedSource(user, jobId, jobVersion, applicationVersion);
        } catch (JobProblem error) {
            throw new IllegalArgumentException(error.getMessage());
        }
    }

    /** Ghi đơn, nguồn, snapshot và hợp đồng cho một giao dịch. */
    private Contract book(Long learnerId, RegistrationSource source, Deal deal, String creationKey, Instant now) {
        Order order = createOrder(learnerId, deal, creationKey, now);
        source.setLearnerId(learnerId);
        source.setTutorId(deal.tutorId());
        source.setCreatedAt(now);
        sources.save(source);
        OrderItem snapshot = createSnapshot(order, source, deal, now);
        return createContract(learnerId, deal, snapshot, now);
    }

    private Order createOrder(Long learnerId, Deal deal, String creationKey, Instant now) {
        Order order = Order.create();
        order.setPublicCode("ORD-" + UUID.randomUUID());
        order.setLearnerId(learnerId);
        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        order.setTotalAmount(deal.total());
        order.setCurrency(deal.currency());
        order.setCreationKey(creationKey);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        return orders.save(order);
    }

    private OrderItem createSnapshot(Order order, RegistrationSource source, Deal deal, Instant now) {
        OrderItem snapshot = OrderItem.create();
        snapshot.setOrderId(order.getId());
        snapshot.setLineNumber(1);
        snapshot.setRegistrationSourceId(source.getId());
        snapshot.setTutorId(deal.tutorId());
        snapshot.setTitleSnapshot(deal.title());
        snapshot.setOfferingTypeSnapshot(deal.type());
        snapshot.setUnitPriceSnapshot(deal.unitPrice());
        snapshot.setSessionCountSnapshot(deal.sessions());
        snapshot.setSeatCount(deal.seats());
        snapshot.setLineTotal(deal.total());
        snapshot.setFeeRateSnapshot(properties.platformFeeRate());
        snapshot.setFeePolicyVersion(properties.feePolicyVersion());
        snapshot.setTermsVersionSnapshot(deal.termsVersion());
        snapshot.setTermsTextSnapshot(deal.terms());
        snapshot.setTermsHash(sha256(deal.terms()));
        snapshot.setCreatedAt(now);
        return orderItems.save(snapshot);
    }

    private Contract createContract(Long learnerId, Deal deal, OrderItem snapshot, Instant now) {
        Contract contract = Contract.create();
        contract.setPublicCode("CTR-" + UUID.randomUUID());
        contract.setOrderItemId(snapshot.getId());
        contract.setLearnerId(learnerId);
        contract.setTutorId(deal.tutorId());
        contract.setStatus(ContractStatus.AWAITING_PAYMENT);
        contract.setAgreedTermsText(snapshot.getTermsTextSnapshot());
        contract.setAgreedTermsHash(snapshot.getTermsHash());
        contract.setLearnerAcceptedAt(now);
        contract.setTutorAcceptedAt(deal.tutorAcceptedAt());
        contract.setCreatedAt(now);
        return contracts.save(contract);
    }

    /** Giữ chỗ tạm cho dịch vụ/lớp trong danh mục. */
    private void reserve(Contract contract, Long offeringId, int seats, Instant now) {
        Enrollment reservation = Enrollment.create();
        reservation.setContractId(contract.getId());
        reservation.setOfferingId(offeringId);
        reservation.setLearnerId(contract.getLearnerId());
        reservation.setSeatCount(seats);
        reservation.setStatus(EnrollmentStatus.RESERVED);
        reservation.setReservedUntil(now.plus(properties.reservationTtl()));
        reservation.setCreatedAt(now);
        enrollments.save(reservation);
    }

    private CartItem ownItem(Long learnerId, Long id) {
        if (id == null || id < 1) throw new IllegalArgumentException("Vui lòng chọn một mục trong giỏ");
        return cartItems.findByIdAndCartReferenceLearnerId(id, learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Lựa chọn không còn trong danh sách của bạn"));
    }

    private void validateOffering(Long learnerId, CartItem item, Offering offering, Long version) {
        if (!Objects.equals(offering.getVersion(), version)
                || !Objects.equals(offering.getVersion(), item.getOfferingVersionSeen())) {
            throw new IllegalArgumentException("Thông tin dịch vụ đã thay đổi, vui lòng cập nhật lại lựa chọn trong giỏ");
        }
        if (learnerId.equals(offering.getTutorId())) throw new IllegalArgumentException("Không thể đăng ký dịch vụ của chính mình");
        String issue = catalog.registrationIssue(offering, item.getSeatCount());
        if (issue != null) throw new IllegalArgumentException(issue);
        if (offering.getPublishedAt() == null || offering.getTermsText() == null || offering.getTermsText().isBlank()) {
            throw new IllegalArgumentException("Dịch vụ chưa có điều khoản công khai hợp lệ");
        }
    }

    private static Long learnerId(AccountPrincipal user) {
        if (user == null || !user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return user.getId();
    }

    private static byte[] sha256(String text) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
