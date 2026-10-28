package com.educonnect.wallet.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.educonnect.user.domain.UserAccount;

/** Mapping ledger_accounts; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "ledger_accounts", uniqueConstraints = {@UniqueConstraint(name = "uq_la_code", columnNames = {"account_code"}), @UniqueConstraint(name = "uq_la_owner", columnNames = {"owner_user_id"})})
public class LedgerAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "account_code", nullable = false, length = 96)
    private String accountCode;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "account_kind", nullable = false, length = 32)
    private LedgerAccountKind accountKind;

    @Column(name = "owner_user_id", nullable = true)
    private Long ownerUserId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @ColumnDefault("'VND'")
    @Column(name = "currency", nullable = false, length = 3, columnDefinition = "char(3)")
    private String currency = "VND";

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "owner_user_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private UserAccount ownerUserReference;

    protected LedgerAccount() {}

    public static LedgerAccount create() { return new LedgerAccount(); }

    public Long getId() { return id; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public LedgerAccountKind getAccountKind() { return accountKind; }
    public void setAccountKind(LedgerAccountKind accountKind) { this.accountKind = accountKind; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Long getVersion() { return version; }

    public UserAccount getOwnerUserReference() { return ownerUserReference; }
}
