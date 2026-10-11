# Phân công chi tiết đề xuất

Đề xuất trên working tree `feature/ui-dai-auth`, HEAD `08740ff453905fdd64233b4d7326cec1dca60056`, 10/10/2026 UTC+7. Đọc 01 để truy bằng chứng E00–E16 và 02 để biết mức triển khai từng mã. **Chưa triển khai các gói dưới đây.** Phương không tham gia; tên nhánh ví dụ cũ trong git-workflow không phải phân công hiện tại.

## 1. Cách tính và phân công 23 mã

Đơn vị **U** đo công tương đối phần còn lại: 1 rất nhỏ/nghiệm thu hẹp, 3 UI hoặc adapter gọn, 5 module trung bình có trạng thái/quyền, 8 module lớn nhiều phụ thuộc, 13 module tiền/concurrency và tích hợp khó. Dùng số nguyên giữa các mốc khi cần. Không là điểm giảng viên, số ngày hay phần trăm hoàn thành. Ước lượng bao gồm test có ý nghĩa cho phần mới, nhưng không viết lại layout đã có. Mức chắc chắn **thấp** cho backend mới/rules đang chờ; **vừa** cho phần UI xác định rõ; chưa có mức cao khi E2E bị chặn.

Tính U theo gói một lần. Gói shared cấp nhiều mã không cộng lại vào từng mã. Người làm API nền cho mã của Đạt là hỗ trợ có công U trong shared package, không được cộng thêm lượt chức năng. BB05 là mã đồng thực hiện duy nhất, hai phần thiếu thật: dữ liệu offering/group và eligibility (Huy), UI chi tiết/selection (Đạt). Huy điều phối nghiệm thu BB05.

| Mã | Chính/đồng thực hiện | Phần còn lại và gói | Độ khó toàn bộ → phần được giao |
| --- | --- | --- | --- |
| BB01 | Đại | Register/email/verify; AUTH-REGISTER-01 | Khó → khó |
| BB02 | Đại | Login/session UI; AUTH-LOGIN-01 | Khó → trung bình–khó |
| BB03 | Đạt | Logout client; BB03-UI-01; Đại cấp SHARED-AUTH-01 | Dễ–trung bình → dễ |
| BB04 | Đại | Recovery/token/UI; AUTH-RESET-01 | Khó → khó |
| BB05 | Huy + Đạt | BB05-DATA-01 / BB05-UI-01 | Trung bình–khó → Huy khó, Đạt dễ–trung bình |
| BB06 | Huy | Cart; BB06-01 | Khó → khó |
| BB07 | Huy | Ba kênh/đơn; MATCHING-01, BB07-01 | Khó → khó |
| BB08 | Huy | Balance/PayOS/ledger; BB08-01 | Rất khó → rất khó |
| BB09 | Đạt | History UI; BB09-UI-01; Huy cấp read API trong BB07-01 | Trung bình → dễ–trung bình |
| BB10 | Đại | Release aggregates + bars; STATS-01 | Khó → trung bình–khó |
| BB11 | Đại | Aggregate/pie; STATS-01 dùng chung BB10 | Trung bình → trung bình |
| BB12 | Huy | Admin users/offerings/orders + moderation UI; BB12-01 | Khó → khó |
| BB13 | Huy | Tutor offerings/classes/orders/revenue host; BB13-01 | Khó → trung bình–khó |
| TC01 | Đạt | Profile UI; TC01-UI-01; Đại cấp SHARED-PROFILE-01 | Trung bình–khó → dễ–trung bình |
| TC02 | Huy | Event states/release; TC02-01 | Khó → khó |
| TC03 | Huy | Cancel/refund rules/API/modal; TC03-01 | Rất khó → khó |
| TC04 | Đại | Eligible review/API/modal/public list; REVIEW-01 | Trung bình → trung bình |
| TC05 | Đại | Report/evidence/admin outcome/notice; REPORT-01 | Khó → khó |
| TC06 | Đại | Catalog query/filter contract; SHARED-CATALOG-01, filter patch giao Đạt | Trung bình–khó → trung bình–khó |
| TC07 | Đạt | Sort consumer; TC07-UI-01 | Dễ–trung bình → dễ |
| TC08 | Đạt | Search consumer và điều phối search UI; TC08-UI-01 | Trung bình → dễ–trung bình |
| TC09 | Đạt | Offering list by tutor; TC09-UI-01 | Trung bình → dễ–trung bình |
| TC10 | Đạt | Home latest feed UI; TC10-UI-01 | Dễ–trung bình → dễ–trung bình |

| Người | Mã tính tham gia | Số mã | Gói/U còn lại |
| --- | --- | --- | --- |
| Nguyễn Xuân Đại | BB01, BB02, BB04, BB10, BB11, TC04, TC05, TC06 | 8 | 11 gói, 70 U |
| Tạ Văn Huy | BB05, BB06, BB07, BB08, BB12, BB13, TC02, TC03 | 8 | 10 gói, 73 U |
| Nguyễn Khắc Trường Đạt | BB03, BB05, BB09, TC01, TC07, TC08, TC09, TC10 | 8 | 8 gói, 24 U |

23 mã độc lập, 24 lượt tham gia. Không mã nào đủ nghiệp vụ để chỉ nghiệm thu; 18 mã vẫn có layout/mock tái sử dụng, 5 mã chưa có luồng mục tiêu. K03 không biến store mock thành chức năng đủ. Tổng **167 U**, shared tính một lần. Huy cao hơn Đại **3 U** (73–70), khoảng 4,3% của 70 U, trong sai số ước lượng thấp; không khẳng định chính xác tải thực tế bằng nhau. Đạt nhẹ hơn có chủ đích theo yêu cầu; không giao transaction/security/aggregate cho Đạt để cân số U giả.

### Thay đổi so với sơ bộ

| Mã | Trước | Đề xuất | Bằng chứng/lý do/ảnh hưởng |
| --- | --- | --- | --- |
| BB12 | Đại | Huy | E00 chưa backend; admin CRUD offerings/orders dùng trực tiếp commerce Huy đang xây. E14 có moderation UI, không cần vẽ lại. Huy điều phối admin/manage và tutor/job review UI; Đại vẫn cấp auth/account/profile API, không thêm lượt BB12 |
| TC06 | Huy | Đại | E06 hiện chỉ lọc DOM; query public/công khai cần cấp TC07/08/09/10 và eligibility profile/auth. Đại làm SHARED-CATALOG-01 một lần; Đạt giữ quyền sửa search UI, nhận filter patch của Đại; không hai người edit song song |

