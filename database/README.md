# Database development Educonnect

Bộ SQL dự thảo đã thực thi trên **MySQL Server 8.0.45** cô lập. Chưa áp vào database nhóm/production. Có **51 bảng, 4 view, 17 tài khoản, 18 dịch vụ/lớp, 24 đơn/26 item/26 contract**. Xem SCHEMA/DECISIONS/FEATURE_MAPPING và TEST_RESULTS để phân biệt quy tắc đã có bằng chứng với đề xuất.

## 1. File và nguồn chuẩn

### Quy trình schema tổng chạy thủ công cho thành viên (Navicat / Workbench)

Để các thành viên chạy tay trên Navicat không bị lỗi thứ tự bảng, khóa ngoại (FK) hoặc lỗi DELIMITER, dự án đã chuẩn bị sẵn bộ SQL tối ưu cho Navicat:

#### Cách 1: Chạy 1 file duy nhất (Nhanh nhất cho Navicat)
1. Mở file `database/full_database_setup.sql` trong Navicat Query Editor (hoặc chuột phải connection -> **Execute SQL File**).
2. Nhấn **Run / Start**. File sẽ tự động:
   - Tạo database `educonnect_dev` (nếu chưa có).
   - **Chạy tạo toàn bộ 51 bảng & 4 view trước** (kèm ràng buộc hoàn chỉnh).
   - **Insert toàn bộ dữ liệu mẫu vào sau** (gồm cả danh mục hệ thống và 17 tài khoản demo).
   - Tự động nạp bảng lịch sử Flyway để Spring Boot khởi động không bị xung đột.

#### Cách 2: Chạy tách 2 bước (Bảng trước - Dữ liệu sau)
1. **Bước 1 (Chạy các bảng trước):** Mở và chạy file `database/01_create_tables.sql`.
2. **Bước 2 (Insert dữ liệu mẫu sau):** Mở và chạy file `database/02_insert_sample_data.sql`.
3. **Bước 3 (Kiểm tra):** Chạy `database/03_verify.sql` để xác minh dữ liệu.

| File | Mục đích |
| --- | --- |
| database/01_create_tables.sql | Tạo database, toàn bộ 51 bảng và 4 view (DDL); chạy trước cho Navicat |
| database/02_insert_sample_data.sql | Insert toàn bộ dữ liệu danh mục và dữ liệu mẫu demo (DML); chạy sau cho Navicat |
| database/full_database_setup.sql | File gộp trọn gói cho Navicat: Tạo tất cả các bảng trước, insert dữ liệu mẫu vào sau |
| database/00_create_database.sql | Kiểm phiên bản/cấu hình, tạo/chọn educonnect_dev; không tạo credential |
| database/00_drop_database_dev.sql | Reset development theo yêu cầu, xóa toàn bộ educonnect_dev; không thuộc bootstrap/Flyway, chỉ chạy chủ động |
| src/main/resources/db/migration/V1__educonnect_schema.sql | DDL canonical duy nhất, MySQL/InnoDB/utf8mb4 |
| src/main/resources/db/migration/V2__reference_data.sql | Vai trò, môn/cấp/khu vực/hình thức, transitions; dùng cho mọi môi trường |
| src/main/resources/db/migration/V3__require_group_capacity_and_dates.sql | Siết CHECK nullable của lớp nhóm, không sửa V1 đã áp |
| database/02_seed_dev.sql | Chỉ dữ liệu DEMO development/test; không nằm Flyway locations |
| database/03_verify.sql | Chỉ đọc: invariants, 108 FK, tiền/capacity/UTF-8 và queries cho 23 chức năng |
| database/04_constraint_checks.sql | Dữ liệu cố ý sai được rollback, chỉ schema test |
| database/tools/DatabaseTool.java | JDBC/Flyway/PasswordEncoder check bằng dependency project; không controller/service |
| database/tools/run.ps1 | Wrapper Windows, classpath từ artifact Maven; không tự cài phần mềm |
| src/main/java/com/educonnect/config/DBConnect.java | Chạy main/getConnection để tự kiểm JDBC; env hoặc .env.local, không migrate/seed |
| database/tools/connect.ps1 | Nạp cấu hình local vào terminal, nhập password kín nếu còn placeholder; mặc định chỉ kiểm kết nối |
| database/CONNECT_LOCAL.md | Hướng dẫn tự chạy DBConnect trong IDE/terminal và thông số Workbench/Navicat |
| src/main/resources/application-db-dev.yml | Connection qua env; Hibernate validate; Flyway; không auto seed |
| docs/database/SCHEMA.md | ERD/cardinality/data dictionary 397 cột/service boundary |
| docs/database/DECISIONS.md | Evidence/Q01–Q10 chưa chốt/DEMO policy |
| docs/database/FEATURE_MAPPING.md | Đủ 13 BB và 10 TC |
| docs/database/TEST_RESULTS.md | Kết quả thực tế và giới hạn |

