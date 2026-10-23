package com.educonnect.contract.service;

import com.educonnect.contract.CheckoutProperties;
import com.educonnect.contract.ContractConfirmationForm;
import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.dto.ContractConfirmationDTO;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.lesson.domain.*;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.lesson.service.CatalogService;
import com.educonnect.order.domain.*;
import com.educonnect.order.repository.*;
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
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Catalog checkout only. Drafts are read-only; explicit consent creates the transaction. */
@Service
@Profile("db-dev")
@Validated
@Transactional
public class ContractService {
    private final CartItemJpaRepository cartItems;
    private final OrderJpaRepository orders;
    private final OrderItemJpaRepository orderItems;
    private final ContractJpaRepository contracts;
    private final RegistrationSourceJpaRepository sources;
    private final EnrollmentJpaRepository enrollments;
    private final CatalogService catalog;
    private final EntityManager entityManager;
    private final CheckoutProperties properties;
    private final Clock clock;

    public ContractService(CartItemJpaRepository cartItems, OrderJpaRepository orders,
                           OrderItemJpaRepository orderItems, ContractJpaRepository contracts,
                           RegistrationSourceJpaRepository sources, EnrollmentJpaRepository enrollments,
                           CatalogService catalog, EntityManager entityManager,
                           CheckoutProperties properties, Clock clock) {
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
    }

    @Transactional(readOnly = true)
    public ContractConfirmationDTO draft(AccountPrincipal user, Long cartItemId) {
        Long learnerId = learnerId(user);
        CartItem item = ownItem(learnerId, cartItemId);
        Offering offering = item.getOfferingReference();
        validateOffering(learnerId, item, offering, item.getOfferingVersionSeen());
        return new ContractConfirmationDTO(null, item.getId(), offering.getVersion(), "Chưa tạo", "Chưa tạo",
                null, user.getDisplayName(), offering.getTutorReference().getAccount().getDisplayName(),
                offering.getTitle(), typeLabel(offering.getOfferingType()), offering.getUnitPrice(),
                offering.getSessionCount(), item.getSeatCount(), total(item, offering), offering.getTermsText(),
                "Chưa xác nhận", false);
    }

