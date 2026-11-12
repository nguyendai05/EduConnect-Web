package com.educonnect.wallet.dto;

import com.educonnect.contract.dto.ContractSummaryDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

/**
 * Số dư ví, hai số phụ theo vai trò (học viên: đang ký quỹ và đã hoàn tiền; gia sư: chờ giải ngân và tổng đã nhận),
 * vài hợp đồng liên quan và một trang lịch sử biến động. Vai trò khác thì các số phụ là null.
 */
public record WalletOverviewDTO(
        String ownerName, // Tên chủ ví.
        String ownerRole, // Vai trò của chủ ví dùng để chọn số liệu hiển thị.
        BigDecimal balance, // Số dư hiện tại của ví.
        String secondLabel, // Tiêu đề ô thống kê thứ hai của ví.
        String secondHint, // Nội dung giải thích ô thống kê thứ hai của ví.
        BigDecimal secondAmount, // Số tiền ở ô thống kê thứ hai: đang ký quỹ hoặc chờ giải ngân, tùy vai trò.
        String thirdLabel, // Tiêu đề ô thống kê thứ ba của ví.
        String thirdHint, // Nội dung giải thích ô thống kê thứ ba của ví.
        BigDecimal thirdAmount, // Số tiền ở ô thống kê thứ ba: đã hoàn tiền hoặc tổng đã nhận, tùy vai trò.
        List<ContractSummaryDTO> contracts, // Danh sách hợp đồng liên quan đến ví.
        Page<WalletEntryDTO> entries // Trang lịch sử biến động số dư ví.
) {}