Không tạo database/01_schema.sql vì project đã khai báo Flyway. **MySQL Workbench và Navicat dùng chung các file V1/V2/V3 và seed**, không tạo bộ SQL riêng cho từng công cụ. Không sửa migration đã áp dụng; database dùng chung sau tiếp nhận phải thêm version mới.

## 2. Yêu cầu và môi trường

- **Server MySQL 8.0 ≥8.0.16**, InnoDB; kiểm CHECK thực thi. Không MariaDB/PostgreSQL. MySQL Workbench và Navicat đều là client, không quyết định phiên bản server; kiểm bằng SELECT VERSION().
- UTF-8/utf8mb4 và utf8mb4_0900_ai_ci. Không cấu hình NO_BACKSLASH_ESCAPES tùy tiện; files dùng nháy đơn SQL chuẩn và double quote escaping không dựa backslash.
- Quyền dev để CREATE schema/tables/view/routine và DML. Seed helper SQL SECURITY INVOKER dùng quyền người đang kết nối; routine được xóa sau thành công. Không dùng tài khoản production để thử.
- Java 17+ và Maven nếu dùng đường Flyway/JDBC project. Boot 3.5.16 resolve Hibernate 6.6.53.Final, Flyway 11.7.2 + flyway-mysql, Connector/J 9.7.0, Security crypto6.5.11; không đổi POM.
- Môi trường DEMO không có email/provider handler; SQL không gửi email/PayOS/QR/giao dịch thật. Không có bảng chat/payout/BS chưa duyệt.

## 3. Dùng MySQL Workbench và Navicat: chọn một đường khởi tạo

Nếu gặp lỗi1050 khi chạy V1, kiểm `SELECT DATABASE()` trước; không xóa bảng cũ hoặc thêm IF NOT EXISTS để bỏ qua. [Kiểm tra trường hợp chạy nhầm vào webshop_db ngày12/10](../docs/database/inspection/20261012-215718.md) ghi nhận educonnect_dev trống và 24 bảng V1 nằm ở webshop_db. File `database/00_drop_database_dev.sql` chỉ reset educonnect_dev, **không dọn schema khác**; sau reset mới chạy lại file00_create_database.sql. Luôn kiểm đúng schema/rỗng trước full V1; không chạy file DROP tự động cùng các file khác.

Thành viên có thể dùng Workbench, Navicat hoặc cả hai để kết nối cùng MySQL Server. Chọn đúng host/port/database; đổi client không tạo database mới. **Mỗi database chỉ khởi tạo schema một lần**: không chạy lại V1/V2/V3 bằng Navicat nếu Workbench hoặc Flyway đã áp chúng, và ngược lại. Hai đường dưới đây phân biệt cách quản lý schema, không phân chia theo công cụ.

| Thao tác | MySQL Workbench | Navicat |
| --- | --- | --- |
| Kết nối | Connection MySQL development | Connection loại MySQL development, cùng host/port/database |
| Chạy DDL/seed đầy đủ | Mở SQL file, Execute All | Chuột phải connection/database → Execute SQL File; chọn UTF-8, Start |
| Đọc kết quả verify | SQL Editor, xem các result grids | Query Editor, Run toàn bộ hoặc Run Selected từng truy vấn kiểm tra |
| Chọn schema | Đặt default schema hoặc USE trong tab hiện tại | Chọn database khi mở Query hoặc Execute SQL File; không dựa vào USE ở phiên trước |
| Mô hình quan hệ | Database → Reverse Engineer | Reverse engineering/Model nếu edition hỗ trợ; xem mục 8 |

