# Kiểm thử, rủi ro và điểm cần chốt

Snapshot: audit 11/10/2026 14:47:37 UTC+07; branch `feature/ui-dai-auth`; HEAD `e12fb53937edaa60121229d60a8ff42a870e06ab`. Kết quả build/static/store đã chạy nằm ở01. Báo cáo này là checklist cho triển khai, không phải kết quả browser/JSP runtime.

## 1. Kiểm đã chạy và giới hạn

| Đã chạy | Kết quả thật | Không được suy ra |
| --- | --- | --- |
| Offline Maven package | Pass; JDK21 compile release17; executable WAR chứa Jasper/JSTL Jakarta | Không chứng minh boot, HTTP view hoặc backend |
| static-check | 40 page; 65 JS syntax; 46 CSS url/96 CSS; FAIL0 | Không chứng minh mọi JS dynamic URL/action/redirect/JSP include/context path |
| store-check | 583 pass/0fail trong VM cô lập | Không database/auth/transaction/refund thật |
| hook-check/source-check | FAIL0; nguồn/selector mẫu theo giới hạn script | Không event bind đúng một lần trong browser; payment/checkout 0hook ở checker không là full coverage |
| File inventory/codegraph/git | Đủ source hiện tại; không uncommitted/app untracked trước audit | Không lấy báo cáo UI cũ làm xác nhận runtime mới |

Chưa khởi động Spring: repo chưa có datasource/profile local cô lập (`src/main/resources/application.yml:1–6`), JPA/Flyway có trong POM (`pom.xml:39–57`), chưa xác nhận DB an toàn. Không có controller/JSP để smoke route. Chưa chạy browser/responsive/context khác root. Không chạy migration, mail/gateway/refund thật. Không viết test mới. Java test directory chỉ .gitkeep; Maven test phase không có test nghiệp vụ.

Maven lần đầu có lỗi quoting đối số do audit; lần sau validate/package thành công. Launcher in “Access is denied.” nhưng goal vẫn exit0; không gán nó thành lỗi ứng dụng. Chi tiết lệnh/log rút gọn ở01.

## 2. Checklist dùng cho mỗi route thuộc phạm vi

- [ ] Package/compile pass, WAR đúng JSP/asset/dependency; boot profile đã xác nhận an toàn; ghi riêng pass hai mức.
- [ ] HTTP route GET trực tiếp, refresh, deep link, bookmark; view name/model đúng; không truy cập trực tiếp WEB-INF/JSP.
- [ ] Navigation/brand/breadcrumb/sidebar active theo pageKey; back/forward; query encode/validate; ID lạ không fallback.
- [ ] Form action/method và redirect rõ; Enter/click chỉ gửi một request; browser không vô tình GET dữ liệu form khi JS lỗi.
- [ ] Network không404 CSS/JS/icon/favicon; CSS url() hoạt động sau copy; Console không lỗi; DOM hooks/component/ARIA/ID đủ.
- [ ] Một shell/header/sidebar/footer; core/page/module scripts mỗi file một lần; không hai modal handlers, hai observer/timer/listeners.
- [ ] UTF-8/tiếng Việt; auth/user/admin/payment-minimal layout; desktop/mobile 64rem/48rem; keyboard/modal focus và bảng cuộn.
- [ ] Context path root và /educonnect nếu môi trường hỗ trợ; href/src/action/JS redirect giữ query/hash đúng.
- [ ] Ready/loading/empty/not-found/error/forbidden; lỗi API/timeout/retry; DTO escape; không hiện fixture fallback trong production.
- [ ] Khi C auth có: anonymous401/login redirect, forbidden403, session invalidate/logoutPOST+CSRF; kiểm user/tutor/admin.
- [ ] Khi C nghiệp vụ có: ownership server, validation/allowed transition, idempotency, snapshot giá, refund vs cancellation, backend-verified payment.
- [ ] Ghi trạng thái **A/D/C riêng** và nguyên nhân blocked; screenshot/demo không thay kiểm mutation/persistence thật.

