# Hiện trạng Educonnect và trang cần làm

## 1. Snapshot và phạm vi

- Root: `D:/project ca nhan/TMDT-WEB`.
- Branch: `feature/ui-dai-auth`; HEAD: `08740ff453905fdd64233b4d7326cec1dca60056`.
- Mốc ghi nhận: 10/10/2026, 22:14, múi giờ Asia/Bangkok (UTC+7). Khảo sát working tree, không chỉ HEAD.
- Trước khảo sát: 165 file tracked đang sửa, 2 mục untracked: `docs/ui/responsive-qa.md`, `ui-prototype/assets/brand/`. Không checkout, pull, reset, merge, commit hoặc push.
- Hướng dẫn áp dụng: AGENTS.md do người dùng cung cấp về CodeGraph; không tìm thấy AGENTS.md bổ sung trong cây repository. Đọc README, kiến trúc, database, page-map, component-inventory, coding-convention và git-workflow.
- Khảo sát toàn bộ nguồn backend trong `src/`, prototype trong `ui-prototype/`, manifest/config và tài liệu liên quan. Không khảo sát checkout/branch khác hay backend ngoài workspace; không thấy API client/config trỏ đến một backend ngoài workspace.
- Tài liệu đầu vào: `D:/Downloads/Educonnect-Codex-Audit-Va-Phan-Cong.md`. Danh sách BB/TC trong tài liệu là mục tiêu; code là bằng chứng hiện trạng. Đây là khảo sát và đề xuất, chưa triển khai.
- Bản Google Docs tham chiếu chưa được đối chiếu: web reader báo không truy cập được; browser auto-review từ chối mở origin vì tài liệu bên ngoài có thể riêng tư chưa được coi là có quyền truy cập. Tiếp tục theo danh sách đầy đủ trong file đầu vào, không chỉnh Google Docs.

## 2. Stack và cấu trúc thực tế

`pom.xml` khai báo Java 17, Spring Boot 3.5.16, WAR, Spring MVC/Web, Validation, Security, JPA, MySQL Connector, Flyway/MySQL, JSP/JSTL và starter-test. Đây là dependency, không phải chức năng đã triển khai. Máy kiểm tra có Java 21.0.10, Node 24.14.0; Maven/Semgrep không có trên PATH.

| Vùng | Nội dung thực tế | Điều chưa có |
| --- | --- | --- |
| `src/main/java/com/educonnect/` | 19 file Java: `EduConnectApplication.java` và 18 `package-info.java` | Controller, service, repository, DTO, entity, enum, security configuration |
| Các package | `admin`, `auth`, `chat`, `config`, `contract`, `invitation`, `job`, `lesson`, `notification`, `payment`, `security`, `tutor`, `user`, `wallet`; `common/{constant,exception,util,validation}` | Chỉ ranh giới module, không có nghiệp vụ |
| `src/main/resources/application.yml` | Tên application và cổng 8080 | Datasource, profile thử cô lập, mail, PayOS, session nghiệp vụ |
| `src/main/resources/db/migration/` | README | Không có SQL migration/seed/schema |
| `src/main/webapp/WEB-INF/views/` | Các thư mục với `.gitkeep` | Không có JSP hoặc JSP fragment |
| `src/main/resources/static/` | Các thư mục với `.gitkeep` | Chưa tích hợp prototype thành tài nguyên ứng dụng |
| `src/test/java/com/educonnect/` | `.gitkeep` | Không có bài kiểm tra Java |
| `ui-prototype/pages/` | 31 trang HTML tĩnh | Không phải route Spring MVC |
| `ui-prototype/js/` | 52 script JavaScript thuần, thao tác DOM/sessionStorage | Không có API client/store dữ liệu máy chủ |
| `ui-prototype/components/` | 53 HTML, gồm 51 file thành phần, `index.html` và `tai-lieu.html` trình diễn/tham khảo | Không tự tạo thành route sản phẩm |
| `scripts/` | README | Không có script test/build riêng |

