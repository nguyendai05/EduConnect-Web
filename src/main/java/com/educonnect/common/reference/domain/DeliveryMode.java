package com.educonnect.common.reference.domain;

import jakarta.persistence.*;

/** Mapping delivery_modes; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "delivery_modes", uniqueConstraints = {@UniqueConstraint(name = "uq_delivery_modes_code", columnNames = {"code"})})
public class DeliveryMode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    protected DeliveryMode() {}

    public static DeliveryMode create() { return new DeliveryMode(); }

    public Long getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
