package com.educonnect.contract.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.domain.ContractStatusHistory;
import com.educonnect.contract.repository.ContractStatusHistoryJpaRepository;
import com.educonnect.order.domain.Order;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.order.domain.OrderStatusHistory;
import com.educonnect.order.repository.OrderStatusHistoryJpaRepository;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;

/** Đổi trạng thái đơn/hợp đồng và ghi lịch sử trong cùng giao dịch. */
@Component
@Profile("db-dev")
public class StatusRecorder {
    private OrderStatusHistoryJpaRepository orderHistory;
    private ContractStatusHistoryJpaRepository contractHistory;
    private EntityManager entityManager;

    public StatusRecorder(OrderStatusHistoryJpaRepository orderHistory, ContractStatusHistoryJpaRepository contractHistory,
                          EntityManager entityManager) {
        this.orderHistory = orderHistory;
        this.contractHistory = contractHistory;
        this.entityManager = entityManager;
    }

    /**
     * Đổi trạng thái đơn. Lịch sử đơn chỉ ghi khi có vai trò người thao tác (actorRole != null),
     * vì bảng chuyển trạng thái chỉ cho phép một số cặp theo vai trò.
     */
    public void order(Order order, OrderStatus to, Long actorId, String actorRole, String reason, Instant now) {
        String from = order.getStatus().name();
        order.setStatus(to);
        order.setUpdatedAt(now);
        if (to == OrderStatus.CANCELLED) {
            order.setCancelledAt(now);
            order.setCancellationReason(reason);
        }
        if (actorRole == null) return;
        entityManager.flush(); // để @Version tăng, mỗi lần đổi có một entity_version riêng
        OrderStatusHistory h = OrderStatusHistory.create();
        h.setOrderId(order.getId());
        h.setFromStatus(from);
        h.setToStatus(to.name());
        h.setActorUserId(actorId);
        h.setActorRoleCode(actorRole);
        h.setReason(reason);
        h.setEntityVersion(order.getVersion());
        h.setChangedAt(now);
        orderHistory.save(h);
    }

    /** Đổi trạng thái hợp đồng và ghi lịch sử. */
    public void contract(Contract contract, ContractStatus to, Long actorId, String reason, Instant now) {
        String from = contract.getStatus().name();
        contract.setStatus(to);
        entityManager.flush();
        ContractStatusHistory h = ContractStatusHistory.create();
        h.setContractId(contract.getId());
        h.setFromStatus(from);
        h.setToStatus(to.name());
        h.setActorUserId(actorId);
        h.setReason(reason);
        h.setEntityVersion(contract.getVersion());
        h.setChangedAt(now);
        contractHistory.save(h);
    }
}
