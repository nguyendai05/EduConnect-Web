package com.educonnect.tutor.domain;

import jakarta.persistence.*;

/** Mapping tutor_grade_levels; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "tutor_grade_levels")
public class TutorGradeLevel {

    @EmbeddedId
    private TutorGradeLevelId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grade_level_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.GradeLevel gradeLevelReference;

    protected TutorGradeLevel() {}

    public static TutorGradeLevel create() { return new TutorGradeLevel(); }

    public TutorGradeLevelId getId() { return id; }
    public void setId(TutorGradeLevelId id) { this.id = id; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.common.reference.domain.GradeLevel getGradeLevelReference() { return gradeLevelReference; }
}
