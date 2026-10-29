package com.educonnect.contract.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/** Chi tiết hợp đồng cho học viên và gia sư của hợp đồng đó. */
public record ContractDetailDTO(Long id, String publicCode, String orderCode, String title, String learnerName,
        String tutorName, String typeLabel, BigDecimal unitPrice, short sessionCount, int seatCount, BigDecimal total,
        String terms, String statusLabel, Instant createdAt, Instant learnerAcceptedAt, Instant tutorAcceptedAt,
        boolean payable, boolean canCancel, List<SessionDTO> sessions, boolean viewerIsTutor, MoneyDTO money,
        List<ActivityDTO> activities) {

    /** Một mốc trong hoạt động gần đây của hợp đồng. */
    public record ActivityDTO(Instant at, String text) {}

    /** Một buổi học; canAttend cho gia sư (buổi kế tiếp), canConfirm cho học viên (buổi đã điểm danh). */
    public record SessionDTO(Long id, int number, BigDecimal amount, String statusLabel, Instant attendedAt,
            boolean canAttend, boolean canConfirm) {}


    /**
     * Tiền của hợp đồng. Phần của gia sư là số thực nhận (sau phí nền tảng, làm tròn từng buổi);
     * phần của học viên là số tiền gốc: đã giải ngân cho gia sư và đang ký quỹ.
     */
    public record MoneyDTO(BigDecimal feePercent, BigDecimal feeTotal, BigDecimal netTotal, BigDecimal releasedNet,
            BigDecimal remainingNet, BigDecimal releasedGross, BigDecimal heldGross, BigDecimal refundedGross,
            int doneSessions, int totalSessions) {}

    /** viewerId là người đang xem: gia sư thấy nút điểm danh, học viên thấy nút xác nhận buổi và nút hủy (khi chờ thanh toán). */
    public static ContractDetailDTO from(Contract contract, Long viewerId, List<ContractSession> sessions) {
        OrderItem item = contract.getOrderItemReference();
        String status = switch (contract.getStatus()) {
            case AWAITING_PAYMENT -> "Chờ thanh toán";
            case ACTIVE -> "Đang thực hiện";
            case COMPLETED -> "Đã hoàn thành";
            case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
            case CANCELLED -> "Đã hủy";
        };
        return new ContractDetailDTO(contract.getId(), contract.getPublicCode(), item.getOrderReference().getPublicCode(),
                item.getTitleSnapshot(), contract.getLearnerReference().getAccount().getDisplayName(),
                contract.getTutorReference().getAccount().getDisplayName(),
                item.getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS ? "Lớp nhóm" : "Dịch vụ 1 kèm 1",
                item.getUnitPriceSnapshot(), item.getSessionCountSnapshot(), item.getSeatCount(), item.getLineTotal(),
                contract.getAgreedTermsText(), status, contract.getCreatedAt(), contract.getLearnerAcceptedAt(),
                contract.getTutorAcceptedAt(), contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                        && item.getOrderReference().getStatus() == OrderStatus.AWAITING_PAYMENT,
                contract.getStatus() == ContractStatus.AWAITING_PAYMENT && contract.getLearnerId().equals(viewerId),
                sessionRows(contract, viewerId, sessions), contract.getTutorId().equals(viewerId), money(item, sessions),
                activities(contract, sessions));
    }

    /** Hoạt động gần đây suy ra từ mốc thời gian của hợp đồng và các buổi học, mới nhất trước, tối đa 8 mốc. */
    private static List<ActivityDTO> activities(Contract contract, List<ContractSession> sessions) {
        List<ActivityDTO> list = new java.util.ArrayList<>();
        list.add(new ActivityDTO(contract.getCreatedAt(), "Hợp đồng được tạo"));
        for (ContractSession s : sessions) {
            if (s.getAttendedAt() != null) {
                list.add(new ActivityDTO(s.getAttendedAt(), "Gia sư điểm danh buổi "
                        + s.getSessionNumber() + (s.isAbsent() ? " (học viên vắng)" : "")));
            }
            if (s.getConfirmedAt() != null) {
                list.add(new ActivityDTO(s.getConfirmedAt(), "Buổi " + s.getSessionNumber() + " được xác nhận, tiền đã giải ngân"));
            }
        }
        if (contract.getCompletedAt() != null) list.add(new ActivityDTO(contract.getCompletedAt(), "Hợp đồng hoàn thành"));
        return list.stream().sorted(java.util.Comparator.comparing(ActivityDTO::at).reversed()).limit(8).toList();
    }

    /** Tính tiền theo từng buổi; chưa thanh toán (chưa có buổi) thì chia đều theo số buổi của hợp đồng. */
    private static MoneyDTO money(OrderItem item, List<ContractSession> sessions) {
        BigDecimal rate = item.getFeeRateSnapshot();
        BigDecimal each = item.getLineTotal().divide(BigDecimal.valueOf(item.getSessionCountSnapshot()));
        BigDecimal feeTotal = BigDecimal.ZERO, netTotal = BigDecimal.ZERO, releasedNet = BigDecimal.ZERO;
        BigDecimal remainingNet = BigDecimal.ZERO, releasedGross = BigDecimal.ZERO, heldGross = BigDecimal.ZERO;
        BigDecimal refundedGross = BigDecimal.ZERO;
        int done = 0, count = sessions.isEmpty() ? item.getSessionCountSnapshot() : sessions.size();
        for (int i = 0; i < count; i++) {
            BigDecimal amount = sessions.isEmpty() ? each : sessions.get(i).getAmount();
            ContractSessionStatus state = sessions.isEmpty() ? ContractSessionStatus.HELD : sessions.get(i).getStatus();
            BigDecimal fee = amount.multiply(rate).setScale(0, RoundingMode.HALF_UP);
            BigDecimal net = amount.subtract(fee);
            if (state == ContractSessionStatus.REFUNDED) {
                refundedGross = refundedGross.add(amount);
                continue;
            }
            feeTotal = feeTotal.add(fee);
            netTotal = netTotal.add(net);
            if (state == ContractSessionStatus.RELEASED) {
                done++;
                releasedNet = releasedNet.add(net);
                releasedGross = releasedGross.add(amount);
            } else {
                remainingNet = remainingNet.add(net);
                heldGross = heldGross.add(amount);
            }
        }
        BigDecimal percent = rate.multiply(BigDecimal.valueOf(100)).stripTrailingZeros();
        return new MoneyDTO(percent.scale() < 0 ? percent.setScale(0) : percent, feeTotal, netTotal, releasedNet,
                remainingNet, releasedGross, heldGross, refundedGross, done, count);
    }

    private static List<SessionDTO> sessionRows(Contract contract, Long viewerId, List<ContractSession> sessions) {
        boolean active = contract.getStatus() == ContractStatus.ACTIVE;
        boolean tutor = contract.getTutorId().equals(viewerId);
        boolean learner = contract.getLearnerId().equals(viewerId);
        Long nextId = sessions.stream().filter(x -> x.getStatus() == ContractSessionStatus.HELD)
                .map(ContractSession::getId).findFirst().orElse(null);
        return sessions.stream().map(x -> new SessionDTO(x.getId(), x.getSessionNumber(), x.getAmount(), (x.isAbsent() ? "Vắng · " : "") + switch (x.getStatus()) {
            case HELD -> "Chưa học";
            case ATTENDED -> "Chờ học viên xác nhận";
            case RELEASED -> "Đã giải ngân";
            case REFUNDED -> "Đã hoàn tiền";
        }, x.getAttendedAt(), active && tutor && x.getId().equals(nextId),
                active && learner && x.getStatus() == ContractSessionStatus.ATTENDED)).toList();
    }
}