CodeGraph trả 69 file indexed, 82 nodes, 19 edges; phần lớn nodes là file. Dùng `codegraph_status`, `codegraph_files`, `codegraph_context`, một `codegraph_explore`. Các IIFE của trang không được trả thân hàm; tiếp tục đọc trực tiếp những file cụ thể và literal. HTML/CSS/Markdown, ba script (`js/core/select.js`, `js/core/radio.js`, `js/pages/job/my-job.js` dưới `ui-prototype/`) không nằm trong danh sách index và `.gitkeep` được kiểm kê từ filesystem. Không suy diễn đường gọi backend từ index khi backend chưa có.

Các component tái sử dụng: User/Admin/Auth shell, header/sidebar/footer, Container/PageHeader/BrandMasthead; Breadcrumb/Tabs/Pagination/FilterPanel/FilterChip; Button/IconButton/ButtonGroup; FormField/Input/PasswordInput/Select/Checkbox/Radio/Switch/Textarea/FileUpload/SearchInput; Alert/Badge/Modal/Toast/Loading/EmptyState; Card/Table/StatCard/Tag/Avatar/Rating/InfoRow/FileAttachmentItem; TutorCard/TutorSummary/TutorVerificationBadge, JobCard/ApplicantCard/LessonCard, MessageThreadItem/WalletBalanceCard. Không ghi thành công nghiệp vụ từ việc có component.

## 3. Sổ bằng chứng dùng trong cả bốn báo cáo

Đường dẫn dưới đây tương đối so với root; `:n` là dòng hiện tại. E00 là bằng chứng chung cho chỗ chuỗi UI → API → dữ liệu bị đứt.

