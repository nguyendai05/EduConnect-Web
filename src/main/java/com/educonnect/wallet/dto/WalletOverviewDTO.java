package com.educonnect.wallet.dto;

import com.educonnect.contract.dto.ContractSummaryDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

/**
 * Số dư ví, hai số phụ theo vai trò (học viên: đang ký quỹ và đã hoàn tiền; gia sư: chờ giải ngân và tổng đã nhận),
 * vài hợp đồng liên quan và một trang lịch sử biến động. Vai trò khác thì các số phụ là null.
 */
public record WalletOverviewDTO(String ownerName, String ownerRole, BigDecimal balance,
        String secondLabel, String secondHint, BigDecimal secondAmount,
        String thirdLabel, String thirdHint, BigDecimal thirdAmount,
        List<ContractSummaryDTO> contracts, Page<WalletEntryDTO> entries) {}
