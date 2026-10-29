package com.educonnect.payment.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import com.educonnect.order.domain.Order;

/** Mapping payments; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "payments", uniqueConstraints = {@UniqueConstraint(name = "uq_pay_code", columnNames = {"public_code"}), @UniqueConstraint(name = "uq_pay_order", columnNames = {"order_id"})})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_code", nullable = false, length = 64)
    private String publicCode;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @Column(name = "wallet_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal walletAmount;

    @Column(name = "provider_amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal providerAmount;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private PaymentStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "funded_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant fundedAt;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Order orderReference;

    protected Payment() {}

    public static Payment create() { return new Payment(); }

    public Long getId() { return id; }

    public String getPublicCode() { return publicCode; }
    public void setPublicCode(String publicCode) { this.publicCode = publicCode; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getWalletAmount() { return walletAmount; }
    public void setWalletAmount(BigDecimal walletAmount) { this.walletAmount = walletAmount; }

    public BigDecimal getProviderAmount() { return providerAmount; }
    public void setProviderAmount(BigDecimal providerAmount) { this.providerAmount = providerAmount; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public Instant getFundedAt() { return fundedAt; }
    public void setFundedAt(Instant fundedAt) { this.fundedAt = fundedAt; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Order getOrderReference() { return orderReference; }
}
