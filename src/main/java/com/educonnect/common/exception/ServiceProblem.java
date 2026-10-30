package com.educonnect.common.exception;

import org.springframework.http.HttpStatus;

/** Lỗi nghiệp vụ có thể hiển thị cho người dùng cùng mã HTTP phù hợp. DAI-02. */
public class ServiceProblem extends RuntimeException {
    private final HttpStatus status;

    public ServiceProblem(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }

    public static ServiceProblem forbidden(String message) { return new ServiceProblem(HttpStatus.FORBIDDEN, message); }
    public static ServiceProblem notFound(String message) { return new ServiceProblem(HttpStatus.NOT_FOUND, message); }
    public static ServiceProblem conflict(String message) { return new ServiceProblem(HttpStatus.CONFLICT, message); }
    public static ServiceProblem invalid(String message) { return new ServiceProblem(HttpStatus.BAD_REQUEST, message); }
}