Giữ BB05 làm chung có hai đầu ra thật; không tạo nhiệm vụ giả để đủ tám mã. Các kết luận chưa có ngoài workspace chỉ được lập kế hoạch cho workspace đã khảo sát.

## 2. Quy ước đọc gói

- **File hiện có** ghi chính xác; **mới đề xuất** chưa tồn tại. Package/module là ranh giới được phép sửa, nhưng file shared do người điều phối ở 04 phát hành.
- Mỗi gói gồm UI/API/data/rules trong phạm vi mô tả. “Không gồm” là ranh giới để không tính/sửa hai lần.
- Mọi dependency là ID gói trong tài liệu này hoặc quyết định Q01–Q10 ở 04. Có thể dựng UI bằng fixture theo DTO đã freeze khi đang chờ server; không được báo đã tích hợp.
- Sau SHARED-UI-01, bản production của `ui-prototype/pages/X.html`, `js/pages/X.js`, `css/pages/X.css` lần lượt là `src/main/webapp/WEB-INF/views/X.jsp`, `src/main/resources/static/js/pages/X.js`, `.../css/pages/X.css`; **cũng là mới đề xuất**, chủ sở hữu giữ như prototype. Chủ trang chuyển một lần và bỏ mock khỏi luồng production; không duy trì hai nguồn business state.
- Những file script “không thấy trong CodeGraph” vẫn đã được đọc filesystem, không mặc định chúng vắng.

## 3. Phần việc của Đại

**Bắt đầu:** chốt Q01 và hợp đồng auth/DTO; thực hiện SHARED-DB-01 + SHARED-AUTH-01, rồi phát hành SHARED-UI-01. Huy cấp mô hình giao dịch/catalog cho migration; Đạt nhận client contract/profile/search sau đó. Đọc phần này đủ biết file mình được sửa; ranh giới Huy/Đạt được ghi ngay từng gói.

### SHARED-DB-01 — Điều phối schema và môi trường thử, 5 U, chắc chắn thấp

- **Phục vụ/kết quả:** toàn BB/TC cần persistence; schema/version có owner, không migration chồng số.
- **Chính/review:** Đại; Huy review quan hệ/transaction, Đạt kiểm tra dữ liệu thử đầu ra.
- **Hiện có:** `pom.xml`, `src/main/resources/application.yml`, `src/main/resources/db/migration/README.md` chỉ đọc/chỉnh khi triển khai được cho phép. **Mới đề xuất:** `src/main/resources/application-test.yml`, `src/main/resources/db/migration/V1__accounts_profiles.sql`, `V2__catalog_matching_orders.sql`, `V3__wallet_payments_reviews_reports.sql`; schema chia version sau khi chốt, không migration/seed trong audit này.
- **Phạm vi:** cấu hình test DB cô lập, mail sink/PayOS sandbox tên biến; schema constraints/index/version/FK theo mô hình; migration registry. Không viết service, controller hay tự chốt fee/refund.
- **Đầu vào → đầu ra:** Q01/Q02, hợp đồng mô hình draft từ SHARED-PROFILE-01/SHARED-COMMERCE-01 → DDL version được nhóm review và test profile hướng dẫn chạy; Huy chỉ gửi yêu cầu DDL/patch, Đại là người ghi migration.
- **Phụ thuộc/bắt đầu:** có thể thiết kế đầu tiên; ghi V2/V3 sau draft mô hình Huy, không tạo vòng chờ service: các service chỉ bắt đầu persistence sau schema phase liên quan.
- **Nghiệm thu:** DB thử trống migrate được, unique/FK/amount constraints đúng; migration lỗi rollback theo cơ chế đã chốt, không chạy vào DB chung; không credential trong git/log.

### SHARED-AUTH-01 — Auth/session/API client chung, 8 U, thấp

- **Mã/kết quả:** BB01/02/03/04, quyền cho tất cả mã; principal đúng và client xử lý 401/403/CSRF nhất quán.
- **Chính/review:** Đại; Huy review authorization, Đạt review client usage.
- **Mới đề xuất:** `src/main/java/com/educonnect/security/SecurityConfig.java`, `auth/controller/AuthController.java`, `auth/service/AuthService.java`, `auth/dto/SessionResponse.java`, `common/exception/ApiError.java` dưới root Java; `ui-prototype/js/core/api-client.js`, `session.js` và production mirror. Entity account thuộc SHARED-PROFILE-01, password auth nằm gói này.
- **Phạm vi:** session cookie, CSRF, login/logout/current session, role guard/password encoder, API envelope/error adapter. Không email token lifecycle, order ownership nghiệp vụ, header markup, profile edits.
- **IO:** Q01 + account draft schema → auth API và `EduApi`/`EduSession` contract A01 tại 04; cung cấp logout cho Đạt, principal cho Huy.
- **Phụ thuộc:** account DDL phase1 của SHARED-DB-01; schema draft do Đại có thể chuẩn bị trước. Không cần chờ commerce.
- **Nghiệm thu:** session rotation/expiry/logout replay, bad password, CSRF mutation, ba role403; client network/401 không báo success; request không nhận role do client tự khai.

### SHARED-UI-01 — Chuyển nền UI/JSP/router, 5 U, vừa

- **Mã/kết quả:** tất cả UI BB/TC; page/frame/navigation production thống nhất.
- **Chính/review:** Đại; Đạt review navigation, Huy review protected route map.
- **Hiện có:** `ui-prototype/components/layout/{auth-shell,user-shell,admin-shell,user-header,admin-header,admin-sidebar}.html`, `ui-prototype/css/{tokens,base,layouts}.css`; Đại điều phối và chỉ nhận patch. **Mới đề xuất:** `config/WebMvcConfig.java`, `config/PageController.java` dưới root Java; JSP fragments `src/main/webapp/WEB-INF/views/fragments/layout/{auth-shell,user-header,admin-header,admin-sidebar}.jspf`; production core CSS/JS copy.
- **Phạm vi:** view resolver/path mapping, static assets, shared form/table/tabs/modal integration và authenticated shell. Không sửa riêng page logic của Huy/Đạt hay đổi token hiện đang làm dở trong audit.
- **IO:** route list 01 + A01 → JSP shell/router v1 và cách mount page modules; slot history/cancel/review/report/stats có contract.
- **Phụ thuộc:** SHARED-AUTH-01 cho role entry; layout extraction có thể chuẩn bị sớm sau kiểm tra patch người dùng hiện tại.
- **Nghiệm thu:** pages protected đúng role; static resources/link/query/empty; header không hard-code user; không duplicate listener khi chuyển từ prototype sang production.

