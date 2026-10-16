package com.educonnect.user.domain;

import jakarta.persistence.*;

/** Mapping roles; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(name = "code", nullable = false, length = 24)
    private String code;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    protected Role() {}

    public static Role create() { return new Role(); }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
