package com.educonnect.wallet.dto;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

/** Số dư ví và một trang lịch sử biến động. */
public record WalletOverviewDTO(BigDecimal balance, Page<WalletEntryDTO> entries) {}
