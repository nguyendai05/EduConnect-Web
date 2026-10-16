package com.educonnect.tutor.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TutorDeliveryModeId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "delivery_mode_id", nullable = false)
    private Long deliveryModeId;

    protected TutorDeliveryModeId() {}

    public TutorDeliveryModeId(Long tutorId, Long deliveryModeId) {
        this.tutorId = tutorId;
        this.deliveryModeId = deliveryModeId;
    }

    public Long getTutorId() { return tutorId; }

    public Long getDeliveryModeId() { return deliveryModeId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof TutorDeliveryModeId that)) return false;
        return Objects.equals(tutorId, that.tutorId) && Objects.equals(deliveryModeId, that.deliveryModeId);
    }

    @Override public int hashCode() { return Objects.hash(tutorId, deliveryModeId); }
}