### SHARED-PROFILE-01 — Account/profile và duyệt tutor server, 5 U, thấp

- **Mã/kết quả:** hỗ trợ TC01, BB01, BB12, TC08; persistent profile và public gate.
- **Chính/review:** Đại; Huy review moderation contract, Đạt review fields/save.
- **Mới đề xuất:** `user/entity/Account.java`, `user/controller/ProfileController.java`, `user/service/ProfileService.java`, `user/dto/ProfileResponse.java`; `tutor/entity/TutorProfile.java`, `tutor/controller/TutorProfileController.java`, `tutor/service/TutorProfileService.java`, `tutor/dto/TutorProfileResponse.java`; `admin/TutorModerationController.java`, `admin/AccountAdminController.java`, `common/util/EvidenceStorage.java` dưới root Java. Chỉ Đại sửa các file này; catalog Offering của Huy.
- **Phạm vi:** GET/PATCH self, allowlist/version, reapproval, subjects/rates/slots, evidence access/type/size, account state/minimal tutor approval + notification record. UI Đạt/Huy; không offering CRUD, public query predicate implementation riêng SHARED-CATALOG-01.
- **IO:** Q07 + UI fields E15/E14 → A02/A10 profile/admin API; DTO/version/publicEligible; phát event profile status.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-DB-01 phase1; không chờ order.
- **Nghiệm thu:** cross-user403, mass assignment role/verified bị từ chối, invalid upload/private access, critical edits pending, admin approve/reject/version conflict/lặp; learner reload persisted.

### SHARED-CATALOG-01 — Query danh mục/filter/search/sort/latest, 8 U, thấp

- **Mã/kết quả:** TC06 chính; cấp API TC07/08/09/10, BB05 public data. Công nền chỉ tính 8 U ở đây.
- **Chính/review:** Đại; Huy review eligibility/price/capacity, Đạt review query UI.
- **Mới đề xuất:** `tutor/controller/PublicTutorController.java`, `tutor/service/TutorSearchService.java`, `tutor/dto/TutorSearchResponse.java`, `catalog/controller/CatalogQueryController.java`, `catalog/service/CatalogQueryService.java`, `catalog/repository/CatalogQueryRepository.java`, `catalog/dto/CatalogPageResponse.java` dưới root Java. Huy sở hữu `catalog/entity/Offering.java`, `GroupClass.java` và detail controller; không chỉnh chúng song song.
- **Phạm vi:** listing tutors/offerings/by-tutor/latest, validated filter/sort/page, eligibility luôn server, publishedAt stable; filter UI patch cho Đạt áp. Không management writes/detail availability transaction, không Đạt viết SQL phức tạp.
- **IO:** BB05-DATA-01 offering/availability contract + SHARED-PROFILE-01 public gate + Q06/Q07/Q10 → A03/A04 query examples/errors/counts; patch filter nhận trong TC08-UI-01.
- **Phụ thuộc:** schema phase2, BB05-DATA-01 đọc dữ liệu/catalog model freeze; có thể viết query skeleton trước seed dữ liệu test.
- **Nghiệm thu:** combined filters/sort/page/tie-break, range invalid400, hidden/banned/private không lọt; latest chỉ approved/open; không query arbitrary sort SQL; 0 data và timestamp boundary.

### AUTH-REGISTER-01 — Đăng ký/email verification, 8 U, thấp

- **Mã/kết quả:** BB01; account xác minh được và tutor chưa duyệt bị hạn chế.
- **Chính/review:** Đại; Huy security/replay review, Đạt UI review.
- **Hiện có:** `ui-prototype/pages/auth/register.html`, `js/pages/auth/register.js`, `css/pages/auth/register.css`. **Mới đề xuất:** `pages/auth/verify-email.html`, `js/pages/auth/verify-email.js`, `css/pages/auth/verify-email.css`; `auth/service/RegistrationService.java`, `EmailVerificationService.java`, `auth/entity/AccountToken.java`, `auth/controller/RegistrationController.java` dưới root Java + JSP/mirror tương ứng.
- **Phạm vi:** registration/email token/send sink/resend/verify + UI; không login/reset, admin tutor review UI hay lựa chọn fee.
- **IO:** A01, Q01/Q07 → A01 register/verify/resend, verified account và errors; dùng chung mail adapter/token abstraction cho AUTH-RESET-01.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-PROFILE-01, SHARED-DB-01, SHARED-UI-01.
- **Nghiệm thu:** duplicate email, invalid fields, hash password, single-use/expired token, mail failure/retry safe; verification không tự approve tutor.

### AUTH-LOGIN-01 — Nối login UI, 4 U, vừa

- **Mã/kết quả:** BB02; người dùng vào đúng phần có quyền.
- **Chính/review:** Đại; Đạt UI, Huy role regression.
- **Hiện có:** `ui-prototype/pages/auth/login.html`, `js/pages/auth/login.js`, `css/pages/auth/login.css`; production mirrors mới đề xuất.
- **Phạm vi:** thay simulateSubmit bằng A01 login/session; validation/locked/banned/unverified/expired; safe return URL và headers cập nhật. SecurityConfig/AuthController đã tính ở SHARED-AUTH-01, không cộng lại.
- **IO:** login/session responses → logged-in state/entry point; role layout dùng SHARED-UI-01.
- **Phụ thuộc:** SHARED-AUTH-01, AUTH-REGISTER-01, SHARED-UI-01.
- **Nghiệm thu:** learner/tutor/admin success + invalid/locked/unverified/network; không redirect ngoài allowlist, no secret logging.

### AUTH-RESET-01 — Khôi phục mật khẩu, 6 U, thấp

