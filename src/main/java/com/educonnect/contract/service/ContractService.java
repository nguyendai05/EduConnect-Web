package com.educonnect.contract.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.order.domain.*;
import com.educonnect.order.repository.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Service quản lý tạo đơn và hợp đồng từ giỏ hàng (HUY-02 / BB07).
 * Tối ưu hóa: bóc tách thao tác từng bảng thành các hàm con ngắn gọn.
 */
@Service
@Profile("db-dev")
@Transactional
public class ContractService {

    private CartJpaRepository cartRepo;
    private CartItemJpaRepository cartItemRepo;
    private OrderJpaRepository orderRepo;
    private OrderItemJpaRepository orderItemRepo;
    private ContractJpaRepository contractRepo;
    private RegistrationSourceJpaRepository sourceRepo;

    public ContractService(CartJpaRepository cartRepo, CartItemJpaRepository cartItemRepo,
                           OrderJpaRepository orderRepo, OrderItemJpaRepository orderItemRepo,
                           ContractJpaRepository contractRepo, RegistrationSourceJpaRepository sourceRepo) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.contractRepo = contractRepo;
        this.sourceRepo = sourceRepo;
    }

    /**
     * Lấy thực thể Hợp đồng kèm toàn bộ thông tin chi tiết (Học viên, Gia sư, Đơn hàng).
     */
    @Transactional(readOnly = true)
    public Optional<Contract> getContract(Long contractId) {
        return contractRepo.findByIdWithDetails(contractId);
    }

    /**
     * Lấy hợp đồng gần nhất của học viên.
     */
    @Transactional(readOnly = true)
    public Optional<Contract> getLatestContract(Long learnerId) {
        List<Contract> list = contractRepo.findLatestByLearnerId(learnerId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    /**
     * Luồng chính: Tạo Đơn hàng và Hợp đồng từ giỏ hàng.
     * Chạy theo chuỗi hàm: Tạo Order -> Tạo từng Contract -> Xóa giỏ.
     */
    public Long createContractFromCart(Long learnerId) {
        Cart cart = cartRepo.findByLearnerId(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Giỏ hàng không tồn tại"));
        List<CartItem> items = cartItemRepo.findByCartIdWithOffering(cart.getId());
        if (items.isEmpty()) throw new IllegalStateException("Giỏ hàng đang trống");

        // 1. Tạo Đơn hàng cha
        Order order = saveOrder(learnerId, items);

        // 2. Chuyển từng món trong giỏ thành chuỗi: Source -> OrderItem -> Contract
        Contract firstContract = null;
        int line = 1;
        for (CartItem item : items) {
            Contract contract = createContractForItem(order.getId(), learnerId, item, line++);
            if (firstContract == null) firstContract = contract;
        }

        // 3. Xóa sạch giỏ hàng
        cartItemRepo.deleteByCartId(cart.getId());
        return firstContract.getId();
    }

    // =========================================================================
    // CÁC HÀM CON THAO TÁC TỪNG BẢNG (NGẮN GỌN & TÁI SỬ DỤNG)
    // =========================================================================

    /** Thao tác bảng orders: tính tổng tiền và lưu đơn hàng */
    private Order saveOrder(Long learnerId, List<CartItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem i : items) {
            total = total.add(calculateLineTotal(i));
        }
        Order order = Order.create();
        order.setPublicCode("ORD-" + System.currentTimeMillis());
        order.setLearnerId(learnerId);
        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        order.setTotalAmount(total);
        order.setCurrency("VND");
        order.setCreationKey("CART-" + learnerId + "-" + System.currentTimeMillis());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        return orderRepo.save(order);
    }

    /** Thao tác liên hoàn 3 bảng: registration_sources -> order_items -> contracts */
    private Contract createContractForItem(Long orderId, Long learnerId, CartItem item, int line) {
        Offering off = item.getOfferingReference();

        // Bảng 1: registration_sources (lưu nguồn gốc khóa học từ Catalog)
        RegistrationSource src = RegistrationSource.create();
        src.setSourceKind(RegistrationSourceKind.CATALOG);
        src.setLearnerId(learnerId);
        src.setTutorId(off.getTutorId());
        src.setOfferingId(off.getId());
        src.setCreatedAt(Instant.now());
        src = sourceRepo.save(src);

        // Bảng 2: order_items (lưu snapshot giá & điều khoản bất biến)
        OrderItem oi = OrderItem.create();
        oi.setOrderId(orderId);
        oi.setLineNumber(line);
        oi.setRegistrationSourceId(src.getId());
        oi.setTutorId(off.getTutorId());
        oi.setTitleSnapshot(off.getTitle());
        oi.setOfferingTypeSnapshot(OrderItemType.valueOf(off.getOfferingType().name()));
        oi.setUnitPriceSnapshot(off.getUnitPrice());
        oi.setSessionCountSnapshot(off.getSessionCount() != null ? off.getSessionCount() : 1);
        oi.setSeatCount(item.getSeatCount() != null ? item.getSeatCount() : 1);
        oi.setLineTotal(calculateLineTotal(item));
        oi.setFeeRateSnapshot(new BigDecimal("0.100000"));
        oi.setFeePolicyVersion("V1");
        oi.setTermsVersionSnapshot(off.getTermsVersion() != null ? off.getTermsVersion() : 1);
        oi.setTermsTextSnapshot(off.getTermsText() != null ? off.getTermsText() : "Điều khoản tiêu chuẩn");
        oi.setTermsHash(sha256(oi.getTermsTextSnapshot()));
        oi.setCreatedAt(Instant.now());
        oi = orderItemRepo.save(oi);

        // Bảng 3: contracts (tạo hợp đồng thỏa thuận chờ thanh toán)
        Contract c = Contract.create();
        c.setPublicCode("CTR-" + System.currentTimeMillis() + "-" + oi.getId());
        c.setOrderItemId(oi.getId());
        c.setLearnerId(learnerId);
        c.setTutorId(off.getTutorId());
        c.setStatus(ContractStatus.AWAITING_PAYMENT);
        c.setAgreedTermsText(oi.getTermsTextSnapshot());
        c.setAgreedTermsHash(oi.getTermsHash());
        c.setLearnerAcceptedAt(Instant.now());
        c.setTutorAcceptedAt(Instant.now());
        c.setCreatedAt(Instant.now());
        return contractRepo.save(c);
    }

    /** Hàm tính thành tiền 1 dòng: đơn giá * số buổi * số chỗ */
    private BigDecimal calculateLineTotal(CartItem item) {
        Offering off = item.getOfferingReference();
        short sessions = (off.getSessionCount() != null && off.getSessionCount() > 0) ? off.getSessionCount() : 1;
        int seats = (item.getSeatCount() != null && item.getSeatCount() > 0) ? item.getSeatCount() : 1;
        return off.getUnitPrice().multiply(BigDecimal.valueOf(sessions)).multiply(BigDecimal.valueOf(seats));
    }

    /** Hàm băm SHA-256 điều khoản */
    private byte[] sha256(String text) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return new byte[32];
        }
    }
}
