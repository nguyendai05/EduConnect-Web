# Bàn giao nền Entity dùng chung

Nhánh tích hợp: `origin/feat/shared-entities-v1`; remote đã xác minh `https://github.com/nguyendai05/EduConnect-Web.git`, default branch `main`. Xem catalog đầy đủ trong [shared-entities.md](shared-entities.md). Trạng thái kiểm chứng/commit cuối ghi ở [shared-entities-validation.md](shared-entities-validation.md); chỉ dùng làm nền feature khi trạng thái READY.

## Thiết lập an toàn

1. Java 17+, Maven wrapper. Giữ nguyên DB development hiện có. Tạo schema test trống `educonnect_test_shared` trên instance MySQL 8 cô lập; không dùng script full_database_setup/01_create_tables/02_insert_sample_data để provision validation.
2. Flyway ứng dụng áp V1→V2→V3→V4. Giữ `ddl-auto=validate`, `open-in-view=false`, UTC; không clean/create/update/baseline tự động. Không sửa V1–V4 đã áp hoặc tự ghi flyway_schema_history.
3. Chỉ bật một profile: `db-dev` cho DB/auth; `ui-preview` để xem UI không datasource/JPA/Flyway. Không bật đồng thời.
4. Không copy .env.local/secret vào Git hoặc worktree khác. Test không gọi main để load .env.local; khai báo test URL rõ ràng.

```powershell
# Ví dụ cho instance test riêng ở port 33317; thay thông số test nếu cần.
$env:EDUCONNECT_JPA_TEST_URL = 'jdbc:mysql://127.0.0.1:33317/educonnect_test_shared?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
$env:EDUCONNECT_JPA_TEST_USERNAME = 'root'
$env:EDUCONNECT_JPA_TEST_PASSWORD = '' # Chỉ instance test cô lập; không dùng root trống cho môi trường dùng chung.
$env:EDUCONNECT_DB_URL = $env:EDUCONNECT_JPA_TEST_URL
$env:EDUCONNECT_DB_USERNAME = $env:EDUCONNECT_JPA_TEST_USERNAME
$env:EDUCONNECT_DB_PASSWORD = $env:EDUCONNECT_JPA_TEST_PASSWORD
$env:EDUCONNECT_JPA_TESTS = 'true'
$env:EDUCONNECT_MYSQL_TESTS = 'true'
Remove-Item Env:EDUCONNECT_RESEND_SMOKE -ErrorAction SilentlyContinue
.\mvnw.cmd -B -ntp verify
node scripts/checks/template-check.mjs
node scripts/checks/route-check.mjs
node scripts/checks/static-check.mjs
node scripts/checks/hook-check.mjs
node scripts/checks/source-check.mjs
node scripts/checks/store-check.mjs
node scripts/checks/database-static-check.mjs
```

Đặt môi trường test trong terminal riêng; không mang các biến test sang chạy development. Không tự tạo/reset database từ test. SharedEntitiesMySqlTest từ chối URL không phải schema test chỉ định trên loopback; các test auth cũ dùng EDUCONNECT_DB_URL, vì vậy phải trỏ cùng instance test. Mail delivery được mock; không bật ResendSmtpSmokeTest.

CI có job MySQL 8 riêng provision schema trống, Flyway và Hibernate validate. Unit/preview test chạy độc lập, không cần DB. Không coi test MySQL bị skip là passed.

## Auth JDBC và JPA

Giữ hai JDBC repository và record UserAccount/Pending; không có đường đăng ký JPA thứ hai. OTP giữ TTL/cooldown/attempt/send limit cấu hình được; account/role/profile chỉ tạo sau OTP đúng. Đăng ký lại ngày hôm sau có thể thay pending attempt; verified email không bị ghi đè; legacy unverified cần password cũ; LOCKED/DISABLED không tự hồi phục.

markEmailVerified trả affected rows, tăng `version` và `authentication_version`; service chỉ complete challenge khi update đúng một row. Xung đột ném OptimisticLockingFailureException để rollback transaction. JpaTransactionManager và JdbcTemplate dùng một datasource; không thêm transaction manager thứ hai. Auth hiện không load Entity JPA, nên không có managed Entity cần clear trong flow đó. Caller tương lai trộn JDBC/JPA phải flush các thay đổi cần thiết trước JDBC, sau đó refresh Entity hoặc clear và reload; không tiếp tục ghi instance stale. Test kiểm cả stale failure và refresh thành công.

## Cách bắt đầu cho ba thành viên

Chạy từ checkout sạch hoặc worktree mới, không pull/checkout đè working tree đang sửa. Lấy SHA bằng `git rev-parse origin/feat/shared-entities-v1` sau fetch và đối chiếu SHA trong báo cáo phát hành; chỉ tạo nhánh khi trùng commit chung đã xác minh.

```powershell
git fetch origin
# Đại: nền/account/auth/profile/file/admin; giữ điều phối migration
git switch -c feature/dai-shared-foundation origin/feat/shared-entities-v1
# Huy: chạy trong checkout/worktree riêng cho nghiệp vụ giao dịch
git switch -c feature/huy-shared-features origin/feat/shared-entities-v1
# Đạt: chạy trong checkout/worktree riêng cho controller/page và DTO
git switch -c feature/dat-dto-integration origin/feat/shared-entities-v1
```

Ba lệnh switch là ba lựa chọn cho ba checkout, không chạy tuần tự trong cùng working tree có thay đổi. Trước merge PR có thể base từ integration branch đã verified. Sau merge, fetch, kiểm commit merge/default branch mới; trên nhánh feature đã commit sạch dùng `git merge origin/main` để cập nhật. Với thay đổi chưa commit, commit chọn file vào nhánh riêng hoặc tạo worktree riêng trước; không reset/clean/stash bắt buộc và không force-push nhánh chung.

Một Entity/repository chuẩn mỗi bảng. Key/enum cùng maintainer Entity. Query/DTO có file/owner riêng; đề nghị thay shared file qua maintainer review. Đạt không tạo bản sao Order/Offering/UserAccount để phục vụ view. Ownership trang/controller giữ nguyên trong ownership.md. View ledger/revenue sẽ dùng DTO/query read-only, không repository ghi.

## Giới hạn

Profile db-dev vẫn có trang nghiệp vụ dùng preview store; auth thật không biến browser fixture thành dữ liệu DB. Chưa triển khai ownership/capacity/journal/state machine/payment provider chỉ bằng annotation. Không thêm migration mới, seed hoặc chính sách kinh doanh. Workspace gốc được giữ nguyên; foundation local auth đã mang vào nhánh tích hợp bằng inventory rõ ràng.
