package com.educonnect.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

/** Checks configured SMTP TLS/auth only; never issues MAIL/RCPT/DATA or sends a message. */
@SpringBootTest
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_SMTP_CONNECTION_TEST", matches = "true")
class SmtpConnectionTest {
    @Autowired JavaMailSender mail;
    @Test void configuredSmtpAcceptsConnectionAndAuthentication() throws Exception {
        assertInstanceOf(JavaMailSenderImpl.class, mail).testConnection();
    }
}
