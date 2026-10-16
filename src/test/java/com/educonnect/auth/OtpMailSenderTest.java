package com.educonnect.auth;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;
import java.time.Duration;
import java.util.Properties;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OtpMailSenderTest {
    @Test void smtpMessageContainsOtpExpiryAndMatchingRequestCode() throws Exception {
        var smtp = mock(JavaMailSender.class);
        var message = new MimeMessage(Session.getInstance(new Properties()));
        when(smtp.createMimeMessage()).thenReturn(message);
        new OtpMailSender(smtp, "EduConnect <no-reply@example.test>")
                .send("learner@example.test", "012345", "12345678-1111-4111-8111-123456789012", Duration.ofMinutes(10));
        verify(smtp).send(message);
        assertEquals("learner@example.test", message.getAllRecipients()[0].toString());
        assertTrue(message.getContent().toString().contains("012345"));
        assertTrue(message.getContent().toString().contains("10 phút"));
        assertTrue(message.getSubject().contains("12345678"));
        assertEquals("signup/12345678-1111-4111-8111-123456789012", message.getHeader("Resend-Idempotency-Key", null));
    }

    @Test void missingSenderFailsWithoutSendingAMessage() {
        var smtp = mock(JavaMailSender.class);
        assertThrows(MailPreparationException.class, () -> new OtpMailSender(smtp, "")
                .send("learner@example.test", "012345", "12345678-1111-4111-8111-123456789012", Duration.ofMinutes(10)));
        verifyNoInteractions(smtp);
    }
}
