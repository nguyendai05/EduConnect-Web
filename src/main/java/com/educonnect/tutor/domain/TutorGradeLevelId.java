package com.educonnect.tutor.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TutorGradeLevelId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "grade_level_id", nullable = false)
    private Long gradeLevelId;

    protected TutorGradeLevelId() {}

    public TutorGradeLevelId(Long tutorId, Long gradeLevelId) {
        this.tutorId = tutorId;
        this.gradeLevelId = gradeLevelId;
    }

    public Long getTutorId() { return tutorId; }

    public Long getGradeLevelId() { return gradeLevelId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof TutorGradeLevelId that)) return false;
        return Objects.equals(tutorId, that.tutorId) && Objects.equals(gradeLevelId, that.gradeLevelId);
    }

    @Override public int hashCode() { return Objects.hash(tutorId, gradeLevelId); }
}
