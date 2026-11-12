package com.educonnect.lesson.dto;

import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;

/** DTO nhận các bộ lọc từ form GET. */
public class OfferingFilterRequest {

    private OfferingType type; // Loại dịch vụ: dạy kèm 1-1 hoặc lớp nhóm.
    private OfferingStatus status; // Trạng thái hiện tại.
    private String q = ""; // Từ khóa tìm kiếm.

    public OfferingType getType() {
        return type;
    }

    public void setType(OfferingType type) {
        this.type = type;
    }

    public OfferingStatus getStatus() {
        return status;
    }

    public void setStatus(OfferingStatus status) {
        this.status = status;
    }

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }
}
