package com.educonnect.common.exception;

import com.educonnect.admin.web.AdminManagePageController;
import com.educonnect.admin.web.OfferingReviewPageController;
import com.educonnect.admin.web.TutorReviewPageController;
import com.educonnect.file.web.PrivateFileController;
import com.educonnect.tutor.web.TutorProfilePageController;
import com.educonnect.user.web.AccountPageController;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;

/** DAI-02: chuyển lỗi nghiệp vụ thành mã HTTP đúng (403/404/409...) cho các trang hồ sơ và duyệt gia sư. */
@ControllerAdvice(assignableTypes = {AccountPageController.class, TutorProfilePageController.class,
        TutorReviewPageController.class, AdminManagePageController.class, OfferingReviewPageController.class, PrivateFileController.class})
public class ProfileErrorAdvice {

    @ExceptionHandler(ServiceProblem.class)
    public void problem(ServiceProblem problem, HttpServletResponse response) throws IOException {
        response.sendError(problem.getStatus().value(), problem.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public String tooLarge(RedirectAttributes redirect) {
        redirect.addFlashAttribute("pageError", "Tệp vượt quá 5 MB. Hãy chọn tệp nhỏ hơn.");
        return "redirect:/tutor/my-profile";
    }
}
