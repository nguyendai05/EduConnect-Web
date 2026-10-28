package com.educonnect.payment.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import com.educonnect.contract.domain.Contract;

/** Mapping payment_allocations; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "payment_allocations", uniqueConstraints = {@UniqueConstraint(name = "uq_alloc_contract", columnNames = {"contract_id"})})
public class PaymentAllocation {

    @EmbeddedId
    private PaymentAllocationId id;

    @Column(name = "amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @Column(name = "wallet_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal walletAmount;

    @Column(name = "provider_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal providerAmount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Payment paymentReference;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Contract contractReference;

    protected PaymentAllocation() {}

    public static PaymentAllocation create() { return new PaymentAllocation(); }

    public PaymentAllocationId getId() { return id; }
    public void setId(PaymentAllocationId id) { this.id = id; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getWalletAmount() { return walletAmount; }
    public void setWalletAmount(BigDecimal walletAmount) { this.walletAmount = walletAmount; }

    public BigDecimal getProviderAmount() { return providerAmount; }
    public void setProviderAmount(BigDecimal providerAmount) { this.providerAmount = providerAmount; }

    public Payment getPaymentReference() { return paymentReference; }

    public Contract getContractReference() { return contractReference; }
}