- **Mã/kết quả:** BB04; request và reset bằng token có hạn.
- **Chính/review:** Đại; Huy token/security, Đạt UI.
- **Mới đề xuất:** `ui-prototype/pages/auth/{forgot-password,reset-password}.html`, cùng tên dưới `js/pages/auth/`, `css/pages/auth/`; `auth/controller/PasswordResetController.java`, `auth/service/PasswordResetService.java` dưới root Java. Hiện có login HTML nhận link từ Đại.
- **Phạm vi:** request/reset UI/API, token expiry/consume/password reset/invalidate sessions; dùng AccountToken/mail của register. Không triển khai OTP SMS/social auth.
- **IO:** Q01/A01 token mechanism → reset endpoints/link/login destination.
- **Phụ thuộc:** SHARED-AUTH-01, AUTH-REGISTER-01, SHARED-UI-01.
- **Nghiệm thu:** correct/expired/replayed token, enumeration-safe request, old password denied/new valid; token không xuất log/plain persistent.

### STATS-01 — Biểu đồ cột và tròn, 8 U, thấp

- **Mã/kết quả:** BB10 + BB11; tutor released net, admin fee/count, đúng period/scope.
- **Chính/review:** Đại; Huy reconcile ledger, Đạt accessibility UI.
- **Hiện có:** `ui-prototype/pages/admin/dashboard.html`, `js/pages/admin/dashboard.js`, `css/pages/admin/dashboard.css`. **Mới đề xuất:** `admin/StatisticsController.java`, `admin/StatisticsService.java`, `admin/dto/StatisticsResponse.java` dưới root Java; `ui-prototype/js/core/statistics-panel.js`. Huy sở hữu tutor/manage host; Đại giao module/slot patch, không cùng edit host.
- **Phạm vi:** aggregation release ledger/date/role, bars+pie+legend+zero/error; rate snapshot/range definitions. Không tạo ledger hay đổi fee source; không nối payouts bổ sung.
- **IO:** release read view của TC02-01 + Q04 → A11 stats và chart module; Huy mount tại BB13-01.
- **Phụ thuộc:** SHARED-COMMERCE-01, BB08-01, TC02-01; BB13-01 chỉ cần shell slot, không chờ stats để build shell.
- **Nghiệm thu:** released/fee/held tính tách biệt, pie totals100% khi có dữ liệu, no NaN0 data, timezone/from>to400, non-admin/tutor scope; hard-code 8%/10% bị thay bằng snapshot.

### REVIEW-01 — Đánh giá đã mua, 5 U, thấp

- **Mã/kết quả:** TC04; chỉ buyer completed contract đánh giá, rating public đúng.
- **Chính/review:** Đại; Huy eligibility, Đạt host UI.
- **Mới đề xuất:** `review/{ReviewController,ReviewService}.java`, `review/entity/Review.java`, `review/dto/ReviewResponse.java` dưới root Java; `ui-prototype/js/core/review-form.js`, `components/domain/review/review-form.html`. Hiện có tutor/profile JS/HTML và student-detail host do Đạt/Huy điều phối, Đại chỉ giao patch section.
- **Phạm vi:** write/read review, unique/rating range/ownership, aggregate rating notification to catalog; form và error module. Không sửa order completion hoặc full tutor-profile render song song.
- **IO:** TC02-01 completed/owned order DTO, Q09 → A08 review DTO/module/patch; TC09-UI-01 áp public list.
- **Phụ thuộc:** SHARED-COMMERCE-01, TC02-01, SHARED-CATALOG-01; schema phase3 do SHARED-DB-01 ghi.
- **Nghiệm thu:** buyer eligible, not completed/other user403, duplicate409, input safe render, latest public aggregate reflects saved review.

### REPORT-01 — Báo cáo người dùng/tutor và admin xử lý, 8 U, thấp

- **Mã/kết quả:** TC05; submit/evidence → admin decision → sender status/notification.
- **Chính/review:** Đại; Huy financial handoff, Đạt sender host UI.
- **Hiện có:** `ui-prototype/pages/admin/{reports,report-detail}.html`, `js/pages/admin/{reports,report-detail,report-data}.js`, `css/pages/admin/{reports,report-detail}.css`. **Mới đề xuất:** `report/{ReportController,ReportService}.java`, `report/entity/Report.java`, `report/dto/ReportResponse.java` dưới root Java; `ui-prototype/js/core/report-form.js`, `components/domain/report/report-form.html`; notification record/outbox trong `notification/` do Đại điều phối.
- **Phạm vi:** target/user checks, evidence restricted/type/size, persistent outcomes/version/audit/notification, UI errors/retry. Không chuyển ví/đặt trạng thái tiền; emit requested-approved adjustment contract cho Huy xử lý TC03-01.
- **IO:** Q09/A02/owned contract → A09 report API và outcome event; Đạt/Huy mount user modal sau nhận patch.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-PROFILE-01, SHARED-COMMERCE-01; TC03-01 chỉ cần nếu quyết định có consequence refund, không chặn basic report persist.
- **Nghiệm thu:** sender/admin scopes/evidence403, reason bounds, invalid target404, version409/repeated conclude, notice outbox linked; independent fixture data bị thay API, money untouched nếu chưa financial approval.

## 4. Phần việc của Huy

**Bắt đầu:** gửi domain draft Order/Contract/Offering/Ledger và câu trả lời Q02/Q03/Q05/Q06 cho Đại SHARED-DB-01. Sau schema phase2 + A01 principal, thực hiện SHARED-COMMERCE-01/BB05-DATA-01/MATCHING-01. Cấp detail/read order API cho Đạt trước khi hoàn tất toàn thanh toán; ghi rõ response nào chưa có payment state thật. Không sửa auth/profile/query/statistics service của Đại; chỉ có một đầu mối migration là Đại.

### SHARED-COMMERCE-01 — Mô hình giao dịch và ownership, 8 U, thấp

