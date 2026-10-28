package com.educonnect.invitation.service;

import org.springframework.http.HttpStatus;

/**
 * Tác giả: Trường Đạt.
 * Lỗi quyền, dữ liệu hoặc trạng thái của luồng lời mời.
 */
public class InvitationProblem extends RuntimeException {
    private final HttpStatus status;

    public InvitationProblem(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
