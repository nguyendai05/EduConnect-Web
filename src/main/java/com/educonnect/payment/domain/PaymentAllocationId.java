package com.educonnect.payment.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PaymentAllocationId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    protected PaymentAllocationId() {}

    public PaymentAllocationId(Long paymentId, Long contractId) {
        this.paymentId = paymentId;
        this.contractId = contractId;
    }

    public Long getPaymentId() { return paymentId; }

    public Long getContractId() { return contractId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof PaymentAllocationId that)) return false;
        return Objects.equals(paymentId, that.paymentId) && Objects.equals(contractId, that.contractId);
    }

    @Override public int hashCode() { return Objects.hash(paymentId, contractId); }
}
