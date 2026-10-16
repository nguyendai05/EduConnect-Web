package com.educonnect.order.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping cart_items; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "cart_items", uniqueConstraints = {@UniqueConstraint(name = "uq_ci_offering", columnNames = {"cart_id", "offering_id"})})
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "cart_id", nullable = false)
    private Long cartId;

    @Column(name = "offering_id", nullable = false)
    private Long offeringId;

    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @Column(name = "offering_version_seen", nullable = false)
    private Long offeringVersionSeen;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.order.domain.Cart cartReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offering_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.lesson.domain.Offering offeringReference;

    protected CartItem() {}

    public static CartItem create() { return new CartItem(); }

    public Long getId() { return id; }

    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }

    public Long getOfferingId() { return offeringId; }
    public void setOfferingId(Long offeringId) { this.offeringId = offeringId; }

    public Integer getSeatCount() { return seatCount; }
    public void setSeatCount(Integer seatCount) { this.seatCount = seatCount; }

    public Long getOfferingVersionSeen() { return offeringVersionSeen; }
    public void setOfferingVersionSeen(Long offeringVersionSeen) { this.offeringVersionSeen = offeringVersionSeen; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.order.domain.Cart getCartReference() { return cartReference; }

    public com.educonnect.lesson.domain.Offering getOfferingReference() { return offeringReference; }
}
