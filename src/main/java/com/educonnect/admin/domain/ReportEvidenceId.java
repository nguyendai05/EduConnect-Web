package com.educonnect.admin.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ReportEvidenceId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "file_id", nullable = false)
    private Long fileId;

    protected ReportEvidenceId() {}

    public ReportEvidenceId(Long reportId, Long fileId) {
        this.reportId = reportId;
        this.fileId = fileId;
    }

    public Long getReportId() { return reportId; }

    public Long getFileId() { return fileId; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof ReportEvidenceId that)) return false;
        return Objects.equals(reportId, that.reportId) && Objects.equals(fileId, that.fileId);
    }

    @Override public int hashCode() { return Objects.hash(reportId, fileId); }
}
