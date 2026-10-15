-- Chỉ DEVELOPMENT/TEST. Không nằm trong Flyway locations, không tự chạy production.
-- Mốc cố định UTC: 2026-10-15 00:00:00.000000; password/DEMO policy xem database/README.md.
-- DDL routine/temp table nằm ngoài phần insert transaction; MySQL DDL không rollback chung.
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';

DROP PROCEDURE IF EXISTS educonnect_seed_dev_v1;
DELIMITER $$
CREATE PROCEDURE educonnect_seed_dev_v1()
SQL SECURITY INVOKER
seed_main: BEGIN
    DECLARE v_lock INT DEFAULT 0;
    DECLARE v_existing INT DEFAULT 0;
    DECLARE v_hash BINARY(32);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS seed_expected_user_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_user_roles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_learner_profiles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_profiles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_subjects;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_grade_levels;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_areas;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_delivery_modes;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_private_files;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_profile_evidence;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_auth_tokens;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_offerings;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_offering_time_slots;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_invitations;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_posts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_applications;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_selections;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_registration_sources;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_carts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_cart_items;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_orders;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_items;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_contracts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_contract_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_enrollments;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payments;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_attempts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_webhook_events;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_allocations;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_ledger_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_wallets;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_escrow_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_releases;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_refunds;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_refund_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_money_journals;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_ledger_entries;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_idempotency_records;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_reviews;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_reports;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_report_evidence;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_notifications;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_audit_logs;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_roles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_subjects;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_grade_levels;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_areas;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_delivery_modes;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_status_transitions;
        IF v_lock=1 THEN DO RELEASE_LOCK(CONCAT(DATABASE(), ':educonnect-dev-v1')); END IF;
        RESIGNAL;
    END;
    IF DATABASE() IS NULL OR NOT (DATABASE()='educonnect_dev' OR DATABASE() REGEXP '^educonnect_test(_[a-z0-9_]+)?$') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Seed DEMO chi duoc chay tren educonnect_dev/educonnect_test[_...].';
    END IF;
    SELECT GET_LOCK(CONCAT(DATABASE(), ':educonnect-dev-v1'),10) INTO v_lock;
    IF v_lock IS NULL OR v_lock<>1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Khong lay duoc khoa seed; hay dung ghi ung dung va thu lai.';
    END IF;
    SET v_hash=UNHEX('652b2b53e6302d610cc5b0f8ad3ef73c58fbb26e4326ab3ed6282c53cae52c12');
    DROP TEMPORARY TABLE IF EXISTS seed_expected_user_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_user_roles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_learner_profiles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_profiles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_subjects;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_grade_levels;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_areas;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_delivery_modes;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_private_files;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_profile_evidence;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_auth_tokens;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_offerings;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_offering_time_slots;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_invitations;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_posts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_applications;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_selections;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_registration_sources;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_carts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_cart_items;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_orders;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_items;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_contracts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_contract_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_enrollments;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payments;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_attempts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_webhook_events;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_allocations;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_ledger_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_wallets;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_escrow_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_releases;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_refunds;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_refund_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_money_journals;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_ledger_entries;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_idempotency_records;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_reviews;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_reports;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_report_evidence;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_notifications;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_audit_logs;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_roles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_subjects;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_grade_levels;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_areas;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_delivery_modes;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_status_transitions;

    CREATE TEMPORARY TABLE seed_expected_roles LIKE roles;
    INSERT INTO seed_expected_roles (code, label) VALUES
        ('ADMIN', 'Quản trị'),
        ('TUTOR', 'Gia sư'),
        ('LEARNER', 'Người học/phụ huynh');
    
    CREATE TEMPORARY TABLE seed_expected_subjects LIKE subjects;
    INSERT INTO seed_expected_subjects (id, code, name) VALUES
        (1, 'MATH', 'Toán'),
        (2, 'LITERATURE', 'Ngữ văn'),
        (3, 'ENGLISH', 'Tiếng Anh'),
        (4, 'PHYSICS', 'Vật lý'),
        (5, 'CHEMISTRY', 'Hóa học');
    
    CREATE TEMPORARY TABLE seed_expected_grade_levels LIKE grade_levels;
    INSERT INTO seed_expected_grade_levels (id, code, name) VALUES
        (1, 'GRADE_8', 'Lớp 8'),
        (2, 'GRADE_9', 'Lớp 9'),
        (3, 'GRADE_10', 'Lớp 10'),
        (4, 'GRADE_11', 'Lớp 11'),
        (5, 'GRADE_12', 'Lớp 12'),
        (6, 'EXAM_PREP', 'Luyện thi'),
        (7, 'ADULT', 'Người đi làm');
    
    CREATE TEMPORARY TABLE seed_expected_areas LIKE areas;
    INSERT INTO seed_expected_areas (id, code, name) VALUES
        (1, 'HCM_THU_DUC', 'Thủ Đức, TP. Hồ Chí Minh'),
        (2, 'HANOI_CAU_GIAY', 'Cầu Giấy, Hà Nội'),
        (3, 'DANANG_HAI_CHAU', 'Hải Châu, Đà Nẵng'),
        (4, 'NATIONWIDE', 'Toàn quốc');
    
    CREATE TEMPORARY TABLE seed_expected_delivery_modes LIKE delivery_modes;
    INSERT INTO seed_expected_delivery_modes (id, code, name) VALUES
        (1, 'ONLINE', 'Trực tuyến'),
        (2, 'IN_PERSON', 'Trực tiếp'),
        (3, 'HYBRID', 'Kết hợp');
    
    CREATE TEMPORARY TABLE seed_expected_order_status_transitions LIKE order_status_transitions;
    INSERT INTO seed_expected_order_status_transitions (from_status, to_status, actor_role_code) VALUES
        ('NEW', 'AWAITING_PAYMENT', 'LEARNER'),
        ('AWAITING_PAYMENT', 'PAID', 'ADMIN'),
        ('AWAITING_PAYMENT', 'CANCELLED', 'LEARNER'),
        ('AWAITING_PAYMENT', 'CANCELLED', 'ADMIN'),
        ('PAID', 'IN_PROGRESS', 'TUTOR'),
        ('PAID', 'IN_PROGRESS', 'ADMIN'),
        ('PAID', 'CANCELLATION_PENDING', 'LEARNER'),
        ('PAID', 'CANCELLATION_PENDING', 'ADMIN'),
        ('IN_PROGRESS', 'COMPLETED', 'TUTOR'),
        ('IN_PROGRESS', 'COMPLETED', 'ADMIN'),
        ('IN_PROGRESS', 'CANCELLATION_PENDING', 'LEARNER'),
        ('IN_PROGRESS', 'CANCELLATION_PENDING', 'ADMIN'),
        ('CANCELLATION_PENDING', 'CANCELLED', 'ADMIN');
    
    CREATE TEMPORARY TABLE seed_expected_user_accounts LIKE user_accounts;
    INSERT INTO seed_expected_user_accounts (id, public_code, email, password_hash, status, email_verified_at, display_name, phone, bio, authentication_version, version, created_at, updated_at) VALUES
        (100, 'DEMO-ADMIN-01', 'admin@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Quản trị Educonnect', NULL, NULL, 0, 0, '2026-03-01 10:00:00.000000', '2026-03-01 10:00:00.000000'),
        (201, 'DEMO-TUTOR-01', 'tutor01@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Nguyễn Minh Anh', NULL, 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (202, 'DEMO-TUTOR-02', 'tutor02@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Trần Quốc Huy', NULL, 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (203, 'DEMO-TUTOR-03', 'tutor03@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Lê Thảo Vy', NULL, 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (204, 'DEMO-TUTOR-04', 'tutor04@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Phạm Hoàng Long', NULL, 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (205, 'DEMO-TUTOR-05', 'tutor05@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Đặng Quốc Bảo', NULL, 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (206, 'DEMO-TUTOR-06', 'tutor06@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Vũ Thu Hà', NULL, 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (301, 'DEMO-LEARNER-01', 'learner01@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Nguyễn Mai Lan', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (302, 'DEMO-LEARNER-02', 'learner02@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Trần Minh Quân', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (303, 'DEMO-LEARNER-03', 'learner03@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Lê Tuấn Kiệt', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (304, 'DEMO-LEARNER-04', 'learner04@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Phạm Thu Hằng', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (305, 'DEMO-LEARNER-05', 'learner05@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Vũ Ngọc Anh', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (306, 'DEMO-LEARNER-06', 'learner06@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Đỗ Đức Kiên', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (307, 'DEMO-LEARNER-07', 'learner07@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Nguyễn Hoàng Phúc', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (308, 'DEMO-LEARNER-08', 'learner08@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', '2026-03-01 10:00:00.000000', 'Bùi Mai Trang', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (309, 'DEMO-LEARNER-09', 'learner09@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'ACTIVE', NULL, 'Lê An Nhiên', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000'),
        (310, 'DEMO-LEARNER-10', 'learner10@example.test', '{bcrypt}$2a$10$ePV.PIkQem41lZn/IzGsceBz8ZF1hV4S.I3rTrmeRI4oNwIeI4ny2', 'LOCKED', '2026-03-01 10:00:00.000000', 'Trần Gia Bảo', NULL, 'Dữ liệu người học/phụ huynh giả lập.', 0, 0, '2026-03-01 10:00:00.000000', '2026-03-02 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_user_roles LIKE user_roles;
    INSERT INTO seed_expected_user_roles (user_id, role_code) VALUES
        (201, 'TUTOR'),
        (202, 'TUTOR'),
        (203, 'TUTOR'),
        (204, 'TUTOR'),
        (205, 'TUTOR'),
        (206, 'TUTOR'),
        (100, 'ADMIN'),
        (301, 'LEARNER'),
        (302, 'LEARNER'),
        (303, 'LEARNER'),
        (304, 'LEARNER'),
        (305, 'LEARNER'),
        (306, 'LEARNER'),
        (307, 'LEARNER'),
        (308, 'LEARNER'),
        (309, 'LEARNER'),
        (310, 'LEARNER');
    
    CREATE TEMPORARY TABLE seed_expected_learner_profiles LIKE learner_profiles;
    INSERT INTO seed_expected_learner_profiles (user_id, learner_kind, grade_level_id, area_id) VALUES
        (301, 'PARENT', 1, 1),
        (302, 'SELF', 2, 2),
        (303, 'PARENT', 3, 3),
        (304, 'SELF', 4, 1),
        (305, 'PARENT', 5, 2),
        (306, 'SELF', 6, 3),
        (307, 'PARENT', 7, 1),
        (308, 'SELF', 1, 2),
        (309, 'PARENT', 2, 3),
        (310, 'SELF', 3, 1);
    
    CREATE TEMPORARY TABLE seed_expected_tutor_profiles LIKE tutor_profiles;
    INSERT INTO seed_expected_tutor_profiles (user_id, review_status, headline, experience_years, reviewed_by, reviewed_at, review_note, version, updated_at) VALUES
        (201, 'APPROVED', 'Gia sư Toán THPT', 2, 100, '2026-03-02 10:00:00.000000', NULL, 0, '2026-03-02 10:00:00.000000'),
        (202, 'APPROVED', 'Gia sư Tiếng Anh', 3, 100, '2026-03-02 10:00:00.000000', NULL, 0, '2026-03-02 10:00:00.000000'),
        (203, 'APPROVED', 'Gia sư Ngữ văn', 4, 100, '2026-03-02 10:00:00.000000', NULL, 0, '2026-03-02 10:00:00.000000'),
        (204, 'APPROVED', 'Gia sư khoa học', 5, 100, '2026-03-02 10:00:00.000000', NULL, 0, '2026-03-02 10:00:00.000000'),
        (205, 'PENDING', 'Hồ sơ chờ duyệt', 6, NULL, NULL, NULL, 0, '2026-03-02 10:00:00.000000'),
        (206, 'REJECTED', 'Hồ sơ cần bổ sung', 7, 100, '2026-03-02 10:00:00.000000', 'DEMO: cần bổ sung minh chứng chuyên môn.', 0, '2026-03-02 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_tutor_subjects LIKE tutor_subjects;
    INSERT INTO seed_expected_tutor_subjects (tutor_id, subject_id) VALUES
        (201, 1),
        (202, 2),
        (203, 3),
        (204, 4),
        (205, 5),
        (206, 1);
    
    CREATE TEMPORARY TABLE seed_expected_tutor_grade_levels LIKE tutor_grade_levels;
    INSERT INTO seed_expected_tutor_grade_levels (tutor_id, grade_level_id) VALUES
        (201, 1),
        (202, 2),
        (203, 3),
        (204, 4),
        (205, 5),
        (206, 6);
    
    CREATE TEMPORARY TABLE seed_expected_tutor_areas LIKE tutor_areas;
    INSERT INTO seed_expected_tutor_areas (tutor_id, area_id) VALUES
        (201, 1),
        (202, 2),
        (203, 3),
        (204, 1),
        (205, 2),
        (206, 3);
    
    CREATE TEMPORARY TABLE seed_expected_tutor_delivery_modes LIKE tutor_delivery_modes;
    INSERT INTO seed_expected_tutor_delivery_modes (tutor_id, delivery_mode_id) VALUES
        (201, 1),
        (202, 2),
        (203, 3),
        (204, 1),
        (205, 2),
        (206, 3);
    
    CREATE TEMPORARY TABLE seed_expected_private_files LIKE private_files;
    INSERT INTO seed_expected_private_files (id, owner_user_id, storage_key, purpose, original_name, mime_type, byte_size, sha256, created_at) VALUES
        (1001, 201, 'demo/private/tutor-201-evidence.pdf', 'TUTOR_EVIDENCE', 'Chung-chi-DEMO.pdf', 'application/pdf', 12000, UNHEX(SHA2('DEMO-FILE-TUTOR-201',256)), '2026-03-01 10:00:00.000000'),
        (1002, 202, 'demo/private/tutor-202-evidence.pdf', 'TUTOR_EVIDENCE', 'Chung-chi-DEMO.pdf', 'application/pdf', 12001, UNHEX(SHA2('DEMO-FILE-TUTOR-202',256)), '2026-03-01 10:00:00.000000'),
        (1003, 203, 'demo/private/tutor-203-evidence.pdf', 'TUTOR_EVIDENCE', 'Chung-chi-DEMO.pdf', 'application/pdf', 12002, UNHEX(SHA2('DEMO-FILE-TUTOR-203',256)), '2026-03-01 10:00:00.000000'),
        (1004, 204, 'demo/private/tutor-204-evidence.pdf', 'TUTOR_EVIDENCE', 'Chung-chi-DEMO.pdf', 'application/pdf', 12003, UNHEX(SHA2('DEMO-FILE-TUTOR-204',256)), '2026-03-01 10:00:00.000000'),
        (1005, 205, 'demo/private/tutor-205-evidence.pdf', 'TUTOR_EVIDENCE', 'Chung-chi-DEMO.pdf', 'application/pdf', 12004, UNHEX(SHA2('DEMO-FILE-TUTOR-205',256)), '2026-03-01 10:00:00.000000'),
        (1006, 206, 'demo/private/tutor-206-evidence.pdf', 'TUTOR_EVIDENCE', 'Chung-chi-DEMO.pdf', 'application/pdf', 12005, UNHEX(SHA2('DEMO-FILE-TUTOR-206',256)), '2026-03-01 10:00:00.000000'),
        (29001, 301, 'demo/private/report-28001-evidence.png', 'REPORT_EVIDENCE', 'Minh-chung-DEMO.png', 'image/png', 5001, UNHEX(SHA2('DEMO-FILE-REPORT-1',256)), '2026-10-14 10:00:00.000000'),
        (29002, 302, 'demo/private/report-28002-evidence.png', 'REPORT_EVIDENCE', 'Minh-chung-DEMO.png', 'image/png', 5002, UNHEX(SHA2('DEMO-FILE-REPORT-2',256)), '2026-10-14 10:00:00.000000'),
        (29003, 303, 'demo/private/report-28003-evidence.png', 'REPORT_EVIDENCE', 'Minh-chung-DEMO.png', 'image/png', 5003, UNHEX(SHA2('DEMO-FILE-REPORT-3',256)), '2026-10-14 10:00:00.000000'),
        (29004, 201, 'demo/private/report-28004-evidence.png', 'REPORT_EVIDENCE', 'Minh-chung-DEMO.png', 'image/png', 5004, UNHEX(SHA2('DEMO-FILE-REPORT-4',256)), '2026-10-14 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_tutor_profile_evidence LIKE tutor_profile_evidence;
    INSERT INTO seed_expected_tutor_profile_evidence (tutor_id, file_id) VALUES
        (201, 1001),
        (202, 1002),
        (203, 1003),
        (204, 1004),
        (205, 1005),
        (206, 1006);
    
    CREATE TEMPORARY TABLE seed_expected_auth_tokens LIKE auth_tokens;
    INSERT INTO seed_expected_auth_tokens (id, user_id, purpose, token_hash, created_at, expires_at, used_at, revoked_at) VALUES
        (1101, 309, 'VERIFY_EMAIL', UNHEX(SHA2('DEMO-TOKEN-VERIFY-PENDING',256)), '2026-10-14 10:00:00.000000', '2026-10-16 10:00:00.000000', NULL, NULL),
        (1102, 301, 'VERIFY_EMAIL', UNHEX(SHA2('DEMO-TOKEN-VERIFY-USED',256)), '2026-03-01 10:00:00.000000', '2026-03-03 10:00:00.000000', '2026-03-02 10:00:00.000000', NULL),
        (1103, 302, 'RESET_PASSWORD', UNHEX(SHA2('DEMO-TOKEN-RESET-EXPIRED',256)), '2026-09-01 10:00:00.000000', '2026-09-02 10:00:00.000000', NULL, NULL),
        (1104, 303, 'RESET_PASSWORD', UNHEX(SHA2('DEMO-TOKEN-RESET-REVOKED',256)), '2026-10-14 10:00:00.000000', '2026-10-16 10:00:00.000000', NULL, '2026-10-14 11:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_offerings LIKE offerings;
    INSERT INTO seed_expected_offerings (id, public_code, tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, capacity, starts_on, ends_on, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at) VALUES
        (2001, 'DEMO-OF-01', 201, 'SERVICE', 'Dịch vụ Toán 1', 'Gói học DEMO; không dùng như điều khoản production.', 1, 1, 1, 1, 160005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-06 10:00:00.000000', '2026-03-06 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 1: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2002, 'DEMO-OF-02', 202, 'SERVICE', 'Dịch vụ Ngữ văn 2', 'Gói học DEMO; không dùng như điều khoản production.', 2, 2, 2, 2, 170005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-07 10:00:00.000000', '2026-03-07 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 2: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2003, 'DEMO-OF-03', 203, 'SERVICE', 'Dịch vụ Tiếng Anh 3', 'Gói học DEMO; không dùng như điều khoản production.', 3, 3, 3, 3, 180005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-08 10:00:00.000000', '2026-03-08 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 3: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2004, 'DEMO-OF-04', 204, 'SERVICE', 'Dịch vụ Vật lý 4', 'Gói học DEMO; không dùng như điều khoản production.', 4, 4, 1, 1, 190005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-09 10:00:00.000000', '2026-03-09 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 4: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2005, 'DEMO-OF-05', 205, 'SERVICE', 'Dịch vụ Hóa học 5', 'Gói học DEMO; không dùng như điều khoản production.', 5, 5, 2, 2, 200005, 'VND', 5, 90, NULL, NULL, NULL, 'DRAFT', NULL, NULL, NULL, NULL, NULL, 1, 'Điều khoản DEMO 5: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2006, 'DEMO-OF-06', 206, 'SERVICE', 'Dịch vụ Toán 6', 'Gói học DEMO; không dùng như điều khoản production.', 1, 6, 3, 3, 210005, 'VND', 5, 90, NULL, NULL, NULL, 'CLOSED', '2026-03-11 10:00:00.000000', '2026-03-11 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 6: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-10-14 10:00:00.000000'),
        (2007, 'DEMO-OF-07', 201, 'SERVICE', 'Dịch vụ Ngữ văn 7', 'Gói học DEMO; không dùng như điều khoản production.', 2, 7, 1, 1, 220005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-12 10:00:00.000000', '2026-03-12 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 7: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2008, 'DEMO-OF-08', 202, 'SERVICE', 'Dịch vụ Tiếng Anh 8', 'Gói học DEMO; không dùng như điều khoản production.', 3, 1, 2, 2, 230005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-13 10:00:00.000000', '2026-03-13 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 8: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2009, 'DEMO-OF-09', 203, 'SERVICE', 'Dịch vụ Vật lý 9', 'Gói học DEMO; không dùng như điều khoản production.', 4, 2, 3, 3, 240005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-14 10:00:00.000000', '2026-03-14 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 9: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2010, 'DEMO-OF-10', 204, 'SERVICE', 'Dịch vụ Hóa học 10', 'Gói học DEMO; không dùng như điều khoản production.', 5, 3, 1, 1, 250005, 'VND', 5, 90, NULL, NULL, NULL, 'PUBLISHED', '2026-03-15 10:00:00.000000', '2026-03-15 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 10: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2011, 'DEMO-OF-11', 205, 'SERVICE', 'Dịch vụ Toán 11', 'Gói học DEMO; không dùng như điều khoản production.', 1, 4, 2, 2, 260005, 'VND', 5, 90, NULL, NULL, NULL, 'IN_REVIEW', NULL, NULL, NULL, NULL, NULL, 1, 'Điều khoản DEMO 11: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2012, 'DEMO-OF-12', 206, 'SERVICE', 'Dịch vụ Ngữ văn 12', 'Gói học DEMO; không dùng như điều khoản production.', 2, 5, 3, 3, 270005, 'VND', 5, 90, NULL, NULL, NULL, 'REJECTED', NULL, NULL, 100, '2026-03-04 10:00:00.000000', 'DEMO: mô tả cần bổ sung.', 1, 'Điều khoản DEMO 12: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2013, 'DEMO-OF-13', 201, 'GROUP_CLASS', 'Lớp nhóm Tiếng Anh 13', 'Gói học DEMO; không dùng như điều khoản production.', 3, 6, 1, 1, 280005, 'VND', 5, 90, 2, '2026-10-01', '2026-10-31', 'PUBLISHED', '2026-03-18 10:00:00.000000', '2026-03-18 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2014, 'DEMO-OF-14', 202, 'GROUP_CLASS', 'Lớp nhóm Vật lý 14', 'Gói học DEMO; không dùng như điều khoản production.', 4, 7, 2, 2, 290005, 'VND', 5, 90, 8, '2026-10-01', '2026-10-31', 'PUBLISHED', '2026-03-19 10:00:00.000000', '2026-03-19 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 14: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2015, 'DEMO-OF-15', 203, 'GROUP_CLASS', 'Lớp nhóm Hóa học 15', 'Gói học DEMO; không dùng như điều khoản production.', 5, 1, 3, 3, 300005, 'VND', 5, 90, 8, '2026-10-01', '2026-10-31', 'PUBLISHED', '2026-03-20 10:00:00.000000', '2026-03-20 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 15: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2016, 'DEMO-OF-16', 204, 'GROUP_CLASS', 'Lớp nhóm Toán 16', 'Gói học DEMO; không dùng như điều khoản production.', 1, 2, 1, 1, 310005, 'VND', 5, 90, 8, '2026-10-01', '2026-10-31', 'CLOSED', '2026-03-21 10:00:00.000000', '2026-03-21 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 16: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-10-14 10:00:00.000000'),
        (2017, 'DEMO-OF-17', 201, 'GROUP_CLASS', 'Lớp nhóm Ngữ văn 17', 'Gói học DEMO; không dùng như điều khoản production.', 2, 3, 2, 2, 320005, 'VND', 5, 90, 8, '2026-10-01', '2026-10-31', 'PUBLISHED', '2026-03-22 10:00:00.000000', '2026-03-22 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 17: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000'),
        (2018, 'DEMO-OF-18', 202, 'GROUP_CLASS', 'Lớp nhóm Tiếng Anh 18', 'Gói học DEMO; không dùng như điều khoản production.', 3, 4, 3, 3, 330005, 'VND', 5, 90, 8, '2026-10-01', '2026-10-31', 'PUBLISHED', '2026-03-23 10:00:00.000000', '2026-03-23 10:00:00.000000', 100, '2026-03-04 10:00:00.000000', NULL, 1, 'Điều khoản DEMO 18: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', 0, '2026-03-03 10:00:00.000000', '2026-03-05 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_offering_time_slots LIKE offering_time_slots;
    INSERT INTO seed_expected_offering_time_slots (id, offering_id, weekday, start_time, end_time, time_zone) VALUES
        (2101, 2001, 2, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2102, 2002, 3, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2103, 2003, 4, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2104, 2004, 5, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2105, 2005, 6, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2106, 2006, 7, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2107, 2007, 1, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2108, 2008, 2, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2109, 2009, 3, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2110, 2010, 4, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2111, 2011, 5, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2112, 2012, 6, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2113, 2013, 7, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2114, 2014, 1, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2115, 2015, 2, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2116, 2016, 3, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2117, 2017, 4, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh'),
        (2118, 2018, 5, '18:00:00', '19:30:00', 'Asia/Ho_Chi_Minh');
    
    CREATE TEMPORARY TABLE seed_expected_invitations LIKE invitations;
    INSERT INTO seed_expected_invitations (id, public_code, learner_id, tutor_id, offering_id, subject_id, grade_level_id, area_id, delivery_mode_id, proposed_unit_price, session_count, terms_version, terms_text, status, accepted_at, version, created_at, expires_at) VALUES
        (12001, 'DEMO-INV-1', 301, 201, 2001, 1, 1, 1, 1, 130005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 1: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-05-07 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12002, 'DEMO-INV-2', 302, 202, 2002, 2, 2, 2, 2, 140005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 2: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-06-09 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12003, 'DEMO-INV-3', 303, 203, 2003, 3, 3, 3, 3, 150005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 3: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-07-13 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12004, 'DEMO-INV-4', 304, 204, 2004, 4, 4, 1, 1, 160005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 4: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-09-04 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12005, 'DEMO-INV-5', 305, 201, 2001, 1, 1, 1, 1, 170005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 5: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-10-08 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12006, 'DEMO-INV-6', 306, 202, 2002, 2, 2, 2, 2, 180005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 6: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-10-08 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12007, 'DEMO-INV-7', 307, 203, 2003, 3, 3, 3, 3, 190005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 7: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-10-08 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12008, 'DEMO-INV-8', 308, 204, 2004, 4, 4, 1, 1, 200005, 5, 1, 'Điều khoản DEMO nguồn INVITATION 8: 5 buổi, 90 phút, hai bên đồng ý.', 'ACCEPTED', '2026-10-08 10:00:00.000000', 0, '2026-03-01 10:00:00.000000', '2026-10-30 10:00:00.000000'),
        (12901, 'DEMO-INV-EXTRA-1', 301, 201, NULL, 1, 3, 1, 1, 200000, 5, 1, 'Điều khoản lời mời DEMO chưa tạo đơn.', 'PENDING', NULL, 0, '2026-10-01 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (12902, 'DEMO-INV-EXTRA-2', 301, 201, NULL, 1, 3, 1, 1, 200000, 5, 1, 'Điều khoản lời mời DEMO chưa tạo đơn.', 'DECLINED', NULL, 0, '2026-10-01 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (12903, 'DEMO-INV-EXTRA-3', 301, 201, NULL, 1, 3, 1, 1, 200000, 5, 1, 'Điều khoản lời mời DEMO chưa tạo đơn.', 'EXPIRED', NULL, 0, '2026-10-01 10:00:00.000000', '2026-10-02 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_job_posts LIKE job_posts;
    INSERT INTO seed_expected_job_posts (id, public_code, learner_id, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, budget_per_session, session_count, status, version, created_at) VALUES
        (13009, 'DEMO-JOB-9', 301, 'Tin tìm gia sư DEMO 9', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 4, 2, 3, 3, 210005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13010, 'DEMO-JOB-10', 302, 'Tin tìm gia sư DEMO 10', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 5, 3, 1, 1, 220005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13011, 'DEMO-JOB-11', 303, 'Tin tìm gia sư DEMO 11', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 1, 4, 2, 2, 230005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13012, 'DEMO-JOB-12', 304, 'Tin tìm gia sư DEMO 12', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 2, 5, 3, 3, 240005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13013, 'DEMO-JOB-13', 305, 'Tin tìm gia sư DEMO 13', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 3, 6, 1, 1, 250005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13014, 'DEMO-JOB-14', 306, 'Tin tìm gia sư DEMO 14', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 4, 7, 2, 2, 260005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13015, 'DEMO-JOB-15', 307, 'Tin tìm gia sư DEMO 15', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 5, 1, 3, 3, 270005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13016, 'DEMO-JOB-16', 308, 'Tin tìm gia sư DEMO 16', 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.', 1, 2, 1, 1, 280005, 5, 'MATCHED', 0, '2026-03-01 10:00:00.000000'),
        (13901, 'DEMO-JOB-EXTRA-1', 302, 'Tin DEMO chưa chọn gia sư 1', 'Dữ liệu kiểm tra không tự tạo order.', 3, 4, 2, 1, 220000, 5, 'OPEN', 0, '2026-10-01 10:00:00.000000'),
        (13902, 'DEMO-JOB-EXTRA-2', 302, 'Tin DEMO chưa chọn gia sư 2', 'Dữ liệu kiểm tra không tự tạo order.', 3, 4, 2, 1, 220000, 5, 'PENDING', 0, '2026-10-01 10:00:00.000000'),
        (13903, 'DEMO-JOB-EXTRA-3', 302, 'Tin DEMO chưa chọn gia sư 3', 'Dữ liệu kiểm tra không tự tạo order.', 3, 4, 2, 1, 220000, 5, 'CLOSED', 0, '2026-10-01 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_job_applications LIKE job_applications;
    INSERT INTO seed_expected_job_applications (id, job_id, tutor_id, proposed_unit_price, message, status, version, created_at) VALUES
        (14009, 13009, 201, 210005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14109, 13009, 202, 215005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14010, 13010, 202, 220005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14110, 13010, 203, 225005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14011, 13011, 203, 230005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14111, 13011, 204, 235005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14012, 13012, 204, 240005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14112, 13012, 201, 245005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14013, 13013, 201, 250005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14113, 13013, 202, 255005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14014, 13014, 202, 260005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14114, 13014, 203, 265005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14015, 13015, 203, 270005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14115, 13015, 204, 275005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14016, 13016, 204, 280005, 'Gia sư đồng ý điều khoản DEMO.', 'SELECTED', 0, '2026-03-02 10:00:00.000000'),
        (14116, 13016, 201, 285005, 'Ứng viên khác chưa được chọn.', 'REJECTED', 0, '2026-03-02 10:00:00.000000'),
        (14901, 13901, 202, 220000, 'Ứng tuyển DEMO chờ lựa chọn.', 'SUBMITTED', 0, '2026-10-02 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_job_selections LIKE job_selections;
    INSERT INTO seed_expected_job_selections (job_id, application_id, tutor_id, selected_by, terms_version, terms_text, selected_at) VALUES
        (13009, 14009, 201, 301, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 9: 5 buổi, 90 phút, hai bên đồng ý.', '2026-09-08 10:00:00.000000'),
        (13010, 14010, 202, 302, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 10: 5 buổi, 90 phút, hai bên đồng ý.', '2026-09-30 10:00:00.000000'),
        (13011, 14011, 203, 303, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 11: 5 buổi, 90 phút, hai bên đồng ý.', '2026-10-03 10:00:00.000000'),
        (13012, 14012, 204, 304, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 12: 5 buổi, 90 phút, hai bên đồng ý.', '2026-10-08 10:00:00.000000'),
        (13013, 14013, 201, 305, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 13: 5 buổi, 90 phút, hai bên đồng ý.', '2026-10-08 10:00:00.000000'),
        (13014, 14014, 202, 306, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 14: 5 buổi, 90 phút, hai bên đồng ý.', '2026-10-08 10:00:00.000000'),
        (13015, 14015, 203, 307, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 15: 5 buổi, 90 phút, hai bên đồng ý.', '2026-10-08 10:00:00.000000'),
        (13016, 14016, 204, 308, 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 16: 5 buổi, 90 phút, hai bên đồng ý.', '2026-10-08 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_registration_sources LIKE registration_sources;
    INSERT INTO seed_expected_registration_sources (id, source_kind, learner_id, tutor_id, invitation_id, job_id, application_id, offering_id, created_at) VALUES
        (4001, 'INVITATION', 301, 201, 12001, NULL, NULL, 2001, '2026-05-07 10:00:00.000000'),
        (4002, 'INVITATION', 302, 202, 12002, NULL, NULL, 2002, '2026-06-09 10:00:00.000000'),
        (4003, 'INVITATION', 303, 203, 12003, NULL, NULL, 2003, '2026-07-13 10:00:00.000000'),
        (4004, 'INVITATION', 304, 204, 12004, NULL, NULL, 2004, '2026-09-04 10:00:00.000000'),
        (4005, 'INVITATION', 305, 201, 12005, NULL, NULL, 2001, '2026-10-08 10:00:00.000000'),
        (4006, 'INVITATION', 306, 202, 12006, NULL, NULL, 2002, '2026-10-08 10:00:00.000000'),
        (4007, 'INVITATION', 307, 203, 12007, NULL, NULL, 2003, '2026-10-08 10:00:00.000000'),
        (4008, 'INVITATION', 308, 204, 12008, NULL, NULL, 2004, '2026-10-08 10:00:00.000000'),
        (4009, 'JOB_APPLICATION', 301, 201, NULL, 13009, 14009, NULL, '2026-09-08 10:00:00.000000'),
        (4010, 'JOB_APPLICATION', 302, 202, NULL, 13010, 14010, NULL, '2026-09-30 10:00:00.000000'),
        (4011, 'JOB_APPLICATION', 303, 203, NULL, 13011, 14011, NULL, '2026-10-03 10:00:00.000000'),
        (4012, 'JOB_APPLICATION', 304, 204, NULL, 13012, 14012, NULL, '2026-10-08 10:00:00.000000'),
        (4013, 'JOB_APPLICATION', 305, 201, NULL, 13013, 14013, NULL, '2026-10-08 10:00:00.000000'),
        (4014, 'JOB_APPLICATION', 306, 202, NULL, 13014, 14014, NULL, '2026-10-08 10:00:00.000000'),
        (4015, 'JOB_APPLICATION', 307, 203, NULL, 13015, 14015, NULL, '2026-10-08 10:00:00.000000'),
        (4016, 'JOB_APPLICATION', 308, 204, NULL, 13016, 14016, NULL, '2026-10-08 10:00:00.000000'),
        (4017, 'CATALOG', 301, 202, NULL, NULL, NULL, 2014, '2026-10-04 10:00:00.000000'),
        (4018, 'CATALOG', 302, 202, NULL, NULL, NULL, 2002, '2026-10-07 10:00:00.000000'),
        (4019, 'CATALOG', 302, 203, NULL, NULL, NULL, 2003, '2026-10-07 10:00:00.000000'),
        (4020, 'CATALOG', 303, 201, NULL, NULL, NULL, 2013, '2026-10-08 10:00:00.000000'),
        (4021, 'CATALOG', 304, 201, NULL, NULL, NULL, 2013, '2026-10-08 10:00:00.000000'),
        (4022, 'CATALOG', 304, 204, NULL, NULL, NULL, 2004, '2026-10-08 10:00:00.000000'),
        (4023, 'CATALOG', 305, 203, NULL, NULL, NULL, 2015, '2026-10-08 10:00:00.000000'),
        (4024, 'CATALOG', 306, 204, NULL, NULL, NULL, 2016, '2026-10-08 10:00:00.000000'),
        (4025, 'CATALOG', 307, 201, NULL, NULL, NULL, 2001, '2026-10-08 10:00:00.000000'),
        (4026, 'CATALOG', 308, 201, NULL, NULL, NULL, 2017, '2026-10-08 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_carts LIKE carts;
    INSERT INTO seed_expected_carts (id, learner_id, version, updated_at) VALUES
        (3001, 301, 0, '2026-10-15 00:00:00.000000'),
        (3002, 302, 0, '2026-10-15 00:00:00.000000'),
        (3003, 303, 0, '2026-10-15 00:00:00.000000'),
        (3004, 304, 0, '2026-10-15 00:00:00.000000'),
        (3005, 305, 0, '2026-10-15 00:00:00.000000'),
        (3006, 306, 0, '2026-10-15 00:00:00.000000'),
        (3007, 307, 0, '2026-10-15 00:00:00.000000'),
        (3008, 308, 0, '2026-10-15 00:00:00.000000'),
        (3009, 309, 0, '2026-10-15 00:00:00.000000'),
        (3010, 310, 0, '2026-10-15 00:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_cart_items LIKE cart_items;
    INSERT INTO seed_expected_cart_items (id, cart_id, offering_id, seat_count, offering_version_seen, created_at) VALUES
        (3101, 3001, 2001, 1, 0, '2026-10-15 00:00:00.000000'),
        (3102, 3001, 2015, 2, 0, '2026-10-15 00:00:00.000000'),
        (3103, 3002, 2013, 1, 0, '2026-10-15 00:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_orders LIKE orders;
    INSERT INTO seed_expected_orders (id, public_code, learner_id, status, total_amount, currency, creation_key, cancellation_reason, cancelled_at, version, created_at, updated_at) VALUES
        (9001, 'DEMO-ORDER-01', 301, 'COMPLETED', 650025, 'VND', 'DEMO-CREATE-ORDER-1', NULL, NULL, 3, '2026-05-07 10:00:00.000000', '2026-05-10 10:00:00.000000'),
        (9002, 'DEMO-ORDER-02', 302, 'COMPLETED', 700025, 'VND', 'DEMO-CREATE-ORDER-2', NULL, NULL, 3, '2026-06-09 10:00:00.000000', '2026-06-12 10:00:00.000000'),
        (9003, 'DEMO-ORDER-03', 303, 'COMPLETED', 750025, 'VND', 'DEMO-CREATE-ORDER-3', NULL, NULL, 3, '2026-07-13 10:00:00.000000', '2026-07-16 10:00:00.000000'),
        (9004, 'DEMO-ORDER-04', 304, 'COMPLETED', 800025, 'VND', 'DEMO-CREATE-ORDER-4', NULL, NULL, 3, '2026-09-04 10:00:00.000000', '2026-09-07 10:00:00.000000'),
        (9005, 'DEMO-ORDER-05', 305, 'PAID', 850025, 'VND', 'DEMO-CREATE-ORDER-5', NULL, NULL, 1, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9006, 'DEMO-ORDER-06', 306, 'IN_PROGRESS', 900025, 'VND', 'DEMO-CREATE-ORDER-6', NULL, NULL, 2, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9007, 'DEMO-ORDER-07', 307, 'AWAITING_PAYMENT', 950025, 'VND', 'DEMO-CREATE-ORDER-7', NULL, NULL, 0, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9008, 'DEMO-ORDER-08', 308, 'CANCELLED', 1000025, 'VND', 'DEMO-CREATE-ORDER-8', 'Người học yêu cầu hủy trong kịch bản DEMO.', '2026-10-12 10:00:00.000000', 1, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9009, 'DEMO-ORDER-09', 301, 'COMPLETED', 1050025, 'VND', 'DEMO-CREATE-ORDER-9', NULL, NULL, 3, '2026-09-08 10:00:00.000000', '2026-09-11 10:00:00.000000'),
        (9010, 'DEMO-ORDER-10', 302, 'COMPLETED', 1100025, 'VND', 'DEMO-CREATE-ORDER-10', NULL, NULL, 3, '2026-09-30 10:00:00.000000', '2026-10-03 10:00:00.000000'),
        (9011, 'DEMO-ORDER-11', 303, 'COMPLETED', 1150025, 'VND', 'DEMO-CREATE-ORDER-11', NULL, NULL, 3, '2026-10-03 10:00:00.000000', '2026-10-06 10:00:00.000000'),
        (9012, 'DEMO-ORDER-12', 304, 'PAID', 1200025, 'VND', 'DEMO-CREATE-ORDER-12', NULL, NULL, 1, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9013, 'DEMO-ORDER-13', 305, 'IN_PROGRESS', 1250025, 'VND', 'DEMO-CREATE-ORDER-13', NULL, NULL, 2, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9014, 'DEMO-ORDER-14', 306, 'CANCELLED', 1300025, 'VND', 'DEMO-CREATE-ORDER-14', 'Người học yêu cầu hủy trong kịch bản DEMO.', '2026-10-12 10:00:00.000000', 4, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9015, 'DEMO-ORDER-15', 307, 'CANCELLATION_PENDING', 1350025, 'VND', 'DEMO-CREATE-ORDER-15', 'Người học yêu cầu hủy trong kịch bản DEMO.', NULL, 3, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9016, 'DEMO-ORDER-16', 308, 'CANCELLATION_PENDING', 1400025, 'VND', 'DEMO-CREATE-ORDER-16', 'Người học yêu cầu hủy trong kịch bản DEMO.', NULL, 3, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9017, 'DEMO-ORDER-17', 301, 'COMPLETED', 1450025, 'VND', 'DEMO-CREATE-ORDER-17', NULL, NULL, 3, '2026-10-04 10:00:00.000000', '2026-10-07 10:00:00.000000'),
        (9018, 'DEMO-ORDER-18', 302, 'COMPLETED', 1750050, 'VND', 'DEMO-CREATE-ORDER-18', NULL, NULL, 3, '2026-10-07 10:00:00.000000', '2026-10-10 10:00:00.000000'),
        (9019, 'DEMO-ORDER-19', 303, 'PAID', 1400025, 'VND', 'DEMO-CREATE-ORDER-19', NULL, NULL, 1, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9020, 'DEMO-ORDER-20', 304, 'IN_PROGRESS', 2350050, 'VND', 'DEMO-CREATE-ORDER-20', NULL, NULL, 2, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9021, 'DEMO-ORDER-21', 305, 'AWAITING_PAYMENT', 1500025, 'VND', 'DEMO-CREATE-ORDER-21', NULL, NULL, 0, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9022, 'DEMO-ORDER-22', 306, 'CANCELLED', 1550025, 'VND', 'DEMO-CREATE-ORDER-22', 'Người học yêu cầu hủy trong kịch bản DEMO.', '2026-10-12 10:00:00.000000', 3, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9023, 'DEMO-ORDER-23', 307, 'AWAITING_PAYMENT', 800025, 'VND', 'DEMO-CREATE-ORDER-23', NULL, NULL, 0, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000'),
        (9024, 'DEMO-ORDER-24', 308, 'CANCELLATION_PENDING', 1600025, 'VND', 'DEMO-CREATE-ORDER-24', 'Người học yêu cầu hủy trong kịch bản DEMO.', NULL, 3, '2026-10-08 10:00:00.000000', '2026-10-12 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_order_items LIKE order_items;
    INSERT INTO seed_expected_order_items (id, order_id, line_number, registration_source_id, tutor_id, title_snapshot, offering_type_snapshot, unit_price_snapshot, session_count_snapshot, seat_count, line_total, fee_rate_snapshot, fee_policy_version, terms_version_snapshot, terms_text_snapshot, terms_hash, created_at) VALUES
        (5001, 9001, 1, 4001, 201, 'Dịch vụ Toán 1', 'SERVICE', 130005, 5, 1, 650025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 1: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 1: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-05-07 10:00:00.000000'),
        (5002, 9002, 1, 4002, 202, 'Dịch vụ Ngữ văn 2', 'SERVICE', 140005, 5, 1, 700025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 2: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 2: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-06-09 10:00:00.000000'),
        (5003, 9003, 1, 4003, 203, 'Dịch vụ Tiếng Anh 3', 'SERVICE', 150005, 5, 1, 750025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 3: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 3: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-07-13 10:00:00.000000'),
        (5004, 9004, 1, 4004, 204, 'Dịch vụ Vật lý 4', 'SERVICE', 160005, 5, 1, 800025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 4: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 4: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-09-04 10:00:00.000000'),
        (5005, 9005, 1, 4005, 201, 'Dịch vụ Toán 1', 'SERVICE', 170005, 5, 1, 850025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 5: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 5: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5006, 9006, 1, 4006, 202, 'Dịch vụ Ngữ văn 2', 'SERVICE', 180005, 5, 1, 900025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 6: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 6: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5007, 9007, 1, 4007, 203, 'Dịch vụ Tiếng Anh 3', 'SERVICE', 190005, 5, 1, 950025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 7: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 7: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5008, 9008, 1, 4008, 204, 'Dịch vụ Vật lý 4', 'SERVICE', 200005, 5, 1, 1000025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn INVITATION 8: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 8: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5009, 9009, 1, 4009, 201, 'Thỏa thuận gia sư từ tin DEMO 9', 'DIRECT', 210005, 5, 1, 1050025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 9: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 9: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-09-08 10:00:00.000000'),
        (5010, 9010, 1, 4010, 202, 'Thỏa thuận gia sư từ tin DEMO 10', 'DIRECT', 220005, 5, 1, 1100025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 10: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 10: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-09-30 10:00:00.000000'),
        (5011, 9011, 1, 4011, 203, 'Thỏa thuận gia sư từ tin DEMO 11', 'DIRECT', 230005, 5, 1, 1150025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 11: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 11: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-03 10:00:00.000000'),
        (5012, 9012, 1, 4012, 204, 'Thỏa thuận gia sư từ tin DEMO 12', 'DIRECT', 240005, 5, 1, 1200025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 12: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 12: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5013, 9013, 1, 4013, 201, 'Thỏa thuận gia sư từ tin DEMO 13', 'DIRECT', 250005, 5, 1, 1250025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 13: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 13: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5014, 9014, 1, 4014, 202, 'Thỏa thuận gia sư từ tin DEMO 14', 'DIRECT', 260005, 5, 1, 1300025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 14: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 14: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5015, 9015, 1, 4015, 203, 'Thỏa thuận gia sư từ tin DEMO 15', 'DIRECT', 270005, 5, 1, 1350025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 15: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 15: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5016, 9016, 1, 4016, 204, 'Thỏa thuận gia sư từ tin DEMO 16', 'DIRECT', 280005, 5, 1, 1400025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO nguồn JOB_APPLICATION 16: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 16: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000'),
        (5017, 9017, 1, 4017, 202, 'Lớp nhóm Vật lý 14', 'GROUP_CLASS', 290005, 5, 1, 1450025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 14: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 14: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-04 10:00:00.000000'),
        (5018, 9018, 1, 4018, 202, 'Dịch vụ Ngữ văn 2', 'SERVICE', 170005, 5, 1, 850025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 2: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 2: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-07 10:00:00.000000'),
        (5019, 9018, 2, 4019, 203, 'Dịch vụ Tiếng Anh 3', 'SERVICE', 180005, 5, 1, 900025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 3: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 3: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-07 10:00:00.000000'),
        (5020, 9019, 1, 4020, 201, 'Lớp nhóm Tiếng Anh 13', 'GROUP_CLASS', 280005, 5, 1, 1400025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000'),
        (5021, 9020, 1, 4021, 201, 'Lớp nhóm Tiếng Anh 13', 'GROUP_CLASS', 280005, 5, 1, 1400025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000'),
        (5022, 9020, 2, 4022, 204, 'Dịch vụ Vật lý 4', 'SERVICE', 190005, 5, 1, 950025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 4: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 4: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000'),
        (5023, 9021, 1, 4023, 203, 'Lớp nhóm Hóa học 15', 'GROUP_CLASS', 300005, 5, 1, 1500025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 15: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 15: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000'),
        (5024, 9022, 1, 4024, 204, 'Lớp nhóm Toán 16', 'GROUP_CLASS', 310005, 5, 1, 1550025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 16: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 16: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000'),
        (5025, 9023, 1, 4025, 201, 'Dịch vụ Toán 1', 'SERVICE', 160005, 5, 1, 800025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 1: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 1: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000'),
        (5026, 9024, 1, 4026, 201, 'Lớp nhóm Ngữ văn 17', 'GROUP_CLASS', 320005, 5, 1, 1600025, '0.100000', 'DEMO-FEE-10PCT-V1', 1, 'Điều khoản DEMO 17: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 17: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_contracts LIKE contracts;
    INSERT INTO seed_expected_contracts (id, public_code, order_item_id, learner_id, tutor_id, status, agreed_terms_text, agreed_terms_hash, learner_accepted_at, tutor_accepted_at, completed_at, version, created_at) VALUES
        (6001, 'DEMO-CONTRACT-6001', 5001, 301, 201, 'COMPLETED', 'Điều khoản DEMO nguồn INVITATION 1: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 1: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-05-07 10:00:00.000000', '2026-05-07 10:00:00.000000', '2026-05-10 10:00:00.000000', 2, '2026-05-07 10:00:00.000000'),
        (6002, 'DEMO-CONTRACT-6002', 5002, 302, 202, 'COMPLETED', 'Điều khoản DEMO nguồn INVITATION 2: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 2: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-06-09 10:00:00.000000', '2026-06-09 10:00:00.000000', '2026-06-12 10:00:00.000000', 2, '2026-06-09 10:00:00.000000'),
        (6003, 'DEMO-CONTRACT-6003', 5003, 303, 203, 'COMPLETED', 'Điều khoản DEMO nguồn INVITATION 3: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 3: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-07-13 10:00:00.000000', '2026-07-13 10:00:00.000000', '2026-07-16 10:00:00.000000', 2, '2026-07-13 10:00:00.000000'),
        (6004, 'DEMO-CONTRACT-6004', 5004, 304, 204, 'COMPLETED', 'Điều khoản DEMO nguồn INVITATION 4: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 4: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-09-04 10:00:00.000000', '2026-09-04 10:00:00.000000', '2026-09-07 10:00:00.000000', 2, '2026-09-04 10:00:00.000000'),
        (6005, 'DEMO-CONTRACT-6005', 5005, 305, 201, 'ACTIVE', 'Điều khoản DEMO nguồn INVITATION 5: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 5: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6006, 'DEMO-CONTRACT-6006', 5006, 306, 202, 'ACTIVE', 'Điều khoản DEMO nguồn INVITATION 6: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 6: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6007, 'DEMO-CONTRACT-6007', 5007, 307, 203, 'AWAITING_PAYMENT', 'Điều khoản DEMO nguồn INVITATION 7: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 7: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 0, '2026-10-08 10:00:00.000000'),
        (6008, 'DEMO-CONTRACT-6008', 5008, 308, 204, 'CANCELLED', 'Điều khoản DEMO nguồn INVITATION 8: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn INVITATION 8: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6009, 'DEMO-CONTRACT-6009', 5009, 301, 201, 'COMPLETED', 'Điều khoản DEMO nguồn JOB_APPLICATION 9: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 9: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-09-08 10:00:00.000000', '2026-09-08 10:00:00.000000', '2026-09-11 10:00:00.000000', 2, '2026-09-08 10:00:00.000000'),
        (6010, 'DEMO-CONTRACT-6010', 5010, 302, 202, 'COMPLETED', 'Điều khoản DEMO nguồn JOB_APPLICATION 10: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 10: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-09-30 10:00:00.000000', '2026-09-30 10:00:00.000000', '2026-10-03 10:00:00.000000', 2, '2026-09-30 10:00:00.000000'),
        (6011, 'DEMO-CONTRACT-6011', 5011, 303, 203, 'COMPLETED', 'Điều khoản DEMO nguồn JOB_APPLICATION 11: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 11: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-03 10:00:00.000000', '2026-10-03 10:00:00.000000', '2026-10-06 10:00:00.000000', 2, '2026-10-03 10:00:00.000000'),
        (6012, 'DEMO-CONTRACT-6012', 5012, 304, 204, 'ACTIVE', 'Điều khoản DEMO nguồn JOB_APPLICATION 12: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 12: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6013, 'DEMO-CONTRACT-6013', 5013, 305, 201, 'ACTIVE', 'Điều khoản DEMO nguồn JOB_APPLICATION 13: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 13: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6014, 'DEMO-CONTRACT-6014', 5014, 306, 202, 'CANCELLED', 'Điều khoản DEMO nguồn JOB_APPLICATION 14: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 14: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 3, '2026-10-08 10:00:00.000000'),
        (6015, 'DEMO-CONTRACT-6015', 5015, 307, 203, 'CANCELLATION_PENDING', 'Điều khoản DEMO nguồn JOB_APPLICATION 15: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 15: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 2, '2026-10-08 10:00:00.000000'),
        (6016, 'DEMO-CONTRACT-6016', 5016, 308, 204, 'CANCELLATION_PENDING', 'Điều khoản DEMO nguồn JOB_APPLICATION 16: 5 buổi, 90 phút, hai bên đồng ý.', UNHEX(SHA2('Điều khoản DEMO nguồn JOB_APPLICATION 16: 5 buổi, 90 phút, hai bên đồng ý.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 2, '2026-10-08 10:00:00.000000'),
        (6017, 'DEMO-CONTRACT-6017', 5017, 301, 202, 'COMPLETED', 'Điều khoản DEMO 14: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 14: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-04 10:00:00.000000', '2026-10-04 10:00:00.000000', '2026-10-07 10:00:00.000000', 2, '2026-10-04 10:00:00.000000'),
        (6018, 'DEMO-CONTRACT-6018', 5018, 302, 202, 'COMPLETED', 'Điều khoản DEMO 2: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 2: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-07 10:00:00.000000', '2026-10-07 10:00:00.000000', '2026-10-10 10:00:00.000000', 2, '2026-10-07 10:00:00.000000'),
        (6019, 'DEMO-CONTRACT-6019', 5019, 302, 203, 'COMPLETED', 'Điều khoản DEMO 3: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 3: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-07 10:00:00.000000', '2026-10-07 10:00:00.000000', '2026-10-10 10:00:00.000000', 2, '2026-10-07 10:00:00.000000'),
        (6020, 'DEMO-CONTRACT-6020', 5020, 303, 201, 'ACTIVE', 'Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6021, 'DEMO-CONTRACT-6021', 5021, 304, 201, 'ACTIVE', 'Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 13: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6022, 'DEMO-CONTRACT-6022', 5022, 304, 204, 'ACTIVE', 'Điều khoản DEMO 4: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 4: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 1, '2026-10-08 10:00:00.000000'),
        (6023, 'DEMO-CONTRACT-6023', 5023, 305, 203, 'AWAITING_PAYMENT', 'Điều khoản DEMO 15: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 15: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 0, '2026-10-08 10:00:00.000000'),
        (6024, 'DEMO-CONTRACT-6024', 5024, 306, 204, 'CANCELLED', 'Điều khoản DEMO 16: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 16: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 3, '2026-10-08 10:00:00.000000'),
        (6025, 'DEMO-CONTRACT-6025', 5025, 307, 201, 'AWAITING_PAYMENT', 'Điều khoản DEMO 1: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 1: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 0, '2026-10-08 10:00:00.000000'),
        (6026, 'DEMO-CONTRACT-6026', 5026, 308, 201, 'CANCELLATION_PENDING', 'Điều khoản DEMO 17: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.', UNHEX(SHA2('Điều khoản DEMO 17: 5 buổi, 90 phút/buổi, giá được snapshot khi đặt.',256)), '2026-10-08 10:00:00.000000', '2026-10-08 10:00:00.000000', NULL, 2, '2026-10-08 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_order_status_history LIKE order_status_history;
    INSERT INTO seed_expected_order_status_history (id, order_id, from_status, to_status, actor_user_id, reason, entity_version, changed_at, actor_role_code) VALUES
        (8001, 9001, 'NEW', 'AWAITING_PAYMENT', 301, 'Luồng DEMO cơ bản.', 0, '2026-05-07 10:00:00.000000', 'LEARNER'),
        (8002, 9001, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-05-07 11:00:00.000000', 'ADMIN'),
        (8003, 9001, 'PAID', 'IN_PROGRESS', 201, 'Luồng DEMO cơ bản.', 2, '2026-05-07 12:00:00.000000', 'TUTOR'),
        (8004, 9001, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-05-10 10:00:00.000000', 'ADMIN'),
        (8005, 9002, 'NEW', 'AWAITING_PAYMENT', 302, 'Luồng DEMO cơ bản.', 0, '2026-06-09 10:00:00.000000', 'LEARNER'),
        (8006, 9002, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-06-09 11:00:00.000000', 'ADMIN'),
        (8007, 9002, 'PAID', 'IN_PROGRESS', 202, 'Luồng DEMO cơ bản.', 2, '2026-06-09 12:00:00.000000', 'TUTOR'),
        (8008, 9002, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-06-12 10:00:00.000000', 'ADMIN'),
        (8009, 9003, 'NEW', 'AWAITING_PAYMENT', 303, 'Luồng DEMO cơ bản.', 0, '2026-07-13 10:00:00.000000', 'LEARNER'),
        (8010, 9003, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-07-13 11:00:00.000000', 'ADMIN'),
        (8011, 9003, 'PAID', 'IN_PROGRESS', 203, 'Luồng DEMO cơ bản.', 2, '2026-07-13 12:00:00.000000', 'TUTOR'),
        (8012, 9003, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-07-16 10:00:00.000000', 'ADMIN'),
        (8013, 9004, 'NEW', 'AWAITING_PAYMENT', 304, 'Luồng DEMO cơ bản.', 0, '2026-09-04 10:00:00.000000', 'LEARNER'),
        (8014, 9004, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-09-04 11:00:00.000000', 'ADMIN'),
        (8015, 9004, 'PAID', 'IN_PROGRESS', 204, 'Luồng DEMO cơ bản.', 2, '2026-09-04 12:00:00.000000', 'TUTOR'),
        (8016, 9004, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-09-07 10:00:00.000000', 'ADMIN'),
        (8017, 9005, 'NEW', 'AWAITING_PAYMENT', 305, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8018, 9005, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8019, 9006, 'NEW', 'AWAITING_PAYMENT', 306, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8020, 9006, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8021, 9006, 'PAID', 'IN_PROGRESS', 202, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8022, 9007, 'NEW', 'AWAITING_PAYMENT', 307, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8023, 9008, 'NEW', 'AWAITING_PAYMENT', 308, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8024, 9008, 'AWAITING_PAYMENT', 'CANCELLED', 308, 'Luồng DEMO cơ bản.', 1, '2026-10-12 10:00:00.000000', 'LEARNER'),
        (8025, 9009, 'NEW', 'AWAITING_PAYMENT', 301, 'Luồng DEMO cơ bản.', 0, '2026-09-08 10:00:00.000000', 'LEARNER'),
        (8026, 9009, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-09-08 11:00:00.000000', 'ADMIN'),
        (8027, 9009, 'PAID', 'IN_PROGRESS', 201, 'Luồng DEMO cơ bản.', 2, '2026-09-08 12:00:00.000000', 'TUTOR'),
        (8028, 9009, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-09-11 10:00:00.000000', 'ADMIN'),
        (8029, 9010, 'NEW', 'AWAITING_PAYMENT', 302, 'Luồng DEMO cơ bản.', 0, '2026-09-30 10:00:00.000000', 'LEARNER'),
        (8030, 9010, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-09-30 11:00:00.000000', 'ADMIN'),
        (8031, 9010, 'PAID', 'IN_PROGRESS', 202, 'Luồng DEMO cơ bản.', 2, '2026-09-30 12:00:00.000000', 'TUTOR'),
        (8032, 9010, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-10-03 10:00:00.000000', 'ADMIN'),
        (8033, 9011, 'NEW', 'AWAITING_PAYMENT', 303, 'Luồng DEMO cơ bản.', 0, '2026-10-03 10:00:00.000000', 'LEARNER'),
        (8034, 9011, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-03 11:00:00.000000', 'ADMIN'),
        (8035, 9011, 'PAID', 'IN_PROGRESS', 203, 'Luồng DEMO cơ bản.', 2, '2026-10-03 12:00:00.000000', 'TUTOR'),
        (8036, 9011, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-10-06 10:00:00.000000', 'ADMIN'),
        (8037, 9012, 'NEW', 'AWAITING_PAYMENT', 304, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8038, 9012, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8039, 9013, 'NEW', 'AWAITING_PAYMENT', 305, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8040, 9013, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8041, 9013, 'PAID', 'IN_PROGRESS', 201, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8042, 9014, 'NEW', 'AWAITING_PAYMENT', 306, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8043, 9014, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8044, 9014, 'PAID', 'IN_PROGRESS', 202, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8045, 9014, 'IN_PROGRESS', 'CANCELLATION_PENDING', 306, 'Luồng DEMO cơ bản.', 3, '2026-10-08 12:00:00.000000', 'LEARNER'),
        (8046, 9014, 'CANCELLATION_PENDING', 'CANCELLED', 100, 'Luồng DEMO cơ bản.', 4, '2026-10-12 10:00:00.000000', 'ADMIN'),
        (8047, 9015, 'NEW', 'AWAITING_PAYMENT', 307, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8048, 9015, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8049, 9015, 'PAID', 'IN_PROGRESS', 203, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8050, 9015, 'IN_PROGRESS', 'CANCELLATION_PENDING', 307, 'Luồng DEMO cơ bản.', 3, '2026-10-08 12:00:00.000000', 'LEARNER'),
        (8051, 9016, 'NEW', 'AWAITING_PAYMENT', 308, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8052, 9016, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8053, 9016, 'PAID', 'IN_PROGRESS', 204, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8054, 9016, 'IN_PROGRESS', 'CANCELLATION_PENDING', 308, 'Luồng DEMO cơ bản.', 3, '2026-10-08 12:00:00.000000', 'LEARNER'),
        (8055, 9017, 'NEW', 'AWAITING_PAYMENT', 301, 'Luồng DEMO cơ bản.', 0, '2026-10-04 10:00:00.000000', 'LEARNER'),
        (8056, 9017, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-04 11:00:00.000000', 'ADMIN'),
        (8057, 9017, 'PAID', 'IN_PROGRESS', 202, 'Luồng DEMO cơ bản.', 2, '2026-10-04 12:00:00.000000', 'TUTOR'),
        (8058, 9017, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-10-07 10:00:00.000000', 'ADMIN'),
        (8059, 9018, 'NEW', 'AWAITING_PAYMENT', 302, 'Luồng DEMO cơ bản.', 0, '2026-10-07 10:00:00.000000', 'LEARNER'),
        (8060, 9018, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-07 11:00:00.000000', 'ADMIN'),
        (8061, 9018, 'PAID', 'IN_PROGRESS', 202, 'Luồng DEMO cơ bản.', 2, '2026-10-07 12:00:00.000000', 'TUTOR'),
        (8062, 9018, 'IN_PROGRESS', 'COMPLETED', 100, 'Luồng DEMO cơ bản.', 3, '2026-10-10 10:00:00.000000', 'ADMIN'),
        (8063, 9019, 'NEW', 'AWAITING_PAYMENT', 303, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8064, 9019, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8065, 9020, 'NEW', 'AWAITING_PAYMENT', 304, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8066, 9020, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8067, 9020, 'PAID', 'IN_PROGRESS', 201, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8068, 9021, 'NEW', 'AWAITING_PAYMENT', 305, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8069, 9022, 'NEW', 'AWAITING_PAYMENT', 306, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8070, 9022, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8071, 9022, 'PAID', 'CANCELLATION_PENDING', 306, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'LEARNER'),
        (8072, 9022, 'CANCELLATION_PENDING', 'CANCELLED', 100, 'Luồng DEMO cơ bản.', 3, '2026-10-12 10:00:00.000000', 'ADMIN'),
        (8073, 9023, 'NEW', 'AWAITING_PAYMENT', 307, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8074, 9024, 'NEW', 'AWAITING_PAYMENT', 308, 'Luồng DEMO cơ bản.', 0, '2026-10-08 10:00:00.000000', 'LEARNER'),
        (8075, 9024, 'AWAITING_PAYMENT', 'PAID', 100, 'Luồng DEMO cơ bản.', 1, '2026-10-08 11:00:00.000000', 'ADMIN'),
        (8076, 9024, 'PAID', 'IN_PROGRESS', 201, 'Luồng DEMO cơ bản.', 2, '2026-10-08 12:00:00.000000', 'TUTOR'),
        (8077, 9024, 'IN_PROGRESS', 'CANCELLATION_PENDING', 308, 'Luồng DEMO cơ bản.', 3, '2026-10-08 12:00:00.000000', 'LEARNER');
    
    CREATE TEMPORARY TABLE seed_expected_contract_status_history LIKE contract_status_history;
    INSERT INTO seed_expected_contract_status_history (id, contract_id, from_status, to_status, actor_user_id, reason, entity_version, changed_at) VALUES
        (8501, 6001, 'NEW', 'AWAITING_PAYMENT', 301, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-05-07 10:00:00.000000'),
        (8502, 6001, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-05-07 11:00:00.000000'),
        (8503, 6001, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-05-10 10:00:00.000000'),
        (8504, 6002, 'NEW', 'AWAITING_PAYMENT', 302, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-06-09 10:00:00.000000'),
        (8505, 6002, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-06-09 11:00:00.000000'),
        (8506, 6002, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-06-12 10:00:00.000000'),
        (8507, 6003, 'NEW', 'AWAITING_PAYMENT', 303, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-07-13 10:00:00.000000'),
        (8508, 6003, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-07-13 11:00:00.000000'),
        (8509, 6003, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-07-16 10:00:00.000000'),
        (8510, 6004, 'NEW', 'AWAITING_PAYMENT', 304, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-09-04 10:00:00.000000'),
        (8511, 6004, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-09-04 11:00:00.000000'),
        (8512, 6004, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-09-07 10:00:00.000000'),
        (8513, 6005, 'NEW', 'AWAITING_PAYMENT', 305, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8514, 6005, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8515, 6006, 'NEW', 'AWAITING_PAYMENT', 306, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8516, 6006, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8517, 6007, 'NEW', 'AWAITING_PAYMENT', 307, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8518, 6008, 'NEW', 'AWAITING_PAYMENT', 308, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8519, 6008, 'AWAITING_PAYMENT', 'CANCELLED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-12 10:00:00.000000'),
        (8520, 6009, 'NEW', 'AWAITING_PAYMENT', 301, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-09-08 10:00:00.000000'),
        (8521, 6009, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-09-08 11:00:00.000000'),
        (8522, 6009, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-09-11 10:00:00.000000'),
        (8523, 6010, 'NEW', 'AWAITING_PAYMENT', 302, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-09-30 10:00:00.000000'),
        (8524, 6010, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-09-30 11:00:00.000000'),
        (8525, 6010, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-03 10:00:00.000000'),
        (8526, 6011, 'NEW', 'AWAITING_PAYMENT', 303, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-03 10:00:00.000000'),
        (8527, 6011, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-03 11:00:00.000000'),
        (8528, 6011, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-06 10:00:00.000000'),
        (8529, 6012, 'NEW', 'AWAITING_PAYMENT', 304, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8530, 6012, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8531, 6013, 'NEW', 'AWAITING_PAYMENT', 305, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8532, 6013, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8533, 6014, 'NEW', 'AWAITING_PAYMENT', 306, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8534, 6014, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8535, 6014, 'ACTIVE', 'CANCELLATION_PENDING', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-08 12:00:00.000000'),
        (8536, 6014, 'CANCELLATION_PENDING', 'CANCELLED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 3, '2026-10-12 10:00:00.000000'),
        (8537, 6015, 'NEW', 'AWAITING_PAYMENT', 307, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8538, 6015, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8539, 6015, 'ACTIVE', 'CANCELLATION_PENDING', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-08 12:00:00.000000'),
        (8540, 6016, 'NEW', 'AWAITING_PAYMENT', 308, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8541, 6016, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8542, 6016, 'ACTIVE', 'CANCELLATION_PENDING', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-08 12:00:00.000000'),
        (8543, 6017, 'NEW', 'AWAITING_PAYMENT', 301, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-04 10:00:00.000000'),
        (8544, 6017, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-04 11:00:00.000000'),
        (8545, 6017, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-07 10:00:00.000000'),
        (8546, 6018, 'NEW', 'AWAITING_PAYMENT', 302, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-07 10:00:00.000000'),
        (8547, 6018, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-07 11:00:00.000000'),
        (8548, 6018, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-10 10:00:00.000000'),
        (8549, 6019, 'NEW', 'AWAITING_PAYMENT', 302, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-07 10:00:00.000000'),
        (8550, 6019, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-07 11:00:00.000000'),
        (8551, 6019, 'ACTIVE', 'COMPLETED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-10 10:00:00.000000'),
        (8552, 6020, 'NEW', 'AWAITING_PAYMENT', 303, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8553, 6020, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8554, 6021, 'NEW', 'AWAITING_PAYMENT', 304, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8555, 6021, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8556, 6022, 'NEW', 'AWAITING_PAYMENT', 304, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8557, 6022, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8558, 6023, 'NEW', 'AWAITING_PAYMENT', 305, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8559, 6024, 'NEW', 'AWAITING_PAYMENT', 306, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8560, 6024, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8561, 6024, 'ACTIVE', 'CANCELLATION_PENDING', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-08 12:00:00.000000'),
        (8562, 6024, 'CANCELLATION_PENDING', 'CANCELLED', 100, 'Chuyển trạng thái DEMO đã kiểm.', 3, '2026-10-12 10:00:00.000000'),
        (8563, 6025, 'NEW', 'AWAITING_PAYMENT', 307, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8564, 6026, 'NEW', 'AWAITING_PAYMENT', 308, 'Chuyển trạng thái DEMO đã kiểm.', 0, '2026-10-08 10:00:00.000000'),
        (8565, 6026, 'AWAITING_PAYMENT', 'ACTIVE', 100, 'Chuyển trạng thái DEMO đã kiểm.', 1, '2026-10-08 11:00:00.000000'),
        (8566, 6026, 'ACTIVE', 'CANCELLATION_PENDING', 100, 'Chuyển trạng thái DEMO đã kiểm.', 2, '2026-10-08 12:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_enrollments LIKE enrollments;
    INSERT INTO seed_expected_enrollments (id, contract_id, offering_id, learner_id, seat_count, status, reserved_until, confirmed_at, version, created_at) VALUES
        (7001, 6017, 2014, 301, 1, 'COMPLETED', NULL, '2026-10-04 11:00:00.000000', 0, '2026-10-04 10:00:00.000000'),
        (7002, 6020, 2013, 303, 1, 'CONFIRMED', NULL, '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (7003, 6021, 2013, 304, 1, 'CONFIRMED', NULL, '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (7004, 6023, 2015, 305, 1, 'RESERVED', '2026-10-16 10:00:00.000000', NULL, 0, '2026-10-08 10:00:00.000000'),
        (7005, 6024, 2016, 306, 1, 'CANCELLED', NULL, '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (7006, 6026, 2017, 308, 1, 'CONFIRMED', NULL, '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_payments LIKE payments;
    INSERT INTO seed_expected_payments (id, public_code, order_id, amount, wallet_amount, provider_amount, status, funded_at, version, created_at) VALUES
        (10001, 'DEMO-PAYMENT-1', 9001, 650025, 260010, 390015, 'FUNDED', '2026-05-07 11:00:00.000000', 0, '2026-05-07 10:00:00.000000'),
        (10002, 'DEMO-PAYMENT-2', 9002, 700025, 0, 700025, 'FUNDED', '2026-06-09 11:00:00.000000', 0, '2026-06-09 10:00:00.000000'),
        (10003, 'DEMO-PAYMENT-3', 9003, 750025, 750025, 0, 'FUNDED', '2026-07-13 11:00:00.000000', 0, '2026-07-13 10:00:00.000000'),
        (10004, 'DEMO-PAYMENT-4', 9004, 800025, 320010, 480015, 'FUNDED', '2026-09-04 11:00:00.000000', 0, '2026-09-04 10:00:00.000000'),
        (10005, 'DEMO-PAYMENT-5', 9005, 850025, 0, 850025, 'FUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10006, 'DEMO-PAYMENT-6', 9006, 900025, 900025, 0, 'FUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10007, 'DEMO-PAYMENT-7', 9007, 950025, 380010, 570015, 'PENDING', NULL, 0, '2026-10-08 10:00:00.000000'),
        (10008, 'DEMO-PAYMENT-8', 9008, 1000025, 0, 1000025, 'CANCELLED', NULL, 0, '2026-10-08 10:00:00.000000'),
        (10009, 'DEMO-PAYMENT-9', 9009, 1050025, 1050025, 0, 'FUNDED', '2026-09-08 11:00:00.000000', 0, '2026-09-08 10:00:00.000000'),
        (10010, 'DEMO-PAYMENT-10', 9010, 1100025, 440010, 660015, 'FUNDED', '2026-09-30 11:00:00.000000', 0, '2026-09-30 10:00:00.000000'),
        (10011, 'DEMO-PAYMENT-11', 9011, 1150025, 0, 1150025, 'FUNDED', '2026-10-03 11:00:00.000000', 0, '2026-10-03 10:00:00.000000'),
        (10012, 'DEMO-PAYMENT-12', 9012, 1200025, 1200025, 0, 'FUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10013, 'DEMO-PAYMENT-13', 9013, 1250025, 500010, 750015, 'FUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10014, 'DEMO-PAYMENT-14', 9014, 1300025, 0, 1300025, 'PARTIALLY_REFUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10015, 'DEMO-PAYMENT-15', 9015, 1350025, 1350025, 0, 'REFUND_PENDING', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10016, 'DEMO-PAYMENT-16', 9016, 1400025, 560010, 840015, 'REFUND_PENDING', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10017, 'DEMO-PAYMENT-17', 9017, 1450025, 0, 1450025, 'FUNDED', '2026-10-04 11:00:00.000000', 0, '2026-10-04 10:00:00.000000'),
        (10018, 'DEMO-PAYMENT-18', 9018, 1750050, 1750050, 0, 'FUNDED', '2026-10-07 11:00:00.000000', 0, '2026-10-07 10:00:00.000000'),
        (10019, 'DEMO-PAYMENT-19', 9019, 1400025, 560010, 840015, 'FUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10020, 'DEMO-PAYMENT-20', 9020, 2350050, 0, 2350050, 'FUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10021, 'DEMO-PAYMENT-21', 9021, 1500025, 1500025, 0, 'PENDING', NULL, 0, '2026-10-08 10:00:00.000000'),
        (10022, 'DEMO-PAYMENT-22', 9022, 1550025, 620010, 930015, 'REFUNDED', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000'),
        (10023, 'DEMO-PAYMENT-23', 9023, 800025, 0, 800025, 'FAILED', NULL, 0, '2026-10-08 10:00:00.000000'),
        (10024, 'DEMO-PAYMENT-24', 9024, 1600025, 1600025, 0, 'REFUND_PENDING', '2026-10-08 11:00:00.000000', 0, '2026-10-08 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_payment_attempts LIKE payment_attempts;
    INSERT INTO seed_expected_payment_attempts (id, payment_id, attempt_number, provider, provider_order_code, provider_reference, request_key, amount, status, verified_at, failure_code, created_at, expires_at) VALUES
        (15001, 10001, 1, 'PAYOS', 260000001, 'DEMO-PAYOS-REF-1', 'DEMO-PAYOS-REQUEST-1', 390015, 'SUCCEEDED', '2026-05-07 11:00:00.000000', NULL, '2026-05-07 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15002, 10002, 1, 'PAYOS', 260000002, 'DEMO-PAYOS-REF-2', 'DEMO-PAYOS-REQUEST-2', 700025, 'SUCCEEDED', '2026-06-09 11:00:00.000000', NULL, '2026-06-09 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15004, 10004, 1, 'PAYOS', 260000004, 'DEMO-PAYOS-REF-4', 'DEMO-PAYOS-REQUEST-4', 480015, 'SUCCEEDED', '2026-09-04 11:00:00.000000', NULL, '2026-09-04 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15005, 10005, 1, 'PAYOS', 260000005, 'DEMO-PAYOS-REF-5', 'DEMO-PAYOS-REQUEST-5', 850025, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15007, 10007, 1, 'PAYOS', 260000007, NULL, 'DEMO-PAYOS-REQUEST-7', 570015, 'PENDING', NULL, NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15008, 10008, 1, 'PAYOS', 260000008, NULL, 'DEMO-PAYOS-REQUEST-8', 1000025, 'CANCELLED', NULL, NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15010, 10010, 1, 'PAYOS', 260000010, 'DEMO-PAYOS-REF-10', 'DEMO-PAYOS-REQUEST-10', 660015, 'SUCCEEDED', '2026-09-30 11:00:00.000000', NULL, '2026-09-30 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15011, 10011, 1, 'PAYOS', 260000011, 'DEMO-PAYOS-REF-11', 'DEMO-PAYOS-REQUEST-11', 1150025, 'SUCCEEDED', '2026-10-03 11:00:00.000000', NULL, '2026-10-03 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15013, 10013, 1, 'PAYOS', 260000013, 'DEMO-PAYOS-REF-13', 'DEMO-PAYOS-REQUEST-13', 750015, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15014, 10014, 1, 'PAYOS', 260000014, 'DEMO-PAYOS-REF-14', 'DEMO-PAYOS-REQUEST-14', 1300025, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15016, 10016, 1, 'PAYOS', 260000016, 'DEMO-PAYOS-REF-16', 'DEMO-PAYOS-REQUEST-16', 840015, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15017, 10017, 1, 'PAYOS', 260000017, 'DEMO-PAYOS-REF-17', 'DEMO-PAYOS-REQUEST-17', 1450025, 'SUCCEEDED', '2026-10-04 11:00:00.000000', NULL, '2026-10-04 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15019, 10019, 1, 'PAYOS', 260000019, 'DEMO-PAYOS-REF-19', 'DEMO-PAYOS-REQUEST-19', 840015, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15020, 10020, 1, 'PAYOS', 260000020, 'DEMO-PAYOS-REF-20', 'DEMO-PAYOS-REQUEST-20', 2350050, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15022, 10022, 1, 'PAYOS', 260000022, 'DEMO-PAYOS-REF-22', 'DEMO-PAYOS-REQUEST-22', 930015, 'SUCCEEDED', '2026-10-08 11:00:00.000000', NULL, '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000'),
        (15023, 10023, 1, 'PAYOS', 260000023, NULL, 'DEMO-PAYOS-REQUEST-23', 800025, 'FAILED', NULL, 'DEMO_PROVIDER_REJECTED', '2026-10-08 10:00:00.000000', '2026-10-20 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_payment_webhook_events LIKE payment_webhook_events;
    INSERT INTO seed_expected_payment_webhook_events (id, provider, event_key, payment_attempt_id, payload_hash, signature_verified, status, received_at, processed_at, error_code) VALUES
        (16001, 'PAYOS', 'DEMO-WEBHOOK-1', 15001, UNHEX(SHA2('DEMO-EVENT-1',256)), 1, 'APPLIED', '2026-05-07 11:00:00.000000', '2026-05-07 11:00:00.000000', NULL),
        (16002, 'PAYOS', 'DEMO-WEBHOOK-2', 15002, UNHEX(SHA2('DEMO-EVENT-2',256)), 1, 'APPLIED', '2026-06-09 11:00:00.000000', '2026-06-09 11:00:00.000000', NULL),
        (16004, 'PAYOS', 'DEMO-WEBHOOK-4', 15004, UNHEX(SHA2('DEMO-EVENT-4',256)), 1, 'APPLIED', '2026-09-04 11:00:00.000000', '2026-09-04 11:00:00.000000', NULL),
        (16005, 'PAYOS', 'DEMO-WEBHOOK-5', 15005, UNHEX(SHA2('DEMO-EVENT-5',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL),
        (16010, 'PAYOS', 'DEMO-WEBHOOK-10', 15010, UNHEX(SHA2('DEMO-EVENT-10',256)), 1, 'APPLIED', '2026-09-30 11:00:00.000000', '2026-09-30 11:00:00.000000', NULL),
        (16011, 'PAYOS', 'DEMO-WEBHOOK-11', 15011, UNHEX(SHA2('DEMO-EVENT-11',256)), 1, 'APPLIED', '2026-10-03 11:00:00.000000', '2026-10-03 11:00:00.000000', NULL),
        (16013, 'PAYOS', 'DEMO-WEBHOOK-13', 15013, UNHEX(SHA2('DEMO-EVENT-13',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL),
        (16014, 'PAYOS', 'DEMO-WEBHOOK-14', 15014, UNHEX(SHA2('DEMO-EVENT-14',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL),
        (16016, 'PAYOS', 'DEMO-WEBHOOK-16', 15016, UNHEX(SHA2('DEMO-EVENT-16',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL),
        (16017, 'PAYOS', 'DEMO-WEBHOOK-17', 15017, UNHEX(SHA2('DEMO-EVENT-17',256)), 1, 'APPLIED', '2026-10-04 11:00:00.000000', '2026-10-04 11:00:00.000000', NULL),
        (16019, 'PAYOS', 'DEMO-WEBHOOK-19', 15019, UNHEX(SHA2('DEMO-EVENT-19',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL),
        (16020, 'PAYOS', 'DEMO-WEBHOOK-20', 15020, UNHEX(SHA2('DEMO-EVENT-20',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL),
        (16022, 'PAYOS', 'DEMO-WEBHOOK-22', 15022, UNHEX(SHA2('DEMO-EVENT-22',256)), 1, 'APPLIED', '2026-10-08 11:00:00.000000', '2026-10-08 11:00:00.000000', NULL);
    
    CREATE TEMPORARY TABLE seed_expected_payment_allocations LIKE payment_allocations;
    INSERT INTO seed_expected_payment_allocations (payment_id, contract_id, amount, wallet_amount, provider_amount) VALUES
        (10001, 6001, 650025, 260010, 390015),
        (10002, 6002, 700025, 0, 700025),
        (10003, 6003, 750025, 750025, 0),
        (10004, 6004, 800025, 320010, 480015),
        (10005, 6005, 850025, 0, 850025),
        (10006, 6006, 900025, 900025, 0),
        (10007, 6007, 950025, 380010, 570015),
        (10008, 6008, 1000025, 0, 1000025),
        (10009, 6009, 1050025, 1050025, 0),
        (10010, 6010, 1100025, 440010, 660015),
        (10011, 6011, 1150025, 0, 1150025),
        (10012, 6012, 1200025, 1200025, 0),
        (10013, 6013, 1250025, 500010, 750015),
        (10014, 6014, 1300025, 0, 1300025),
        (10015, 6015, 1350025, 1350025, 0),
        (10016, 6016, 1400025, 560010, 840015),
        (10017, 6017, 1450025, 0, 1450025),
        (10018, 6018, 850025, 850025, 0),
        (10018, 6019, 900025, 900025, 0),
        (10019, 6020, 1400025, 560010, 840015),
        (10020, 6021, 1400025, 0, 1400025),
        (10020, 6022, 950025, 0, 950025),
        (10021, 6023, 1500025, 1500025, 0),
        (10022, 6024, 1550025, 620010, 930015),
        (10023, 6025, 800025, 0, 800025),
        (10024, 6026, 1600025, 1600025, 0);
    
    CREATE TEMPORARY TABLE seed_expected_ledger_accounts LIKE ledger_accounts;
    INSERT INTO seed_expected_ledger_accounts (id, account_code, account_kind, owner_user_id, currency, version) VALUES
        (1, 'PLATFORM-REVENUE-VND', 'PLATFORM_REVENUE', NULL, 'VND', 0),
        (2, 'PROVIDER-CLEARING-VND', 'PROVIDER_CLEARING', NULL, 'VND', 0),
        (201, 'WALLET-201-VND', 'USER_WALLET', 201, 'VND', 0),
        (202, 'WALLET-202-VND', 'USER_WALLET', 202, 'VND', 0),
        (203, 'WALLET-203-VND', 'USER_WALLET', 203, 'VND', 0),
        (204, 'WALLET-204-VND', 'USER_WALLET', 204, 'VND', 0),
        (205, 'WALLET-205-VND', 'USER_WALLET', 205, 'VND', 0),
        (206, 'WALLET-206-VND', 'USER_WALLET', 206, 'VND', 0),
        (301, 'WALLET-301-VND', 'USER_WALLET', 301, 'VND', 0),
        (302, 'WALLET-302-VND', 'USER_WALLET', 302, 'VND', 0),
        (303, 'WALLET-303-VND', 'USER_WALLET', 303, 'VND', 0),
        (304, 'WALLET-304-VND', 'USER_WALLET', 304, 'VND', 0),
        (305, 'WALLET-305-VND', 'USER_WALLET', 305, 'VND', 0),
        (306, 'WALLET-306-VND', 'USER_WALLET', 306, 'VND', 0),
        (307, 'WALLET-307-VND', 'USER_WALLET', 307, 'VND', 0),
        (308, 'WALLET-308-VND', 'USER_WALLET', 308, 'VND', 0),
        (309, 'WALLET-309-VND', 'USER_WALLET', 309, 'VND', 0),
        (310, 'WALLET-310-VND', 'USER_WALLET', 310, 'VND', 0),
        (16001, 'ESCROW-6001-VND', 'ESCROW', NULL, 'VND', 0),
        (16002, 'ESCROW-6002-VND', 'ESCROW', NULL, 'VND', 0),
        (16003, 'ESCROW-6003-VND', 'ESCROW', NULL, 'VND', 0),
        (16004, 'ESCROW-6004-VND', 'ESCROW', NULL, 'VND', 0),
        (16005, 'ESCROW-6005-VND', 'ESCROW', NULL, 'VND', 0),
        (16006, 'ESCROW-6006-VND', 'ESCROW', NULL, 'VND', 0),
        (16007, 'ESCROW-6007-VND', 'ESCROW', NULL, 'VND', 0),
        (16008, 'ESCROW-6008-VND', 'ESCROW', NULL, 'VND', 0),
        (16009, 'ESCROW-6009-VND', 'ESCROW', NULL, 'VND', 0),
        (16010, 'ESCROW-6010-VND', 'ESCROW', NULL, 'VND', 0),
        (16011, 'ESCROW-6011-VND', 'ESCROW', NULL, 'VND', 0),
        (16012, 'ESCROW-6012-VND', 'ESCROW', NULL, 'VND', 0),
        (16013, 'ESCROW-6013-VND', 'ESCROW', NULL, 'VND', 0),
        (16014, 'ESCROW-6014-VND', 'ESCROW', NULL, 'VND', 0),
        (16015, 'ESCROW-6015-VND', 'ESCROW', NULL, 'VND', 0),
        (16016, 'ESCROW-6016-VND', 'ESCROW', NULL, 'VND', 0),
        (16017, 'ESCROW-6017-VND', 'ESCROW', NULL, 'VND', 0),
        (16018, 'ESCROW-6018-VND', 'ESCROW', NULL, 'VND', 0),
        (16019, 'ESCROW-6019-VND', 'ESCROW', NULL, 'VND', 0),
        (16020, 'ESCROW-6020-VND', 'ESCROW', NULL, 'VND', 0),
        (16021, 'ESCROW-6021-VND', 'ESCROW', NULL, 'VND', 0),
        (16022, 'ESCROW-6022-VND', 'ESCROW', NULL, 'VND', 0),
        (16023, 'ESCROW-6023-VND', 'ESCROW', NULL, 'VND', 0),
        (16024, 'ESCROW-6024-VND', 'ESCROW', NULL, 'VND', 0),
        (16025, 'ESCROW-6025-VND', 'ESCROW', NULL, 'VND', 0),
        (16026, 'ESCROW-6026-VND', 'ESCROW', NULL, 'VND', 0);
    
    CREATE TEMPORARY TABLE seed_expected_wallets LIKE wallets;
    INSERT INTO seed_expected_wallets (user_id, ledger_account_id) VALUES
        (201, 201),
        (202, 202),
        (203, 203),
        (204, 204),
        (205, 205),
        (206, 206),
        (301, 301),
        (302, 302),
        (303, 303),
        (304, 304),
        (305, 305),
        (306, 306),
        (307, 307),
        (308, 308),
        (309, 309),
        (310, 310);
    
    CREATE TEMPORARY TABLE seed_expected_escrow_accounts LIKE escrow_accounts;
    INSERT INTO seed_expected_escrow_accounts (contract_id, ledger_account_id) VALUES
        (6001, 16001),
        (6002, 16002),
        (6003, 16003),
        (6004, 16004),
        (6005, 16005),
        (6006, 16006),
        (6007, 16007),
        (6008, 16008),
        (6009, 16009),
        (6010, 16010),
        (6011, 16011),
        (6012, 16012),
        (6013, 16013),
        (6014, 16014),
        (6015, 16015),
        (6016, 16016),
        (6017, 16017),
        (6018, 16018),
        (6019, 16019),
        (6020, 16020),
        (6021, 16021),
        (6022, 16022),
        (6023, 16023),
        (6024, 16024),
        (6025, 16025),
        (6026, 16026);
    
    CREATE TEMPORARY TABLE seed_expected_releases LIKE releases;
    INSERT INTO seed_expected_releases (id, contract_id, release_key, reason_code, gross_amount, fee_rate_snapshot, fee_amount, tutor_net_amount, fee_policy_version, rounding_mode, approved_by, released_at) VALUES
        (28001, 6001, 'DEMO-RELEASE-6001', 'COMPLETION', 650025, '0.100000', 65003, 585022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-05-10 10:00:00.000000'),
        (28002, 6002, 'DEMO-RELEASE-6002', 'COMPLETION', 700025, '0.100000', 70003, 630022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-06-12 10:00:00.000000'),
        (28003, 6003, 'DEMO-RELEASE-6003', 'COMPLETION', 750025, '0.100000', 75003, 675022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-07-16 10:00:00.000000'),
        (28004, 6004, 'DEMO-RELEASE-6004', 'COMPLETION', 800025, '0.100000', 80003, 720022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-09-07 10:00:00.000000'),
        (28009, 6009, 'DEMO-RELEASE-6009', 'COMPLETION', 1050025, '0.100000', 105003, 945022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-09-11 10:00:00.000000'),
        (28010, 6010, 'DEMO-RELEASE-6010', 'COMPLETION', 1100025, '0.100000', 110003, 990022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-10-03 10:00:00.000000'),
        (28011, 6011, 'DEMO-RELEASE-6011', 'COMPLETION', 1150025, '0.100000', 115003, 1035022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-10-06 10:00:00.000000'),
        (28014, 6014, 'DEMO-RELEASE-6014', 'MANUAL_MILESTONE', 520010, '0.100000', 52001, 468009, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-10-08 12:00:00.000000'),
        (28017, 6017, 'DEMO-RELEASE-6017', 'COMPLETION', 1450025, '0.100000', 145003, 1305022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-10-07 10:00:00.000000'),
        (28018, 6018, 'DEMO-RELEASE-6018', 'COMPLETION', 850025, '0.100000', 85003, 765022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-10-10 10:00:00.000000'),
        (28019, 6019, 'DEMO-RELEASE-6019', 'COMPLETION', 900025, '0.100000', 90003, 810022, 'DEMO-FEE-10PCT-V1', 'HALF_UP', 100, '2026-10-10 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_refunds LIKE refunds;
    INSERT INTO seed_expected_refunds (id, payment_id, contract_id, request_key, basis_amount_snapshot, refund_rate_snapshot, amount, policy_version, destination, status, requested_by, reason, provider_reference, failure_code, requested_at, processed_at, version) VALUES
        (29014, 10014, 6014, 'DEMO-REFUND-6014', 780015, '1.000000', 780015, 'DEMO-REFUND-UNRELEASED-100-V1', 'ORIGINAL_PROVIDER', 'SUCCEEDED', 306, 'DEMO: hoàn 100% phần chưa giải ngân; hoàn ví có sự đồng ý giả lập.', 'DEMO-REFUND-PROVIDER-6014', NULL, '2026-10-08 12:00:00.000000', '2026-10-12 10:00:00.000000', 0),
        (29015, 10015, 6015, 'DEMO-REFUND-6015', 1350025, '1.000000', 1350025, 'DEMO-REFUND-UNRELEASED-100-V1', 'WALLET', 'PROCESSING', 307, 'DEMO: hoàn 100% phần chưa giải ngân; hoàn ví có sự đồng ý giả lập.', NULL, NULL, '2026-10-08 12:00:00.000000', NULL, 0),
        (29016, 10016, 6016, 'DEMO-REFUND-6016', 1400025, '1.000000', 1400025, 'DEMO-REFUND-UNRELEASED-100-V1', 'WALLET', 'FAILED', 308, 'DEMO: hoàn 100% phần chưa giải ngân; hoàn ví có sự đồng ý giả lập.', NULL, 'DEMO_REFUND_RETRY_REQUIRED', '2026-10-08 12:00:00.000000', '2026-10-12 10:00:00.000000', 0),
        (29024, 10022, 6024, 'DEMO-REFUND-6024', 1550025, '1.000000', 1550025, 'DEMO-REFUND-UNRELEASED-100-V1', 'WALLET', 'SUCCEEDED', 306, 'DEMO: hoàn 100% phần chưa giải ngân; hoàn ví có sự đồng ý giả lập.', NULL, NULL, '2026-10-08 12:00:00.000000', '2026-10-12 10:00:00.000000', 0),
        (29026, 10024, 6026, 'DEMO-REFUND-6026', 1600025, '1.000000', 1600025, 'DEMO-REFUND-UNRELEASED-100-V1', 'WALLET', 'REQUESTED', 308, 'DEMO: hoàn 100% phần chưa giải ngân; hoàn ví có sự đồng ý giả lập.', NULL, NULL, '2026-10-08 12:00:00.000000', NULL, 0);
    
    CREATE TEMPORARY TABLE seed_expected_refund_status_history LIKE refund_status_history;
    INSERT INTO seed_expected_refund_status_history (id, refund_id, from_status, to_status, actor_user_id, reason, changed_at) VALUES
        (30014, 29014, NULL, 'REQUESTED', 306, 'Yêu cầu hoàn DEMO.', '2026-10-08 12:00:00.000000'),
        (31014, 29014, 'REQUESTED', 'SUCCEEDED', 100, 'Xử lý hoàn DEMO.', '2026-10-12 10:00:00.000000'),
        (30015, 29015, NULL, 'REQUESTED', 307, 'Yêu cầu hoàn DEMO.', '2026-10-08 12:00:00.000000'),
        (31015, 29015, 'REQUESTED', 'PROCESSING', 100, 'Xử lý hoàn DEMO.', '2026-10-12 10:00:00.000000'),
        (30016, 29016, NULL, 'REQUESTED', 308, 'Yêu cầu hoàn DEMO.', '2026-10-08 12:00:00.000000'),
        (31016, 29016, 'REQUESTED', 'FAILED', 100, 'DEMO: provider lỗi, tiền vẫn giữ.', '2026-10-12 10:00:00.000000'),
        (30024, 29024, NULL, 'REQUESTED', 306, 'Yêu cầu hoàn DEMO.', '2026-10-08 12:00:00.000000'),
        (31024, 29024, 'REQUESTED', 'SUCCEEDED', 100, 'Xử lý hoàn DEMO.', '2026-10-12 10:00:00.000000'),
        (30026, 29026, NULL, 'REQUESTED', 308, 'Yêu cầu hoàn DEMO.', '2026-10-08 12:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_money_journals LIKE money_journals;
    INSERT INTO seed_expected_money_journals (id, business_key, journal_kind, payment_id, contract_id, release_id, refund_id, wallet_user_id, memo, posted_at) VALUES
        (20001, 'DEMO-JOURNAL-20001', 'TOP_UP', NULL, NULL, NULL, NULL, 301, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20002, 'DEMO-JOURNAL-20002', 'TOP_UP', NULL, NULL, NULL, NULL, 302, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20003, 'DEMO-JOURNAL-20003', 'TOP_UP', NULL, NULL, NULL, NULL, 303, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20004, 'DEMO-JOURNAL-20004', 'TOP_UP', NULL, NULL, NULL, NULL, 304, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20005, 'DEMO-JOURNAL-20005', 'TOP_UP', NULL, NULL, NULL, NULL, 305, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20006, 'DEMO-JOURNAL-20006', 'TOP_UP', NULL, NULL, NULL, NULL, 306, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20007, 'DEMO-JOURNAL-20007', 'TOP_UP', NULL, NULL, NULL, NULL, 307, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20008, 'DEMO-JOURNAL-20008', 'TOP_UP', NULL, NULL, NULL, NULL, 308, 'DEMO: số dư mở đầu giả lập, không gọi cổng nạp tiền.', '2026-03-01 09:00:00.000000'),
        (20009, 'DEMO-JOURNAL-20009', 'WALLET_PAYMENT', 10001, 6001, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-05-07 11:00:00.000000'),
        (20010, 'DEMO-JOURNAL-20010', 'PROVIDER_PAYMENT', 10001, 6001, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-05-07 11:00:00.000000'),
        (20011, 'DEMO-JOURNAL-20011', 'RELEASE', NULL, 6001, 28001, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-05-10 10:00:00.000000'),
        (20012, 'DEMO-JOURNAL-20012', 'PROVIDER_PAYMENT', 10002, 6002, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-06-09 11:00:00.000000'),
        (20013, 'DEMO-JOURNAL-20013', 'RELEASE', NULL, 6002, 28002, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-06-12 10:00:00.000000'),
        (20014, 'DEMO-JOURNAL-20014', 'WALLET_PAYMENT', 10003, 6003, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-07-13 11:00:00.000000'),
        (20015, 'DEMO-JOURNAL-20015', 'RELEASE', NULL, 6003, 28003, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-07-16 10:00:00.000000'),
        (20016, 'DEMO-JOURNAL-20016', 'WALLET_PAYMENT', 10004, 6004, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-09-04 11:00:00.000000'),
        (20017, 'DEMO-JOURNAL-20017', 'PROVIDER_PAYMENT', 10004, 6004, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-09-04 11:00:00.000000'),
        (20018, 'DEMO-JOURNAL-20018', 'RELEASE', NULL, 6004, 28004, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-09-07 10:00:00.000000'),
        (20019, 'DEMO-JOURNAL-20019', 'PROVIDER_PAYMENT', 10005, 6005, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20020, 'DEMO-JOURNAL-20020', 'WALLET_PAYMENT', 10006, 6006, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20021, 'DEMO-JOURNAL-20021', 'WALLET_PAYMENT', 10009, 6009, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-09-08 11:00:00.000000'),
        (20022, 'DEMO-JOURNAL-20022', 'RELEASE', NULL, 6009, 28009, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-09-11 10:00:00.000000'),
        (20023, 'DEMO-JOURNAL-20023', 'WALLET_PAYMENT', 10010, 6010, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-09-30 11:00:00.000000'),
        (20024, 'DEMO-JOURNAL-20024', 'PROVIDER_PAYMENT', 10010, 6010, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-09-30 11:00:00.000000'),
        (20025, 'DEMO-JOURNAL-20025', 'RELEASE', NULL, 6010, 28010, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-10-03 10:00:00.000000'),
        (20026, 'DEMO-JOURNAL-20026', 'PROVIDER_PAYMENT', 10011, 6011, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-03 11:00:00.000000'),
        (20027, 'DEMO-JOURNAL-20027', 'RELEASE', NULL, 6011, 28011, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-10-06 10:00:00.000000'),
        (20028, 'DEMO-JOURNAL-20028', 'WALLET_PAYMENT', 10012, 6012, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20029, 'DEMO-JOURNAL-20029', 'WALLET_PAYMENT', 10013, 6013, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20030, 'DEMO-JOURNAL-20030', 'PROVIDER_PAYMENT', 10013, 6013, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20031, 'DEMO-JOURNAL-20031', 'PROVIDER_PAYMENT', 10014, 6014, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20032, 'DEMO-JOURNAL-20032', 'RELEASE', NULL, 6014, 28014, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-10-08 12:00:00.000000'),
        (20033, 'DEMO-JOURNAL-20033', 'REFUND', NULL, 6014, NULL, 29014, NULL, 'DEMO: hoàn tiền đã post; không gửi giao dịch thật.', '2026-10-12 10:00:00.000000'),
        (20034, 'DEMO-JOURNAL-20034', 'WALLET_PAYMENT', 10015, 6015, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20035, 'DEMO-JOURNAL-20035', 'WALLET_PAYMENT', 10016, 6016, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20036, 'DEMO-JOURNAL-20036', 'PROVIDER_PAYMENT', 10016, 6016, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20037, 'DEMO-JOURNAL-20037', 'PROVIDER_PAYMENT', 10017, 6017, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-04 11:00:00.000000'),
        (20038, 'DEMO-JOURNAL-20038', 'RELEASE', NULL, 6017, 28017, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-10-07 10:00:00.000000'),
        (20039, 'DEMO-JOURNAL-20039', 'WALLET_PAYMENT', 10018, 6018, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-07 11:00:00.000000'),
        (20040, 'DEMO-JOURNAL-20040', 'RELEASE', NULL, 6018, 28018, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-10-10 10:00:00.000000'),
        (20041, 'DEMO-JOURNAL-20041', 'WALLET_PAYMENT', 10018, 6019, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-07 11:00:00.000000'),
        (20042, 'DEMO-JOURNAL-20042', 'RELEASE', NULL, 6019, 28019, NULL, NULL, 'DEMO: giải ngân cơ bản được admin chấp thuận; không tự theo buổi.', '2026-10-10 10:00:00.000000'),
        (20043, 'DEMO-JOURNAL-20043', 'WALLET_PAYMENT', 10019, 6020, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20044, 'DEMO-JOURNAL-20044', 'PROVIDER_PAYMENT', 10019, 6020, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20045, 'DEMO-JOURNAL-20045', 'PROVIDER_PAYMENT', 10020, 6021, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20046, 'DEMO-JOURNAL-20046', 'PROVIDER_PAYMENT', 10020, 6022, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20047, 'DEMO-JOURNAL-20047', 'WALLET_PAYMENT', 10022, 6024, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000'),
        (20048, 'DEMO-JOURNAL-20048', 'PROVIDER_PAYMENT', 10022, 6024, NULL, NULL, NULL, 'DEMO: provider đã xác minh giả lập, không gọi PayOS.', '2026-10-08 11:00:00.000000'),
        (20049, 'DEMO-JOURNAL-20049', 'REFUND', NULL, 6024, NULL, 29024, NULL, 'DEMO: hoàn tiền đã post; không gửi giao dịch thật.', '2026-10-12 10:00:00.000000'),
        (20050, 'DEMO-JOURNAL-20050', 'WALLET_PAYMENT', 10024, 6026, NULL, NULL, NULL, 'DEMO: tiền ví giữ cho hợp đồng.', '2026-10-08 11:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_ledger_entries LIKE ledger_entries;
    INSERT INTO seed_expected_ledger_entries (id, journal_id, line_number, ledger_account_id, entry_side, amount) VALUES
        (200011, 20001, 1, 2, 'DEBIT', 5000000),
        (200012, 20001, 2, 301, 'CREDIT', 5000000),
        (200021, 20002, 1, 2, 'DEBIT', 5000000),
        (200022, 20002, 2, 302, 'CREDIT', 5000000),
        (200031, 20003, 1, 2, 'DEBIT', 5000000),
        (200032, 20003, 2, 303, 'CREDIT', 5000000),
        (200041, 20004, 1, 2, 'DEBIT', 5000000),
        (200042, 20004, 2, 304, 'CREDIT', 5000000),
        (200051, 20005, 1, 2, 'DEBIT', 5000000),
        (200052, 20005, 2, 305, 'CREDIT', 5000000),
        (200061, 20006, 1, 2, 'DEBIT', 5000000),
        (200062, 20006, 2, 306, 'CREDIT', 5000000),
        (200071, 20007, 1, 2, 'DEBIT', 5000000),
        (200072, 20007, 2, 307, 'CREDIT', 5000000),
        (200081, 20008, 1, 2, 'DEBIT', 5000000),
        (200082, 20008, 2, 308, 'CREDIT', 5000000),
        (200091, 20009, 1, 301, 'DEBIT', 260010),
        (200092, 20009, 2, 16001, 'CREDIT', 260010),
        (200101, 20010, 1, 2, 'DEBIT', 390015),
        (200102, 20010, 2, 16001, 'CREDIT', 390015),
        (200111, 20011, 1, 16001, 'DEBIT', 650025),
        (200112, 20011, 2, 201, 'CREDIT', 585022),
        (200113, 20011, 3, 1, 'CREDIT', 65003),
        (200121, 20012, 1, 2, 'DEBIT', 700025),
        (200122, 20012, 2, 16002, 'CREDIT', 700025),
        (200131, 20013, 1, 16002, 'DEBIT', 700025),
        (200132, 20013, 2, 202, 'CREDIT', 630022),
        (200133, 20013, 3, 1, 'CREDIT', 70003),
        (200141, 20014, 1, 303, 'DEBIT', 750025),
        (200142, 20014, 2, 16003, 'CREDIT', 750025),
        (200151, 20015, 1, 16003, 'DEBIT', 750025),
        (200152, 20015, 2, 203, 'CREDIT', 675022),
        (200153, 20015, 3, 1, 'CREDIT', 75003),
        (200161, 20016, 1, 304, 'DEBIT', 320010),
        (200162, 20016, 2, 16004, 'CREDIT', 320010),
        (200171, 20017, 1, 2, 'DEBIT', 480015),
        (200172, 20017, 2, 16004, 'CREDIT', 480015),
        (200181, 20018, 1, 16004, 'DEBIT', 800025),
        (200182, 20018, 2, 204, 'CREDIT', 720022),
        (200183, 20018, 3, 1, 'CREDIT', 80003),
        (200191, 20019, 1, 2, 'DEBIT', 850025),
        (200192, 20019, 2, 16005, 'CREDIT', 850025),
        (200201, 20020, 1, 306, 'DEBIT', 900025),
        (200202, 20020, 2, 16006, 'CREDIT', 900025),
        (200211, 20021, 1, 301, 'DEBIT', 1050025),
        (200212, 20021, 2, 16009, 'CREDIT', 1050025),
        (200221, 20022, 1, 16009, 'DEBIT', 1050025),
        (200222, 20022, 2, 201, 'CREDIT', 945022),
        (200223, 20022, 3, 1, 'CREDIT', 105003),
        (200231, 20023, 1, 302, 'DEBIT', 440010),
        (200232, 20023, 2, 16010, 'CREDIT', 440010),
        (200241, 20024, 1, 2, 'DEBIT', 660015),
        (200242, 20024, 2, 16010, 'CREDIT', 660015),
        (200251, 20025, 1, 16010, 'DEBIT', 1100025),
        (200252, 20025, 2, 202, 'CREDIT', 990022),
        (200253, 20025, 3, 1, 'CREDIT', 110003),
        (200261, 20026, 1, 2, 'DEBIT', 1150025),
        (200262, 20026, 2, 16011, 'CREDIT', 1150025),
        (200271, 20027, 1, 16011, 'DEBIT', 1150025),
        (200272, 20027, 2, 203, 'CREDIT', 1035022),
        (200273, 20027, 3, 1, 'CREDIT', 115003),
        (200281, 20028, 1, 304, 'DEBIT', 1200025),
        (200282, 20028, 2, 16012, 'CREDIT', 1200025),
        (200291, 20029, 1, 305, 'DEBIT', 500010),
        (200292, 20029, 2, 16013, 'CREDIT', 500010),
        (200301, 20030, 1, 2, 'DEBIT', 750015),
        (200302, 20030, 2, 16013, 'CREDIT', 750015),
        (200311, 20031, 1, 2, 'DEBIT', 1300025),
        (200312, 20031, 2, 16014, 'CREDIT', 1300025),
        (200321, 20032, 1, 16014, 'DEBIT', 520010),
        (200322, 20032, 2, 202, 'CREDIT', 468009),
        (200323, 20032, 3, 1, 'CREDIT', 52001),
        (200331, 20033, 1, 16014, 'DEBIT', 780015),
        (200332, 20033, 2, 2, 'CREDIT', 780015),
        (200341, 20034, 1, 307, 'DEBIT', 1350025),
        (200342, 20034, 2, 16015, 'CREDIT', 1350025),
        (200351, 20035, 1, 308, 'DEBIT', 560010),
        (200352, 20035, 2, 16016, 'CREDIT', 560010),
        (200361, 20036, 1, 2, 'DEBIT', 840015),
        (200362, 20036, 2, 16016, 'CREDIT', 840015),
        (200371, 20037, 1, 2, 'DEBIT', 1450025),
        (200372, 20037, 2, 16017, 'CREDIT', 1450025),
        (200381, 20038, 1, 16017, 'DEBIT', 1450025),
        (200382, 20038, 2, 202, 'CREDIT', 1305022),
        (200383, 20038, 3, 1, 'CREDIT', 145003),
        (200391, 20039, 1, 302, 'DEBIT', 850025),
        (200392, 20039, 2, 16018, 'CREDIT', 850025),
        (200401, 20040, 1, 16018, 'DEBIT', 850025),
        (200402, 20040, 2, 202, 'CREDIT', 765022),
        (200403, 20040, 3, 1, 'CREDIT', 85003),
        (200411, 20041, 1, 302, 'DEBIT', 900025),
        (200412, 20041, 2, 16019, 'CREDIT', 900025),
        (200421, 20042, 1, 16019, 'DEBIT', 900025),
        (200422, 20042, 2, 203, 'CREDIT', 810022),
        (200423, 20042, 3, 1, 'CREDIT', 90003),
        (200431, 20043, 1, 303, 'DEBIT', 560010),
        (200432, 20043, 2, 16020, 'CREDIT', 560010),
        (200441, 20044, 1, 2, 'DEBIT', 840015),
        (200442, 20044, 2, 16020, 'CREDIT', 840015),
        (200451, 20045, 1, 2, 'DEBIT', 1400025),
        (200452, 20045, 2, 16021, 'CREDIT', 1400025),
        (200461, 20046, 1, 2, 'DEBIT', 950025),
        (200462, 20046, 2, 16022, 'CREDIT', 950025),
        (200471, 20047, 1, 306, 'DEBIT', 620010),
        (200472, 20047, 2, 16024, 'CREDIT', 620010),
        (200481, 20048, 1, 2, 'DEBIT', 930015),
        (200482, 20048, 2, 16024, 'CREDIT', 930015),
        (200491, 20049, 1, 16024, 'DEBIT', 1550025),
        (200492, 20049, 2, 306, 'CREDIT', 1550025),
        (200501, 20050, 1, 308, 'DEBIT', 1600025),
        (200502, 20050, 2, 16026, 'CREDIT', 1600025);
    
    CREATE TEMPORARY TABLE seed_expected_idempotency_records LIKE idempotency_records;
    INSERT INTO seed_expected_idempotency_records (id, scope, request_key, actor_user_id, request_hash, status, order_id, response_hash, created_at, expires_at) VALUES
        (17001, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-1', 301, UNHEX(SHA2('DEMO-CREATE-BODY-1',256)), 'COMPLETED', 9001, UNHEX(SHA2('DEMO-CREATE-RESPONSE-1',256)), '2026-05-07 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17002, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-2', 302, UNHEX(SHA2('DEMO-CREATE-BODY-2',256)), 'COMPLETED', 9002, UNHEX(SHA2('DEMO-CREATE-RESPONSE-2',256)), '2026-06-09 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17003, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-3', 303, UNHEX(SHA2('DEMO-CREATE-BODY-3',256)), 'COMPLETED', 9003, UNHEX(SHA2('DEMO-CREATE-RESPONSE-3',256)), '2026-07-13 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17004, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-4', 304, UNHEX(SHA2('DEMO-CREATE-BODY-4',256)), 'COMPLETED', 9004, UNHEX(SHA2('DEMO-CREATE-RESPONSE-4',256)), '2026-09-04 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17005, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-5', 305, UNHEX(SHA2('DEMO-CREATE-BODY-5',256)), 'COMPLETED', 9005, UNHEX(SHA2('DEMO-CREATE-RESPONSE-5',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17006, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-6', 306, UNHEX(SHA2('DEMO-CREATE-BODY-6',256)), 'COMPLETED', 9006, UNHEX(SHA2('DEMO-CREATE-RESPONSE-6',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17007, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-7', 307, UNHEX(SHA2('DEMO-CREATE-BODY-7',256)), 'COMPLETED', 9007, UNHEX(SHA2('DEMO-CREATE-RESPONSE-7',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17008, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-8', 308, UNHEX(SHA2('DEMO-CREATE-BODY-8',256)), 'COMPLETED', 9008, UNHEX(SHA2('DEMO-CREATE-RESPONSE-8',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17009, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-9', 301, UNHEX(SHA2('DEMO-CREATE-BODY-9',256)), 'COMPLETED', 9009, UNHEX(SHA2('DEMO-CREATE-RESPONSE-9',256)), '2026-09-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17010, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-10', 302, UNHEX(SHA2('DEMO-CREATE-BODY-10',256)), 'COMPLETED', 9010, UNHEX(SHA2('DEMO-CREATE-RESPONSE-10',256)), '2026-09-30 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17011, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-11', 303, UNHEX(SHA2('DEMO-CREATE-BODY-11',256)), 'COMPLETED', 9011, UNHEX(SHA2('DEMO-CREATE-RESPONSE-11',256)), '2026-10-03 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17012, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-12', 304, UNHEX(SHA2('DEMO-CREATE-BODY-12',256)), 'COMPLETED', 9012, UNHEX(SHA2('DEMO-CREATE-RESPONSE-12',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17013, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-13', 305, UNHEX(SHA2('DEMO-CREATE-BODY-13',256)), 'COMPLETED', 9013, UNHEX(SHA2('DEMO-CREATE-RESPONSE-13',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17014, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-14', 306, UNHEX(SHA2('DEMO-CREATE-BODY-14',256)), 'COMPLETED', 9014, UNHEX(SHA2('DEMO-CREATE-RESPONSE-14',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17015, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-15', 307, UNHEX(SHA2('DEMO-CREATE-BODY-15',256)), 'COMPLETED', 9015, UNHEX(SHA2('DEMO-CREATE-RESPONSE-15',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17016, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-16', 308, UNHEX(SHA2('DEMO-CREATE-BODY-16',256)), 'COMPLETED', 9016, UNHEX(SHA2('DEMO-CREATE-RESPONSE-16',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17017, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-17', 301, UNHEX(SHA2('DEMO-CREATE-BODY-17',256)), 'COMPLETED', 9017, UNHEX(SHA2('DEMO-CREATE-RESPONSE-17',256)), '2026-10-04 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17018, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-18', 302, UNHEX(SHA2('DEMO-CREATE-BODY-18',256)), 'COMPLETED', 9018, UNHEX(SHA2('DEMO-CREATE-RESPONSE-18',256)), '2026-10-07 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17019, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-19', 303, UNHEX(SHA2('DEMO-CREATE-BODY-19',256)), 'COMPLETED', 9019, UNHEX(SHA2('DEMO-CREATE-RESPONSE-19',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17020, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-20', 304, UNHEX(SHA2('DEMO-CREATE-BODY-20',256)), 'COMPLETED', 9020, UNHEX(SHA2('DEMO-CREATE-RESPONSE-20',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17021, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-21', 305, UNHEX(SHA2('DEMO-CREATE-BODY-21',256)), 'COMPLETED', 9021, UNHEX(SHA2('DEMO-CREATE-RESPONSE-21',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17022, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-22', 306, UNHEX(SHA2('DEMO-CREATE-BODY-22',256)), 'COMPLETED', 9022, UNHEX(SHA2('DEMO-CREATE-RESPONSE-22',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17023, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-23', 307, UNHEX(SHA2('DEMO-CREATE-BODY-23',256)), 'COMPLETED', 9023, UNHEX(SHA2('DEMO-CREATE-RESPONSE-23',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000'),
        (17024, 'CREATE_ORDER', 'DEMO-IDEMPOTENCY-24', 308, UNHEX(SHA2('DEMO-CREATE-BODY-24',256)), 'COMPLETED', 9024, UNHEX(SHA2('DEMO-CREATE-RESPONSE-24',256)), '2026-10-08 10:00:00.000000', '2026-12-01 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_reviews LIKE reviews;
    INSERT INTO seed_expected_reviews (id, contract_id, reviewer_user_id, rating, comment, status, created_at) VALUES
        (27001, 6001, 301, 5, 'Đánh giá DEMO sau giao dịch đã hoàn thành và thanh toán.', 'PUBLISHED', '2026-05-10 10:00:00.000000'),
        (27009, 6009, 301, 4, 'Đánh giá DEMO sau giao dịch đã hoàn thành và thanh toán.', 'PUBLISHED', '2026-09-11 10:00:00.000000'),
        (27017, 6017, 301, 5, 'Đánh giá DEMO sau giao dịch đã hoàn thành và thanh toán.', 'PUBLISHED', '2026-10-07 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_reports LIKE reports;
    INSERT INTO seed_expected_reports (id, public_code, reporter_user_id, target_user_id, related_contract_id, reason_code, description, status, assigned_admin_id, resolution, resolved_by, resolved_at, version, created_at) VALUES
        (28001, 'DEMO-REPORT-1', 301, 201, 6001, 'CONTENT', 'Báo cáo DEMO phục vụ hàng đợi quản trị, không phải tranh chấp thật.', 'OPEN', NULL, NULL, NULL, NULL, 0, '2026-10-14 10:00:00.000000'),
        (28002, 'DEMO-REPORT-2', 302, 202, 6002, 'CONDUCT', 'Báo cáo DEMO phục vụ hàng đợi quản trị, không phải tranh chấp thật.', 'INVESTIGATING', 100, NULL, NULL, NULL, 0, '2026-10-14 10:00:00.000000'),
        (28003, 'DEMO-REPORT-3', 303, 203, 6003, 'CONTENT', 'Báo cáo DEMO phục vụ hàng đợi quản trị, không phải tranh chấp thật.', 'RESOLVED', 100, 'Kết luận DEMO: đã kiểm tra nội dung minh chứng giả lập.', 100, '2026-10-15 00:00:00.000000', 0, '2026-10-14 10:00:00.000000'),
        (28004, 'DEMO-REPORT-4', 201, 304, NULL, 'CONDUCT', 'Báo cáo DEMO phục vụ hàng đợi quản trị, không phải tranh chấp thật.', 'DISMISSED', 100, 'Kết luận DEMO: đã kiểm tra nội dung minh chứng giả lập.', 100, '2026-10-15 00:00:00.000000', 0, '2026-10-14 10:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_report_evidence LIKE report_evidence;
    INSERT INTO seed_expected_report_evidence (report_id, file_id) VALUES
        (28001, 29001),
        (28002, 29002),
        (28003, 29003),
        (28004, 29004);
    
    CREATE TEMPORARY TABLE seed_expected_notifications LIKE notifications;
    INSERT INTO seed_expected_notifications (id, recipient_user_id, event_key, notification_type, title, body, order_id, refund_id, report_id, read_at, created_at) VALUES
        (18001, 301, 'DEMO-ORDER-CREATED-1', 'ORDER_CREATED', 'Đơn đăng ký DEMO 1', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9001, NULL, NULL, NULL, '2026-05-07 10:00:00.000000'),
        (18002, 302, 'DEMO-ORDER-CREATED-2', 'ORDER_CREATED', 'Đơn đăng ký DEMO 2', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9002, NULL, NULL, NULL, '2026-06-09 10:00:00.000000'),
        (18003, 303, 'DEMO-ORDER-CREATED-3', 'ORDER_CREATED', 'Đơn đăng ký DEMO 3', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9003, NULL, NULL, NULL, '2026-07-13 10:00:00.000000'),
        (18004, 304, 'DEMO-ORDER-CREATED-4', 'ORDER_CREATED', 'Đơn đăng ký DEMO 4', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9004, NULL, NULL, NULL, '2026-09-04 10:00:00.000000'),
        (18005, 305, 'DEMO-ORDER-CREATED-5', 'ORDER_CREATED', 'Đơn đăng ký DEMO 5', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9005, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18006, 306, 'DEMO-ORDER-CREATED-6', 'ORDER_CREATED', 'Đơn đăng ký DEMO 6', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9006, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18007, 307, 'DEMO-ORDER-CREATED-7', 'ORDER_CREATED', 'Đơn đăng ký DEMO 7', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9007, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18008, 308, 'DEMO-ORDER-CREATED-8', 'ORDER_CREATED', 'Đơn đăng ký DEMO 8', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9008, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18009, 301, 'DEMO-ORDER-CREATED-9', 'ORDER_CREATED', 'Đơn đăng ký DEMO 9', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9009, NULL, NULL, NULL, '2026-09-08 10:00:00.000000'),
        (18010, 302, 'DEMO-ORDER-CREATED-10', 'ORDER_CREATED', 'Đơn đăng ký DEMO 10', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9010, NULL, NULL, NULL, '2026-09-30 10:00:00.000000'),
        (18011, 303, 'DEMO-ORDER-CREATED-11', 'ORDER_CREATED', 'Đơn đăng ký DEMO 11', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9011, NULL, NULL, NULL, '2026-10-03 10:00:00.000000'),
        (18012, 304, 'DEMO-ORDER-CREATED-12', 'ORDER_CREATED', 'Đơn đăng ký DEMO 12', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9012, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18013, 305, 'DEMO-ORDER-CREATED-13', 'ORDER_CREATED', 'Đơn đăng ký DEMO 13', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9013, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18014, 306, 'DEMO-ORDER-CREATED-14', 'ORDER_CREATED', 'Đơn đăng ký DEMO 14', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9014, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18015, 307, 'DEMO-ORDER-CREATED-15', 'ORDER_CREATED', 'Đơn đăng ký DEMO 15', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9015, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18016, 308, 'DEMO-ORDER-CREATED-16', 'ORDER_CREATED', 'Đơn đăng ký DEMO 16', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9016, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18017, 301, 'DEMO-ORDER-CREATED-17', 'ORDER_CREATED', 'Đơn đăng ký DEMO 17', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9017, NULL, NULL, NULL, '2026-10-04 10:00:00.000000'),
        (18018, 302, 'DEMO-ORDER-CREATED-18', 'ORDER_CREATED', 'Đơn đăng ký DEMO 18', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9018, NULL, NULL, NULL, '2026-10-07 10:00:00.000000'),
        (18019, 303, 'DEMO-ORDER-CREATED-19', 'ORDER_CREATED', 'Đơn đăng ký DEMO 19', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9019, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18020, 304, 'DEMO-ORDER-CREATED-20', 'ORDER_CREATED', 'Đơn đăng ký DEMO 20', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9020, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18021, 305, 'DEMO-ORDER-CREATED-21', 'ORDER_CREATED', 'Đơn đăng ký DEMO 21', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9021, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18022, 306, 'DEMO-ORDER-CREATED-22', 'ORDER_CREATED', 'Đơn đăng ký DEMO 22', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9022, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18023, 307, 'DEMO-ORDER-CREATED-23', 'ORDER_CREATED', 'Đơn đăng ký DEMO 23', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9023, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (18024, 308, 'DEMO-ORDER-CREATED-24', 'ORDER_CREATED', 'Đơn đăng ký DEMO 24', 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.', 9024, NULL, NULL, NULL, '2026-10-08 10:00:00.000000'),
        (32014, 306, 'DEMO-REFUND-NOTICE-6014', 'REFUND_STATUS', 'Cập nhật hoàn tiền DEMO', 'Trạng thái SUCCEEDED; tiền hoàn khác với trạng thái hủy đơn.', 9014, 29014, NULL, NULL, '2026-10-12 10:00:00.000000'),
        (32015, 307, 'DEMO-REFUND-NOTICE-6015', 'REFUND_STATUS', 'Cập nhật hoàn tiền DEMO', 'Trạng thái PROCESSING; tiền hoàn khác với trạng thái hủy đơn.', 9015, 29015, NULL, NULL, '2026-10-12 10:00:00.000000'),
        (32016, 308, 'DEMO-REFUND-NOTICE-6016', 'REFUND_STATUS', 'Cập nhật hoàn tiền DEMO', 'Trạng thái FAILED; tiền hoàn khác với trạng thái hủy đơn.', 9016, 29016, NULL, NULL, '2026-10-12 10:00:00.000000'),
        (32024, 306, 'DEMO-REFUND-NOTICE-6024', 'REFUND_STATUS', 'Cập nhật hoàn tiền DEMO', 'Trạng thái SUCCEEDED; tiền hoàn khác với trạng thái hủy đơn.', 9022, 29024, NULL, NULL, '2026-10-12 10:00:00.000000'),
        (32026, 308, 'DEMO-REFUND-NOTICE-6026', 'REFUND_STATUS', 'Cập nhật hoàn tiền DEMO', 'Trạng thái REQUESTED; tiền hoàn khác với trạng thái hủy đơn.', 9024, 29026, NULL, NULL, '2026-10-12 10:00:00.000000'),
        (30001, 301, 'DEMO-REPORT-NOTICE-1', 'REPORT_STATUS', 'Báo cáo DEMO 1', 'Trạng thái xử lý: OPEN', NULL, NULL, 28001, NULL, '2026-10-15 00:00:00.000000'),
        (30002, 302, 'DEMO-REPORT-NOTICE-2', 'REPORT_STATUS', 'Báo cáo DEMO 2', 'Trạng thái xử lý: INVESTIGATING', NULL, NULL, 28002, NULL, '2026-10-15 00:00:00.000000'),
        (30003, 303, 'DEMO-REPORT-NOTICE-3', 'REPORT_STATUS', 'Báo cáo DEMO 3', 'Trạng thái xử lý: RESOLVED', NULL, NULL, 28003, NULL, '2026-10-15 00:00:00.000000'),
        (30004, 201, 'DEMO-REPORT-NOTICE-4', 'REPORT_STATUS', 'Báo cáo DEMO 4', 'Trạng thái xử lý: DISMISSED', NULL, NULL, 28004, NULL, '2026-10-15 00:00:00.000000');
    
    CREATE TEMPORARY TABLE seed_expected_audit_logs LIKE audit_logs;
    INSERT INTO seed_expected_audit_logs (id, actor_user_id, action_code, order_id, report_id, target_user_id, metadata, created_at) VALUES
        (19001, 301, 'ORDER_CREATED', 9001, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-05-07 10:00:00.000000'),
        (19002, 302, 'ORDER_CREATED', 9002, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-06-09 10:00:00.000000'),
        (19003, 303, 'ORDER_CREATED', 9003, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-07-13 10:00:00.000000'),
        (19004, 304, 'ORDER_CREATED', 9004, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-09-04 10:00:00.000000'),
        (19005, 305, 'ORDER_CREATED', 9005, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-10-08 10:00:00.000000'),
        (19006, 306, 'ORDER_CREATED', 9006, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-10-08 10:00:00.000000'),
        (19007, 307, 'ORDER_CREATED', 9007, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-10-08 10:00:00.000000'),
        (19008, 308, 'ORDER_CREATED', 9008, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','INVITATION'), '2026-10-08 10:00:00.000000'),
        (19009, 301, 'ORDER_CREATED', 9009, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-09-08 10:00:00.000000'),
        (19010, 302, 'ORDER_CREATED', 9010, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-09-30 10:00:00.000000'),
        (19011, 303, 'ORDER_CREATED', 9011, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-10-03 10:00:00.000000'),
        (19012, 304, 'ORDER_CREATED', 9012, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-10-08 10:00:00.000000'),
        (19013, 305, 'ORDER_CREATED', 9013, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-10-08 10:00:00.000000'),
        (19014, 306, 'ORDER_CREATED', 9014, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-10-08 10:00:00.000000'),
        (19015, 307, 'ORDER_CREATED', 9015, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-10-08 10:00:00.000000'),
        (19016, 308, 'ORDER_CREATED', 9016, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','JOB_APPLICATION'), '2026-10-08 10:00:00.000000'),
        (19017, 301, 'ORDER_CREATED', 9017, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-04 10:00:00.000000'),
        (19018, 302, 'ORDER_CREATED', 9018, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-07 10:00:00.000000'),
        (19019, 303, 'ORDER_CREATED', 9019, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-08 10:00:00.000000'),
        (19020, 304, 'ORDER_CREATED', 9020, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-08 10:00:00.000000'),
        (19021, 305, 'ORDER_CREATED', 9021, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-08 10:00:00.000000'),
        (19022, 306, 'ORDER_CREATED', 9022, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-08 10:00:00.000000'),
        (19023, 307, 'ORDER_CREATED', 9023, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-08 10:00:00.000000'),
        (19024, 308, 'ORDER_CREATED', 9024, NULL, NULL, JSON_OBJECT('fixture','educonnect-dev-v1','source','CATALOG'), '2026-10-08 10:00:00.000000'),
        (31001, 301, 'REPORT_CREATED', NULL, 28001, 201, JSON_OBJECT('fixture','educonnect-dev-v1','status','OPEN'), '2026-10-15 00:00:00.000000'),
        (31002, 302, 'REPORT_CREATED', NULL, 28002, 202, JSON_OBJECT('fixture','educonnect-dev-v1','status','INVESTIGATING'), '2026-10-15 00:00:00.000000'),
        (31003, 100, 'REPORT_DECIDED', NULL, 28003, 203, JSON_OBJECT('fixture','educonnect-dev-v1','status','RESOLVED'), '2026-10-15 00:00:00.000000'),
        (31004, 100, 'REPORT_DECIDED', NULL, 28004, 304, JSON_OBJECT('fixture','educonnect-dev-v1','status','DISMISSED'), '2026-10-15 00:00:00.000000');
    
    START TRANSACTION;
    SELECT COUNT(*) INTO v_existing FROM dev_seed_runs WHERE fixture_set='educonnect-dev-v1';
    IF v_existing=1 AND NOT EXISTS(SELECT 1 FROM dev_seed_runs WHERE fixture_set='educonnect-dev-v1' AND manifest_hash=v_hash) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture version/hash da thay doi. Khong ghi de; tao database development moi.';
    END IF;
    IF EXISTS(SELECT 1 FROM seed_expected_roles e LEFT JOIN roles a ON a.code=e.code WHERE a.code IS NULL OR NOT(a.code <=> e.code) OR NOT(a.label <=> e.label)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Danh muc roles khong khop V2; dung seed, doi chieu schema/data.';
    END IF;
    IF EXISTS(SELECT 1 FROM seed_expected_subjects e LEFT JOIN subjects a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.code <=> e.code) OR NOT(a.name <=> e.name)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Danh muc subjects khong khop V2; dung seed, doi chieu schema/data.';
    END IF;
    IF EXISTS(SELECT 1 FROM seed_expected_grade_levels e LEFT JOIN grade_levels a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.code <=> e.code) OR NOT(a.name <=> e.name)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Danh muc grade_levels khong khop V2; dung seed, doi chieu schema/data.';
    END IF;
    IF EXISTS(SELECT 1 FROM seed_expected_areas e LEFT JOIN areas a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.code <=> e.code) OR NOT(a.name <=> e.name)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Danh muc areas khong khop V2; dung seed, doi chieu schema/data.';
    END IF;
    IF EXISTS(SELECT 1 FROM seed_expected_delivery_modes e LEFT JOIN delivery_modes a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.code <=> e.code) OR NOT(a.name <=> e.name)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Danh muc delivery_modes khong khop V2; dung seed, doi chieu schema/data.';
    END IF;
    IF EXISTS(SELECT 1 FROM seed_expected_order_status_transitions e LEFT JOIN order_status_transitions a ON a.from_status=e.from_status AND a.to_status=e.to_status AND a.actor_role_code=e.actor_role_code WHERE a.from_status IS NULL OR NOT(a.from_status <=> e.from_status) OR NOT(a.to_status <=> e.to_status) OR NOT(a.actor_role_code <=> e.actor_role_code)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Danh muc order_status_transitions khong khop V2; dung seed, doi chieu schema/data.';
    END IF;
    IF v_existing=0 THEN
        IF EXISTS(SELECT 1 FROM user_accounts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu user_accounts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM user_roles LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu user_roles; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM learner_profiles LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu learner_profiles; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM tutor_profiles LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu tutor_profiles; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM tutor_subjects LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu tutor_subjects; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM tutor_grade_levels LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu tutor_grade_levels; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM tutor_areas LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu tutor_areas; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM tutor_delivery_modes LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu tutor_delivery_modes; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM private_files LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu private_files; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM tutor_profile_evidence LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu tutor_profile_evidence; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM auth_tokens LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu auth_tokens; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM offerings LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu offerings; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM offering_time_slots LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu offering_time_slots; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM invitations LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu invitations; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM job_posts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu job_posts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM job_applications LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu job_applications; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM job_selections LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu job_selections; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM registration_sources LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu registration_sources; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM carts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu carts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM cart_items LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu cart_items; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM orders LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu orders; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM order_items LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu order_items; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM contracts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu contracts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM order_status_history LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu order_status_history; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM contract_status_history LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu contract_status_history; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM enrollments LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu enrollments; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM payments LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu payments; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM payment_attempts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu payment_attempts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM payment_webhook_events LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu payment_webhook_events; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM payment_allocations LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu payment_allocations; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM ledger_accounts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu ledger_accounts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM wallets LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu wallets; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM escrow_accounts LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu escrow_accounts; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM releases LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu releases; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM refunds LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu refunds; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM refund_status_history LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu refund_status_history; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM money_journals LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu money_journals; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM ledger_entries LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu ledger_entries; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM idempotency_records LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu idempotency_records; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM reviews LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu reviews; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM reports LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu reports; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM report_evidence LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu report_evidence; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM notifications LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu notifications; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        IF EXISTS(SELECT 1 FROM audit_logs LIMIT 1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='DB da co du lieu audit_logs; seed lan dau yeu cau DB ung dung trong.';
        END IF;
        INSERT INTO user_accounts (id, public_code, email, password_hash, status, email_verified_at, display_name, phone, bio, authentication_version, version, created_at, updated_at) SELECT id, public_code, email, password_hash, status, email_verified_at, display_name, phone, bio, authentication_version, version, created_at, updated_at FROM seed_expected_user_accounts;
        INSERT INTO user_roles (user_id, role_code) SELECT user_id, role_code FROM seed_expected_user_roles;
        INSERT INTO learner_profiles (user_id, learner_kind, grade_level_id, area_id) SELECT user_id, learner_kind, grade_level_id, area_id FROM seed_expected_learner_profiles;
        INSERT INTO tutor_profiles (user_id, review_status, headline, experience_years, reviewed_by, reviewed_at, review_note, version, updated_at) SELECT user_id, review_status, headline, experience_years, reviewed_by, reviewed_at, review_note, version, updated_at FROM seed_expected_tutor_profiles;
        INSERT INTO tutor_subjects (tutor_id, subject_id) SELECT tutor_id, subject_id FROM seed_expected_tutor_subjects;
        INSERT INTO tutor_grade_levels (tutor_id, grade_level_id) SELECT tutor_id, grade_level_id FROM seed_expected_tutor_grade_levels;
        INSERT INTO tutor_areas (tutor_id, area_id) SELECT tutor_id, area_id FROM seed_expected_tutor_areas;
        INSERT INTO tutor_delivery_modes (tutor_id, delivery_mode_id) SELECT tutor_id, delivery_mode_id FROM seed_expected_tutor_delivery_modes;
        INSERT INTO private_files (id, owner_user_id, storage_key, purpose, original_name, mime_type, byte_size, sha256, created_at) SELECT id, owner_user_id, storage_key, purpose, original_name, mime_type, byte_size, sha256, created_at FROM seed_expected_private_files;
        INSERT INTO tutor_profile_evidence (tutor_id, file_id) SELECT tutor_id, file_id FROM seed_expected_tutor_profile_evidence;
        INSERT INTO auth_tokens (id, user_id, purpose, token_hash, created_at, expires_at, used_at, revoked_at) SELECT id, user_id, purpose, token_hash, created_at, expires_at, used_at, revoked_at FROM seed_expected_auth_tokens;
        INSERT INTO offerings (id, public_code, tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, capacity, starts_on, ends_on, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at) SELECT id, public_code, tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, capacity, starts_on, ends_on, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at FROM seed_expected_offerings;
        INSERT INTO offering_time_slots (id, offering_id, weekday, start_time, end_time, time_zone) SELECT id, offering_id, weekday, start_time, end_time, time_zone FROM seed_expected_offering_time_slots;
        INSERT INTO invitations (id, public_code, learner_id, tutor_id, offering_id, subject_id, grade_level_id, area_id, delivery_mode_id, proposed_unit_price, session_count, terms_version, terms_text, status, accepted_at, version, created_at, expires_at) SELECT id, public_code, learner_id, tutor_id, offering_id, subject_id, grade_level_id, area_id, delivery_mode_id, proposed_unit_price, session_count, terms_version, terms_text, status, accepted_at, version, created_at, expires_at FROM seed_expected_invitations;
        INSERT INTO job_posts (id, public_code, learner_id, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, budget_per_session, session_count, status, version, created_at) SELECT id, public_code, learner_id, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, budget_per_session, session_count, status, version, created_at FROM seed_expected_job_posts;
        INSERT INTO job_applications (id, job_id, tutor_id, proposed_unit_price, message, status, version, created_at) SELECT id, job_id, tutor_id, proposed_unit_price, message, status, version, created_at FROM seed_expected_job_applications;
        INSERT INTO job_selections (job_id, application_id, tutor_id, selected_by, terms_version, terms_text, selected_at) SELECT job_id, application_id, tutor_id, selected_by, terms_version, terms_text, selected_at FROM seed_expected_job_selections;
        INSERT INTO registration_sources (id, source_kind, learner_id, tutor_id, invitation_id, job_id, application_id, offering_id, created_at) SELECT id, source_kind, learner_id, tutor_id, invitation_id, job_id, application_id, offering_id, created_at FROM seed_expected_registration_sources;
        INSERT INTO carts (id, learner_id, version, updated_at) SELECT id, learner_id, version, updated_at FROM seed_expected_carts;
        INSERT INTO cart_items (id, cart_id, offering_id, seat_count, offering_version_seen, created_at) SELECT id, cart_id, offering_id, seat_count, offering_version_seen, created_at FROM seed_expected_cart_items;
        INSERT INTO orders (id, public_code, learner_id, status, total_amount, currency, creation_key, cancellation_reason, cancelled_at, version, created_at, updated_at) SELECT id, public_code, learner_id, status, total_amount, currency, creation_key, cancellation_reason, cancelled_at, version, created_at, updated_at FROM seed_expected_orders;
        INSERT INTO order_items (id, order_id, line_number, registration_source_id, tutor_id, title_snapshot, offering_type_snapshot, unit_price_snapshot, session_count_snapshot, seat_count, line_total, fee_rate_snapshot, fee_policy_version, terms_version_snapshot, terms_text_snapshot, terms_hash, created_at) SELECT id, order_id, line_number, registration_source_id, tutor_id, title_snapshot, offering_type_snapshot, unit_price_snapshot, session_count_snapshot, seat_count, line_total, fee_rate_snapshot, fee_policy_version, terms_version_snapshot, terms_text_snapshot, terms_hash, created_at FROM seed_expected_order_items;
        INSERT INTO contracts (id, public_code, order_item_id, learner_id, tutor_id, status, agreed_terms_text, agreed_terms_hash, learner_accepted_at, tutor_accepted_at, completed_at, version, created_at) SELECT id, public_code, order_item_id, learner_id, tutor_id, status, agreed_terms_text, agreed_terms_hash, learner_accepted_at, tutor_accepted_at, completed_at, version, created_at FROM seed_expected_contracts;
        INSERT INTO order_status_history (id, order_id, from_status, to_status, actor_user_id, reason, entity_version, changed_at, actor_role_code) SELECT id, order_id, from_status, to_status, actor_user_id, reason, entity_version, changed_at, actor_role_code FROM seed_expected_order_status_history;
        INSERT INTO contract_status_history (id, contract_id, from_status, to_status, actor_user_id, reason, entity_version, changed_at) SELECT id, contract_id, from_status, to_status, actor_user_id, reason, entity_version, changed_at FROM seed_expected_contract_status_history;
        INSERT INTO enrollments (id, contract_id, offering_id, learner_id, seat_count, status, reserved_until, confirmed_at, version, created_at) SELECT id, contract_id, offering_id, learner_id, seat_count, status, reserved_until, confirmed_at, version, created_at FROM seed_expected_enrollments;
        INSERT INTO payments (id, public_code, order_id, amount, wallet_amount, provider_amount, status, funded_at, version, created_at) SELECT id, public_code, order_id, amount, wallet_amount, provider_amount, status, funded_at, version, created_at FROM seed_expected_payments;
        INSERT INTO payment_attempts (id, payment_id, attempt_number, provider, provider_order_code, provider_reference, request_key, amount, status, verified_at, failure_code, created_at, expires_at) SELECT id, payment_id, attempt_number, provider, provider_order_code, provider_reference, request_key, amount, status, verified_at, failure_code, created_at, expires_at FROM seed_expected_payment_attempts;
        INSERT INTO payment_webhook_events (id, provider, event_key, payment_attempt_id, payload_hash, signature_verified, status, received_at, processed_at, error_code) SELECT id, provider, event_key, payment_attempt_id, payload_hash, signature_verified, status, received_at, processed_at, error_code FROM seed_expected_payment_webhook_events;
        INSERT INTO payment_allocations (payment_id, contract_id, amount, wallet_amount, provider_amount) SELECT payment_id, contract_id, amount, wallet_amount, provider_amount FROM seed_expected_payment_allocations;
        INSERT INTO ledger_accounts (id, account_code, account_kind, owner_user_id, currency, version) SELECT id, account_code, account_kind, owner_user_id, currency, version FROM seed_expected_ledger_accounts;
        INSERT INTO wallets (user_id, ledger_account_id) SELECT user_id, ledger_account_id FROM seed_expected_wallets;
        INSERT INTO escrow_accounts (contract_id, ledger_account_id) SELECT contract_id, ledger_account_id FROM seed_expected_escrow_accounts;
        INSERT INTO releases (id, contract_id, release_key, reason_code, gross_amount, fee_rate_snapshot, fee_amount, tutor_net_amount, fee_policy_version, rounding_mode, approved_by, released_at) SELECT id, contract_id, release_key, reason_code, gross_amount, fee_rate_snapshot, fee_amount, tutor_net_amount, fee_policy_version, rounding_mode, approved_by, released_at FROM seed_expected_releases;
        INSERT INTO refunds (id, payment_id, contract_id, request_key, basis_amount_snapshot, refund_rate_snapshot, amount, policy_version, destination, status, requested_by, reason, provider_reference, failure_code, requested_at, processed_at, version) SELECT id, payment_id, contract_id, request_key, basis_amount_snapshot, refund_rate_snapshot, amount, policy_version, destination, status, requested_by, reason, provider_reference, failure_code, requested_at, processed_at, version FROM seed_expected_refunds;
        INSERT INTO refund_status_history (id, refund_id, from_status, to_status, actor_user_id, reason, changed_at) SELECT id, refund_id, from_status, to_status, actor_user_id, reason, changed_at FROM seed_expected_refund_status_history;
        INSERT INTO money_journals (id, business_key, journal_kind, payment_id, contract_id, release_id, refund_id, wallet_user_id, memo, posted_at) SELECT id, business_key, journal_kind, payment_id, contract_id, release_id, refund_id, wallet_user_id, memo, posted_at FROM seed_expected_money_journals;
        INSERT INTO ledger_entries (id, journal_id, line_number, ledger_account_id, entry_side, amount) SELECT id, journal_id, line_number, ledger_account_id, entry_side, amount FROM seed_expected_ledger_entries;
        INSERT INTO idempotency_records (id, scope, request_key, actor_user_id, request_hash, status, order_id, response_hash, created_at, expires_at) SELECT id, scope, request_key, actor_user_id, request_hash, status, order_id, response_hash, created_at, expires_at FROM seed_expected_idempotency_records;
        INSERT INTO reviews (id, contract_id, reviewer_user_id, rating, comment, status, created_at) SELECT id, contract_id, reviewer_user_id, rating, comment, status, created_at FROM seed_expected_reviews;
        INSERT INTO reports (id, public_code, reporter_user_id, target_user_id, related_contract_id, reason_code, description, status, assigned_admin_id, resolution, resolved_by, resolved_at, version, created_at) SELECT id, public_code, reporter_user_id, target_user_id, related_contract_id, reason_code, description, status, assigned_admin_id, resolution, resolved_by, resolved_at, version, created_at FROM seed_expected_reports;
        INSERT INTO report_evidence (report_id, file_id) SELECT report_id, file_id FROM seed_expected_report_evidence;
        INSERT INTO notifications (id, recipient_user_id, event_key, notification_type, title, body, order_id, refund_id, report_id, read_at, created_at) SELECT id, recipient_user_id, event_key, notification_type, title, body, order_id, refund_id, report_id, read_at, created_at FROM seed_expected_notifications;
        INSERT INTO audit_logs (id, actor_user_id, action_code, order_id, report_id, target_user_id, metadata, created_at) SELECT id, actor_user_id, action_code, order_id, report_id, target_user_id, metadata, created_at FROM seed_expected_audit_logs;
        INSERT INTO dev_seed_runs (fixture_set,manifest_hash,applied_at) VALUES ('educonnect-dev-v1',v_hash,'2026-10-15 00:00:00.000000');
    ELSE
        IF EXISTS(SELECT 1 FROM seed_expected_user_accounts e LEFT JOIN user_accounts a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.email <=> e.email) OR NOT(a.password_hash <=> e.password_hash) OR NOT(a.status <=> e.status) OR NOT(a.email_verified_at <=> e.email_verified_at) OR NOT(a.display_name <=> e.display_name) OR NOT(a.phone <=> e.phone) OR NOT(a.bio <=> e.bio) OR NOT(a.authentication_version <=> e.authentication_version) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at) OR NOT(a.updated_at <=> e.updated_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture user_accounts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_user_roles e LEFT JOIN user_roles a ON a.user_id=e.user_id AND a.role_code=e.role_code WHERE a.user_id IS NULL OR NOT(a.user_id <=> e.user_id) OR NOT(a.role_code <=> e.role_code)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture user_roles da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_learner_profiles e LEFT JOIN learner_profiles a ON a.user_id=e.user_id WHERE a.user_id IS NULL OR NOT(a.user_id <=> e.user_id) OR NOT(a.learner_kind <=> e.learner_kind) OR NOT(a.grade_level_id <=> e.grade_level_id) OR NOT(a.area_id <=> e.area_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture learner_profiles da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_tutor_profiles e LEFT JOIN tutor_profiles a ON a.user_id=e.user_id WHERE a.user_id IS NULL OR NOT(a.user_id <=> e.user_id) OR NOT(a.review_status <=> e.review_status) OR NOT(a.headline <=> e.headline) OR NOT(a.experience_years <=> e.experience_years) OR NOT(a.reviewed_by <=> e.reviewed_by) OR NOT(a.reviewed_at <=> e.reviewed_at) OR NOT(a.review_note <=> e.review_note) OR NOT(a.version <=> e.version) OR NOT(a.updated_at <=> e.updated_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture tutor_profiles da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_tutor_subjects e LEFT JOIN tutor_subjects a ON a.tutor_id=e.tutor_id AND a.subject_id=e.subject_id WHERE a.tutor_id IS NULL OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.subject_id <=> e.subject_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture tutor_subjects da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_tutor_grade_levels e LEFT JOIN tutor_grade_levels a ON a.tutor_id=e.tutor_id AND a.grade_level_id=e.grade_level_id WHERE a.tutor_id IS NULL OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.grade_level_id <=> e.grade_level_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture tutor_grade_levels da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_tutor_areas e LEFT JOIN tutor_areas a ON a.tutor_id=e.tutor_id AND a.area_id=e.area_id WHERE a.tutor_id IS NULL OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.area_id <=> e.area_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture tutor_areas da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_tutor_delivery_modes e LEFT JOIN tutor_delivery_modes a ON a.tutor_id=e.tutor_id AND a.delivery_mode_id=e.delivery_mode_id WHERE a.tutor_id IS NULL OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.delivery_mode_id <=> e.delivery_mode_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture tutor_delivery_modes da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_private_files e LEFT JOIN private_files a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.owner_user_id <=> e.owner_user_id) OR NOT(a.storage_key <=> e.storage_key) OR NOT(a.purpose <=> e.purpose) OR NOT(a.original_name <=> e.original_name) OR NOT(a.mime_type <=> e.mime_type) OR NOT(a.byte_size <=> e.byte_size) OR NOT(a.sha256 <=> e.sha256) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture private_files da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_tutor_profile_evidence e LEFT JOIN tutor_profile_evidence a ON a.tutor_id=e.tutor_id AND a.file_id=e.file_id WHERE a.tutor_id IS NULL OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.file_id <=> e.file_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture tutor_profile_evidence da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_auth_tokens e LEFT JOIN auth_tokens a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.user_id <=> e.user_id) OR NOT(a.purpose <=> e.purpose) OR NOT(a.token_hash <=> e.token_hash) OR NOT(a.created_at <=> e.created_at) OR NOT(a.expires_at <=> e.expires_at) OR NOT(a.used_at <=> e.used_at) OR NOT(a.revoked_at <=> e.revoked_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture auth_tokens da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_offerings e LEFT JOIN offerings a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.offering_type <=> e.offering_type) OR NOT(a.title <=> e.title) OR NOT(a.description <=> e.description) OR NOT(a.subject_id <=> e.subject_id) OR NOT(a.grade_level_id <=> e.grade_level_id) OR NOT(a.area_id <=> e.area_id) OR NOT(a.delivery_mode_id <=> e.delivery_mode_id) OR NOT(a.unit_price <=> e.unit_price) OR NOT(a.currency <=> e.currency) OR NOT(a.session_count <=> e.session_count) OR NOT(a.duration_minutes <=> e.duration_minutes) OR NOT(a.capacity <=> e.capacity) OR NOT(a.starts_on <=> e.starts_on) OR NOT(a.ends_on <=> e.ends_on) OR NOT(a.status <=> e.status) OR NOT(a.first_published_at <=> e.first_published_at) OR NOT(a.published_at <=> e.published_at) OR NOT(a.reviewed_by <=> e.reviewed_by) OR NOT(a.reviewed_at <=> e.reviewed_at) OR NOT(a.review_note <=> e.review_note) OR NOT(a.terms_version <=> e.terms_version) OR NOT(a.terms_text <=> e.terms_text) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at) OR NOT(a.updated_at <=> e.updated_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture offerings da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_offering_time_slots e LEFT JOIN offering_time_slots a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.offering_id <=> e.offering_id) OR NOT(a.weekday <=> e.weekday) OR NOT(a.start_time <=> e.start_time) OR NOT(a.end_time <=> e.end_time) OR NOT(a.time_zone <=> e.time_zone)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture offering_time_slots da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_invitations e LEFT JOIN invitations a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.offering_id <=> e.offering_id) OR NOT(a.subject_id <=> e.subject_id) OR NOT(a.grade_level_id <=> e.grade_level_id) OR NOT(a.area_id <=> e.area_id) OR NOT(a.delivery_mode_id <=> e.delivery_mode_id) OR NOT(a.proposed_unit_price <=> e.proposed_unit_price) OR NOT(a.session_count <=> e.session_count) OR NOT(a.terms_version <=> e.terms_version) OR NOT(a.terms_text <=> e.terms_text) OR NOT(a.status <=> e.status) OR NOT(a.accepted_at <=> e.accepted_at) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at) OR NOT(a.expires_at <=> e.expires_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture invitations da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_job_posts e LEFT JOIN job_posts a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.title <=> e.title) OR NOT(a.description <=> e.description) OR NOT(a.subject_id <=> e.subject_id) OR NOT(a.grade_level_id <=> e.grade_level_id) OR NOT(a.area_id <=> e.area_id) OR NOT(a.delivery_mode_id <=> e.delivery_mode_id) OR NOT(a.budget_per_session <=> e.budget_per_session) OR NOT(a.session_count <=> e.session_count) OR NOT(a.status <=> e.status) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture job_posts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_job_applications e LEFT JOIN job_applications a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.job_id <=> e.job_id) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.proposed_unit_price <=> e.proposed_unit_price) OR NOT(a.message <=> e.message) OR NOT(a.status <=> e.status) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture job_applications da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_job_selections e LEFT JOIN job_selections a ON a.job_id=e.job_id WHERE a.job_id IS NULL OR NOT(a.job_id <=> e.job_id) OR NOT(a.application_id <=> e.application_id) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.selected_by <=> e.selected_by) OR NOT(a.terms_version <=> e.terms_version) OR NOT(a.terms_text <=> e.terms_text) OR NOT(a.selected_at <=> e.selected_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture job_selections da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_registration_sources e LEFT JOIN registration_sources a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.source_kind <=> e.source_kind) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.invitation_id <=> e.invitation_id) OR NOT(a.job_id <=> e.job_id) OR NOT(a.application_id <=> e.application_id) OR NOT(a.offering_id <=> e.offering_id) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture registration_sources da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_carts e LEFT JOIN carts a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.version <=> e.version) OR NOT(a.updated_at <=> e.updated_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture carts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_cart_items e LEFT JOIN cart_items a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.cart_id <=> e.cart_id) OR NOT(a.offering_id <=> e.offering_id) OR NOT(a.seat_count <=> e.seat_count) OR NOT(a.offering_version_seen <=> e.offering_version_seen) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture cart_items da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_orders e LEFT JOIN orders a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.status <=> e.status) OR NOT(a.total_amount <=> e.total_amount) OR NOT(a.currency <=> e.currency) OR NOT(a.creation_key <=> e.creation_key) OR NOT(a.cancellation_reason <=> e.cancellation_reason) OR NOT(a.cancelled_at <=> e.cancelled_at) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at) OR NOT(a.updated_at <=> e.updated_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture orders da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_order_items e LEFT JOIN order_items a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.order_id <=> e.order_id) OR NOT(a.line_number <=> e.line_number) OR NOT(a.registration_source_id <=> e.registration_source_id) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.title_snapshot <=> e.title_snapshot) OR NOT(a.offering_type_snapshot <=> e.offering_type_snapshot) OR NOT(a.unit_price_snapshot <=> e.unit_price_snapshot) OR NOT(a.session_count_snapshot <=> e.session_count_snapshot) OR NOT(a.seat_count <=> e.seat_count) OR NOT(a.line_total <=> e.line_total) OR NOT(a.fee_rate_snapshot <=> e.fee_rate_snapshot) OR NOT(a.fee_policy_version <=> e.fee_policy_version) OR NOT(a.terms_version_snapshot <=> e.terms_version_snapshot) OR NOT(a.terms_text_snapshot <=> e.terms_text_snapshot) OR NOT(a.terms_hash <=> e.terms_hash) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture order_items da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_contracts e LEFT JOIN contracts a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.order_item_id <=> e.order_item_id) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.tutor_id <=> e.tutor_id) OR NOT(a.status <=> e.status) OR NOT(a.agreed_terms_text <=> e.agreed_terms_text) OR NOT(a.agreed_terms_hash <=> e.agreed_terms_hash) OR NOT(a.learner_accepted_at <=> e.learner_accepted_at) OR NOT(a.tutor_accepted_at <=> e.tutor_accepted_at) OR NOT(a.completed_at <=> e.completed_at) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture contracts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_order_status_history e LEFT JOIN order_status_history a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.order_id <=> e.order_id) OR NOT(a.from_status <=> e.from_status) OR NOT(a.to_status <=> e.to_status) OR NOT(a.actor_user_id <=> e.actor_user_id) OR NOT(a.reason <=> e.reason) OR NOT(a.entity_version <=> e.entity_version) OR NOT(a.changed_at <=> e.changed_at) OR NOT(a.actor_role_code <=> e.actor_role_code)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture order_status_history da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_contract_status_history e LEFT JOIN contract_status_history a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.from_status <=> e.from_status) OR NOT(a.to_status <=> e.to_status) OR NOT(a.actor_user_id <=> e.actor_user_id) OR NOT(a.reason <=> e.reason) OR NOT(a.entity_version <=> e.entity_version) OR NOT(a.changed_at <=> e.changed_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture contract_status_history da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_enrollments e LEFT JOIN enrollments a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.offering_id <=> e.offering_id) OR NOT(a.learner_id <=> e.learner_id) OR NOT(a.seat_count <=> e.seat_count) OR NOT(a.status <=> e.status) OR NOT(a.reserved_until <=> e.reserved_until) OR NOT(a.confirmed_at <=> e.confirmed_at) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture enrollments da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_payments e LEFT JOIN payments a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.order_id <=> e.order_id) OR NOT(a.amount <=> e.amount) OR NOT(a.wallet_amount <=> e.wallet_amount) OR NOT(a.provider_amount <=> e.provider_amount) OR NOT(a.status <=> e.status) OR NOT(a.funded_at <=> e.funded_at) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture payments da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_payment_attempts e LEFT JOIN payment_attempts a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.payment_id <=> e.payment_id) OR NOT(a.attempt_number <=> e.attempt_number) OR NOT(a.provider <=> e.provider) OR NOT(a.provider_order_code <=> e.provider_order_code) OR NOT(a.provider_reference <=> e.provider_reference) OR NOT(a.request_key <=> e.request_key) OR NOT(a.amount <=> e.amount) OR NOT(a.status <=> e.status) OR NOT(a.verified_at <=> e.verified_at) OR NOT(a.failure_code <=> e.failure_code) OR NOT(a.created_at <=> e.created_at) OR NOT(a.expires_at <=> e.expires_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture payment_attempts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_payment_webhook_events e LEFT JOIN payment_webhook_events a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.provider <=> e.provider) OR NOT(a.event_key <=> e.event_key) OR NOT(a.payment_attempt_id <=> e.payment_attempt_id) OR NOT(a.payload_hash <=> e.payload_hash) OR NOT(a.signature_verified <=> e.signature_verified) OR NOT(a.status <=> e.status) OR NOT(a.received_at <=> e.received_at) OR NOT(a.processed_at <=> e.processed_at) OR NOT(a.error_code <=> e.error_code)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture payment_webhook_events da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_payment_allocations e LEFT JOIN payment_allocations a ON a.payment_id=e.payment_id AND a.contract_id=e.contract_id WHERE a.payment_id IS NULL OR NOT(a.payment_id <=> e.payment_id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.amount <=> e.amount) OR NOT(a.wallet_amount <=> e.wallet_amount) OR NOT(a.provider_amount <=> e.provider_amount)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture payment_allocations da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_ledger_accounts e LEFT JOIN ledger_accounts a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.account_code <=> e.account_code) OR NOT(a.account_kind <=> e.account_kind) OR NOT(a.owner_user_id <=> e.owner_user_id) OR NOT(a.currency <=> e.currency) OR NOT(a.version <=> e.version)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture ledger_accounts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_wallets e LEFT JOIN wallets a ON a.user_id=e.user_id WHERE a.user_id IS NULL OR NOT(a.user_id <=> e.user_id) OR NOT(a.ledger_account_id <=> e.ledger_account_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture wallets da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_escrow_accounts e LEFT JOIN escrow_accounts a ON a.contract_id=e.contract_id WHERE a.contract_id IS NULL OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.ledger_account_id <=> e.ledger_account_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture escrow_accounts da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_releases e LEFT JOIN releases a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.release_key <=> e.release_key) OR NOT(a.reason_code <=> e.reason_code) OR NOT(a.gross_amount <=> e.gross_amount) OR NOT(a.fee_rate_snapshot <=> e.fee_rate_snapshot) OR NOT(a.fee_amount <=> e.fee_amount) OR NOT(a.tutor_net_amount <=> e.tutor_net_amount) OR NOT(a.fee_policy_version <=> e.fee_policy_version) OR NOT(a.rounding_mode <=> e.rounding_mode) OR NOT(a.approved_by <=> e.approved_by) OR NOT(a.released_at <=> e.released_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture releases da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_refunds e LEFT JOIN refunds a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.payment_id <=> e.payment_id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.request_key <=> e.request_key) OR NOT(a.basis_amount_snapshot <=> e.basis_amount_snapshot) OR NOT(a.refund_rate_snapshot <=> e.refund_rate_snapshot) OR NOT(a.amount <=> e.amount) OR NOT(a.policy_version <=> e.policy_version) OR NOT(a.destination <=> e.destination) OR NOT(a.status <=> e.status) OR NOT(a.requested_by <=> e.requested_by) OR NOT(a.reason <=> e.reason) OR NOT(a.provider_reference <=> e.provider_reference) OR NOT(a.failure_code <=> e.failure_code) OR NOT(a.requested_at <=> e.requested_at) OR NOT(a.processed_at <=> e.processed_at) OR NOT(a.pending_contract_id <=> e.pending_contract_id) OR NOT(a.version <=> e.version)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture refunds da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_refund_status_history e LEFT JOIN refund_status_history a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.refund_id <=> e.refund_id) OR NOT(a.from_status <=> e.from_status) OR NOT(a.to_status <=> e.to_status) OR NOT(a.actor_user_id <=> e.actor_user_id) OR NOT(a.reason <=> e.reason) OR NOT(a.changed_at <=> e.changed_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture refund_status_history da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_money_journals e LEFT JOIN money_journals a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.business_key <=> e.business_key) OR NOT(a.journal_kind <=> e.journal_kind) OR NOT(a.payment_id <=> e.payment_id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.release_id <=> e.release_id) OR NOT(a.refund_id <=> e.refund_id) OR NOT(a.wallet_user_id <=> e.wallet_user_id) OR NOT(a.memo <=> e.memo) OR NOT(a.posted_at <=> e.posted_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture money_journals da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_ledger_entries e LEFT JOIN ledger_entries a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.journal_id <=> e.journal_id) OR NOT(a.line_number <=> e.line_number) OR NOT(a.ledger_account_id <=> e.ledger_account_id) OR NOT(a.entry_side <=> e.entry_side) OR NOT(a.amount <=> e.amount)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture ledger_entries da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_idempotency_records e LEFT JOIN idempotency_records a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.scope <=> e.scope) OR NOT(a.request_key <=> e.request_key) OR NOT(a.actor_user_id <=> e.actor_user_id) OR NOT(a.request_hash <=> e.request_hash) OR NOT(a.status <=> e.status) OR NOT(a.order_id <=> e.order_id) OR NOT(a.response_hash <=> e.response_hash) OR NOT(a.created_at <=> e.created_at) OR NOT(a.expires_at <=> e.expires_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture idempotency_records da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_reviews e LEFT JOIN reviews a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.contract_id <=> e.contract_id) OR NOT(a.reviewer_user_id <=> e.reviewer_user_id) OR NOT(a.rating <=> e.rating) OR NOT(a.comment <=> e.comment) OR NOT(a.status <=> e.status) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture reviews da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_reports e LEFT JOIN reports a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.public_code <=> e.public_code) OR NOT(a.reporter_user_id <=> e.reporter_user_id) OR NOT(a.target_user_id <=> e.target_user_id) OR NOT(a.related_contract_id <=> e.related_contract_id) OR NOT(a.reason_code <=> e.reason_code) OR NOT(a.description <=> e.description) OR NOT(a.status <=> e.status) OR NOT(a.assigned_admin_id <=> e.assigned_admin_id) OR NOT(a.resolution <=> e.resolution) OR NOT(a.resolved_by <=> e.resolved_by) OR NOT(a.resolved_at <=> e.resolved_at) OR NOT(a.version <=> e.version) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture reports da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_report_evidence e LEFT JOIN report_evidence a ON a.report_id=e.report_id AND a.file_id=e.file_id WHERE a.report_id IS NULL OR NOT(a.report_id <=> e.report_id) OR NOT(a.file_id <=> e.file_id)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture report_evidence da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_notifications e LEFT JOIN notifications a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.recipient_user_id <=> e.recipient_user_id) OR NOT(a.event_key <=> e.event_key) OR NOT(a.notification_type <=> e.notification_type) OR NOT(a.title <=> e.title) OR NOT(a.body <=> e.body) OR NOT(a.order_id <=> e.order_id) OR NOT(a.refund_id <=> e.refund_id) OR NOT(a.report_id <=> e.report_id) OR NOT(a.read_at <=> e.read_at) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture notifications da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
        IF EXISTS(SELECT 1 FROM seed_expected_audit_logs e LEFT JOIN audit_logs a ON a.id=e.id WHERE a.id IS NULL OR NOT(a.id <=> e.id) OR NOT(a.actor_user_id <=> e.actor_user_id) OR NOT(a.action_code <=> e.action_code) OR NOT(a.order_id <=> e.order_id) OR NOT(a.report_id <=> e.report_id) OR NOT(a.target_user_id <=> e.target_user_id) OR NOT(a.metadata <=> e.metadata) OR NOT(a.created_at <=> e.created_at)) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fixture audit_logs da bi thay doi/thieu; khong ghi de, hay dung seed.';
        END IF;
    END IF;
    COMMIT;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_user_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_user_roles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_learner_profiles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_profiles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_subjects;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_grade_levels;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_areas;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_delivery_modes;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_private_files;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_tutor_profile_evidence;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_auth_tokens;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_offerings;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_offering_time_slots;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_invitations;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_posts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_applications;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_job_selections;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_registration_sources;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_carts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_cart_items;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_orders;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_items;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_contracts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_contract_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_enrollments;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payments;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_attempts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_webhook_events;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_payment_allocations;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_ledger_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_wallets;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_escrow_accounts;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_releases;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_refunds;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_refund_status_history;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_money_journals;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_ledger_entries;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_idempotency_records;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_reviews;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_reports;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_report_evidence;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_notifications;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_audit_logs;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_roles;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_subjects;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_grade_levels;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_areas;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_delivery_modes;
    DROP TEMPORARY TABLE IF EXISTS seed_expected_order_status_transitions;
    DO RELEASE_LOCK(CONCAT(DATABASE(), ':educonnect-dev-v1'));
    SELECT CASE WHEN v_existing=0 THEN 'SEEDED' ELSE 'UNCHANGED_NOOP' END AS seed_result,
           'educonnect-dev-v1' AS fixture_set;
END$$
DELIMITER ;
CALL educonnect_seed_dev_v1();
DROP PROCEDURE educonnect_seed_dev_v1;

