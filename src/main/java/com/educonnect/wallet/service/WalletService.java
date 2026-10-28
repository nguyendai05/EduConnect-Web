package com.educonnect.wallet.service;

import com.educonnect.security.AccountPrincipal;
import com.educonnect.wallet.domain.Wallet;
import com.educonnect.wallet.dto.WalletEntryDTO;
import com.educonnect.wallet.dto.WalletOverviewDTO;
import com.educonnect.wallet.repository.LedgerEntryJpaRepository;
import com.educonnect.wallet.repository.WalletJpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/** Xem ví của chính người đăng nhập: số dư tính từ sổ cái và lịch sử biến động. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class WalletService {
    private WalletJpaRepository wallets;
    private LedgerEntryJpaRepository entries;

    public WalletService(WalletJpaRepository wallets, LedgerEntryJpaRepository entries) {
        this.wallets = wallets;
        this.entries = entries;
    }

    /** Số dư và lịch sử (10 dòng mỗi trang, mới nhất trước). Người chưa có ví thấy số dư 0. */
    public WalletOverviewDTO overview(AccountPrincipal user, int page) {
        Long account = wallets.findById(user.getId()).map(Wallet::getLedgerAccountId).orElse(null);
        if (account == null) return new WalletOverviewDTO(BigDecimal.ZERO, Page.empty());
        return new WalletOverviewDTO(entries.balance(account),
                entries.history(account, PageRequest.of(Math.max(page, 0), 10)).map(WalletEntryDTO::from));
    }
}
