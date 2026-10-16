package com.educonnect.common.reference.domain;

import jakarta.persistence.*;

/** Mapping grade_levels; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "grade_levels", uniqueConstraints = {@UniqueConstraint(name = "uq_grade_levels_code", columnNames = {"code"})})
public class GradeLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    protected GradeLevel() {}

    public static GradeLevel create() { return new GradeLevel(); }

    public Long getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
