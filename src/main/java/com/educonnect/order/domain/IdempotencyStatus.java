package com.educonnect.order.domain;

/** Giá trị đóng theo CHECK của idempotency_records.status. */
public enum IdempotencyStatus {
    PROCESSING, COMPLETED, FAILED
}
