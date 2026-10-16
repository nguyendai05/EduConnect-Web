package com.educonnect.tutor.domain;

import jakarta.persistence.*;

/** Mapping tutor_delivery_modes; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "tutor_delivery_modes")
public class TutorDeliveryMode {

    @EmbeddedId
    private TutorDeliveryModeId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delivery_mode_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.DeliveryMode deliveryModeReference;

    protected TutorDeliveryMode() {}

    public static TutorDeliveryMode create() { return new TutorDeliveryMode(); }

    public TutorDeliveryModeId getId() { return id; }
    public void setId(TutorDeliveryModeId id) { this.id = id; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.common.reference.domain.DeliveryMode getDeliveryModeReference() { return deliveryModeReference; }
}
