INSERT INTO user_accounts (id, public_code, email, password_hash, status, email_verified_at, display_name, phone, bio, created_at, updated_at)
VALUES
(101, 'UI-101', 'private-tutor101@example.test', '{noop}test', 'ACTIVE', CURRENT_TIMESTAMP, 'An - Chỉ có hồ sơ', '0900000101', 'Dạy bằng phương pháp trực quan độc đáo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(102, 'UI-102', 'private-tutor102@example.test', '{noop}test', 'ACTIVE', CURRENT_TIMESTAMP, 'Bình - Có gói công khai', '0900000102', 'Giới thiệu gia sư Bình', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(103, 'UI-103', 'private-tutor103@example.test', '{noop}test', 'ACTIVE', CURRENT_TIMESTAMP, 'PRIVATE_PENDING_TUTOR', '0900000103', 'PRIVATE_PENDING_BIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(104, 'UI-104', 'private-tutor104@example.test', '{noop}test', 'LOCKED', CURRENT_TIMESTAMP, 'PRIVATE_LOCKED_TUTOR', '0900000104', 'PRIVATE_LOCKED_BIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(105, 'UI-105', 'private-tutor105@example.test', '{noop}test', 'ACTIVE', NULL, 'PRIVATE_UNVERIFIED_TUTOR', '0900000105', 'PRIVATE_UNVERIFIED_BIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(106, 'UI-106', 'private-tutor106@example.test', '{noop}test', 'ACTIVE', CURRENT_TIMESTAMP, 'Chi - Gói học phí cao', '0900000106', 'Giới thiệu gia sư Chi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(107, 'UI-107', 'private-tutor107@example.test', '{noop}test', 'ACTIVE', CURRENT_TIMESTAMP, 'Dung - Chỉ có gói nháp', '0900000107', 'Giới thiệu gia sư Dung', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(900, 'UI-900', 'learner-ui@example.test', '{noop}test', 'ACTIVE', CURRENT_TIMESTAMP, 'Học viên kiểm thử', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tutor_profiles (user_id, review_status, headline, experience_years, review_note, updated_at)
VALUES
(101, 'APPROVED', 'Gia sư nhận lời mời học riêng', 3, 'PRIVATE_REVIEW_NOTE_101', CURRENT_TIMESTAMP),
(102, 'APPROVED', 'Gia sư dạy qua gói công khai', 5, 'PRIVATE_REVIEW_NOTE_102', CURRENT_TIMESTAMP),
(103, 'PENDING', 'PRIVATE_PENDING_HEADLINE', 1, 'PRIVATE_REVIEW_NOTE_103', CURRENT_TIMESTAMP),
(104, 'APPROVED', 'PRIVATE_LOCKED_HEADLINE', 1, NULL, CURRENT_TIMESTAMP),
(105, 'APPROVED', 'PRIVATE_UNVERIFIED_HEADLINE', 1, NULL, CURRENT_TIMESTAMP),
(106, 'APPROVED', 'Gia sư nâng cao', 7, NULL, CURRENT_TIMESTAMP),
(107, 'APPROVED', 'Chưa mở gói công khai', 2, NULL, CURRENT_TIMESTAMP);

INSERT INTO roles (code, label) VALUES ('LEARNER', 'Học viên');
INSERT INTO user_roles (user_id, role_code) VALUES (900, 'LEARNER');
INSERT INTO subjects (id, code, name, created_by) VALUES
(1, 'SYSTEM', 'Toán hệ thống', NULL), (11, 'PROFILE', 'Môn từ hồ sơ đã duyệt', 101),
(12, 'OFFERING', 'Môn từ gói công khai', 102), (13, 'PENDING', 'PRIVATE_PENDING_SUBJECT', 103),
(14, 'LOCKED', 'PRIVATE_LOCKED_SUBJECT', 104), (15, 'UNVERIFIED', 'PRIVATE_UNVERIFIED_SUBJECT', 105),
(16, 'DRAFT', 'PRIVATE_DRAFT_SUBJECT', 107);
INSERT INTO grade_levels (id, code, name, created_by) VALUES
(1, 'SYSTEM', 'Cấp hệ thống', NULL), (11, 'PROFILE', 'Cấp từ hồ sơ đã duyệt', 101),
(12, 'OFFERING', 'Cấp từ gói công khai', 102), (13, 'PENDING', 'PRIVATE_PENDING_GRADE', 103),
(14, 'LOCKED', 'PRIVATE_LOCKED_GRADE', 104), (15, 'UNVERIFIED', 'PRIVATE_UNVERIFIED_GRADE', 105),
(16, 'DRAFT', 'PRIVATE_DRAFT_GRADE', 107);
INSERT INTO areas (id, code, name) VALUES (1, 'PROFILE', 'Khu vực hồ sơ'), (2, 'OFFERING', 'Khu vực gói');
INSERT INTO delivery_modes (id, code, name) VALUES (1, 'PROFILE', 'Trực tuyến hồ sơ'), (2, 'OFFERING', 'Tại nhà qua gói');
INSERT INTO tutor_subjects (tutor_id, subject_id) VALUES (101, 11), (103, 13), (104, 14), (105, 15);
INSERT INTO tutor_grade_levels (tutor_id, grade_level_id) VALUES (101, 11), (103, 13), (104, 14), (105, 15);
INSERT INTO tutor_areas (tutor_id, area_id) VALUES (101, 1);
INSERT INTO tutor_delivery_modes (tutor_id, delivery_mode_id) VALUES (101, 1);

INSERT INTO offerings (id, public_code, tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, status, terms_version, terms_text, created_at, updated_at)
VALUES
(201, 'UI-O201', 102, 'SERVICE', 'Gói học công khai của Bình', 'Mô tả', 12, 12, 2, 2, 200000, 'VND', 4, 60, 'PUBLISHED', 1, 'Điều khoản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(202, 'UI-O202', 106, 'GROUP_CLASS', 'Gói nâng cao của Chi', 'Mô tả', 12, 12, 2, 2, 400000, 'VND', 4, 60, 'PUBLISHED', 1, 'Điều khoản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(203, 'UI-O203', 107, 'SERVICE', 'PRIVATE_DRAFT_OFFERING', 'Mô tả', 16, 16, 2, 2, 100000, 'VND', 4, 60, 'DRAFT', 1, 'Điều khoản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(204, 'UI-O204', 103, 'SERVICE', 'PRIVATE_PENDING_OFFERING', 'Mô tả', 13, 13, 2, 2, 100000, 'VND', 4, 60, 'PUBLISHED', 1, 'Điều khoản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(205, 'UI-O205', 104, 'SERVICE', 'PRIVATE_LOCKED_OFFERING', 'Mô tả', 14, 14, 2, 2, 100000, 'VND', 4, 60, 'PUBLISHED', 1, 'Điều khoản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(206, 'UI-O206', 105, 'SERVICE', 'PRIVATE_UNVERIFIED_OFFERING', 'Mô tả', 15, 15, 2, 2, 100000, 'VND', 4, 60, 'PUBLISHED', 1, 'Điều khoản', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
