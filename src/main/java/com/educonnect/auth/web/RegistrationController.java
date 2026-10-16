package com.educonnect.auth.web;

import com.educonnect.auth.RegistrationForm;
import com.educonnect.auth.RegistrationService;
import com.educonnect.auth.OtpException;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

@Controller
@Profile("db-dev")
public class RegistrationController {
    private final RegistrationService registration;

    public RegistrationController(RegistrationService registration) {
        this.registration = registration;
    }

    @InitBinder("registrationForm")
    void registrationFields(WebDataBinder binder) {
        binder.setAllowedFields("name", "email", "phone", "password", "confirmPassword", "role");
    }

    @PostMapping("/auth/register")
    public String register(@Valid @ModelAttribute("registrationForm") RegistrationForm form, BindingResult errors, HttpSession session) {
        if (!errors.hasErrors()) {
            try {
                String challenge = registration.register(form);
                session.setAttribute(EmailVerificationController.SESSION_CHALLENGE, challenge);
                return "redirect:/auth/verify-email";
            } catch (DuplicateKeyException duplicate) {
                errors.rejectValue("email", "duplicate", "Email này đã được sử dụng. Vui lòng dùng email khác.");
            } catch (DataAccessException unavailable) {
                errors.reject("unavailable", "Chưa thể tiếp nhận đăng ký lúc này. Vui lòng thử lại sau.");
            } catch (OtpException limited) {
                errors.reject("verification", limited.getMessage());
            } catch (MailException unavailable) {
                errors.reject("mail", "Chưa gửi được mã xác minh. Vui lòng thử lại sau; tài khoản chưa được tạo.");
            }
        }
        form.setPassword(null);
        form.setConfirmPassword(null);
        return "pages/auth/register";
    }
}
