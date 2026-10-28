package com.educonnect.order.service;

import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.order.dto.OrderRowDTO;
import com.educonnect.security.AccountPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lịch sử đơn đăng ký của người học. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class OrderService {
    private ContractJpaRepository contracts;

    public OrderService(ContractJpaRepository contracts) { this.contracts = contracts; }

    /** Lấy một trang đơn của chính người đăng nhập, lọc theo trạng thái (null = tất cả), 10 đơn mỗi trang. */
    public Page<OrderRowDTO> history(AccountPrincipal user, OrderStatus status, int page) {
        return contracts.findHistory(user.getId(), status, PageRequest.of(Math.max(page, 0), 10)).map(OrderRowDTO::from);
    }
}
