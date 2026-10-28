package com.educonnect.job.web;

import com.educonnect.admin.web.JobReviewPageController;
import com.educonnect.job.service.JobProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.web.PageModelAdvice;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.ui.Model;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: lỗi có trạng thái HTTP, không fallback sang fixture.
 */
@ControllerAdvice(assignableTypes = {JobPageController.class, JobReviewPageController.class})
public class JobErrorAdvice {
    /**
     * Tác giả: Trường Đạt.
     * Hiển thị lỗi nghiệp vụ DAT-04 với trạng thái HTTP của Service.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @ExceptionHandler(JobProblem.class)
    public String business(JobProblem problem, Model model, HttpServletResponse response, HttpServletRequest request,
                           @AuthenticationPrincipal AccountPrincipal principal) {
        return error(problem.getStatus().value(), problem.getMessage(), model, response, request, principal);
    }

    /**
     * Tác giả: Trường Đạt.
     * Hiển thị lỗi mã tin, trạng thái hoặc số trang không hợp lệ.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    public String invalid(Model model, HttpServletResponse response, HttpServletRequest request,
                          @AuthenticationPrincipal AccountPrincipal principal) {
        return error(400, "Mã tin, trạng thái hoặc số trang không hợp lệ.", model, response, request, principal);
    }

    /**
     * Tác giả: Trường Đạt.
     * Phân biệt lỗi phiên bản với lỗi DB để hiển thị thông báo phù hợp.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    @ExceptionHandler(DataAccessException.class)
    public String database(DataAccessException problem, Model model, HttpServletResponse response, HttpServletRequest request,
                           @AuthenticationPrincipal AccountPrincipal principal) {
        boolean stale = problem instanceof OptimisticLockingFailureException;
        return error(stale ? 409 : 503, stale ? "Dữ liệu đã thay đổi. Hãy tải lại."
                : "Chưa thể đọc hoặc lưu dữ liệu. Hãy tải lại và kiểm tra kết quả trước khi gửi lại.", model, response, request, principal);
    }

    /**
     * Tác giả: Trường Đạt.
     * Phục hồi projection A01 cho Model lỗi và chọn view theo URL thao tác.
     * Thuộc DAT-04, các trang /job và duyệt tin /admin/job-review-*.
     */
    private String error(int status, String message, Model model, HttpServletResponse response, HttpServletRequest request,
                         AccountPrincipal principal) {
        response.setStatus(status);
        model.addAttribute("uiPreviewEnabled", false);
        // ExceptionHandler có Model riêng; phục hồi đúng projection A01 để header vẫn render được khi lỗi.
        model.addAttribute("authenticationEnabled", true);
        model.addAttribute("currentUser", principal == null ? null : new PageModelAdvice.CurrentUser(
                principal.getId(), principal.getUsername(), principal.getDisplayName(), principal.getHomeUrl()));
        model.addAttribute("pageError", message);
        String path = request.getRequestURI();
        if (path.contains("/admin/")) {
            return path.endsWith("job-review-queue") ? "pages/admin/job-review-queue" : "pages/admin/job-review-detail";
        }
        if (path.endsWith("/create")) {
            return "pages/job/create";
        }
        if (path.endsWith("/my-job")) {
            return "pages/job/my-job";
        }
        if (path.endsWith("/discover")) {
            return "pages/job/discover";
        }
        if (path.endsWith("/applicants")) {
            return "pages/job/applicants";
        }
        return "pages/job/detail";
    }
}
