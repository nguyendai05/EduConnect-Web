package com.educonnect.security;

import com.educonnect.user.UserAccountRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@Profile("db-dev")
public class AccountUserDetailsService implements UserDetailsService {
    private final UserAccountRepository accounts;

    public AccountUserDetailsService(UserAccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override public UserDetails loadUserByUsername(String email) {
        if (email == null || email.length() > 254) throw new UsernameNotFoundException("Thông tin đăng nhập không hợp lệ.");
        return accounts.findByEmail(email.strip().toLowerCase(Locale.ROOT)).map(AccountPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("Thông tin đăng nhập không hợp lệ."));
    }
}
