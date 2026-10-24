package com.educonnect.security;

import com.educonnect.user.UserAccountRepository;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;

@Configuration
@Profile("db-dev")
public class DatabaseSecurityConfig {
    @Bean PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean SecurityFilterChain databaseSecurity(HttpSecurity http, AccountUserDetailsService users,
                                              PasswordEncoder encoder, UserAccountRepository accounts) throws Exception {
        var provider = new DaoAuthenticationProvider(users);
        provider.setPasswordEncoder(encoder);
        return http.authenticationProvider(provider)
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD).permitAll()
                        .requestMatchers("/css/**", "/js/**", "/assets/**", "/favicon.ico", "/error", "/auth/**",
                                "/", "/home", "/tutor/search", "/tutor/profile", "/catalog/detail", "/job/discover", "/job/detail").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/tutor/manage", "/tutor/my-profile", "/contract/tutor-detail")
                            .hasRole("TUTOR")
                        .requestMatchers("/cart/**", "/invitation/create", "/job/create", "/job/my-job", "/job/applicants", "/payment/**",
                                "/contract/student-detail", "/contract/confirm", "/contract/create", "/contract/sign").hasRole("LEARNER")
                        .anyRequest().authenticated())
                .formLogin(form -> form.loginPage("/auth/login").loginProcessingUrl("/auth/login")
                        .usernameParameter("email").failureUrl("/auth/login?error")
                        .successHandler((request, response, auth) -> {
                            var principal = (AccountPrincipal) auth.getPrincipal();
                            response.sendRedirect(request.getContextPath() + principal.getHomeUrl());
                        }).permitAll())
                .logout(logout -> logout.logoutUrl("/auth/logout").logoutSuccessUrl("/auth/login?logout")
                        .invalidateHttpSession(true).clearAuthentication(true).deleteCookies("JSESSIONID"))
                .sessionManagement(session -> session.sessionFixation(fixation -> fixation.changeSessionId()))
                .addFilterBefore(new SessionAccountFilter(accounts), AuthorizationFilter.class)
                .build();
    }
}
