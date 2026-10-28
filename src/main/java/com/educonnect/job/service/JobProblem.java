package com.educonnect.job.service;

import org.springframework.http.HttpStatus;

/**
 * Tác giả: Trường Đạt.
 * Lỗi nghiệp vụ DAT-04 có mã HTTP rõ ràng.
 */
public class JobProblem extends RuntimeException {
    private final HttpStatus status;

    public JobProblem(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
