package com.educonnect.tutor.service;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.lesson.service.OfferingProblem;
import com.educonnect.tutor.dto.PublicTutorProfileDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * DAI-02: hồ sơ công khai của gia sư. Chỉ gia sư đã được duyệt, tài khoản hoạt động và đã xác minh email mới xem được
 * (cùng điều kiện với kết quả tìm kiếm); các trường chọn từ danh mục lấy theo tên hiển thị.
 */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class PublicTutorProfileService {
    private final TutorDiscoveryService discovery;
    private final JdbcTemplate jdbc;

    public PublicTutorProfileService(TutorDiscoveryService discovery, JdbcTemplate jdbc) {
        this.discovery = discovery;
        this.jdbc = jdbc;
    }

    public PublicTutorProfileDTO profile(Long id, int page) {
        com.educonnect.tutor.dto.TutorProfileResponse base;
        try {
            base = discovery.profile(id, page, 6);
        } catch (OfferingProblem problem) {
            throw new ServiceProblem(problem.getStatus(), problem.getMessage());
        }
        String bio = jdbc.queryForObject("SELECT bio FROM user_accounts WHERE id = ?", String.class, id);
        return new PublicTutorProfileDTO(base.id(), base.displayName(), base.headline(), base.experienceYears(),
                bio == null || bio.isBlank() ? null : bio.strip(),
                names("SELECT s.name FROM tutor_subjects x JOIN subjects s ON s.id = x.subject_id WHERE x.tutor_id = ? ORDER BY s.id", id),
                names("SELECT g.name FROM tutor_grade_levels x JOIN grade_levels g ON g.id = x.grade_level_id WHERE x.tutor_id = ? ORDER BY g.id", id),
                names("SELECT a.name FROM tutor_areas x JOIN areas a ON a.id = x.area_id WHERE x.tutor_id = ? ORDER BY a.id", id),
                names("SELECT d.name FROM tutor_delivery_modes x JOIN delivery_modes d ON d.id = x.delivery_mode_id WHERE x.tutor_id = ? ORDER BY d.id", id),
                base.offerings());
    }

    private List<String> names(String sql, Long id) {
        return jdbc.queryForList(sql, String.class, id);
    }
}
