package com.educonnect.contract.service;

import com.educonnect.contract.CheckoutProperties;
import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.domain.EntrySide;
import com.educonnect.wallet.domain.JournalKind;
import com.educonnect.wallet.domain.LedgerAccountKind;
import com.educonnect.wallet.domain.MoneyJournal;
import com.educonnect.wallet.domain.Release;
import com.educonnect.wallet.domain.ReleaseReason;
import com.educonnect.wallet.domain.ReleaseRoundingMode;
import com.educonnect.wallet.repository.ReleaseJpaRepository;
import com.educonnect.wallet.service.LedgerService;
import com.educonnect.wallet.service.LedgerService.Line;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Buổi học của hợp đồng: ký quỹ chia theo buổi. Gia sư điểm danh, học viên xác nhận thì tiền của đúng buổi đó
 * (trừ phí) mới vào số dư gia sư. Học viên không phản hồi quá hạn thì hệ thống tự xác nhận.
 */
@Service
@Profile("db-dev")
@Transactional
public class ContractSessionService {
    private ContractSessionJpaRepository sessions;
    private ReleaseJpaRepository releases;
    private EnrollmentJpaRepository enrollments;
    private LedgerService ledger;
    private StatusRecorder status;
    private CheckoutProperties properties;
    private PlatformTransactionManager transactions;
    private EntityManager entityManager;
    private Clock clock;

    public ContractSessionService(ContractSessionJpaRepository sessions, ReleaseJpaRepository releases,
                                  EnrollmentJpaRepository enrollments, LedgerService ledger, StatusRecorder status,
                                  CheckoutProperties properties, PlatformTransactionManager transactions,
                                  EntityManager entityManager, Clock clock) {
        this.sessions = sessions;
        this.releases = releases;
        this.enrollments = enrollments;
        this.ledger = ledger;
        this.status = status;
        this.properties = properties;
        this.transactions = transactions;
        this.entityManager = entityManager;
        this.clock = clock;
    }

    /** Tạo các buổi HELD khi hợp đồng được thanh toán; mỗi buổi giữ phần ký quỹ bằng đơn giá nhân số chỗ. */
    public void create(Contract contract) {
        OrderItem item = contract.getOrderItemReference();
        BigDecimal each = item.getLineTotal().divide(BigDecimal.valueOf(item.getSessionCountSnapshot()));
        for (int number = 1; number <= item.getSessionCountSnapshot(); number++) {
            ContractSession session = ContractSession.create();
            session.setContractId(contract.getId());
            session.setSessionNumber(number);
            session.setAmount(each);
            session.setStatus(ContractSessionStatus.HELD);
            session.setCreatedAt(clock.instant());
            sessions.save(session);
        }
    }

    /** Gia sư điểm danh buổi đã dạy; phải điểm danh lần lượt từng buổi. Đơn chuyển sang IN_PROGRESS ở buổi đầu. */
    public void attend(AccountPrincipal user, Long sessionId) {
        ContractSession session = find(sessionId);
        Contract contract = lock(session.getContractId());
        if (!contract.getTutorId().equals(user.getId())) throw notFound();
        Order order = lockOrder(contract);
        entityManager.refresh(session, LockModeType.PESSIMISTIC_WRITE);
        ContractSession next = sessions.findFirstByContractIdAndStatusOrderBySessionNumber(contract.getId(), ContractSessionStatus.HELD)
                .orElse(null);
        if (contract.getStatus() != ContractStatus.ACTIVE || session.getStatus() != ContractSessionStatus.HELD
                || next == null || !next.getId().equals(session.getId())) {
            throw new IllegalArgumentException("Chỉ điểm danh được buổi kế tiếp của hợp đồng đang thực hiện");
        }
        Instant now = clock.instant();
        session.setStatus(ContractSessionStatus.ATTENDED);
        session.setAttendedAt(now);
        if (order.getStatus() == OrderStatus.PAID) {
            status.order(order, OrderStatus.IN_PROGRESS, user.getId(), "TUTOR", "Bắt đầu thực hiện", now);
        }
    }

    /** Gia sư điểm danh buổi kế tiếp của một hợp đồng (dùng cho nút điểm danh nhanh trong danh sách). */
    public void attendNext(AccountPrincipal user, Long contractId) {
        ContractSession next = sessions.findFirstByContractIdAndStatusOrderBySessionNumber(contractId, ContractSessionStatus.HELD)
                .orElseThrow(() -> new IllegalArgumentException("Không còn buổi nào để điểm danh"));
        attend(user, next.getId());
    }

    /**
     * Gia sư điểm danh cả lớp nhóm một lần: buổi kế tiếp của mọi hợp đồng đang thực hiện của lớp.
     * Hợp đồng trong absentContracts được ghi vắng (chỉ để hiển thị, buổi vẫn tính phí). Trả về số học viên được điểm danh.
     */
    public int attendClass(AccountPrincipal user, Long offeringId, Collection<Long> absentContracts) {
        List<Long> ids = entityManager.createQuery("select c.id from Contract c where c.tutorId = :tutor and c.status = :active"
                + " and c.orderItemReference.registrationSourceReference.offeringId = :offering order by c.id", Long.class)
                .setParameter("tutor", user.getId()).setParameter("active", ContractStatus.ACTIVE)
                .setParameter("offering", offeringId).getResultList();
        int count = 0;
        for (Long id : ids) {
            ContractSession next = sessions.findFirstByContractIdAndStatusOrderBySessionNumber(id, ContractSessionStatus.HELD).orElse(null);
            if (next == null) continue;
            attend(user, next.getId());
            next.setAbsent(absentContracts != null && absentContracts.contains(id));
            count++;
        }
        if (count == 0) throw new IllegalArgumentException("Lớp chưa có học viên nào cần điểm danh");
        return count;
    }

