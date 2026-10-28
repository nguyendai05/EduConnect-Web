package com.educonnect.contract.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Vòng đời sau thanh toán của hợp đồng: hoàn thành (chuyển tiền cho gia sư) và hủy/hoàn tiền. */
@Service
@Profile("db-dev")
@Transactional
public class ContractLifecycleService {
    private EnrollmentJpaRepository enrollments;
    private ReleaseJpaRepository releases;
    private LedgerService ledger;
    private StatusRecorder status;
    private EntityManager entityManager;
    private Clock clock;

    public ContractLifecycleService(EnrollmentJpaRepository enrollments, ReleaseJpaRepository releases, LedgerService ledger,
                                    StatusRecorder status, EntityManager entityManager, Clock clock) {
        this.enrollments = enrollments;
        this.releases = releases;
        this.ledger = ledger;
        this.status = status;
        this.entityManager = entityManager;
        this.clock = clock;
    }

    /**
     * Gia sư của hợp đồng (hoặc admin) xác nhận hoàn thành: đơn và hợp đồng sang COMPLETED, chỗ giữ sang COMPLETED,
     * rồi giải ngân ký quỹ cho gia sư sau khi trừ phí nền tảng. Chỉ làm được khi hợp đồng đang thực hiện.
     */
    public void complete(AccountPrincipal user, Long contractId) {
        Contract contract = lock(contractId);
        boolean admin = user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        if (!admin && !contract.getTutorId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng");
        }
        Order order = contract.getOrderItemReference().getOrderReference();
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        if (contract.getStatus() != ContractStatus.ACTIVE
                || (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.IN_PROGRESS)) {
            throw new IllegalArgumentException("Hợp đồng chưa ở trạng thái đang thực hiện");
        }
        Instant now = clock.instant();
        String role = admin ? "ADMIN" : "TUTOR";
        if (order.getStatus() == OrderStatus.PAID) {
            status.order(order, OrderStatus.IN_PROGRESS, user.getId(), role, "Bắt đầu thực hiện", now);
        }
        status.order(order, OrderStatus.COMPLETED, user.getId(), role, "Hoàn thành hợp đồng", now);
        contract.setCompletedAt(now);
        status.contract(contract, ContractStatus.COMPLETED, user.getId(), "Hoàn thành hợp đồng", now);
        enrollments.findByContractId(contractId).ifPresent(e -> e.setStatus(EnrollmentStatus.COMPLETED));
        release(contract, contract.getOrderItemReference(), user.getId(), now);
    }

    /** Giải ngân: trừ phí theo tỷ lệ đã chốt trong đơn (làm tròn HALF_UP), phần còn lại vào ví gia sư. */
    private void release(Contract contract, OrderItem item, Long actorId, Instant now) {
        BigDecimal gross = item.getLineTotal();
        BigDecimal fee = gross.multiply(item.getFeeRateSnapshot()).setScale(0, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee);
        Long escrow = ledger.escrowAccount(contract.getId());
        ledger.lock(escrow);
        if (ledger.balance(escrow).compareTo(gross) < 0) throw new IllegalStateException("Ký quỹ không đủ để giải ngân");

        Release release = Release.create();
        release.setContractId(contract.getId());
        release.setReleaseKey("COMPLETION-" + contract.getId());
        release.setReasonCode(ReleaseReason.COMPLETION);
        release.setGrossAmount(gross);
        release.setFeeRateSnapshot(item.getFeeRateSnapshot());
        release.setFeeAmount(fee);
        release.setTutorNetAmount(net);
        release.setFeePolicyVersion(item.getFeePolicyVersion());
        release.setRoundingMode(ReleaseRoundingMode.HALF_UP);
        release.setApprovedBy(actorId);
        release.setReleasedAt(now);
        releases.save(release);

        MoneyJournal journal = ledger.newJournal("RELEASE-" + contract.getId(), JournalKind.RELEASE,
                "Giải ngân hợp đồng " + contract.getPublicCode());
        journal.setReleaseId(release.getId());
        journal.setContractId(contract.getId());
        List<Line> lines = new ArrayList<>();
        lines.add(new Line(escrow, EntrySide.DEBIT, gross));
        if (net.signum() > 0) lines.add(new Line(ledger.walletAccount(contract.getTutorId()), EntrySide.CREDIT, net));
        if (fee.signum() > 0) lines.add(new Line(ledger.systemAccount(LedgerAccountKind.PLATFORM_REVENUE), EntrySide.CREDIT, fee));
        ledger.post(journal, lines);
    }

    /** Khóa dòng hợp đồng trước khi đổi trạng thái; không có thì 404. */
    private Contract lock(Long contractId) {
        Contract contract = entityManager.find(Contract.class, contractId, LockModeType.PESSIMISTIC_WRITE);
        if (contract == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng");
        return contract;
    }
}
