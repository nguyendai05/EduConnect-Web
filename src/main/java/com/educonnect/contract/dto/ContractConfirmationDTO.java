package com.educonnect.contract.dto;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.invitation.dto.InvitationSourceResponse;
import com.educonnect.job.dto.JobSourceResponse;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.order.domain.CartItem;
import com.educonnect.order.domain.OrderItem;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

/** Safe confirmation view; no managed entities or account credentials leave the service. */
public record ContractConfirmationDTO(
        Long id, // ID hợp đồng; null khi mới là bản dự thảo.
        Long cartItemId, // ID mục trong giỏ hàng dùng để tạo hợp đồng.
        Long invitationId, // ID lời mời học làm nguồn tạo hợp đồng.
        Long jobId, // ID tin tìm gia sư làm nguồn tạo hợp đồng.
        Long applicationId, // ID đơn ứng tuyển của gia sư.
        Long applicationVersion, // Phiên bản đơn ứng tuyển để phát hiện cập nhật đồng thời.
        Long version, // Phiên bản hợp đồng hoặc nguồn dự thảo để phát hiện thay đổi khi xác nhận.
        String publicCode, // Mã công khai dùng để hiển thị và tra cứu.
        String orderCode, // Mã đơn hàng hiển thị cho người dùng.
        Instant createdAt, // Thời điểm tạo bản ghi.
        String learnerName, // Tên hiển thị của học viên.
        String tutorName, // Tên hiển thị của gia sư.
        String title, // Tiêu đề hiển thị.
        String typeLabel, // Tên loại hình học để hiển thị.
        BigDecimal unitPrice, // Học phí mỗi buổi cho một chỗ học.
        short sessionCount, // Tổng số buổi học.
        int seatCount, // Số chỗ học đăng ký trong hợp đồng hoặc giỏ hàng.
        BigDecimal total, // Tổng số tiền.
        String terms, // Nội dung điều khoản đã thống nhất trong hợp đồng.
        String statusLabel, // Tên trạng thái để hiển thị trên giao diện.
        boolean payable // Cho biết có thể thanh toán hợp đồng hay không.
) {
    public boolean isDraft() { return id == null; }

    public static ContractConfirmationDTO draft(CartItem item, String learnerName) {
        Offering offering = item.getOfferingReference();
        BigDecimal total = offering.getUnitPrice().multiply(BigDecimal.valueOf(offering.getSessionCount()))
                .multiply(BigDecimal.valueOf(item.getSeatCount()));
        String type = offering.getOfferingType() == OfferingType.GROUP_CLASS ? "Lớp nhóm" : "Dạy kèm 1-1";
        return new ContractConfirmationDTO(null, item.getId(), null, null, null, null, offering.getVersion(), "Chưa tạo", "Chưa tạo",
                null, learnerName, offering.getTutorReference().getAccount().getDisplayName(),
                offering.getTitle(), type, offering.getUnitPrice(),
                offering.getSessionCount(), item.getSeatCount(), total, offering.getTermsText(),
                "Chưa xác nhận", false);
    }

    /** Dự thảo từ lời mời đã chấp thuận: 1 kèm 1, 1 chỗ. */
    public static ContractConfirmationDTO draftInvitation(InvitationSourceResponse src, String subject,
            String learnerName, String tutorName) {
        BigDecimal total = src.unitPrice().multiply(BigDecimal.valueOf(src.sessionCount()));
        return new ContractConfirmationDTO(null, null, src.sourceId(), null, null, null, src.sourceVersion(), "Chưa tạo", "Chưa tạo",
                null, learnerName, tutorName, "Lời mời học " + subject, "Dạy kèm 1-1", src.unitPrice(),
                src.sessionCount(), 1, total, src.termsText(), "Chưa xác nhận", false);
    }

    /** Dự thảo từ tin đã chọn gia sư: 1 kèm 1, 1 chỗ. */
    public static ContractConfirmationDTO draftJob(JobSourceResponse src, String title,
            String learnerName, String tutorName) {
        BigDecimal total = src.unitPrice().multiply(BigDecimal.valueOf(src.sessionCount()));
        return new ContractConfirmationDTO(null, null, null, src.sourceId(), src.applicationId(),
                src.applicationVersion(), src.sourceVersion(), "Chưa tạo", "Chưa tạo", null, learnerName, tutorName,
                title, "Dạy kèm 1-1", src.unitPrice(), src.sessionCount(), 1, total, src.termsText(),
                "Chưa xác nhận", false);
    }

    public static ContractConfirmationDTO from(Contract contract, String learnerName) {
        OrderItem item = contract.getOrderItemReference();
        return new ContractConfirmationDTO(contract.getId(), null, null, null, null, null, contract.getVersion(), contract.getPublicCode(),
                item.getOrderReference().getPublicCode(), contract.getCreatedAt(), learnerName,
                contract.getTutorReference().getAccount().getDisplayName(), item.getTitleSnapshot(),
                item.getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS ? "Lớp nhóm" : "Dạy kèm 1-1",
                item.getUnitPriceSnapshot(), item.getSessionCountSnapshot(), item.getSeatCount(),
                item.getLineTotal(), contract.getAgreedTermsText(), switch (contract.getStatus()) {
                    case AWAITING_PAYMENT -> "Chờ thanh toán";
                    case ACTIVE -> "Đang thực hiện";
                    case COMPLETED -> "Đã hoàn thành";
                    case CANCELLATION_PENDING -> "Đang yêu cầu hủy";
                    case CANCELLED -> "Đã hủy";
                }, contract.getStatus() == ContractStatus.AWAITING_PAYMENT
                        && item.getOrderReference().getStatus() == OrderStatus.AWAITING_PAYMENT);
    }
}
