-- Cho gia sư/học viên tự thêm môn học và cấp học ngoài danh mục có sẵn.
-- created_by: người tạo (NULL = danh mục hệ thống), dùng để giới hạn số mục mỗi người được thêm và truy vết.
-- UNIQUE(name): cột name dùng collation không phân biệt hoa/thường và dấu, nên "Toán" và "toan" là một mục.
ALTER TABLE subjects
    ADD COLUMN created_by BIGINT NULL COMMENT 'Người tạo mục tùy chỉnh; NULL là danh mục hệ thống.' AFTER name,
    ADD CONSTRAINT fk_subjects_creator FOREIGN KEY (created_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT uq_subjects_name UNIQUE (name);

ALTER TABLE grade_levels
    ADD COLUMN created_by BIGINT NULL COMMENT 'Người tạo mục tùy chỉnh; NULL là danh mục hệ thống.' AFTER name,
    ADD CONSTRAINT fk_grade_levels_creator FOREIGN KEY (created_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT uq_grade_levels_name UNIQUE (name);

-- Môn đã được gia sư tạo trước đây (mã TUTOR-...): gán cho gia sư đầu tiên dùng môn đó trong dịch vụ/lớp.
UPDATE subjects s
   SET s.created_by = (SELECT MIN(o.tutor_id) FROM offerings o WHERE o.subject_id = s.id)
 WHERE s.code LIKE 'TUTOR-%' AND s.created_by IS NULL;
