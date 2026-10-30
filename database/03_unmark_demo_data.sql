-- Gỡ nhãn "DEMO"/"giả lập" khỏi dữ liệu seed trong educonnect_dev để dữ liệu hiển thị như dữ liệu thật.
-- Chỉ đổi mã hiển thị (public_code) và nội dung chữ; không đụng ID, khóa ngoại, số tiền, trạng thái, email đăng nhập.
-- Chạy được nhiều lần (mỗi câu chỉ khớp bản ghi còn nhãn). Nên sao lưu trước: mysqlsh util dump-schemas.
SET NAMES utf8mb4;
START TRANSACTION;

-- Mã hiển thị: bỏ tiền tố DEMO- (DEMO-OF-01 -> OF-01); không phá tính duy nhất vì chỉ cắt cùng một tiền tố.
UPDATE user_accounts SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE offerings     SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE job_posts     SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE invitations   SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE contracts     SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE orders        SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE payments      SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';
UPDATE reports       SET public_code = SUBSTRING(public_code, 6) WHERE public_code LIKE 'DEMO-%';

-- Giới thiệu tài khoản.
UPDATE user_accounts SET bio = 'Gia sư có kinh nghiệm giảng dạy, xây dựng lộ trình học riêng cho từng học viên.'
 WHERE bio = 'Hồ sơ gia sư giả lập cho kiểm thử Educonnect.';
UPDATE user_accounts SET bio = NULL WHERE bio = 'Dữ liệu người học/phụ huynh giả lập.';

-- Dịch vụ/lớp.
UPDATE offerings SET description = CONCAT('Khóa học gồm 5 buổi, mỗi buổi 90 phút, nội dung được xây dựng theo trình độ của học viên.')
 WHERE description = 'Gói học DEMO; không dùng như điều khoản production.';
UPDATE offerings SET review_note = REPLACE(review_note, 'DEMO: ', '') WHERE review_note LIKE 'DEMO: %';

-- Các nội dung có chữ " DEMO" ở giữa câu: bỏ từ này (Điều khoản DEMO 1 -> Điều khoản 1; Tin DEMO 9 -> Tin 9).
UPDATE offerings SET terms_text = REPLACE(terms_text, ' DEMO', '') WHERE terms_text LIKE '% DEMO%';
UPDATE job_posts SET title = REPLACE(title, ' DEMO', '') WHERE title LIKE '% DEMO%';
UPDATE job_posts SET description = 'Tìm gia sư cho 5 buổi học.' WHERE description = 'Tìm gia sư cho 5 buổi, dữ liệu giả lập.';
UPDATE job_applications SET message = REPLACE(message, ' DEMO', '') WHERE message LIKE '% DEMO%';
UPDATE job_selections SET terms_text = REPLACE(terms_text, ' DEMO', '') WHERE terms_text LIKE '% DEMO%';
UPDATE invitations SET terms_text = REPLACE(terms_text, ' DEMO', '') WHERE terms_text LIKE '% DEMO%';
UPDATE order_items SET title_snapshot = REPLACE(title_snapshot, ' DEMO', '') WHERE title_snapshot LIKE '% DEMO%';
UPDATE order_items SET terms_text_snapshot = REPLACE(terms_text_snapshot, ' DEMO', '') WHERE terms_text_snapshot LIKE '% DEMO%';
UPDATE contracts SET agreed_terms_text = REPLACE(agreed_terms_text, ' DEMO', '') WHERE agreed_terms_text LIKE '% DEMO%';
UPDATE reviews SET comment = REPLACE(comment, ' DEMO', '') WHERE comment LIKE '% DEMO%';

-- Hồ sơ gia sư, báo cáo, sổ tiền, thông báo, tệp.
UPDATE tutor_profiles SET review_note = REPLACE(review_note, 'DEMO: ', '') WHERE review_note LIKE 'DEMO: %';
UPDATE reports SET description = 'Báo cáo nội dung cần quản trị viên xem xét.' WHERE description LIKE 'Báo cáo DEMO%';
UPDATE reports SET resolution = 'Quản trị viên đã kiểm tra nội dung minh chứng và đưa ra kết luận.' WHERE resolution LIKE 'Kết luận DEMO%';
UPDATE money_journals SET memo = 'Số dư mở đầu của ví.' WHERE memo LIKE 'DEMO: số dư mở đầu%';
UPDATE notifications SET title = REPLACE(title, ' DEMO', '') WHERE title LIKE '% DEMO%';
UPDATE notifications SET body = 'Đơn và nguồn đăng ký đã được lưu.' WHERE body = 'Đơn và nguồn đăng ký đã được lưu trong dữ liệu thử.';
UPDATE private_files SET original_name = REPLACE(original_name, '-DEMO', '') WHERE original_name LIKE '%-DEMO%';

-- Câu chữ kỹ thuật trong điều khoản mẫu.
UPDATE offerings SET terms_text = REPLACE(terms_text, 'giá được snapshot khi đặt', 'giá được chốt khi đặt') WHERE terms_text LIKE '%snapshot%';
UPDATE order_items SET terms_text_snapshot = REPLACE(terms_text_snapshot, 'giá được snapshot khi đặt', 'giá được chốt khi đặt') WHERE terms_text_snapshot LIKE '%snapshot%';
UPDATE contracts SET agreed_terms_text = REPLACE(agreed_terms_text, 'giá được snapshot khi đặt', 'giá được chốt khi đặt') WHERE agreed_terms_text LIKE '%snapshot%';

COMMIT;
