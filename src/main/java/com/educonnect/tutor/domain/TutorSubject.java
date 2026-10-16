package com.educonnect.tutor.domain;

import jakarta.persistence.*;

/** Mapping tutor_subjects; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "tutor_subjects")
public class TutorSubject {

    @EmbeddedId
    private TutorSubjectId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.Subject subjectReference;

    protected TutorSubject() {}

    public static TutorSubject create() { return new TutorSubject(); }

    public TutorSubjectId getId() { return id; }
    public void setId(TutorSubjectId id) { this.id = id; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.common.reference.domain.Subject getSubjectReference() { return subjectReference; }
}
