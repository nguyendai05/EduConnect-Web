package com.educonnect.tutor.domain;

import jakarta.persistence.*;

/** Mapping tutor_areas; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "tutor_areas")
public class TutorArea {

    @EmbeddedId
    private TutorAreaId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.Area areaReference;

    protected TutorArea() {}

    public static TutorArea create() { return new TutorArea(); }

    public TutorAreaId getId() { return id; }
    public void setId(TutorAreaId id) { this.id = id; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.common.reference.domain.Area getAreaReference() { return areaReference; }
}
