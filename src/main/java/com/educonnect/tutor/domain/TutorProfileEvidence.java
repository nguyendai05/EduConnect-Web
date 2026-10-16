package com.educonnect.tutor.domain;

import jakarta.persistence.*;

/** Mapping tutor_profile_evidence; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "tutor_profile_evidence", uniqueConstraints = {@UniqueConstraint(name = "uq_tpe_file", columnNames = {"file_id"})})
public class TutorProfileEvidence {

    @EmbeddedId
    private TutorProfileEvidenceId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.tutor.domain.TutorProfile tutorReference;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.file.domain.PrivateFile fileReference;

    protected TutorProfileEvidence() {}

    public static TutorProfileEvidence create() { return new TutorProfileEvidence(); }

    public TutorProfileEvidenceId getId() { return id; }
    public void setId(TutorProfileEvidenceId id) { this.id = id; }

    public com.educonnect.tutor.domain.TutorProfile getTutorReference() { return tutorReference; }

    public com.educonnect.file.domain.PrivateFile getFileReference() { return fileReference; }
}
