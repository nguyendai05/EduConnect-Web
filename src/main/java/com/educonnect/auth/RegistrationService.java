package com.educonnect.auth;

import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Profile("db-dev")
@Validated
public class RegistrationService {
    private final EmailVerificationService verification;

    public RegistrationService(EmailVerificationService verification) {
        this.verification = verification;
    }

    @Transactional
    public String register(@Valid RegistrationForm form) {
        return verification.start(form);
    }
}