| ID | Bằng chứng | Kết luận giới hạn |
| --- | --- | --- |
| E00 | `src/main/java/com/educonnect/EduConnectApplication.java:6` (`main`); kiểm kê đủ 19 Java; `src/main/resources/application.yml:1`; `src/main/resources/db/migration/README.md`; `src/test/java/com/educonnect/.gitkeep` | Không có endpoint nghiệp vụ, entity, repository, schema, test hay phân quyền nghiệp vụ trong nguồn khảo sát |
| E01 | `ui-prototype/js/pages/auth/register.js:29`, `:52`, `:63` (`validate`, `showSuccess`, `simulateSubmit`) | Validate cục bộ rồi timeout báo thành công; không tạo account/gửi email |
| E02 | `ui-prototype/js/pages/auth/login.js:44`, `:67` (`validate`, `simulateSubmit`) | Timeout luôn trả invalid_credentials; không đăng nhập/phiên thật |
| E03 | `ui-prototype/js/core/user-header.js:6`, `:19`, `:223`; `ui-prototype/components/layout/admin-header.html:68` | Persona cố định; logout chỉ dispatch event, admin chỉ link login |
| E04 | `ui-prototype/components/layout/auth-shell.html:56` và `:65`; `ui-prototype/js/core/auth-shell.js`; kiểm kê `pages/auth/` chỉ login/register | Forgot/reset là panel showcase, chưa có trang/luồng phục hồi mật khẩu |
| E05 | `ui-prototype/js/pages/tutor/profile.js:8`, `:31`, `:49`, `:566`, `:698`, `:734` | Tutor/plans/reviews fixtures; chọn plan chỉ sửa DOM; link mời chỉ mang tutor ID |
| E06 | `ui-prototype/js/pages/tutor/search.js:45`, `:85`, `:107`, `:117`, `:175` | Lọc/sort thẻ DOM; tổng ban đầu cố định 128; chưa truy vấn/phân trang máy chủ |
| E07 | `ui-prototype/js/pages/invitation/create.js:303`, `:314`, `:329`; `ui-prototype/js/pages/invitation/negotiation.js:1`, `:274` | Gửi mời báo success cục bộ; chấp nhận proposal lưu sessionStorage, chưa tạo đơn/hợp đồng |
| E08 | `ui-prototype/js/pages/job/create.js:45`, `:170`, `:193`; `ui-prototype/js/pages/job/detail.js:408`; `ui-prototype/js/pages/job/applicants.js:358` | Draft, gửi tin/ứng tuyển/chọn gia sư đều mock; chưa có concurrency/ownership server |
| E09 | `ui-prototype/js/pages/contract/confirm.js:1`, `:6`, `:295` | Xác nhận local, lưu preview rồi chuyển checkout; không phải chữ ký/quyết định máy chủ |
| E10 | `ui-prototype/js/pages/payment/checkout.js:6`, `:179`, `:193`; `qr.js:1`, `:79`, `:133`, `:191`; `result.js:1`, `:110`, `:194`, `:211` cùng thư mục | Số dư/PayOS là fixture; QR trang trí; status URL chọn cách trình bày, không cập nhật ví/hợp đồng thật |
| E11 | `ui-prototype/js/pages/wallet/overview.js:1`, `:3`, `:20`, `:61` | Sổ giao dịch mẫu, lọc ngày và modal chi tiết; không phải lịch sử đơn sở hữu thật |
| E12 | `ui-prototype/js/pages/contract/student-detail.js:195`, `:273`, `:288`; `tutor-detail.js:269`, `:358` cùng thư mục | Tính tiền từ trạng thái buổi học và đổi mảng tại trang; không ghi ledger hoặc đồng bộ hai vai trò |
| E13 | `ui-prototype/js/pages/admin/dashboard.js:7`, `:29`, `:224`, `:251`, `:320` | GMV/phí/ký quỹ/giải ngân hard-code; biểu đồ cột và thanh tỷ trọng, không có pie/lọc ngày |
| E14 | `ui-prototype/js/pages/admin/job-review-data.js:26`, `:51`; `tutor-review-data.js:356`, `:409`; `report-data.js:382`, `:442`; `payout-data.js:122`, `:129` cùng thư mục | Store preview có validate/chặn lặp/storage failure; không xử lý DB/email/payment |
| E15 | `ui-prototype/js/pages/account/profile.js:72`; `ui-prototype/js/pages/tutor/my-profile.js:6`, `:87`, `:116` | Lưu hồ sơ DOM và state mock duyệt; không update account/profile server |
| E16 | Kiểm kê 31 trang, 52 JS, toàn `src/`; literal `fetch(`, `XMLHttpRequest`, `axios`, `/api/`, `WebSocket`, `sendBeacon`, `.ajax(` không có kết quả | Trong phạm vi khảo sát không có API client/request mạng; không khẳng định một checkout ngoài workspace cũng không có |

## 4. Ma trận tất cả trang hiện có

Prefix file ở bảng: `ui-prototype/pages/`. Đường dẫn `.html` là entry point tĩnh dưới server prototype; **không có route sản phẩm ở backend**. Vai trò là persona bố cục, chưa được bảo vệ bởi server. “Sửa” bao gồm nối API và xử lý lỗi, không yêu cầu vẽ lại từ đầu.

