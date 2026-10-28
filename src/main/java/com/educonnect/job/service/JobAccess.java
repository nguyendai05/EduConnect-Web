package com.educonnect.job.service;

import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Tác giả: Trường Đạt.
 * DAT-04 dùng A01 hiện có, kiểm lại quyền khi gọi Service trực tiếp.
 */
@Component
@Profile("db-dev")
public class JobAccess {
    private final UserAccountRepository accounts;
    private final Validator validator;

    public JobAccess(UserAccountRepository accounts, Validator validator) {
        this.accounts = accounts;
        this.validator = validator;
    }

    /**
     * Tác giả: Trường Đạt.
     * Đọc lại tài khoản A01 và kiểm trạng thái, email, phiên cùng vai trò cần thiết.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public UserAccount require(AccountPrincipal principal, String role) {
        if (principal == null) {
            throw problem(HttpStatus.FORBIDDEN, "Bạn cần đăng nhập.");
        }
        UserAccount account = accounts.findById(principal.getId())
                .orElseThrow(() -> problem(HttpStatus.FORBIDDEN, "Tài khoản không khả dụng."));
        if (!"ACTIVE".equals(account.status()) || !account.emailVerified()
                || account.authenticationVersion() != principal.getAuthenticationVersion()
                || role != null && !account.roles().contains(role)) {
            throw problem(HttpStatus.FORBIDDEN, "Tài khoản không có quyền thực hiện thao tác này.");
        }
        return account;
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm tài khoản người đăng còn hoạt động, đã xác minh và có vai trò học viên.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public boolean activeLearner(Long id) {
        return accounts.findById(id).filter(a -> "ACTIVE".equals(a.status()) && a.emailVerified()
                && a.roles().contains("LEARNER")).isPresent();
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm tài khoản vẫn mang vai trò gia sư khi chuẩn bị lựa chọn.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public boolean tutorRole(Long id) {
        return accounts.findById(id).filter(a -> a.roles().contains("TUTOR")).isPresent();
    }

    /**
     * Tác giả: Trường Đạt.
     * Kiểm ràng buộc Request kể cả khi Service được gọi ngoài Controller.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public void validate(Object form) {
        if (form == null) {
            throw problem(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu biểu mẫu.");
        }
        var violations = validator.validate(form);
        if (!violations.isEmpty()) {
            throw problem(HttpStatus.BAD_REQUEST, violations.iterator().next().getMessage());
        }
    }

    /**
     * Tác giả: Trường Đạt.
     * Tạo lỗi nghiệp vụ có trạng thái HTTP phù hợp.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    public static JobProblem problem(HttpStatus status, String message) {
        return new JobProblem(status, message);
    }
}
