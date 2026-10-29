package com.educonnect.wallet.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.security.AccountPrincipal;
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

    public WalletService(WalletJpaRepository wallets, LedgerEntryJpaRepository entries,
                         ContractJpaRepository contracts, ContractSessionJpaRepository sessions) {
        this.wallets = wallets;
        this.entries = entries;
        this.contracts = contracts;
        this.sessions = sessions;
    }

    /**
     * Số dư khả dụng, số thứ hai theo vai trò (học viên: đang ký quỹ; gia sư: chờ giải ngân) và lịch sử
     * (10 dòng mỗi trang, mới nhất trước). Người chưa có ví thấy số dư 0.
     */
    public WalletOverviewDTO overview(AccountPrincipal user, int page) {
        Long account = wallets.findById(user.getId()).map(Wallet::getLedgerAccountId).orElse(null);
        BigDecimal balance = account == null ? BigDecimal.ZERO : entries.balance(account);
        Page<WalletEntryDTO> history = account == null ? Page.empty()
                : entries.history(account, PageRequest.of(Math.max(page, 0), 10)).map(WalletEntryDTO::from);
        boolean tutor = user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TUTOR"));
        boolean learner = user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER"));
        if (tutor) {
            return new WalletOverviewDTO(balance, "Chờ giải ngân",
                    "Tiền (sau khi trừ phí) của các buổi chưa dạy hoặc chưa được học viên xác nhận trong hợp đồng đang thực hiện.",
                    open(user, true), history);
        }
        if (learner) {
            return new WalletOverviewDTO(balance, "Đang ký quỹ",
                    "Tiền đã trả cho các hợp đồng đang thực hiện, được giữ cho tới khi bạn xác nhận từng buổi học.",
                    open(user, false), history);
        }
        return new WalletOverviewDTO(balance, null, null, null, history);
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
