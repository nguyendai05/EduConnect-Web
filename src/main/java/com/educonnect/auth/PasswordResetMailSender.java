package com.educonnect.auth;

import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
@Profile("db-dev")
public class PasswordResetMailSender {
    private final JavaMailSender sender;
    private final String from;
    public PasswordResetMailSender(JavaMailSender sender, @Value("${app.mail.from:}") String from) {
        this.sender = sender; this.from = from;
    }
    public void send(String email, String link, Duration ttl) {
        if (from.isBlank()) throw new MailPreparationException("Chưa cấu hình địa chỉ gửi email.");
        try {
            var message = sender.createMimeMessage();
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from); helper.setTo(email);
            helper.setSubject("EduConnect - Đặt lại mật khẩu");
            helper.setText("Bạn đã yêu cầu đặt lại mật khẩu EduConnect.\n\n" + link + "\n\n"
                    + "Liên kết có hiệu lực " + ttl.toMinutes() + " phút, chỉ dùng một lần.\n"
                    + "Yêu cầu liên kết mới sẽ vô hiệu hóa liên kết cũ.\n"
                    + "Nếu bạn không yêu cầu, hãy bỏ qua email này. Không chia sẻ liên kết.");
            sender.send(message);
        } catch (MessagingException e) {
            throw new MailPreparationException("Không chuẩn bị được email đặt lại mật khẩu.", e);
        }
    }
}