| Trang/entry point và file | Vai trò | Mã | Hiện trạng/bằng chứng; thiếu | Quyết định và lý do |
| --- | --- | --- | --- | --- |
| `auth/login.html` | Khách | BB02 | E02; chỉ mock lỗi | Sửa, nối phiên/xác thực/redirect đúng quyền |
| `auth/register.html` | Khách | BB01 | E01; thiếu email verify/role tutor | Sửa; thêm trang verify riêng |
| `account/profile.html` | Người học/phụ huynh | TC01 | E15; lưu DOM | Sửa, dùng account API chung |
| `tutor/my-profile.html#lich-ranh` | Gia sư | TC01, BB01, BB13 | E15; state URL/DOM, lịch rảnh là section | Sửa; giữ section, server quyết định duyệt |
| `tutor/search.html` | Công khai/người học | TC06, TC07, TC08, BB05 | E06; thẻ fixture/tổng 128 | Sửa; thêm tab danh mục dịch vụ/lớp, query thật |
| `tutor/profile.html?id=…` | Công khai/người học | BB05, TC04, TC08, TC09 | E05; plans không có ID/số buổi/điều kiện đủ | Sửa; bổ sung list offering có link detail, review thật |
| `invitation/create.html?tutor=…` | Người học | BB05, BB07 | E07; gửi mock | Sửa; nhận offering ID và tạo proposal thật |
| `invitation/negotiation.html?invite=…` | Hai bên | BB07, TC02 | E07; phiên bản/lưu chấp nhận local | Sửa; version/expiry/ownership server |
| `job/create.html` | Người học | BB07 | E08; draft và success local | Sửa; tạo tin thật và duyệt |
| `job/my-job.html` | Chủ tin | BB07, TC02 | `js/pages/job/my-job.js:14`, `:69`; lọc/đóng DOM | Sửa; danh sách sở hữu và đóng tin thật; không coi đóng tin là hủy đơn |
| `job/discover.html` | Gia sư | TC06, BB07 | `js/pages/job/discover.js:38`, `:83`; lọc DOM | Sửa khi nối kênh tin; không coi tin người học là sản phẩm gia sư |
| `job/detail.html?id=…` | Gia sư | BB05, BB07 | E08; chi tiết tin/ứng tuyển mock | Sửa; giữ trang tin, không dùng thay chi tiết offering |
| `job/applicants.html?id=…` | Chủ tin | BB07, TC02 | E08; chọn gia sư đổi DOM/link fixture | Sửa; chọn duy nhất/terms snapshot tại server |
| `contract/confirm.html?contract=…` | Người học/hai bên | BB07, BB08 | E09; preview consent/sessionStorage | Sửa; consent version + order link máy chủ |
| `contract/student-detail.html?id=…` | Người học | BB09, TC02, TC03, TC04, TC05 | E12; chi tiết hợp đồng/buổi mock | Sửa; thêm tóm tắt đơn, cancel/review/report modal; không tạo route riêng cho mỗi thao tác |
| `contract/tutor-detail.html?id=…` | Gia sư | BB13, TC02, TC05 | E12; điểm danh/thu nhập dự kiến DOM | Sửa; trạng thái và release thật; action là sự kiện có quyền |
| `payment/checkout.html?contract=…&from=…` | Người trả tiền | BB06, BB07, BB08 | E10; tiền fixture, luôn đi PayOS | Sửa; quote server, due=0/đủ ví, idem/hold |
| `payment/qr.html?contract=…` | Người trả tiền | BB08 | E10; SVG DEMO | Sửa; dùng payment link/QR sandbox do server tạo |
| `payment/result.html?status=…&id=…` | Người trả tiền | BB08, BB09 | E10; URL chọn presentation | Sửa; tải transaction status thật, không tin status URL |
| `wallet/overview.html#transactions` | Người học, đang có menu gia sư dùng chung | BB08, BB09, BB13, TC03 | E11; dataset người học cố định | Sửa; đúng owner/persona, giữ tabs giao dịch, không dùng thay order history |
| `chat/messages.html?contract=…` | Hai bên | Hỗ trợ BB07/TC05 | `js/pages/chat/messages.js`; hội thoại mẫu/DOM | Tái sử dụng tham chiếu; chat thời gian thực không được giao triển khai trong 23 mã |
| `admin/dashboard.html` | Admin | BB10, BB11, BB12 | E13; cột GMV/fee, tỷ trọng thanh | Sửa; date range, metric thật và pie section |
| `admin/tutor-review-queue.html` | Admin | BB01, BB12 | E14; search/filter/page store local | Sửa; nối moderation và server role |
| `admin/tutor-review-detail.html?id=…` | Admin | BB01, BB12 | E14; validate/đổi storage | Sửa; duyệt thật, thông báo, audit |
| `admin/job-review-queue.html` | Admin | BB07, BB12 | E14; list local | Sửa; moderation API của kênh tin |
| `admin/job-review-detail.html?id=…` | Admin | BB07, BB12 | E14; review local | Sửa; decision/version thật |
| `admin/reports.html?status=…` | Admin | TC05 | E14; list local | Sửa; report API dùng chung |
| `admin/report-detail.html?id=…` | Admin | TC05 | E14; kết luận local | Sửa; kết quả/notice server; không tự tính hoàn tiền |
| `admin/payout-requests.html` | Admin | Phụ thuộc BB13/BB10 | E14; mock yêu cầu rút tiền | Tái sử dụng mẫu table; chưa giao hệ rút tiền bổ sung |
| `admin/payout-request-detail.html?id=…` | Admin | Phụ thuộc BB13/TC03 | E14; mock hai bước rút tiền | Giữ; rút tiền khác release và refund đơn, chưa giao phần BS |
| `admin/audit-logs.html?module=…` | Admin | Hỗ trợ BB12/TC05 | Fixture log, không phải audit server | Tái sử dụng trình bày; nối audit tối thiểu của thao tác bắt buộc |

