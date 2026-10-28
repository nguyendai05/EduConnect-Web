package com.educonnect.job.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu biểu mẫu, không nhận danh tính người thao tác.
 * Thuộc trang: /job/detail.
 */
public class JobApplicationRequest {
    @NotNull
    @PositiveOrZero
    private Long jobVersion;
    @NotNull
    @DecimalMin("1")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal proposedUnitPrice;
    @NotBlank
    @Size(max = 5000)
    private String message;
    @AssertTrue(message = "Bạn cần đồng ý nội dung tin và đề xuất ứng tuyển.")
    private boolean consent;

    public Long getJobVersion() {
        return jobVersion;
    }

    public void setJobVersion(Long jobVersion) {
        this.jobVersion = jobVersion;
    }

    public BigDecimal getProposedUnitPrice() {
        return proposedUnitPrice;
    }

    public void setProposedUnitPrice(BigDecimal proposedUnitPrice) {
        this.proposedUnitPrice = proposedUnitPrice;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isConsent() {
        return consent;
    }

    public void setConsent(boolean consent) {
        this.consent = consent;
    }
}
