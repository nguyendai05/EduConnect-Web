package com.educonnect.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;

import java.time.Duration;

@Service
@Profile("db-dev")
public class OtpMailSender {
    private final JavaMailSender sender;
    private final String from;

    public OtpMailSender(JavaMailSender sender, @Value("${app.mail.from:}") String from) {
        this.sender = sender;
        this.from = from;
    }

    public void send(String email, String otp, String challenge, Duration ttl) {
        if (from.isBlank()) throw new MailPreparationException("Chưa cấu hình địa chỉ gửi email.");
        try {
            var message = sender.createMimeMessage();
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(email);
            helper.setSubject("EduConnect - Mã xác minh đăng ký " + challenge.substring(0, 8));
            helper.setText("Mã xác minh của bạn: " + otp + "\n\n"
                    + "Mã có hiệu lực trong " + ttl.toMinutes() + " phút và chỉ dùng một lần.\n"
                    + "Mã yêu cầu: " + challenge.substring(0, 8) + "\n"
                    + "Chỉ nhập mã vào lượt đăng ký có mã yêu cầu tương ứng trên trình duyệt của bạn.\n"
                    + "Mỗi lần gửi lại hoặc đăng ký lại sẽ vô hiệu hóa mã cũ.\n"
                    + "Không chia sẻ mã. Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.");
            message.setHeader("Resend-Idempotency-Key", "signup/" + challenge);
            sender.send(message);
        } catch (MessagingException error) {
            throw new MailPreparationException("Không chuẩn bị được email xác minh.", error);
        }
    }
}
