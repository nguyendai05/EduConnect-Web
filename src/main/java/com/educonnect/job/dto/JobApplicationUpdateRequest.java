package com.educonnect.job.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** Biểu mẫu gia sư sửa giá và lời nhắn của đề xuất ứng tuyển đang chờ; mang phiên bản tin và ứng tuyển đang xem. */
public class JobApplicationUpdateRequest {
    @NotNull
    @PositiveOrZero
    private Long jobVersion; // Phiên bản tin tìm gia sư để phát hiện cập nhật đồng thời.

    @NotNull
    @PositiveOrZero
    private Long applicationVersion; // Phiên bản đơn ứng tuyển để phát hiện cập nhật đồng thời.

    @NotNull
    @DecimalMin("1")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal proposedUnitPrice; // Học phí mỗi buổi được đề xuất khi thương lượng.

    @NotBlank
    @Size(max = 5000)
    private String message; // Lời nhắn gia sư gửi khi ứng tuyển.

    public Long getJobVersion() { return jobVersion; }
    public void setJobVersion(Long jobVersion) { this.jobVersion = jobVersion; }

    public Long getApplicationVersion() { return applicationVersion; }
    public void setApplicationVersion(Long applicationVersion) { this.applicationVersion = applicationVersion; }

    public BigDecimal getProposedUnitPrice() { return proposedUnitPrice; }
    public void setProposedUnitPrice(BigDecimal proposedUnitPrice) { this.proposedUnitPrice = proposedUnitPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
