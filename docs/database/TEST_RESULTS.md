# Kết quả kiểm tra database Educonnect

Kiểm ngày **11/10/2026**, trên instance MySQL riêng dùng thư mục dữ liệu mới dưới target/ và chỉ bind loopback. Không truy cập database có sẵn, không cài lại MySQL hoặc thay cấu hình hệ thống. Không gửi email/PayOS/giao dịch thật. Các path máy/credential/nhánh cá nhân không đưa vào báo cáo.

## 1. Môi trường thực tế

| Hạng mục | Đã đo/resolve |
| --- | --- |
| Server | MySQL Community Server **8.0.45**; SELECT VERSION(), không suy từ Workbench |
| Server charset/collation | utf8mb4 / utf8mb4_0900_ai_ci |
| SQL mode | ONLY_FULL_GROUP_BY, STRICT_TRANS_TABLES, NO_ZERO_IN_DATE, NO_ZERO_DATE, ERROR_FOR_DIVISION_BY_ZERO, NO_ENGINE_SUBSTITUTION |
| Timezone | Server ban đầu SYSTEM; mọi session SQL/JDBC kiểm dùng +00:00 |
| Java/Maven | JDK 21.0.10; Maven 3.9.11; project target Java 17 |
| Framework/library project | Boot 3.5.16, Hibernate 6.6.53.Final, Connector/J 9.7.0, Flyway 11.7.2+flyway-mysql, Security crypto6.5.11 |
| Schema | 51 bảng / 4 view; Flyway schema thêm history do Flyway tự quản |

Việc khởi tạo instance thử ban đầu gặp tmpdir sandbox không tồn tại; đã dùng tmpdir mới trong workspace. Kết nối/bind loopback trong sandbox ban đầu bị chặn; chạy kiểm với quyền cho instance cô lập đã thành công. Không chuyển sang database thật. Đây là hạn chế môi trường, không phải SQL incompatibility.

## 2. Kết quả thực sự đã chạy

| Kiểm | Kết quả |
| --- | --- |
| V1 qua SQL/JDBC vào DB trống | **PASS**, 57 statements; 51 tables/4 views, CHECK/FK/index được server nhận |
| V2 danh mục qua SQL/JDBC | **PASS**, 8 statements; không DEMO accounts/transactions |
| File00_create_database.sql | **PASS**, 6 statements, version/config được đọc; tạo educonnect_dev trống trên instance thử |
| Seed lần đầu đường manual | **SEEDED**, toàn bộ DML transaction thành công |
| Seed lần 2 | **UNCHANGED_NOOP**, không thêm/ghi đè fixture |
| Seed trên đường Flyway | **SEEDED**, cùng canonical SQL/dataset |
| Password hash | **17/17 match** qua DelegatingPasswordEncoder library project, hash {bcrypt} thật |
| Verify SQL | **PASS**, 51 statements, 32 truy vấn EXPECT_ZERO trả 0 dòng; quét 108 FK; tiền/capacity/source/state/profile/evidence và tổng cố định đúng; vietnamese_roundtrip_ok=1 |
| Workbench path vs Flyway path | Metadata tables/columns/types/defaults/generated columns/collation/PK/FK rules/UNIQUE/enforced CHECK/index/views và dữ liệu V2 **identical** |
| Flyway migrate/validate | **PASS** V1 → V2 → V3, không baseline auto; V3 siết GROUP_CLASS capacity/end date non-null |
| Manual baseline sau đối chiếu | **PASS** baseline V2 chain ban đầu rồi migrate V3; full SQL/baseline V3 được kiểm riêng; không viết tay history |
| UNIQUE/FK/CHECK probes | **13 PASS** với errno1062/1452/3819 đúng mục tiêu |
| Optimistic CAS | **PASS** update version hiện tại1 row; stale version0 row; rollback |
| Hai transaction lock escrow | **PASS** connection2 chờ và timeout1205 khi connection1 giữ SELECT FOR UPDATE; cả hai rollback |
| Review/capacity service boundary | **PASS**: DB cho insert sai điều kiện liên bảng; probe phát hiện, rollback. Không tuyên bố FK/CHECK tự giải quyết |
| Fixture bị sửa | **PASS** seed exit nonzero, báo user_accounts đã thay đổi; giá trị TEST_FIXTURE_CHANGED giữ nguyên, không overwrite; schema riêng test_tamper |
| Bản ghi ngoài fixture | **PASS** thêm account TEST-EXTRA-USER trong schema Flyway; rerun NOOP, extra row giữ nguyên; 17 fixture hashes vẫn match (total accounts lúc này18) |
| Maven offline package | **BUILD SUCCESS**, không đổi POM, profile/migrations được copy; chưa có JPA entity/test nghiệp vụ |
| Static/syntax/Git | **PASS** database-static-check, node --check, bảng/link Markdown và git diff --check; chỉ thay đổi file trong phạm vi database |

