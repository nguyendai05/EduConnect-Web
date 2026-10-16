package com.educonnect.order.domain;

/** Giá trị đóng theo CHECK của orders.status. */
public enum OrderStatus {
    AWAITING_PAYMENT, PAID, IN_PROGRESS, COMPLETED, CANCELLATION_PENDING, CANCELLED
}