Bốn script ở `scripts/checks/` có thể chạy hồi quy prototype sau này, nhưng phạm vi đọc vẫn dưới ui-prototype. Không ghi “JSP test pass” từ các script này. Giai đoạn triển khai cần chạy/check phù hợp HTML render và endpoints (test mới chỉ khi triển khai, không trong audit).

## 3. Checklist cụ thể theo Pxx/route

Mọi route bên dưới **đề xuất/chưa có**, chưa được mở kiểm trong audit. Các trang HOLD chỉ kiểm/menu navigation sau quyết định Q02/Q08, không giao backend hay tạo JSP mặc định.

| Mã | Route đề xuất | Query/action phải thử | Tình huống nghiệm thu riêng | Chủ kiểm | Hiện tại / kiểm sau |
| --- | --- | --- | --- | --- | --- |
| P01 | `/account/profile` | Không query nghiệp vụ; owner từ session | Hủy chỉnh sửa khôi phục dữ liệu; refresh đọc hồ sơ server khi C xong | Đạt; Đại: session | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P02 | `/admin/audit-logs` | module (HOLD) | Chỉ giữ mapping/menu; chưa triển khai nhật ký thật | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P03 | `/admin/dashboard` | from/to controls, hiện không contract query server | Khoảng ngày sai/empty; pie tổng khớp đơn; số tiền từ release đã xác nhận | Đại; Huy: DTO tiền/đơn | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P04 | `/admin/job-review-detail` | id | ID lạ không fallback; từ chối cần lý do; chỉ quyền admin khi C xong | Huy; Đại: quyền/layout | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P05 | `/admin/job-review-queue` | status | List/detail đồng bộ cùng DTO; giữ status/query; empty đúng | Huy; Đại: quyền/layout | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P06 | `/admin/manage` | tab=users\|offerings\|orders | Ba tab/query; server chặn role/transition sai; thao tác lặp không ghi hai lần | Huy; Đại: quyền/layout | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P07 | `/admin/payout-request-detail` | id (HOLD) | Giữ liên kết; không tạo hoặc xác nhận giao dịch thật | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P08 | `/admin/payout-requests` | status (HOLD) | Chỉ kiểm kê ảnh hưởng sidebar; chờ duyệt phạm vi | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P09 | `/admin/report-detail` | id | Một kết luận; lý do hợp lệ; ID/quyền/empty/error | Đại; Huy: đơn/quyền đối tượng | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P10 | `/admin/reports` | status, gồm unresolved | unresolved/query/paging; quay lại đồng bộ kết luận | Đại; Huy: DTO liên kết đơn | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P11 | `/admin/tutor-review-detail` | id | ID hồ sơ xác minh khác tutorId; tệp demo không coi là chứng chỉ thật | Huy; Đạt: hồ sơ; Đại: quyền | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P12 | `/admin/tutor-review-queue` | status | List/detail cùng nguồn; chỉ chuyển UI trong BB12 đã chốt | Huy; Đạt: hồ sơ; Đại: layout | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P13 | `/auth/forgot-password` | Không; email form | Trang mẫu: route/controller/JSP/auth layout/asset/JS; phản hồi không lộ tài khoản | Đại; Huy: review | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P14 | `/auth/login` | state allowlist, không dùng làm auth | Lỗi sai thông tin; redirect allowlist; session server khi C xong | Đại; Đạt: tích hợp logout | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P15 | `/auth/register` | Không; form fields | Validate server/client; trạng thái chờ xác minh; không gửi email thật khi test | Đại; Huy: review | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P16 | `/auth/reset-password` | token (không ghi giá trị vào log/báo cáo) | missing/unknown/expired/used/valid; token dùng một lần từ backend | Đại; Huy: review | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P17 | `/auth/verify-email` | token (không ghi giá trị) | Không hiển thị danh sách token production; mã hết hạn/đã dùng/quá hạn | Đại; Huy: review | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P18 | `/cart/index` | Không nhận giá/tổng từ query | Thêm/sửa/xóa/chỗ còn; server tính tổng; lỗi không mất giỏ | Huy; Đạt: BB05 nút giỏ | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P19 | `/catalog/detail` | id | ID sai/private/closed; SERVICE/GROUP_CLASS; UI nhận DTO của Huy | Đạt; Huy: dữ liệu BB05 | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P20 | `/chat/messages` | contract,tutor (HOLD) | Chỉ mapping/nav; không giao nghiệp vụ chat | Huy (mapping theo trang giao dịch); Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P21 | `/contract/confirm` | contract,order | contract/order cùng bản ghi; không coi xác nhận UI là chữ ký thật | Huy; Đại: report; Đạt: lịch sử | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P22 | `/contract/student-detail` | id | Tiền/đơn/refund khớp history; không tự giải ngân tính năng chưa duyệt | Huy; Đại: TC05 module | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P23 | `/contract/tutor-detail` | id | Phía tutor không đọc hợp đồng người khác; trạng thái thực từ server | Huy; Đại: quyền | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P24 | `/home` | q GET sang tutor/search | Mới nhất theo publishedAt/tie-break; tìm kiếm q; không dữ liệu | Đạt; Đại: layout/router | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P25 | `/invitation/create` | tutor,offering (HOLD) | Chỉ ghi phụ thuộc tutor/profile/catalog; chờ phạm vi lời mời | Huy; Đại: nav; Đạt: nguồn hồ sơ | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P26 | `/invitation/negotiation` | invite (HOLD) | Không mở rộng nghiệp vụ thương lượng chưa duyệt | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P27 | `/job/applicants` | id (HOLD) | Chỉ kiểm liên kết profile/contract; chờ phạm vi | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P28 | `/job/create` | draft preview (HOLD) | Không tính mở modal là tạo tin; chờ phạm vi | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P29 | `/job/detail` | id (HOLD) | ID sai/role/đường quay lại; chờ phạm vi | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P30 | `/job/discover` | filter client (HOLD) | Giữ nav Tin tìm gia sư; chờ phạm vi nghiệp vụ | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P31 | `/job/my-job` | owner từ session demo (HOLD) | Không giao phát triển đóng tin mới; chờ phạm vi | Huy; Đại: nav | Prototype static theo checker pass; JSP/runtime chưa kiểm; HOLD |
| P32 | `/order/history` | status,channel,id | status/channel/id; lịch sử chỉ của user; module tách trước khi C | Đạt; Huy: hủy/hoàn; Đại: đánh giá/báo cáo | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P33 | `/payment/checkout` | contract,from allowlist,order,payment | from allowlist; server tính tiền; double click có idempotency | Huy; Đại: quyền/session | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P34 | `/payment/qr` | contract,payment | Không hủy order khi hủy QR; timer một lần; lỗi/expired/cancelled | Huy; Đại: layout | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P35 | `/payment/result` | status,id,view legacy,payment | ?status=success không đổi ledger; success đọc trạng thái backend đã xác minh | Huy; Đạt: link history | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P36 | `/tutor/manage` | tab=services\|classes\|orders\|revenue; range controls | Bốn tab; offering policy; orders hiện chưa có control TC02; chart Đại bàn giao | Huy; Đại: biểu đồ | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P37 | `/tutor/my-profile` | #lich-ranh; state chỉ preview, không quyền production | Phần form/schedule dễ–trung bình; server state khi C; không tự đổi verified qua query | Đạt; Huy: DTO tutor; Đại: session | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P38 | `/tutor/profile` | id | ID gia sư; sản phẩm cùng tutor; review/report theo module Đại | Đạt; Đại: đánh giá/báo cáo; Huy: offering DTO | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P39 | `/tutor/search` | q + filter/sort/paging sau chốt schema | q/filter/sort cùng tập; điều kiện filter do Đại chốt; giữ query/paging | Đạt (chủ trang); Đại: TC06; Huy: query dữ liệu | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |
| P40 | `/wallet/overview` | #transactions | Số dư/ledger từ server; empty/error; không thêm rút tiền thật | Huy; Đại: quyền; Đạt: history | Prototype static theo checker pass; JSP/runtime chưa kiểm; checklist chung + A/D, C sau API |

