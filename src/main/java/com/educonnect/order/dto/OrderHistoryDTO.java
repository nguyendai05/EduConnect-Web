package com.educonnect.order.dto;

import com.educonnect.order.domain.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Một trang lịch sử đơn kèm số liệu cho ô thống kê và số đếm trên các tab trạng thái. */
public record OrderHistoryDTO(List<OrderRowDTO> rows, int page, int totalPages, long totalElements,
        Map<OrderStatus, Long> counts, long all, BigDecimal totalValue, long pending) {

    public long count(String status) { return counts.getOrDefault(OrderStatus.valueOf(status), 0L); }

    public boolean hasPrevious() { return page > 0; }

    public boolean hasNext() { return page + 1 < totalPages; }
}
