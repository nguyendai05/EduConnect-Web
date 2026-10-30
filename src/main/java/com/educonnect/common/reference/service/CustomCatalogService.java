package com.educonnect.common.reference.service;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.common.reference.domain.GradeLevel;
import com.educonnect.common.reference.domain.Subject;
import com.educonnect.common.reference.repository.GradeLevelJpaRepository;
import com.educonnect.common.reference.repository.SubjectJpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Môn học và cấp học do người dùng tự thêm (ngoài danh mục hệ thống). Dùng chung cho hồ sơ gia sư, dịch vụ/lớp
 * và tin tìm gia sư: cùng một tên chỉ có một mục (so khớp không phân biệt hoa/thường và dấu), mục mới được tạo
 * kèm người tạo để giới hạn số lượng mỗi người và truy vết.
 */
@Service
@Profile("db-dev")
public class CustomCatalogService {
    public static final int MAX_SUBJECTS_PER_USER = 10;
    public static final int MAX_GRADES_PER_USER = 5;
    private static final int MIN_LENGTH = 2;
    private static final int MAX_LENGTH = 60;
    private static final Pattern ALLOWED = Pattern.compile("^[\\p{L}\\p{N}][\\p{L}\\p{N} .+&()/'’-]*$");

    private final SubjectJpaRepository subjects;
    private final GradeLevelJpaRepository grades;

    public CustomCatalogService(SubjectJpaRepository subjects, GradeLevelJpaRepository grades) {
        this.subjects = subjects;
        this.grades = grades;
    }

    /** Chuẩn hóa tên người nhập: bỏ khoảng trắng thừa, kiểm độ dài và ký tự cho phép. */
    public static String clean(String raw, String label) {
        String name = raw == null ? "" : raw.strip().replaceAll("\\s+", " ");
        if (name.length() < MIN_LENGTH || name.length() > MAX_LENGTH) {
            throw ServiceProblem.invalid(label + " cần từ " + MIN_LENGTH + " đến " + MAX_LENGTH + " ký tự.");
        }
        if (!ALLOWED.matcher(name).matches()) {
            throw ServiceProblem.invalid(label + " chỉ gồm chữ, số và một số dấu câu thông dụng.");
        }
        return name;
    }

    /** Môn đã có cùng tên thì dùng lại, chưa có thì tạo mới cho người dùng này. */
    @Transactional
    public Subject subject(Long userId, String raw) {
        String name = clean(raw, "Tên môn học");
        var existing = subjects.findFirstByName(name);
        if (existing.isPresent()) return existing.get();
        if (subjects.countByCreatedBy(userId) >= MAX_SUBJECTS_PER_USER) {
            throw ServiceProblem.conflict("Bạn đã thêm tối đa " + MAX_SUBJECTS_PER_USER + " môn mới. Hãy chọn môn có sẵn.");
        }
        var created = Subject.create();
        created.setCode("TUTOR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        created.setName(name);
        created.setCreatedBy(userId);
        try {
            return subjects.saveAndFlush(created);
        } catch (DataIntegrityViolationException race) {
            throw ServiceProblem.conflict("Môn học này vừa được thêm bởi người khác. Hãy thử lại.");
        }
    }

    /** Cấp học đã có cùng tên thì dùng lại, chưa có thì tạo mới cho người dùng này. */
    @Transactional
    public GradeLevel gradeLevel(Long userId, String raw) {
        String name = clean(raw, "Tên cấp học");
        var existing = grades.findFirstByName(name);
        if (existing.isPresent()) return existing.get();
        if (grades.countByCreatedBy(userId) >= MAX_GRADES_PER_USER) {
            throw ServiceProblem.conflict("Bạn đã thêm tối đa " + MAX_GRADES_PER_USER + " cấp học mới. Hãy chọn cấp học có sẵn.");
        }
        var created = GradeLevel.create();
        created.setCode("TUTOR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        created.setName(name);
        created.setCreatedBy(userId);
        try {
            return grades.saveAndFlush(created);
        } catch (DataIntegrityViolationException race) {
            throw ServiceProblem.conflict("Cấp học này vừa được thêm bởi người khác. Hãy thử lại.");
        }
    }
}