## 4. Nguy cơ/xung đột và bằng chứng

| Rủi ro | Bằng chứng hiện tại | Ảnh hưởng / giảm rủi ro / người xử lý |
| --- | --- | --- |
| Có dependency nhưng chưa có JSP/controller | `pom.xml:59–75`; `src/main/java/com/educonnect/EduConnectApplication.java:6–11`; views inventory toàn .gitkeep | JSP-DAI-01, JSP-DAI-04 chứng minh đủ chuỗi; không đếm là đang chuyển |
| Boot có thể fail datasource | `pom.xml:39–57`, `src/main/resources/application.yml:1–6` | JSP-DAI-01 preview exclude DB auto-config hoặc DB local đã xác nhận; không chạy migration thử trên DB thật |
| Auth demo bị coi là server auth | `ui-prototype/js/data/store.js:269,282–309`; login chọn persona, fallback nếu chưa có session | JSP-DAI-03, JSP-DAI-10; JSP-DAT-06: session/CSRF/quyền thật. Không “sửa” bằng tin role client |
| Tiền/status client bị coi là thật | `ui-prototype/js/pages/payment/qr.js:184–207` mutate preview; `ui-prototype/js/pages/payment/result.js:3,10`; `ui-prototype/js/data/store.js:1149` cancel demo | JSP-HUY-08, JSP-HUY-11: sandbox/backend signature/ledger; không lấy query success làm xác nhận |
| Hai người sửa parent page | `ui-prototype/js/pages/order/history.js:459–531` chứa cả review/report/cancel; `ui-prototype/js/pages/tutor/profile.js:377–411,501`; `ui-prototype/js/pages/contract/student-detail.js:1,8` và submitReport | Đại bàn giao module, Huy bàn giao order actions; chủ page tự thay callbacks theo contract. Không chia file page JS cho nhiều người cùng edit |
| Header/sidebar/common CSS xung đột | `ui-prototype/js/core/admin-sidebar.js:2–4,46–65`; 23user/11admin copies | Đại integration duy nhất; Huy/Đạt chỉ gửi manifest/delta |
| Duplicate init sau include | `ui-prototype/js/core/auth-shell.js:19–28`, `ui-prototype/js/core/select.js:46–59,88`, `ui-prototype/js/core/user-header.js:306–337`; guard tabs riêng `ui-prototype/js/core/tabs.js:4–5` | JSP-DAI-02 per-root guards/script slot; DAT/HUY page accept verify số callbacks |
| Form/action không được router normalize | `ui-prototype/js/core/route.js:98` chỉ href/src; `home.html:99` HTML action | JSP-DAI-02, JSP-DAI-13 registry/context; JSP-DAT-01 đổi action GET; R-Pxx liệt kê mọi form |
| Route/header active vẫn suy .html | `ui-prototype/js/core/route.js:14–55,67–78`; `ui-prototype/js/core/admin-sidebar.js:46–65` | JSP-DAI-02 dùng pageKey; JSP-DAI-13 deep link/context |
| Nguồn data khác nhau | `ui-prototype/js/pages/admin/tutor-review-data.js:1–5,356–360`, `ui-prototype/js/pages/admin/payout-data.js:1–7,75`, `ui-prototype/js/pages/admin/report-data.js:2–5,24–25` | Huy chốt mapping review ID→tutor; Đại report; payout HOLD. Không suy tất cả entity liên thông thật |
| Profile/tin chỉ DOM hoặc draft | `ui-prototype/js/pages/account/profile.js:72–86`; `ui-prototype/js/pages/tutor/my-profile.js:12–13,116`; `ui-prototype/js/pages/job/create.js:14,45,170–172` | JSP-DAT-07 C profile; job HOLD; không claim refresh persistence |
| Data API mới chưa escape | `ui-prototype/js/pages/home.js:41` clone template tĩnh; DOM code hiện dùng fixture | JSP-DAI-02, JSP-DAI-03 c:out/textContent/JSON serializer; review nơi đưa dữ liệu server vào HTML. Rủi ro tích hợp, không khẳng định fixture hiện đã bị khai thác |
| DTO/policy tiền chưa chốt | `ui-prototype/js/data/store.js:1680` expose DEMO_FEE_RATE/DEMO_REFUND_POLICY; `ui-prototype/js/pages/tutor/manage.js:585–603`; `ui-prototype/js/pages/admin/dashboard.js:305,356–358` | Q07 Huy/Đại chốt metric/refund/transition trước C; không bê policy demo |
| Nội dung Docs cũ lệch source | `ui-prototype/README.md:61` nói chưa home, source `pages/home.html:1` đã có | Không dùng Docs cũ để giao tạo lại trang; source/ma trận mới là evidence |
| Quản lý cơ bản vs tính năng ngoài23 | `ui-prototype/js/core/route.js:26–32,43,52–54` có invitations/jobs/chat/payout/audit | Q02/Q08 quyết định navigation/HOLD; không tự giao nghiệp vụ bổ sung |
| Local uncommitted conflict | git status trước audit rỗng | Không có conflict local phát hiện; sau này vẫn freeze shared và nối task A→C tuần tự |

