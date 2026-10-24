package com.educonnect.order.dto;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.order.domain.CartItem;
import java.math.BigDecimal;

public record CartItemDTO(Long id, Long offeringId, String title, String tutorName,
                          OfferingType offeringType, BigDecimal unitPrice, Short sessionCount,
                          Short durationMinutes, Integer seatCount, String termsText,
                          Long version, boolean changed, String issue) {
    public static CartItemDTO from(CartItem item, String issue) {
        Offering offering = item.getOfferingReference();
        return new CartItemDTO(item.getId(), offering.getId(), offering.getTitle(),
                offering.getTutorReference().getAccount().getDisplayName(), offering.getOfferingType(),
                offering.getUnitPrice(), offering.getSessionCount(), offering.getDurationMinutes(),
                item.getSeatCount(), offering.getTermsText(), offering.getVersion(),
                !offering.getVersion().equals(item.getOfferingVersionSeen()), issue);
    }

    public BigDecimal totalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(sessionCount)).multiply(BigDecimal.valueOf(seatCount));
    }

    public BigDecimal getTotalPrice() { return totalPrice(); }

    public String getOfferingTypeLabel() {
        return offeringType == OfferingType.GROUP_CLASS ? "Lớp nhóm" : "1 kèm 1";
    }
}
