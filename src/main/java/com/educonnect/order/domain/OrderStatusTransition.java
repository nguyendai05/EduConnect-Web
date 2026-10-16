package com.educonnect.order.domain;

import jakarta.persistence.*;

/** Mapping order_status_transitions; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "order_status_transitions")
public class OrderStatusTransition {

    @EmbeddedId
    private OrderStatusTransitionId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_role_code", referencedColumnName = "code", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.Role actorRoleReference;

    protected OrderStatusTransition() {}

    public static OrderStatusTransition create() { return new OrderStatusTransition(); }

    public OrderStatusTransitionId getId() { return id; }
    public void setId(OrderStatusTransitionId id) { this.id = id; }

    public com.educonnect.user.domain.Role getActorRoleReference() { return actorRoleReference; }
}
