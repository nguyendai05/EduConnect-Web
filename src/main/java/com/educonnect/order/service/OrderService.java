package com.educonnect.order.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.order.domain.OrderStatus;
import com.educonnect.order.domain.RegistrationSourceKind;
import com.educonnect.order.dto.OrderHistoryDTO;
import com.educonnect.order.dto.OrderRowDTO;
import com.educonnect.security.AccountPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Lịch sử đơn đăng ký của người học. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class OrderService {
    private static final int PAGE_SIZE = 10;
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private ContractJpaRepository contracts;

    public OrderService(ContractJpaRepository contracts) { this.contracts = contracts; }

    /**
     * Lịch sử đơn của chính người đăng nhập: số liệu tính trên mọi đơn, danh sách lọc theo trạng thái, từ khóa
     * (mã đơn, tên dịch vụ, gia sư; không phân biệt dấu), nguồn và khoảng ngày tạo; mỗi trang 10 đơn.
     */
    public OrderHistoryDTO history(AccountPrincipal user, OrderStatus status, String query, RegistrationSourceKind source,
                                   LocalDate from, LocalDate to, boolean oldestFirst, int page) {
        List<Contract> all = contracts.findLatestByLearnerId(user.getId());
        Map<OrderStatus, Long> counts = new EnumMap<>(OrderStatus.class);
        BigDecimal total = BigDecimal.ZERO;
        for (Contract c : all) {
            counts.merge(c.getOrderItemReference().getOrderReference().getStatus(), 1L, Long::sum);
            total = total.add(c.getOrderItemReference().getOrderReference().getTotalAmount());
        }
        String needle = fold(query);
        Comparator<OrderRowDTO> order = Comparator.comparing(OrderRowDTO::createdAt);
        List<OrderRowDTO> filtered = all.stream()
                .filter(c -> status == null || c.getOrderItemReference().getOrderReference().getStatus() == status)
                .filter(c -> source == null || c.getOrderItemReference().getRegistrationSourceReference().getSourceKind() == source)
                .map(OrderRowDTO::from)
                .filter(r -> needle.isEmpty() || fold(r.orderCode() + " " + r.title() + " " + r.tutorName()).contains(needle))
                .filter(r -> from == null || !r.createdAt().atZone(ZONE).toLocalDate().isBefore(from))
                .filter(r -> to == null || !r.createdAt().atZone(ZONE).toLocalDate().isAfter(to))
                .sorted(oldestFirst ? order : order.reversed()).toList();
        int pages = Math.max(1, (filtered.size() + PAGE_SIZE - 1) / PAGE_SIZE);
        int current = Math.min(Math.max(page, 0), pages - 1);
        List<OrderRowDTO> rows = filtered.subList(current * PAGE_SIZE, Math.min(filtered.size(), (current + 1) * PAGE_SIZE));
        long pending = counts.getOrDefault(OrderStatus.AWAITING_PAYMENT, 0L) + counts.getOrDefault(OrderStatus.CANCELLATION_PENDING, 0L);
        return new OrderHistoryDTO(rows, current, pages, filtered.size(), counts, all.size(), total, pending);
    }

    /** Bỏ dấu và hoa thường để tìm kiếm tiếng Việt. */
    private static String fold(String text) {
        if (text == null) return "";
        return Normalizer.normalize(text.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "").replace('đ', 'd').replace('Đ', 'D')
                .toLowerCase(Locale.ROOT);
    }
}