    /** Học viên xác nhận buổi đã học: giải ngân tiền buổi đó cho gia sư. */
    public void confirm(AccountPrincipal user, Long sessionId) {
        ContractSession session = find(sessionId);
        Contract contract = lock(session.getContractId());
        if (!contract.getLearnerId().equals(user.getId())) throw notFound();
        entityManager.refresh(session, LockModeType.PESSIMISTIC_WRITE);
        release(session, contract, user.getId(), clock.instant());
    }

    /** Mỗi 10 phút tự xác nhận các buổi đã điểm danh quá hạn mà học viên chưa phản hồi. */
    @Scheduled(fixedDelay = 600000, initialDelay = 60000)
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void autoConfirm() {
        Instant limit = clock.instant().minus(properties.autoConfirmAfter());
        TransactionTemplate tx = new TransactionTemplate(transactions);
        for (ContractSession due : sessions.findByStatusAndAttendedAtBefore(ContractSessionStatus.ATTENDED, limit)) {
            try {
                tx.executeWithoutResult(s -> {
                    ContractSession session = find(due.getId());
                    Contract contract = lock(session.getContractId());
                    entityManager.refresh(session, LockModeType.PESSIMISTIC_WRITE);
                    release(session, contract, contract.getLearnerId(), clock.instant());
                });
            } catch (RuntimeException error) {
                // buổi này sẽ được thử lại ở lần chạy sau
            }
        }
    }

    /**
     * Giải ngân một buổi: trừ phí theo tỷ lệ đã chốt trong đơn (làm tròn HALF_UP), phần còn lại vào ví gia sư.
     * Buổi cuối được giải ngân thì đơn và hợp đồng hoàn thành.
     */
    private void release(ContractSession session, Contract contract, Long actorId, Instant now) {
        if (contract.getStatus() != ContractStatus.ACTIVE || session.getStatus() != ContractSessionStatus.ATTENDED) {
            throw new IllegalArgumentException("Buổi học chưa được điểm danh hoặc đã xử lý");
        }
        OrderItem item = contract.getOrderItemReference();
        BigDecimal gross = session.getAmount();
        BigDecimal fee = gross.multiply(item.getFeeRateSnapshot()).setScale(0, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee);
        Long escrow = ledger.escrowAccount(contract.getId());
        ledger.lock(escrow);
        if (ledger.balance(escrow).compareTo(gross) < 0) throw new IllegalStateException("Ký quỹ không đủ để giải ngân");

        Release release = Release.create();
        release.setContractId(contract.getId());
        release.setReleaseKey("SESSION-" + session.getId());
        release.setReasonCode(ReleaseReason.MANUAL_MILESTONE);
        release.setGrossAmount(gross);
        release.setFeeRateSnapshot(item.getFeeRateSnapshot());
        release.setFeeAmount(fee);
        release.setTutorNetAmount(net);
        release.setFeePolicyVersion(item.getFeePolicyVersion());
        release.setRoundingMode(ReleaseRoundingMode.HALF_UP);
        release.setApprovedBy(actorId);
        release.setReleasedAt(now);
        releases.save(release);

        MoneyJournal journal = ledger.newJournal("RELEASE-SESSION-" + session.getId(), JournalKind.RELEASE,
                "Giải ngân buổi " + session.getSessionNumber() + " hợp đồng " + contract.getPublicCode());
        journal.setReleaseId(release.getId());
        journal.setContractId(contract.getId());
        List<Line> lines = new ArrayList<>();
        lines.add(new Line(escrow, EntrySide.DEBIT, gross));
        if (net.signum() > 0) lines.add(new Line(ledger.walletAccount(contract.getTutorId()), EntrySide.CREDIT, net));
        if (fee.signum() > 0) lines.add(new Line(ledger.systemAccount(LedgerAccountKind.PLATFORM_REVENUE), EntrySide.CREDIT, fee));
        ledger.post(journal, lines);

        session.setStatus(ContractSessionStatus.RELEASED);
        session.setConfirmedAt(now);
        session.setReleaseId(release.getId());
        if (sessions.countByContractIdAndStatusNot(contract.getId(), ContractSessionStatus.RELEASED) == 0) {
            finish(contract, actorId, now);
        }
    }

    /** Mọi buổi đã giải ngân: đóng hợp đồng và đơn. */
    private void finish(Contract contract, Long actorId, Instant now) {
        Order order = lockOrder(contract);
        status.order(order, OrderStatus.COMPLETED, actorId, null, "Hoàn thành hợp đồng", now);
        contract.setCompletedAt(now);
        status.contract(contract, ContractStatus.COMPLETED, actorId, "Mọi buổi học đã hoàn thành", now);
        enrollments.findByContractId(contract.getId()).ifPresent(e -> e.setStatus(EnrollmentStatus.COMPLETED));
    }

    private ContractSession find(Long id) {
        return sessions.findById(id).orElseThrow(ContractSessionService::notFound);
    }

    private Contract lock(Long contractId) {
        Contract contract = entityManager.find(Contract.class, contractId, LockModeType.PESSIMISTIC_WRITE);
        if (contract == null) throw notFound();
        return contract;
    }

    private Order lockOrder(Contract contract) {
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        return order;
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy buổi học");
    }
}
