# Biên bản kiểm chứng shared Entities v1

Ngày 16/10/2026 (Asia/Bangkok). Trạng thái local: **READY** cho nền mapping dùng chung, không phải xác nhận hoàn thành các business feature.

## Baseline và phạm vi

- Workspace gốc: D:\project ca nhan\TMDT-WEB, nhánh chore/thymeleaf-foundation, HEAD b783c41060a3de1dfbe7ccac4fd168d4e6d3f437.
- 25 file tracked modified và 24 file untracked được ghi inventory/checksum trước chỉnh sửa; cả 49 file gốc được kiểm lại nguyên checksum, branch/HEAD gốc không đổi. Không stash/reset/clean hoặc stage tại workspace gốc.
- Worktree tích hợp riêng, nhánh feat/shared-entities-v1; đã fast-forward tới origin/main c8637564ceb017a8463d78c1e2399a9bbb76b278 trước khi mang snapshot local auth vào. Remote origin đúng https://github.com/nguyendai05/EduConnect-Web.git.
- Snapshot gồm auth/OTP/security/JDBC, V4, dependency mail, cấu hình, template/JS/header, tests và tài liệu liên quan. Không copy .env.local, thông tin đăng nhập, database developer hoặc output build vào Git. V1–V3 không sửa; V4 giữ nguyên SQL từ snapshot.
- 51 Entity, 9 EmbeddedId, 31 enum, 51 JpaRepository. Catalog/field/constraint/maintainer trong shared-entities.md.

## Lệnh và kết quả thực tế

| Lệnh | Kết quả |
|---|---|
| .\mvnw.cmd -B -ntp test (baseline snapshot) | BUILD SUCCESS; 117 tổng, 105 chạy thành công, 12 skipped do opt-in MySQL/SMTP chưa bật |
| .\mvnw.cmd -B -ntp -Dtest=MappingContractTest,VerificationConflictTest test (trước implementation) | 3 failure đúng kỳ vọng: chưa có Entity và chưa kiểm affected-row conflict |
| Cùng hai test sau implementation | BUILD SUCCESS, 3/3 qua |
| .\mvnw.cmd -B -ntp -Dtest=SharedEntitiesMySqlTest test | Đã phát hiện Boolean metadata BIT khác TINYINT; mapping sửa theo Connector/J, sau đó 8/8 qua |
| .\mvnw.cmd -B -ntp verify (cuối, bật EDUCONNECT_JPA_TESTS và EDUCONNECT_MYSQL_TESTS) | BUILD SUCCESS; 132 tổng, 131 chạy thành công, 0 failure/error, 1 skipped: ResendSmtpSmokeTest |
| node scripts/checks/template-check.mjs | PASS; 55 templates |
| node scripts/checks/route-check.mjs | PASS; 28 assertions |
| node scripts/checks/static-check.mjs | PASS |
| node scripts/checks/hook-check.mjs | PASS |
| node scripts/checks/source-check.mjs | PASS |
| node scripts/checks/store-check.mjs | PASS; 583 assertions |
| node scripts/checks/database-static-check.mjs | PASS; migrations=4 |
| git diff --check | Qua, không whitespace error |

Môi trường local: Java 21.0.10, compiler release 17; Maven Wrapper 3.9.16; Hibernate 6.6.53.Final; MySQL 8.0.45. Docker không có; dùng mysqld binary đã cài để tạo datadir hoàn toàn mới dưới target/mysql-isolated của worktree, bind 127.0.0.1:33317. Chỉ schema mới educonnect_test_shared được provision. Flyway V1–V4 thực sự áp lên schema trống; Hibernate validate và đủ 51 repository bootstrap cùng lúc. Không dùng H2, seed hoặc synthetic Flyway history.

Test cuối bao gồm 10 SharedEntitiesMySqlTest, 3 MappingContractTest, 10 MySqlOtpTest, 2 MySqlAuthTest và hồi quy auth/security/preview. Đã kiểm shared primary key, 9 key equality/serialization, metamodel/cột/PK/catalog, enum VARCHAR, BINARY(32), JSON tiếng Việt, decimal/rate, Instant microsecond UTC, composite FK hợp lệ/sai (invitation, selection, source, transition, allocation/refund), generated refund INSERT/UPDATE, Spring Data save trên shared PK, stale update, JDBC version/stamp và refresh explicit. OTP có success, invalid/locked, expiry/resend/replay, next-day replacement, verified-email conflict, legacy semantics và rollback thực khi verification update không thành công.

Mail được mock trong DB/HTTP tests. Test SMTP thật bị skip chủ động; không gửi email thật và không tuyên bố mail delivery đã qua. Không đo coverage phần trăm hoặc load/performance; các test là invariant/integration scenarios, không getter tests.

## Publication và CI

Nhánh đích: origin/feat/shared-entities-v1; PR vào main, không merge. SHA tip và PR URL được xác minh trong báo cáo cuối của phiên triển khai. Lấy commit dùng chung bằng `git fetch origin` rồi `git rev-parse origin/feat/shared-entities-v1`; dùng SHA công bố trong báo cáo để đối chiếu. CI remote được báo riêng theo SHA; kiểm chứng local phía trên không tự khẳng định CI đã qua.

## Giới hạn bàn giao

Không thêm checkout/payment/wallet/refund business service, provider adapter, password reset, AI/chat/payout. Không phê duyệt policy phí/refund/capacity/transition chỉ bằng Entity. Trang nghiệp vụ còn dùng browser preview store. Giữ JDBC auth hiện tại; khi caller tương lai trộn managed JPA với JDBC phải refresh/clear theo entity-handoff.md. Manual setup scripts lịch sử vẫn có sai khác đã cảnh báo; không dùng chúng để provision validation.
