package com.educonnect.user.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserRoleId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "role_code", nullable = false, length = 24)
    private String roleCode;

    protected UserRoleId() {}

    public UserRoleId(Long userId, String roleCode) {
        this.userId = userId;
        this.roleCode = roleCode;
    }

    public Long getUserId() { return userId; }

    public String getRoleCode() { return roleCode; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof UserRoleId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(roleCode, that.roleCode);
    }

    @Override public int hashCode() { return Objects.hash(userId, roleCode); }
}
