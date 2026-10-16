package com.educonnect.order.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OrderStatusTransitionId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "from_status", nullable = false, length = 32)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 32)
    private String toStatus;

    @Column(name = "actor_role_code", nullable = false, length = 24)
    private String actorRoleCode;

    protected OrderStatusTransitionId() {}

    public OrderStatusTransitionId(String fromStatus, String toStatus, String actorRoleCode) {
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorRoleCode = actorRoleCode;
    }

    public String getFromStatus() { return fromStatus; }

    public String getToStatus() { return toStatus; }

    public String getActorRoleCode() { return actorRoleCode; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof OrderStatusTransitionId that)) return false;
        return Objects.equals(fromStatus, that.fromStatus) && Objects.equals(toStatus, that.toStatus) && Objects.equals(actorRoleCode, that.actorRoleCode);
    }

    @Override public int hashCode() { return Objects.hash(fromStatus, toStatus, actorRoleCode); }
}
