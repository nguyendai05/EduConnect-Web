package com.educonnect.contract.dto;

import java.math.BigDecimal;
import java.time.Instant;

/** Safe confirmation view; no managed entities or account credentials leave the service. */
public record ContractConfirmationDTO(Long id, Long cartItemId, Long version, String publicCode,
        String orderCode, Instant createdAt, String learnerName, String tutorName, String title,
        String typeLabel, BigDecimal unitPrice, short sessionCount, int seatCount,
        BigDecimal total, String terms, String statusLabel, boolean payable) {
    public boolean isDraft() { return id == null; }
}
