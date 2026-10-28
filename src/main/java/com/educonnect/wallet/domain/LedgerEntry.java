package com.educonnect.wallet.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;

/** Mapping ledger_entries; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "ledger_entries", uniqueConstraints = {@UniqueConstraint(name = "uq_entry_line", columnNames = {"journal_id", "line_number"})})
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "journal_id", nullable = false)
    private Long journalId;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "ledger_account_id", nullable = false)
    private Long ledgerAccountId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "entry_side", nullable = false, length = 32)
    private EntrySide entrySide;

    @Column(name = "amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private MoneyJournal journalReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ledger_account_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private LedgerAccount ledgerAccountReference;

    protected LedgerEntry() {}

    public static LedgerEntry create() { return new LedgerEntry(); }

    public Long getId() { return id; }

    public Long getJournalId() { return journalId; }
    public void setJournalId(Long journalId) { this.journalId = journalId; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public Long getLedgerAccountId() { return ledgerAccountId; }
    public void setLedgerAccountId(Long ledgerAccountId) { this.ledgerAccountId = ledgerAccountId; }

    public EntrySide getEntrySide() { return entrySide; }
    public void setEntrySide(EntrySide entrySide) { this.entrySide = entrySide; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public MoneyJournal getJournalReference() { return journalReference; }

    public LedgerAccount getLedgerAccountReference() { return ledgerAccountReference; }
}
