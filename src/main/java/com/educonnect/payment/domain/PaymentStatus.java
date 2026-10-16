package com.educonnect.payment.domain;

/** Giá trị đóng theo CHECK của payments.status. */
public enum PaymentStatus {
    PENDING, FUNDED, FAILED, CANCELLED, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED
}
