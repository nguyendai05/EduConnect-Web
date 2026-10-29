package com.educonnect.wallet.dto;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

/**
 * Số dư ví và một trang lịch sử biến động. Số thứ hai phụ thuộc vai trò: học viên là tiền đang ký quỹ,
 * gia sư là tiền chờ giải ngân; vai trò khác thì secondLabel là null.
 */
public record WalletOverviewDTO(BigDecimal balance, String secondLabel, String secondHint, BigDecimal secondAmount,
        Page<WalletEntryDTO> entries) {}
