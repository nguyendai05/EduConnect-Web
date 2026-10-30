package com.educonnect.wallet.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import com.educonnect.contract.domain.Contract;
import com.educonnect.payment.domain.Payment;
import com.educonnect.payment.domain.Refund;

/** Mapping money_journals; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "money_journals", uniqueConstraints = {@UniqueConstraint(name = "uq_journal_business", columnNames = {"business_key"}), @UniqueConstraint(name = "uq_journal_release", columnNames = {"release_id"}), @UniqueConstraint(name = "uq_journal_refund", columnNames = {"refund_id"})})
public class MoneyJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "business_key", nullable = false, length = 128)
    private String businessKey;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "journal_kind", nullable = false, length = 32)
    private JournalKind journalKind;

    @Column(name = "payment_id", nullable = true)
    private Long paymentId;

    @Column(name = "contract_id", nullable = true)
    private Long contractId;

    @Column(name = "release_id", nullable = true)
    private Long releaseId;

    @Column(name = "refund_id", nullable = true)
    private Long refundId;

    @Column(name = "wallet_user_id", nullable = true)
    private Long walletUserId;

    @Column(name = "memo", nullable = false, length = 255)
    private String memo;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "posted_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant postedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "payment_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private Payment paymentReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private Contract contractReference;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "release_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private Release releaseReference;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "refund_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private Refund refundReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "wallet_user_id", referencedColumnName = "user_id", nullable = true, insertable = false, updatable = false)
    private Wallet walletUserReference;

    protected MoneyJournal() {}

    public static MoneyJournal create() { return new MoneyJournal(); }

    public Long getId() { return id; }

    public String getBusinessKey() { return businessKey; }
    public void setBusinessKey(String businessKey) { this.businessKey = businessKey; }

    public JournalKind getJournalKind() { return journalKind; }
    public void setJournalKind(JournalKind journalKind) { this.journalKind = journalKind; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public Long getReleaseId() { return releaseId; }
    public void setReleaseId(Long releaseId) { this.releaseId = releaseId; }

    public Long getRefundId() { return refundId; }
    public void setRefundId(Long refundId) { this.refundId = refundId; }

    public Long getWalletUserId() { return walletUserId; }
    public void setWalletUserId(Long walletUserId) { this.walletUserId = walletUserId; }

    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }

    public Instant getPostedAt() { return postedAt; }
    public void setPostedAt(Instant postedAt) { this.postedAt = postedAt; }

    public Payment getPaymentReference() { return paymentReference; }

    public Contract getContractReference() { return contractReference; }

    public Release getReleaseReference() { return releaseReference; }

    public Refund getRefundReference() { return refundReference; }

    public Wallet getWalletUserReference() { return walletUserReference; }
}
