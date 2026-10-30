package com.educonnect.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DAI-02: form sửa hồ sơ cá nhân. Chỉ chứa trường được phép sửa; email, vai trò, trạng thái
 * và ID không nằm trong form nên không thể bị nâng quyền qua request.
 */
public class AccountProfileForm {
    @NotBlank(message = "Vui lòng nhập họ và tên.")
    @Size(min = 2, max = 120, message = "Họ và tên cần từ 2 đến 120 ký tự.")
    private String displayName;

    @Pattern(regexp = "^$|^(\\+84|0)[0-9 .-]{8,13}$", message = "Số điện thoại chưa đúng định dạng, ví dụ 0912 345 678.")
    @Size(max = 24, message = "Số điện thoại tối đa 24 ký tự.")
    private String phone;

    @Size(max = 1000, message = "Giới thiệu tối đa 1000 ký tự.")
    private String bio;

    /** SELF hoặc PARENT; chỉ áp dụng cho tài khoản có hồ sơ người học. */
    private String learnerKind;
    private Long gradeLevelId;
    private Long areaId;

    @NotNull(message = "Thiếu phiên bản hồ sơ, hãy tải lại trang.")
    private Long version;

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLearnerKind() { return learnerKind; }
    public void setLearnerKind(String learnerKind) { this.learnerKind = learnerKind; }
    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }
    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
