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

class PasswordResetMailSenderTest {
    @Test void utf8MailContainsSingleUseLinkAndConfiguredExpiry() throws Exception {
        var sender = mock(JavaMailSender.class);
        var message = new MimeMessage(Session.getInstance(new Properties()));
        when(sender.createMimeMessage()).thenReturn(message);
        var mail = new PasswordResetMailSender(sender, "EduConnect <auth@educonnect.test>");
        String link = "https://educonnect.test/auth/reset-password?token=" + "a".repeat(43);
        mail.send("recipient@educonnect.test", link, Duration.ofMinutes(30));
        verify(sender).send(message);
        assertEquals("EduConnect - Đặt lại mật khẩu", message.getSubject());
        assertEquals("recipient@educonnect.test", message.getAllRecipients()[0].toString());
        assertTrue(message.getContent().toString().contains(link));
        assertTrue(message.getContent().toString().contains("30 phút, chỉ dùng một lần"));
    }

    @Test void missingSenderFailsBeforeSending() {
        var sender = mock(JavaMailSender.class);
        assertThrows(MailPreparationException.class, () ->
                new PasswordResetMailSender(sender, "").send("user@educonnect.test", "link", Duration.ofMinutes(30)));
        verifyNoInteractions(sender);
    }
}
