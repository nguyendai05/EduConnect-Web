package com.educonnect.common.reference.domain;

import jakarta.persistence.*;

/** Mapping subjects; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "subjects", uniqueConstraints = {@UniqueConstraint(name = "uq_subjects_code", columnNames = {"code"})})
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    /** Người tạo mục tùy chỉnh; null là danh mục hệ thống. */
    @Column(name = "created_by", nullable = true)
    private Long createdBy;

    protected Subject() {}

    public static Subject create() { return new Subject(); }

    public Long getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
