package com.educonnect.wallet.service;

import com.educonnect.wallet.domain.EntrySide;
import com.educonnect.wallet.domain.EscrowAccount;
import com.educonnect.wallet.domain.JournalKind;
import com.educonnect.wallet.domain.LedgerAccount;
import com.educonnect.wallet.domain.LedgerAccountKind;
import com.educonnect.wallet.domain.LedgerEntry;
import com.educonnect.wallet.domain.MoneyJournal;
import com.educonnect.wallet.domain.Wallet;
import com.educonnect.wallet.repository.EscrowAccountJpaRepository;
import com.educonnect.wallet.repository.LedgerAccountJpaRepository;
import com.educonnect.wallet.repository.LedgerEntryJpaRepository;
import com.educonnect.wallet.repository.MoneyJournalJpaRepository;
import com.educonnect.wallet.repository.WalletJpaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.List;

/** Sổ cái tiền: tài khoản ví, ký quỹ, doanh thu và bút toán kép. Mọi thay đổi tiền đi qua đây. */
@Service
@Profile("db-dev")
@Transactional
public class LedgerService {
    /** Một dòng bút toán. */
    public record Line(Long accountId, EntrySide side, BigDecimal amount) {}

    private LedgerAccountJpaRepository accounts;
    private WalletJpaRepository wallets;
    private EscrowAccountJpaRepository escrows;
    private MoneyJournalJpaRepository journals;
    private LedgerEntryJpaRepository entries;
    private EntityManager entityManager;
    private Clock clock;

    public LedgerService(LedgerAccountJpaRepository accounts, WalletJpaRepository wallets, EscrowAccountJpaRepository escrows,
                         MoneyJournalJpaRepository journals, LedgerEntryJpaRepository entries,
                         EntityManager entityManager, Clock clock) {
        this.accounts = accounts;
        this.wallets = wallets;
        this.escrows = escrows;
        this.journals = journals;
        this.entries = entries;
        this.entityManager = entityManager;
        this.clock = clock;
    }

    /** Tài khoản ví của người dùng; tạo mới nếu chưa có. */
    public Long walletAccount(Long userId) {
        return wallets.findById(userId).map(Wallet::getLedgerAccountId).orElseGet(() -> {
            Long accountId = newAccount("WALLET-" + userId, LedgerAccountKind.USER_WALLET, userId);
            Wallet wallet = Wallet.create();
            wallet.setUserId(userId);
            wallet.setLedgerAccountId(accountId);
            wallets.save(wallet);
            return accountId;
        });
    }

    /** Tài khoản ký quỹ của hợp đồng; tạo mới nếu chưa có. */
    public Long escrowAccount(Long contractId) {
        return escrows.findById(contractId).map(EscrowAccount::getLedgerAccountId).orElseGet(() -> {
            Long accountId = newAccount("ESCROW-" + contractId, LedgerAccountKind.ESCROW, null);
            EscrowAccount escrow = EscrowAccount.create();
            escrow.setContractId(contractId);
            escrow.setLedgerAccountId(accountId);
            escrows.save(escrow);
            return accountId;
        });
    }

    /** Tài khoản dùng chung (PROVIDER_CLEARING hoặc PLATFORM_REVENUE); tạo mới nếu chưa có. */
    public Long systemAccount(LedgerAccountKind kind) {
        return accounts.findByAccountCode(kind.name()).map(LedgerAccount::getId)
                .orElseGet(() -> newAccount(kind.name(), kind, null));
    }

    private Long newAccount(String code, LedgerAccountKind kind, Long ownerUserId) {
        LedgerAccount account = LedgerAccount.create();
        account.setAccountCode(code);
        account.setAccountKind(kind);
        account.setOwnerUserId(ownerUserId);
        account.setCurrency("VND");
        return accounts.save(account).getId();
    }

    /** Khóa dòng tài khoản để hai giao dịch cùng lúc không tiêu trùng một số dư. */
    public void lock(Long accountId) {
        entityManager.find(LedgerAccount.class, accountId, LockModeType.PESSIMISTIC_WRITE);
    }

    /** Số dư của tài khoản (tổng CREDIT trừ DEBIT). */
    public BigDecimal balance(Long accountId) {
        return entries.balance(accountId);
    }

    /** Bút toán cùng business key đã ghi chưa (chống ghi lặp). */
    public boolean exists(String businessKey) {
        return journals.existsByBusinessKey(businessKey);
    }

    /** Tạo bút toán mới chưa lưu; người gọi gắn mã tham chiếu rồi gọi post. */
    public MoneyJournal newJournal(String businessKey, JournalKind kind, String memo) {
        MoneyJournal journal = MoneyJournal.create();
        journal.setBusinessKey(businessKey);
        journal.setJournalKind(kind);
        journal.setMemo(memo);
        journal.setPostedAt(clock.instant());
        return journal;
    }

    /** Lưu bút toán và các dòng; tổng DEBIT phải bằng tổng CREDIT. */
    public MoneyJournal post(MoneyJournal journal, List<Line> lines) {
        BigDecimal debit = lines.stream().filter(l -> l.side() == EntrySide.DEBIT).map(Line::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credit = lines.stream().filter(l -> l.side() == EntrySide.CREDIT).map(Line::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (debit.compareTo(credit) != 0) throw new IllegalStateException("Bút toán không cân");
        journals.save(journal);
        int number = 1;
        for (Line line : lines) {
            LedgerEntry entry = LedgerEntry.create();
            entry.setJournalId(journal.getId());
            entry.setLineNumber(number++);
            entry.setLedgerAccountId(line.accountId());
            entry.setEntrySide(line.side());
            entry.setAmount(line.amount());
            entries.save(entry);
        }
        return journal;
    }
}