`components/index.html`, `components/tai-lieu.html`, các HTML component là tài liệu/showcase, không phải màn nghiệp vụ. Tab/modal/anchor nằm trong trang mẹ. Page-map trong docs chỉ là định hướng; chưa có router, controller hay navigation JSP thực thi nó.

## 5. Bản đồ API và dữ liệu

### API hiện có

**Số endpoint nghiệp vụ trong source: 0.** Không có method/path, handler, DTO vào/ra hoặc middleware phân quyền để liệt kê như API đã tồn tại. Endpoint mặc định của framework nếu có khi chạy không được coi là API nghiệp vụ; chưa chạy Boot để kiểm tra chúng. Không thấy endpoint chỉ được frontend giả định: trang dùng fixture/sessionStorage trực tiếp, không gọi `/api/…`.

| Thao tác hiện có | Handler frontend/nguồn | Đầu vào → phản hồi thực tế | Lớp thiếu |
| --- | --- | --- | --- |
| Register/login | E01/E02 | Fields → timeout success/error | Auth controller/service/account/token/email/session |
| Lọc/sort/search tutor | E06 | Form → đọc data-* thẻ, hidden/reorder | Public catalog query/DTO/page, eligibility |
| Chọn plan/mời/tin | E05/E07/E08 | Tutor ID/DOM/terms → success hoặc storage | Offering ID, proposal/application/order/contract transaction |
| Consent/checkout/QR/result | E09/E10 | Code fixture → storage/link/status URL | Quote, ledger, PayOS adapter/webhook/status/idem |
| Profile/history | E15/E11 | Field/date/filter → DOM/list fixture | Owner CRUD/history/query |
| Admin review/report | E14 | ID/status/reason → sessionStorage | Role, persistent decision, audit/notification |
| Stats | E13 | Snapshot hard-code → CSS chart | Aggregate, release date range, pie |

Danh sách API đề xuất có quyền, DTO/lỗi/nhà cung cấp ở báo cáo 04; tất cả đều đánh dấu đề xuất, không phải API đã có.

### Database và nguồn dữ liệu hiện tại

**Bảng/entity/relation thực thi: 0.** Chưa có schema hoặc migration. Không trích cấu hình bí mật; `application.yml` chỉ có name/port. Cần cấu hình datasource, mail thử và PayOS sandbox khi triển khai; báo cáo không chứa giá trị credential.

