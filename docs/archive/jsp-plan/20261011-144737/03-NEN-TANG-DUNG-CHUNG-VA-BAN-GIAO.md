# Nền dùng chung và bàn giao JSP

Snapshot và định nghĩa A/B/C/D theo báo cáo 01–02. Cấu trúc dưới đây là đề xuất cho lần triển khai sau; audit không tạo file ứng dụng. Đại = Nguyễn Xuân Đại; Huy = Tạ Văn Huy; Đạt = Nguyễn Khắc Trường Đạt.

## 1. Phương án tối thiểu phù hợp repository

Giữ Spring Boot 3.5.16 + Spring MVC + executable WAR/Tomcat Jakarta, chờ giảng viên xác nhận Q01. Không đổi Servlet thuần trong giai đoạn này. Views ở `src/main/webapp/WEB-INF/views/`, tài nguyên ở `src/main/resources/static/` phù hợp WAR đã build và mapping dự kiến của repo (`pom.xml:17,59–75`; `docs/architecture/README.md:10–17`). Hai thư mục hiện chỉ là placeholder, chưa phải cấu trúc chạy đúng.

Đề xuất:

```text
src/main/webapp/WEB-INF/views/
  auth/*.jsp
  account/*.jsp
  tutor/*.jsp
  catalog/detail.jsp
  cart/index.jsp
  order/history.jsp
  admin/*.jsp
  contract/*.jsp
  payment/*.jsp
  wallet/overview.jsp
  home.jsp
  fragments/
    common/head.jspf
    common/scripts.jspf
    layout/auth-start.jspf, auth-end.jspf
    layout/user-start.jspf, user-end.jspf
    layout/admin-start.jspf, admin-end.jspf
    layout/user-header.jspf, user-footer.jspf, account-footer.jspf
    layout/admin-header.jspf, admin-sidebar.jspf
    form/, navigation/, feedback/, action/, data-display/, domain/
    domain/review/, domain/report/, domain/order/
src/main/resources/static/
  css/{tokens,reset,base,utilities,layouts}.css
  css/components/...
  css/pages/...
  js/core/...
  js/pages/...
  assets/{brand,icons,documents}/...
```

Chat/invitation/job/payout/audit-log đích chỉ reserve theo ma trận khi phạm vi được duyệt; không tự tạo đủ chúng chỉ vì sơ đồ. Fragments module review/report/order là đầu ra đề xuất cần tách từ các trang, không giả định đã tồn tại.

Đại quản lý `src/main/java/com/educonnect/config/PageViewController.java` đề xuất (mapping tập trung) và `PageModelAdvice.java` đề xuất (model dùng chung). Tầng nghiệp vụ/API thuộc package feature, không đưa logic nghiệp vụ vào controller chung (`docs/conventions/coding-convention.md:17–19`). Không thêm framework layout/tag phức tạp trước khi trang mẫu chứng minh được includes đơn giản.

## 2. Hợp đồng layout

| Hợp đồng | Quy ước bàn giao |
| --- | --- |
| Title/head | `pageTitle` plain text escape; `pageKey` duy nhất; `layoutKind` auth/user/admin/payment-minimal; head.jspf nạp meta UTF-8, viewport, favicon và CSS nền đúng một lần |
| Vùng nội dung | Page mở fragment start, đặt main content đúng container hiện tại, kết thúc fragment end. Giữ ID/data-hook từ R-Pxx, không copy lại header/sidebar/footer |
| CSS trang | Danh sách pageStyles do controller/registry allowlist, không lấy tên đường dẫn từ query người dùng. CSS component chọn theo trang; CSS riêng nạp cuối |
| Script riêng | Danh sách pageScripts/coreScripts allowlist; page cuối cùng. Fragments markup không có script tag tự nạp |
| Navigation | active `pageKey`, mục cha cho trang detail; không suy từ tên `.html` (`ui-prototype/js/core/admin-sidebar.js:46–65`) |
| Người dùng | `currentUser` DTO tối thiểu id/displayName/role/avatarUrl hoặc null; không truyền password/token/session secret |
| State | `pageState=ready/empty/error/forbidden`; message, fieldErrors; không giả định placeholder có dữ liệu thật |
| Layout auth | Dùng auth shell/body class có sẵn; mỗi trang auth không nhất thiết nạp script tabs auth-shell nếu không có data-component tương ứng |
| QR | Giữ payment-minimal của P34; không ép full user header vào trang QR nếu không có trong source |