Chạy file SQL trực tiếp là tính năng [Execute SQL File của Navicat](https://help.navicat.com/hc/en-us/articles/218303897-How-to-import-SQL-files-script-files-or-command-files-into-the-server). Phần thao tác Navicat chi tiết ở dưới; SQL và quy trình Flyway giữ nguyên.

### Đường A — Flyway quản từ database trống (khuyến nghị nhóm)

1. Kết nối server development bằng Workbench hoặc Navicat. Mở database/00_create_database.sql; chạy SELECT VERSION()/SQL mode/charset/collation/timezone. Yêu cầu 8.0.16+, bảng InnoDB và strict SQL mode.
2. Chạy CREATE DATABASE/USE trong file 00. Đọc danh sách tables cuối file: database phải trống. Nếu không trống, **dừng**, không DROP/TRUNCATE/clean hoặc chạy lại V1.
3. **Không chạy V1/V2/V3 thủ công bằng Workbench hoặc Navicat** trên cùng DB. Cấu hình env development rồi chạy Flyway migrate bằng application-db-dev profile hoặc helper bên dưới. Sau migrate, Flyway validate phải pass, history có V1/V2/V3.
4. Trở lại client, chọn đúng database educonnect_dev. Chạy toàn bộ database/02_seed_dev.sql theo thao tác của client trong bảng trên; không chạy selection/các INSERT riêng và giữ nguyên DELIMITER.
5. Mở database/03_verify.sql trong SQL Editor/Query Editor; mọi truy vấn EXPECT_ZERO trả 0 dòng. Đối chiếu các tổng tiền và kịch bản dưới đây.
6. Chạy seed lần hai: UNCHANGED_NOOP; không nhân đôi. Tắt ứng dụng/writers trong khi seed.

### Đường B — Workbench hoặc Navicat chạy SQL trước, chưa chạy ứng dụng Flyway

1. Làm bước kiểm kết nối/version và file 00 như đường A; DB trống.
2. Chạy toàn bộ **src/main/resources/db/migration/V1__educonnect_schema.sql** một lần, đúng database đích.
3. Chạy toàn bộ **src/main/resources/db/migration/V2__reference_data.sql** một lần. V2 là INSERT thường, không idempotent ngoài Flyway; nếu đã áp, không chạy lại.
4. Áp `src/main/resources/db/migration/V3__require_group_capacity_and_dates.sql`, rồi nạp database/02_seed_dev.sql và chạy database/03_verify.sql.
5. **Chưa khởi động application Flyway vào DB này**. Flyway phải từ chối nonempty DB chưa history. Không tự tạo/sửa flyway_schema_history; không bật baselineOnMigrate.
6. Tạo DB thử trống khác (tên educonnect_test_review do nhóm chọn), chạy Flyway V1/V2/V3 ở đó. Đối chiếu tables/columns/types/defaults/generated columns/collation/PK/FK/UNIQUE/CHECK/index/views và dữ liệu tham chiếu V2 với database đã khởi tạo thủ công.
7. Chỉ khi đã khớp, baseline **version 3** (V1/V2/V3 đã áp bằng Workbench hoặc Navicat), rồi validate/migrate. Helper baseline-reviewed có cờ xác nhận explicit bên dưới. Baseline chỉ ghi nhận mốc, không tự xác minh cấu trúc/checksum V1/V2/V3 đã làm tay.
8. Các migration tiếp theo là V4+ do Đại cấp. Không baseline lại DB đã có history. Nếu chỉ áp V1 thì baseline1 rồi Flyway áp V2/V3; nếu chỉ áp V1/V2 thì baseline2 rồi Flyway áp V3, sau đối chiếu đúng mốc. Helper bản này dành full V1/V2/V3 và baseline3; không dùng hướng dẫn baseline3 nếu thiếu V2/V3.

Hai đường dùng cùng file DDL; chọn một đường cho cùng DB. Cả hai đường và baseline V3 sau compare đã được kiểm trên schema thử trong công việc này. **Không gọi Flyway clean**. DDL MySQL implicit commit, lỗi giữa V1 không rollback toàn file; database test mới hoặc recovery có review, không tự che lỗi bằng IF NOT EXISTS mọi table.

### Thao tác Navicat cho hai đường trên

1. Tạo/mở connection **MySQL** development với host, port và tài khoản của server đang dùng. Trong Query Editor, đọc SELECT VERSION(), SQL mode, charset/collation và timezone từ file 00 trước khi khởi tạo.
2. Lần đầu chưa có database: chuột phải connection → **Execute SQL File**, chọn `database/00_create_database.sql`. Sau đó refresh danh sách database và mở `educonnect_dev`. Trước file tiếp theo, kiểm `SELECT DATABASE();` trong Query và chọn đúng database ở hộp Execute SQL File; `USE` trong một tab/connection không đặt schema cho mọi phiên khác.
3. Ở hộp Execute SQL File, chọn **UTF-8**, tắt **Continue on error** để dừng tại lỗi đầu tiên. Giữ autocommit thông thường; không dùng tùy chọn **No Auto Commit / SET AUTOCOMMIT=0** để bọc ngoài seed, vì file đã có transaction/handler riêng. Tên tùy chọn có thể khác theo phiên bản. [Các tùy chọn thực thi trong manual Navicat](https://www.navicat.com/manual/pdf_manual/en/navicat/win_manual/navicat_en.pdf).
4. Nếu chọn đường A, chỉ chạy seed sau Flyway migrate. Nếu chọn đường B, lần lượt chạy V1, V2, V3 rồi seed; chờ mỗi file thành công trước file kế tiếp. Sau lỗi, dừng và đọc log, không tiếp tục như thể file đã áp xong.
5. `database/02_seed_dev.sql` và `database/04_constraint_checks.sql` chứa **DELIMITER** và stored procedure: dùng full-file execution, không Run Selected một phần BEGIN/END. Nếu phiên bản Navicat đang dùng tách sai routine hoặc gửi DELIMITER lên server, giữ nguyên file canonical, ghi phiên bản/log và dùng Workbench Execute All hoặc helper `run.ps1`; không xóa DELIMITER hoặc sửa seed để né parser.
6. Nạp `database/03_verify.sql` vào **Query Editor** và chọn đúng database. Chạy toàn bộ bằng **Run**, xem các result sets; có thể Run Selected từng SELECT cùng phần SET biến liên quan để đọc rõ. Navicat hỗ trợ [nhiều statement và result set](https://help.navicat.com/hc/en-us/articles/218284527-Can-I-execute-multiple-query-statements-in-a-single-run). Mỗi EXPECT_ZERO phải 0 dòng, `vietnamese_roundtrip_ok=1`; so các tổng VND ở mục 5. Log Execute SQL File không thay việc đọc các kết quả này.
7. Chạy lại seed khi fixture còn nguyên: kết quả mong đợi **UNCHANGED_NOOP**. Nếu hộp chạy file không hiển thị SELECT cuối procedure, kiểm `dev_seed_runs`, số dòng và tổng tiền trước/sau trong Query Editor. Khi seed báo fixture bị sửa, không bật Continue on error để đi tiếp.
8. `database/04_constraint_checks.sql` chỉ dùng database tên `educonnect_test...`; các DML thử sai rollback. Không dùng Table Designer hoặc Data Synchronization để đổi schema dùng chung ngoài migration; yêu cầu thay đổi gửi Đại cấp version.

Navicat và Workbench có thể cùng mở để xem dữ liệu, nhưng nhóm chỉ giao **một người áp migration/seed tại một thời điểm**. DatabaseTool là tiện ích kiểm JDBC/Flyway/PasswordEncoder, không bắt buộc chỉ vì thành viên dùng một client khác.

### Helper với library của project

Chạy Maven `mvn -B -ntp package` từ root. Nếu Maven không trong PATH, dùng Maven đã cài và cấu hình PATH/biến đường executable trên máy mình; tài liệu không ghi đường máy cá nhân.

```powershell
# Thay bằng connection DEVELOPMENT trên máy của bạn; URL không chứa user/password.
$env:EC_DB_URL = 'jdbc:mysql://127.0.0.1:3306/educonnect_dev?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
$env:EC_DB_USER = '<development-user>'
$env:EC_DB_PASSWORD = '<development-secret>'
./database/tools/run.ps1 migrate
./database/tools/run.ps1 validate
./database/tools/run.ps1 seed
./database/tools/run.ps1 verify
./database/tools/run.ps1 passwords
```

Đây là ví dụ shell cấu hình kết nối, **không là SQL cần chạy trong Workbench/Navicat**. Không commit giá trị secret thật. Có thể cung cấp env từ secret store/shell session đã bảo vệ; không nhét credential trong JDBC URL.

Compare/baseline cho đường B:

```powershell
# EC_DB_URL trỏ DB khởi tạo thủ công đã review; EC_DB_COMPARE_URL trỏ DB thử Flyway V1/V2/V3.
$env:EC_DB_COMPARE_URL = 'jdbc:mysql://127.0.0.1:3306/educonnect_test_review?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
./database/tools/run.ps1 compare-schema
# Cờ này chỉ đặt SAU khi compare schema và reference data V2 cùng verify đều đúng.
$env:EC_DB_CONFIRM_BASELINE = 'V3-reviewed'
./database/tools/run.ps1 baseline-reviewed
Remove-Item Env:EC_DB_CONFIRM_BASELINE
./database/tools/run.ps1 validate
./database/tools/run.ps1 migrate
```

compare-schema đối chiếu columns/constraint/FK rules/enforced CHECK/index/views và dữ liệu tham chiếu V2 với DB thử Flyway V1/V2/V3, bỏ qua flyway_schema_history. baseline-reviewed tự chạy lại phép đối chiếu này; vẫn phải review đúng V1/V2/V3 canonical và chạy verify trước baseline.

## 4. Kết nối application development

Để tự kiểm kết nối local bằng Java, xem [DBConnect và hướng dẫn chạy trong IDE/terminal](CONNECT_LOCAL.md). File `.env.local` ở root giữ credential trên máy, đã được Git bỏ qua; `.env.example` là mẫu chia sẻ. DBConnect đọc file local hoặc EDUCONNECT_DB_* và chỉ kiểm JDBC, không migrate/seed. Script `database/tools/connect.ps1` có thể nạp cấu hình vào terminal và kiểm bằng DatabaseTool connection; chỉ dùng `-LoadOnly` nếu muốn nạp env mà chưa kết nối.

Không viết controller/service/entity trong công việc này. Khi nhóm cần boot với database:

```text
SPRING_PROFILES_ACTIVE=db-dev
EDUCONNECT_DB_URL=jdbc:mysql://127.0.0.1:3306/educonnect_dev?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true
EDUCONNECT_DB_USERNAME=<development-user>
EDUCONNECT_DB_PASSWORD=<development-secret>
```

application-db-dev.yml: Hibernate ddl-auto=validate, open-in-view=false; Flyway enabled/locations classpath:db/migration/validate-on-migrate, baseline-on-migrate=false, clean-disabled=true; SQL init=never. Không dùng ddl-auto=create/update song song Flyway. Seed nằm ngoài classpath migration và application không tự nạp. Production phải có profile/grants/secret riêng và giữ nguyên nguyên tắc này.

Auth/session/PayOS vẫn chưa có backend thật. Việc schema/seed/driver chạy được không chứng minh17 account có thể login trong UI hiện tại; UI hiện vẫn dùng fixture JS riêng. Backend sau này cần dùng DelegatingPasswordEncoder hoặc decoder chấp nhận {bcrypt}; không lấy plain text DEMO password vào SQL comparison.

## 5. Tài khoản và dữ liệu DEMO

**Mật khẩu công khai development: `EduconnectDemo!2026`**, cùng cho17 fixture; SQL lưu hash BCrypt thật ({bcrypt},cost 10) cố định để tái lập. PasswordEncoder library project đã kiểm17/17match. Không dùng credential này cho production hoặc tài khoản thật.

| Email | Vai trò/trạng thái |
| --- | --- |
| admin@example.test | 1 ADMIN, active/verified |
| tutor01@example.test đến tutor04@example.test | 4 gia sư approved, active/verified |
| tutor05@example.test | PENDING profile, không được publish |
| tutor06@example.test | REJECTED profile, không được publish |
| learner01@example.test đến learner08@example.test | Active/verified, SELF/PARENT xen kẽ |
| learner09@example.test | Chưa verify email; không có order, giỏ rỗng |
| learner10@example.test | LOCKED, không có order |

Tất cả tên/metadata liên hệ đều giả lập. Không có giấy tờ hay tài khoản ngân hàng thật. private_files chỉ metadata, không phải file tải về đã tồn tại. Token chỉ digest, không URL/token production. Provider refs bắt đầu DEMO; flag verified là mô phỏng có giải thích, không chữ ký provider thật.

**Mốc mô phỏng dataset: 2026-10-15 00:00:00 UTC**, khác đồng hồ chạy hiện tại. Queries verify dùng mốc này cho hold/TTL; khi dựng UI demo cần freeze clock/mô tả mốc, không lấy seed tương lai làm giao dịch thật. Dataset không dùng NOW()/RAND(). Tháng08/2026 không có release/revenue.

Chính sách DEMO:10% fee mỗi release, HALF_UP đến đồng; 100% phần chưa release refund, đã release không clawback; mã policy/rate snapshot từng item/event. Đây không là default sản phẩm. Order14 manual release40% rồi refund remainder provider; order22 mixed funding nhưng refund toàn bộ vào ví với consent giả lập. Nhóm phải chốt Q04/Q05 trước production.

### Các kịch bản cụ thể

| Order | Nguồn | Trạng thái | Buyer | Item/contract | Tổng VND | Ý nghĩa |
| --- | --- | --- | --- | --- | --- | --- |
| DEMO-ORDER-01 | INVITATION | COMPLETED | learner01 | 5001/6001 | 650025 | Completed, mixed wallet+provider, có review |
| DEMO-ORDER-02 | INVITATION | COMPLETED | learner02 | 5002/6002 | 700025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-03 | INVITATION | COMPLETED | learner03 | 5003/6003 | 750025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-04 | INVITATION | COMPLETED | learner04 | 5004/6004 | 800025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-05 | INVITATION | PAID | learner05 | 5005/6005 | 850025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-06 | INVITATION | IN_PROGRESS | learner06 | 5006/6006 | 900025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-07 | INVITATION | AWAITING_PAYMENT | learner07 | 5007/6007 | 950025 | Awaiting payment |
| DEMO-ORDER-08 | INVITATION | CANCELLED | learner08 | 5008/6008 | 1000025 | Hủy chưa thu tiền, không tạo refund giả0 |
| DEMO-ORDER-09 | JOB_APPLICATION | COMPLETED | learner01 | 5009/6009 | 1050025 | Completed từ ứng viên, có review |
| DEMO-ORDER-10 | JOB_APPLICATION | COMPLETED | learner02 | 5010/6010 | 1100025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-11 | JOB_APPLICATION | COMPLETED | learner03 | 5011/6011 | 1150025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-12 | JOB_APPLICATION | PAID | learner04 | 5012/6012 | 1200025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-13 | JOB_APPLICATION | IN_PROGRESS | learner05 | 5013/6013 | 1250025 | Kịch bản trạng thái/nguồn cơ bản |
| DEMO-ORDER-14 | JOB_APPLICATION | CANCELLED | learner06 | 5014/6014 | 1300025 | Partial manual release + refund provider succeeded |
| DEMO-ORDER-15 | JOB_APPLICATION | CANCELLATION_PENDING | learner07 | 5015/6015 | 1350025 | Refund PROCESSING, còn escrow |
| DEMO-ORDER-16 | JOB_APPLICATION | CANCELLATION_PENDING | learner08 | 5016/6016 | 1400025 | Refund FAILED, còn escrow |
| DEMO-ORDER-17 | CATALOG | COMPLETED | learner01 | 5017/6017 | 1450025 | Group completed, có review |
| DEMO-ORDER-18 | CATALOG | COMPLETED | learner02 | 5018/6018, 5019/6019 | 1750050 | Hai item/hai tutor, payment chung allocation riêng |
| DEMO-ORDER-19 | CATALOG | PAID | learner03 | 5020/6020 | 1400025 | Group OF13 confirmed, một chỗ |
| DEMO-ORDER-20 | CATALOG | IN_PROGRESS | learner04 | 5021/6021, 5022/6022 | 2350050 | Group OF13 chỗ thứ hai + service item |
| DEMO-ORDER-21 | CATALOG | AWAITING_PAYMENT | learner05 | 5023/6023 | 1500025 | Group reserved, payment pending |
| DEMO-ORDER-22 | CATALOG | CANCELLED | learner06 | 5024/6024 | 1550025 | Refund SUCCEEDED vào ví, group cancelled |
| DEMO-ORDER-23 | CATALOG | AWAITING_PAYMENT | learner07 | 5025/6025 | 800025 | Payment provider failed, không có tiền escrow |
| DEMO-ORDER-24 | CATALOG | CANCELLATION_PENDING | learner08 | 5026/6026 | 1600025 | Refund REQUESTED; cancellation pending |

### Số đối chiếu seed nguyên trạng

| Chỉ số | VND / số lượng |
| --- | --- |
| Opening wallet DEMO | 40000000 |
| Tiền đã thu/xác minh giả lập | 24550550 |
| Ví đã dùng | 11860270 |
| Provider đã dùng | 12690280 |
| Gross đã release | 9920260 |
| Phí platform đã release | 992031 |
| Tutor net đã release | 8928229 |
| Hoàn thành công | 2330040 |
| Còn giữ escrow | 12300250 |
| Journals / ledger entries | 50 / 111 |
| Releases / refunds / reviews | 11 / 5 / 3 |

24550550 = 9920260 + 2330040 + 12300250; 9920260 = 992031 + 8928229. Tổng tiền và balance từng ví/query monthly nằm trong03_verify/TEST_RESULTS. Journal cân debit/credit; opening balance có bút toán đối ứng, không thêm số dư cứng.

## 6. Seed chạy lại và xử lý fixture thay đổi

- Lần đầu cần toàn bộ bảng ứng dụng trống sau V1/V2/V3; danh mục tham chiếu phải khớp V2. Seed từ chối DB chứa data ứng dụng, không đè ID đã dùng.
- Chỉ DATABASE()=educonnect_dev hoặc educonnect_test[_suffix lowercase] được phép; không là seed production. DatabaseTool cũng guard schema name.
- Stable PK/keys và dev_seed_runs manifest_hash. Stored procedure dựng expected rows temp, so mọi field theo PK với NULL-safe equality, gồm password hash/JSON metadata/version/timestamps; không INSERT IGNORE/UPSERT.
- First run insert tất cảDML + marker trong một transaction; lỗi handler ROLLBACK/RESIGNAL/giải phóng mutex. DDL routine/temp không giả định rollback cùng DML.
- Rerun marker/fields khớp: **UNCHANGED_NOOP**, không sửa hay thêm fixture. Bản ghi mới ngoài fixture được giữ nguyên, không xóa.
- Fixture bị thay đổi/thất lạc hoặc seed manifest khác: **dừng**, không “khôi phục” từ seed. Nếu ứng dụng đã dùng wallet/cart/versions, đây là dấu hiệu DB không còn nguyên trạng để reseed.
- Giữ DB hiện tại để review/export; tạo DB development/test mới với migration rồi seed. Không DROP/TRUNCATE bảng có dữ liệu; không xóa marker để ép first run.
- GET_LOCK chỉ serialize các phiên seed; **dừng writers/ứng dụng** trước khi seed. Không coi nó là khóa mọi mutation.
- Sau lỗi, procedure có thể còn nếu client dừng tại CALL; lần chạy full script sau tự thay helper educonnect_seed_dev_v1. Chỉ helper/temp do script tạo, không reset bảng ứng dụng.
- Hash marker là digest của nội dung seed chuẩn hóa dòng SET v_hash; sửa seed fixture phải version hóa/dùng DB thử mới, không gán hash cũ để bypass.
- Chạy một phần INSERT bên trong procedure sẽ bỏ guard/transaction, không được hướng dẫn như cách seed.

## 7. Kiểm thử thêm và lỗi thường gặp

Chỉ schema tên educonnect_test... chạy 04_constraint_checks.sql. File tạo data cố ý sai trong transaction rồi ROLLBACK; không nằm02seed. Các testFK/UNIQUE/CHECK/CAS phải báo PASS; hai probe review/capacity báo DB_ALLOWS_SERVICE_MUST_REJECT để minh họa service boundary. Sau đó03_verify phải0 dòng lỗi. ./database/tools/run.ps1 lock-check kiểm lock escrow bằng hai connection, không ghi tiền.

| Lỗi | Nguyên nhân / xử lý |
| --- | --- |
| Table exists lúcV1 | DB không trống/đã áp một phần; dừng, không chạyclean. Review và chọn DB thử mới |
| Flyway nonempty DB/no history | Đã làm đườngB; compare/baseline đúng mốc trước boot. Không tự viết history hoặc bậtbaselineOnMigrate |
| Unknown database/credential | File00chưa chạy hoặc env sai; kiểm connection development, không hardcode secret |
| Flyway validate checksum | Migration đã sửa sau áp; phục hồi file canonical qua review hoặc migration mới, không repair mù |
| Seed field/hash changed | Fixture đã được người/app thay đổi; không overwrite, dùng DBdevelopment mới |
| CHECK không chặn trên 8.0cũ | Server<8.0.16; phiên bản Workbench/Navicat không thay phiên bản server; dùng Server 8.0.16+ |
| Navicat lỗi DELIMITER/DECLARE | Client/parser đang tách routine không đúng; chạy full file. Nếu vẫn lỗi, dùng Workbench/helper với file nguyên bản, ghi log/phiên bản; không sửa migration/seed hoặc bật Continue on error |
| Seed chọn sai database khi đổi client/tab | Kiểm SELECT DATABASE() ở phiên Query và database đích trong Execute SQL File; USE ở phiên trước không đặt default cho mọi connection |
| Tiếng Việt lỗi console | SQL/files=UTF8, JDBCSETNAMES; verify vietnamese_roundtrip_ok=1. Helper xuấtUTF8; terminal encoding khác không chứng minh DB lưu sai |
| DB access/port test bị sandbox chặn | Dùng connection được phép tới serverdev; không sửa hệ thống/MySQL thật để né. Test report chỉ nói phần thực sự đã chạy |
| Thuật ngữ BINARY expr deprecated | MySQL 8.0.45 có warning cho CHECK email_normalized; vẫn thực thi đúng trong8.0. Thay bằng CAST ở migration mới nếu nhóm tiếp nhận cần hỗ trợ version mới |
| Hash password không match | Dùng DelegatingPasswordEncoder/{bcrypt}; raw BCryptPasswordEncoder cần bỏ prefix theo contract. Không so password plaintext vớihash |

## 8. Reverse Engineer thành EER Diagram

**MySQL Workbench:** Database → Reverse Engineer → chọn connection development → chọn schema → chọn tables/views cần xem → Execute → Place objects on diagram. Lưu model .mwb tại vị trí nhóm chọn.

**Navicat:** dùng Model/Reverse Engineering từ database đã khởi tạo nếu edition đang dùng có tính năng này. Tên menu và định dạng model phụ thuộc phiên bản; không giả định mọi bản Navicat có Model. Manual Navicat 18 ghi Model thuộc Enterprise Edition và có thể [reverse engineer database/schema/SQL file](https://www.navicat.com/manual/online_manual/en/navicat_18/win_manual/model.html). Nếu edition không hỗ trợ, vẫn dùng Navicat chạy SQL/xem bảng, và dùng Workbench hoặc Mermaid trong SCHEMA.md để xem ERD.

Chia diagram account/catalog, source/order/contract, payment/ledger, moderation để dễ đọc. Reverse Engineering lấy FK thật, không tự biết mọi service invariant/authorization. Đối chiếu SCHEMA.md; không đồng bộ model ngược vào database dùng chung ngoài quy trình migration, không commit credential trong connection/model.

## 9. Phối hợp nhóm

- **Nguyễn Xuân Đại** cấp version migration duy nhất, review schema/constraints/config và tổng hợp Q01–Q10. V1/V2/V3 là bộ ban đầu; version tiếp theo được xác nhận trước tạo, không hai người cùng đặt V4.
- **Tạ Văn Huy** đối chiếu order/items/contracts/payment/ledger/cancel/refund/capacity, các snapshot và expected money totals; gửi yêu cầu migration cho Đại.
- **Nguyễn Khắc Trường Đạt** dùng tài khoản/seed/query để xây UI state, history/filter/newest; không coi fixtureJS cũ tự đọc DB, gửi field/DTO thiếu cho Đại/Huy.
- PR migration phải nêu schema đang áp, expected transforms, rollback/recovery ở DB test, seed impact; không sửa migrations đã dùng chung. Seed DEMO changes ngoàiproduction cần version fixture và report totals mới.
- README cho nhóm chỉ dùng path tương đối/connection placeholder; không máy cá nhân/nhánh cá nhân/secret. Các báo cáo JSP trước đó được giữ nguyên, không sửa để giả rằng backend đã hoàn tất.

[MySQL CHECK](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html), [DDL implicit commit](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html), [Flyway baseline](https://documentation.red-gate.com/flyway/reference/commands/baseline).

