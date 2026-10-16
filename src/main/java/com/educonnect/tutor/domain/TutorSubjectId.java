package com.educonnect.tutor.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TutorSubjectId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    protected TutorSubjectId() {}

    public TutorSubjectId(Long tutorId, Long subjectId) {
        this.tutorId = tutorId;
        this.subjectId = subjectId;
    }

    public Long getTutorId() { return tutorId; }

    public Long getSubjectId() { return subjectId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof TutorSubjectId that)) return false;
        return Objects.equals(tutorId, that.tutorId) && Objects.equals(subjectId, that.subjectId);
    }

    @Override public int hashCode() { return Objects.hash(tutorId, subjectId); }
}