Các probe sai tách tại database/04_constraint_checks.sql, không trộn 02_seed_dev.sql. Fixture tamper giữ trong schema thử riêng, không làm hỏng hai bộ seed hợp lệ. Không DROP/TRUNCATE database/table hiện có, không tắt FOREIGN_KEY_CHECKS, không INSERT IGNORE. Routine helper/temp riêng được cleanup; target artifacts không là dữ liệu nhóm.

Trong quá trình soạn đã sửa test chọn sai ứng viên để không bị UNIQUE chặn trước FK và sửa câu HAVING của query refund. Bộ final được chạy lại; không lấy các lần lỗi giữa chừng làm PASS. Manifest seed được tính bằng file thay vì command quá dài trên Windows; static checker kiểm lại embedded digest khớp.

## 3. Đối chiếu tiền

| Chỉ số | VND |
| --- | --- |
| Opening wallet DEMO | 40000000 |
| Đã thu/xác minh mô phỏng | 24550550 |
| Wallet funding | 11860270 |
| Provider funding | 12690280 |
| Gross released | 9920260 |
| Platform fee released | 992031 |
| Tutor net released | 8928229 |
| Refund succeeded | 2330040 |
| Escrow held | 12300250 |

**24550550 = 9920260 + 2330040 + 12300250**.
**9920260 = 992031 + 8928229**.
50 journals /111 entries cân debit-credit, balance ví/escrow không âm. Clearing đối ứng âm là được phép, không là ví chi tiêu.

| Tutor | Gross | Fee | Net = balance DEMO khi chưa chi ví |
| --- | --- | --- | --- |
| 201 | 1700050 | 170006 | 1530044 |
| 202 | 4620110 | 462013 | 4158097 |
| 203 | 2800075 | 280009 | 2520066 |
| 204 | 800025 | 80003 | 720022 |
| 205/206 | 0 | 0 | 0 |

| ThángUTC | Gross | Platform fee | Tutor net |
| --- | --- | --- | --- |
| 2026-05 | 650025 | 65003 | 585022 |
| 2026-06 | 700025 | 70003 | 630022 |
| 2026-07 | 750025 | 75003 | 675022 |
| 2026-08 | 0 | 0 | 0 |
| 2026-09 | 1850050 | 185006 | 1665044 |
| 2026-10 | 5970135 | 597016 | 5373119 |

Pie: COMPLETED 9/24=37.50%; AWAITING_PAYMENT,PAID,IN_PROGRESS,CANCELLATION_PENDING,CANCELLED mỗi trạng thái 3/24=12.50%. Theo nguồn item: INVITATION 8,JOB_APPLICATION 8,CATALOG 10 (8 catalog orders,2 orders thêm item).
Class OF13:2 confirmed seats/capacity 2, không vượt. Review3 chỉ contract6001/6009/6017 completed, có funded và đúng buyer. tháng 08 không release.

## 4. Giới hạn còn phải kiểm khi backend có

