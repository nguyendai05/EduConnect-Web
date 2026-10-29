package com.educonnect.wallet.domain;

import jakarta.persistence.*;
import com.educonnect.user.domain.UserAccount;

/** Mapping wallets; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "wallets", uniqueConstraints = {@UniqueConstraint(name = "uq_wallet_account", columnNames = {"ledger_account_id"})})
public class Wallet {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "ledger_account_id", nullable = false)
    private Long ledgerAccountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserAccount account;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ledger_account_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private LedgerAccount ledgerAccountReference;

    protected Wallet() {}

    public static Wallet create() { return new Wallet(); }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getLedgerAccountId() { return ledgerAccountId; }
    public void setLedgerAccountId(Long ledgerAccountId) { this.ledgerAccountId = ledgerAccountId; }

    public UserAccount getAccount() { return account; }
    public void setAccount(UserAccount account) { this.account = account; }

    public LedgerAccount getLedgerAccountReference() { return ledgerAccountReference; }
}
