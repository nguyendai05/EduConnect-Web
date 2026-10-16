package com.educonnect.admin.domain;

import jakarta.persistence.*;

/** Mapping report_evidence; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "report_evidence", uniqueConstraints = {@UniqueConstraint(name = "uq_re_file", columnNames = {"file_id"})})
public class ReportEvidence {

    @EmbeddedId
    private ReportEvidenceId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.admin.domain.Report reportReference;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.file.domain.PrivateFile fileReference;

    protected ReportEvidence() {}

    public static ReportEvidence create() { return new ReportEvidence(); }

    public ReportEvidenceId getId() { return id; }
    public void setId(ReportEvidenceId id) { this.id = id; }

    public com.educonnect.admin.domain.Report getReportReference() { return reportReference; }

    public com.educonnect.file.domain.PrivateFile getFileReference() { return fileReference; }
}