| Khái niệm mục tiêu | Nguồn mock có thể tham khảo | Khoảng trống |
| --- | --- | --- |
| Account/User/role/email token | Auth fields, header persona | Không lưu DB, không auth hay verify |
| TutorProfile/Subject/Availability | `tutor/profile.js`, `tutor/my-profile.js`, `admin/tutor-review-data.js` | Nhiều nguồn fixture, eligibility không áp ở server |
| Dịch vụ/gói | `TUTORS[*].plans` với subject/grade/price/desc | Không offering ID/publication/sessions/terms version |
| GroupClass/Enrollment/capacity | Chỉ chữ và mẫu admin report/dashboard | Không thực thể/route/luồng đăng ký nhóm |
| Cart/CartItem | Không có | Phải bổ sung |
| Order/OrderItem | Không có | Không được đổi tên contract thành order để tính đã làm |
| Invitation/Job/Application/Contract | Fixtures theo ID, storage proposal/confirmation | Không liên kết DB, snapshot/version/ownership |
| PaymentAttempt/WalletAccount/Ledger/Release/Refund | Checkout/QR/result/wallet/contract fixtures | Không transaction/đối soát/idempotency/ledger |
| Review | `TUTORS[*].reviews` | Chỉ đọc mẫu, không eligibility/write/unique constraint |
| Report/ModerationDecision/Notification | Admin report/review storage; report buổi học DOM | Không persistence, kết quả/thông báo tới người gửi |

Mô hình đề xuất ở 04 tách Order–OrderItem khỏi Contract, payment và enrollment. Chưa tạo bảng đó trong cuộc khảo sát.

### Truy vết ba kênh

1. Mời dạy: `tutor/profile` → chọn plan DOM → `invitation/create?tutor` → modal success → `negotiation?invite` fixture → sessionStorage proposal → `contract/confirm?contract` fixture → preview checkout. Plan đã chọn chưa có offering ID được bàn giao; không có order/contract thật.
2. Tin tìm gia sư: `job/create` → draft storage/success; `job/detail` → mock ứng tuyển; `job/applicants` → đổi thẻ selected → contract fixture → preview checkout. Tin đăng mới không trở thành record ở admin fixture. Chưa có unique chọn gia sư hay transaction tạo order.
3. Lớp nhóm: chưa thấy route, handler, entity, enrollment, cart hay capacity. Dashboard/report nhắc lớp nhóm không chứng minh luồng đăng ký.

### Tiền và trạng thái

Prototype có phân biệt available/escrow/released ở nhãn, nhưng tất cả là fixture hoặc tính từ lesson.status. Không có bằng chứng ledger giải ngân hay phí thực thu. `dashboard.js:31` dùng phí 8%, trong khi `contract/tutor-detail.js:187` và modal hợp đồng dùng 10%. Chỉ số GMV, escrow và doanh thu phải tách; mốc tiền giải ngân phải đến từ event/ledger thực, không từ URL hoặc đếm lesson completed. Wallet overview dùng dataset người học cả khi menu gia sư liên kết đến nó.

QR cancel là hủy phiên thanh toán, đóng tin là đóng tuyển, support modal là liên hệ hỗ trợ: **không cái nào chứng minh TC03 hủy đơn và hoàn tiền**. Kết quả URL success hiện chỉ là mock trình bày, không phải phát hiện backend bị giả mạo thanh toán vì backend đó chưa tồn tại.

## 6. Kiểm chứng đã thực hiện

Đọc `pom.xml`, scripts README và lệnh README trước chạy. Không migration, seed, email thật, DB chung, PayOS thật, refund thật hay cài tool/config.

