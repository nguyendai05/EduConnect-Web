package com.educonnect.user.service;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * DAI-02: đọc lại tài khoản từ DB và kiểm trạng thái, phiên, vai trò ở máy chủ.
 * Vai trò/ID không bao giờ lấy từ form.
 */
@Component
@Profile("db-dev")
public class AccountGuard {
    private final UserAccountRepository accounts;

    public AccountGuard(UserAccountRepository accounts) {
        this.accounts = accounts;
    }

    /** @param role vai trò bắt buộc (không có tiền tố ROLE_); null nếu chỉ cần đăng nhập hợp lệ. */
    public UserAccount require(AccountPrincipal principal, String role) {
        if (principal == null) {
            throw ServiceProblem.forbidden("Bạn cần đăng nhập để tiếp tục.");
        }
        UserAccount account = accounts.findById(principal.getId())
                .orElseThrow(() -> ServiceProblem.forbidden("Tài khoản không khả dụng."));
        if (!"ACTIVE".equals(account.status()) || !account.emailVerified()
                || account.authenticationVersion() != principal.getAuthenticationVersion()
                || role != null && !account.roles().contains(role)) {
            throw ServiceProblem.forbidden("Tài khoản không có quyền thực hiện thao tác này.");
        }
        return account;
    }
}
