# Database Educonnect

Bộ SQL dự thảo MySQL 8.0 để nhóm review đã có migration V1/V2/V3, seed development và kiểm tra. Policy production còn các Q01–Q10 cần chốt; đăng nhập/đăng ký và phiên đã nối DB, các nghiệp vụ khác tiếp tục phát triển. Xem [luồng xác thực](../architecture/authentication.md).

- [Hướng dẫn MySQL Workbench, Navicat, Flyway và tài khoản DEMO](../../database/README.md)
- [Schema, ERD và data dictionary](SCHEMA.md)
- [Evidence và quyết định chưa chốt](DECISIONS.md)
- [Ma trận 23 chức năng](FEATURE_MAPPING.md)
- [Kết quả kiểm tra thực tế](TEST_RESULTS.md)

DDL canonical ở `src/main/resources/db/migration/`; seed DEMO ở `database/02_seed_dev.sql`, ngoài Flyway để không tự nạp production. Đại điều phối version, Huy review tiền/giao dịch, Đạt dùng seed cho UI. Không sửa migration đã áp dụng hoặc để Hibernate create/update song song.

Nhóm dùng cả Workbench và Navicat: cùng server/schema và cùng bộ SQL. Chỉ một người áp migration/seed mỗi lần; đổi client không phải khởi tạo lại database. Giới hạn GUI đã kiểm được ghi riêng trong TEST_RESULTS.md.