| ID | Lệnh/luồng đã thử | Kết quả | Chứng minh / chưa chứng minh |
| --- | --- | --- | --- |
| K01 | `node --check <file>` cho toàn 52 `ui-prototype/js/**/*.js`, qua script `static-checks.cjs` tạm | 52/52 pass | Chỉ cú pháp; không chứng minh DOM, quyền, API hoặc nghiệp vụ |
| K02 | `node static-checks.cjs <audit-tmp>`: kiểm tra href/src trong 31 `pages/**/*.html` | 1.787 tham chiếu local, 0 đích thiếu, 0 href/src rỗng hoặc `#` đơn | File tồn tại; chưa xác minh query ID, anchor, runtime navigation hoặc CSS url() |
| K03 | `node mock-checks.cjs <audit-tmp>`: Node VM với sessionStorage Map cô lập | 14 assertions pass | Store mock: tin sai status/lý do ngắn/storage fail/lặp; tutor thiếu chứng thực/storage fail/lặp; report thiếu lý do/resolution/storage fail/kết luận lặp; payout không complete trước process và vòng đời hai bước. Không phải browser/E2E/API/DB, không chuyển chức năng thành “đã đủ” |
| K04 | Server đọc tĩnh `node static-server.cjs <ui-prototype>`, bind 127.0.0.1:8765; mở register trong IAB rồi Edge; Node fetch local | Server báo started; IAB/Edge timeout, Node fetch failed | Không có luồng UI được xác nhận; nguyên nhân tầng kết nối chưa xác định, không sửa firewall/cấu hình |
| K05 | `Get-Command mvn,semgrep`; kiểm kê Java tests | Không có tool trên PATH, không có test source | Build/test Java và Semgrep bị chặn; không coi target có sẵn là build mới |
| K06 | `python --version` | Application Control chặn executable hiện có | Không dùng/cài Python thay thế; dùng Node cho kiểm tra tĩnh/VM |
| K07 | Tạo SHA-256 baseline 329 file; kiểm kê Git status/HEAD/diff numstat sau, loại thư mục báo cáo mới | Baseline trong TEMP không còn truy cập ở lượt lệnh sau, nên **không đối chiếu được hash trước/sau**. Git vẫn 165 file tracked thay đổi, 2 mục untracked cũ; diff vẫn 1.316 dòng thêm/864 dòng xóa; chỉ thêm thư mục báo cáo | Không có thao tác sửa source trong audit; Git inventory/diff totals/HEAD giữ nguyên. Giới hạn: không có chứng minh toàn nội dung bằng hash; không chứng minh runtime |

Tệp kiểm tra tạm còn lưu ngoài repository tại `C:/Users/Dizan/.codex/visualizations/2026/10/10/01a12658-af5e-7631-8b30-535a12cbeee4/audit-tmp/` (`static-checks.cjs/json`, `mock-checks.cjs/json`, `report-checks.cjs/json`, `static-server.cjs`). Baseline hash/status đã tạo trong `%TEMP%/educonnect-audit-0fc0fdb583884e1fafc802e4ef42a5d0/` nhưng không đọc lại được ở lượt kiểm tra cuối; đã ghi giới hạn K07, không khẳng định hash comparison pass. Không đưa hash nội dung/fixture cá nhân vào báo cáo. Server tạm đã kết thúc khi dừng đúng phiên lệnh audit trước bàn giao (exit1 do ngắt); không thay cấu hình mạng.

Không có chức năng nào đã kiểm chứng end-to-end. Mức kiểm chứng BB/TC là “Chỉ kiểm tra tĩnh”; ghi rõ phần runtime bị chặn và K03 chỉ kiểm tra component dữ liệu mock.

## 7. Danh sách trang cần bổ sung, hoàn thiện và tái sử dụng

### Trang/route mới: 9 đề xuất

Prefix HTML đề xuất: `ui-prototype/pages/`. Khi nhóm chốt JSP, ánh xạ sang `src/main/webapp/WEB-INF/views/`; route dưới đây cũng **đề xuất**, chưa tồn tại.