“Không thấy API/controller” dựa vào toàn bộ inventory/codegraph hiện tại, không từ README cũ. “Không thấy link lỗi” chỉ trong checker tĩnh, không chứng minh server route. JS state `tutor/my-profile` ngoài registry được nêu ở02: production không nhận state để đổi quyền.

## 5. Quyết định cần nhóm/giảng viên chốt

| Mã | Quyết định / bằng chứng | Phương án đề xuất | Điều phối / người quyết định | Task bị ảnh hưởng |
| --- | --- | --- | --- | --- |
| Q01 | Môn học có cho Spring MVC controller + JSP không? `pom.xml:27–30` hiện chọn Boot MVC | Giữ MVC+JSP/WAR, giảng viên xác nhận trước triển khai nền; không đổi Servlet thuần theo suy đoán | Đại làm rõ với giảng viên, Huy hỗ trợ | JSP-DAI-01, JSP-DAI-02, JSP-DAI-04 và toàn bộ A/C |
| Q02 | Basic BB12/BB13/TC01 bao gồm workflow nào? chat/payout/jobs/invitations/audit chưa có mã trực tiếp trong23; có UI không là approval | Chỉ 23 + UI quản lý cơ bản đã xác nhận; HOLD bổ sung. P21–23 hỗ trợ đơn, không triển khai attendance/tự release. Queue review chỉ basic nếu đã duyệt | Đại điều phối; Huy rà nghiệp vụ; nhóm/giảng viên chốt | JSP-HUY-03, JSP-HUY-09, JSP-HUY-13, JSP-DAT-02, JSP-DAT-07; P02/P07/P08/P20/P25–31 HOLD |
| Q03 | Executable WAR hay external Tomcat? Application chưa initializer (`src/main/java/com/educonnect/EduConnectApplication.java:6–11`) | Dùng executable WAR trước; external Tomcat Jakarta10.1 chỉ khi yêu cầu và thêm initializer đúng phiên bản | Đại, Huy review môi trường | JSP-DAI-01; package/start/context test |
| Q04 | Môi trường boot preview / DB an toàn? config chưa datasource, có Flyway | Profile ui-preview cô lập, không DB/mail/payment; backend C chỉ DB local đã xác nhận và sandbox. Không thử migration trên DB thật | Đại điều phối cấu hình; Huy xác nhận DB/gateway | JSP-DAI-01, JSP-DAI-04; mọi C và smoke runtime |
| Q05 | Session, logout, mutation dùng form hay JSON/CSRF? Store hiện chỉ persona (`ui-prototype/js/data/store.js:282–309`) | Server cookie session; CSRF giữ cho mutation; POST logout; client error contract chung. Chốt action style từng page để không gửi đôi | Đại; Huy/Đạt cung cấp forms/actions | JSP-DAI-03, JSP-DAI-10; JSP-DAT-06, JSP-DAT-07; JSP-HUY-08, JSP-HUY-10, JSP-HUY-11, JSP-HUY-13 |
| Q06 | Tutor có được hiểu là gian hàng, offering SERVICE/GROUP_CLASS là sản phẩm BB05/TC08/TC09? source đang hiển thị “Tìm gia sư” | Dùng tutor→shop và offering→product chỉ khi nhóm/giảng viên chấp nhận; giữ source naming hiện tại, không tạo shop entity/file chỉ để khớp mô tả | Đại điều phối; Huy chốt data; Đạt map UI | JSP-HUY-01, JSP-HUY-12; JSP-DAT-03, JSP-DAT-04, JSP-DAT-08, JSP-DAT-09; JSP-DAI-08, JSP-DAI-11 |
| Q07 | State order/payment/refund, phí và metric/date? demo chưa phải policy | Huy chốt transitions/cancel/refund/idempotency; Đại chốt chart from/to/timezone/metric từ ledger verified. Không copy fee/refund demo thành production | Huy điều phối giao dịch; Đại đồng điều phối thống kê | JSP-HUY-08, JSP-HUY-10, JSP-HUY-11, JSP-HUY-13; JSP-DAI-07, JSP-DAI-12; JSP-DAT-05, JSP-DAT-10 nhận modules |
| Q08 | URLs đẹp, aliases *.html, menu tới page HOLD và showcase? registry hiện HTML (`ui-prototype/js/core/route.js:14–55`) | Route /module/name theo ma trận; /→/home alias do Đại; chỉ legacy redirect allowlist nếu cần. Menu ngoài phạm vi phải chọn giữ preview hoặc ẩn/disabled rõ, không để404. Showcase chỉ dev | Đại; chủ trang gửi manifest; nhóm chốt navigation | JSP-DAI-02, JSP-DAI-13; mọi D; HOLD pages |
| Q09 | Khi A xong có còn duy trì hai bản prototype/production? `docs/architecture/README.md:16–20` dự kiến copy | Một source production JSP/static; prototype read-only reference; fixture chỉ preview, adapter real riêng; cập nhật checker phạm vi khi triển khai | Đại, Huy/Đạt đồng thuận | JSP-DAI-02, JSP-DAI-13; mọi A→C, kiểm hồi quy |

