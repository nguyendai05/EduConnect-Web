package com.educonnect.lesson.service;

import org.springframework.http.HttpStatus;

/**
 * Lỗi nghiệp vụ có thể hiển thị cho người dùng.
 * <p>Tác giả: Trường Đạt.</p>
 * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}).</p>
 */
public class OfferingProblem extends RuntimeException {

    private final HttpStatus status;

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Tạo lỗi nghiệp vụ chứa mã trạng thái HTTP và thông báo để controller
     * trả phản hồi phù hợp khi thao tác quản lý dịch vụ/lớp không hợp lệ.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}).</p>
     */
    public OfferingProblem(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    /**
     * Tác giả: Trường Đạt.
     * <p>Chức năng: Trả mã trạng thái HTTP của lỗi để controller đặt mã phản hồi cho trang.</p>
     * <p>Thuộc trang: Quản lý dịch vụ/lớp của gia sư ({@code /tutor/manage}), hiển thị lỗi thao tác.</p>
     */
    public HttpStatus getStatus() {
        return status;
    }
}