| HTML mới đề xuất | Route mới đề xuất | Chủ sở hữu | Lý do và navigation |
| --- | --- | --- | --- |
| `auth/verify-email.html` | `/auth/verify-email` | Đại | Token thành công/hết hạn/gửi lại; link sau register và email thử |
| `auth/forgot-password.html` | `/auth/forgot-password` | Đại | Form yêu cầu reset; link từ login |
| `auth/reset-password.html` | `/auth/reset-password` | Đại | Token và mật khẩu mới; link mail thử |
| `catalog/detail.html` | `/catalog/{offeringId}` | Đạt, Huy cấp API | Chi tiết có ID/số buổi/terms/capacity của dịch vụ hoặc lớp; link từ tutor/profile và tab catalog ở search |
| `cart/index.html` | `/cart` | Huy | Không có màn giỏ; link CTA offering/header người học |
| `order/history.html` | `/orders` | Đạt | Lịch sử đơn tách ledger; header người học thêm “Đơn đăng ký”; drawer đơn chưa có contract, link tới student-detail khi có |
| `tutor/manage.html` | `/tutor/manage` | Huy | Tabs dịch vụ/lớp/đơn/doanh thu; menu gia sư |
| `admin/manage.html` | `/admin/manage` | Huy | Tabs users/offerings/orders; moderation hiện tại không thay CRUD/order management; AdminSidebar thêm link |
| `home.html` | `/` | Đạt | TC10 chưa có homepage; brand public trỏ home sau tích hợp |

### Trang cần hoàn thiện

27 trang: auth/login, auth/register, account/profile; tutor/search, tutor/profile, tutor/my-profile; invitation/create, invitation/negotiation; cả 5 job pages; cả 3 contract pages; cả 3 payment pages; wallet/overview; admin/dashboard, tutor-review-queue, tutor-review-detail, job-review-queue, job-review-detail, reports, report-detail. Tên ở đây giữ phần đuôi `.html` như ma trận. Phần mock duyệt có thể nghiệm thu lại K03, nhưng tất cả luồng sản phẩm còn cần server/integration. Không có trang đã đủ nghiệp vụ chỉ cần nghiệm thu.

### Tái sử dụng và giữ ngoài phạm vi triển khai

Cả 31 bố cục và bộ component có thể tái sử dụng; 4 trang `chat/messages.html`, `admin/payout-requests.html`, `admin/payout-request-detail.html`, `admin/audit-logs.html` giữ hiện trạng. Chỉ nối tối thiểu audit đã cần cho BB/TC; không giao chat realtime/rút tiền/hệ tự động bổ sung. Có thể thêm modal/tab cho review/report/cancel, chi tiết đơn và thống kê; không đề xuất trang riêng cho từng mã.

BS01–BS09 chưa có danh sách định nghĩa trong file đầu vào; không tự gán số BS từ chữ trong fixture. Có dấu vết UI tự giải ngân, rút tiền, tranh chấp, hủy lớp thiếu sĩ số; chỉ ghi nhận phụ thuộc, không giao triển khai bổ sung và không xóa. Capacity, payment cơ bản, trạng thái, hủy/refund BB/TC vẫn nằm trong gói bắt buộc của báo cáo 03.

## 8. Kiểm tra bộ báo cáo trước bàn giao

`node <audit-tmp>/report-checks.cjs` chạy thành công: đúng bốn file, đúng 23 mục BB01–BB13/TC01–TC10 và 23 hàng tổng hợp; 18 mock/5 chưa tìm thấy; 23 hàng phân công, Đại/Huy/Đạt mỗi người8 lượt; 29 package IDs duy nhất, mọi package tham chiếu tồn tại; tổng U lần lượt70/73/24 (167 U), 9 trang mới đề xuất chưa tồn tại. JSON kiểm tra static/VM khớp52 scripts/31 pages/1.787 references/14 assertions. Git kiểm kê khớp165 tracked changes, 2 mục untracked cũ, thêm duy nhất `docs/audit-phan-cong/`; HEAD/branch không đổi. Kiểm tra này kiểm tính nhất quán báo cáo và phạm vi thay đổi, không phải nghiệm thu23 chức năng. Không commit hoặc chỉnh Google Docs.