Các shell hiện inline trong page, không đang được fetch. Chuyển sang server include phải thay đúng vùng inline, tránh cả fragment và shell cũ cùng xuất hiện. Evidence: `ui-prototype/pages/home.html:23–28`, `ui-prototype/js/core/admin-sidebar.js:2–4`, bảng R-Pxx.

Chọn include tĩnh cho fragment thuần markup dùng model chung; dùng `jsp:include` với đường allowlist cố định khi thực sự cần include động. Không dùng query làm tên include. Mỗi fragment tái sử dụng form/modal phải có ID prefix/instanceId do page cung cấp để tránh ID trùng. Fragment start/end cần giữ thẻ đóng/mở cân bằng; review HTML sau render, không chỉ inspect source JSP.

## 3. URL, encoding, escape và init

- JSP dùng `c:url` cho href/src/action và `c:param` cho query; href trả về đã gồm context path. Controller redirect dùng đường nội bộ cố định/allowlist, không nhận return URL tùy ý.
- JS giữ interface `EduRoute.page/go/asset/safeReturn` hiện có nhưng thay registry paths từ `pages/*.html` sang HTTP route ma trận. Base path lấy từ giá trị context path đã encode tại layout; không suy gốc từ độ sâu URL. Prototype resolver hiện suy từ scriptSrc và HTML path (`ui-prototype/js/core/route.js:61–78,134–173`).
- Đừng dùng normalize href/src để xử lý form action: `ui-prototype/js/core/route.js:98` chỉ liệt kê href/src. Chuyển action của home tìm kiếm tại `ui-prototype/pages/home.html:99` sang /tutor/search; các form khác cần POST/API rõ ràng trước C.
- Mọi JSP có pageEncoding UTF-8 và contentType text/html;charset=UTF-8; response/request encoding force UTF-8 trong config do Đại tích hợp. JSTL Jakarta tương ứng dependency hiện có; dùng URI Jakarta, không thêm taglib/dependency javax.
- EL tự nó không phải cam kết escape. Dùng `c:out` cho text/attribute phù hợp, textContent cho DOM. JSON không chèn thẳng vào script bằng nối chuỗi/EL; ưu tiên endpoint JSON hoặc serializer với escaping đúng ngữ cảnh.
- Bộ mẫu có `innerHTML` để clone template tĩnh (`ui-prototype/js/pages/home.js:41`); phải rà lại nơi đưa dữ liệu API vào. Không giữ template string chứa nội dung người dùng chưa escape.
- Script defer thứ tự: URL/config → client/session hoặc preview adapter → charts nếu dùng → core components → business module → page module. Fixture → store chỉ trong profile preview, không production.
- Với server include, toàn bộ DOM đã có khi defer chạy. Mỗi init nhận root và có guard per-root/WeakSet; mỗi event listener global đăng ký một lần. `ui-prototype/js/core/tabs.js:4–5` đã có guard; `ui-prototype/js/core/select.js:46–59,88`, `ui-prototype/js/core/auth-shell.js:19–28` chưa có guard tương đương. `DOMContentLoaded {once:true}` không ngăn hai bản script cùng đăng ký.
- QR timer được dọn qua pagehide (`ui-prototype/js/pages/payment/qr.js:180–182`); sau include đảm bảo không tạo hai interval.

