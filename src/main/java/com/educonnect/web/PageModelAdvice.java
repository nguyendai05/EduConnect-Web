package com.educonnect.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import com.educonnect.security.AccountPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.core.env.Environment;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/** Shared presentation metadata and a safe projection of the authenticated account. */
@ControllerAdvice
public class PageModelAdvice {

    private final boolean uiPreviewEnabled;
    private final boolean authenticationEnabled;

    public PageModelAdvice(@Value("${app.ui-preview.enabled:true}") boolean uiPreviewEnabled, Environment environment) {
        this.uiPreviewEnabled = uiPreviewEnabled;
        this.authenticationEnabled = environment.matchesProfiles("db-dev");
    }

    @ModelAttribute
    void sharedModel(Model model, @AuthenticationPrincipal AccountPrincipal user, HttpServletRequest request) {
        model.addAttribute("uiPreviewEnabled", uiPreviewEnabled);
        model.addAttribute("authenticationEnabled", authenticationEnabled);
        String path = request.getRequestURI().substring(request.getContextPath().length());
        model.addAttribute("adminCrumbs", adminBreadcrumbs(path));
        model.addAttribute("currentUser", user == null ? null : new CurrentUser(user.getId(), user.getUsername(),
                user.getDisplayName(), user.getHomeUrl()));
    }

    private static final Map<String, String> ADMIN_PAGES = Map.ofEntries(
            Map.entry("/admin/dashboard", "Tổng quan"),
            Map.entry("/admin/manage", "Quản lý nền tảng"),
            Map.entry("/admin/offering-review-detail", "Khóa học"),
            Map.entry("/admin/tutor-review-queue", "Hồ sơ gia sư"),
            Map.entry("/admin/tutor-review-detail", "Hồ sơ gia sư"),
            Map.entry("/admin/job-review-queue", "Tin tìm gia sư"),
            Map.entry("/admin/job-review-detail", "Tin tìm gia sư"),
            Map.entry("/admin/reports", "Báo cáo & tranh chấp"),
            Map.entry("/admin/report-detail", "Báo cáo & tranh chấp"),
            Map.entry("/admin/payout-requests", "Yêu cầu rút tiền"),
            Map.entry("/admin/payout-request-detail", "Yêu cầu rút tiền"),
            Map.entry("/admin/audit-logs", "Nhật ký hệ thống"));
    private static final Map<String, String> ADMIN_LIST_OF_DETAIL = Map.of(
            "/admin/tutor-review-detail", "/admin/tutor-review-queue",
            "/admin/offering-review-detail", "/admin/manage?tab=offerings",
            "/admin/job-review-detail", "/admin/job-review-queue",
            "/admin/report-detail", "/admin/reports",
            "/admin/payout-request-detail", "/admin/payout-requests");

    /** Đường dẫn trên trang quản trị (Quản trị › Mục › Chi tiết) cho breadcrumb ở header; rỗng ngoài /admin. */
    static List<Crumb> adminBreadcrumbs(String path) {
        String label = ADMIN_PAGES.get(path);
        if (label == null) return List.of();
        List<Crumb> crumbs = new java.util.ArrayList<>();
        if (!"/admin/dashboard".equals(path)) crumbs.add(new Crumb("Quản trị", "/admin/dashboard"));
        String list = ADMIN_LIST_OF_DETAIL.get(path);
        if (list != null) {
            crumbs.add(new Crumb(label, list));
            crumbs.add(new Crumb("Chi tiết", null));
        } else {
            crumbs.add(new Crumb(label, null));
        }
        return crumbs;
    }

    public record Crumb(String label, String url) {}

    public record CurrentUser(Long id, String email, String displayName, String homeUrl) {}
}