- **Chưa thao tác GUI Workbench hoặc Navicat/EER**. Cùng SQL MySQL 8.0 đã chạy thực qua JDBC/Flyway; file có DELIMITER, không SOURCE/mysqlCLI placeholder. Hướng dẫn client được đối chiếu tài liệu chính thức; chưa khẳng định phiên bản GUI của từng thành viên đã chạy thành công. Nhóm kiểm full-file execution/UTF-8/result sets theo README khi tiếp nhận.
- **Chưa có JPA entity/repository để Hibernate validate mapping**. Package pass và driver/Flyway pass không thay integration test entity; future mappings phải Long/BigDecimal/Instant/snake_case/enumSTRING đúng dictionary.
- **Chưa boot web application hoặc auth/CSRF/ownership HTTP**; PasswordEncoder match không chứng minh UI login. Prototype chưa nối database.
- **Chưa kiểm provider signature/webhook thực, email sandbox hay thanh toán/refund thật**. Các verified/ref/digest trong seed chỉ mô phỏng.
- **Chưa có service business concurrency**. Lock infrastructure/CAS/probes đã kiểm, nhưng last-seat/create-order/release-refund race end-to-end cần transaction service với locks/idempotency sau này.
- **Chưa có data production/retention/backups/grants**; không dùng seed/cùng credential DEMO ngoài development.
- **Q01–Q10 còn chờ nhóm**; fee/refund/manual partial release/latest publication là đề xuất/DEMO, không phê duyệt chính thức.
- MySQL 8.0.45 warning BINARY expr deprecated ở CHECK email_normalized không làm migration fail; nếu hỗ trợ phiên bản khác, đổi bằng migration mới sau nhóm tiếp nhận, không sửa file đã áp.

## 5. Lệnh tái lập và kiểm Git

Maven package → configure EC_DB_* development → database/tools/run.ps1 migrate/validate → seed hai lần → verify/passwords → constraints/lock-check chỉ schema test. compare-schema + reference data rồi baseline-reviewed chỉ đường manual đã review. database-static-check.mjs kiểm một nguồnDDL/version/guard/transaction/checksum/docs/config mà không kết nối DB.

Git diff được rà soát: chỉ database SQL/tool, docs database, profile DB dev và README migration/database được cập nhật; năm báo cáo audit JSP có sẵn giữ nguyên. Không sửa Java ứng dụng/POM/HTML/JSP/CSS/JS UI, không reset/checkout/commit/push. Instance thử dừng sau hoàn tất; artifacts thử còn dưới target/ bị ignore, không xóa hay di chuyển dữ liệu hệ thống.


V3 giữ nguyên checksum V1/V2 đã áp. Hai probe group_capacity_required/group_ends_on_required trả errno3819. DDL không rely CHECK UNKNOWN để kiểm trường nullable bắt buộc.

## 6. Cập nhật hướng dẫn client ngày 12/10/2026

Nhóm dùng **cả MySQL Workbench và Navicat**. README giữ hai đường Flyway/SQL thủ công, bổ sung Execute SQL File, Query Editor, UTF-8, Continue on error, DELIMITER và reverse engineering theo edition Navicat. Hai client dùng cùng SQL/schema; không thêm migration hay sửa seed/config/tool. Lượt này chỉ kiểm tài liệu, link/bảng Markdown và database-static-check; không khởi động MySQL, không chạy lại DB tests hoặc GUI. Kết quả database ngày 11/10 ở trên giữ nguyên giới hạn xác minh.

## 7. DBConnect để tự kiểm local ngày 12/10/2026

Theo yêu cầu tiếp theo, thêm src/main/java/com/educonnect/config/DBConnect.java và hướng dẫn database/CONNECT_LOCAL.md. Đọc EDUCONNECT_DB_* hoặc .env.local bị Git ignore; getConnection tạo connection mới, main chỉ SELECT 1/version/database/timezone. Không migrate/seed hay thay DataSource Spring/JPA.

Đã kiểm service MySQL80 Running và TCP 127.0.0.1:3306 reachable. Lần kiểm credential bằng DatabaseTool connection bị từ chối 1045; người dùng chọn tự kết nối/test bằng DBConnect, nên không tiếp tục thử đăng nhập sau đó. Không xác nhận JDBC auth thành công, không reset account/database.

Maven package final **PASS**, compile release 17; DBConnectTest **4 tests / 0 failure / 0 error** cho password literal, env precedence, thiếu credential, URL credential và che vendor error. Provider JUnit/Surefire thiếu trong cache offline đã được resolve qua Maven Central, không đổi POM. --config-only **PASS**, chỉ là kiểm cấu hình. WAR Start-Class vẫn com.educonnect.EduConnectApplication. PowerShell syntax, database-static-check và git diff --check **PASS**; credential local không được in hoặc commit.
