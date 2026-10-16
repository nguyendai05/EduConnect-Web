package com.educonnect.tutor.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TutorProfileEvidenceId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @Column(name = "file_id", nullable = false)
    private Long fileId;

    protected TutorProfileEvidenceId() {}

    public TutorProfileEvidenceId(Long tutorId, Long fileId) {
        this.tutorId = tutorId;
        this.fileId = fileId;
    }

    public Long getTutorId() { return tutorId; }

    public Long getFileId() { return fileId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof TutorProfileEvidenceId that)) return false;
        return Objects.equals(tutorId, that.tutorId) && Objects.equals(fileId, that.fileId);
    }

    @Override public int hashCode() { return Objects.hash(tutorId, fileId); }
}
