package com.educonnect.user.domain;

import jakarta.persistence.*;

/** Mapping user_roles; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "user_roles")
public class UserRole {

    @EmbeddedId
    private UserRoleId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount userReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_code", referencedColumnName = "code", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.Role roleReference;

    protected UserRole() {}

    public static UserRole create() { return new UserRole(); }

    public UserRoleId getId() { return id; }
    public void setId(UserRoleId id) { this.id = id; }

    public com.educonnect.user.domain.UserAccount getUserReference() { return userReference; }

    public com.educonnect.user.domain.Role getRoleReference() { return roleReference; }
}
