package com.educonnect.common.reference.domain;

import jakarta.persistence.*;

/** Mapping areas; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "areas", uniqueConstraints = {@UniqueConstraint(name = "uq_areas_code", columnNames = {"code"})})
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    protected Area() {}

    public static Area create() { return new Area(); }

    public Long getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
