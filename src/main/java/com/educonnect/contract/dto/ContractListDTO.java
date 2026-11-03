package com.educonnect.contract.dto;

import com.educonnect.contract.domain.ContractStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Một trang danh sách hợp đồng kèm số liệu cho ô thống kê và số đếm trên các tab trạng thái. */
public record ContractListDTO(
        List<ContractSummaryDTO> rows, // Danh sách các dòng dữ liệu để hiển thị.
        int page, // Chỉ số trang hiện tại, bắt đầu từ 0.
        int totalPages, // Tổng số trang kết quả.
        long totalElements, // Tổng số kết quả trên tất cả các trang.
        Map<ContractStatus, Long> counts, // Số bản ghi theo từng trạng thái.
        long all, // Tổng số bản ghi ở tất cả trạng thái.
        long active, // Số hợp đồng đang được thực hiện.
        long needAction, // Số hợp đồng cần người xem thực hiện thao tác.
        BigDecimal totalValue // Tổng giá trị tiền của các bản ghi được thống kê.
) {

    public long count(String status) { return counts.getOrDefault(ContractStatus.valueOf(status), 0L); }

    public boolean hasPrevious() { return page > 0; }

    public boolean hasNext() { return page + 1 < totalPages; }
}
