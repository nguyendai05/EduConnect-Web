package com.educonnect.contract.dto;

import com.educonnect.contract.domain.ContractStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Một trang danh sách hợp đồng kèm số liệu cho ô thống kê và số đếm trên các tab trạng thái. */
public record ContractListDTO(List<ContractSummaryDTO> rows, int page, int totalPages, long totalElements,
        Map<ContractStatus, Long> counts, long all, long active, long needAction, BigDecimal totalValue) {

    public long count(String status) { return counts.getOrDefault(ContractStatus.valueOf(status), 0L); }

    public boolean hasPrevious() { return page > 0; }

    public boolean hasNext() { return page + 1 < totalPages; }
}