    @Transactional(readOnly = true)
    public ContractConfirmationDTO getContract(AccountPrincipal user, Long id) {
        Long learnerId = learnerId(user);
        Contract contract = contracts.findByIdWithDetails(id, learnerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng"));
        OrderItem item = contract.getOrderItemReference();
        return new ContractConfirmationDTO(contract.getId(), null, contract.getVersion(), contract.getPublicCode(),
                item.getOrderReference().getPublicCode(), contract.getCreatedAt(), user.getDisplayName(),
                contract.getTutorReference().getAccount().getDisplayName(), item.getTitleSnapshot(),
                item.getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS ? "Lớp nhóm" : "Dịch vụ 1 kèm 1",
                item.getUnitPriceSnapshot(), item.getSessionCountSnapshot(), item.getSeatCount(),
                item.getLineTotal(), contract.getAgreedTermsText(), switch (contract.getStatus()) {
                    case AWAITING_PAYMENT -> "Chờ thanh toán";
                    case ACTIVE -> "Đang thực hiện";
                    case COMPLETED -> "Đã hoàn thành";
                    case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
                    case CANCELLED -> "Đã hủy";
                }, contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                        && item.getOrderReference().getStatus() == OrderStatus.AWAITING_PAYMENT);
    }

    public Long confirm(AccountPrincipal user, @Valid ContractConfirmationForm form) {
        Long learnerId = learnerId(user);
        // Same lock order as CartService: learner first, offering second.
        if (entityManager.find(LearnerProfile.class, learnerId, LockModeType.PESSIMISTIC_WRITE) == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        String creationKey = "CART-ITEM-" + form.cartItemId();
        var existing = contracts.findByLearnerIdAndOrderItemReferenceOrderReferenceCreationKey(learnerId, creationKey);
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

        Order order = Order.create();
        order.setPublicCode("ORD-" + UUID.randomUUID());
        order.setLearnerId(learnerId);
        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        order.setTotalAmount(total(item, offering));
        order.setCurrency(offering.getCurrency());
        order.setCreationKey(creationKey);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        orders.save(order);

        RegistrationSource source = RegistrationSource.create();
        source.setSourceKind(RegistrationSourceKind.CATALOG);
        source.setLearnerId(learnerId);
        source.setTutorId(offering.getTutorId());
        source.setOfferingId(offering.getId());
        source.setCreatedAt(now);
        sources.save(source);

        OrderItem snapshot = OrderItem.create();
        snapshot.setOrderId(order.getId());
        snapshot.setLineNumber(1);
        snapshot.setRegistrationSourceId(source.getId());
        snapshot.setTutorId(offering.getTutorId());
        snapshot.setTitleSnapshot(offering.getTitle());
        snapshot.setOfferingTypeSnapshot(OrderItemType.valueOf(offering.getOfferingType().name()));
        snapshot.setUnitPriceSnapshot(offering.getUnitPrice());
        snapshot.setSessionCountSnapshot(offering.getSessionCount());
        snapshot.setSeatCount(item.getSeatCount());
        snapshot.setLineTotal(order.getTotalAmount());
        snapshot.setFeeRateSnapshot(properties.platformFeeRate());
        snapshot.setFeePolicyVersion(properties.feePolicyVersion());
        snapshot.setTermsVersionSnapshot(offering.getTermsVersion());
        snapshot.setTermsTextSnapshot(offering.getTermsText());
        snapshot.setTermsHash(sha256(offering.getTermsText()));
        snapshot.setCreatedAt(now);
        orderItems.save(snapshot);

        Contract contract = Contract.create();
        contract.setPublicCode("CTR-" + UUID.randomUUID());
        contract.setOrderItemId(snapshot.getId());
        contract.setLearnerId(learnerId);
        contract.setTutorId(offering.getTutorId());
        contract.setStatus(ContractStatus.AWAITING_PAYMENT);
        contract.setAgreedTermsText(snapshot.getTermsTextSnapshot());
        contract.setAgreedTermsHash(snapshot.getTermsHash());
        contract.setLearnerAcceptedAt(now);
        // Catalog is the tutor's published standing offer, not a new tutor signature at learner checkout.
        contract.setTutorAcceptedAt(offering.getPublishedAt());
        contract.setCreatedAt(now);
        contracts.save(contract);

        Enrollment reservation = Enrollment.create();
        reservation.setContractId(contract.getId());
        reservation.setOfferingId(offering.getId());
        reservation.setLearnerId(learnerId);
        reservation.setSeatCount(item.getSeatCount());
        reservation.setStatus(EnrollmentStatus.RESERVED);
        reservation.setReservedUntil(now.plus(properties.reservationTtl()));
        reservation.setCreatedAt(now);
        enrollments.save(reservation);
        item.getCartReference().setUpdatedAt(now);
        cartItems.delete(item);
        contracts.flush();
        return contract.getId();
    }

    private CartItem ownItem(Long learnerId, Long id) {
        if (id == null || id < 1) throw new IllegalArgumentException("Vui lòng chọn một mục trong giỏ");
        return cartItems.findByIdAndCartReferenceLearnerId(id, learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Lựa chọn không còn trong danh sách của bạn"));
    }

    private void validateOffering(Long learnerId, CartItem item, Offering offering, Long version) {
        if (!Objects.equals(offering.getVersion(), version)
                || !Objects.equals(offering.getVersion(), item.getOfferingVersionSeen())) {
            throw new IllegalArgumentException("Thông tin dịch vụ đã thay đổi. Vui lòng cập nhật lại lựa chọn trong giỏ.");
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

    private static BigDecimal total(CartItem item, Offering offering) {
        return offering.getUnitPrice().multiply(BigDecimal.valueOf(offering.getSessionCount()))
                .multiply(BigDecimal.valueOf(item.getSeatCount()));
    }

    private static String typeLabel(OfferingType type) {
        return type == OfferingType.GROUP_CLASS ? "Lớp nhóm" : "Dịch vụ 1 kèm 1";
    }

    private static byte[] sha256(String text) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
