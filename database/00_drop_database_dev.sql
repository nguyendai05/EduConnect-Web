-- RESET THỦ CÔNG DATABASE DEVELOPMENT EDUCONNECT.
-- DROP xóa toàn bộ bảng/view/routine/dữ liệu trong educonnect_dev và không rollback được.
-- Chỉ chạy trên MySQL local development đã kiểm tra; dừng ứng dụng trước khi reset.
-- Tên database được ghi cố định để không phụ thuộc schema mặc định của Workbench/Navicat.
-- File không thuộc Flyway locations và không được chạy tự động cùng migration/seed.

SELECT VERSION() AS server_version, @@port AS server_port, DATABASE() AS current_schema;
SELECT table_name,table_type
FROM information_schema.tables
WHERE table_schema='educonnect_dev'
ORDER BY table_name;

DROP DATABASE IF EXISTS `educonnect_dev`;

-- Sau đó mở/chạy database/00_create_database.sql để tạo lại và chọn educonnect_dev.
-- Không chạy V1/V2/V3 trước khi SELECT DATABASE() trả về educonnect_dev.

