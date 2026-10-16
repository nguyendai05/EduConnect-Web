package com.educonnect.security;

import com.educonnect.user.UserAccount;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class AccountPrincipal extends User {
    private static final long serialVersionUID = 1L;
    private final Long id;
    private final String displayName;
    private final long authenticationVersion;

    public AccountPrincipal(UserAccount account) {
        super(account.email(), account.passwordHash(), account.emailVerified() && !"DISABLED".equals(account.status()), true, true,
                !"LOCKED".equals(account.status()), account.roles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList());
        id = account.id();
        displayName = account.displayName();
        authenticationVersion = account.authenticationVersion();
    }

    public Long getId() { return id; }
    public String getDisplayName() { return displayName; }
    public long getAuthenticationVersion() { return authenticationVersion; }

    public String getHomeUrl() {
        if (getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) return "/admin/dashboard";
        if (getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TUTOR"))) return "/tutor/manage";
        return "/home";
    }
}
