package com.educonnect.wallet.domain;

import jakarta.persistence.*;

/** Mapping escrow_accounts; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "escrow_accounts", uniqueConstraints = {@UniqueConstraint(name = "uq_escrow_account", columnNames = {"ledger_account_id"})})
public class EscrowAccount {

    @Id
    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "ledger_account_id", nullable = false)
    private Long ledgerAccountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = false)
    private com.educonnect.contract.domain.Contract contract;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ledger_account_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.wallet.domain.LedgerAccount ledgerAccountReference;

    protected EscrowAccount() {}

    public static EscrowAccount create() { return new EscrowAccount(); }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public Long getLedgerAccountId() { return ledgerAccountId; }
    public void setLedgerAccountId(Long ledgerAccountId) { this.ledgerAccountId = ledgerAccountId; }

    public com.educonnect.contract.domain.Contract getContract() { return contract; }
    public void setContract(com.educonnect.contract.domain.Contract contract) { this.contract = contract; }

    public com.educonnect.wallet.domain.LedgerAccount getLedgerAccountReference() { return ledgerAccountReference; }
}
