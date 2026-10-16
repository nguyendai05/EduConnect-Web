# Quyết định thiết kế database Educonnect

## Cập nhật nền shared Entities v1

Các quan sát cũ bên dưới là ảnh chụp trước implementation, không là hiện trạng Java. Hiện packaging JAR, auth/OTP JDBC và 51 JPA Entity đã có source. Q01 về link/token verify 24 giờ là đề xuất lịch sử, không phải behavior hiện tại: đăng ký dùng pending_registrations/OTP với TTL cấu hình 10 phút. AuthToken chỉ được mapping riêng, reset password chưa triển khai. Q02–Q10 vẫn cần nhóm chốt; mapping không phê duyệt policy. Xem `../architecture/shared-entities.md` và `entity-handoff.md`.


Ngày đối chiếu: 11/10/2026. Đại điều phối; Huy review giao dịch/tiền; Đạt kiểm seed/read DTO. Đây là SQL dự thảo cụ thể được yêu cầu tạo để review, không là bằng chứng các policy sản phẩm đã được giảng viên chốt.

## 1. Hiện trạng đã kiểm lại

| Đã xác minh | Bằng chứng tương đối / identifier | Thiếu hoặc mâu thuẫn | Tác động thiết kế |
| --- | --- | --- | --- |
| Java 17, Boot 3.5.16, WAR | pom.xml:10,17,23 | Không JPA entity/repository/DTO/enum/security bean thực tế; Java chỉ application/package-info | Long/BigDecimal/Instant chuẩn JPA, chưa ép schema theo entity không tồn tại |
| JPA/MySQL/Flyway đã khai báo | pom.xml:39–57; WAR resolve Hibernate 6.6.53.Final, Connector/J 9.7.0, Flyway 11.7.2 | Chưa migration SQL trước công việc; db/migration/README.md là placeholder | Chọn V1/V2/V3 trong locations mặc định; không DDL độc lập thứ hai |
| Security dependency | pom.xml:35–38; Spring Security crypto6.5.11 trong artifact | Chưa PasswordEncoder bean/token/session backend | Đề xuất DelegatingPasswordEncoder/{bcrypt}; hash đã kiểm bằng chính library project, chưa tạo auth controller |
| Config chỉ app name/port | src/main/resources/application.yml:1–6 trước thay đổi | Chưa datasource/profile/DB safe | Thêm riêng application-db-dev.yml; secret qua env, Hibernate validate/Flyway, không auto DEMO |
| Offerings SERVICE/GROUP_CLASS, filter | ui-prototype/js/data/fixtures.js:82; ui-prototype/js/pages/tutor/search.js:1–8 | Fixture UI không là policy/schema chính thức | Tách offering/subject/grade/area/mode/lịch; nguồn catalogue CATALOG |
| Cart/order/contract demo | ui-prototype/js/data/store.js:997–1075, nhất là checkoutFromCart:1007,1032,1053 | Chỉ lấy tutor/item đầu để tạo một contract; SERVICE cart bị gán INVITATION trong demo | Dự thảo nhiều item, mỗi item/contract/source/tutor; không sao chép lỗi mô hình này |
| Job lựa chọn có trace | docs/ui/qa/20261010-2340/04-JOB-STORE-WIRING.md:24–31; selectApplication/applicationsOfJob trong store | “đã chốt” ở đây là wiring prototype, không phê duyệt policy production | Basic job/application/selection có FK/unique; không nhiều vòng đàm phán/BS |
| Phí/refund còn DEMO | ui-prototype/js/data/fixtures.js:26–42; docs/ui/qa/20261010-2340/03-DATA-VA-BAN-GIAO.md:167–178 | 8% cũ và10% demo không là official fee | Schema không default rate; seed dùng10% riêng có snapshot |
| Cancel/release demo | ui-prototype/js/data/store.js:1149–1193; releaseSession/completeRefund | UI có per-session release/attendance nhưng BS chưa duyệt | Không bảng lesson release scheduler/OTP/attendance; basic release manual theo contract |
| Review/report | ui-prototype/js/data/store.js:1432–1504 | Prototype review gắn order, report polymorphic nhiều target | Đề xuất review theo contract/item; report user/tutor có FK, Q09 chưa chốt |
| Dashboard | ui-prototype/js/pages/admin/dashboard.js:305,356–358; tutor/manage.js:585–603 | Held/planned không revenue; pie dimension chưa official | Chỉ release+journal; seed pie theo status order |
| Bổ sung chưa được duyệt | docs/ui/qa/20261010-2340/01-PAGE-INVENTORY.md:9; 03-DATA-VA-BAN-GIAO.md:308; báo cáo audit-jsp hiện tại | Không tìm thấy bằng chứng phê duyệt BS mới trong tài liệu hiện có | Không BS01–BS09/chat/payout; metadata/capacity/idempotency cơ bản vẫn có |

