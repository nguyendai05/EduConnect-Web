# Migration Flyway Educonnect

- `V1__educonnect_schema.sql`: schema dự thảo MySQL 8.0.16+, nguồn DDL duy nhất.
- `V2__reference_data.sql`: dữ liệu tham chiếu, không chứa account/transaction DEMO.
- `V3__require_group_capacity_and_dates.sql`: siết CHECK nullable của GROUP_CLASS; giữ nguyên V1/V2 đã áp.

V1/V2/V3 được tạo theo yêu cầu SQL dự thảo để review; policy chưa chốt nằm trong [DECISIONS.md](../../../../../docs/database/DECISIONS.md). Khi nhóm tiếp nhận và áp migration, không sửa file đã áp dụng; Đại cấp version tiếp theo trước khi thành viên tạo migration mới.

Seed DEMO nằm ngoài locations tại `database/02_seed_dev.sql`; không đưa vào migration production. Đọc [hướng dẫn Workbench/Navicat](../../../../../database/README.md) để chọn đường Flyway hoặc SQL thủ công/baseline đã đối chiếu. Hai client dùng cùng migration, không chạy DDL hai lần trên cùng database. Không tự sửa flyway_schema_history, không bật baselineOnMigrate, không chạy clean.
Migration mới do Nguyễn Xuân Đại giữ, đặt tên `V<yyyyMMddHHmm>__mo_ta.sql`; không sửa V1–V3.
