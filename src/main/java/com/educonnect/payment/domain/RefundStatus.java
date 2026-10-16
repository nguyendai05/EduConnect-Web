package com.educonnect.payment.domain;

/** Giá trị đóng theo CHECK của refunds.status. */
public enum RefundStatus {
    REQUESTED, PROCESSING, SUCCEEDED, FAILED, REJECTED
}