- **Mã/kết quả:** BB05/06/07/08/09/12/13, TC02/03/04/05; một nguồn order/contract/payment state.
- **Chính/review:** Huy; Đại schema/security, Đạt DTO usability.
- **Mới đề xuất:** `order/entity/{Order,OrderItem}.java`, `order/dto/OrderResponse.java`, `order/OrderStatus.java`; `contract/entity/Contract.java`, `contract/ContractStatus.java`; `payment/{PaymentStatus,RefundStatus}.java`, `wallet/entity/{WalletAccount,LedgerEntry}.java` dưới root Java. DTO enums cùng module do Huy điều phối; metadata user/tutor ID là reference tới Đại.
- **Phạm vi:** relation snapshots/channel/consentVersion/money currency/version, ledger uniqueness/owner authorization services nền; không viết migration trực tiếp, không auth/session, public query hoặc chart.
- **IO:** Q02/Q03/Q05 + account/profile IDs → A05/A06/A07 DTO v1, enums/error codes và schema draft gửi Đại; Đạt dùng DTO mà không tạo local business state.
- **Phụ thuộc:** SHARED-DB-01 phase2/3 và SHARED-AUTH-01; draft domain làm sớm để DB không bị vòng chờ.
- **Nghiệm thu:** Order khác Contract/payment; IDs/channel/reference correct, immutable price/version snapshot; owner checks, uniqueness/foreign keys, amounts nonnegative/release invariant trong test DB cô lập.

### BB05-DATA-01 — Offering/group detail và khả năng đăng ký, 8 U, thấp

- **Mã/kết quả:** BB05 phần Huy, dữ liệu cho cart/seller/catalog; người học biết điều kiện thật.
- **Chính/review:** Huy; Đại public gate/schema, Đạt detail integration.
- **Mới đề xuất:** `catalog/entity/{Offering,GroupClass}.java`, `catalog/controller/OfferingDetailController.java`, `catalog/service/{OfferingService,AvailabilityService}.java`, `catalog/dto/OfferingDetailResponse.java` dưới root Java; group/enrollment module draft riêng. Không sở hữu CatalogQueryController/Service/Repository của Đại.
- **Phạm vi:** ID, type, subject/grade/price/unit/sessions/duration/mode/location/schedule/terms/publication/capacity; detail eligibility API. Management controller UI trong BB13/12; seat reservation transaction ở MATCHING-01.
- **IO:** Q02/Q06/Q07, profile publicEligible → A04 detail DTO và demo records test cô lập (khi triển khai được phép), gate/error matrix; Đại dùng read contract, Đạt nối BB05-UI-01.
- **Phụ thuộc:** SHARED-COMMERCE-01, SHARED-PROFILE-01; model draft cung cấp SHARED-DB-01 trước implement.
- **Nghiệm thu:** public/closed/full/draft, invalid404, owner gate, server authoritative fee/slots; detail cung cấp số buổi và terms version; không trùng JSON fixture từ nhiều page.

### MATCHING-01 — Nguồn ba kênh tạo đơn, 8 U, thấp

- **Mã/kết quả:** BB07, BB05 và TC02 phụ thuộc; invite/job/group dẫn đến lựa chọn có thể đặt thật.
- **Chính/review:** Huy; Đại auth/terms consistency, Đạt selection integration.
- **Hiện có:** `ui-prototype/pages/invitation/{create,negotiation}.html`, `js/pages/invitation/{create,negotiation}.js`; `pages/job/{create,my-job,discover,detail,applicants}.html`, JS/CSS tương ứng. **Mới đề xuất:** controller/service/entities/DTO trong `invitation/`, `job/`, `enrollment/` dưới root Java; tên chính `InvitationController`, `InvitationService`, `JobController`, `JobService`, `EnrollmentService`.
- **Phạm vi:** persistent proposals/version/expiry/both sides consent; tin→application→single selected tutor; group enrollment seat hold/capacity expiry và source refs. Không chat realtime, tự hủy nhóm thiếu sĩ số BS, order payment ledger hoặc order history UI.
- **IO:** A01/A04 detail + Q03/Q06 → A05 sources/accepted terms/seat reservation; BB07-01 nhận sourceId/version để transaction tạo order.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-COMMERCE-01, BB05-DATA-01; job moderation UI/endpoint nối BB12-01 có thể sau persistent job base.
- **Nghiệm thu:** invite expired/version changed, job two-select race, group last seat concurrent/hold expiry; private proposal ownership; không báo gửi thành công chỉ timeout.

### BB06-01 — Cart CRUD và quote UI/API, 5 U, thấp

- **Mã/kết quả:** BB06; danh sách đăng ký sửa/xóa được và totals authoritative.
- **Chính/review:** Huy; Đại totals/auth, Đạt CTA.
- **Mới đề xuất:** `ui-prototype/pages/cart/index.html`, `js/pages/cart/index.js`, `css/pages/cart/index.css`; `cart/{CartController,CartService}.java`, `cart/entity/{Cart,CartItem}.java`, `cart/dto/CartResponse.java` dưới root Java. CTA public profile/detail nhận patch qua Đạt; header qua BB03-UI-01, không Huy sửa core.
- **Phạm vi:** add/update/delete/get owned, quote and unavailable item feedback; không create order/payment, không tin vào client price/status.
- **IO:** offering ID/terms from BB05 → A05 cart revision/quote; BB07-01 checkout sử dụng server quote.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-COMMERCE-01, BB05-DATA-01, Q02 cart semantics.
- **Nghiệm thu:** add/remove/edit/reload, empty/duplicate/invalid item, price changed/closed/full; other owner403; totals recalculated server.

### BB07-01 — Order/contract creation và read API, 5 U, thấp

- **Mã/kết quả:** BB07; cấp nền BB09/12/13/TC02/04, không cộng thêm lượt cho các mã hỗ trợ.
- **Chính/review:** Huy; Đại snapshot/permission, Đạt history integration.
- **Hiện có:** `ui-prototype/pages/contract/confirm.html`, `js/pages/contract/confirm.js`, `css/pages/contract/confirm.css`. **Mới đề xuất:** `order/{OrderController,OrderService}.java`, `order/service/OrderQueryService.java`, `contract/service/ContractService.java` dưới root Java; entities/DTO dùng SHARED-COMMERCE-01.
- **Phạm vi:** create from cart/accepted source, immutable selection/prices, terms consent/version, order-contract/enrollment links; owned learner/tutor/admin GET list/detail + pagination/allowedActions. Không ledger settlement, state transition release/cancel or history markup của Đạt.
- **IO:** A05 source/quote + Q02/Q03 → A05 order creation/read DTO, link contract và payment context A06; Đạt bắt đầu BB09-UI-01 ngay khi read API đủ.
- **Phụ thuộc:** SHARED-COMMERCE-01, MATCHING-01 hoặc BB06-01 theo kênh; cả hai phải xong trước nghiệm thu ba kênh. SHARED-AUTH-01/DB phase2.
- **Nghiệm thu:** create/repeated same idem key, stale cart/terms/price409, owned list403, rollback partial DB write, mỗi kênh link đúng; pending no-contract đọc được.

