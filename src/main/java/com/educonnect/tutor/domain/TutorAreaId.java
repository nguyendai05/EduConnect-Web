package com.educonnect.tutor.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TutorAreaId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    protected TutorAreaId() {}

    public TutorAreaId(Long tutorId, Long areaId) {
        this.tutorId = tutorId;
        this.areaId = areaId;
    }

    public Long getTutorId() { return tutorId; }

    public Long getAreaId() { return areaId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof TutorAreaId that)) return false;
        return Objects.equals(tutorId, that.tutorId) && Objects.equals(areaId, that.areaId);
    }

    @Override public int hashCode() { return Objects.hash(tutorId, areaId); }
}
