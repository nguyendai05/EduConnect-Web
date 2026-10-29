package com.educonnect.wallet.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.contract.service.ContractListService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.domain.JournalKind;
import com.educonnect.wallet.domain.Wallet;
import com.educonnect.wallet.dto.WalletEntryDTO;
import com.educonnect.wallet.dto.WalletOverviewDTO;
import com.educonnect.wallet.repository.LedgerEntryJpaRepository;
import com.educonnect.wallet.repository.WalletJpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/** Xem ví của chính người đăng nhập: số dư tính từ sổ cái và lịch sử biến động. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class WalletService {
    private WalletJpaRepository wallets;
    private LedgerEntryJpaRepository entries;
    private ContractJpaRepository contracts;
    private ContractSessionJpaRepository sessions;
    private ContractListService contractList;

    public WalletService(WalletJpaRepository wallets, LedgerEntryJpaRepository entries,
                         ContractJpaRepository contracts, ContractSessionJpaRepository sessions,
                         ContractListService contractList) {
        this.contractList = contractList;
        this.wallets = wallets;
        this.entries = entries;
        this.contracts = contracts;
        this.sessions = sessions;
    }

    /**
     * Số dư khả dụng, các số phụ theo vai trò, 5 hợp đồng gần nhất và lịch sử biến động (10 dòng mỗi trang, mới nhất trước)
     * lọc theo loại (all, topup, payment, release, refund) và khoảng ngày. Người chưa có ví thấy số dư 0.
     */
    public WalletOverviewDTO overview(AccountPrincipal user, String type, LocalDate from, LocalDate to, int page) {
        Long account = wallets.findById(user.getId()).map(Wallet::getLedgerAccountId).orElse(null);
        BigDecimal balance = account == null ? BigDecimal.ZERO : entries.balance(account);
        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
        Instant start = from == null ? Instant.EPOCH : from.atStartOfDay(zone).toInstant();
        Instant end = to == null ? Instant.parse("9999-01-01T00:00:00Z") : to.plusDays(1).atStartOfDay(zone).toInstant();
        Page<WalletEntryDTO> history = account == null ? Page.empty()
                : entries.filtered(account, kinds(type), start, end, PageRequest.of(Math.max(page, 0), 10)).map(WalletEntryDTO::from);
        List<com.educonnect.contract.dto.ContractSummaryDTO> related = contractList.mine(user).stream().limit(5).toList();
        boolean tutor = user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TUTOR"));
        boolean learner = user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER"));
        BigDecimal refunded = account == null ? BigDecimal.ZERO : entries.creditTotal(account, JournalKind.REFUND);
        BigDecimal received = account == null ? BigDecimal.ZERO : entries.creditTotal(account, JournalKind.RELEASE);
        if (tutor) {
            return new WalletOverviewDTO(user.getDisplayName(), "Gia sư", balance, "Chờ giải ngân",
                    "Tiền (sau khi trừ phí) của các buổi chưa dạy hoặc chưa được học viên xác nhận trong hợp đồng đang thực hiện.",
                    open(user, true), "Tổng đã nhận", "Tiền các buổi đã giải ngân vào ví của bạn, sau khi trừ phí nền tảng.",
                    received, related, history);
        }
        if (learner) {
            return new WalletOverviewDTO(user.getDisplayName(), "Học viên", balance, "Đang ký quỹ",
                    "Tiền đã trả cho các hợp đồng đang thực hiện, được giữ cho tới khi bạn xác nhận từng buổi học.",
                    open(user, false), "Đã hoàn tiền", "Tổng tiền đã được hoàn lại vào ví.", refunded, related, history);
        }
        return new WalletOverviewDTO(user.getDisplayName(), null, balance, null, null, null, null, null, null, related, history);
    }

    /** Các loại bút toán của một tab lọc; giá trị lạ coi như tất cả. */
    private static List<JournalKind> kinds(String type) {
        return switch (type == null ? "all" : type) {
            case "topup" -> List.of(JournalKind.TOP_UP);
            case "payment" -> List.of(JournalKind.WALLET_PAYMENT, JournalKind.PROVIDER_PAYMENT);
            case "release" -> List.of(JournalKind.RELEASE);
            case "refund" -> List.of(JournalKind.REFUND);
            default -> List.of(JournalKind.values());
        };
    }

    /** Tổng tiền các buổi chưa giải ngân trong hợp đồng đang thực hiện; gia sư thì trừ phí đã chốt trong đơn. */
    private BigDecimal open(AccountPrincipal user, boolean tutor) {
        List<Contract> active = contracts.findMine(user.getId()).stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .filter(c -> tutor ? c.getTutorId().equals(user.getId()) : c.getLearnerId().equals(user.getId())).toList();
        if (active.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = BigDecimal.ZERO;
        for (ContractSession s : sessions.findByContractIdInOrderByContractIdAscSessionNumberAsc(active.stream().map(Contract::getId).toList())) {
            if (s.getStatus() != ContractSessionStatus.HELD && s.getStatus() != ContractSessionStatus.ATTENDED) continue;
            BigDecimal amount = s.getAmount();
            if (tutor) {
                BigDecimal rate = active.stream().filter(c -> c.getId().equals(s.getContractId())).findFirst().get()
                        .getOrderItemReference().getFeeRateSnapshot();
                amount = amount.subtract(amount.multiply(rate).setScale(0, RoundingMode.HALF_UP));
            }
            sum = sum.add(amount);
        }
        return sum;
    }
}