### BB08-01 — Available, escrow và PayOS cơ bản, 13 U, thấp

- **Mã/kết quả:** BB08; tiền giữ đúng và trạng thái được server xác nhận, cấp dữ liệu BB09/10/13/TC03.
- **Chính/review:** Huy; Đại webhook/idem/security, Đạt result/history UX.
- **Hiện có:** `ui-prototype/pages/payment/{checkout,qr,result}.html`, JS/CSS tương ứng; `pages/wallet/overview.html`, `js/pages/wallet/overview.js`, `css/pages/wallet/overview.css`. **Mới đề xuất:** `payment/{PaymentController,PayosWebhookController}.java`, `payment/service/{PaymentService,PayosAdapter}.java`, `payment/entity/PaymentAttempt.java`, `wallet/WalletService.java` dưới root Java.
- **Phạm vi:** authoritative quote and balance hold, due0 branch, sandbox payment create/status/verify webhook, reconciliation/retry/late success/idempotent ledger, failure hold release; role wallet read. Không money release completion (TC02), refund order formula (TC03), admin withdrawal automation.
- **IO:** BB07 order/total + Q08 sandbox contract → A06 paymentId/state/QR+status, A07 ledger/read balance; STATS-01 tiêu thụ release event từ TC02 sau đó.
- **Phụ thuộc:** SHARED-COMMERCE-01, BB07-01, SHARED-AUTH-01, DB phase3; không gọi tiền thật khi chưa môi trường cô lập.
- **Nghiệm thu:** đủ/thiếu/0 available; two-tab checkout, repeated create/webhook, wrong signature/order/amount, failed/expired/cancelled/late success; URL success không paid, negative balance prevented, role wallet đúng.

### BB12-01 — Admin quản lý và moderation UI, 8 U, thấp

- **Mã/kết quả:** BB12; admin quản lý users/offerings/orders và liên kết contract.
- **Chính/review:** Huy; Đại role/user/moderation contract, Đạt navigation.
- **Hiện có:** bốn `ui-prototype/pages/admin/{tutor-review-queue,tutor-review-detail,job-review-queue,job-review-detail}.html`, JS/CSS tương ứng và hai data scripts. `admin/audit-logs.html`/JS nhận integration audit tối thiểu. **Mới đề xuất:** `pages/admin/manage.html`, JS/CSS cùng tên; `admin/{ManagementController,JobModerationController}.java`, `admin/service/ManagementService.java` dưới root Java. Không sửa Đại `AccountAdminController/TutorModerationController`, reports/dashboard hoặc shared sidebar trực tiếp.
- **Phạm vi:** 3 management tabs, user operations consume Đại API; own offering/admin controls, order linked read/action hợp lệ; tutor/job review persist/notifications/audit. Không arbitrary PATCH status hay delete financial records; không bổ sung payout BS.
- **IO:** A02 admin account/profile, A04 offering, A05 order → A10 management/job moderation DTO/filters; sidebar patch giao Đại SHARED-UI-01.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-PROFILE-01, BB05-DATA-01, MATCHING-01, BB07-01; tabs không cần chờ hoàn PayOS để dựng shell.
- **Nghiệm thu:** non-admin403, stale409/duplicate, account state persists, disabled offering public query excludes, order read link correct; moderation success not sessionStorage only; audit masks sensitive data.

### BB13-01 — Trang quản lý gia sư, 5 U, thấp

- **Mã/kết quả:** BB13; own offerings/groups/orders, revenue tab host.
- **Chính/review:** Huy; Đại public gate/stats, Đạt UI clarity.
- **Mới đề xuất:** `ui-prototype/pages/tutor/manage.html`, `js/pages/tutor/manage.js`, `css/pages/tutor/manage.css`; `tutor/TutorManagementController.java`, `catalog/controller/OfferingManagementController.java` dưới root Java. Hiện có tutor-detail contract pages do Huy TC02 điều phối; không sửa my-profile của Đạt.
- **Phạm vi:** CRUD own offering/class, close registration, order lists consume BB07 query, mount stats module Đại; response rules approval/version/capacity. Không profile personal/account, aggregate SQL hoặc withdrawing funds.
- **IO:** A04 write/detail + A05 own order + A11 chart module → usable tutor/manage tabs; slot stats phát hành sớm cho STATS-01 không tạo dependency cycle.
- **Phụ thuộc:** SHARED-PROFILE-01, BB05-DATA-01, BB07-01, SHARED-UI-01; chart nối sau STATS-01.
- **Nghiệm thu:** other tutor403, pending cannot publish, schedule/capacity constraint, orders only own, edited price không đổi old order snapshot; released/held/planned labels rõ.

### TC02-01 — Sự kiện trạng thái và release ledger, 5 U, thấp

- **Mã/kết quả:** TC02; legitimate events đồng bộ order/contract/payment, output revenue/completed eligibility.
- **Chính/review:** Huy; Đại ledger/statistics/authorization, Đạt history states.
- **Hiện có:** `ui-prototype/pages/contract/{student-detail,tutor-detail}.html`, JS/CSS tương ứng. **Mới đề xuất:** `order/service/OrderTransitionService.java`, `contract/ContractEventController.java`, `wallet/ReleaseService.java` dưới root Java; shared enums Huy điều phối.
- **Phạm vi:** allowed event/action/version/idempotency, manual basic confirm/complete/release và relation status, UI current state/retry/timeline. Không tự động scheduler BS, sửa history page của Đạt, payout bank withdrawal hay chart.
- **IO:** Q03/Q04 + verified payment A06 → A05 event responses/allowedActions + A07 released ledger entries; Đại REVIEW/STATS đọc đầu ra.
- **Phụ thuộc:** MATCHING-01, BB07-01, BB08-01, SHARED-COMMERCE-01; Q03/Q04 bắt buộc trước test release semantics.
- **Nghiệm thu:** transition valid, wrong role/unpaid/stale/duplicate409, cross-session latest state; release once with balanced gross=tutorNet+fee, held giảm đúng; no UI state is authority.

