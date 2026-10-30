package com.educonnect.auth;

import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;

public class ResetPasswordForm {
    @NotBlank(message = "Liên kết đặt lại mật khẩu không hợp lệ.")
    @Pattern(regexp = "[A-Za-z0-9_-]{43}", message = "Liên kết đặt lại mật khẩu không hợp lệ.")
    private String token;
    @NotBlank(message = "Vui lòng nhập mật khẩu mới.")
    @Size(min = 8, max = 72, message = "Mật khẩu cần từ 8 đến 72 ký tự.")
    private String password;
    @NotBlank(message = "Vui lòng xác nhận mật khẩu.")
    private String confirmPassword;
    @AssertTrue(message = "Mật khẩu xác nhận chưa khớp.")
    public boolean isPasswordConfirmed() { return password != null && password.equals(confirmPassword); }
    @AssertTrue(message = "Mật khẩu quá dài hoặc chứa ký tự không hợp lệ. Hãy rút ngắn mật khẩu hoặc bớt ký tự có dấu.")
    public boolean isPasswordWithinByteLimit() {
        return password == null || (password.getBytes(StandardCharsets.UTF_8).length <= 72 && password.indexOf('\0') < 0);
    }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String password) { this.confirmPassword = password; }
}
