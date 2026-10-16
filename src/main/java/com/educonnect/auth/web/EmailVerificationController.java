package com.educonnect.auth.web;

import com.educonnect.auth.EmailVerificationService;
import com.educonnect.auth.OtpException;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@Profile("db-dev")
public class EmailVerificationController {
    public static final String SESSION_CHALLENGE = "educonnect.pendingEmailChallenge";
    private final EmailVerificationService verification;

    public EmailVerificationController(EmailVerificationService verification) { this.verification = verification; }

    @PostMapping("/auth/verify-email")
    public String verify(@RequestParam(defaultValue = "") String otp, HttpSession session, Model model) {
        String challenge = (String) session.getAttribute(SESSION_CHALLENGE);
        if (challenge == null) return "redirect:/auth/register";
        try {
            var result = verification.verify(challenge, otp.strip());
            if (result == EmailVerificationService.Result.SUCCESS || result == EmailVerificationService.Result.USED) {
                session.removeAttribute(SESSION_CHALLENGE);
                return "redirect:/auth/login?verified";
            }
            model.addAttribute("otpError", switch (result) {
                case INVALID -> "Mã OTP không đúng. Vui lòng kiểm tra lại email.";
                case EXPIRED -> "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.";
                case LOCKED -> "Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã mới.";
                case MISSING -> "Lượt đăng ký này đã được thay thế. Vui lòng đăng ký lại để nhận mã mới.";
                default -> "Không thể xác nhận lượt đăng ký này. Vui lòng đăng nhập hoặc đăng ký lại.";
            });
        } catch (DataAccessException unavailable) {
            model.addAttribute("otpError", "Chưa thể xác minh lúc này. Vui lòng thử lại sau.");
        }
        return render(challenge, model);
    }

    @PostMapping("/auth/verify-email/resend")
    public String resend(HttpSession session, Model model) {
        String challenge = (String) session.getAttribute(SESSION_CHALLENGE);
        if (challenge == null) return "redirect:/auth/register";
        try {
            session.setAttribute(SESSION_CHALLENGE, verification.resend(challenge));
            return "redirect:/auth/verify-email?resent";
        } catch (OtpException limited) {
            model.addAttribute("otpError", limited.getMessage());
        } catch (MailException unavailable) {
            model.addAttribute("otpError", "Chưa gửi được mã mới. Mã trước vẫn dùng được nếu còn hạn. Vui lòng thử lại sau.");
        } catch (DataAccessException unavailable) {
            model.addAttribute("otpError", "Chưa thể gửi lại mã lúc này. Vui lòng thử lại sau.");
        }
        return render(challenge, model);
    }

    private String render(String challenge, Model model) {
        model.addAttribute("verification", verification.view(challenge));
        return "pages/auth/verify-email";
    }
}