### TC03-01 — Hủy đơn, hoàn tiền và thông báo, 8 U, thấp

- **Mã/kết quả:** TC03; biết refund dự kiến/actual status và tránh double credit.
- **Chính/review:** Huy; Đại financial invariants/report integration, Đạt history host.
- **Mới đề xuất:** `order/{CancellationController,CancellationService}.java`, `payment/service/RefundService.java`, `payment/entity/Refund.java` dưới root Java; `ui-prototype/js/core/order-cancellation.js`, `components/domain/order/cancellation-form.html`. Host student-detail do Huy, order/history do Đạt; giao patch cho Đạt, không cùng ghi history.
- **Phạm vi:** cancellation eligibility/refund quote, request/approval state, retry/idempotent ledger refund, seat release, notification; eligible admin approved consequence input. Không report decision rules hay payout withdrawal; chưa chốt Q05 thì chỉ dựng DTO/UI fixture đề xuất, không hard-code formula.
- **IO:** Q05/Q06 + order/payment/release data → A07 cancel/refund DTO/status/module; REPORT-01 emit financial request, Huy quyết định transaction một lần.
- **Phụ thuộc:** BB07-01, BB08-01, TC02-01; history mount sau BB09-UI-01 shell. Không cần chờ REPORT-01 để triển khai hủy đơn chủ động.
- **Nghiệm thu:** unpaid/paid/partial release/double cancel; refund fail/retry/no duplicate; concurrent release/late webhook/cancellation; refund<=actual held refundable, notify persists, group seat exactly once released.

## 5. Phần việc của Đạt

**Bắt đầu:** đọc A01/A02/A03/A04/A05 tại 04; nhận fixture DTO đã freeze từ Đại/Huy và dựng BB05-UI-01, BB09-UI-01, TC01-UI-01. Có thể làm bố cục với dữ liệu thử theo contract khi server chưa xong; phải hiển thị rõ chưa tích hợp. Không viết auth security, SQL filter, tiền hoặc state machine. Là điều phối viên search/profile/history UI; nhận patch của Đại/Huy và ghép lần lượt.

### BB03-UI-01 — Logout client, 2 U, vừa

- **Mã/kết quả:** BB03; cùng một logout behavior cho ba role.
- **Chính/review:** Đạt; Đại A01/security, Huy role regression.
- **Hiện có:** `ui-prototype/js/core/user-header.js`, `admin-header.js`, `components/layout/{user-header,admin-header}.html`; các host HTML có admin logout link nhận patch từ chủ trang. Core/layout Đại điều phối, cấp lượt chỉnh riêng cho Đạt sau SHARED-UI-01. New production mirrors theo quy ước.
- **Phạm vi:** consume logout API/session clear/redirect/error/disabled; remove toast mock logout ở search/profile khi áp các gói đó. Không server invalidation/CSRF design.
- **IO:** A01 session/logout → UI logged-out state; header slot/route contracts cho TC10/cart/history.
- **Phụ thuộc:** SHARED-AUTH-01, SHARED-UI-01; nối admin HTML bởi Huy sau module phát hành.
- **Nghiệm thu:** learner/tutor/admin, lặp/mạng lỗi/401, bfcache sensitive state; Đại xác nhận session cũ401 qua API test.

### BB05-UI-01 — Chi tiết offering dùng chung, 5 U, vừa

- **Mã/kết quả:** BB05 phần Đạt; details đủ và lựa chọn giữ ID tới cart/mời.
- **Chính/review:** Đạt; Huy điều phối nghiệm thu BB05/data, Đại UI/public gate.
- **Hiện có:** `ui-prototype/pages/tutor/profile.html`, `js/pages/tutor/profile.js`, `css/pages/tutor/profile.css`. **Mới đề xuất:** `pages/catalog/detail.html`, `js/pages/catalog/detail.js`, `css/pages/catalog/detail.css`; JSP/mirrors. Profile file Đạt điều phối, Đại review/report patch áp sau skeleton.
- **Phạm vi:** render A04 type-specific fields/sessions/terms/schedule/capacity, correct ID links/CTA/state/loading/errors/404; không tính eligibility/price hay seat reservation trên client.
- **IO:** A04 detail + A05 cart/source identifiers → view/CTA; TC09 nối list mới ở profile sau.
- **Phụ thuộc:** SHARED-UI-01, BB05-DATA-01 (DTO freeze đủ để UI bắt đầu), SHARED-AUTH-01 cho action.
- **Nghiệm thu:** 2 offering types + 3 channel actions, invalid/unpublished/full/closed states; selected item survives navigation, dynamic input safe, server409 explained.

### BB09-UI-01 — Lịch sử đơn và chi tiết, 4 U, vừa

- **Mã/kết quả:** BB09; xem đơn sở hữu, contract/payment rõ.
- **Chính/review:** Đạt; Huy A05 ownership/states, Đại UI accessibility.
- **Mới đề xuất:** `ui-prototype/pages/order/history.html`, `js/pages/order/history.js`, `css/pages/order/history.css`. Hiện có student-detail order summary patch nhận từ Huy TC02; wallet markup Huy quản lý, Đạt không edit song song.
- **Phạm vi:** list/page/date/status/channel filters theo API, drawer pending no-contract, contract/transaction link, load/error/empty; cancellation/review/report modules chỉ mount, không tự triển khai nghiệp vụ.
- **IO:** A05 read + A06/A07 financial state → history shell slots cancel/review/report, navigation patch giao Đại/Đạt header lượt tiếp theo.
- **Phụ thuộc:** BB07-01 read DTO + SHARED-UI-01; payment detail nối sau BB08-01; form modules TC03/REVIEW/REPORT nối sau module ready.
- **Nghiệm thu:** own3channels, pending/unpaid/paid/cancelled/completed, missing contract ID, 401/403/404/empty/network; never use wallet records as order truth.

### TC01-UI-01 — Hai trang profile, 4 U, vừa

