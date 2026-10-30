package com.educonnect.auth;

import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class RegistrationForm {
    @NotBlank(message = "Vui lòng nhập họ và tên.")
    @Size(min = 2, max = 120, message = "Họ và tên cần từ 2 đến 120 ký tự.")
    private String name;

    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ.")
    @Size(max = 254, message = "Email quá dài.")
    @Pattern(regexp = "[\\x21-\\x7E]+", message = "Email chỉ được chứa ký tự ASCII và không có khoảng trắng.")
    private String email;

    @NotBlank(message = "Vui lòng nhập số điện thoại.")
    @Pattern(regexp = "(?:\\+84|0)[0-9]{9,10}", message = "Số điện thoại không hợp lệ.")
    private String phone;

    @NotBlank(message = "Vui lòng nhập mật khẩu.")
    @Size(min = 8, max = 72, message = "Mật khẩu cần từ 8 đến 72 ký tự.")
    private String password;

    @NotBlank(message = "Vui lòng xác nhận mật khẩu.")
    private String confirmPassword;

    @NotNull(message = "Vui lòng chọn vai trò.")
    @Pattern(regexp = "learner|tutor", message = "Chỉ được đăng ký học viên hoặc gia sư.")
    private String role = "learner";

    @AssertTrue(message = "Mật khẩu xác nhận chưa khớp.")
    public boolean isPasswordConfirmed() {
        return password != null && password.equals(confirmPassword);
    }

    @AssertTrue(message = "Mật khẩu quá dài hoặc chứa ký tự không hợp lệ. Hãy rút ngắn mật khẩu hoặc bớt ký tự có dấu.")
    public boolean isPasswordWithinByteLimit() {
        return password == null || (password.getBytes(StandardCharsets.UTF_8).length <= 72 && password.indexOf('\0') < 0);
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name == null ? null : name.strip(); }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email == null ? null : email.strip().toLowerCase(Locale.ROOT); }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone == null ? null : phone.replaceAll("[\\s.-]", ""); }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
