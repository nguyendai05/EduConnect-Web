package com.educonnect.payment.domain;

/** Giá trị đóng theo CHECK của payment_attempts.status. */
public enum PaymentAttemptStatus {
    PENDING, SUCCEEDED, FAILED, CANCELLED, EXPIRED
}