Quy ước prefix/suffix/encoding nằm trong thuộc tính Boot 3.5. Không cần thêm dependency JSP mới khi WAR hiện chứa Jasper/JSTL; giữ quản lý version từ parent. [Application properties chính thức](https://docs.spring.io/spring-boot/3.5/appendix/application-properties/index.html). Với static classpath và MVC mặc định, không thêm `@EnableWebMvc`. [Boot MVC/static support](https://docs.spring.io/spring-boot/3.5/reference/web/servlet.html).

## 4. Model/DTO và phân biệt trang với API

`GET /catalog/detail?id=...` trả view `catalog/detail`; `GET /api/offerings/{id}` trả JSON. Hai đường đều **chưa có**; Đại tích hợp mapping view, Huy cung cấp hợp đồng dữ liệu BB05, Đạt dùng hợp đồng để dựng UI. Không có handler vừa trả view name vừa được gắn RestController.

| Payload tối thiểu đề xuất | Nội dung và người cung cấp |
| --- | --- |
| OfferingDetailDTO — Huy | id/type/status/tutorId/title/subject/grade/mode/price/currency/sessions/duration/availability/termsVersion/allowedActions; không nhận giá tin cậy từ query |
| TutorSummary/ProfileDTO — Huy phối hợp Đạt | id/displayName/verified/publicFields/offerings; reviews/rating do Đại định nghĩa module |
| CartDTO / OrderSummaryDTO — Huy | items snapshot, seats, totals/currency, status, paymentStatus, allowedActions; totals server tính lại |
| PaymentResultDTO — Huy | id/orderId/status/verifiedAt/amount/expiresAt/displayResult; query status chỉ tham số hiển thị, không là bằng chứng tiền |
| HistoryPageDTO — Huy → Đạt | items, page/size/total, status/channel filters, selectedOrder, empty/error |
| ProfileDTO — chủ nghiệp vụ TC01 Đạt, nền auth Đại | public/editable fields, fieldErrors; server lấy principal, không lấy ownerId tùy ý |
| ReviewDTO / ReportDTO — Đại | eligibility/unique-per-order; report targetType/targetId/reason/evidenceMeta/resolution/timeline/allowedActions |
| StatisticsDTO — Đại, Huy cấp dữ liệu tiền | from/to/metric/currency/rows/total/slices/timezone; xác định release thực, không trộn tiền ký quỹ với doanh thu |
| PageResult/error | items/page/size/total + code/message/fieldErrors; ID không có trả 404/empty; không quyền 403; chưa auth 401/redirect login; lỗi mạng cho retry |

Định dạng ID lấy từ backend, không bê nguyên prefix demo thành schema production. Route/query giữ các tên đang dùng trong R-Pxx; đặc biệt `contract/order/payment` là loại ID khác nhau. `from` tiếp tục allowlist (`ui-prototype/js/core/route.js:59,157–159`). Sort/filter query phải validate server; sort column không dùng trực tiếp chuỗi client.

**API client/session hiện có**: chỉ có EduStore và persona/storage. `ui-prototype/js/data/store.js:269,282–309` mặc định persona khi thiếu session và login theo email/demo ID. Không có auth thật/API client để “nối lại”. Đại tạo client/session production nhỏ, chốt error/CSRF/base URL; chủ trang thay call-site sang domain adapter. Huy/Đạt có thể dựng A với DTO fixture mẫu đã đánh nhãn preview; không copy EduStore thành database/browser auth production.

Nếu chọn form POST, server validation/fieldErrors và PRG sau thành công; nếu chọn fetch JSON, submit một lần, xử lý HTTP status/fieldErrors và idempotency. Chốt một kiểu cho từng action, không để form + listener cùng gửi hai request.

## 5. Nền auth và quyền còn thiếu

Có starter-security nhưng chưa có security config/auth service (`pom.xml:35–38`; Java inventory báo cáo 01). Đại chịu trách nhiệm tích hợp `src/main/java/com/educonnect/security/SecurityConfig.java` đề xuất và model currentUser. Chủ nghiệp vụ chịu validation/ownership ở service/API; UI role gate không là phân quyền server.

Khuyến nghị production: session cookie server; logout POST có CSRF và invalidate session; giữ CSRF cho mutation. Không tin personaId/sessionStorage. Không dùng mật khẩu/token làm page model hoặc log. Quyền: khách chỉ public catalogue/auth; learner chỉ cart/orders/contracts của mình; tutor chỉ offerings/orders/contracts của mình; admin phải role được xác minh. Đây là điều kiện C, không phải lý do trì hoãn mọi A.

Preview local để chứng minh JSP: cấu hình mới `src/main/resources/application-ui-preview.yml` chỉ trong đợt triển khai, loại auto-config datasource/JPA/Flyway, không có endpoint mutation thật; security cho phép các GET preview được allowlist và assets, không tắt security toàn ứng dụng. Không chạy migration/email/payment. Production boot riêng chờ DB local/service thật được xác nhận. Các class auto-config phải lấy đúng từ phiên bản 3.5.16.

## 6. File dùng chung và một người tích hợp

| File/nhóm production đề xuất | Người sửa/tích hợp | Người bàn giao yêu cầu |
| --- | --- | --- |
| `pom.xml`, `application.yml`, `application-ui-preview.yml`, application/initializer nếu chọn external WAR | Đại | Huy review container/DB; không đổi dependency khi chưa cần |
| `config/PageViewController.java`, `config/PageModelAdvice.java` | Đại | Huy/Đạt gửi pageKey/GET/query/view/model/redirect; không sửa controller chung song song |
| `security/SecurityConfig.java`, client/session core | Đại | Huy DTO ownership/mutation; Đạt UI login/logout/error |
| `WEB-INF/views/fragments/**`, static CSS nền/components/core JS/assets | Đại | Chủ trang gửi hook/markup/state/asset usage; bảng đủ file ở báo cáo 02 |
| `static/css/pages/contract/contract-detail.css` | Đại tích hợp | Huy gửi delta hai trang |
| Business module review/report/filter/charts | Đại | Huy/Đạt cấp anchor/DTO; Đại bàn giao module độc lập |
| Business module cancel/order-status | Huy chuẩn bị → Đại tích hợp file module/fragments chung | Đạt chỉ tích hợp module vào history; không sửa logic tiền |
| JSP và JS/CSS riêng trang | Chủ trang ma trận | Gửi Đại manifest mapping; review bởi hỗ trợ ghi trong nhiệm vụ |

Sau chuyển, source production duy nhất của mỗi page là JSP + static JS/CSS tương ứng; prototype giữ làm reference, không sửa hai bản chạy song song. Data production duy nhất là service/API; profile preview fixture tách rõ. Chưa đưa legacy *.html aliases lên production; nếu cần link cũ, Đại chốt redirect allowlist Q08.

Gói bàn giao Huy/Đạt gửi Đại: pageKey/Pxx; JSP/view name; query params/validation; model schema + mẫu ready/empty/error; JS/CSS manifest và thứ tự; href/action/redirect delta; component hooks/ID prefix; role/ownership; endpoint/error contract; thao tác kiểm và kết quả. Bàn giao module phải có init(root, options), dependencies/events, state/error contract và một page tích hợp mẫu.

## 7. Trang mẫu và các đợt

Chọn **P13 auth/forgot-password**, nguồn `ui-prototype/pages/auth/forgot-password.html:58,86–87`, JS `ui-prototype/js/pages/auth/forgot-password.js:1–16,63–66`: không phụ thuộc Store, không xử lý tiền, DOM nhỏ. Đại làm JSP-DAI-04. Chuỗi nghiệm thu:
GET /auth/forgot-password → PageViewController.authForgotPassword → view auth/forgot-password → auth layout/head/scripts → CSS/JS static → validation/loading/message JS một lần.
Form hiện mô phỏng nên trang mẫu A không tuyên bố gửi email hoặc BB04 C xong.

| Đợt | Điều kiện bắt đầu | Công việc / đầu ra / người nhận | Điều kiện kết thúc |
| --- | --- | --- | --- |
| 1. Chốt cấu trúc/chạy | Snapshot báo cáo; Q01/Q03/Q04 được quyết định | Đại + Huy review: WAR run mode, preview an toàn, resolver/UTF-8, registry/model/session contract → cả nhóm | Package pass; app preview boot có log an toàn; chưa cần backend thật |
| 2. Nền + mẫu | Đợt 1 sẵn sàng | Đại: layout/core/assets/client boundary + P13 → Huy/Đạt | P13 route/refresh/context path/UTF-8/JS không lỗi; không double init; contract freeze |
| 3. Trang riêng | Mẫu/contract đã chốt; DTO mẫu tối thiểu | Ba người chuyển A/D theo task; Đại cấp charts/review/report/filter, Huy cấp BB05/order contracts → chủ trang | Mỗi page có JSP/manifest/ready-empty-error + demo rõ ràng; C chỉ page có backend đã sẵn sàng |
| 4. Navigation/module/toàn bộ | Các page handoff; C endpoints nào sẵn thì nối | Đại tích hợp shared/mapping; Huy kiểm giao dịch; Đạt kiểm user routes → cả nhóm | Checklist báo cáo 05; ghi riêng pass A/D/C; outside-scope HOLD hoặc menu được chốt |

**Làm trước backend**: Huy chuẩn hóa DTO/status/error examples, chuyển cart/payment/seller/admin UI, giữ sandbox placeholder; Đạt chuyển home/profile/search/detail/history layout và state bằng DTO mẫu, bảo toàn data hooks, chuẩn bị query/link manifest. **Chờ**: auth server/CSRF, read/write DB, giá/tổng thật, payment webhook/refund, xác thực email, permission thực và policy phí/hoàn tiền. Không lấy thời gian làm backend vào ước lượng JSP.


