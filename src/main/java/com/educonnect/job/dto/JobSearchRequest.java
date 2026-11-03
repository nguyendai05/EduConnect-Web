package com.educonnect.job.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Tác giả: Trường Đạt.
 * DAT-04: dữ liệu biểu mẫu, không nhận danh tính người thao tác.
 * Thuộc trang: /job/discover, /job/my-job và /admin/job-review-queue.
 */
public class JobSearchRequest {
    @Size(max = 200)
    private String q; // Từ khóa tìm kiếm.
    @Positive
    private Long subjectId; // ID môn học.
    @Positive
    private Long gradeLevelId; // ID cấp học.
    @Positive
    private Long areaId; // ID khu vực học.
    @Positive
    private Long deliveryModeId; // ID hình thức học.
    @DecimalMin("0")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal minPrice; // Mức giá tối thiểu dùng để lọc kết quả.
    @DecimalMin("0")
    @Digits(integer = 19, fraction = 0)
    private BigDecimal maxPrice; // Mức giá tối đa dùng để lọc kết quả.
    @NotNull
    @Pattern(regexp = "newest|budget-asc|budget-desc")
    private String sort = "newest"; // Tiêu chí sắp xếp kết quả tìm kiếm.
    @Min(0)
    @Max(100000)
    private int page; // Chỉ số trang hiện tại, bắt đầu từ 0.
    @Min(1)
    @Max(48)
    private int size = 12; // Số kết quả tối đa trên mỗi trang.

    @AssertTrue(message = "Giá tối thiểu không được lớn hơn giá tối đa.")
    public boolean isPriceRangeValid() {
        return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <= 0;
    }

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getGradeLevelId() {
        return gradeLevelId;
    }

    public void setGradeLevelId(Long gradeLevelId) {
        this.gradeLevelId = gradeLevelId;
    }

    public Long getAreaId() {
        return areaId;
    }

    public void setAreaId(Long areaId) {
        this.areaId = areaId;
    }

    public Long getDeliveryModeId() {
        return deliveryModeId;
    }

    public void setDeliveryModeId(Long deliveryModeId) {
        this.deliveryModeId = deliveryModeId;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }

    public BigDecimal getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