- **Mã/kết quả:** TC01; người học/tutor save và reload dữ liệu thật.
- **Chính/review:** Đạt; Đại A02/reapproval, Huy gate/cross-role.
- **Hiện có:** `ui-prototype/pages/account/profile.html`, `js/pages/account/profile.js`, `css/pages/account/profile.css`; `pages/tutor/my-profile.html`, `js/pages/tutor/my-profile.js`, `css/pages/tutor/my-profile.css`; mirrors mới.
- **Phạm vi:** GET/PATCH self, validation/version/errors/reload, subjects/rates/slots/upload UX, pending/rejected UI do server; không credential change policy/storage/security, không offering CRUD.
- **IO:** A02 editableFields/version/profileStatus → persistent screen; critical-change explanation and submitReview outcome.
- **Phụ thuộc:** SHARED-PROFILE-01, SHARED-AUTH-01, SHARED-UI-01; form UI dựng trước với approved DTO.
- **Nghiệm thu:** save/reload/cancel, invalid field400/version409/upload403/413, server profile gate; state URL không tự cấp verified; account email/rate changes follow server.

### TC08-UI-01 — Search UI và áp bộ lọc, 2 U, vừa

- **Mã/kết quả:** TC08 chính; hỗ trợ mount TC06 Đại, không cộng lượt TC06 cho Đạt.
- **Chính/review:** Đạt; Đại query/filter, Huy offering links.
- **Hiện có:** `ui-prototype/pages/tutor/search.html`, `js/pages/tutor/search.js`, `css/pages/tutor/search.css`; Đại chỉ giao filter patch, không edit cùng lúc.
- **Phạm vi:** replace DOM fixtures/count128 bằng A03/A04, q/public tutor/result page, catalog tab/filters patch, error/no results/last-response handling. Sort consumer riêng TC07 nối sau; không SQL/public gate logic client.
- **IO:** query DTO + filter patch from SHARED-CATALOG-01 → search/catalog shell and state contract for TC07; output links A04 detail.
- **Phụ thuộc:** SHARED-CATALOG-01, SHARED-UI-01, BB05-UI-01 destination; bộ lọc có thể mount trước detail hoàn chỉnh nếu href contract frozen.
- **Nghiệm thu:** name/specialty accent, empty/error/network, multiple criteria, page totals reflect server, stale request ignored; server-approved only confirmed by Đại API tests.

### TC07-UI-01 — Sort kết hợp query/page, 2 U, vừa

- **Mã/kết quả:** TC07; sort hiện đúng theo dữ liệu máy chủ.
- **Chính/review:** Đạt; Đại query allowlist, Huy price semantics.
- **Hiện có:** cùng ba search files TC08, sửa **sau TC08-UI-01**, không tách nhánh song song cùng file.
- **Phạm vi:** sort price asc/desc/rating/newest, preserve filters/reset page/URL state, empty/error; không own backend sort/copy catalog query.
- **IO:** A03/A04 sort fields/time unit → consumer and documented options; all request params stable.
- **Phụ thuộc:** SHARED-CATALOG-01, TC08-UI-01.
- **Nghiệm thu:**4 sorts+filters/page, tie-break from server, newest publishedAt, invalid sort handling và repeated selection không nhân listener.

### TC09-UI-01 — Offering list trong tutor profile, 2 U, vừa

- **Mã/kết quả:** TC09; dịch vụ/lớp của tutor dẫn đúng detail.
- **Chính/review:** Đạt; Huy data, Đại query/public review rendering.
- **Hiện có:** cùng profile HTML/JS/CSS BB05; nối **sau BB05-UI-01**. REVIEW-01/REPORT-01 section patch Đại giao được Đạt áp theo lịch ở 04.
- **Phạm vi:** active offerings by tutor list/tab, type/status/fee link, empty/loading/error, public review list consumption; không tạo Offering entity/query backend hay write reviews.
- **IO:** A04 by-tutor/list + BB05 detail route → public storefront with register CTA; Đạt phát slots cho review/report.
- **Phụ thuộc:** SHARED-CATALOG-01, BB05-DATA-01, BB05-UI-01; review write module không chặn basic list.
- **Nghiệm thu:** đúng tutor, active published, no offerings, eachID detail/cart source valid; closed/full recognized; no own mock copied into profile.

### TC10-UI-01 — Home latest, 3 U, vừa

- **Mã/kết quả:** TC10; approved/open newest items ở homepage.
- **Chính/review:** Đạt; Đại latest query/navigation, Huy offering eligibility.
- **Mới đề xuất:** `ui-prototype/pages/home.html`, `js/pages/home.js`, `css/pages/home.css`; JSP/mirrors. Hiện có brand/header đổi patch qua lượt SHARED-UI/BB03, không Đạt cùng Huy edit layout.
- **Phạm vi:** latest feed render/limit/card detail, empty/error/loading, public brand→home; không viết latest query/date logic hay dùng draft createdAt giả newest.
- **IO:** A04 `sort=newest`/publication DTO, Q10 → home and nav patch; protected role entry vẫn đúng.
- **Phụ thuộc:** SHARED-CATALOG-01, BB05-UI-01, SHARED-UI-01; header patch sau BB03-UI-01.
- **Nghiệm thu:** publishedAt order, closed/full/draft removed server, no-data/error clear, signed-in/public detail links usable, UI không tự approved.

## 6. Việc đã có, phạm vi giữ lại và tự kiểm tra phân công

- Nghiệm thu lại layouts, query invalid-ID feedback, local moderation guards K03; không giao vẽ lại toàn 31 trang hoặc tạo lại component đang có. Những việc đó nằm acceptance của gói tương ứng, không gói “chức năng thứ 24”.
- BS01–BS09 không được giao triển khai; mẫu chat/withdrawal/automation giữ nguyên. Basic balance/payment, capacity, states và cancellation/refund vẫn được giao BB08/MATCHING/TC02/TC03.
- 29 gói có owner, review, files, scope/exclusions, IO, dependency và acceptance. Chỉ 3 người; 23 mã đủ, 24 lượt, mỗi người8. Shared auth/profile/catalog/UI/migration công một lần.
- Migration/Application config/PageController/API client: Đại điều phối. Order–contract–payment–wallet enums/DTO/entities: Huy. Search/profile/history UI: Đạt. Shared file collision và việc nối module được khóa thứ tự trong báo cáo04, chưa refactor trong audit.
- Chốt lại U sau schema/API và một luồng test cô lập; chênh lệch3 U Đại–Huy là dự báo có sai số, không che khối lượng bằng số mã. Không tự đặt ngày hoàn thành khi chưa có lịch nhóm.
