-- V2: danh mục tham chiếu, không tài khoản/đơn/ledger DEMO.
-- Mã là hợp đồng dữ liệu; mở rộng bằng migration mới, không sửa migration đã áp dụng.
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';

INSERT INTO roles (code, label) VALUES
('ADMIN', 'Quản trị'),
('TUTOR', 'Gia sư'),
('LEARNER', 'Người học/phụ huynh');

INSERT INTO subjects (id, code, name) VALUES
(1, 'MATH', 'Toán'),
(2, 'LITERATURE', 'Ngữ văn'),
(3, 'ENGLISH', 'Tiếng Anh'),
(4, 'PHYSICS', 'Vật lý'),
(5, 'CHEMISTRY', 'Hóa học');

INSERT INTO grade_levels (id, code, name) VALUES
(1, 'GRADE_8', 'Lớp 8'),
(2, 'GRADE_9', 'Lớp 9'),
(3, 'GRADE_10', 'Lớp 10'),
(4, 'GRADE_11', 'Lớp 11'),
(5, 'GRADE_12', 'Lớp 12'),
(6, 'EXAM_PREP', 'Luyện thi'),
(7, 'ADULT', 'Người đi làm');

INSERT INTO areas (id, code, name) VALUES
(1, 'HCM_THU_DUC', 'Thủ Đức, TP. Hồ Chí Minh'),
(2, 'HANOI_CAU_GIAY', 'Cầu Giấy, Hà Nội'),
(3, 'DANANG_HAI_CHAU', 'Hải Châu, Đà Nẵng'),
(4, 'NATIONWIDE', 'Toàn quốc');

INSERT INTO delivery_modes (id, code, name) VALUES
(1, 'ONLINE', 'Trực tuyến'),
(2, 'IN_PERSON', 'Trực tiếp'),
(3, 'HYBRID', 'Kết hợp');

INSERT INTO order_status_transitions (from_status, to_status, actor_role_code) VALUES
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


