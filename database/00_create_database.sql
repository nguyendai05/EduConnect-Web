-- Workbench: đọc VERSION trước; Workbench là client, không quyết định phiên bản server.
SELECT VERSION() AS server_version, @@sql_mode AS sql_mode,
       @@character_set_server AS character_set_server, @@collation_server AS collation_server,
       @@time_zone AS session_time_zone, @@system_time_zone AS system_time_zone;

-- Chỉ tên development đã chỉ định; không DROP/TRUNCATE, không tự tạo user hay credential.
CREATE DATABASE IF NOT EXISTS educonnect_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE educonnect_dev;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';
-- Phải rỗng trước đường Workbench V1/V2; nếu có dữ liệu, dừng và đọc README.
SELECT table_name, table_type FROM information_schema.tables WHERE table_schema=DATABASE();
