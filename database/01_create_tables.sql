-- =====================================================================
-- EDUCONNECT DATABASE - PHẦN 1: TẠO TOÀN BỘ CÁC BẢNG (DDL)
-- Dành cho chạy tay trên Navicat / MySQL Workbench / CLI
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `educonnect_dev` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `educonnect_dev`;

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Educonnect V1: ĐỀ XUẤT – CHƯA CHỐT các Q01–Q10; xem docs/database/DECISIONS.md.
-- MySQL Server >= 8.0.16; Workbench 8.0. Chọn schema trống trước khi chạy.
-- DDL implicit commit; không dùng script này để reset database.
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';

-- Vai trò hệ thống; người học/phụ huynh dùng cùng LEARNER.
CREATE TABLE roles (
    code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    label VARCHAR(100) NOT NULL COMMENT 'Tên vai trò tiếng Việt.',
    PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vai trò hệ thống; người học/phụ huynh dùng cùng LEARNER.';

-- Môn học dùng để lọc.
CREATE TABLE subjects (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    name VARCHAR(120) NOT NULL COMMENT 'Tên hiển thị tiếng Việt.',
    PRIMARY KEY (id),
    CONSTRAINT uq_subjects_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Môn học dùng để lọc.';

-- Cấp/lớp học.
CREATE TABLE grade_levels (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    name VARCHAR(120) NOT NULL COMMENT 'Tên hiển thị tiếng Việt.',
    PRIMARY KEY (id),
    CONSTRAINT uq_grade_levels_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cấp/lớp học.';

-- Khu vực giảng dạy.
CREATE TABLE areas (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    name VARCHAR(120) NOT NULL COMMENT 'Tên hiển thị tiếng Việt.',
    PRIMARY KEY (id),
    CONSTRAINT uq_areas_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Khu vực giảng dạy.';

-- Hình thức học.
CREATE TABLE delivery_modes (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    name VARCHAR(120) NOT NULL COMMENT 'Tên hiển thị tiếng Việt.',
    PRIMARY KEY (id),
    CONSTRAINT uq_delivery_modes_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Hình thức học.';

-- Tài khoản; khóa mềm giữ nguyên lịch sử giao dịch.
CREATE TABLE user_accounts (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    email VARCHAR(254) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'Email ASCII đã trim/lowercase, không trùng khi đổi chữ hoa.',
    password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'DelegatingPasswordEncoder; {bcrypt} + hash BCrypt thật.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: ACTIVE, LOCKED, DISABLED.',
    email_verified_at DATETIME(6) NULL COMMENT 'NULL nếu email chưa được xác minh.',
    display_name VARCHAR(120) NOT NULL COMMENT 'Tên giả lập hoặc tên hiển thị.',
    phone VARCHAR(24) NULL COMMENT 'Liên hệ tùy chọn; không dùng làm login.',
    bio TEXT NULL COMMENT 'Giới thiệu cá nhân.',
    authentication_version BIGINT NOT NULL DEFAULT 0 COMMENT 'Service tăng khi đổi mật khẩu/thu hồi phiên; session so sánh stamp.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Khóa lạc quan JPA @Version, cập nhật CAS tại service.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    updated_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    PRIMARY KEY (id),
    CONSTRAINT uq_users_code UNIQUE (public_code),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'LOCKED', 'DISABLED')),
    CONSTRAINT ck_users_email_normalized CHECK (BINARY email = BINARY LOWER(TRIM(email))),
    CONSTRAINT ck_users_version CHECK (version >= 0 AND authentication_version >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tài khoản; khóa mềm giữ nguyên lịch sử giao dịch.';

-- Quan hệ nhiều vai trò; không tự cấp role từ request.
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL COMMENT 'Tài khoản.',
    role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    PRIMARY KEY (user_id, role_code),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_code) REFERENCES roles (code) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Quan hệ nhiều vai trò; không tự cấp role từ request.';

-- Một hồ sơ người học hoặc phụ huynh; không có nhiều hồ sơ học sinh BS.
CREATE TABLE learner_profiles (
    user_id BIGINT NOT NULL COMMENT 'Account đóng vai trò người mua.',
    learner_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: SELF, PARENT.',
    grade_level_id BIGINT NULL COMMENT 'Cấp học mặc định để tìm kiếm.',
    area_id BIGINT NULL COMMENT 'Khu vực mặc định.',
    PRIMARY KEY (user_id),
    CONSTRAINT fk_lp_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_lp_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_lp_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_lp_kind CHECK (learner_kind IN ('SELF','PARENT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Một hồ sơ người học hoặc phụ huynh; không có nhiều hồ sơ học sinh BS.';

-- Hồ sơ chuyên môn và trạng thái duyệt gia sư.
CREATE TABLE tutor_profiles (
    user_id BIGINT NOT NULL COMMENT 'Account gia sư.',
    review_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: DRAFT, PENDING, APPROVED, REJECTED.',
    headline VARCHAR(180) NOT NULL COMMENT 'Tiêu đề hồ sơ.',
    experience_years SMALLINT NOT NULL COMMENT 'Số năm kinh nghiệm.',
    reviewed_by BIGINT NULL COMMENT 'Admin duyệt, service kiểm role.',
    reviewed_at DATETIME(6) NULL COMMENT 'Thời điểm quyết định.',
    review_note TEXT NULL COMMENT 'Lý do từ chối/ghi chú riêng tư.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Khóa lạc quan JPA @Version, cập nhật CAS tại service.',
    updated_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    PRIMARY KEY (user_id),
    CONSTRAINT fk_tp_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tp_reviewer FOREIGN KEY (reviewed_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_tp_status CHECK (review_status IN ('DRAFT','PENDING','APPROVED','REJECTED')),
    CONSTRAINT ck_tp_experience CHECK (experience_years BETWEEN 0 AND 80),
    CONSTRAINT ck_tp_decision CHECK ((review_status IN ('APPROVED','REJECTED') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR (review_status IN ('DRAFT','PENDING')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Hồ sơ chuyên môn và trạng thái duyệt gia sư.';

-- Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.
CREATE TABLE tutor_subjects (
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    subject_id BIGINT NOT NULL COMMENT 'Giá trị danh mục.',
    PRIMARY KEY (tutor_id, subject_id),
    CONSTRAINT fk_tutor_subjects_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tutor_subjects_ref FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.';

-- Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.
CREATE TABLE tutor_grade_levels (
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    grade_level_id BIGINT NOT NULL COMMENT 'Giá trị danh mục.',
    PRIMARY KEY (tutor_id, grade_level_id),
    CONSTRAINT fk_tutor_grade_levels_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tutor_grade_levels_ref FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.';

-- Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.
CREATE TABLE tutor_areas (
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    area_id BIGINT NOT NULL COMMENT 'Giá trị danh mục.',
    PRIMARY KEY (tutor_id, area_id),
    CONSTRAINT fk_tutor_areas_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tutor_areas_ref FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.';

-- Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.
CREATE TABLE tutor_delivery_modes (
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    delivery_mode_id BIGINT NOT NULL COMMENT 'Giá trị danh mục.',
    PRIMARY KEY (tutor_id, delivery_mode_id),
    CONSTRAINT fk_tutor_delivery_modes_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tutor_delivery_modes_ref FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chuẩn hóa theo gia sư, không lưu ID dạng chuỗi.';

-- Metadata tệp riêng tư; storage_key không phải public URL hay secret.
CREATE TABLE private_files (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    owner_user_id BIGINT NOT NULL COMMENT 'Chủ tệp; service bảo vệ quyền đọc.',
    storage_key VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    purpose VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: TUTOR_EVIDENCE, REPORT_EVIDENCE.',
    original_name VARCHAR(255) NOT NULL COMMENT 'Tên tệp đã được service kiểm/sanitize.',
    mime_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    byte_size BIGINT NOT NULL COMMENT 'Dung lượng dương.',
    sha256 BINARY(32) NOT NULL COMMENT 'SHA-256 nội dung, không phải nội dung tệp.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    PRIMARY KEY (id),
    CONSTRAINT uq_files_storage UNIQUE (storage_key),
    CONSTRAINT fk_files_owner FOREIGN KEY (owner_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_files_purpose CHECK (purpose IN ('TUTOR_EVIDENCE','REPORT_EVIDENCE')),
    CONSTRAINT ck_files_size CHECK (byte_size > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Metadata tệp riêng tư; storage_key không phải public URL hay secret.';

-- Tệp minh chứng gắn hồ sơ gia sư.
CREATE TABLE tutor_profile_evidence (
    tutor_id BIGINT NOT NULL COMMENT 'Hồ sơ.',
    file_id BIGINT NOT NULL COMMENT 'Minh chứng riêng tư.',
    PRIMARY KEY (tutor_id, file_id),
    CONSTRAINT uq_tpe_file UNIQUE (file_id),
    CONSTRAINT fk_tpe_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tpe_file FOREIGN KEY (file_id) REFERENCES private_files (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tệp minh chứng gắn hồ sơ gia sư.';

-- Token xác minh/reset chỉ lưu SHA-256, không lưu token thô.
CREATE TABLE auth_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    user_id BIGINT NOT NULL COMMENT 'Tài khoản nhận token.',
    purpose VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: VERIFY_EMAIL, RESET_PASSWORD.',
    token_hash BINARY(32) NOT NULL COMMENT 'Hash của token ngẫu nhiên entropy cao.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    expires_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    used_at DATETIME(6) NULL COMMENT 'Thời điểm sử dụng một lần.',
    revoked_at DATETIME(6) NULL COMMENT 'Thu hồi chủ động.',
    PRIMARY KEY (id),
    CONSTRAINT uq_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_tokens_purpose CHECK (purpose IN ('VERIFY_EMAIL','RESET_PASSWORD')),
    CONSTRAINT ck_tokens_time CHECK (expires_at > created_at AND (used_at IS NULL OR used_at >= created_at) AND (revoked_at IS NULL OR revoked_at >= created_at)),
    INDEX ix_tokens_user_expiry (user_id, purpose, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Token xác minh/reset chỉ lưu SHA-256, không lưu token thô.';

-- Dịch vụ/lớp do gia sư cung cấp; không là order/contract.
CREATE TABLE offerings (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định, so sánh phân biệt hoa thường.',
    tutor_id BIGINT NOT NULL COMMENT 'Chủ dịch vụ/lớp.',
    offering_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: SERVICE, GROUP_CLASS.',
    title VARCHAR(220) NOT NULL COMMENT 'Tên dịch vụ/lớp.',
    description TEXT NOT NULL COMMENT 'Mô tả công khai.',
    subject_id BIGINT NOT NULL COMMENT 'Môn học.',
    grade_level_id BIGINT NOT NULL COMMENT 'Cấp/lớp.',
    area_id BIGINT NOT NULL COMMENT 'Khu vực.',
    delivery_mode_id BIGINT NOT NULL COMMENT 'Hình thức học.',
    unit_price DECIMAL(19,0) NOT NULL COMMENT 'Số tiền VND nguyên đồng; Java BigDecimal, không float.',
    currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND' COMMENT 'Đồng tiền; V1 chỉ hỗ trợ VND.',
    session_count SMALLINT NOT NULL COMMENT 'Số buổi trong gói, không tự động giải ngân mỗi buổi.',
    duration_minutes SMALLINT NOT NULL COMMENT 'Thời lượng buổi.',
    capacity INT NULL COMMENT 'Chỉ GROUP_CLASS có sức chứa.',
    starts_on DATE NULL COMMENT 'Ngày bắt đầu lớp theo timezone lịch.',
    ends_on DATE NULL COMMENT 'Ngày kết thúc lớp.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: DRAFT, IN_REVIEW, PUBLISHED, UNPUBLISHED, REJECTED, CLOSED.',
    first_published_at DATETIME(6) NULL COMMENT 'Mốc công khai lần đầu; mặc định không đổi khi duyệt lại.',
    published_at DATETIME(6) NULL COMMENT 'Mốc phục vụ newest; đề xuất giữ lần đầu, Q10 chưa chốt.',
    reviewed_by BIGINT NULL COMMENT 'Admin duyệt.',
    reviewed_at DATETIME(6) NULL COMMENT 'Mốc duyệt.',
    review_note TEXT NULL COMMENT 'Lý do/ghi chú.',
    terms_version INT NOT NULL COMMENT 'Phiên bản điều khoản hiện hành, không có lịch sử đàm phán nhiều phiên bản.',
    terms_text TEXT NOT NULL COMMENT 'Điều khoản hiện hành, snapshot khi tạo item.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Khóa lạc quan JPA @Version, cập nhật CAS tại service.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    updated_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC; không dùng múi giờ session để thay ý nghĩa.',
    PRIMARY KEY (id),
    CONSTRAINT uq_off_code UNIQUE (public_code),
    CONSTRAINT uq_off_owner UNIQUE (id, tutor_id),
    CONSTRAINT fk_off_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_off_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_off_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_off_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_off_mode FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_off_reviewer FOREIGN KEY (reviewed_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_off_type CHECK (offering_type IN ('SERVICE','GROUP_CLASS')),
    CONSTRAINT ck_off_status CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','UNPUBLISHED','REJECTED','CLOSED')),
    CONSTRAINT ck_off_amount CHECK (unit_price > 0 AND currency = 'VND' AND session_count > 0 AND duration_minutes > 0 AND terms_version > 0),
    CONSTRAINT ck_off_capacity_present CHECK ((offering_type='SERVICE' AND capacity IS NULL) OR (offering_type='GROUP_CLASS' AND capacity > 0 AND starts_on IS NOT NULL AND ends_on >= starts_on)),
    CONSTRAINT ck_off_publication CHECK (status <> 'PUBLISHED' OR (published_at IS NOT NULL AND first_published_at IS NOT NULL AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL)),
    INDEX ix_off_latest (status, published_at, id),
    INDEX ix_off_filter (status, subject_id, grade_level_id, delivery_mode_id, unit_price),
    INDEX ix_off_tutor (tutor_id, status, id),
    INDEX ix_off_area (area_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Dịch vụ/lớp do gia sư cung cấp; không là order/contract.';

-- Khung lịch cố định cơ bản; không workflow đổi lịch nâng cao.
CREATE TABLE offering_time_slots (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật; ánh xạ Java Long.',
    offering_id BIGINT NOT NULL COMMENT 'Dịch vụ/lớp.',
    weekday TINYINT NOT NULL COMMENT 'ISO thứ: 1 thứ Hai đến 7 Chủ nhật.',
    start_time TIME NOT NULL COMMENT 'Giờ địa phương.',
    end_time TIME NOT NULL COMMENT 'Giờ địa phương, cùng ngày.',
    time_zone VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'IANA timezone, ví dụ Asia/Ho_Chi_Minh.',
    PRIMARY KEY (id),
    CONSTRAINT fk_ots_offering FOREIGN KEY (offering_id) REFERENCES offerings (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_ots_slot UNIQUE (offering_id, weekday, start_time),
    CONSTRAINT ck_ots_time CHECK (weekday BETWEEN 1 AND 7 AND start_time >= '00:00:00' AND end_time <= '23:59:59' AND end_time > start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Khung lịch cố định cơ bản; không workflow đổi lịch nâng cao.';

-- Lời mời với một bộ điều khoản hiện hành; không version negotiation BS.
CREATE TABLE invitations (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    learner_id BIGINT NOT NULL COMMENT 'Người mời.',
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư được mời.',
    offering_id BIGINT NULL COMMENT 'Dịch vụ tham khảo nếu có.',
    subject_id BIGINT NOT NULL COMMENT 'Môn.',
    grade_level_id BIGINT NOT NULL COMMENT 'Cấp.',
    area_id BIGINT NOT NULL COMMENT 'Khu vực.',
    delivery_mode_id BIGINT NOT NULL COMMENT 'Hình thức.',
    proposed_unit_price DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng, Java BigDecimal.',
    session_count SMALLINT NOT NULL COMMENT 'Số buổi đề nghị.',
    terms_version INT NOT NULL COMMENT 'Phiên bản hiện hành để chống stale, không lưu lịch sử đàm phán.',
    terms_text TEXT NOT NULL COMMENT 'Bộ điều khoản hiện hành.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED.',
    accepted_at DATETIME(6) NULL COMMENT 'Mốc cả hai bên chấp nhận bộ điều khoản hiện hành.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    expires_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_inv_code UNIQUE (public_code),
    CONSTRAINT uq_inv_parties UNIQUE (id, learner_id, tutor_id),
    CONSTRAINT fk_inv_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_inv_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_inv_offering FOREIGN KEY (offering_id, tutor_id) REFERENCES offerings (id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_inv_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_inv_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_inv_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_inv_mode FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_inv_status CHECK (status IN ('PENDING','ACCEPTED','DECLINED','CANCELLED','EXPIRED')),
    CONSTRAINT ck_inv_amount CHECK (proposed_unit_price > 0 AND session_count > 0 AND terms_version > 0),
    CONSTRAINT ck_inv_acceptance CHECK (status <> 'ACCEPTED' OR accepted_at IS NOT NULL),
    CONSTRAINT ck_inv_expiry CHECK (expires_at > created_at),
    INDEX ix_inv_owner (learner_id, status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lời mời với một bộ điều khoản hiện hành; không version negotiation BS.';

-- Tin tìm gia sư cơ bản để truy vết nguồn đơn, không workflow BS.
CREATE TABLE job_posts (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    learner_id BIGINT NOT NULL COMMENT 'Người đăng tin.',
    title VARCHAR(220) NOT NULL COMMENT 'Tiêu đề.',
    description TEXT NOT NULL COMMENT 'Yêu cầu học.',
    subject_id BIGINT NOT NULL COMMENT 'Môn.',
    grade_level_id BIGINT NOT NULL COMMENT 'Cấp.',
    area_id BIGINT NOT NULL COMMENT 'Khu vực.',
    delivery_mode_id BIGINT NOT NULL COMMENT 'Hình thức.',
    budget_per_session DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng, Java BigDecimal.',
    session_count SMALLINT NOT NULL COMMENT 'Tổng buổi.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: DRAFT, PENDING, OPEN, MATCHED, CLOSED, REJECTED.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_jobs_code UNIQUE (public_code),
    CONSTRAINT fk_jobs_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_jobs_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_jobs_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_jobs_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_jobs_mode FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_jobs_status CHECK (status IN ('DRAFT','PENDING','OPEN','MATCHED','CLOSED','REJECTED')),
    CONSTRAINT ck_jobs_amount CHECK (budget_per_session > 0 AND session_count > 0),
    INDEX ix_jobs_owner (learner_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tin tìm gia sư cơ bản để truy vết nguồn đơn, không workflow BS.';

-- Một lượt ứng tuyển của một gia sư cho một tin.
CREATE TABLE job_applications (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    job_id BIGINT NOT NULL COMMENT 'Tin.',
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    proposed_unit_price DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng, Java BigDecimal.',
    message TEXT NOT NULL COMMENT 'Lời giới thiệu.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: SUBMITTED, SELECTED, REJECTED, WITHDRAWN.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_apps_tutor UNIQUE (job_id, tutor_id),
    CONSTRAINT uq_apps_selection UNIQUE (job_id, id, tutor_id),
    CONSTRAINT fk_apps_job FOREIGN KEY (job_id) REFERENCES job_posts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_apps_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_apps_status CHECK (status IN ('SUBMITTED','SELECTED','REJECTED','WITHDRAWN')),
    CONSTRAINT ck_apps_price CHECK (proposed_unit_price > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Một lượt ứng tuyển của một gia sư cho một tin.';

-- Một tin chỉ chọn một ứng viên; giữ điều khoản đã đồng ý.
CREATE TABLE job_selections (
    job_id BIGINT NOT NULL COMMENT 'PK bảo vệ chọn trùng tin.',
    application_id BIGINT NOT NULL COMMENT 'Ứng viên của đúng tin.',
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư ứng viên.',
    selected_by BIGINT NOT NULL COMMENT 'Người chọn, service kiểm chủ tin.',
    terms_version INT NOT NULL COMMENT 'Phiên bản được chấp thuận.',
    terms_text TEXT NOT NULL COMMENT 'Điều khoản chọn hiện hành.',
    selected_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (job_id),
    CONSTRAINT uq_sel_app UNIQUE (application_id),
    CONSTRAINT uq_sel_source UNIQUE (job_id, application_id, tutor_id),
    CONSTRAINT fk_sel_application FOREIGN KEY (job_id, application_id, tutor_id) REFERENCES job_applications (job_id, id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_sel_actor FOREIGN KEY (selected_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_sel_terms CHECK (terms_version > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Một tin chỉ chọn một ứng viên; giữ điều khoản đã đồng ý.';

-- Nguồn đăng ký chuẩn hóa cho mỗi item; không gắn source qua JSON.
CREATE TABLE registration_sources (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    source_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: INVITATION, JOB_APPLICATION, CATALOG.',
    learner_id BIGINT NOT NULL COMMENT 'Người mua.',
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    invitation_id BIGINT NULL COMMENT 'Nguồn lời mời, UNIQUE chống tạo lại.',
    job_id BIGINT NULL COMMENT 'Tin của nguồn JOB_APPLICATION.',
    application_id BIGINT NULL COMMENT 'Ứng viên đã được chọn, UNIQUE chống tạo lại.',
    offering_id BIGINT NULL COMMENT 'Nguồn CATALOG bắt buộc; nguồn khác có thể tham khảo.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_sources_invitation UNIQUE (invitation_id),
    CONSTRAINT uq_sources_application UNIQUE (application_id),
    CONSTRAINT fk_sources_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_sources_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_sources_invitation FOREIGN KEY (invitation_id, learner_id, tutor_id) REFERENCES invitations (id, learner_id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_sources_selection FOREIGN KEY (job_id, application_id, tutor_id) REFERENCES job_selections (job_id, application_id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_sources_offering FOREIGN KEY (offering_id, tutor_id) REFERENCES offerings (id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_sources_kind CHECK ((source_kind='INVITATION' AND invitation_id IS NOT NULL AND job_id IS NULL AND application_id IS NULL) OR (source_kind='JOB_APPLICATION' AND invitation_id IS NULL AND job_id IS NOT NULL AND application_id IS NOT NULL) OR (source_kind='CATALOG' AND invitation_id IS NULL AND job_id IS NULL AND application_id IS NULL AND offering_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Nguồn đăng ký chuẩn hóa cho mỗi item; không gắn source qua JSON.';

-- Một giỏ hiện hành mỗi người học.
CREATE TABLE carts (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    learner_id BIGINT NOT NULL COMMENT 'Chủ giỏ.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    updated_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_carts_owner UNIQUE (learner_id),
    CONSTRAINT fk_carts_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Một giỏ hiện hành mỗi người học.';

-- Giỏ không giữ giá tin cậy; giá/chỗ được tính lại khi checkout.
CREATE TABLE cart_items (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    cart_id BIGINT NOT NULL COMMENT 'Giỏ.',
    offering_id BIGINT NOT NULL COMMENT 'Sản phẩm.',
    seat_count INT NOT NULL COMMENT 'Chỗ đăng ký; SERVICE service bắt buộc 1.',
    offering_version_seen BIGINT NOT NULL COMMENT 'Version người dùng đã thấy.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_ci_offering UNIQUE (cart_id, offering_id),
    CONSTRAINT fk_ci_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_ci_offering FOREIGN KEY (offering_id) REFERENCES offerings (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_ci_quantity CHECK (seat_count > 0 AND offering_version_seen >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Giỏ không giữ giá tin cậy; giá/chỗ được tính lại khi checkout.';

-- Đơn tổng hợp một/nhiều item; không đồng nhất với hợp đồng.
CREATE TABLE orders (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    learner_id BIGINT NOT NULL COMMENT 'Chủ đơn.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: AWAITING_PAYMENT, PAID, IN_PROGRESS, COMPLETED, CANCELLATION_PENDING, CANCELLED.',
    total_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng, Java BigDecimal.',
    currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND' COMMENT 'VND.',
    creation_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    cancellation_reason VARCHAR(600) NULL COMMENT 'Lý do hủy.',
    cancelled_at DATETIME(6) NULL COMMENT 'Mốc hủy đơn, không đồng nghĩa refund thành công.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    updated_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_orders_code UNIQUE (public_code),
    CONSTRAINT uq_orders_creation UNIQUE (learner_id, creation_key),
    CONSTRAINT fk_orders_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_orders_status CHECK (status IN ('AWAITING_PAYMENT','PAID','IN_PROGRESS','COMPLETED','CANCELLATION_PENDING','CANCELLED')),
    CONSTRAINT ck_orders_amount CHECK (total_amount > 0 AND currency='VND'),
    CONSTRAINT ck_orders_cancel CHECK (status <> 'CANCELLED' OR cancelled_at IS NOT NULL),
    INDEX ix_orders_history (learner_id, created_at, id),
    INDEX ix_orders_stats (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Đơn tổng hợp một/nhiều item; không đồng nhất với hợp đồng.';

-- Snapshot bất biến giá/điều khoản từng đăng ký, mỗi item một tutor/contract.
CREATE TABLE order_items (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    order_id BIGINT NOT NULL COMMENT 'Đơn cha.',
    line_number INT NOT NULL COMMENT 'Thứ tự item trong đơn.',
    registration_source_id BIGINT NOT NULL COMMENT 'Nguồn có FK, UNIQUE một nguồn không dùng hai item.',
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư nhận tiền.',
    title_snapshot VARCHAR(220) NOT NULL COMMENT 'Tên lúc đặt.',
    offering_type_snapshot VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: SERVICE, GROUP_CLASS, DIRECT.',
    unit_price_snapshot DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng, Java BigDecimal.',
    session_count_snapshot SMALLINT NOT NULL COMMENT 'Buổi đã đồng ý.',
    seat_count INT NOT NULL COMMENT 'Chỗ đã mua.',
    line_total DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng, Java BigDecimal.',
    fee_rate_snapshot DECIMAL(9,6) NOT NULL COMMENT 'Tỷ lệ phí đã đồng ý; không DEFAULT chính sách.',
    fee_policy_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    terms_version_snapshot INT NOT NULL COMMENT 'Version đã đồng ý.',
    terms_text_snapshot TEXT NOT NULL COMMENT 'Nội dung đã đồng ý.',
    terms_hash BINARY(32) NOT NULL COMMENT 'SHA-256 điều khoản snapshot.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_items_line UNIQUE (order_id, line_number),
    CONSTRAINT uq_items_source UNIQUE (registration_source_id),
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_items_source FOREIGN KEY (registration_source_id) REFERENCES registration_sources (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_items_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_items_type CHECK (offering_type_snapshot IN ('SERVICE','GROUP_CLASS','DIRECT')),
    CONSTRAINT ck_items_total CHECK (unit_price_snapshot > 0 AND session_count_snapshot > 0 AND seat_count > 0 AND line_total = unit_price_snapshot * session_count_snapshot * seat_count),
    CONSTRAINT ck_items_seat CHECK (offering_type_snapshot='GROUP_CLASS' OR seat_count=1),
    CONSTRAINT ck_items_fee CHECK (fee_rate_snapshot BETWEEN 0 AND 1 AND terms_version_snapshot > 0 AND line_number > 0),
    INDEX ix_items_tutor (tutor_id, order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Snapshot bất biến giá/điều khoản từng đăng ký, mỗi item một tutor/contract.';

-- Thỏa thuận mỗi order item; chấp thuận hai bên, không chữ ký số BS.
CREATE TABLE contracts (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    order_item_id BIGINT NOT NULL COMMENT 'Mỗi item có tối đa một hợp đồng.',
    learner_id BIGINT NOT NULL COMMENT 'Bên học.',
    tutor_id BIGINT NOT NULL COMMENT 'Bên dạy.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: AWAITING_PAYMENT, ACTIVE, COMPLETED, CANCELLATION_PENDING, CANCELLED.',
    agreed_terms_text TEXT NOT NULL COMMENT 'Snapshot điều khoản đã đồng ý.',
    agreed_terms_hash BINARY(32) NOT NULL COMMENT 'Hash nội dung khi hai bên chấp thuận.',
    learner_accepted_at DATETIME(6) NOT NULL COMMENT 'Bên học chấp nhận.',
    tutor_accepted_at DATETIME(6) NOT NULL COMMENT 'Bên dạy chấp nhận; CATALOG có thể là offer đã publish theo Q03.',
    completed_at DATETIME(6) NULL COMMENT 'Mốc nghiệm thu cơ bản.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_contracts_code UNIQUE (public_code),
    CONSTRAINT uq_contracts_item UNIQUE (order_item_id),
    CONSTRAINT fk_contracts_item FOREIGN KEY (order_item_id) REFERENCES order_items (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_contracts_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_contracts_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_contracts_status CHECK (status IN ('AWAITING_PAYMENT','ACTIVE','COMPLETED','CANCELLATION_PENDING','CANCELLED')),
    CONSTRAINT ck_contracts_complete CHECK (status <> 'COMPLETED' OR completed_at IS NOT NULL),
    INDEX ix_contracts_tutor (tutor_id, status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thỏa thuận mỗi order item; chấp thuận hai bên, không chữ ký số BS.';

-- Ma trận chuyển trạng thái cơ bản theo role; service dùng để validate.
CREATE TABLE order_status_transitions (
    from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    actor_role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    PRIMARY KEY (from_status, to_status, actor_role_code),
    CONSTRAINT fk_ost_role FOREIGN KEY (actor_role_code) REFERENCES roles (code) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_ost_different CHECK (from_status <> to_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ma trận chuyển trạng thái cơ bản theo role; service dùng để validate.';

-- Nhật ký chuyển trạng thái do service ghi cùng transaction.
CREATE TABLE order_status_history (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    order_id BIGINT NOT NULL COMMENT 'Thực thể.',
    from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    actor_user_id BIGINT NOT NULL COMMENT 'Tác nhân, service kiểm role.',
    reason VARCHAR(600) NOT NULL COMMENT 'Lý do.',
    entity_version BIGINT NOT NULL COMMENT 'Version sau thay đổi.',
    changed_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    actor_role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    PRIMARY KEY (id),
    CONSTRAINT uq_order_status_history_version UNIQUE (order_id, entity_version),
    CONSTRAINT fk_order_status_history_entity FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_order_status_history_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_order_status_history_change CHECK (from_status IS NULL OR from_status <> to_status),
    CONSTRAINT fk_osh_transition FOREIGN KEY (from_status, to_status, actor_role_code) REFERENCES order_status_transitions (from_status, to_status, actor_role_code) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Nhật ký chuyển trạng thái do service ghi cùng transaction.';

-- Nhật ký chuyển trạng thái do service ghi cùng transaction.
CREATE TABLE contract_status_history (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    contract_id BIGINT NOT NULL COMMENT 'Thực thể.',
    from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/khóa chống lặp.',
    actor_user_id BIGINT NOT NULL COMMENT 'Tác nhân, service kiểm role.',
    reason VARCHAR(600) NOT NULL COMMENT 'Lý do.',
    entity_version BIGINT NOT NULL COMMENT 'Version sau thay đổi.',
    changed_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_contract_status_history_version UNIQUE (contract_id, entity_version),
    CONSTRAINT fk_contract_status_history_entity FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_contract_status_history_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_contract_status_history_change CHECK (from_status IS NULL OR from_status <> to_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Nhật ký chuyển trạng thái do service ghi cùng transaction.';

-- Ghi danh lớp nhóm theo hợp đồng; chỗ giữ và hết hạn cơ bản.
CREATE TABLE enrollments (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    contract_id BIGINT NOT NULL COMMENT 'Một ghi danh cho hợp đồng lớp nhóm.',
    offering_id BIGINT NOT NULL COMMENT 'Lớp nhóm, service kiểm offering_type.',
    learner_id BIGINT NOT NULL COMMENT 'Account đăng ký; không child profiles BS.',
    seat_count INT NOT NULL COMMENT 'Chỗ đang giữ/ghi danh.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: RESERVED, CONFIRMED, COMPLETED, CANCELLED, EXPIRED.',
    reserved_until DATETIME(6) NULL COMMENT 'TTL giữ chỗ, bắt buộc nếu RESERVED.',
    confirmed_at DATETIME(6) NULL COMMENT 'Mốc đã trả tiền.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version; service cập nhật CAS.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_enroll_contract UNIQUE (contract_id),
    CONSTRAINT fk_enroll_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_enroll_offering FOREIGN KEY (offering_id) REFERENCES offerings (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_enroll_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_enroll_status CHECK (status IN ('RESERVED','CONFIRMED','COMPLETED','CANCELLED','EXPIRED')),
    CONSTRAINT ck_enroll_seats CHECK (seat_count > 0),
    CONSTRAINT ck_enroll_reservation CHECK (status <> 'RESERVED' OR reserved_until IS NOT NULL),
    INDEX ix_enroll_capacity (offering_id, status, reserved_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ghi danh lớp nhóm theo hợp đồng; chỗ giữ và hết hạn cơ bản.';

-- Một payment intent cho order; nhiều provider attempts ở bảng riêng.
CREATE TABLE payments (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    order_id BIGINT NOT NULL COMMENT 'Đơn, UNIQUE một intent.',
    amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    wallet_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    provider_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: PENDING, FUNDED, FAILED, CANCELLED, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED.',
    funded_at DATETIME(6) NULL COMMENT 'Mốc tiền đã được xác minh và ghi escrow.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Optimistic lock; không thay SELECT FOR UPDATE cho tiền.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_pay_code UNIQUE (public_code),
    CONSTRAINT uq_pay_order UNIQUE (order_id),
    CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_pay_total CHECK (amount > 0 AND wallet_amount >= 0 AND provider_amount >= 0 AND amount=wallet_amount+provider_amount),
    CONSTRAINT ck_pay_status CHECK (status IN ('PENDING','FUNDED','FAILED','CANCELLED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED')),
    CONSTRAINT ck_pay_funded CHECK (status NOT IN ('FUNDED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED') OR funded_at IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Một payment intent cho order; nhiều provider attempts ở bảng riêng.';

-- Mỗi lần gọi provider; provider_ref/mã PayOS không đồng nhất order.
CREATE TABLE payment_attempts (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    payment_id BIGINT NOT NULL COMMENT 'Intent.',
    attempt_number INT NOT NULL COMMENT 'Lần thử.',
    provider VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    provider_order_code BIGINT NOT NULL COMMENT 'PayOS orderCode dạng số, Java Long.',
    provider_reference VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    request_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: PENDING, SUCCEEDED, FAILED, CANCELLED, EXPIRED.',
    verified_at DATETIME(6) NULL COMMENT 'Mốc backend kiểm signature/amount/provider.',
    failure_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    expires_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_attempt_number UNIQUE (payment_id, attempt_number),
    CONSTRAINT uq_attempt_request UNIQUE (request_key),
    CONSTRAINT uq_attempt_provider_code UNIQUE (provider, provider_order_code),
    CONSTRAINT uq_attempt_reference UNIQUE (provider, provider_reference),
    CONSTRAINT fk_attempt_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_attempt_amount CHECK (amount > 0 AND attempt_number > 0),
    CONSTRAINT ck_attempt_provider CHECK (provider='PAYOS'),
    CONSTRAINT ck_attempt_status CHECK (status IN ('PENDING','SUCCEEDED','FAILED','CANCELLED','EXPIRED')),
    CONSTRAINT ck_attempt_verification CHECK (status <> 'SUCCEEDED' OR verified_at IS NOT NULL),
    CONSTRAINT ck_attempt_expiry CHECK (expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Mỗi lần gọi provider; provider_ref/mã PayOS không đồng nhất order.';

-- Chống webhook lặp; lưu digest, không lưu secret/raw payload.
CREATE TABLE payment_webhook_events (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    provider VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    event_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    payment_attempt_id BIGINT NULL COMMENT 'Attempt đã đối chiếu; unknown event có thể NULL.',
    payload_hash BINARY(32) NOT NULL COMMENT 'Hash payload, không thay signature verification.',
    signature_verified BOOLEAN NOT NULL COMMENT 'Chỉ service verifier được ghi true.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: RECEIVED, APPLIED, REJECTED.',
    received_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    processed_at DATETIME(6) NULL COMMENT 'Mốc đã xử lý/reject.',
    error_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    PRIMARY KEY (id),
    CONSTRAINT uq_webhook_event UNIQUE (provider, event_key),
    CONSTRAINT fk_webhook_attempt FOREIGN KEY (payment_attempt_id) REFERENCES payment_attempts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_webhook_status CHECK (status IN ('RECEIVED','APPLIED','REJECTED')),
    CONSTRAINT ck_webhook_applied CHECK (status <> 'APPLIED' OR (signature_verified=1 AND payment_attempt_id IS NOT NULL AND processed_at IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chống webhook lặp; lưu digest, không lưu secret/raw payload.';

-- Phân bổ kế hoạch tiền payment vào từng contract; không tự coi là tiền đã giữ.
CREATE TABLE payment_allocations (
    payment_id BIGINT NOT NULL COMMENT 'Intent.',
    contract_id BIGINT NOT NULL COMMENT 'Hợp đồng.',
    amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    wallet_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    provider_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    PRIMARY KEY (payment_id, contract_id),
    CONSTRAINT uq_alloc_contract UNIQUE (contract_id),
    CONSTRAINT fk_alloc_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_alloc_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_alloc_total CHECK (amount > 0 AND wallet_amount >= 0 AND provider_amount >= 0 AND amount=wallet_amount+provider_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân bổ kế hoạch tiền payment vào từng contract; không tự coi là tiền đã giữ.';

-- Tài khoản sổ kép vận hành: ví, escrow, clearing và phí đã ghi nhận.
CREATE TABLE ledger_accounts (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    account_code VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    account_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: USER_WALLET, ESCROW, PROVIDER_CLEARING, PLATFORM_REVENUE.',
    owner_user_id BIGINT NULL COMMENT 'Chủ ví; loại khác NULL.',
    currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND' COMMENT 'VND.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Optimistic lock; không thay SELECT FOR UPDATE cho tiền.',
    PRIMARY KEY (id),
    CONSTRAINT uq_la_code UNIQUE (account_code),
    CONSTRAINT uq_la_owner UNIQUE (owner_user_id),
    CONSTRAINT fk_la_owner FOREIGN KEY (owner_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_la_kind CHECK (account_kind IN ('USER_WALLET','ESCROW','PROVIDER_CLEARING','PLATFORM_REVENUE')),
    CONSTRAINT ck_la_owner_kind CHECK ((account_kind='USER_WALLET' AND owner_user_id IS NOT NULL) OR (account_kind <> 'USER_WALLET' AND owner_user_id IS NULL)),
    CONSTRAINT ck_la_currency CHECK (currency='VND')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tài khoản sổ kép vận hành: ví, escrow, clearing và phí đã ghi nhận.';

-- Ví gắn ledger account; balance dẫn xuất, không giữ cached balance trùng.
CREATE TABLE wallets (
    user_id BIGINT NOT NULL COMMENT 'Chủ ví.',
    ledger_account_id BIGINT NOT NULL COMMENT 'Account sổ vận hành, UNIQUE.',
    PRIMARY KEY (user_id),
    CONSTRAINT uq_wallet_account UNIQUE (ledger_account_id),
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_wallet_account FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ví gắn ledger account; balance dẫn xuất, không giữ cached balance trùng.';

-- Tiền đang giữ cho từng contract, tách khỏi ví và doanh thu.
CREATE TABLE escrow_accounts (
    contract_id BIGINT NOT NULL COMMENT 'Hợp đồng.',
    ledger_account_id BIGINT NOT NULL COMMENT 'Account ESCROW độc lập.',
    PRIMARY KEY (contract_id),
    CONSTRAINT uq_escrow_account UNIQUE (ledger_account_id),
    CONSTRAINT fk_escrow_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_escrow_account FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tiền đang giữ cho từng contract, tách khỏi ví và doanh thu.';

-- Giải ngân cơ bản được tác nhân chấp thuận; không tự giải ngân theo buổi BS.
CREATE TABLE releases (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    contract_id BIGINT NOT NULL COMMENT 'Hợp đồng có tiền đã nhận.',
    release_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    reason_code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: COMPLETION, MANUAL_MILESTONE.',
    gross_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    fee_rate_snapshot DECIMAL(9,6) NOT NULL COMMENT 'Tỷ lệ đã đồng ý, snapshot theo item.',
    fee_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    tutor_net_amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    fee_policy_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    rounding_mode VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    approved_by BIGINT NOT NULL COMMENT 'Tác nhân có quyền giải ngân theo Q03.',
    released_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_release_key UNIQUE (release_key),
    CONSTRAINT fk_release_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_release_actor FOREIGN KEY (approved_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_release_reason CHECK (reason_code IN ('COMPLETION','MANUAL_MILESTONE')),
    CONSTRAINT ck_release_split CHECK (gross_amount > 0 AND fee_amount >= 0 AND tutor_net_amount >= 0 AND gross_amount=fee_amount+tutor_net_amount),
    CONSTRAINT ck_release_rate CHECK (fee_rate_snapshot BETWEEN 0 AND 1 AND rounding_mode='HALF_UP' AND fee_amount=ROUND(gross_amount*fee_rate_snapshot,0)),
    INDEX ix_release_time (released_at, contract_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Giải ngân cơ bản được tác nhân chấp thuận; không tự giải ngân theo buổi BS.';

-- Yêu cầu hoàn, tách cancellation; snapshot basis/rate/destination.
CREATE TABLE refunds (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    payment_id BIGINT NOT NULL COMMENT 'Payment đã tài trợ contract.',
    contract_id BIGINT NOT NULL COMMENT 'Hợp đồng được hoàn.',
    request_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    basis_amount_snapshot DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    refund_rate_snapshot DECIMAL(9,6) NOT NULL COMMENT 'Rate được quyết định, không default phí/refund production.',
    amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    policy_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    destination VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: WALLET, ORIGINAL_PROVIDER.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: REQUESTED, PROCESSING, SUCCEEDED, FAILED, REJECTED.',
    requested_by BIGINT NOT NULL COMMENT 'Người yêu cầu.',
    reason VARCHAR(600) NOT NULL COMMENT 'Lý do.',
    provider_reference VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    failure_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    requested_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    processed_at DATETIME(6) NULL COMMENT 'Mốc thành công/thất bại.',
    pending_contract_id BIGINT GENERATED ALWAYS AS (CASE WHEN status IN ('REQUESTED','PROCESSING') THEN contract_id ELSE NULL END) STORED COMMENT 'UNIQUE chống hai yêu cầu đang chạy cùng contract.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Optimistic lock; không thay SELECT FOR UPDATE cho tiền.',
    PRIMARY KEY (id),
    CONSTRAINT uq_refund_key UNIQUE (request_key),
    CONSTRAINT uq_refund_pending UNIQUE (pending_contract_id),
    CONSTRAINT uq_refund_provider_ref UNIQUE (provider_reference),
    CONSTRAINT fk_refund_allocation FOREIGN KEY (payment_id, contract_id) REFERENCES payment_allocations (payment_id, contract_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_refund_actor FOREIGN KEY (requested_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_refund_status CHECK (status IN ('REQUESTED','PROCESSING','SUCCEEDED','FAILED','REJECTED')),
    CONSTRAINT ck_refund_destination CHECK (destination IN ('WALLET','ORIGINAL_PROVIDER')),
    CONSTRAINT ck_refund_amount CHECK (basis_amount_snapshot > 0 AND refund_rate_snapshot BETWEEN 0 AND 1 AND amount > 0 AND amount=ROUND(basis_amount_snapshot*refund_rate_snapshot,0) AND amount <= basis_amount_snapshot),
    CONSTRAINT ck_refund_processed CHECK (status NOT IN ('SUCCEEDED','FAILED','REJECTED') OR processed_at IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Yêu cầu hoàn, tách cancellation; snapshot basis/rate/destination.';

-- Theo dõi retry/tiến trình hoàn cơ bản, không mất dấu failure.
CREATE TABLE refund_status_history (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    refund_id BIGINT NOT NULL COMMENT 'Yêu cầu.',
    from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    actor_user_id BIGINT NOT NULL COMMENT 'Tác nhân.',
    reason VARCHAR(600) NOT NULL COMMENT 'Kết quả xử lý.',
    changed_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT fk_rh_refund FOREIGN KEY (refund_id) REFERENCES refunds (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_rh_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Theo dõi retry/tiến trình hoàn cơ bản, không mất dấu failure.';

-- Nhật ký tiền đã post, mỗi business event một journal; service ghi nguyên tử.
CREATE TABLE money_journals (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    business_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    journal_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: TOP_UP, WALLET_PAYMENT, PROVIDER_PAYMENT, RELEASE, REFUND.',
    payment_id BIGINT NULL COMMENT 'Intent cho funding.',
    contract_id BIGINT NULL COMMENT 'Escrow funding/release/refund.',
    release_id BIGINT NULL COMMENT 'Giải ngân, UNIQUE journal.',
    refund_id BIGINT NULL COMMENT 'Hoàn thành công, UNIQUE journal.',
    wallet_user_id BIGINT NULL COMMENT 'Nạp ví DEMO/mở số dư theo sự kiện, không feature nạp tiền provider tự động.',
    memo VARCHAR(255) NOT NULL COMMENT 'Mô tả không chứa secret.',
    posted_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_journal_business UNIQUE (business_key),
    CONSTRAINT uq_journal_release UNIQUE (release_id),
    CONSTRAINT uq_journal_refund UNIQUE (refund_id),
    CONSTRAINT fk_journal_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_journal_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_journal_release FOREIGN KEY (release_id) REFERENCES releases (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_journal_refund FOREIGN KEY (refund_id) REFERENCES refunds (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_journal_wallet FOREIGN KEY (wallet_user_id) REFERENCES wallets (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_journal_references CHECK ((journal_kind='TOP_UP' AND wallet_user_id IS NOT NULL AND payment_id IS NULL AND contract_id IS NULL AND release_id IS NULL AND refund_id IS NULL) OR (journal_kind IN ('WALLET_PAYMENT','PROVIDER_PAYMENT') AND payment_id IS NOT NULL AND contract_id IS NOT NULL AND release_id IS NULL AND refund_id IS NULL AND wallet_user_id IS NULL) OR (journal_kind='RELEASE' AND release_id IS NOT NULL AND contract_id IS NOT NULL AND payment_id IS NULL AND refund_id IS NULL AND wallet_user_id IS NULL) OR (journal_kind='REFUND' AND refund_id IS NOT NULL AND contract_id IS NOT NULL AND payment_id IS NULL AND release_id IS NULL AND wallet_user_id IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Nhật ký tiền đã post, mỗi business event một journal; service ghi nguyên tử.';

-- Dòng ghi sổ tiền; credit tăng balance, debit giảm; tổng journal phải cân service.
CREATE TABLE ledger_entries (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    journal_id BIGINT NOT NULL COMMENT 'Journal.',
    line_number INT NOT NULL COMMENT 'Thứ tự dòng.',
    ledger_account_id BIGINT NOT NULL COMMENT 'Tài khoản vận hành.',
    entry_side VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: DEBIT, CREDIT.',
    amount DECIMAL(19,0) NOT NULL COMMENT 'VND nguyên đồng; BigDecimal.',
    PRIMARY KEY (id),
    CONSTRAINT uq_entry_line UNIQUE (journal_id, line_number),
    CONSTRAINT fk_entry_journal FOREIGN KEY (journal_id) REFERENCES money_journals (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_entry_account FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_entry_side CHECK (entry_side IN ('DEBIT','CREDIT')),
    CONSTRAINT ck_entry_amount CHECK (amount > 0 AND line_number > 0),
    INDEX ix_entry_account (ledger_account_id, journal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Dòng ghi sổ tiền; credit tăng balance, debit giảm; tổng journal phải cân service.';

-- Khóa request dùng bởi service; webhook có bảng event UNIQUE riêng.
CREATE TABLE idempotency_records (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    scope VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    request_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định/idempotency, phân biệt hoa thường.',
    actor_user_id BIGINT NOT NULL COMMENT 'Chủ request.',
    request_hash BINARY(32) NOT NULL COMMENT 'Body digest để phát hiện reuse key khác request.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: PROCESSING, COMPLETED, FAILED.',
    order_id BIGINT NULL COMMENT 'Kết quả create-order nếu có.',
    response_hash BINARY(32) NULL COMMENT 'Digest response không chứa credential.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    expires_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_idem_scope UNIQUE (scope, actor_user_id, request_key),
    CONSTRAINT fk_idem_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_idem_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_idem_status CHECK (status IN ('PROCESSING','COMPLETED','FAILED')),
    CONSTRAINT ck_idem_expiry CHECK (expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Khóa request dùng bởi service; webhook có bảng event UNIQUE riêng.';

-- Một đánh giá mỗi contract/item hoàn thành; service kiểm quyền và tiền.
CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    contract_id BIGINT NOT NULL COMMENT 'Transaction đủ điều kiện; UNIQUE một đánh giá.',
    reviewer_user_id BIGINT NOT NULL COMMENT 'Chính người học mua.',
    rating TINYINT NOT NULL COMMENT 'Sao 1 đến 5.',
    comment VARCHAR(1000) NOT NULL COMMENT 'Nội dung đã validate/escape lúc hiển thị.',
    status VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC.',
    PRIMARY KEY (id),
    CONSTRAINT uq_review_contract UNIQUE (contract_id),
    CONSTRAINT fk_review_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_review_user FOREIGN KEY (reviewer_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_review_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT ck_review_status CHECK (status IN ('PUBLISHED','HIDDEN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Một đánh giá mỗi contract/item hoàn thành; service kiểm quyền và tiền.';

-- Báo cáo người dùng/gia sư và kết luận admin; không tự mở tranh chấp BS.
CREATE TABLE reports (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    reporter_user_id BIGINT NOT NULL COMMENT 'Người gửi.',
    target_user_id BIGINT NOT NULL COMMENT 'Account bị báo cáo; tutor cũng là account.',
    related_contract_id BIGINT NULL COMMENT 'Giao dịch làm ngữ cảnh nếu có.',
    reason_code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    description TEXT NOT NULL COMMENT 'Nội dung báo cáo.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    assigned_admin_id BIGINT NULL COMMENT 'Admin xử lý; service kiểm role.',
    resolution TEXT NULL COMMENT 'Kết luận.',
    resolved_by BIGINT NULL COMMENT 'Admin ra kết luận.',
    resolved_at DATETIME(6) NULL COMMENT 'Mốc kết luận.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC.',
    PRIMARY KEY (id),
    CONSTRAINT uq_report_code UNIQUE (public_code),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_report_target FOREIGN KEY (target_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_report_contract FOREIGN KEY (related_contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_report_assigned FOREIGN KEY (assigned_admin_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_report_resolved FOREIGN KEY (resolved_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_report_status CHECK (status IN ('OPEN','INVESTIGATING','RESOLVED','DISMISSED')),
    CONSTRAINT ck_report_reason CHECK (reason_code IN ('CONTENT','CONDUCT','PAYMENT','NO_SHOW','OTHER')),
    CONSTRAINT ck_report_target CHECK (reporter_user_id <> target_user_id),
    CONSTRAINT ck_report_resolution CHECK ((status IN ('RESOLVED','DISMISSED') AND resolution IS NOT NULL AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL) OR (status IN ('OPEN','INVESTIGATING') AND resolved_at IS NULL)),
    INDEX ix_report_queue (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Báo cáo người dùng/gia sư và kết luận admin; không tự mở tranh chấp BS.';

-- Tệp riêng tư của người gửi báo cáo; quyền/owner do service kiểm.
CREATE TABLE report_evidence (
    report_id BIGINT NOT NULL COMMENT 'Báo cáo.',
    file_id BIGINT NOT NULL COMMENT 'Tệp chứng cứ.',
    PRIMARY KEY (report_id, file_id),
    CONSTRAINT uq_re_file UNIQUE (file_id),
    CONSTRAINT fk_re_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_re_file FOREIGN KEY (file_id) REFERENCES private_files (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tệp riêng tư của người gửi báo cáo; quyền/owner do service kiểm.';

-- Thông báo cơ bản lưu DB; không tự gửi email/provider.
CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    recipient_user_id BIGINT NOT NULL COMMENT 'Người nhận.',
    event_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    notification_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    title VARCHAR(180) NOT NULL COMMENT 'Tiêu đề tiếng Việt.',
    body VARCHAR(1000) NOT NULL COMMENT 'Nội dung không có secret.',
    order_id BIGINT NULL COMMENT 'Đơn liên quan.',
    refund_id BIGINT NULL COMMENT 'Hoàn liên quan.',
    report_id BIGINT NULL COMMENT 'Báo cáo liên quan.',
    read_at DATETIME(6) NULL COMMENT 'Mốc đọc.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC.',
    PRIMARY KEY (id),
    CONSTRAINT uq_notice_event UNIQUE (recipient_user_id, event_key),
    CONSTRAINT fk_notice_user FOREIGN KEY (recipient_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_notice_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_notice_refund FOREIGN KEY (refund_id) REFERENCES refunds (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_notice_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX ix_notice_inbox (recipient_user_id, read_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông báo cơ bản lưu DB; không tự gửi email/provider.';

-- Audit tối thiểu; JSON chỉ metadata đã sanitize, không thay FK nghiệp vụ.
CREATE TABLE audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    actor_user_id BIGINT NULL COMMENT 'NULL cho hệ thống.',
    action_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    order_id BIGINT NULL COMMENT 'Đơn liên quan.',
    report_id BIGINT NULL COMMENT 'Báo cáo liên quan.',
    target_user_id BIGINT NULL COMMENT 'Account liên quan.',
    metadata JSON NOT NULL COMMENT 'Metadata safe allowlist; không password/token/provider payload.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC.',
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_audit_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_audit_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_audit_target FOREIGN KEY (target_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX ix_audit_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Audit tối thiểu; JSON chỉ metadata đã sanitize, không thay FK nghiệp vụ.';

-- Marker fixture development: checksum chống rerun seed đã thay đổi; không chứa secret.
CREATE TABLE dev_seed_runs (
    fixture_set VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Mã ổn định.',
    manifest_hash BINARY(32) NOT NULL COMMENT 'SHA-256 bộ dữ liệu canonical.',
    applied_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC.',
    PRIMARY KEY (fixture_set)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Marker fixture development: checksum chống rerun seed đã thay đổi; không chứa secret.';


-- Credit tăng số dư ví/escrow; clearing là account đối ứng, có thể âm.
CREATE VIEW v_ledger_balances AS
SELECT a.id AS ledger_account_id, a.account_code, a.account_kind, a.owner_user_id, a.currency,
       COALESCE(SUM(CASE WHEN e.entry_side='CREDIT' THEN e.amount ELSE -e.amount END),0) AS balance
FROM ledger_accounts a LEFT JOIN ledger_entries e ON e.ledger_account_id=a.id
GROUP BY a.id, a.account_code, a.account_kind, a.owner_user_id, a.currency;

CREATE VIEW v_wallet_balances AS
SELECT w.user_id, w.ledger_account_id, b.currency, b.balance AS available_balance
FROM wallets w JOIN v_ledger_balances b ON b.ledger_account_id=w.ledger_account_id;

CREATE VIEW v_escrow_balances AS
SELECT x.contract_id, x.ledger_account_id, b.balance AS held_amount
FROM escrow_accounts x JOIN v_ledger_balances b ON b.ledger_account_id=x.ledger_account_id;

-- Chỉ event đã có journal thực tế được tính; không lấy held/planned làm revenue.
CREATE VIEW v_tutor_revenue AS
SELECT t.user_id AS tutor_id, COALESCE(SUM(r.gross_amount),0) AS gross_released,
       COALESCE(SUM(r.fee_amount),0) AS platform_fee_released,
       COALESCE(SUM(r.tutor_net_amount),0) AS tutor_net_released
FROM tutor_profiles t
LEFT JOIN contracts c ON c.tutor_id=t.user_id
LEFT JOIN (releases r INNER JOIN money_journals j ON j.release_id=r.id AND j.journal_kind='RELEASE')
       ON r.contract_id=c.id
GROUP BY t.user_id;

-- Bảng lịch sử Flyway để Spring Boot nhận diện migration đã hoàn tất khi khởi động
CREATE TABLE IF NOT EXISTS `flyway_schema_history` (
    `installed_rank` INT NOT NULL,
    `version` VARCHAR(50) DEFAULT NULL,
    `description` VARCHAR(200) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `script` VARCHAR(1000) NOT NULL,
    `checksum` INT DEFAULT NULL,
    `installed_by` VARCHAR(100) NOT NULL,
    `installed_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `execution_time` INT NOT NULL,
    `success` TINYINT(1) NOT NULL,
    PRIMARY KEY (`installed_rank`),
    KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