AGENTS.md không tìm thấy file vật lý trong repository/đường tổ tiên đã kiểm; áp dụng AGENTS.md CodeGraph được cung cấp trong phiên làm việc. CodeGraph status/files/context xác nhận chỉ một application class, 18 package-info. Quy ước package-by-feature theo docs/conventions/coding-convention.md:17–19 và docs/architecture/README.md. Không reset/đổi nhánh; các báo cáo JSP đang untracked được giữ nguyên.

Các version library trên là phiên bản **đã resolve** từ artifact project và đã dùng JDBC/Flyway test. Không nâng framework/driver chỉ để viết SQL. Connector/J 9.7 hỗ trợ MySQL 8.0 theo [manual PDF Oracle](https://downloads.mysql.com/docs/connector-j-en.pdf); kết nối thực tế MySQL 8.0.45 đã thành công. Không lấy thông tin compatibility của bản26.7 hiện tại thay cho9.7.

## 2. Q01–Q10: ĐỀ XUẤT – CHƯA CHỐT

| Mã | Phương án tối thiểu và lý do | Tác động nếu đổi / bảng liên quan | Người điều phối |
| --- | --- | --- | --- |
| Q01 | LEARNER chung, learner_kind SELF/PARENT; có thể nhiều role; không child profiles. Phải email verified và account active trước mutation. Token random 32 bytes, SHA256, single-use; đề xuất TTL verify 24 giờ/reset 30 phút ở service. HttpSession hiện có thể dùng memory; stamp authentication_version thu hồi khi reset | learner_profiles/user_roles/auth_tokens; nếu thêm Spring Session hoặc nhiều học sinh cần migration riêng sau duyệt; TTL không hardcode SQL | Đại, Huy review quyền |
| Q02 | Một giỏ nhiều mục; SERVICE1 seat, GROUP_CLASS số chỗ. Một order nhiều item/tutor, mỗi item tối đa1contract; group có enrollment. Source theo item, không ép order một channel | orders/order_items/registration_sources/contracts/enrollments/allocations. Nếu chọn1order1tutor, service split checkout thành orders; nếu1contract nhiều item cần bridge + migrate FK/reviews/escrow | Đại + Huy |
| Q03 | Chỉ materialize contract khi hai bên chấp thuận cùng hash terms; CATALOG publish = tutor standing offer, buyer place order = consent. Payment xác minh rồi ACTIVE; completion explicit và release cơ bản do tác nhân có quyền. Không tự theo buổi | contracts acceptance/status/history. Nếu confirm sau place order: nullable stamps + PENDING_ACCEPTANCE state/migration. MANUAL_MILESTONE là khả năng partial manual tối thiểu, cần phê duyệt trước production | Huy, Đại đồng review |
| Q04 | VND nguyên đồng, ROUND HALF_UP từng release; fee rate/policy snapshot từng item/event, không default global. Revenue tại journal release, bar theo UTC interval (service chuyển ngày địa phương thành boundsUTC). Pie đề xuất status order/count order | order_items/releases/ledger, index released_at. Thay precision/currency/rounding phải migration và giữ snapshot cũ; đổi pie chỉ query/API nếu không đổi source | Đại thống kê + Huy tiền |
| Q05 | Không clawback tiền đã release; basis = funded − posted releases − successful refunds, khóa escrow. Refund destination explicit wallet hoặc original-provider; không mặc định trộn nguồn. Whole-order cancel tối thiểu; pending đến khi child hoàn tất. Retained money phải có disposition rõ | refunds/payment_allocations/journals/statuses. Nếu provider/wallet split refund cần nhiều refund legs hoặc bảng refund_components; nếu hỗ trợ item cancel cần item state/cancellation entity mới | Huy + Đại |
| Q06 | Lịch cố định weekly ISO day + TIME + IANA zone, DATE range cho group. Giữ chỗ có reserved_until; không waitlist/reallocation/đổi lịch nâng cao. Tổng live seats tính dưới lock offering; released seats khi CANCELLED/EXPIRED theo service | offerings/time_slots/enrollments. TTL/hold point có thể đổi bằng policy/service; thêm reschedule lịch sử hoặc child identity cần phê duyệt BS | Huy; Đạt kiểm UI |
| Q07 | Public chỉ khi tutor approved, account active/email verified, offering published. Bằng cấp/minh chứng private metadata owner; edit trọng yếu đưa IN_REVIEW, không tự đổi verified bằng query. Account khóa mềm, dữ liệu lịch sử không cascade | profiles/private_files/evidence/offerings/reports/audit. Nếu cần version hồ sơ duyệt/ACL granular, migration riêng; checker admin role hiện kiểm seed role tại thời điểm test, service audit quyền lúc quyết định | Đại + Huy |
| Q08 | Chỉ DB development/test được chỉ định, provider/mail DEMO/sandbox. Seed không tạo account MySQL, không gọi mạng ngoài DB; không tự chạy qua Flyway production. Không secrets commit | application-db-dev.yml, seed guard/dev_seed_runs. Môi trường production cần connection/grants/backup/retention riêng; không bật baselineOnMigrate | Đại môi trường; Huy payment |
| Q09 | Review unique contract (=item), completed/paid đúng learner và chưa fully refund. Report account user/tutor, contract context nullable, evidence owner reporter. Không polymorphic target mất FK | reviews/reports/evidence. Nếu chọn review per order/offering cần migrate UNIQUE/FK và API; thêm report listing/job typed relations chỉ sau chốt | Đại; Huy kiểm eligibility; Đạt map UI |
| Q10 | first_published_at immutable; published_at đề xuất giữ công khai lần đầu để không bump newest bằng unpublish/republish. Newest sort published_at DESC,id DESC, loại current hidden/closed/rejected | offerings. Nếu republish phải bump, giữ first_published_at cho audit và migrate/định nghĩa last_published_at; không reinterpret timestamp cũ im lặng | Đại + Huy; Đạt TC10 |

Các trạng thái/ma trận transitions trong V2 cũng là đề xuất minimum để review, không mặc định policy đã được duyệt. MySQL FK/CHECK không tự bảo vệ ownership/current-state/capacity SUM; SCHEMA.md tách trách nhiệm và test boundary đã chứng minh.

## 3. Chính sách seed DEMO duy nhất

| Chính sách DEMO | Giá trị cố định / mục đích |
| --- | --- |
| Currency | VND, DECIMAL(19,0) |
| Fee | DEMO-FEE-10PCT-V1 = 0.100000; mỗi release HALF_UP đến đồng; net = gross−fee |
| Refund | DEMO-REFUND-UNRELEASED-100-V1: 100% phần chưa release; đã release không hoàn. **Không phải chính sách chính thức** |
| Partial release mẫu | Order14 release manual40% gross, refund60% còn lại về ORIGINAL_PROVIDER; không giải ngân tự động theo buổi |
| Wallet refund mẫu | Order22 hoàn toàn vào ví với consent giả lập; cho thấy destination khác nguồn funding. Không tự áp consent này production |
| Dates | Dataset theo UTC tháng 03–10/2026, thời điểm đối chiếu cố định 2026-10-15 00:00:00; tháng 08/2026 không revenue |
| Password | EduconnectDemo!2026 cho17 fixture account; BCrypt hash thật có {bcrypt}, kiểm library Spring. Chỉ example.test/dev |
| Provider refs/token/file | Ref bắt đầu DEMO, token chỉ digest, file chỉ metadata giả; không tài khoản ngân hàng/payload QR thật/gửi email |
| Capacity | DEMO-OF-13 capacity 2,2 enrollment confirmed; cart tham chiếu để kiểm lỗi hết chỗ |

Không lấy10% trong seed làm default product. Phí8% từ audit cũ không được mô tả thành “policy lịch sử”. Gross/fee/net snapshot không thay đổi theo rate hiện hành. Nếu nhóm đổi policy DEMO trước tiếp nhận DB, version fixture mới hoặc DB test mới; seed cũ bị sửa phải dừng, không INSERT IGNORE/UPSERT ghi đè.

## 4. Ranh giới và công việc sau database

Không controller/service/JSP đã được viết trong công việc này. Schema không tự gửi mail, gọi PayOS, authorize người dùng, làm session, chống mọi race hoặc giải ngân. Nhóm cần chốt các Q trên trước backend production, rồi implement transaction/permission/DTO tương ứng. Migrations V1/V2/V3 được kiểm trong schema thử nhưng chưa áp vào DB nhóm/production; sau khi nhóm tiếp nhận, tuyệt đối không sửa migration đã áp dụng, dành version tiếp theo theo quy trình README.


V3 phát sinh từ rà soát CHECK nullable: MySQL chấp nhận UNKNOWN, nên bổ sung capacity IS NOT NULL và ends_on IS NOT NULL khi GROUP_CLASS. Không thay V1/V2 đã áp; không thay policy kinh doanh. Chain này là DDL chuẩn duy nhất.
