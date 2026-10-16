package com.educonnect.security;

import com.educonnect.user.UserAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

/** Revokes existing sessions when the account is locked, roles change or its stamp changes. */
public class SessionAccountFilter extends OncePerRequestFilter {
    private final UserAccountRepository accounts;

    public SessionAccountFilter(UserAccountRepository accounts) { this.accounts = accounts; }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AccountPrincipal principal) {
            var account = accounts.findById(principal.getId());
            Set<SimpleGrantedAuthority> authorities = principal.getAuthorities().stream()
                    .map(a -> new SimpleGrantedAuthority(a.getAuthority())).collect(Collectors.toSet());
            boolean valid = account.filter(a -> "ACTIVE".equals(a.status()) && a.emailVerified()
                    && a.authenticationVersion() == principal.getAuthenticationVersion()
                    && a.roles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .collect(Collectors.toSet()).equals(authorities)).isPresent();
            if (!valid) {
                if (request.getSession(false) != null) request.getSession(false).invalidate();
                SecurityContextHolder.clearContext();
                response.sendRedirect(request.getContextPath() + "/auth/login?expired");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
