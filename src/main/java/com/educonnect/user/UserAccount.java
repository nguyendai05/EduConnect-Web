package com.educonnect.user;

import java.util.Set;

/** Internal persistence projection; never serialize or log password hashes. */
public record UserAccount(Long id, String email, String passwordHash, String displayName,
                          String status, boolean emailVerified, long authenticationVersion, Set<String> roles) {
    public UserAccount {
        roles = Set.copyOf(roles);
    }

    @Override public String toString() {
        return "UserAccount[id=" + id + "]";
    }
}
