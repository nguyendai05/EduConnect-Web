package com.educonnect.auth;

import jakarta.validation.constraints.*;
import java.util.Locale;

public class ForgotPasswordForm {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ.")
    @Size(max = 254, message = "Email quá dài.")
    @Pattern(regexp = "[\\x21-\\x7E]+", message = "Email không được có khoảng trắng hoặc ký tự ngoài ASCII.")
    private String email;
    public String getEmail() { return email; }
    public void setEmail(String value) { email = value == null ? null : value.strip().toLowerCase(Locale.ROOT); }
}
