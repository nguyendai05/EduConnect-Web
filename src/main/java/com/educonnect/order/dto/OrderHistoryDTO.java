package com.educonnect.order.dto;

import com.educonnect.order.domain.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Một trang lịch sử đơn kèm số liệu cho ô thống kê và số đếm trên các tab trạng thái. */
public record OrderHistoryDTO(
        List<OrderRowDTO> rows, // Danh sách các dòng dữ liệu để hiển thị.
        int page, // Chỉ số trang hiện tại, bắt đầu từ 0.
        int totalPages, // Tổng số trang kết quả.
        long totalElements, // Tổng số kết quả trên tất cả các trang.
        Map<OrderStatus, Long> counts, // Số bản ghi theo từng trạng thái.
        long all, // Tổng số bản ghi ở tất cả trạng thái.
        BigDecimal totalValue, // Tổng giá trị tiền của các bản ghi được thống kê.
        long pending // Số đơn hàng đang chờ thanh toán.
) {

    public long count(String status) { return counts.getOrDefault(OrderStatus.valueOf(status), 0L); }

    public boolean hasPrevious() { return page > 0; }

    public boolean hasNext() { return page + 1 < totalPages; }
}
