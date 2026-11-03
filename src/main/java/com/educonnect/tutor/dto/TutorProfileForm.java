package com.educonnect.tutor.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/**
 * DAI-02: form hồ sơ gia sư. Không có trạng thái duyệt, vai trò hay ID: những giá trị đó chỉ do máy chủ quyết định.
 * Gửi kèm {@code userVersion}/{@code tutorVersion} vì form sửa cả user_accounts (giới thiệu) lẫn tutor_profiles.
 */
public class TutorProfileForm {
    @Size(max = 1000, message = "Giới thiệu tối đa 1000 ký tự.")
    private String bio; // Nội dung giới thiệu bản thân.

    @NotBlank(message = "Vui lòng nhập tiêu đề hồ sơ.")
    @Size(min = 5, max = 180, message = "Tiêu đề hồ sơ cần từ 5 đến 180 ký tự.")
    private String headline; // Tiêu đề giới thiệu ngắn của hồ sơ gia sư.

    @NotNull(message = "Vui lòng nhập số năm kinh nghiệm.")
    @Min(value = 0, message = "Số năm kinh nghiệm từ 0 đến 80.")
    @Max(value = 80, message = "Số năm kinh nghiệm từ 0 đến 80.")
    private Integer experienceYears; // Số năm kinh nghiệm giảng dạy của gia sư.

    private List<Long> subjectIds = new ArrayList<>(); // Danh sách ID môn gia sư có thể dạy.
    private List<Long> gradeLevelIds = new ArrayList<>(); // Danh sách ID cấp học.
    /** Môn/cấp học tự nhập (ngoài danh mục); mỗi tên đã chuẩn hóa ở CustomCatalogService. */
    private List<String> customSubjects = new ArrayList<>(); // Tên các môn học gia sư tự nhập ngoài danh mục.
    private List<String> customGradeLevels = new ArrayList<>(); // Tên các cấp học gia sư tự nhập ngoài danh mục.
    private List<Long> areaIds = new ArrayList<>(); // Danh sách ID khu vực gia sư có thể dạy.
    private List<Long> deliveryModeIds = new ArrayList<>(); // Danh sách ID hình thức gia sư có thể dạy.

    @NotNull(message = "Thiếu phiên bản hồ sơ, hãy tải lại trang.")
    private Long userVersion; // Phiên bản tài khoản để phát hiện cập nhật đồng thời.
    @NotNull(message = "Thiếu phiên bản hồ sơ, hãy tải lại trang.")
    private Long tutorVersion; // Phiên bản hồ sơ gia sư để phát hiện cập nhật đồng thời.

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public List<Long> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(List<Long> subjectIds) { this.subjectIds = subjectIds == null ? new ArrayList<>() : subjectIds; }
    public List<Long> getGradeLevelIds() { return gradeLevelIds; }
    public void setGradeLevelIds(List<Long> gradeLevelIds) { this.gradeLevelIds = gradeLevelIds == null ? new ArrayList<>() : gradeLevelIds; }
    public List<String> getCustomSubjects() { return customSubjects; }
    public void setCustomSubjects(List<String> customSubjects) { this.customSubjects = customSubjects == null ? new ArrayList<>() : customSubjects; }
    public List<String> getCustomGradeLevels() { return customGradeLevels; }
    public void setCustomGradeLevels(List<String> customGradeLevels) { this.customGradeLevels = customGradeLevels == null ? new ArrayList<>() : customGradeLevels; }
    public List<Long> getAreaIds() { return areaIds; }
    public void setAreaIds(List<Long> areaIds) { this.areaIds = areaIds == null ? new ArrayList<>() : areaIds; }
    public List<Long> getDeliveryModeIds() { return deliveryModeIds; }
    public void setDeliveryModeIds(List<Long> deliveryModeIds) { this.deliveryModeIds = deliveryModeIds == null ? new ArrayList<>() : deliveryModeIds; }
    public Long getUserVersion() { return userVersion; }
    public void setUserVersion(Long userVersion) { this.userVersion = userVersion; }
    public Long getTutorVersion() { return tutorVersion; }
    public void setTutorVersion(Long tutorVersion) { this.tutorVersion = tutorVersion; }
}
