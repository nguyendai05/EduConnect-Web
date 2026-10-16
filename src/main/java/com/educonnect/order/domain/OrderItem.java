package com.educonnect.order.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping order_items; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "order_items", uniqueConstraints = {@UniqueConstraint(name = "uq_items_line", columnNames = {"order_id", "line_number"}), @UniqueConstraint(name = "uq_items_source", columnNames = {"registration_source_id"})})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "registration_source_id", nullable = false)
    private Long registrationSourceId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "title_snapshot", nullable = false, length = 220)
    private String titleSnapshot;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "offering_type_snapshot", nullable = false, length = 32)
    private OrderItemType offeringTypeSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false, precision = 19, scale = 0)
    private BigDecimal unitPriceSnapshot;

    @Column(name = "session_count_snapshot", nullable = false)
    private Short sessionCountSnapshot;

    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @Column(name = "line_total", nullable = false, precision = 19, scale = 0)
    private BigDecimal lineTotal;

    @Column(name = "fee_rate_snapshot", nullable = false, precision = 9, scale = 6)
    private BigDecimal feeRateSnapshot;

    @Column(name = "fee_policy_version", nullable = false, length = 64)
    private String feePolicyVersion;

    @Column(name = "terms_version_snapshot", nullable = false)
    private Integer termsVersionSnapshot;

    @Column(name = "terms_text_snapshot", nullable = false, columnDefinition = "text")
    private String termsTextSnapshot;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "terms_hash", nullable = false, length = 32, columnDefinition = "binary(32)")
    private byte[] termsHash;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.order.domain.Order orderReference;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_source_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.order.domain.RegistrationSource registrationSourceReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    protected OrderItem() {}

    public static OrderItem create() { return new OrderItem(); }

    public Long getId() { return id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public Long getRegistrationSourceId() { return registrationSourceId; }
    public void setRegistrationSourceId(Long registrationSourceId) { this.registrationSourceId = registrationSourceId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTitleSnapshot() { return titleSnapshot; }
    public void setTitleSnapshot(String titleSnapshot) { this.titleSnapshot = titleSnapshot; }

    public OrderItemType getOfferingTypeSnapshot() { return offeringTypeSnapshot; }
    public void setOfferingTypeSnapshot(OrderItemType offeringTypeSnapshot) { this.offeringTypeSnapshot = offeringTypeSnapshot; }

    public BigDecimal getUnitPriceSnapshot() { return unitPriceSnapshot; }
    public void setUnitPriceSnapshot(BigDecimal unitPriceSnapshot) { this.unitPriceSnapshot = unitPriceSnapshot; }

    public Short getSessionCountSnapshot() { return sessionCountSnapshot; }
    public void setSessionCountSnapshot(Short sessionCountSnapshot) { this.sessionCountSnapshot = sessionCountSnapshot; }

    public Integer getSeatCount() { return seatCount; }
    public void setSeatCount(Integer seatCount) { this.seatCount = seatCount; }

    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }

    public BigDecimal getFeeRateSnapshot() { return feeRateSnapshot; }
    public void setFeeRateSnapshot(BigDecimal feeRateSnapshot) { this.feeRateSnapshot = feeRateSnapshot; }

    public String getFeePolicyVersion() { return feePolicyVersion; }
    public void setFeePolicyVersion(String feePolicyVersion) { this.feePolicyVersion = feePolicyVersion; }

    public Integer getTermsVersionSnapshot() { return termsVersionSnapshot; }
    public void setTermsVersionSnapshot(Integer termsVersionSnapshot) { this.termsVersionSnapshot = termsVersionSnapshot; }

    public String getTermsTextSnapshot() { return termsTextSnapshot; }
    public void setTermsTextSnapshot(String termsTextSnapshot) { this.termsTextSnapshot = termsTextSnapshot; }

    public byte[] getTermsHash() { return termsHash == null ? null : termsHash.clone(); }
    public void setTermsHash(byte[] termsHash) { this.termsHash = termsHash == null ? null : termsHash.clone(); }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.order.domain.Order getOrderReference() { return orderReference; }

    public com.educonnect.order.domain.RegistrationSource getRegistrationSourceReference() { return registrationSourceReference; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }
}