Mỗi quyết định cần được ghi vào Docs giao việc kèm kết quả, không có deadline mặc định. Những quyết định chưa chốt không ngăn chuẩn bị DTO/hook/manifest, nhưng chặn phần implementation phụ thuộc tương ứng.

## 6. Điều kiện nghiệm thu bàn giao và rà soát báo cáo

| Kiểm cuối | Kết quả |
| --- | --- |
| Mọi trang hiện có được phân loại | 40/40 P01–P40; 51 component +1 showcase và toàn bộ JS/CSS/assets ở02 |
| Chín trang đề xuất đã có hay thiếu | 9/9 có HTML/JS/CSS; 0/9 có JSP; không giao tạo lại |
| Source JSP đã/đang/chưa | 0/0/40, theo filesystem + WAR inventory |
| Shared ownership | Đại duy nhất integration/config/router/layout/core/CSS nền; Huy/Đạt gửi contract/delta |
| Mọi task có input/output/người nhận/acceptance | 36 task chi tiết ở04, C nêu blocker; không gán deadline |
| Không bổ sung nghiệp vụ chưa duyệt | HOLD được đánh dấu; không task B/C cho chat/payout/realtime/job/invitation mới |
| Build/runtime/C phân biệt | Package pass; boot/JSP runtime chưa kiểm; backend thật chưa có |
| Không lộ secrets | Chỉ tên key/schema, không password/token/config secret; URL token literal trong inventory được che |
| Git/source | Không checkout/reset/stash/clean/branch/commit/push; nguồn ứng dụng không sửa; chỉ 5 Markdown mới và target build bị ignore |

Lượt audit kết thúc tại năm báo cáo. Việc chuyển JSP, thêm profile/controller/module, sửa tham chiếu hoặc nối API chỉ bắt đầu ở lượt triển khai tiếp theo.

