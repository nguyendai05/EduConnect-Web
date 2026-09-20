# Nền tảng cơ sở dữ liệu

MySQL 8 và Flyway là các công cụ dự kiến dùng cho cơ sở dữ liệu. Sau khi thống nhất mô hình nghiệp vụ, các tệp migration có phiên bản để quản lý thay đổi cơ sở dữ liệu sẽ được đặt trong `src/main/resources/db/migration/`.

Trong giai đoạn tạo bộ khung dự án, chưa định nghĩa lược đồ cơ sở dữ liệu (schema), bảng, entity, thông tin xác thực kết nối hay dữ liệu khởi tạo (seed data).
