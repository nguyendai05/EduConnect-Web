# Ma trận chuyển trang và asset
Snapshot: `feature/ui-dai-auth` @ `e12fb53937edaa60121229d60a8ff42a870e06ab`, audit 11/10/2026 14:47:37 UTC+07. Tất cả đường dẫn dưới đây tính từ root repository.

## 1. Quy ước và tổng kiểm kê

- **A** chuyển HTML đã có sang JSP; **B** tạo trang còn thiếu thuộc BB/TC; **C** nối backend thật; **D** sửa/kiểm tham chiếu sau chuyển.
- **U**: đã có HTML/JS/CSS, **chưa chuyển JSP**. Cả 40 trang là U; đã chuyển 0, đang chuyển 0. B chưa cần cho chín trang được nêu trong yêu cầu.
- **HOLD**: chỉ kiểm kê/reserve mapping đề xuất, chưa giao triển khai nghiệp vụ hoặc tạo JSP cho phần ngoài 23. Chủ ghi ở bảng là đầu mối hiện tại, không phải quyết định mở phạm vi.
- Mọi route HTTP, controller, view/model, endpoint và file đích đều **đề xuất, chưa tồn tại**. Prototype route thật là file HTML. Controller chung đề xuất `src/main/java/com/educonnect/config/PageViewController.java`, Đại tích hợp mọi mapping; chủ trang chỉ gửi yêu cầu.
- Chung cho mọi model: `pageTitle`, `pageKey`, `layoutKind`, `currentUser`, `pageState` (ready/empty/error/forbidden), `message`. Payload riêng trong `pageData`; bảng ghi nội dung payload tối thiểu.
- Vai trò lấy từ UI/registry, không phải quyền server đã kiểm chứng: `ui-prototype/js/core/route.js:15–55`.
- JS/CSS trang có ở `ui-prototype/js/pages/` và `ui-prototype/css/pages/`. Assets và CSS/JS component theo phụ lục R-Pxx, không nhân bản vào từng trang.
- Cặp `contract/student-detail`, `contract/tutor-detail` còn dùng CSS `ui-prototype/css/pages/contract/contract-detail.css` chung. Đại tích hợp bản production sau đề nghị của Huy, không để hai người sửa bản chung.

Có 40 HTML sản phẩm, 51 HTML component rời, một HTML showcase, 96 CSS, 65 JS, 68 asset (59 SVG, 7 PNG, 1 ICO, 1 TXT); không có font file, thư viện vendor/CDN hay JSP/JSPF/tag. Font hệ thống được khai báo ở `ui-prototype/css/tokens.css:2–3`. Dữ liệu thật/API thật chưa có.

## 2. Ma trận đủ 40 trang

Layout đích: `src/main/webapp/WEB-INF/views/fragments/layout/` với auth/user/admin; payment-minimal giữ shell QR tối giản. “R-Pxx” là bảng tham chiếu cụ thể ngay sau ma trận. Nghiệm thu mỗi hàng gồm route trực tiếp + refresh + asset/JS không lỗi + chỉ init một lần, cộng điều kiện riêng trong cột cuối. C nghiệm thu riêng, không gộp vào A.

| Mã / BB-TC | Vai trò UI | File hiện tại / bằng chứng | Trạng thái | JSP đích | Route HTTP đề xuất / handler / view | Model riêng | Layout / component | JS/CSS nguồn → đích | Link/action/endpoint/loader cần chỉnh | Dữ liệu và backend thiếu | Chủ / hỗ trợ / phụ thuộc | Loại / nghiệm thu |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P01<br>TC01 | Học viên/phụ huynh, Gia sư (registry) | `ui-prototype/pages/account/profile.html`; `ui-prototype/pages/account/profile.html:1`; `ui-prototype/js/pages/account/profile.js:1` | U: HTML có; JSP/handler chưa có; hardcode/DOM — `ui-prototype/pages/account/profile.html:1`; `ui-prototype/js/pages/account/profile.js:1` | `src/main/webapp/WEB-INF/views/account/profile.jsp` | `/account/profile`; PageViewController.accountProfile; view `account/profile` | profile: id, name, email, phone, bio, avatar; formErrors | user; user-header, account-footer | `ui-prototype/js/pages/account/profile.js` → `src/main/resources/static/js/pages/account/profile.js`;<br>`ui-prototype/css/pages/account/profile.css` → `src/main/resources/static/css/pages/account/profile.css` | R-P01: href/src/action và JS redirect; GET/PATCH /api/account/profile; không có fetch loader | Hồ sơ hardcode trong HTML; lưu chỉ đổi DOM (JS:18,72–86); chưa có server DTO/API/security/persistence | Đạt; Đại: session; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-02; C chờ API | A/D; C riêng; Hủy chỉnh sửa khôi phục dữ liệu; refresh đọc hồ sơ server khi C xong |
| P02<br>Ngoài 23 | Admin (registry) | `ui-prototype/pages/admin/audit-logs.html`; `ui-prototype/pages/admin/audit-logs.html:1`; `ui-prototype/js/pages/admin/audit-logs.js:429` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/audit-logs.html:1`; `ui-prototype/js/pages/admin/audit-logs.js:429` | `src/main/webapp/WEB-INF/views/admin/audit-logs.jsp` | `/admin/audit-logs`; PageViewController.adminAuditLogs; view `admin/audit-logs` | logs, filters, pageInfo | admin; admin-shell, admin-sidebar, admin-header, loading, table, pagination, empty-state, modal | `ui-prototype/js/pages/admin/audit-logs.js` → `src/main/resources/static/js/pages/admin/audit-logs.js`;<br>`ui-prototype/css/pages/admin/audit-logs.css` → `src/main/resources/static/css/pages/admin/audit-logs.css` | R-P02: href/src/action và JS redirect; Chưa giao API nhật ký; không có fetch loader | Bảng nhật ký riêng trong JS; lọc/paging demo; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Chỉ giữ mapping/menu; chưa triển khai nhật ký thật |
| P03<br>BB10, BB11 | Admin (registry) | `ui-prototype/pages/admin/dashboard.html`; `ui-prototype/pages/admin/dashboard.html:1`; `ui-prototype/js/pages/admin/dashboard.js:12` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/dashboard.html:1`; `ui-prototype/js/pages/admin/dashboard.js:12` | `src/main/webapp/WEB-INF/views/admin/dashboard.jsp` | `/admin/dashboard`; PageViewController.adminDashboard; view `admin/dashboard` | stats, revenueSeries, orderStatusSlices, from, to | admin; admin-shell, admin-sidebar, admin-header | `ui-prototype/js/pages/admin/dashboard.js` → `src/main/resources/static/js/pages/admin/dashboard.js`;<br>`ui-prototype/css/pages/admin/dashboard.css` → `src/main/resources/static/css/pages/admin/dashboard.css` | R-P03: href/src/action và JS redirect; GET /api/statistics?from&to; GET /api/statistics/order-status; không có fetch loader | EduStore + façade tutor/payout; bar/pie demo (JS:305,356); chưa có server DTO/API/security/persistence | Đại; Huy: DTO tiền/đơn; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-07; C chờ API | A/D; C riêng; Khoảng ngày sai/empty; pie tổng khớp đơn; số tiền từ release đã xác nhận |
| P04<br>BB12 hỗ trợ | Admin (registry) | `ui-prototype/pages/admin/job-review-detail.html`; `ui-prototype/pages/admin/job-review-detail.html:1`; `ui-prototype/js/pages/admin/job-review-detail.js:34` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/job-review-detail.html:1`; `ui-prototype/js/pages/admin/job-review-detail.js:34` | `src/main/webapp/WEB-INF/views/admin/job-review-detail.jsp` | `/admin/job-review-detail`; PageViewController.adminJobReviewDetail; view `admin/job-review-detail` | job, decisionForm, allowedActions, formErrors | admin; admin-shell, admin-sidebar, admin-header, modal | `ui-prototype/js/pages/admin/job-review-detail.js` → `src/main/resources/static/js/pages/admin/job-review-detail.js`;<br>`ui-prototype/css/pages/admin/job-review-detail.css` → `src/main/resources/static/css/pages/admin/job-review-detail.css` | R-P04: href/src/action và JS redirect; GET /api/admin/jobs/{id}; POST /api/admin/jobs/{id}/decision; không có fetch loader | EduStore qua job-review-data; quyết định demo; chưa có server DTO/API/security/persistence | Huy; Đại: quyền/layout; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-09; C chờ API | A/D; C riêng; ID lạ không fallback; từ chối cần lý do; chỉ quyền admin khi C xong |
| P05<br>BB12 hỗ trợ | Admin (registry) | `ui-prototype/pages/admin/job-review-queue.html`; `ui-prototype/pages/admin/job-review-queue.html:1`; `ui-prototype/js/pages/admin/job-review-queue.js:2` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/job-review-queue.html:1`; `ui-prototype/js/pages/admin/job-review-queue.js:2` | `src/main/webapp/WEB-INF/views/admin/job-review-queue.jsp` | `/admin/job-review-queue`; PageViewController.adminJobReviewQueue; view `admin/job-review-queue` | jobs, filters, pageInfo, queueCounts | admin; admin-shell, admin-sidebar, admin-header, loading, table, pagination, empty-state | `ui-prototype/js/pages/admin/job-review-queue.js` → `src/main/resources/static/js/pages/admin/job-review-queue.js`;<br>`ui-prototype/css/pages/admin/job-review-queue.css` → `src/main/resources/static/css/pages/admin/job-review-queue.css` | R-P05: href/src/action và JS redirect; GET /api/admin/jobs?status&page&sort; không có fetch loader | EduStore.jobQueue; lọc/paging demo; chưa có server DTO/API/security/persistence | Huy; Đại: quyền/layout; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-09; C chờ API | A/D; C riêng; List/detail đồng bộ cùng DTO; giữ status/query; empty đúng |
| P06<br>BB12 | Admin (registry) | `ui-prototype/pages/admin/manage.html`; `ui-prototype/pages/admin/manage.html:1`; `ui-prototype/js/pages/admin/manage.js:2` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/manage.html:1`; `ui-prototype/js/pages/admin/manage.js:2` | `src/main/webapp/WEB-INF/views/admin/manage.jsp` | `/admin/manage`; PageViewController.adminManage; view `admin/manage` | users, offerings, orders, activeTab, pageInfo, allowedActions | admin; admin-shell, admin-sidebar, admin-header, table, pagination | `ui-prototype/js/pages/admin/manage.js` → `src/main/resources/static/js/pages/admin/manage.js`;<br>`ui-prototype/css/pages/admin/manage.css` → `src/main/resources/static/css/pages/admin/manage.css` | R-P06: href/src/action và JS redirect; GET /api/admin/users\|offerings\|orders; PATCH /api/admin/users/{id}/state; POST /api/admin/offerings/{id}/transition; không có fetch loader | EduStore; khóa tài khoản, duyệt offering giả lập; chưa có server DTO/API/security/persistence | Huy; Đại: quyền/layout; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-07; C chờ API | A/D; C riêng; Ba tab/query; server chặn role/transition sai; thao tác lặp không ghi hai lần |
| P07<br>Ngoài 23; payout chờ duyệt | Admin (registry) | `ui-prototype/pages/admin/payout-request-detail.html`; `ui-prototype/pages/admin/payout-request-detail.html:1`; `ui-prototype/js/pages/admin/payout-request-detail.js:311` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/payout-request-detail.html:1`; `ui-prototype/js/pages/admin/payout-request-detail.js:311` | `src/main/webapp/WEB-INF/views/admin/payout-request-detail.jsp` | `/admin/payout-request-detail`; PageViewController.adminPayoutRequestDetail; view `admin/payout-request-detail` | payoutPreview, allowedActions (chỉ demo) | admin; admin-shell, admin-sidebar, admin-header, modal | `ui-prototype/js/pages/admin/payout-request-detail.js` → `src/main/resources/static/js/pages/admin/payout-request-detail.js`;<br>`ui-prototype/css/pages/admin/payout-request-detail.css` → `src/main/resources/static/css/pages/admin/payout-request-detail.css` | R-P07: href/src/action và JS redirect; Chưa giao API payout; không có fetch loader | EduPayout fixture riêng, sessionStorage; không chuyển khoản; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Giữ liên kết; không tạo hoặc xác nhận giao dịch thật |
| P08<br>Ngoài 23; payout chờ duyệt | Admin (registry) | `ui-prototype/pages/admin/payout-requests.html`; `ui-prototype/pages/admin/payout-requests.html:1`; `ui-prototype/js/pages/admin/payout-requests.js:167` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/payout-requests.html:1`; `ui-prototype/js/pages/admin/payout-requests.js:167` | `src/main/webapp/WEB-INF/views/admin/payout-requests.jsp` | `/admin/payout-requests`; PageViewController.adminPayoutRequests; view `admin/payout-requests` | payoutsPreview, status, pageInfo | admin; admin-shell, admin-sidebar, admin-header, loading, table, pagination, empty-state | `ui-prototype/js/pages/admin/payout-requests.js` → `src/main/resources/static/js/pages/admin/payout-requests.js`;<br>`ui-prototype/css/pages/admin/payout-requests.css` → `src/main/resources/static/css/pages/admin/payout-requests.css` | R-P08: href/src/action và JS redirect; Chưa giao API payout; không có fetch loader | EduPayout fixture riêng; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Chỉ kiểm kê ảnh hưởng sidebar; chờ duyệt phạm vi |
| P09<br>TC05 | Admin (registry) | `ui-prototype/pages/admin/report-detail.html`; `ui-prototype/pages/admin/report-detail.html:1`; `ui-prototype/js/pages/admin/report-detail.js:306` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/report-detail.html:1`; `ui-prototype/js/pages/admin/report-detail.js:306` | `src/main/webapp/WEB-INF/views/admin/report-detail.jsp` | `/admin/report-detail`; PageViewController.adminReportDetail; view `admin/report-detail` | report, timeline, decisionForm, allowedActions | admin; admin-shell, admin-sidebar, admin-header, empty-state, modal | `ui-prototype/js/pages/admin/report-detail.js` → `src/main/resources/static/js/pages/admin/report-detail.js`;<br>`ui-prototype/css/pages/admin/report-detail.css` → `src/main/resources/static/css/pages/admin/report-detail.css` | R-P09: href/src/action và JS redirect; GET /api/admin/reports/{id}; POST /api/admin/reports/{id}/decision; không có fetch loader | EduReport→EduStore; quyết định demo; chưa có server DTO/API/security/persistence | Đại; Huy: đơn/quyền đối tượng; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-09; C chờ API | A/D; C riêng; Một kết luận; lý do hợp lệ; ID/quyền/empty/error |
| P10<br>TC05 | Admin (registry) | `ui-prototype/pages/admin/reports.html`; `ui-prototype/pages/admin/reports.html:1`; `ui-prototype/js/pages/admin/reports.js:144` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/reports.html:1`; `ui-prototype/js/pages/admin/reports.js:144` | `src/main/webapp/WEB-INF/views/admin/reports.jsp` | `/admin/reports`; PageViewController.adminReports; view `admin/reports` | reports, status, pageInfo, summary | admin; admin-shell, admin-sidebar, admin-header, loading, table, pagination, empty-state | `ui-prototype/js/pages/admin/reports.js` → `src/main/resources/static/js/pages/admin/reports.js`;<br>`ui-prototype/css/pages/admin/reports.css` → `src/main/resources/static/css/pages/admin/reports.css` | R-P10: href/src/action và JS redirect; GET /api/admin/reports?status&page; không có fetch loader | EduReport→EduStore; unresolved gộp trạng thái; chưa có server DTO/API/security/persistence | Đại; Huy: DTO liên kết đơn; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-09; C chờ API | A/D; C riêng; unresolved/query/paging; quay lại đồng bộ kết luận |
| P11<br>BB12 hỗ trợ | Admin (registry) | `ui-prototype/pages/admin/tutor-review-detail.html`; `ui-prototype/pages/admin/tutor-review-detail.html:1`; `ui-prototype/js/pages/admin/tutor-review-detail.js:232` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/tutor-review-detail.html:1`; `ui-prototype/js/pages/admin/tutor-review-detail.js:232` | `src/main/webapp/WEB-INF/views/admin/tutor-review-detail.jsp` | `/admin/tutor-review-detail`; PageViewController.adminTutorReviewDetail; view `admin/tutor-review-detail` | tutorReview, evidenceMeta, decisionForm, allowedActions | admin; admin-shell, admin-sidebar, admin-header, table, modal | `ui-prototype/js/pages/admin/tutor-review-detail.js` → `src/main/resources/static/js/pages/admin/tutor-review-detail.js`;<br>`ui-prototype/css/pages/admin/tutor-review-detail.css` → `src/main/resources/static/css/pages/admin/tutor-review-detail.css` | R-P11: href/src/action và JS redirect; GET /api/admin/tutor-reviews/{id}; POST /api/admin/tutor-reviews/{id}/decision; không có fetch loader | EduTutorReview: fixture HSGS riêng; chưa gắn tutor thật; chưa có server DTO/API/security/persistence | Huy; Đạt: hồ sơ; Đại: quyền; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-09; C chờ API | A/D; C riêng; ID hồ sơ xác minh khác tutorId; tệp demo không coi là chứng chỉ thật |
| P12<br>BB12 hỗ trợ | Admin (registry) | `ui-prototype/pages/admin/tutor-review-queue.html`; `ui-prototype/pages/admin/tutor-review-queue.html:1`; `ui-prototype/js/pages/admin/tutor-review-queue.js:146` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/admin/tutor-review-queue.html:1`; `ui-prototype/js/pages/admin/tutor-review-queue.js:146` | `src/main/webapp/WEB-INF/views/admin/tutor-review-queue.jsp` | `/admin/tutor-review-queue`; PageViewController.adminTutorReviewQueue; view `admin/tutor-review-queue` | tutorReviews, status, pageInfo, counts | admin; admin-shell, admin-sidebar, admin-header, loading, table, pagination, empty-state | `ui-prototype/js/pages/admin/tutor-review-queue.js` → `src/main/resources/static/js/pages/admin/tutor-review-queue.js`;<br>`ui-prototype/css/pages/admin/tutor-review-queue.css` → `src/main/resources/static/css/pages/admin/tutor-review-queue.css` | R-P12: href/src/action và JS redirect; GET /api/admin/tutor-reviews?status&page; không có fetch loader | EduTutorReview fixture riêng; sessionStorage; chưa có server DTO/API/security/persistence | Huy; Đạt: hồ sơ; Đại: layout; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-09; C chờ API | A/D; C riêng; List/detail cùng nguồn; chỉ chuyển UI trong BB12 đã chốt |
| P13<br>BB04 | Khách/public (registry) | `ui-prototype/pages/auth/forgot-password.html`; `ui-prototype/pages/auth/forgot-password.html:1`; `ui-prototype/js/pages/auth/forgot-password.js:63` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/auth/forgot-password.html:1`; `ui-prototype/js/pages/auth/forgot-password.js:63` | `src/main/webapp/WEB-INF/views/auth/forgot-password.jsp` | `/auth/forgot-password`; PageViewController.authForgotPassword; view `auth/forgot-password` | requestForm, formErrors, requestReceived | auth; auth markup/QR riêng | `ui-prototype/js/pages/auth/forgot-password.js` → `src/main/resources/static/js/pages/auth/forgot-password.js`;<br>`ui-prototype/css/pages/auth/forgot-password.css` → `src/main/resources/static/css/pages/auth/forgot-password.css` | R-P13: href/src/action và JS redirect; POST /api/auth/forgot-password (email sandbox); không có fetch loader | JS setTimeout, không gửi email (JS:63–66); chưa có server DTO/API/security/persistence | Đại; Huy: review; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-04; C chờ API | A/D; C riêng; Trang mẫu: route/controller/JSP/auth layout/asset/JS; phản hồi không lộ tài khoản |
| P14<br>BB02; BB03 action demo | Khách/public (registry) | `ui-prototype/pages/auth/login.html`; `ui-prototype/pages/auth/login.html:1`; `ui-prototype/js/pages/auth/login.js:8` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/auth/login.html:1`; `ui-prototype/js/pages/auth/login.js:8` | `src/main/webapp/WEB-INF/views/auth/login.jsp` | `/auth/login`; PageViewController.authLogin; view `auth/login` | loginForm, formErrors, authNotice | auth; password-input | `ui-prototype/js/pages/auth/login.js` → `src/main/resources/static/js/pages/auth/login.js`;<br>`ui-prototype/css/pages/auth/login.css` → `src/main/resources/static/css/pages/auth/login.css` | R-P14: href/src/action và JS redirect; POST /api/auth/login; POST /api/auth/logout; không có fetch loader | EduStore.login chọn persona; không kiểm mật khẩu (JS:147; store:302–309); chưa có server DTO/API/security/persistence | Đại; Đạt: tích hợp logout; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-05; C chờ API | A/D; C riêng; Lỗi sai thông tin; redirect allowlist; session server khi C xong |
| P15<br>BB01 | Khách/public (registry) | `ui-prototype/pages/auth/register.html`; `ui-prototype/pages/auth/register.html:1`; `ui-prototype/js/pages/auth/register.js:68` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/auth/register.html:1`; `ui-prototype/js/pages/auth/register.js:68` | `src/main/webapp/WEB-INF/views/auth/register.jsp` | `/auth/register`; PageViewController.authRegister; view `auth/register` | registerForm, formErrors, registrationState | auth; password-input | `ui-prototype/js/pages/auth/register.js` → `src/main/resources/static/js/pages/auth/register.js`;<br>`ui-prototype/css/pages/auth/register.css` → `src/main/resources/static/css/pages/auth/register.css` | R-P15: href/src/action và JS redirect; POST /api/auth/register (email sandbox); không có fetch loader | JS validation + setTimeout (JS:65–71); chưa có server DTO/API/security/persistence | Đại; Huy: review; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-05; C chờ API | A/D; C riêng; Validate server/client; trạng thái chờ xác minh; không gửi email thật khi test |
| P16<br>BB04 | Khách/public (registry) | `ui-prototype/pages/auth/reset-password.html`; `ui-prototype/pages/auth/reset-password.html:1`; `ui-prototype/js/pages/auth/reset-password.js:6` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/auth/reset-password.html:1`; `ui-prototype/js/pages/auth/reset-password.js:6` | `src/main/webapp/WEB-INF/views/auth/reset-password.jsp` | `/auth/reset-password`; PageViewController.authResetPassword; view `auth/reset-password` | resetForm, tokenState, formErrors | auth; password-input | `ui-prototype/js/pages/auth/reset-password.js` → `src/main/resources/static/js/pages/auth/reset-password.js`;<br>`ui-prototype/css/pages/auth/reset-password.css` → `src/main/resources/static/css/pages/auth/reset-password.css` | R-P16: href/src/action và JS redirect; POST /api/auth/reset-password; không có fetch loader | EduFixtures.authTokens + cờ sessionStorage; không đổi mật khẩu thật; chưa có server DTO/API/security/persistence | Đại; Huy: review; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-06; C chờ API | A/D; C riêng; missing/unknown/expired/used/valid; token dùng một lần từ backend |
| P17<br>BB01 | Khách/public (registry) | `ui-prototype/pages/auth/verify-email.html`; `ui-prototype/pages/auth/verify-email.html:1`; `ui-prototype/js/pages/auth/verify-email.js:6` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/auth/verify-email.html:1`; `ui-prototype/js/pages/auth/verify-email.js:6` | `src/main/webapp/WEB-INF/views/auth/verify-email.jsp` | `/auth/verify-email`; PageViewController.authVerifyEmail; view `auth/verify-email` | tokenState, verificationMessage | auth; auth markup/QR riêng | `ui-prototype/js/pages/auth/verify-email.js` → `src/main/resources/static/js/pages/auth/verify-email.js`;<br>`ui-prototype/css/pages/auth/verify-email.css` → `src/main/resources/static/css/pages/auth/verify-email.css` | R-P17: href/src/action và JS redirect; POST /api/auth/verify-email; POST /api/auth/resend-verification; không có fetch loader | EduFixtures.authTokens; resend setTimeout; chưa có server DTO/API/security/persistence | Đại; Huy: review; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAI-06; C chờ API | A/D; C riêng; Không hiển thị danh sách token production; mã hết hạn/đã dùng/quá hạn |
| P18<br>BB06; đầu vào BB07 | Học viên/phụ huynh (registry) | `ui-prototype/pages/cart/index.html`; `ui-prototype/pages/cart/index.html:1`; `ui-prototype/js/pages/cart/index.js:3` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/cart/index.html:1`; `ui-prototype/js/pages/cart/index.js:3` | `src/main/webapp/WEB-INF/views/cart/index.jsp` | `/cart/index`; PageViewController.cartIndex; view `cart/index` | cart, totals, validationErrors, allowedActions | user; user-shell, user-header, user-footer | `ui-prototype/js/pages/cart/index.js` → `src/main/resources/static/js/pages/cart/index.js`;<br>`ui-prototype/css/pages/cart/index.css` → `src/main/resources/static/css/pages/cart/index.css` | R-P18: href/src/action và JS redirect; GET /api/cart; POST /api/cart/items; PATCH/DELETE /api/cart/items/{id}; không có fetch loader | EduStore.cart* + checkoutFromCart demo; chưa có server DTO/API/security/persistence | Huy; Đạt: BB05 nút giỏ; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-02; C chờ API | A/D; C riêng; Thêm/sửa/xóa/chỗ còn; server tính tổng; lỗi không mất giỏ |
| P19<br>BB05 | Khách/public, Học viên/phụ huynh (registry) | `ui-prototype/pages/catalog/detail.html`; `ui-prototype/pages/catalog/detail.html:1`; `ui-prototype/js/pages/catalog/detail.js:8` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/catalog/detail.html:1`; `ui-prototype/js/pages/catalog/detail.js:8` | `src/main/webapp/WEB-INF/views/catalog/detail.jsp` | `/catalog/detail`; PageViewController.catalogDetail; view `catalog/detail` | offering, tutorSummary, availability, terms, allowedActions | user; user-shell, user-header, user-footer | `ui-prototype/js/pages/catalog/detail.js` → `src/main/resources/static/js/pages/catalog/detail.js`;<br>`ui-prototype/css/pages/catalog/detail.css` → `src/main/resources/static/css/pages/catalog/detail.css` | R-P19: href/src/action và JS redirect; GET /api/offerings/{id}; POST /api/cart/items; không có fetch loader | EduStore.offering/tutor/cartAdd; chỉ công khai offering hợp lệ; chưa có server DTO/API/security/persistence | Đạt; Huy: dữ liệu BB05; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-04; C chờ API | A/D; C riêng; ID sai/private/closed; SERVICE/GROUP_CLASS; UI nhận DTO của Huy |
| P20<br>Ngoài 23; chat chờ duyệt | Học viên/phụ huynh, Gia sư (registry) | `ui-prototype/pages/chat/messages.html`; `ui-prototype/pages/chat/messages.html:1`; `ui-prototype/js/pages/chat/messages.js:5` | U: HTML có; JSP/handler chưa có; hardcode/DOM — `ui-prototype/pages/chat/messages.html:1`; `ui-prototype/js/pages/chat/messages.js:5` | `src/main/webapp/WEB-INF/views/chat/messages.jsp` | `/chat/messages`; PageViewController.chatMessages; view `chat/messages` | threadsPreview, linkedContract (demo) | user; user-header, user-footer | `ui-prototype/js/pages/chat/messages.js` → `src/main/resources/static/js/pages/chat/messages.js`;<br>`ui-prototype/css/pages/chat/messages.css` → `src/main/resources/static/css/pages/chat/messages.css` | R-P20: href/src/action và JS redirect; Chưa giao API/realtime chat; không có fetch loader | Thread hardcode; contract đọc EduStore; tin nhắn client; chưa có server DTO/API/security/persistence | Huy (mapping theo trang giao dịch); Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Chỉ mapping/nav; không giao nghiệp vụ chat |
| P21<br>BB07, TC03 hỗ trợ | Học viên/phụ huynh, Gia sư (registry) | `ui-prototype/pages/contract/confirm.html`; `ui-prototype/pages/contract/confirm.html:1`; `ui-prototype/js/pages/contract/confirm.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/contract/confirm.html:1`; `ui-prototype/js/pages/contract/confirm.js:1` | `src/main/webapp/WEB-INF/views/contract/confirm.jsp` | `/contract/confirm`; PageViewController.contractConfirm; view `contract/confirm` | order, contract, terms, allowedActions | user; user-header, user-footer | `ui-prototype/js/pages/contract/confirm.js` → `src/main/resources/static/js/pages/contract/confirm.js`;<br>`ui-prototype/css/pages/contract/confirm.css` → `src/main/resources/static/css/pages/contract/confirm.css` | R-P21: href/src/action và JS redirect; GET /api/contracts/{id}; POST /api/orders/{id}/confirm; POST /api/orders/{id}/cancel; không có fetch loader | EduStore contract/order/payments; chữ ký local demo; chưa có server DTO/API/security/persistence | Huy; Đại: report; Đạt: lịch sử; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-03; C chờ API | A/D; C riêng; contract/order cùng bản ghi; không coi xác nhận UI là chữ ký thật |
| P22<br>BB07, TC02, TC03 hỗ trợ; TC05 module | Học viên/phụ huynh (registry) | `ui-prototype/pages/contract/student-detail.html`; `ui-prototype/pages/contract/student-detail.html:1`; `ui-prototype/js/pages/contract/student-detail.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/contract/student-detail.html:1`; `ui-prototype/js/pages/contract/student-detail.js:1` | `src/main/webapp/WEB-INF/views/contract/student-detail.jsp` | `/contract/student-detail`; PageViewController.contractStudentDetail; view `contract/student-detail` | contract, order, sessions, payments, refund, allowedActions | user; user-header, user-footer | `ui-prototype/js/pages/contract/student-detail.js` → `src/main/resources/static/js/pages/contract/student-detail.js`;<br>`ui-prototype/css/pages/contract/student-detail.css` → `src/main/resources/static/css/pages/contract/student-detail.css` | R-P22: href/src/action và JS redirect; GET /api/contracts/{id}; endpoint trạng thái/hủy theo JSP-HUY-08; POST /api/reports; không có fetch loader | EduStore; releaseSession/submitReport demo; chưa có server DTO/API/security/persistence | Huy; Đại: TC05 module; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-03; C chờ API | A/D; C riêng; Tiền/đơn/refund khớp history; không tự giải ngân tính năng chưa duyệt |
| P23<br>BB13, TC02 hỗ trợ | Gia sư (registry) | `ui-prototype/pages/contract/tutor-detail.html`; `ui-prototype/pages/contract/tutor-detail.html:1`; `ui-prototype/js/pages/contract/tutor-detail.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/contract/tutor-detail.html:1`; `ui-prototype/js/pages/contract/tutor-detail.js:1` | `src/main/webapp/WEB-INF/views/contract/tutor-detail.jsp` | `/contract/tutor-detail`; PageViewController.contractTutorDetail; view `contract/tutor-detail` | contract, order, sessions, allowedActions | user; user-header, user-footer | `ui-prototype/js/pages/contract/tutor-detail.js` → `src/main/resources/static/js/pages/contract/tutor-detail.js`;<br>`ui-prototype/css/pages/contract/tutor-detail.css` → `src/main/resources/static/css/pages/contract/tutor-detail.css` | R-P23: href/src/action và JS redirect; GET /api/contracts/{id}; endpoint TC02 theo JSP-HUY-08; không có fetch loader | EduStore + markAttendance demo; chưa có server DTO/API/security/persistence | Huy; Đại: quyền; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-03; C chờ API | A/D; C riêng; Phía tutor không đọc hợp đồng người khác; trạng thái thực từ server |
| P24<br>TC10 | Khách/public, Học viên/phụ huynh, Gia sư, Admin (registry) | `ui-prototype/pages/home.html`; `ui-prototype/pages/home.html:1`; `ui-prototype/js/pages/home.js:3` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/home.html:1`; `ui-prototype/js/pages/home.js:3` | `src/main/webapp/WEB-INF/views/home.jsp` | `/home`; PageViewController.home; view `home` | latestOfferings, pageInfo | user; user-shell, user-header, user-footer | `ui-prototype/js/pages/home.js` → `src/main/resources/static/js/pages/home.js`;<br>`ui-prototype/css/pages/home.css` → `src/main/resources/static/css/pages/home.css` | R-P24: href/src/action và JS redirect; GET /api/offerings?sort=latest&limit=6; không có fetch loader | EduStore.latestOfferings(6), fixture publishedAt; chưa có server DTO/API/security/persistence | Đạt; Đại: layout/router; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-01; C chờ API | A/D; C riêng; Mới nhất theo publishedAt/tie-break; tìm kiếm q; không dữ liệu |
| P25<br>Luồng hỗ trợ; chưa có mã trực tiếp trong 23 | Học viên/phụ huynh (registry) | `ui-prototype/pages/invitation/create.html`; `ui-prototype/pages/invitation/create.html:1`; `ui-prototype/js/pages/invitation/create.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/invitation/create.html:1`; `ui-prototype/js/pages/invitation/create.js:1` | `src/main/webapp/WEB-INF/views/invitation/create.jsp` | `/invitation/create`; PageViewController.invitationCreate; view `invitation/create` | invitationPreviewForm, tutor, offering (demo) | user; user-shell, user-header, user-footer | `ui-prototype/js/pages/invitation/create.js` → `src/main/resources/static/js/pages/invitation/create.js`;<br>`ui-prototype/css/pages/invitation/create.css` → `src/main/resources/static/css/pages/invitation/create.css` | R-P25: href/src/action và JS redirect; Chưa giao API lời mời mới; không có fetch loader | EduStore.createInvitation demo; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Đạt: nguồn hồ sơ; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Chỉ ghi phụ thuộc tutor/profile/catalog; chờ phạm vi lời mời |
| P26<br>Luồng hỗ trợ; chưa có mã trực tiếp trong 23 | Học viên/phụ huynh, Gia sư (registry) | `ui-prototype/pages/invitation/negotiation.html`; `ui-prototype/pages/invitation/negotiation.html:1`; `ui-prototype/js/pages/invitation/negotiation.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/invitation/negotiation.html:1`; `ui-prototype/js/pages/invitation/negotiation.js:1` | `src/main/webapp/WEB-INF/views/invitation/negotiation.jsp` | `/invitation/negotiation`; PageViewController.invitationNegotiation; view `invitation/negotiation` | invitationPreview, proposals (demo) | user; user-header, user-footer | `ui-prototype/js/pages/invitation/negotiation.js` → `src/main/resources/static/js/pages/invitation/negotiation.js`;<br>`ui-prototype/css/pages/invitation/negotiation.css` → `src/main/resources/static/css/pages/invitation/negotiation.css` | R-P26: href/src/action và JS redirect; Chưa giao API thương lượng mới; không có fetch loader | EduStore.respondInvitation demo; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Không mở rộng nghiệp vụ thương lượng chưa duyệt |
| P27<br>Luồng công việc; chưa có mã trực tiếp trong 23 | Học viên/phụ huynh (registry) | `ui-prototype/pages/job/applicants.html`; `ui-prototype/pages/job/applicants.html:1`; `ui-prototype/js/pages/job/applicants.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/job/applicants.html:1`; `ui-prototype/js/pages/job/applicants.js:1` | `src/main/webapp/WEB-INF/views/job/applicants.jsp` | `/job/applicants`; PageViewController.jobApplicants; view `job/applicants` | jobPreview, applicantsPreview (demo) | user; user-shell, user-header, select, user-footer | `ui-prototype/js/pages/job/applicants.js` → `src/main/resources/static/js/pages/job/applicants.js`;<br>`ui-prototype/css/pages/job/applicants.css` → `src/main/resources/static/css/pages/job/applicants.css` | R-P27: href/src/action và JS redirect; Chưa giao API ứng tuyển/chọn gia sư; không có fetch loader | EduStore applicationsOfJob/selectApplication demo; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Chỉ kiểm liên kết profile/contract; chờ phạm vi |
| P28<br>Luồng công việc; chưa có mã trực tiếp trong 23 | Học viên/phụ huynh (registry) | `ui-prototype/pages/job/create.html`; `ui-prototype/pages/job/create.html:1`; `ui-prototype/js/pages/job/create.js:45` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/job/create.html:1`; `ui-prototype/js/pages/job/create.js:45` | `src/main/webapp/WEB-INF/views/job/create.jsp` | `/job/create`; PageViewController.jobCreate; view `job/create` | jobPreviewForm, formErrors (demo) | user; user-shell, user-header, select, user-footer | `ui-prototype/js/pages/job/create.js` → `src/main/resources/static/js/pages/job/create.js`;<br>`ui-prototype/css/pages/job/create.css` → `src/main/resources/static/css/pages/job/create.css` | R-P28: href/src/action và JS redirect; Chưa giao API tạo tin mới; không có fetch loader | Draft sessionStorage riêng; submit mở modal, chưa tạo job thật; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Không tính mở modal là tạo tin; chờ phạm vi |
| P29<br>Luồng công việc; chưa có mã trực tiếp trong 23 | Khách/public, Gia sư, Học viên/phụ huynh (registry) | `ui-prototype/pages/job/detail.html`; `ui-prototype/pages/job/detail.html:1`; `ui-prototype/js/pages/job/detail.js:5` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/job/detail.html:1`; `ui-prototype/js/pages/job/detail.js:5` | `src/main/webapp/WEB-INF/views/job/detail.jsp` | `/job/detail`; PageViewController.jobDetail; view `job/detail` | jobPreview, applicationPreview (demo) | user; user-shell, user-header, user-footer | `ui-prototype/js/pages/job/detail.js` → `src/main/resources/static/js/pages/job/detail.js`;<br>`ui-prototype/css/pages/job/detail.css` → `src/main/resources/static/css/pages/job/detail.css` | R-P29: href/src/action và JS redirect; Chưa giao API ứng tuyển; không có fetch loader | EduStore.job/applyToJob demo; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; ID sai/role/đường quay lại; chờ phạm vi |
| P30<br>Luồng công việc; chưa có mã trực tiếp trong 23 | Gia sư (registry) | `ui-prototype/pages/job/discover.html`; `ui-prototype/pages/job/discover.html:1`; `ui-prototype/js/pages/job/discover.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/job/discover.html:1`; `ui-prototype/js/pages/job/discover.js:1` | `src/main/webapp/WEB-INF/views/job/discover.jsp` | `/job/discover`; PageViewController.jobDiscover; view `job/discover` | jobsPreview, filters, pageInfo (demo) | user; user-shell, user-header, brand-masthead, select, user-footer | `ui-prototype/js/pages/job/discover.js` → `src/main/resources/static/js/pages/job/discover.js`;<br>`ui-prototype/css/pages/job/discover.css` → `src/main/resources/static/css/pages/job/discover.css` | R-P30: href/src/action và JS redirect; Chưa giao API công việc mới; không có fetch loader | EduStore.jobBoard demo; lọc/sort cùng tập; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Giữ nav Tin tìm gia sư; chờ phạm vi nghiệp vụ |
| P31<br>Luồng công việc; chưa có mã trực tiếp trong 23 | Học viên/phụ huynh (registry) | `ui-prototype/pages/job/my-job.html`; `ui-prototype/pages/job/my-job.html:1`; `ui-prototype/js/pages/job/my-job.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/job/my-job.html:1`; `ui-prototype/js/pages/job/my-job.js:1` | `src/main/webapp/WEB-INF/views/job/my-job.jsp` | `/job/my-job`; PageViewController.jobMyJob; view `job/my-job` | jobsPreview, applicationsPreview (demo) | user; user-shell, user-header, select, user-footer | `ui-prototype/js/pages/job/my-job.js` → `src/main/resources/static/js/pages/job/my-job.js`;<br>`ui-prototype/css/pages/job/my-job.css` → `src/main/resources/static/css/pages/job/my-job.css` | R-P31: href/src/action và JS redirect; Chưa giao API đóng tin mới; không có fetch loader | EduStore.jobsByLearner/closeJob demo; chưa có server DTO/API/security/persistence | Huy; Đại: nav; Q02 phạm vi; Đại mapping | HOLD — A/D chỉ khi được duyệt; Không giao phát triển đóng tin mới; chờ phạm vi |
| P32<br>BB09; TC03/TC04/TC05 module | Học viên/phụ huynh (registry) | `ui-prototype/pages/order/history.html`; `ui-prototype/pages/order/history.html:1`; `ui-prototype/js/pages/order/history.js:2` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/order/history.html:1`; `ui-prototype/js/pages/order/history.js:2` | `src/main/webapp/WEB-INF/views/order/history.jsp` | `/order/history`; PageViewController.orderHistory; view `order/history` | orders, filters, pageInfo, selectedOrder, allowedActions | user; user-shell, user-header, table, pagination, empty-state, user-footer | `ui-prototype/js/pages/order/history.js` → `src/main/resources/static/js/pages/order/history.js`;<br>`ui-prototype/css/pages/order/history.css` → `src/main/resources/static/css/pages/order/history.css` | R-P32: href/src/action và JS redirect; GET /api/orders?status&channel&id; module cancel/review/report theo hợp đồng; không có fetch loader | EduStore.ordersByLearner; modal cancel/review/report đang cùng JS; chưa có server DTO/API/security/persistence | Đạt; Huy: hủy/hoàn; Đại: đánh giá/báo cáo; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-05; C chờ API | A/D; C riêng; status/channel/id; lịch sử chỉ của user; module tách trước khi C |
| P33<br>BB08; BB07 hỗ trợ | Học viên/phụ huynh (registry) | `ui-prototype/pages/payment/checkout.html`; `ui-prototype/pages/payment/checkout.html:1`; `ui-prototype/js/pages/payment/checkout.js:2` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/payment/checkout.html:1`; `ui-prototype/js/pages/payment/checkout.js:2` | `src/main/webapp/WEB-INF/views/payment/checkout.jsp` | `/payment/checkout`; PageViewController.paymentCheckout; view `payment/checkout` | order, contract, payment, totals, allowedMethods | user; user-header, user-footer | `ui-prototype/js/pages/payment/checkout.js` → `src/main/resources/static/js/pages/payment/checkout.js`;<br>`ui-prototype/css/pages/payment/checkout.css` → `src/main/resources/static/css/pages/payment/checkout.css` | R-P33: href/src/action và JS redirect; POST /api/payments; GET /api/payments/{id} (sandbox); không có fetch loader | EduStore/FIX; không giao dịch thật; chưa có server DTO/API/security/persistence | Huy; Đại: quyền/session; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-04; C chờ API | A/D; C riêng; from allowlist; server tính tiền; double click có idempotency |
| P34<br>BB08 | Học viên/phụ huynh (registry) | `ui-prototype/pages/payment/qr.html`; `ui-prototype/pages/payment/qr.html:1`; `ui-prototype/js/pages/payment/qr.js:2` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/payment/qr.html:1`; `ui-prototype/js/pages/payment/qr.js:2` | `src/main/webapp/WEB-INF/views/payment/qr.jsp` | `/payment/qr`; PageViewController.paymentQr; view `payment/qr` | payment, expiresAt, qrDisplay (sandbox) | payment-minimal; auth markup/QR riêng | `ui-prototype/js/pages/payment/qr.js` → `src/main/resources/static/js/pages/payment/qr.js`;<br>`ui-prototype/css/pages/payment/qr.css` → `src/main/resources/static/css/pages/payment/qr.css` | R-P34: href/src/action và JS redirect; GET /api/payments/{id}; POST /api/payments/{id}/cancel (sandbox); không có fetch loader | QR DEMO; timer; mutate chỉ hủy phiên (JS:184–207); chưa có server DTO/API/security/persistence | Huy; Đại: layout; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-04; C chờ API | A/D; C riêng; Không hủy order khi hủy QR; timer một lần; lỗi/expired/cancelled |
| P35<br>BB08 | Học viên/phụ huynh (registry) | `ui-prototype/pages/payment/result.html`; `ui-prototype/pages/payment/result.html:1`; `ui-prototype/js/pages/payment/result.js:3` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/payment/result.html:1`; `ui-prototype/js/pages/payment/result.js:3` | `src/main/webapp/WEB-INF/views/payment/result.jsp` | `/payment/result`; PageViewController.paymentResult; view `payment/result` | paymentResult, orderSummary, returnLink | user; user-header, user-footer | `ui-prototype/js/pages/payment/result.js` → `src/main/resources/static/js/pages/payment/result.js`;<br>`ui-prototype/css/pages/payment/result.css` → `src/main/resources/static/css/pages/payment/result.css` | R-P35: href/src/action và JS redirect; GET /api/payments/{id}/result (sandbox); không có fetch loader | Store.resolvePaymentResult; status query không xác nhận đã trả tiền; chưa có server DTO/API/security/persistence | Huy; Đạt: link history; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-04; C chờ API | A/D; C riêng; ?status=success không đổi ledger; success đọc trạng thái backend đã xác minh |
| P36<br>BB13; TC02; BB10/BB11 module | Gia sư (registry) | `ui-prototype/pages/tutor/manage.html`; `ui-prototype/pages/tutor/manage.html:1`; `ui-prototype/js/pages/tutor/manage.js:2` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/tutor/manage.html:1`; `ui-prototype/js/pages/tutor/manage.js:2` | `src/main/webapp/WEB-INF/views/tutor/manage.jsp` | `/tutor/manage`; PageViewController.tutorManage; view `tutor/manage` | offerings, classes, orders, revenue, activeTab, allowedActions | user; user-shell, user-header, table, user-footer | `ui-prototype/js/pages/tutor/manage.js` → `src/main/resources/static/js/pages/tutor/manage.js`;<br>`ui-prototype/css/pages/tutor/manage.css` → `src/main/resources/static/css/pages/tutor/manage.css` | R-P36: href/src/action và JS redirect; GET /api/tutor/offerings\|orders; POST/PATCH /api/tutor/offerings; GET /api/tutor/statistics; không có fetch loader | EduStore CRUD offering demo; tab orders đọc; charts dùng EduChart; chưa có server DTO/API/security/persistence | Huy; Đại: biểu đồ; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-06; C chờ API | A/D; C riêng; Bốn tab; offering policy; orders hiện chưa có control TC02; chart Đại bàn giao |
| P37<br>TC01 phần hồ sơ; xác minh nâng cao chờ phạm vi | Gia sư (registry) | `ui-prototype/pages/tutor/my-profile.html`; `ui-prototype/pages/tutor/my-profile.html:1`; `ui-prototype/js/pages/tutor/my-profile.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/tutor/my-profile.html:1`; `ui-prototype/js/pages/tutor/my-profile.js:1` | `src/main/webapp/WEB-INF/views/tutor/my-profile.jsp` | `/tutor/my-profile`; PageViewController.tutorMyProfile; view `tutor/my-profile` | tutorProfile, profileState, schedule, formErrors | user; user-header, account-footer | `ui-prototype/js/pages/tutor/my-profile.js` → `src/main/resources/static/js/pages/tutor/my-profile.js`;<br>`ui-prototype/css/pages/tutor/my-profile.css` → `src/main/resources/static/css/pages/tutor/my-profile.css` | R-P37: href/src/action và JS redirect; GET/PATCH /api/tutor/profile; chưa giao workflow xác minh nâng cao; không có fetch loader | HTML/form + states JS; thay state client (JS:12,116); chưa có server DTO/API/security/persistence | Đạt; Huy: DTO tutor; Đại: session; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-02; C chờ API | A/D; C riêng; Phần form/schedule dễ–trung bình; server state khi C; không tự đổi verified qua query |
| P38<br>TC09; BB05 gateway; TC04/TC05 module | Khách/public, Học viên/phụ huynh (registry) | `ui-prototype/pages/tutor/profile.html`; `ui-prototype/pages/tutor/profile.html:1`; `ui-prototype/js/pages/tutor/profile.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/tutor/profile.html:1`; `ui-prototype/js/pages/tutor/profile.js:1` | `src/main/webapp/WEB-INF/views/tutor/profile.jsp` | `/tutor/profile`; PageViewController.tutorProfile; view `tutor/profile` | tutorProfile, offerings, reviews, ratingSummary, allowedActions | user; user-shell, user-header, user-footer | `ui-prototype/js/pages/tutor/profile.js` → `src/main/resources/static/js/pages/tutor/profile.js`;<br>`ui-prototype/css/pages/tutor/profile.css` → `src/main/resources/static/css/pages/tutor/profile.css` | R-P38: href/src/action và JS redirect; GET /api/tutors/{id}; GET /api/tutors/{id}/offerings; GET /api/tutors/{id}/reviews; không có fetch loader | EduStore tutor/offering/review; submitReport demo; chưa có server DTO/API/security/persistence | Đạt; Đại: đánh giá/báo cáo; Huy: offering DTO; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-03; C chờ API | A/D; C riêng; ID gia sư; sản phẩm cùng tutor; review/report theo module Đại |
| P39<br>TC06, TC07, TC08 | Khách/public, Học viên/phụ huynh (registry) | `ui-prototype/pages/tutor/search.html`; `ui-prototype/pages/tutor/search.html:1`; `ui-prototype/js/pages/tutor/search.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/tutor/search.html:1`; `ui-prototype/js/pages/tutor/search.js:1` | `src/main/webapp/WEB-INF/views/tutor/search.jsp` | `/tutor/search`; PageViewController.tutorSearch; view `tutor/search` | offerings, tutorSummaries, filters, sort, pageInfo | user; user-shell, user-header, brand-masthead, select, user-footer | `ui-prototype/js/pages/tutor/search.js` → `src/main/resources/static/js/pages/tutor/search.js`;<br>`ui-prototype/css/pages/tutor/search.css` → `src/main/resources/static/css/pages/tutor/search.css` | R-P39: href/src/action và JS redirect; GET /api/offerings?q&subject&grade&mode&minPrice&maxPrice&sort&page; không có fetch loader | EduStore.list offerings; UI tên Tìm gia sư; cần chốt nghĩa gian hàng; chưa có server DTO/API/security/persistence | Đạt (chủ trang); Đại: TC06; Huy: query dữ liệu; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-DAT-03; C chờ API | A/D; C riêng; q/filter/sort cùng tập; điều kiện filter do Đại chốt; giữ query/paging |
| P40<br>BB08, TC03 phần hiển thị; payout ngoài phạm vi | Học viên/phụ huynh, Gia sư (registry) | `ui-prototype/pages/wallet/overview.html`; `ui-prototype/pages/wallet/overview.html:1`; `ui-prototype/js/pages/wallet/overview.js:1` | U: HTML có; JSP/handler chưa có; demo — `ui-prototype/pages/wallet/overview.html:1`; `ui-prototype/js/pages/wallet/overview.js:1` | `src/main/webapp/WEB-INF/views/wallet/overview.jsp` | `/wallet/overview`; PageViewController.walletOverview; view `wallet/overview` | walletSummary, ledger, pageInfo | user; user-header, user-footer | `ui-prototype/js/pages/wallet/overview.js` → `src/main/resources/static/js/pages/wallet/overview.js`;<br>`ui-prototype/css/pages/wallet/overview.css` → `src/main/resources/static/css/pages/wallet/overview.css` | R-P40: href/src/action và JS redirect; GET /api/wallet; GET /api/wallet/transactions (không giao rút tiền); không có fetch loader | EduStore walletSummary/ledger theo persona; chưa có server DTO/API/security/persistence | Huy; Đại: quyền; Đạt: history; JSP-DAI-01, JSP-DAI-02, JSP-DAI-03; JSP-HUY-05; C chờ API | A/D; C riêng; Số dư/ledger từ server; empty/error; không thêm rút tiền thật |

## 3. Chín trang từng dự kiến bổ sung

Đã kiểm trực tiếp cả chín bộ HTML/CSS/JS; đều đã có, chưa có JSP. Không giao tạo lại HTML hay coi “đề xuất” là đã chuyển. Đối chiếu các script/style có dòng cụ thể trong R-Pxx.

| Trang | Mã hiện tại | Chủ | Kết luận |
| --- | --- | --- | --- |
| auth/verify-email | P17 | Đại; Huy: review | `ui-prototype/pages/auth/verify-email.html:1`; `ui-prototype/js/pages/auth/verify-email.js:6`; HTML/JS/CSS có; JSP chưa có → A, không B |
| auth/forgot-password | P13 | Đại; Huy: review | `ui-prototype/pages/auth/forgot-password.html:1`; `ui-prototype/js/pages/auth/forgot-password.js:63`; HTML/JS/CSS có; JSP chưa có → A, không B |
| auth/reset-password | P16 | Đại; Huy: review | `ui-prototype/pages/auth/reset-password.html:1`; `ui-prototype/js/pages/auth/reset-password.js:6`; HTML/JS/CSS có; JSP chưa có → A, không B |
| catalog/detail | P19 | Đạt; Huy: dữ liệu BB05 | `ui-prototype/pages/catalog/detail.html:1`; `ui-prototype/js/pages/catalog/detail.js:8`; HTML/JS/CSS có; JSP chưa có → A, không B |
| cart/index | P18 | Huy; Đạt: BB05 nút giỏ | `ui-prototype/pages/cart/index.html:1`; `ui-prototype/js/pages/cart/index.js:3`; HTML/JS/CSS có; JSP chưa có → A, không B |
| order/history | P32 | Đạt; Huy: hủy/hoàn; Đại: đánh giá/báo cáo | `ui-prototype/pages/order/history.html:1`; `ui-prototype/js/pages/order/history.js:2`; HTML/JS/CSS có; JSP chưa có → A, không B |
| tutor/manage | P36 | Huy; Đại: biểu đồ | `ui-prototype/pages/tutor/manage.html:1`; `ui-prototype/js/pages/tutor/manage.js:2`; HTML/JS/CSS có; JSP chưa có → A, không B |
| admin/manage | P06 | Huy; Đại: quyền/layout | `ui-prototype/pages/admin/manage.html:1`; `ui-prototype/js/pages/admin/manage.js:2`; HTML/JS/CSS có; JSP chưa có → A, không B |
| home | P24 | Đạt; Đại: layout/router | `ui-prototype/pages/home.html:1`; `ui-prototype/js/pages/home.js:3`; HTML/JS/CSS có; JSP chưa có → A, không B |

Không thấy thiếu trang HTML bắt buộc trong bộ 40 theo static-check. BB03 là action logout trên header, không cần tạo trang logout. TC04/TC05 đã có vùng/modal trong history/profile/contract; thiếu backend và tách module, không tự thêm trang độc lập. TC02 chưa có control cập nhật đơn tương ứng trong tab orders seller (hiện là drawer đọc ở `ui-prototype/js/pages/tutor/manage.js:237–301`): đây là thiếu UI hành động trong trang hiện có, cần bổ sung có điều kiện ở JSP-HUY-08, không phải thiếu cả trang.

## 4. Tham chiếu từng trang (R-Pxx)

Danh sách đọc từ file hiện tại: mọi script và stylesheet/favicon, href điều hướng duy nhất, mọi opening form tag và vị trí JS dùng URL/storage. Với mỗi tài nguyên `ui-prototype/...`, đích production là thay prefix bằng `src/main/resources/static/...`; HTML dưới pages chuyển sang route ma trận, không copy HTML vào static. Asset URL JSP phải dùng context path. Form không có action hiện đang dùng client handler; chưa có server form submission.

### R-P01 — account/profile

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/account/profile.html:163`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/account/profile.html:164`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/account/profile.html:165`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/account/profile.html:166`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/account/profile.js`; `ui-prototype/pages/account/profile.html:167`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/account/profile.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/account/profile.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/account/profile.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/account/profile.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/account/profile.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/account/profile.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/account/profile.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/account/profile.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/account/profile.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/account/profile.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/account/profile.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/account-footer.css`; `ui-prototype/pages/account/profile.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/account/profile.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/account/profile.css`; `ui-prototype/pages/account/profile.html:20` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/account/profile.html:26` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/account/profile.html:32` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/account/profile.html:33` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/account/profile.html:37` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/account/profile.html:65` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/account/profile.html:70` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/account/profile.html:75` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `#ho-so`; `ui-prototype/pages/account/profile.html:99` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="profile-form" novalidate data-profile-form>`; `ui-prototype/pages/account/profile.html:127` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| API / dữ liệu | GET/PATCH /api/account/profile; Hồ sơ hardcode trong HTML; lưu chỉ đổi DOM (JS:18,72–86) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P02 — admin/audit-logs

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/audit-logs.html:377`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/audit-logs.html:378`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/audit-logs.html:379`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/audit-logs.html:380`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/audit-logs.html:381`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/audit-logs.html:382`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/audit-logs.html:383`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/admin/audit-logs.html:384`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/admin/audit-logs.html:385`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/admin/audit-logs.html:386`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/admin/audit-logs.html:387`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 12 | `ui-prototype/js/pages/admin/audit-logs.js`; `ui-prototype/pages/admin/audit-logs.html:388`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/audit-logs.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/audit-logs.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/audit-logs.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/audit-logs.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/audit-logs.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/audit-logs.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/audit-logs.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/audit-logs.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/audit-logs.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/audit-logs.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/admin/audit-logs.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/admin/audit-logs.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-chip.css`; `ui-prototype/pages/admin/audit-logs.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/admin/audit-logs.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/admin/audit-logs.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/admin/audit-logs.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/audit-logs.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/audit-logs.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/audit-logs.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/audit-logs.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/audit-logs.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/audit-logs.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/admin/audit-logs.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/admin/audit-logs.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/audit-logs.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/audit-logs.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/audit-logs.css`; `ui-prototype/pages/admin/audit-logs.html:33` | CSS/assets static cùng hậu tố; c:url |
| href | `#audit-main`; `ui-prototype/pages/admin/audit-logs.html:36` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/audit-logs.html:42` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/audit-logs.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/audit-logs.html:56` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/audit-logs.html:60` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/audit-logs.html:64` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/audit-logs.html:68` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/audit-logs.html:72` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-detail.html?id=TT-8841`; `ui-prototype/pages/admin/audit-logs.html:91` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9041`; `ui-prototype/pages/admin/audit-logs.html:96` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0841`; `ui-prototype/pages/admin/audit-logs.html:101` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/audit-logs.html:131` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/audit-logs.html:81` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="audit-logs__filters" role="search" id="audit-filters" data-audit-filters>`; `ui-prototype/pages/admin/audit-logs.html:178` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/audit-logs.js:490` — `` const module = new URLSearchParams(window.location.search).get('module'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API nhật ký; Bảng nhật ký riêng trong JS; lọc/paging demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P03 — admin/dashboard

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/dashboard.html:357`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/dashboard.html:358`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/dashboard.html:359`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/charts.js`; `ui-prototype/pages/admin/dashboard.html:360`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/dashboard.html:361`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/dashboard.html:362`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/dashboard.html:363`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/dashboard.html:364`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/pages/admin/dashboard.js`; `ui-prototype/pages/admin/dashboard.html:365`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/dashboard.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/dashboard.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/dashboard.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/dashboard.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/dashboard.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/dashboard.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/dashboard.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/dashboard.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/dashboard.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/dashboard.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/admin/dashboard.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/dashboard.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/dashboard.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/dashboard.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/dashboard.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/admin/dashboard.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/dashboard.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/chart.css`; `ui-prototype/pages/admin/dashboard.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/dashboard.css`; `ui-prototype/pages/admin/dashboard.html:25` | CSS/assets static cùng hậu tố; c:url |
| href | `#dashboard-main`; `ui-prototype/pages/admin/dashboard.html:28` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/dashboard.html:34` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/dashboard.html:45` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/dashboard.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/dashboard.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/dashboard.html:56` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/dashboard.html:60` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/dashboard.html:64` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-detail.html?id=TT-8841`; `ui-prototype/pages/admin/dashboard.html:84` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9041`; `ui-prototype/pages/admin/dashboard.html:89` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0841`; `ui-prototype/pages/admin/dashboard.html:94` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html?status=pending`; `ui-prototype/pages/admin/dashboard.html:108` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html?status=pending`; `ui-prototype/pages/admin/dashboard.html:109` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/dashboard.html:124` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html?status=open`; `ui-prototype/pages/admin/dashboard.html:162` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html?module=tutor`; `ui-prototype/pages/admin/dashboard.html:163` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/dashboard.html:74` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| API / dữ liệu | GET /api/statistics?from&to; GET /api/statistics/order-status; EduStore + façade tutor/payout; bar/pie demo (JS:305,356) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P04 — admin/job-review-detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/job-review-detail.html:216`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/job-review-detail.html:217`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/job-review-detail.html:218`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/job-review-detail.html:219`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/job-review-detail.html:220`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/job-review-detail.html:221`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/job-review-detail.html:222`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/admin/job-review-detail.html:223`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/admin/job-review-detail.html:224`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/admin/job-review-data.js`; `ui-prototype/pages/admin/job-review-detail.html:225`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/admin/job-review-detail.js`; `ui-prototype/pages/admin/job-review-detail.html:226`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/job-review-detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/job-review-detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/job-review-detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/job-review-detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/job-review-detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/job-review-detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/job-review-detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/job-review-detail.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/job-review-detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/job-review-detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/job-review-detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/admin/job-review-detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/job-review-detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/job-review-detail.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/admin/job-review-detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/job-review-detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/job-review-detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/admin/job-review-detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/admin/job-review-detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/job-review-detail.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/job-review-detail.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/job-review-detail.css`; `ui-prototype/pages/admin/job-review-detail.html:28` | CSS/assets static cùng hậu tố; c:url |
| href | `#review-main`; `ui-prototype/pages/admin/job-review-detail.html:31` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/job-review-detail.html:36` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/job-review-detail.html:47` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/job-review-detail.html:50` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/job-review-detail.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/job-review-detail.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/job-review-detail.html:62` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/job-review-detail.html:66` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-detail.html?id=TT-8839`; `ui-prototype/pages/admin/job-review-detail.html:84` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9041`; `ui-prototype/pages/admin/job-review-detail.html:89` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0841`; `ui-prototype/pages/admin/job-review-detail.html:94` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/job-review-detail.html:124` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/job-review-detail.html:74` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/job-review-detail.js:71` — `` const requestedId = (new URLSearchParams(window.location.search).get('id') \|\| '').trim().toUpperCase(); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/job-review-detail.js:203` — `` window.setTimeout(() => window.location.reload(), 900); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/jobs/{id}; POST /api/admin/jobs/{id}/decision; EduStore qua job-review-data; quyết định demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P05 — admin/job-review-queue

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/job-review-queue.html:235`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/job-review-queue.html:236`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/job-review-queue.html:237`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/job-review-queue.html:238`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/job-review-queue.html:239`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/job-review-queue.html:240`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/job-review-queue.html:241`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/admin/job-review-queue.html:242`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/admin/job-review-queue.html:243`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/admin/job-review-queue.html:244`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/admin/job-review-data.js`; `ui-prototype/pages/admin/job-review-queue.html:245`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 12 | `ui-prototype/js/pages/admin/job-review-queue.js`; `ui-prototype/pages/admin/job-review-queue.html:246`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/job-review-queue.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/job-review-queue.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/job-review-queue.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/job-review-queue.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/job-review-queue.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/job-review-queue.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/job-review-queue.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/job-review-queue.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/job-review-queue.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/admin/job-review-queue.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/admin/job-review-queue.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/admin/job-review-queue.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/admin/job-review-queue.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/job-review-queue.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/job-review-queue.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/job-review-queue.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/job-review-queue.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/job-review-queue.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/job-review-queue.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/admin/job-review-queue.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/job-review-queue.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/job-review-queue.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/job-review-queue.css`; `ui-prototype/pages/admin/job-review-queue.html:29` | CSS/assets static cùng hậu tố; c:url |
| href | `#queue-main`; `ui-prototype/pages/admin/job-review-queue.html:32` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/job-review-queue.html:37` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/job-review-queue.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/job-review-queue.html:51` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/job-review-queue.html:55` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/job-review-queue.html:59` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/job-review-queue.html:63` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/job-review-queue.html:67` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-detail.html?id=TT-8839`; `ui-prototype/pages/admin/job-review-queue.html:85` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9041`; `ui-prototype/pages/admin/job-review-queue.html:90` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0841`; `ui-prototype/pages/admin/job-review-queue.html:95` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/job-review-queue.html:125` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-detail.html`; `ui-prototype/pages/admin/job-review-queue.html:231` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/job-review-queue.html:75` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="job-review-queue__filters" role="search" data-queue-filters>`; `ui-prototype/pages/admin/job-review-queue.html:180` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/job-review-queue.js:165` — `` const params = new URLSearchParams(window.location.search); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/job-review-queue.js:166` — `` const requested = params.get('status'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/job-review-queue.js:179` — `` const sort = params.get('sort'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/jobs?status&page&sort; EduStore.jobQueue; lọc/paging demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P06 — admin/manage

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/manage.html:545`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/manage.html:546`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/manage.html:547`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/manage.html:548`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/manage.html:549`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/manage.html:550`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/manage.html:551`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/admin/manage.html:552`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/admin/manage.html:553`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/admin/manage.html:554`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/admin/manage.html:555`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 12 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/admin/manage.html:556`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 13 | `ui-prototype/js/pages/admin/manage.js`; `ui-prototype/pages/admin/manage.html:557`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/manage.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/manage.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/manage.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/manage.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/manage.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/manage.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/manage.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/manage.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/manage.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/admin/manage.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/admin/manage.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/admin/manage.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/admin/manage.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/admin/manage.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/admin/manage.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/admin/manage.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/manage.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/manage.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/manage.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/manage.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/manage.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/manage.html:35` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/manage.html:36` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/manage.html:37` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/admin/manage.html:38` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/admin/manage.html:39` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/manage.html:40` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/manage.css`; `ui-prototype/pages/admin/manage.html:41` | CSS/assets static cùng hậu tố; c:url |
| href | `#admin-manage-main`; `ui-prototype/pages/admin/manage.html:44` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/manage.html:49` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/manage.html:60` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/manage.html:63` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/manage.html:67` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/manage.html:71` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/manage.html:75` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/manage.html:79` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html?tab=users`; `ui-prototype/pages/admin/manage.html:98` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html?tab=offerings`; `ui-prototype/pages/admin/manage.html:103` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html?tab=orders`; `ui-prototype/pages/admin/manage.html:108` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html?status=pending`; `ui-prototype/pages/admin/manage.html:122` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html?status=pending`; `ui-prototype/pages/admin/manage.html:123` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/manage.html:138` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/manage.html:88` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:55` — `` const rawTab = Route.param('tab', 'adminManage', 'users') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:67` — `` window.history.replaceState(null, '', `${window.location.pathname}?tab=${encodeURIComponent(key)}`) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:112` — `` link.href = Route.page('tutorProfile', { id: user.tutorId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:211` — `` window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; trạng thái tài khoản giữ nguyên như trước.' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:381` — `` window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; catalog giữ nguyên trạng thái trước đó.' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:484` — `` link.href = Route.page('contractStudentDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/manage.js:555` — `` link.href = Route.page('contractStudentDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/users\|offerings\|orders; PATCH /api/admin/users/{id}/state; POST /api/admin/offerings/{id}/transition; EduStore; khóa tài khoản, duyệt offering giả lập | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P07 — admin/payout-request-detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/payout-request-detail.html:407`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/payout-request-detail.html:408`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/payout-request-detail.html:409`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/payout-request-detail.html:410`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/payout-request-detail.html:411`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/payout-request-detail.html:412`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/payout-request-detail.html:413`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/admin/payout-request-detail.html:414`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/admin/payout-request-detail.html:415`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/admin/payout-request-detail.js`; `ui-prototype/pages/admin/payout-request-detail.html:416`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/payout-request-detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/payout-request-detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/payout-request-detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/payout-request-detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/payout-request-detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/payout-request-detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/payout-request-detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/payout-request-detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/payout-request-detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/payout-request-detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/payout-request-detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/admin/payout-request-detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/payout-request-detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/payout-request-detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/payout-request-detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/admin/payout-request-detail.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/admin/payout-request-detail.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/admin/payout-request-detail.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/checkbox.css`; `ui-prototype/pages/admin/payout-request-detail.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/payout-request-detail.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/payout-request-detail.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/admin/payout-request-detail.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/admin/payout-request-detail.html:34` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/payout-request-detail.html:35` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/payout-request-detail.html:36` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/payout-request-detail.css`; `ui-prototype/pages/admin/payout-request-detail.html:37` | CSS/assets static cùng hậu tố; c:url |
| href | `#payout-detail-main`; `ui-prototype/pages/admin/payout-request-detail.html:40` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/payout-request-detail.html:46` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/payout-request-detail.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/payout-request-detail.html:60` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/payout-request-detail.html:64` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/payout-request-detail.html:68` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/payout-request-detail.html:72` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/payout-request-detail.html:76` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0832`; `ui-prototype/pages/admin/payout-request-detail.html:115` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/payout-request-detail.html:130` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/payout-request-detail.html:85` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/payout-request-detail.js:6` — `` const requestedId = new URLSearchParams(window.location.search).get('id'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/payout-request-detail.js:419` — `` // Quay lại trang sau khi xử lý ở tab khác (bfcache): đọc lại sessionStorage và vẽ lại. `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API payout; EduPayout fixture riêng, sessionStorage; không chuyển khoản | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P08 — admin/payout-requests

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/payout-requests.html:246`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/payout-requests.html:247`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/payout-requests.html:248`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/payout-requests.html:249`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/payout-requests.html:250`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/payout-requests.html:251`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/payout-requests.html:252`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/admin/payout-requests.html:253`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/admin/payout-requests.html:254`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/admin/payout-requests.html:255`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/admin/payout-requests.js`; `ui-prototype/pages/admin/payout-requests.html:256`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/payout-requests.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/payout-requests.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/payout-requests.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/payout-requests.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/payout-requests.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/payout-requests.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/payout-requests.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/payout-requests.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/payout-requests.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/payout-requests.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/admin/payout-requests.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/admin/payout-requests.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/admin/payout-requests.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/admin/payout-requests.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/payout-requests.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/payout-requests.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/payout-requests.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/payout-requests.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/payout-requests.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/payout-requests.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/admin/payout-requests.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/payout-requests.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/payout-requests.html:34` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/payout-requests.css`; `ui-prototype/pages/admin/payout-requests.html:35` | CSS/assets static cùng hậu tố; c:url |
| href | `#payout-main`; `ui-prototype/pages/admin/payout-requests.html:38` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/payout-requests.html:44` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/payout-requests.html:55` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/payout-requests.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/payout-requests.html:62` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/payout-requests.html:66` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/payout-requests.html:70` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/payout-requests.html:74` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0841`; `ui-prototype/pages/admin/payout-requests.html:93` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html?id=PO-2026-0832`; `ui-prototype/pages/admin/payout-requests.html:108` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/payout-requests.html:123` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-request-detail.html`; `ui-prototype/pages/admin/payout-requests.html:242` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/payout-requests.html:83` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="payout-requests__filters" role="search" data-payout-filters>`; `ui-prototype/pages/admin/payout-requests.html:188` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/payout-requests.js:197` — `` const params = new URLSearchParams(window.location.search); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/payout-requests.js:198` — `` const requested = params.get('status'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/payout-requests.js:213` — `` // Kết quả xử lý ở trang chi tiết lưu trong sessionStorage; quay lại danh sách là trạng thái cập nhật theo. `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API payout; EduPayout fixture riêng | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P09 — admin/report-detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/report-detail.html:310`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/report-detail.html:311`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/report-detail.html:312`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/report-detail.html:313`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/report-detail.html:314`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/report-detail.html:315`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/report-detail.html:316`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/radio.js`; `ui-prototype/pages/admin/report-detail.html:317`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/admin/report-detail.html:318`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/admin/report-detail.html:319`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/admin/report-data.js`; `ui-prototype/pages/admin/report-detail.html:320`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 12 | `ui-prototype/js/pages/admin/report-detail.js`; `ui-prototype/pages/admin/report-detail.html:321`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/report-detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/report-detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/report-detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/report-detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/report-detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/report-detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/report-detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/report-detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/report-detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/report-detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/report-detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/admin/report-detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/admin/report-detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/report-detail.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/report-detail.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/file-attachment-item.css`; `ui-prototype/pages/admin/report-detail.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/admin/report-detail.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/admin/report-detail.html:35` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/admin/report-detail.html:37` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/report-detail.html:39` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/report-detail.html:41` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/admin/report-detail.html:43` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/admin/report-detail.html:45` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/report-detail.html:47` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/report-detail.html:48` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/report-detail.css`; `ui-prototype/pages/admin/report-detail.html:49` | CSS/assets static cùng hậu tố; c:url |
| href | `#report-main`; `ui-prototype/pages/admin/report-detail.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/report-detail.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/report-detail.html:68` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/report-detail.html:71` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/report-detail.html:75` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/report-detail.html:79` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/report-detail.html:83` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/report-detail.html:87` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `report-detail.html?id=BC-2026-041`; `ui-prototype/pages/admin/report-detail.html:105` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/report-detail.html:140` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/report-detail.html:95` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/report-detail.js:6` — `` const requestedId = new URLSearchParams(window.location.search).get('id'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/reports/{id}; POST /api/admin/reports/{id}/decision; EduReport→EduStore; quyết định demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P10 — admin/reports

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/reports.html:261`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/reports.html:262`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/reports.html:263`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/reports.html:264`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/reports.html:265`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/reports.html:266`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/reports.html:267`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/admin/reports.html:268`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/admin/reports.html:269`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/admin/reports.html:270`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/admin/report-data.js`; `ui-prototype/pages/admin/reports.html:271`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 12 | `ui-prototype/js/pages/admin/reports.js`; `ui-prototype/pages/admin/reports.html:272`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/reports.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/reports.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/reports.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/reports.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/reports.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/reports.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/reports.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/reports.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/reports.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/admin/reports.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/admin/reports.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/admin/reports.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/admin/reports.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/reports.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/reports.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/reports.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/reports.html:34` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/reports.html:36` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/reports.html:38` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/admin/reports.html:40` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/reports.html:42` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/reports.html:43` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/reports.css`; `ui-prototype/pages/admin/reports.html:44` | CSS/assets static cùng hậu tố; c:url |
| href | `#reports-main`; `ui-prototype/pages/admin/reports.html:47` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/reports.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/reports.html:63` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/reports.html:66` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/reports.html:70` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/reports.html:74` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/reports.html:78` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/reports.html:82` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `report-detail.html?id=BC-2026-041`; `ui-prototype/pages/admin/reports.html:100` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `report-detail.html?id=BC-2026-040`; `ui-prototype/pages/admin/reports.html:105` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/reports.html:140` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `report-detail.html`; `ui-prototype/pages/admin/reports.html:257` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/reports.html:90` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="reports__filters" role="search" data-reports-filters>`; `ui-prototype/pages/admin/reports.html:204` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/reports.js:174` — `` const params = new URLSearchParams(window.location.search); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/reports.js:175` — `` const requested = params.get('status'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/reports.js:218` — `` // Trang chi tiết lưu kết luận vào sessionStorage; quay lại danh sách phải đọc lại trạng thái. `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/reports?status&page; EduReport→EduStore; unresolved gộp trạng thái | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P11 — admin/tutor-review-detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/tutor-review-detail.html:268`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/tutor-review-detail.html:269`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/tutor-review-detail.html:270`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/tutor-review-detail.html:271`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/tutor-review-detail.html:272`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/tutor-review-detail.html:273`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/tutor-review-detail.html:274`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/admin/tutor-review-detail.html:275`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/admin/tutor-review-detail.html:276`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/admin/tutor-review-detail.js`; `ui-prototype/pages/admin/tutor-review-detail.html:277`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/tutor-review-detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/tutor-review-detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/tutor-review-detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/tutor-review-detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/tutor-review-detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/tutor-review-detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/tutor-review-detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/tutor-review-detail.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/tutor-review-detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/tutor-review-detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/tutor-review-detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/admin/tutor-review-detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/admin/tutor-review-detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/tutor-review-detail.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/admin/tutor-review-detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/tutor-review-detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/admin/tutor-review-detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/file-attachment-item.css`; `ui-prototype/pages/admin/tutor-review-detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/admin/tutor-review-detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/checkbox.css`; `ui-prototype/pages/admin/tutor-review-detail.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/tutor-review-detail.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/admin/tutor-review-detail.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/admin/tutor-review-detail.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/admin/tutor-review-detail.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/tutor-review-detail.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/tutor-review-detail.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/tutor-review-detail.css`; `ui-prototype/pages/admin/tutor-review-detail.html:33` | CSS/assets static cùng hậu tố; c:url |
| href | `#review-main`; `ui-prototype/pages/admin/tutor-review-detail.html:36` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/tutor-review-detail.html:41` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/tutor-review-detail.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/tutor-review-detail.html:55` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/tutor-review-detail.html:59` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/tutor-review-detail.html:63` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/tutor-review-detail.html:67` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/tutor-review-detail.html:71` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/tutor-review-detail.html:119` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/tutor-review-detail.html:79` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/tutor-review-detail.js:6` — `` const requested = new URLSearchParams(window.location.search).get('id'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/tutor-review-detail.js:120` — `` window.history.replaceState({}, '', `${window.location.pathname}?id=${encodeURIComponent(profile.id)}`); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/tutor-reviews/{id}; POST /api/admin/tutor-reviews/{id}/decision; EduTutorReview: fixture HSGS riêng; chưa gắn tutor thật | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P12 — admin/tutor-review-queue

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/admin/tutor-review-queue.html:226`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/admin/tutor-review-queue.html:227`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/admin/tutor-review-queue.html:228`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/admin/tutor-review-data.js`; `ui-prototype/pages/admin/tutor-review-queue.html:229`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/admin/payout-data.js`; `ui-prototype/pages/admin/tutor-review-queue.html:230`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/admin-sidebar.js`; `ui-prototype/pages/admin/tutor-review-queue.html:231`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/admin-header.js`; `ui-prototype/pages/admin/tutor-review-queue.html:232`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/admin/tutor-review-queue.html:233`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/admin/tutor-review-queue.html:234`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/admin/tutor-review-queue.html:235`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/admin/tutor-review-queue.js`; `ui-prototype/pages/admin/tutor-review-queue.html:236`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/admin/tutor-review-queue.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/admin/tutor-review-queue.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/admin/tutor-review-queue.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/admin/tutor-review-queue.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/admin/tutor-review-queue.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/admin/tutor-review-queue.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/admin/tutor-review-queue.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-sidebar.css`; `ui-prototype/pages/admin/tutor-review-queue.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/admin-header.css`; `ui-prototype/pages/admin/tutor-review-queue.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/admin/tutor-review-queue.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/admin/tutor-review-queue.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/admin/tutor-review-queue.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/admin/tutor-review-queue.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/admin/tutor-review-queue.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/admin/tutor-review-queue.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/admin/tutor-review-queue.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/admin/tutor-review-queue.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/admin/tutor-review-queue.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/admin/tutor-review-queue.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/admin/tutor-review-queue.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/admin/tutor-review-queue.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/admin/tutor-review-queue.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/admin/tutor-review-queue.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/admin/tutor-review-queue.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/admin/tutor-review-queue.css`; `ui-prototype/pages/admin/tutor-review-queue.html:31` | CSS/assets static cùng hậu tố; c:url |
| href | `#queue-main`; `ui-prototype/pages/admin/tutor-review-queue.html:34` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `dashboard.html`; `ui-prototype/pages/admin/tutor-review-queue.html:39` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `manage.html`; `ui-prototype/pages/admin/tutor-review-queue.html:50` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-queue.html`; `ui-prototype/pages/admin/tutor-review-queue.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `job-review-queue.html`; `ui-prototype/pages/admin/tutor-review-queue.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reports.html`; `ui-prototype/pages/admin/tutor-review-queue.html:61` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `payout-requests.html`; `ui-prototype/pages/admin/tutor-review-queue.html:65` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `audit-logs.html`; `ui-prototype/pages/admin/tutor-review-queue.html:69` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9041`; `ui-prototype/pages/admin/tutor-review-queue.html:87` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9031`; `ui-prototype/pages/admin/tutor-review-queue.html:101` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html?id=HSGS-9035`; `ui-prototype/pages/admin/tutor-review-queue.html:102` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/admin/tutor-review-queue.html:117` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-review-detail.html`; `ui-prototype/pages/admin/tutor-review-queue.html:222` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="admin-header__search" role="search" data-admin-search>`; `ui-prototype/pages/admin/tutor-review-queue.html:77` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="tutor-review-queue__filters" role="search" data-queue-filters>`; `ui-prototype/pages/admin/tutor-review-queue.html:169` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/admin/tutor-review-queue.js:176` — `` const params = new URLSearchParams(window.location.search); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/admin/tutor-review-queue.js:177` — `` const requested = params.get('status'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/admin/tutor-reviews?status&page; EduTutorReview fixture riêng; sessionStorage | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P13 — auth/forgot-password

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/auth/forgot-password.html:86`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/pages/auth/forgot-password.js`; `ui-prototype/pages/auth/forgot-password.html:87`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/auth/forgot-password.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/auth/forgot-password.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/auth/forgot-password.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/auth/forgot-password.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/auth/forgot-password.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/auth/forgot-password.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/auth/forgot-password.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/auth/forgot-password.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/auth/forgot-password.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/auth/forgot-password.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/login.css`; `ui-prototype/pages/auth/forgot-password.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/forgot-password.css`; `ui-prototype/pages/auth/forgot-password.html:19` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/auth/forgot-password.html:24` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `login.html`; `ui-prototype/pages/auth/forgot-password.html:76` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `register.html`; `ui-prototype/pages/auth/forgot-password.html:77` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reset-password.html?token=[đã che]`; `ui-prototype/pages/auth/forgot-password.html:78` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="auth-login-form" novalidate data-forgot-form>`; `ui-prototype/pages/auth/forgot-password.html:58` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| API / dữ liệu | POST /api/auth/forgot-password (email sandbox); JS setTimeout, không gửi email (JS:63–66) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P14 — auth/login

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/auth/login.html:105`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/auth/login.html:106`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/auth/login.html:107`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/password-input.js`; `ui-prototype/pages/auth/login.html:108`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/auth/login.js`; `ui-prototype/pages/auth/login.html:109`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/auth/login.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/auth/login.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/auth/login.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/auth/login.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/auth/login.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/auth/login.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/auth/login.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/auth/login.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/password-input.css`; `ui-prototype/pages/auth/login.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/checkbox.css`; `ui-prototype/pages/auth/login.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/auth/login.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/auth/login.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/login.css`; `ui-prototype/pages/auth/login.html:19` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/auth/login.html:25` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `forgot-password.html`; `ui-prototype/pages/auth/login.html:73` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `register.html`; `ui-prototype/pages/auth/login.html:92` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `verify-email.html?token=[đã che]`; `ui-prototype/pages/auth/login.html:95` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reset-password.html?token=[đã che]`; `ui-prototype/pages/auth/login.html:97` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="auth-login-form" novalidate data-login-form>`; `ui-prototype/pages/auth/login.html:62` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/auth/login.js:85` — `` const raw = window.sessionStorage.getItem(NOTICE_KEY); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/login.js:87` — `` window.sessionStorage.removeItem(NOTICE_KEY); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/login.js:97` — `` return Boolean(window.sessionStorage.getItem(Store.SESSION_KEY)); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/login.js:126` — `` Route.go('login'); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/login.js:130` — `` const initialState = new URLSearchParams(window.location.search).get('state') \|\| loginPage.dataset.loginState; `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/login.js:157` — `` window.setTimeout(() => Route.go(target), 700); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | POST /api/auth/login; POST /api/auth/logout; EduStore.login chọn persona; không kiểm mật khẩu (JS:147; store:302–309) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P15 — auth/register

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/auth/register.html:59`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/auth/register.html:60`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/auth/register.html:61`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/password-input.js`; `ui-prototype/pages/auth/register.html:62`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/auth/register.js`; `ui-prototype/pages/auth/register.html:63`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/auth/register.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/auth/register.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/auth/register.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/auth/register.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/auth/register.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/auth/register.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/auth/register.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/auth/register.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/password-input.css`; `ui-prototype/pages/auth/register.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/auth/register.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/register.css`; `ui-prototype/pages/auth/register.html:17` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/auth/register.html:23` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `login.html`; `ui-prototype/pages/auth/register.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `forgot-password.html`; `ui-prototype/pages/auth/register.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `verify-email.html?token=[đã che]`; `ui-prototype/pages/auth/register.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `reset-password.html?token=[đã che]`; `ui-prototype/pages/auth/register.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="auth-register-form" novalidate data-register-form>`; `ui-prototype/pages/auth/register.html:36` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| API / dữ liệu | POST /api/auth/register (email sandbox); JS validation + setTimeout (JS:65–71) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P16 — auth/reset-password

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/auth/reset-password.html:153`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/auth/reset-password.html:154`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/auth/reset-password.html:155`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/password-input.js`; `ui-prototype/pages/auth/reset-password.html:156`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/auth/reset-password.js`; `ui-prototype/pages/auth/reset-password.html:157`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/auth/reset-password.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/auth/reset-password.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/auth/reset-password.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/auth/reset-password.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/auth/reset-password.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/auth/reset-password.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/auth/reset-password.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/auth/reset-password.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/password-input.css`; `ui-prototype/pages/auth/reset-password.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/auth/reset-password.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/auth/reset-password.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/auth/reset-password.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/login.css`; `ui-prototype/pages/auth/reset-password.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/reset-password.css`; `ui-prototype/pages/auth/reset-password.html:21` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/auth/reset-password.html:26` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `forgot-password.html`; `ui-prototype/pages/auth/reset-password.html:96` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `login.html`; `ui-prototype/pages/auth/reset-password.html:97` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="auth-login-form" novalidate data-reset-form>`; `ui-prototype/pages/auth/reset-password.html:57` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/auth/reset-password.js:46` — `` const token = Route.param('token', 'resetPassword', null); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/reset-password.js:98` — `` window.sessionStorage.setItem(NOTICE_KEY, JSON.stringify({ code: 'password-reset', at: new Date().toISOString() })); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/reset-password.js:126` — `` window.setTimeout(() => Route.go('login'), 1200); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/reset-password.js:149` — `` link.href = Route.page('resetPassword', { token: item.token }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | POST /api/auth/reset-password; EduFixtures.authTokens + cờ sessionStorage; không đổi mật khẩu thật | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P17 — auth/verify-email

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/auth/verify-email.html:115`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/auth/verify-email.html:116`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/auth/verify-email.html:117`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/pages/auth/verify-email.js`; `ui-prototype/pages/auth/verify-email.html:118`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/auth/verify-email.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/auth/verify-email.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/auth/verify-email.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/auth/verify-email.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/auth/verify-email.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/auth/verify-email.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/auth/verify-email.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/auth/verify-email.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/auth/verify-email.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/auth/verify-email.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/auth/verify-email.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/login.css`; `ui-prototype/pages/auth/verify-email.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/auth/verify-email.css`; `ui-prototype/pages/auth/verify-email.html:20` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/auth/verify-email.html:25` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `login.html`; `ui-prototype/pages/auth/verify-email.html:43` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `register.html`; `ui-prototype/pages/auth/verify-email.html:44` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/auth/verify-email.js:35` — `` const token = Route.param('token', 'verifyEmail', null); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/auth/verify-email.js:78` — `` link.href = Route.page('verifyEmail', { token: item.token }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | POST /api/auth/verify-email; POST /api/auth/resend-verification; EduFixtures.authTokens; resend setTimeout | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P18 — cart/index

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/cart/index.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/cart/index.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/cart/index.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/cart/index.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/cart/index.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/cart/index.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/cart/index.js`; `ui-prototype/pages/cart/index.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/cart/index.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/cart/index.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/cart/index.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/cart/index.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/cart/index.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/cart/index.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/cart/index.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/cart/index.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/cart/index.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/cart/index.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/cart/index.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/cart/index.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/cart/index.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/cart/index.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/cart/index.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/cart/index.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/cart/index.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/cart/index.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/cart/index.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/cart/index.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/cart/index.css`; `ui-prototype/pages/cart/index.html:27` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/cart/index.html:42` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/cart/index.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/cart/index.html:49` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/cart/index.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/cart/index.html:81` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/auth/login.html`; `ui-prototype/pages/cart/index.html:141` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/cart/index.html:179` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/cart/index.js:95` — `` card.querySelector('[data-item-detail]').setAttribute('href', route.page('catalogDetail', { id: item.offeringId })) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/cart/index.js:432` — `` route.go('contractConfirm', { contract: result.data.contractId, order: result.data.orderId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/cart; POST /api/cart/items; PATCH/DELETE /api/cart/items/{id}; EduStore.cart* + checkoutFromCart demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P19 — catalog/detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/catalog/detail.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/catalog/detail.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/catalog/detail.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/catalog/detail.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/catalog/detail.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/pages/catalog/detail.js`; `ui-prototype/pages/catalog/detail.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/catalog/detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/catalog/detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/catalog/detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/catalog/detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/catalog/detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/catalog/detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/catalog/detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/catalog/detail.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/catalog/detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/catalog/detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/catalog/detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/catalog/detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/catalog/detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/catalog/detail.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/catalog/detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/catalog/detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/catalog/detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/catalog/detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/catalog/detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/catalog/detail.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/catalog/detail.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/catalog/detail.css`; `ui-prototype/pages/catalog/detail.html:28` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/catalog/detail.html:42` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/catalog/detail.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/catalog/detail.html:49` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/catalog/detail.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/catalog/detail.html:81` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/catalog/detail.html:231` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/catalog/detail.js:27` — `` const offeringId = route.param('id', 'catalogDetail') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/catalog/detail.js:100` — `` if (tutor) tutorLink.setAttribute('href', route.page('tutorProfile', { id: tutor.id })) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/catalog/detail.js:164` — `` inviteLink.setAttribute('href', route.page('invitationCreate', params)) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/catalog/detail.js:254` — `` onAction: () => route.go('cart') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/catalog/detail.js:263` — `` 'storage-failed': 'Không lưu được giỏ (sessionStorage bị chặn). Trạng thái được giữ nguyên.' `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/offerings/{id}; POST /api/cart/items; EduStore.offering/tutor/cartAdd; chỉ công khai offering hợp lệ | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P20 — chat/messages

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/chat/messages.html:22`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/chat/messages.html:23`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/chat/messages.html:24`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/chat/messages.html:25`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/chat/messages.html:26`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/chat/messages.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/chat/messages.js`; `ui-prototype/pages/chat/messages.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/chat/messages.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/chat/messages.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/chat/messages.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/chat/messages.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/chat/messages.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/chat/messages.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/chat/messages.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/chat/messages.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/chat/messages.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/chat/messages.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-chip.css`; `ui-prototype/pages/chat/messages.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/chat/message-thread-item.css`; `ui-prototype/pages/chat/messages.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/chat/messages.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/chat/messages.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/chat/messages.css`; `ui-prototype/pages/chat/messages.html:21` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/chat/messages.html:41` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/chat/messages.html:47` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/chat/messages.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/chat/messages.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html`; `ui-prototype/pages/chat/messages.html:80` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html#lich-ranh`; `ui-prototype/pages/chat/messages.html:85` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/chat/messages.html:90` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../contract/tutor-detail.html`; `ui-prototype/pages/chat/messages.html:198` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../contract/tutor-detail.html#next-lesson`; `ui-prototype/pages/chat/messages.html:295` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/chat/messages.html:308` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="chat-composer" id="message-form">`; `ui-prototype/pages/chat/messages.html:209` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/chat/messages.js:79` — `` const requestedContract = new URLSearchParams(location.search).get('contract') `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API/realtime chat; Thread hardcode; contract đọc EduStore; tin nhắn client | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P21 — contract/confirm

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/contract/confirm.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/contract/confirm.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/contract/confirm.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/contract/confirm.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/contract/confirm.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/contract/confirm.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/contract/confirm.js`; `ui-prototype/pages/contract/confirm.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/contract/confirm.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/contract/confirm.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/contract/confirm.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/contract/confirm.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/contract/confirm.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/contract/confirm.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/contract/confirm.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/contract/confirm.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/contract/confirm.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/contract/confirm.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/contract/confirm.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/contract/confirm.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/contract/confirm.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/contract/confirm.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/contract/confirm.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/contract/confirm.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/contract/confirm.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/contract/confirm.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/contract/confirm.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/contract/confirm.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/checkbox.css`; `ui-prototype/pages/contract/confirm.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/contract/confirm.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/contract/confirm.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/contract/confirm.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/contract/confirm.css`; `ui-prototype/pages/contract/confirm.html:31` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/contract/confirm.html:51` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/contract/confirm.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/contract/confirm.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/contract/confirm.html:62` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/contract/confirm.html:90` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/contract/confirm.html:95` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/contract/confirm.html:100` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../invitation/negotiation.html`; `ui-prototype/pages/contract/confirm.html:122` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../order/history.html`; `ui-prototype/pages/contract/confirm.html:145` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/contract/confirm.html:491` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:2` — `` * Local confirmation chỉ là trình diễn UI (sessionStorage cùng tab), không phải chữ ký server. */ `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:39` — `` const contractParam = Route.param('contract', 'contractConfirm') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:40` — `` const orderParam = Route.param('order', 'contractConfirm') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:79` — `` if (!sourceRef) return { href: Route.page('orderHistory'), label: 'Đơn đăng ký' } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:80` — `` if (sourceRef.type === 'invitation') return { href: Route.page('invitationNegotiation', { invite: sourceRef.id }), label: 'Lời mời gia sư' } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:81` — `` if (sourceRef.type === 'application') return { href: Route.page('jobDetail', { id: sourceRef.jobId \|\| sourceRef.id }), label: 'Tin tìm gia sư' } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:82` — `` if (sourceRef.type === 'enrollment') return { href: firstItem && firstItem.offeringId ? Route.page('catalogDetail', { id: firstItem.offeringId }) : Route.page('orderHistory'), label: 'Lớp nhóm' } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:83` — `` if (sourceRef.type === 'cart') return { href: Route.page('cart'), label: 'Giỏ đăng ký' } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:84` — `` return { href: Route.page('orderHistory'), label: 'Đơn đăng ký' } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:254` — `` const raw = window.sessionStorage.getItem(CONFIRM_KEY) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:265` — `` window.sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(record)) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:301` — `` ? Route.page('contractTutorDetail', { id: contract.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:302` — `` : Route.page('contractStudentDetail', { id: contract.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:312` — `` checkout.href = Route.page('paymentCheckout', { contract: contract.id, from: 'contract', order: order.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:337` — `` pay.href = Route.page('paymentCheckout', { contract: contract.id, from: 'contract', order: order.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/confirm.js:485` — `` window.setTimeout(() => window.location.reload(), 900) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/contracts/{id}; POST /api/orders/{id}/confirm; POST /api/orders/{id}/cancel; EduStore contract/order/payments; chữ ký local demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P22 — contract/student-detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/contract/student-detail.html:26`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/contract/student-detail.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/contract/student-detail.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/contract/student-detail.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/contract/student-detail.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/contract/student-detail.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/contract/student-detail.js`; `ui-prototype/pages/contract/student-detail.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/contract/student-detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/contract/student-detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/contract/student-detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/contract/student-detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/contract/student-detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/contract/student-detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/contract/student-detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/contract/student-detail.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/contract/student-detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/contract/student-detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/contract/student-detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/contract/student-detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/contract/student-detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/lesson/lesson-card.css`; `ui-prototype/pages/contract/student-detail.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/contract/student-detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-chip.css`; `ui-prototype/pages/contract/student-detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/contract/student-detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/contract/contract-detail.css`; `ui-prototype/pages/contract/student-detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/contract/student-detail.css`; `ui-prototype/pages/contract/student-detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/contract/student-detail.html:42` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/contract/student-detail.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/contract/student-detail.html:49` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/contract/student-detail.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/contract/student-detail.html:81` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/contract/student-detail.html:86` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/contract/student-detail.html:91` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html`; `ui-prototype/pages/contract/student-detail.html:118` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `student-detail.html`; `ui-prototype/pages/contract/student-detail.html:120` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../chat/messages.html`; `ui-prototype/pages/contract/student-detail.html:156` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html#transactions`; `ui-prototype/pages/contract/student-detail.html:385` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../payment/checkout.html`; `ui-prototype/pages/contract/student-detail.html:390` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/contract/student-detail.html:433` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/contract/student-detail.js:127` — `` const requested = Route.param('id', 'contractStudentDetail') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/student-detail.js:412` — `` window.setTimeout(() => window.location.reload(), 900) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/contracts/{id}; endpoint trạng thái/hủy theo JSP-HUY-08; POST /api/reports; EduStore; releaseSession/submitReport demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P23 — contract/tutor-detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/contract/tutor-detail.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/contract/tutor-detail.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/contract/tutor-detail.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/contract/tutor-detail.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/contract/tutor-detail.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/contract/tutor-detail.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/contract/tutor-detail.js`; `ui-prototype/pages/contract/tutor-detail.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/contract/tutor-detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/contract/tutor-detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/contract/tutor-detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/contract/tutor-detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/contract/tutor-detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/contract/tutor-detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/contract/tutor-detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/contract/tutor-detail.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/contract/tutor-detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/contract/tutor-detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/contract/tutor-detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/contract/tutor-detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/contract/tutor-detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/lesson/lesson-card.css`; `ui-prototype/pages/contract/tutor-detail.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/contract/tutor-detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-chip.css`; `ui-prototype/pages/contract/tutor-detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/contract/tutor-detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/contract/tutor-detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/contract/contract-detail.css`; `ui-prototype/pages/contract/tutor-detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/contract/tutor-detail.css`; `ui-prototype/pages/contract/tutor-detail.html:26` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/contract/tutor-detail.html:46` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/contract/tutor-detail.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/contract/tutor-detail.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/contract/tutor-detail.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html`; `ui-prototype/pages/contract/tutor-detail.html:85` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html#lich-ranh`; `ui-prototype/pages/contract/tutor-detail.html:90` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/contract/tutor-detail.html:95` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html`; `ui-prototype/pages/contract/tutor-detail.html:125` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `tutor-detail.html`; `ui-prototype/pages/contract/tutor-detail.html:127` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../chat/messages.html`; `ui-prototype/pages/contract/tutor-detail.html:164` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html#transactions`; `ui-prototype/pages/contract/tutor-detail.html:421` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/contract/tutor-detail.html:450` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/contract/tutor-detail.js:124` — `` const requested = Route.param('id', 'contractTutorDetail') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/contract/tutor-detail.js:465` — `` window.setTimeout(() => window.location.reload(), 900) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/contracts/{id}; endpoint TC02 theo JSP-HUY-08; EduStore + markAttendance demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P24 — home

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/home.html:23`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/home.html:24`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/home.html:25`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/home.html:26`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/home.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/pages/home.js`; `ui-prototype/pages/home.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/home.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/home.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/home.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/home.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/home.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/home.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/home.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/home.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/home.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/home.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/home.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/home.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/home.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/home.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/home.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/home.css`; `ui-prototype/pages/home.html:22` | CSS/assets static cùng hậu tố; c:url |
| href | `../pages/home.html`; `ui-prototype/pages/home.html:36` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../pages/tutor/search.html`; `ui-prototype/pages/home.html:42` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../pages/job/discover.html`; `ui-prototype/pages/home.html:43` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../pages/chat/messages.html`; `ui-prototype/pages/home.html:47` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../pages/account/profile.html`; `ui-prototype/pages/home.html:75` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../pages/cart/index.html`; `ui-prototype/pages/home.html:110` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../pages/job/create.html`; `ui-prototype/pages/home.html:135` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="home-search" action="../pages/tutor/search.html" method="get" role="search">`; `ui-prototype/pages/home.html:99` | GET /tutor/search với q |
| JS URL/storage | `ui-prototype/js/pages/home.js:53` — `` tutorLink.setAttribute('href', route.page('tutorProfile', { id: tutor.id })) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/home.js:72` — `` card.querySelector('[data-card-link]').setAttribute('href', route.page('catalogDetail', { id: item.id })) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/offerings?sort=latest&limit=6; EduStore.latestOfferings(6), fixture publishedAt | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P25 — invitation/create

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/invitation/create.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/invitation/create.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/invitation/create.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/invitation/create.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/radio.js`; `ui-prototype/pages/invitation/create.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/invitation/create.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/invitation/create.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/pages/invitation/create.js`; `ui-prototype/pages/invitation/create.html:39`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/invitation/create.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/invitation/create.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/invitation/create.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/invitation/create.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/invitation/create.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/invitation/create.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/invitation/create.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/invitation/create.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/invitation/create.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/invitation/create.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/invitation/create.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/invitation/create.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/invitation/create.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/invitation/create.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/invitation/create.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/rating.css`; `ui-prototype/pages/invitation/create.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/invitation/create.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/invitation/create.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/invitation/create.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/invitation/create.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/invitation/create.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/invitation/create.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/invitation/create.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/invitation/create.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/invitation/create.css`; `ui-prototype/pages/invitation/create.html:31` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/invitation/create.html:47` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/invitation/create.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/invitation/create.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/invitation/create.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/invitation/create.html:86` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/invitation/create.html:91` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/invitation/create.html:96` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../tutor/search.html`; `ui-prototype/pages/invitation/create.html:119` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../tutor/profile.html`; `ui-prototype/pages/invitation/create.html:119` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/invitation/create.html:184` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="invitation-create-form" data-invitation-form novalidate>`; `ui-prototype/pages/invitation/create.html:133` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/invitation/create.js:9` — `` const params = new URLSearchParams(window.location.search) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/invitation/create.js:10` — `` const requestedOfferingId = params.get('offeringId') \|\| params.get('offering') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/invitation/create.js:11` — `` const requestedTutorId = params.get('tutorId') \|\| params.get('tutor') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/invitation/create.js:30` — `` if (notFoundBack) notFoundBack.href = window.EduRoute ? window.EduRoute.page('tutorSearch') : '../tutor/search.html' `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/invitation/create.js:383` — `` window.location.href = `negotiation.html?id=${encodeURIComponent(result.data.id)}` `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API lời mời mới; EduStore.createInvitation demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P26 — invitation/negotiation

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/invitation/negotiation.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/invitation/negotiation.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/invitation/negotiation.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/invitation/negotiation.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/invitation/negotiation.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/invitation/negotiation.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/invitation/negotiation.js`; `ui-prototype/pages/invitation/negotiation.html:39`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/invitation/negotiation.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/invitation/negotiation.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/invitation/negotiation.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/invitation/negotiation.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/invitation/negotiation.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/invitation/negotiation.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/invitation/negotiation.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/invitation/negotiation.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/invitation/negotiation.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/invitation/negotiation.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/icon-button.css`; `ui-prototype/pages/invitation/negotiation.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/invitation/negotiation.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button-group.css`; `ui-prototype/pages/invitation/negotiation.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/invitation/negotiation.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/invitation/negotiation.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/invitation/negotiation.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/invitation/negotiation.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/invitation/negotiation.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/invitation/negotiation.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/invitation/negotiation.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/rating.css`; `ui-prototype/pages/invitation/negotiation.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/invitation/negotiation.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/invitation/negotiation.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/invitation/negotiation.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/invitation/negotiation.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/invitation/negotiation.css`; `ui-prototype/pages/invitation/negotiation.html:32` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/invitation/negotiation.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/invitation/negotiation.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/invitation/negotiation.html:59` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/invitation/negotiation.html:63` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/invitation/negotiation.html:91` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/invitation/negotiation.html:96` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/invitation/negotiation.html:101` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../contract/confirm.html`; `ui-prototype/pages/invitation/negotiation.html:331` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../chat/messages.html`; `ui-prototype/pages/invitation/negotiation.html:355` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/invitation/negotiation.html:365` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form id="counter-form" novalidate>`; `ui-prototype/pages/invitation/negotiation.html:427` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/invitation/negotiation.js:43` — `` const params = new URLSearchParams(window.location.search); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/invitation/negotiation.js:44` — `` const requestedId = params.get("id") \|\| params.get("invite"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/invitation/negotiation.js:353` — `` window.setTimeout(() => window.location.reload(), 900); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API thương lượng mới; EduStore.respondInvitation demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P27 — job/applicants

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/job/applicants.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/job/applicants.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/job/applicants.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/job/applicants.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/job/applicants.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/filter-chip.js`; `ui-prototype/pages/job/applicants.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/select.js`; `ui-prototype/pages/job/applicants.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/job/applicants.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/job/applicants.html:39`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/job/applicants.js`; `ui-prototype/pages/job/applicants.html:40`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/job/applicants.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/job/applicants.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/job/applicants.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/job/applicants.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/job/applicants.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/job/applicants.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/job/applicants.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/job/applicants.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/job/applicants.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/job/applicants.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/job/applicants.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/job/applicants.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-chip.css`; `ui-prototype/pages/job/applicants.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/job/applicants.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/job/applicants.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/checkbox.css`; `ui-prototype/pages/job/applicants.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/job/applicant-card.css`; `ui-prototype/pages/job/applicants.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/job/applicants.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/job/applicants.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/job/applicants.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/job/applicants.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/job/applicants.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/job/applicants.css`; `ui-prototype/pages/job/applicants.html:29` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/job/applicants.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/job/applicants.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/job/applicants.html:55` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/job/applicants.html:59` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/job/applicants.html:87` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/job/applicants.html:92` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/job/applicants.html:97` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `discover.html`; `ui-prototype/pages/job/applicants.html:121` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `my-job.html`; `ui-prototype/pages/job/applicants.html:122` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `detail.html`; `ui-prototype/pages/job/applicants.html:134` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../tutor/profile.html`; `ui-prototype/pages/job/applicants.html:196` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/job/applicants.html:221` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/job/applicants.js:18` — `` const params = new URLSearchParams(window.location.search) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/applicants.js:20` — `` const requestedJob = (params.get('id') \|\| params.get('job') \|\| '').trim().toUpperCase() `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/applicants.js:45` — `` try { return Boolean(window.sessionStorage.getItem(Store.SESSION_KEY)) } catch (error) { return false } `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/applicants.js:569` — `` window.setTimeout(() => window.location.reload(), 900) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API ứng tuyển/chọn gia sư; EduStore applicationsOfJob/selectApplication demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P28 — job/create

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/job/create.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/job/create.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/job/create.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/job/create.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/select.js`; `ui-prototype/pages/job/create.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/radio.js`; `ui-prototype/pages/job/create.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/job/create.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/job/create.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/pages/job/create.js`; `ui-prototype/pages/job/create.html:39`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/job/create.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/job/create.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/job/create.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/job/create.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/job/create.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/job/create.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/job/create.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/job/create.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/job/create.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/job/create.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/job/create.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/job/create.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/job/create.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/job/create.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/job/create.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/job/create.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/job/create.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/job/job-card.css`; `ui-prototype/pages/job/create.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/job/create.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/job/create.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/job/create.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/job/create.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/job/create.css`; `ui-prototype/pages/job/create.html:29` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/job/create.html:47` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/job/create.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/job/create.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/job/create.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/job/create.html:86` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/job/create.html:91` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/job/create.html:96` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `my-job.html`; `ui-prototype/pages/job/create.html:121` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/job/create.html:341` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="create-form" id="create-job-form">`; `ui-prototype/pages/job/create.html:155` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/job/create.js:45` — `` sessionStorage.setItem(draftKey, JSON.stringify({ `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/create.js:62` — `` const rawDraft = sessionStorage.getItem(draftKey) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/create.js:83` — `` sessionStorage.removeItem(draftKey) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/create.js:178` — `` sessionStorage.removeItem(draftKey) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/create.js:183` — `` sessionStorage.removeItem(draftKey) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/job/create.js:194` — `` sessionStorage.removeItem(draftKey) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API tạo tin mới; Draft sessionStorage riêng; submit mở modal, chưa tạo job thật | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P29 — job/detail

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/job/detail.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/job/detail.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/job/detail.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/job/detail.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/job/detail.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/job/detail.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/job/detail.js`; `ui-prototype/pages/job/detail.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/job/detail.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/job/detail.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/job/detail.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/job/detail.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/job/detail.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/job/detail.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/job/detail.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/job/detail.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/job/detail.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/job/detail.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/job/detail.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/job/detail.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/job/detail.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/job/detail.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/job/detail.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/job/detail.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/job/detail.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/job/detail.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/job/detail.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/job/detail.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/job/detail.css`; `ui-prototype/pages/job/detail.html:27` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/job/detail.html:43` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/job/detail.html:49` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/job/detail.html:50` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/job/detail.html:54` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html`; `ui-prototype/pages/job/detail.html:82` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html#lich-ranh`; `ui-prototype/pages/job/detail.html:87` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/job/detail.html:92` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `discover.html`; `ui-prototype/pages/job/detail.html:114` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/job/detail.html:187` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `discover.html#ung-tuyen-cua-toi`; `ui-prototype/pages/job/detail.html:197` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="application-form" data-application-form novalidate>`; `ui-prototype/pages/job/detail.html:163` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/job/detail.js:8` — `` const requestedId = (new URLSearchParams(window.location.search).get('id') \|\| '').trim().toUpperCase() `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API ứng tuyển; EduStore.job/applyToJob demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P30 — job/discover

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/job/discover.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/job/discover.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/job/discover.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/job/discover.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/job/discover.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/filter-panel.js`; `ui-prototype/pages/job/discover.html:35`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/filter-chip.js`; `ui-prototype/pages/job/discover.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/select.js`; `ui-prototype/pages/job/discover.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/job/discover.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/job/discover.html:40`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/pages/job/discover.js`; `ui-prototype/pages/job/discover.html:41`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 12 | `ui-prototype/js/core/search-filters.js`; `ui-prototype/pages/job/discover.html:43`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/job/discover.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/job/discover.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/job/discover.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/job/discover.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/job/discover.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/job/discover.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/job/discover.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/job/discover.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/job/discover.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/job/discover.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/job/discover.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-panel.css`; `ui-prototype/pages/job/discover.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-chip.css`; `ui-prototype/pages/job/discover.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/job/discover.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/job/discover.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/job/discover.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/job/discover.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/job/job-card.css`; `ui-prototype/pages/job/discover.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/job/discover.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/job/discover.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/job/discover.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/job/discover.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/job/discover.css`; `ui-prototype/pages/job/discover.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/brand-masthead.css`; `ui-prototype/pages/job/discover.html:42` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/job/discover.html:51` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/job/discover.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/job/discover.html:58` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/job/discover.html:62` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html`; `ui-prototype/pages/job/discover.html:90` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html#lich-ranh`; `ui-prototype/pages/job/discover.html:95` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/job/discover.html:100` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `detail.html`; `ui-prototype/pages/job/discover.html:177` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/job/discover.html:195` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="discover-search" data-discover-search-form>`; `ui-prototype/pages/job/discover.html:134` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="filter-panel discover-filter" data-filter-panel data-discover-filter>`; `ui-prototype/pages/job/discover.html:144` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| API / dữ liệu | Chưa giao API công việc mới; EduStore.jobBoard demo; lọc/sort cùng tập | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P31 — job/my-job

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/job/my-job.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/job/my-job.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/job/my-job.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/job/my-job.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/job/my-job.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/job/my-job.html:32`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/select.js`; `ui-prototype/pages/job/my-job.html:33`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/job/my-job.html:34`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/job/my-job.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/job/my-job.js`; `ui-prototype/pages/job/my-job.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/job/my-job.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/job/my-job.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/job/my-job.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/job/my-job.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/job/my-job.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/job/my-job.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/job/my-job.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/job/my-job.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/job/my-job.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/job/my-job.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/job/my-job.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/job/my-job.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/job/my-job.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/job/my-job.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/job/job-card.css`; `ui-prototype/pages/job/my-job.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/job/applicant-card.css`; `ui-prototype/pages/job/my-job.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/job/my-job.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/job/my-job.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/job/my-job.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/job/my-job.css`; `ui-prototype/pages/job/my-job.html:26` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/job/my-job.html:45` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/job/my-job.html:51` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/job/my-job.html:52` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/job/my-job.html:56` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/job/my-job.html:84` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/job/my-job.html:89` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/job/my-job.html:94` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `create.html`; `ui-prototype/pages/job/my-job.html:126` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `applicants.html`; `ui-prototype/pages/job/my-job.html:183` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/job/my-job.html:219` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/job/my-job.js:222` — `` window.setTimeout(() => window.location.reload(), 900) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | Chưa giao API đóng tin mới; EduStore.jobsByLearner/closeJob demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P32 — order/history

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/order/history.html:434`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/order/history.html:435`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/order/history.html:436`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/order/history.html:437`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/order/history.html:438`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/order/history.html:439`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/order/history.html:440`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/order/history.html:441`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/order/history.html:442`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/order/history.js`; `ui-prototype/pages/order/history.html:443`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/order/history.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/order/history.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/order/history.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/order/history.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/order/history.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/order/history.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/order/history.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/order/history.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/order/history.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/order/history.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/order/history.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/order/history.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/order/history.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/order/history.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/order/history.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/order/history.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/order/history.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/order/history.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/order/history.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/order/history.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/order/history.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/order/history.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/order/history.html:35` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/order/history.html:36` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/order/history.html:37` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/order/history.html:38` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/order/history.html:39` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/order/history.html:40` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/order/history.css`; `ui-prototype/pages/order/history.html:41` | CSS/assets static cùng hậu tố; c:url |
| href | `#order-main`; `ui-prototype/pages/order/history.html:44` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/home.html`; `ui-prototype/pages/order/history.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/order/history.html:59` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/order/history.html:60` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/order/history.html:64` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/order/history.html:92` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/order/history.html:97` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/order/history.html:102` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/order/history.html:266` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="order-history__filters" role="search" data-oh-filters>`; `ui-prototype/pages/order/history.html:173` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:72` — `` const rawStatus = Route.param('status', 'orderHistory') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:77` — `` const rawChannel = Route.param('channel', 'orderHistory') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:171` — `` link.href = Route.page('contractConfirm', { contract: order.contractId, order: order.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:175` — `` link.href = Route.page('paymentCheckout', { contract: order.contractId, from: Route.safeReturn('contract-detail'), order: order.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:179` — `` link.href = Route.page('contractStudentDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:238` — `` link.href = Route.page('contractStudentDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:310` — `` link.href = Route.page('catalogDetail', { id: item.offeringId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:325` — `` link.href = Route.page('contractStudentDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:376` — `` walletLink.href = Route.page('walletOverview', { hash: 'transactions' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:445` — `` window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; đơn giữ nguyên trạng thái trước đó, không có yêu cầu hủy nào được tạo.' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:504` — `` window.EduToast.show({ type: 'error', title: 'Không lưu được đánh giá', message: 'sessionStorage không ghi được; không có đánh giá nào được tạo.' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:552` — `` window.EduToast.show({ type: 'error', title: 'Không lưu được báo cáo', message: 'sessionStorage không ghi được; không có báo cáo nào được tạo.' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/order/history.js:614` — `` const rawId = Route.param('id', 'orderHistory') `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/orders?status&channel&id; module cancel/review/report theo hợp đồng; EduStore.ordersByLearner; modal cancel/review/report đang cùng JS | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P33 — payment/checkout

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/payment/checkout.html:24`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/payment/checkout.html:25`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/payment/checkout.html:26`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/payment/checkout.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/payment/checkout.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/pages/payment/checkout.js`; `ui-prototype/pages/payment/checkout.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/payment/checkout.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/payment/checkout.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/payment/checkout.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/payment/checkout.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/payment/checkout.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/payment/checkout.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/payment/checkout.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/payment/checkout.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/payment/checkout.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/payment/checkout.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/checkbox.css`; `ui-prototype/pages/payment/checkout.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/payment/checkout.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/payment/checkout.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/payment/checkout.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/loading.css`; `ui-prototype/pages/payment/checkout.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/wallet/wallet-balance-card.css`; `ui-prototype/pages/payment/checkout.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/payment/checkout.css`; `ui-prototype/pages/payment/checkout.html:23` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/payment/checkout.html:42` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/payment/checkout.html:48` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/payment/checkout.html:49` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/payment/checkout.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/payment/checkout.html:81` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/payment/checkout.html:86` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/payment/checkout.html:91` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html`; `ui-prototype/pages/payment/checkout.html:114` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html#transactions`; `ui-prototype/pages/payment/checkout.html:195` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/payment/checkout.html:352` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form id="payment-form">`; `ui-prototype/pages/payment/checkout.html:241` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:18` — `` const contractParam = Route.param("contract", "paymentCheckout"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:19` — `` const orderParam = Route.param("order", "paymentCheckout"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:20` — `` const paymentParam = Route.param("payment", "paymentCheckout"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:21` — `` const from = Route.safeReturn(Route.param("from", "paymentCheckout")); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:24` — `` contract: (id) => Route.page("contractConfirm", id ? { contract: id } : undefined), `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:25` — `` "contract-detail": (id) => Route.page("contractStudentDetail", id ? { id } : undefined), `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:26` — `` cart: () => Route.page("cart"), `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:27` — `` "order-history": () => Route.page("orderHistory"), `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:51` — `` walletLink.href = Route.page("walletOverview", { hash: "transactions" }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:219` — `` Route.go("paymentResult", { id: paymentRecord.id, status: "success" }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/checkout.js:222` — `` Route.go( `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | POST /api/payments; GET /api/payments/{id} (sandbox); EduStore/FIX; không giao dịch thật | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P34 — payment/qr

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/payment/qr.html:19`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/payment/qr.html:20`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/payment/qr.html:21`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/payment/qr.html:22`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/pages/payment/qr.js`; `ui-prototype/pages/payment/qr.html:23`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/payment/qr.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/payment/qr.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/payment/qr.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/payment/qr.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/payment/qr.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/payment/qr.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/payment/qr.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/payment/qr.css`; `ui-prototype/pages/payment/qr.html:18` | CSS/assets static cùng hậu tố; c:url |
| href | `checkout.html`; `ui-prototype/pages/payment/qr.html:29` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `result.html`; `ui-prototype/pages/payment/qr.html:106` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:14` — `` const contractParam = Route.param("contract", "paymentQr"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:15` — `` const paymentParam = Route.param("payment", "paymentQr"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:53` — `` ? Route.page("paymentCheckout", { contract: contractParam }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:54` — `` : Route.page("contractConfirm"), `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:60` — `` const checkoutHref = Route.page("paymentCheckout", { contract: contract.id }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:104` — `` byId("reconcile").href = Route.page("paymentResult", { `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:162` — `` byId("reconcile").href = Route.page("paymentResult", { id: paymentRecord.id }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/qr.js:207` — `` Route.go("paymentResult", { id: paymentRecord.id, status: "cancelled" }); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/payments/{id}; POST /api/payments/{id}/cancel (sandbox); QR DEMO; timer; mutate chỉ hủy phiên (JS:184–207) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P35 — payment/result

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/payment/result.html:20`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/payment/result.html:21`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/payment/result.html:22`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/payment/result.html:23`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/payment/result.html:24`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/payment/result.html:25`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/payment/result.js`; `ui-prototype/pages/payment/result.html:26`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/payment/result.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/payment/result.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/payment/result.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/payment/result.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/payment/result.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/payment/result.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/payment/result.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/payment/result.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/payment/result.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/payment/result.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/payment/result.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/payment/result.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/payment/result.css`; `ui-prototype/pages/payment/result.html:19` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/payment/result.html:39` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/payment/result.html:45` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/payment/result.html:46` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/payment/result.html:50` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/payment/result.html:78` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/payment/result.html:83` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/payment/result.html:88` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `checkout.html`; `ui-prototype/pages/payment/result.html:111` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../contract/student-detail.html`; `ui-prototype/pages/payment/result.html:230` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../wallet/overview.html`; `ui-prototype/pages/payment/result.html:235` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/payment/result.html:248` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:64` — `` const query = new URLSearchParams(location.search); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:65` — `` const requested = Route.param("status", "paymentResult") \|\| Route.param("view", "paymentResult"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:68` — `` const rawId = Route.param("id", "paymentResult") \|\| Route.param("payment", "paymentResult"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:110` — `` ? Route.page(isTutor ? "contractTutorDetail" : "contractStudentDetail", { id: contract.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:111` — `` : Route.page("walletOverview"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:113` — `` ? Route.page("paymentCheckout", { contract: contract.id, from: "contract-detail" }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/payment/result.js:114` — `` : Route.page("paymentCheckout"); `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/payments/{id}/result (sandbox); Store.resolvePaymentResult; status query không xác nhận đã trả tiền | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P36 — tutor/manage

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/tutor/manage.html:580`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/tutor/manage.html:581`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/tutor/manage.html:582`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/charts.js`; `ui-prototype/pages/tutor/manage.html:583`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/tutor/manage.html:584`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/tutor/manage.html:585`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/tutor/manage.html:586`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/tutor/manage.html:587`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/tutor/manage.html:588`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/tutor/manage.js`; `ui-prototype/pages/tutor/manage.html:589`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/tutor/manage.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/tutor/manage.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/tutor/manage.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/tutor/manage.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/tutor/manage.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/tutor/manage.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/tutor/manage.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/tutor/manage.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/tutor/manage.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/tutor/manage.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/tutor/manage.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/tutor/manage.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/tutor/manage.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/tutor/manage.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/tutor/manage.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/tutor/manage.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/tutor/manage.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/tutor/manage.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/tutor/manage.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/stat-card.css`; `ui-prototype/pages/tutor/manage.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/tutor/manage.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/chart.css`; `ui-prototype/pages/tutor/manage.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/tutor/manage.html:35` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/tutor/manage.html:36` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/tutor/manage.html:37` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/tutor/manage.html:38` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/tutor/manage.html:39` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/tutor/manage.html:40` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/tutor/manage.css`; `ui-prototype/pages/tutor/manage.html:41` | CSS/assets static cùng hậu tố; c:url |
| href | `#tutor-manage-main`; `ui-prototype/pages/tutor/manage.html:44` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/home.html`; `ui-prototype/pages/tutor/manage.html:53` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/tutor/manage.html:59` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/tutor/manage.html:60` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/tutor/manage.html:64` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html`; `ui-prototype/pages/tutor/manage.html:92` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html#lich-ranh`; `ui-prototype/pages/tutor/manage.html:97` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/tutor/manage.html:102` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/tutor/manage.html:375` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="tutor-manage__chart-controls" data-tm-chart-form>`; `ui-prototype/pages/tutor/manage.html:331` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="tutor-manage__form" data-tm-offering-form novalidate>`; `ui-prototype/pages/tutor/manage.html:439` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/tutor/manage.js:68` — `` const rawTab = Route.param('tab', 'tutorManage', 'services') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/manage.js:83` — `` window.history.replaceState(null, '', `${window.location.pathname}?tab=${encodeURIComponent(key)}`) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/manage.js:216` — `` link.href = Route.page('contractTutorDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/manage.js:275` — `` link.href = Route.page('contractTutorDetail', { id: order.contractId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/manage.js:388` — `` window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; trạng thái giữ nguyên như trước.' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/manage.js:551` — `` 'storage-failed': 'Không lưu được vào sessionStorage; dữ liệu giữ nguyên như trước, không có thay đổi nào được ghi.' `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/tutor/offerings\|orders; POST/PATCH /api/tutor/offerings; GET /api/tutor/statistics; EduStore CRUD offering demo; tab orders đọc; charts dùng EduChart | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P37 — tutor/my-profile

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/tutor/my-profile.html:410`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/tutor/my-profile.html:411`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/tutor/my-profile.html:412`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/tutor/my-profile.html:413`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/switch.js`; `ui-prototype/pages/tutor/my-profile.html:414`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/file-upload.js`; `ui-prototype/pages/tutor/my-profile.html:415`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/tutor/my-profile.js`; `ui-prototype/pages/tutor/my-profile.html:416`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/tutor/my-profile.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/tutor/my-profile.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/tutor/my-profile.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/tutor/my-profile.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/tutor/my-profile.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/tutor/my-profile.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/utilities.css`; `ui-prototype/pages/tutor/my-profile.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/tutor/my-profile.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/tutor/my-profile.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/file-upload.css`; `ui-prototype/pages/tutor/my-profile.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/switch.css`; `ui-prototype/pages/tutor/my-profile.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/tutor/my-profile.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/tutor/my-profile.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/account-footer.css`; `ui-prototype/pages/tutor/my-profile.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/tutor/my-profile.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/tutor/my-profile.css`; `ui-prototype/pages/tutor/my-profile.html:22` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/tutor/my-profile.html:34` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/tutor/my-profile.html:40` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/tutor/my-profile.html:41` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/tutor/my-profile.html:45` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html`; `ui-prototype/pages/tutor/my-profile.html:73` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/my-profile.html#lich-ranh`; `ui-prototype/pages/tutor/my-profile.html:78` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/tutor/my-profile.html:83` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="tutor-profile-form" novalidate data-tutor-form>`; `ui-prototype/pages/tutor/my-profile.html:144` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/tutor/my-profile.js:12` — `` const requestedState = new URLSearchParams(window.location.search).get('state') \|\| page.dataset.tutorState; `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET/PATCH /api/tutor/profile; chưa giao workflow xác minh nâng cao; HTML/form + states JS; thay state client (JS:12,116) | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P38 — tutor/profile

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/tutor/profile.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/tutor/profile.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/tutor/profile.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/tutor/profile.html:39`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/tutor/profile.html:40`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/tutor/profile.html:41`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/pages/tutor/profile.js`; `ui-prototype/pages/tutor/profile.html:42`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/tutor/profile.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/tutor/profile.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/tutor/profile.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/tutor/profile.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/tutor/profile.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/tutor/profile.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/tutor/profile.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/tutor/profile.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/tutor/profile.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button-group.css`; `ui-prototype/pages/tutor/profile.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/tutor/profile.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/tutor/profile.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/tutor/profile.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/tutor/profile.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/tutor/profile.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/file-attachment-item.css`; `ui-prototype/pages/tutor/profile.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/rating.css`; `ui-prototype/pages/tutor/profile.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/tutor/profile.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/alert.css`; `ui-prototype/pages/tutor/profile.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/tutor/profile.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/tutor/profile.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/tutor/profile.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/tutor/profile.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/form-field.css`; `ui-prototype/pages/tutor/profile.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/radio.css`; `ui-prototype/pages/tutor/profile.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/tutor/profile.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/textarea.css`; `ui-prototype/pages/tutor/profile.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/tutor/tutor-card.css`; `ui-prototype/pages/tutor/profile.html:34` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/tutor/profile.css`; `ui-prototype/pages/tutor/profile.html:35` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/tutor/profile.html:50` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/tutor/profile.html:56` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/tutor/profile.html:57` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/tutor/profile.html:61` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/tutor/profile.html:89` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/tutor/profile.html:94` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/tutor/profile.html:99` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `search.html`; `ui-prototype/pages/tutor/profile.html:121` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../job/detail.html`; `ui-prototype/pages/tutor/profile.html:164` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../invitation/create.html`; `ui-prototype/pages/tutor/profile.html:187` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../chat/messages.html`; `ui-prototype/pages/tutor/profile.html:187` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/tutor/profile.html:245` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:40` — `` const tutorId = Route.param('id', 'tutorProfile') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:183` — `` link.href = Route.page('catalogDetail', { id: item.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:217` — `` chatLink.href = Route.page('chatMessages', { tutor: tutor.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:252` — `` inviteLink.href = Route.page('invitationCreate', { tutor: tutor.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:277` — `` inviteLink.href = Route.page('invitationCreate', { tutor: tutor.id, offering: item.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:305` — `` Route.go('cart') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:312` — `` 'storage-failed': 'Không lưu được giỏ — sessionStorage không ghi được.' `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:350` — `` if (linkNode) linkNode.href = Route.page('jobDetail', { id: job.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/profile.js:521` — `` showReportError('Không lưu được báo cáo — sessionStorage không ghi được. Chưa có báo cáo nào được tạo.', null) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/tutors/{id}; GET /api/tutors/{id}/offerings; GET /api/tutors/{id}/reviews; EduStore tutor/offering/review; submitReport demo | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P39 — tutor/search

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/tutor/search.html:36`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/tutor/search.html:37`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/tutor/search.html:38`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/tutor/search.html:39`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/search-input.js`; `ui-prototype/pages/tutor/search.html:40`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/filter-panel.js`; `ui-prototype/pages/tutor/search.html:41`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/select.js`; `ui-prototype/pages/tutor/search.html:42`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/core/pagination.js`; `ui-prototype/pages/tutor/search.html:43`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 9 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/tutor/search.html:44`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 10 | `ui-prototype/js/pages/tutor/search.js`; `ui-prototype/pages/tutor/search.html:45`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 11 | `ui-prototype/js/core/search-filters.js`; `ui-prototype/pages/tutor/search.html:47`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/tutor/search.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/tutor/search.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/tutor/search.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/tutor/search.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/tutor/search.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/tutor/search.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/layouts.css`; `ui-prototype/pages/tutor/search.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/component-icon.css`; `ui-prototype/pages/tutor/search.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button.css`; `ui-prototype/pages/tutor/search.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/button-group.css`; `ui-prototype/pages/tutor/search.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/action/icon-button.css`; `ui-prototype/pages/tutor/search.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/tutor/search.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/tutor/search.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/tutor/search.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/filter-panel.css`; `ui-prototype/pages/tutor/search.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/pagination.css`; `ui-prototype/pages/tutor/search.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/input.css`; `ui-prototype/pages/tutor/search.html:23` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/search-input.css`; `ui-prototype/pages/tutor/search.html:24` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/form/select.css`; `ui-prototype/pages/tutor/search.html:25` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/avatar.css`; `ui-prototype/pages/tutor/search.html:26` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/card.css`; `ui-prototype/pages/tutor/search.html:27` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/info-row.css`; `ui-prototype/pages/tutor/search.html:28` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/rating.css`; `ui-prototype/pages/tutor/search.html:29` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/tag.css`; `ui-prototype/pages/tutor/search.html:30` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/badge.css`; `ui-prototype/pages/tutor/search.html:31` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/tutor/search.html:32` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/tutor/search.html:33` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/tutor/tutor-card.css`; `ui-prototype/pages/tutor/search.html:34` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/tutor/search.css`; `ui-prototype/pages/tutor/search.html:35` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/brand-masthead.css`; `ui-prototype/pages/tutor/search.html:46` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/tutor/search.html:55` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/tutor/search.html:61` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/tutor/search.html:62` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/tutor/search.html:66` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/tutor/search.html:94` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/tutor/search.html:99` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/tutor/search.html:104` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../tutor/profile.html`; `ui-prototype/pages/tutor/search.html:182` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/tutor/search.html:200` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | `<form class="tutor-search-form" data-tutor-search-form role="search">`; `ui-prototype/pages/tutor/search.html:137` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| Form | `<form class="filter-panel tutor-search-filter" data-filter-panel data-tutor-filter>`; `ui-prototype/pages/tutor/search.html:151` | Chốt POST/action hoặc API; tránh browser GET mặc định khi JS lỗi; giữ data-hook |
| JS URL/storage | `ui-prototype/js/pages/tutor/search.js:117` — `` if (link) link.href = Route.page('tutorProfile', { id: tutor.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/tutor/search.js:334` — `` const initialQuery = new URLSearchParams(window.location.search).get('q') `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/offerings?q&subject&grade&mode&minPrice&maxPrice&sort&page; EduStore.list offerings; UI tên Tìm gia sư; cần chốt nghĩa gian hàng | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |
### R-P40 — wallet/overview

| Loại | Tham chiếu hiện tại / dòng | Đổi khi chuyển |
| --- | --- | --- |
| Script, thứ tự 1 | `ui-prototype/js/core/route.js`; `ui-prototype/pages/wallet/overview.html:24`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 2 | `ui-prototype/js/data/fixtures.js`; `ui-prototype/pages/wallet/overview.html:25`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 3 | `ui-prototype/js/data/store.js`; `ui-prototype/pages/wallet/overview.html:26`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 4 | `ui-prototype/js/core/user-header.js`; `ui-prototype/pages/wallet/overview.html:27`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 5 | `ui-prototype/js/core/tabs.js`; `ui-prototype/pages/wallet/overview.html:28`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 6 | `ui-prototype/js/core/modal.js`; `ui-prototype/pages/wallet/overview.html:29`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 7 | `ui-prototype/js/core/toast.js`; `ui-prototype/pages/wallet/overview.html:30`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| Script, thứ tự 8 | `ui-prototype/js/pages/wallet/overview.js`; `ui-prototype/pages/wallet/overview.html:31`; defer | Bản static cùng hậu tố; script chỉ do layout/page script slot nạp một lần |
| CSS/favicon | `ui-prototype/assets/brand/favicon.ico`; `ui-prototype/pages/wallet/overview.html:6` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/favicon.svg`; `ui-prototype/pages/wallet/overview.html:7` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/assets/brand/apple-touch-icon.png`; `ui-prototype/pages/wallet/overview.html:8` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/tokens.css`; `ui-prototype/pages/wallet/overview.html:10` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/reset.css`; `ui-prototype/pages/wallet/overview.html:11` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/base.css`; `ui-prototype/pages/wallet/overview.html:12` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-header.css`; `ui-prototype/pages/wallet/overview.html:13` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/user-footer.css`; `ui-prototype/pages/wallet/overview.html:14` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/layout/page-header.css`; `ui-prototype/pages/wallet/overview.html:15` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/breadcrumb.css`; `ui-prototype/pages/wallet/overview.html:16` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/navigation/tabs.css`; `ui-prototype/pages/wallet/overview.html:17` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/domain/wallet/wallet-balance-card.css`; `ui-prototype/pages/wallet/overview.html:18` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/data-display/table.css`; `ui-prototype/pages/wallet/overview.html:19` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/modal.css`; `ui-prototype/pages/wallet/overview.html:20` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/toast.css`; `ui-prototype/pages/wallet/overview.html:21` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/components/feedback/empty-state.css`; `ui-prototype/pages/wallet/overview.html:22` | CSS/assets static cùng hậu tố; c:url |
| CSS/favicon | `ui-prototype/css/pages/wallet/overview.css`; `ui-prototype/pages/wallet/overview.html:23` | CSS/assets static cùng hậu tố; c:url |
| href | `../../pages/home.html`; `ui-prototype/pages/wallet/overview.html:44` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/tutor/search.html`; `ui-prototype/pages/wallet/overview.html:50` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/discover.html`; `ui-prototype/pages/wallet/overview.html:51` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/chat/messages.html`; `ui-prototype/pages/wallet/overview.html:55` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/account/profile.html`; `ui-prototype/pages/wallet/overview.html:83` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html`; `ui-prototype/pages/wallet/overview.html:88` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/wallet/overview.html#transactions`; `ui-prototype/pages/wallet/overview.html:93` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../order/history.html`; `ui-prototype/pages/wallet/overview.html:116` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../auth/login.html`; `ui-prototype/pages/wallet/overview.html:145` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| href | `../../pages/job/create.html`; `ui-prototype/pages/wallet/overview.html:366` | HTML target → route registry; giữ query/anchor; # hiện tại là anchor cần kiểm khi include |
| Form | Không có form tag trong HTML | Giữ button/action JS; C qua API được chốt |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:77` — `` crumb.href = Route.page('tutorManage', { tab: 'orders' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:79` — `` sidebarLink.href = Route.page('tutorManage', { tab: 'orders' }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:82` — `` crumb.href = Route.page('orderHistory') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:84` — `` sidebarLink.href = Route.page('orderHistory') `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:216` — `` ? Route.page('contractTutorDetail', { id: contract.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:217` — `` : Route.page('contractStudentDetail', { id: contract.id }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:247` — `` if (entry.refType === 'contract') return isTutor ? Route.page('contractTutorDetail', { id: entry.refId }) : Route.page('contractStudentDetail', { id: entry.refId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:248` — `` if (entry.refType === 'order') return Route.page('orderHistory', { id: entry.refId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| JS URL/storage | `ui-prototype/js/pages/wallet/overview.js:249` — `` if (entry.refType === 'payout') return Route.page('adminPayoutRequestDetail', { id: entry.refId }) `` | EduRoute production, query allowlist; session demo không là phiên server |
| API / dữ liệu | GET /api/wallet; GET /api/wallet/transactions (không giao rút tiền); EduStore walletSummary/ledger theo persona | Chưa có endpoint này; C bị chặn tới khi hợp đồng/backend sẵn sàng |

## 5. Component và asset dùng chung: một đầu mối tích hợp

**Đại là người tích hợp production duy nhất** cho fragment/layout/CSS nền/core/shared asset. Huy/Đạt gửi yêu cầu gồm source, hook, DTO, state và trang dùng; không cùng chỉnh file dùng chung. “Đề xuất đích” chưa được tạo.

| Component HTML nguồn | JSP fragment đề xuất | Evidence | Chủ tích hợp / người yêu cầu |
| --- | --- | --- | --- |
| `ui-prototype/components/action/button-group.html` | `src/main/webapp/WEB-INF/views/fragments/action/button-group.jspf` | `ui-prototype/components/action/button-group.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/action/button.html` | `src/main/webapp/WEB-INF/views/fragments/action/button.jspf` | `ui-prototype/components/action/button.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/action/icon-button.html` | `src/main/webapp/WEB-INF/views/fragments/action/icon-button.jspf` | `ui-prototype/components/action/icon-button.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/avatar.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/avatar.jspf` | `ui-prototype/components/data-display/avatar.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/card.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/card.jspf` | `ui-prototype/components/data-display/card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/file-attachment-item.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/file-attachment-item.jspf` | `ui-prototype/components/data-display/file-attachment-item.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/info-row.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/info-row.jspf` | `ui-prototype/components/data-display/info-row.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/rating.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/rating.jspf` | `ui-prototype/components/data-display/rating.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/stat-card.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/stat-card.jspf` | `ui-prototype/components/data-display/stat-card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/table.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/table.jspf` | `ui-prototype/components/data-display/table.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/data-display/tag.html` | `src/main/webapp/WEB-INF/views/fragments/data-display/tag.jspf` | `ui-prototype/components/data-display/tag.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/chat/message-thread-item.html` | `src/main/webapp/WEB-INF/views/fragments/domain/chat/message-thread-item.jspf` | `ui-prototype/components/domain/chat/message-thread-item.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/job/applicant-card.html` | `src/main/webapp/WEB-INF/views/fragments/domain/job/applicant-card.jspf` | `ui-prototype/components/domain/job/applicant-card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/job/job-card.html` | `src/main/webapp/WEB-INF/views/fragments/domain/job/job-card.jspf` | `ui-prototype/components/domain/job/job-card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/lesson/lesson-card.html` | `src/main/webapp/WEB-INF/views/fragments/domain/lesson/lesson-card.jspf` | `ui-prototype/components/domain/lesson/lesson-card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/tutor/tutor-card.html` | `src/main/webapp/WEB-INF/views/fragments/domain/tutor/tutor-card.jspf` | `ui-prototype/components/domain/tutor/tutor-card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/tutor/tutor-summary.html` | `src/main/webapp/WEB-INF/views/fragments/domain/tutor/tutor-summary.jspf` | `ui-prototype/components/domain/tutor/tutor-summary.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/tutor/tutor-verification-badge.html` | `src/main/webapp/WEB-INF/views/fragments/domain/tutor/tutor-verification-badge.jspf` | `ui-prototype/components/domain/tutor/tutor-verification-badge.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/domain/wallet/wallet-balance-card.html` | `src/main/webapp/WEB-INF/views/fragments/domain/wallet/wallet-balance-card.jspf` | `ui-prototype/components/domain/wallet/wallet-balance-card.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/feedback/alert.html` | `src/main/webapp/WEB-INF/views/fragments/feedback/alert.jspf` | `ui-prototype/components/feedback/alert.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/feedback/badge.html` | `src/main/webapp/WEB-INF/views/fragments/feedback/badge.jspf` | `ui-prototype/components/feedback/badge.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/feedback/empty-state.html` | `src/main/webapp/WEB-INF/views/fragments/feedback/empty-state.jspf` | `ui-prototype/components/feedback/empty-state.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/feedback/loading.html` | `src/main/webapp/WEB-INF/views/fragments/feedback/loading.jspf` | `ui-prototype/components/feedback/loading.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/feedback/modal.html` | `src/main/webapp/WEB-INF/views/fragments/feedback/modal.jspf` | `ui-prototype/components/feedback/modal.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/feedback/toast.html` | `src/main/webapp/WEB-INF/views/fragments/feedback/toast.jspf` | `ui-prototype/components/feedback/toast.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/checkbox.html` | `src/main/webapp/WEB-INF/views/fragments/form/checkbox.jspf` | `ui-prototype/components/form/checkbox.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/file-upload.html` | `src/main/webapp/WEB-INF/views/fragments/form/file-upload.jspf` | `ui-prototype/components/form/file-upload.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/form-field.html` | `src/main/webapp/WEB-INF/views/fragments/form/form-field.jspf` | `ui-prototype/components/form/form-field.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/input.html` | `src/main/webapp/WEB-INF/views/fragments/form/input.jspf` | `ui-prototype/components/form/input.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/password-input.html` | `src/main/webapp/WEB-INF/views/fragments/form/password-input.jspf` | `ui-prototype/components/form/password-input.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/radio.html` | `src/main/webapp/WEB-INF/views/fragments/form/radio.jspf` | `ui-prototype/components/form/radio.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/search-input.html` | `src/main/webapp/WEB-INF/views/fragments/form/search-input.jspf` | `ui-prototype/components/form/search-input.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/select.html` | `src/main/webapp/WEB-INF/views/fragments/form/select.jspf` | `ui-prototype/components/form/select.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/switch.html` | `src/main/webapp/WEB-INF/views/fragments/form/switch.jspf` | `ui-prototype/components/form/switch.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/form/textarea.html` | `src/main/webapp/WEB-INF/views/fragments/form/textarea.jspf` | `ui-prototype/components/form/textarea.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/account-footer.html` | `src/main/webapp/WEB-INF/views/fragments/layout/account-footer.jspf` | `ui-prototype/components/layout/account-footer.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/admin-header.html` | `src/main/webapp/WEB-INF/views/fragments/layout/admin-header.jspf` | `ui-prototype/components/layout/admin-header.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/admin-shell.html` | `src/main/webapp/WEB-INF/views/fragments/layout/admin-shell.jspf` | `ui-prototype/components/layout/admin-shell.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/admin-sidebar.html` | `src/main/webapp/WEB-INF/views/fragments/layout/admin-sidebar.jspf` | `ui-prototype/components/layout/admin-sidebar.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/auth-shell.html` | `src/main/webapp/WEB-INF/views/fragments/layout/auth-shell.jspf` | `ui-prototype/components/layout/auth-shell.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/brand-masthead.html` | `src/main/webapp/WEB-INF/views/fragments/layout/brand-masthead.jspf` | `ui-prototype/components/layout/brand-masthead.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/container.html` | `src/main/webapp/WEB-INF/views/fragments/layout/container.jspf` | `ui-prototype/components/layout/container.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/page-header.html` | `src/main/webapp/WEB-INF/views/fragments/layout/page-header.jspf` | `ui-prototype/components/layout/page-header.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/user-footer.html` | `src/main/webapp/WEB-INF/views/fragments/layout/user-footer.jspf` | `ui-prototype/components/layout/user-footer.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/user-header.html` | `src/main/webapp/WEB-INF/views/fragments/layout/user-header.jspf` | `ui-prototype/components/layout/user-header.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/layout/user-shell.html` | `src/main/webapp/WEB-INF/views/fragments/layout/user-shell.jspf` | `ui-prototype/components/layout/user-shell.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/navigation/breadcrumb.html` | `src/main/webapp/WEB-INF/views/fragments/navigation/breadcrumb.jspf` | `ui-prototype/components/navigation/breadcrumb.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/navigation/filter-chip.html` | `src/main/webapp/WEB-INF/views/fragments/navigation/filter-chip.jspf` | `ui-prototype/components/navigation/filter-chip.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/navigation/filter-panel.html` | `src/main/webapp/WEB-INF/views/fragments/navigation/filter-panel.jspf` | `ui-prototype/components/navigation/filter-panel.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/navigation/pagination.html` | `src/main/webapp/WEB-INF/views/fragments/navigation/pagination.jspf` | `ui-prototype/components/navigation/pagination.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/navigation/tabs.html` | `src/main/webapp/WEB-INF/views/fragments/navigation/tabs.jspf` | `ui-prototype/components/navigation/tabs.html:1` | Đại; Huy/Đạt theo trang; component domain vẫn chưa là backend |
| `ui-prototype/components/index.html` | Không đưa vào site production; showcase dev giữ nguyên | `ui-prototype/components/index.html:1` | Đại; ngoài số 40 trang |

| JS dùng chung/nguồn data façade | Đích / chính sách | Người chuẩn bị → tích hợp | Bằng chứng |
| --- | --- | --- | --- |
| `ui-prototype/js/core/admin-header.js` | `src/main/resources/static/js/core/admin-header.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/admin-header.js:1` |
| `ui-prototype/js/core/admin-sidebar.js` | `src/main/resources/static/js/core/admin-sidebar.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/admin-sidebar.js:1` |
| `ui-prototype/js/core/auth-shell.js` | `src/main/resources/static/js/core/auth-shell.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/auth-shell.js:1` |
| `ui-prototype/js/core/charts.js` | `src/main/resources/static/js/core/charts.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/charts.js:1` |
| `ui-prototype/js/core/file-upload.js` | `src/main/resources/static/js/core/file-upload.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/file-upload.js:1` |
| `ui-prototype/js/core/filter-chip.js` | `src/main/resources/static/js/core/filter-chip.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/filter-chip.js:1` |
| `ui-prototype/js/core/filter-panel.js` | `src/main/resources/static/js/core/filter-panel.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/filter-panel.js:1` |
| `ui-prototype/js/core/modal.js` | `src/main/resources/static/js/core/modal.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/modal.js:1` |
| `ui-prototype/js/core/pagination.js` | `src/main/resources/static/js/core/pagination.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/pagination.js:1` |
| `ui-prototype/js/core/password-input.js` | `src/main/resources/static/js/core/password-input.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/password-input.js:1` |
| `ui-prototype/js/core/radio.js` | `src/main/resources/static/js/core/radio.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/radio.js:1` |
| `ui-prototype/js/core/route.js` | `src/main/resources/static/js/core/route.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/route.js:1` |
| `ui-prototype/js/core/search-filters.js` | `src/main/resources/static/js/core/search-filters.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/search-filters.js:1` |
| `ui-prototype/js/core/search-input.js` | `src/main/resources/static/js/core/search-input.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/search-input.js:1` |
| `ui-prototype/js/core/select.js` | `src/main/resources/static/js/core/select.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/select.js:1` |
| `ui-prototype/js/core/switch.js` | `src/main/resources/static/js/core/switch.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/switch.js:1` |
| `ui-prototype/js/core/tabs.js` | `src/main/resources/static/js/core/tabs.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/tabs.js:1` |
| `ui-prototype/js/core/toast.js` | `src/main/resources/static/js/core/toast.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/toast.js:1` |
| `ui-prototype/js/core/user-header.js` | `src/main/resources/static/js/core/user-header.js`; Production static cùng hậu tố; core do Đại sửa | Đại | `ui-prototype/js/core/user-header.js:1` |
| `ui-prototype/js/data/fixtures.js` | `src/main/resources/static/js/data/fixtures.js`; Chỉ dùng preview cô lập; không làm nguồn production | Đại | `ui-prototype/js/data/fixtures.js:1` |
| `ui-prototype/js/data/store.js` | `src/main/resources/static/js/data/store.js`; Chỉ dùng preview cô lập; không làm nguồn production | Đại | `ui-prototype/js/data/store.js:1` |
| `ui-prototype/js/pages/admin/job-review-data.js` | `src/main/resources/static/js/pages/admin/job-review-data.js`; Huy chốt DTO; façade job dùng Store | Huy → Đại | `ui-prototype/js/pages/admin/job-review-data.js:1` |
| `ui-prototype/js/pages/admin/payout-data.js` | `src/main/resources/static/js/pages/admin/payout-data.js`; HOLD; fixture payout riêng | Huy → Đại | `ui-prototype/js/pages/admin/payout-data.js:1` |
| `ui-prototype/js/pages/admin/report-data.js` | `src/main/resources/static/js/pages/admin/report-data.js`; Façade TC05: Đại nối API | Đại | `ui-prototype/js/pages/admin/report-data.js:1` |
| `ui-prototype/js/pages/admin/tutor-review-data.js` | `src/main/resources/static/js/pages/admin/tutor-review-data.js`; Huy chốt DTO; fixture xác minh riêng | Huy → Đại | `ui-prototype/js/pages/admin/tutor-review-data.js:1` |

| CSS dùng chung (đủ file) | Đích | Chủ |
| --- | --- | --- |
| `ui-prototype/css/base.css` (`ui-prototype/css/base.css:1`) | `src/main/resources/static/css/base.css` | Đại |
| `ui-prototype/css/components/action/button-group.css` (`ui-prototype/css/components/action/button-group.css:1`) | `src/main/resources/static/css/components/action/button-group.css` | Đại |
| `ui-prototype/css/components/action/button.css` (`ui-prototype/css/components/action/button.css:1`) | `src/main/resources/static/css/components/action/button.css` | Đại |
| `ui-prototype/css/components/action/component-icon.css` (`ui-prototype/css/components/action/component-icon.css:1`) | `src/main/resources/static/css/components/action/component-icon.css` | Đại |
| `ui-prototype/css/components/action/icon-button.css` (`ui-prototype/css/components/action/icon-button.css:1`) | `src/main/resources/static/css/components/action/icon-button.css` | Đại |
| `ui-prototype/css/components/data-display/avatar.css` (`ui-prototype/css/components/data-display/avatar.css:1`) | `src/main/resources/static/css/components/data-display/avatar.css` | Đại |
| `ui-prototype/css/components/data-display/card.css` (`ui-prototype/css/components/data-display/card.css:1`) | `src/main/resources/static/css/components/data-display/card.css` | Đại |
| `ui-prototype/css/components/data-display/chart.css` (`ui-prototype/css/components/data-display/chart.css:1`) | `src/main/resources/static/css/components/data-display/chart.css` | Đại |
| `ui-prototype/css/components/data-display/file-attachment-item.css` (`ui-prototype/css/components/data-display/file-attachment-item.css:1`) | `src/main/resources/static/css/components/data-display/file-attachment-item.css` | Đại |
| `ui-prototype/css/components/data-display/info-row.css` (`ui-prototype/css/components/data-display/info-row.css:1`) | `src/main/resources/static/css/components/data-display/info-row.css` | Đại |
| `ui-prototype/css/components/data-display/rating.css` (`ui-prototype/css/components/data-display/rating.css:1`) | `src/main/resources/static/css/components/data-display/rating.css` | Đại |
| `ui-prototype/css/components/data-display/stat-card.css` (`ui-prototype/css/components/data-display/stat-card.css:1`) | `src/main/resources/static/css/components/data-display/stat-card.css` | Đại |
| `ui-prototype/css/components/data-display/table.css` (`ui-prototype/css/components/data-display/table.css:1`) | `src/main/resources/static/css/components/data-display/table.css` | Đại |
| `ui-prototype/css/components/data-display/tag.css` (`ui-prototype/css/components/data-display/tag.css:1`) | `src/main/resources/static/css/components/data-display/tag.css` | Đại |
| `ui-prototype/css/components/domain/chat/message-thread-item.css` (`ui-prototype/css/components/domain/chat/message-thread-item.css:1`) | `src/main/resources/static/css/components/domain/chat/message-thread-item.css` | Đại |
| `ui-prototype/css/components/domain/job/applicant-card.css` (`ui-prototype/css/components/domain/job/applicant-card.css:1`) | `src/main/resources/static/css/components/domain/job/applicant-card.css` | Đại |
| `ui-prototype/css/components/domain/job/job-card.css` (`ui-prototype/css/components/domain/job/job-card.css:1`) | `src/main/resources/static/css/components/domain/job/job-card.css` | Đại |
| `ui-prototype/css/components/domain/lesson/lesson-card.css` (`ui-prototype/css/components/domain/lesson/lesson-card.css:1`) | `src/main/resources/static/css/components/domain/lesson/lesson-card.css` | Đại |
| `ui-prototype/css/components/domain/tutor/tutor-card.css` (`ui-prototype/css/components/domain/tutor/tutor-card.css:1`) | `src/main/resources/static/css/components/domain/tutor/tutor-card.css` | Đại |
| `ui-prototype/css/components/domain/wallet/wallet-balance-card.css` (`ui-prototype/css/components/domain/wallet/wallet-balance-card.css:1`) | `src/main/resources/static/css/components/domain/wallet/wallet-balance-card.css` | Đại |
| `ui-prototype/css/components/feedback/alert.css` (`ui-prototype/css/components/feedback/alert.css:1`) | `src/main/resources/static/css/components/feedback/alert.css` | Đại |
| `ui-prototype/css/components/feedback/badge.css` (`ui-prototype/css/components/feedback/badge.css:1`) | `src/main/resources/static/css/components/feedback/badge.css` | Đại |
| `ui-prototype/css/components/feedback/empty-state.css` (`ui-prototype/css/components/feedback/empty-state.css:1`) | `src/main/resources/static/css/components/feedback/empty-state.css` | Đại |
| `ui-prototype/css/components/feedback/loading.css` (`ui-prototype/css/components/feedback/loading.css:1`) | `src/main/resources/static/css/components/feedback/loading.css` | Đại |
| `ui-prototype/css/components/feedback/modal.css` (`ui-prototype/css/components/feedback/modal.css:1`) | `src/main/resources/static/css/components/feedback/modal.css` | Đại |
| `ui-prototype/css/components/feedback/toast.css` (`ui-prototype/css/components/feedback/toast.css:1`) | `src/main/resources/static/css/components/feedback/toast.css` | Đại |
| `ui-prototype/css/components/form/checkbox.css` (`ui-prototype/css/components/form/checkbox.css:1`) | `src/main/resources/static/css/components/form/checkbox.css` | Đại |
| `ui-prototype/css/components/form/file-upload.css` (`ui-prototype/css/components/form/file-upload.css:1`) | `src/main/resources/static/css/components/form/file-upload.css` | Đại |
| `ui-prototype/css/components/form/form-field.css` (`ui-prototype/css/components/form/form-field.css:1`) | `src/main/resources/static/css/components/form/form-field.css` | Đại |
| `ui-prototype/css/components/form/input.css` (`ui-prototype/css/components/form/input.css:1`) | `src/main/resources/static/css/components/form/input.css` | Đại |
| `ui-prototype/css/components/form/password-input.css` (`ui-prototype/css/components/form/password-input.css:1`) | `src/main/resources/static/css/components/form/password-input.css` | Đại |
| `ui-prototype/css/components/form/radio.css` (`ui-prototype/css/components/form/radio.css:1`) | `src/main/resources/static/css/components/form/radio.css` | Đại |
| `ui-prototype/css/components/form/search-input.css` (`ui-prototype/css/components/form/search-input.css:1`) | `src/main/resources/static/css/components/form/search-input.css` | Đại |
| `ui-prototype/css/components/form/select.css` (`ui-prototype/css/components/form/select.css:1`) | `src/main/resources/static/css/components/form/select.css` | Đại |
| `ui-prototype/css/components/form/switch.css` (`ui-prototype/css/components/form/switch.css:1`) | `src/main/resources/static/css/components/form/switch.css` | Đại |
| `ui-prototype/css/components/form/textarea.css` (`ui-prototype/css/components/form/textarea.css:1`) | `src/main/resources/static/css/components/form/textarea.css` | Đại |
| `ui-prototype/css/components/layout/account-footer.css` (`ui-prototype/css/components/layout/account-footer.css:1`) | `src/main/resources/static/css/components/layout/account-footer.css` | Đại |
| `ui-prototype/css/components/layout/admin-header.css` (`ui-prototype/css/components/layout/admin-header.css:1`) | `src/main/resources/static/css/components/layout/admin-header.css` | Đại |
| `ui-prototype/css/components/layout/admin-sidebar.css` (`ui-prototype/css/components/layout/admin-sidebar.css:1`) | `src/main/resources/static/css/components/layout/admin-sidebar.css` | Đại |
| `ui-prototype/css/components/layout/auth-shell.css` (`ui-prototype/css/components/layout/auth-shell.css:1`) | `src/main/resources/static/css/components/layout/auth-shell.css` | Đại |
| `ui-prototype/css/components/layout/brand-masthead.css` (`ui-prototype/css/components/layout/brand-masthead.css:1`) | `src/main/resources/static/css/components/layout/brand-masthead.css` | Đại |
| `ui-prototype/css/components/layout/container.css` (`ui-prototype/css/components/layout/container.css:1`) | `src/main/resources/static/css/components/layout/container.css` | Đại |
| `ui-prototype/css/components/layout/page-header.css` (`ui-prototype/css/components/layout/page-header.css:1`) | `src/main/resources/static/css/components/layout/page-header.css` | Đại |
| `ui-prototype/css/components/layout/user-footer.css` (`ui-prototype/css/components/layout/user-footer.css:1`) | `src/main/resources/static/css/components/layout/user-footer.css` | Đại |
| `ui-prototype/css/components/layout/user-header.css` (`ui-prototype/css/components/layout/user-header.css:1`) | `src/main/resources/static/css/components/layout/user-header.css` | Đại |
| `ui-prototype/css/components/navigation/breadcrumb.css` (`ui-prototype/css/components/navigation/breadcrumb.css:1`) | `src/main/resources/static/css/components/navigation/breadcrumb.css` | Đại |
| `ui-prototype/css/components/navigation/filter-chip.css` (`ui-prototype/css/components/navigation/filter-chip.css:1`) | `src/main/resources/static/css/components/navigation/filter-chip.css` | Đại |
| `ui-prototype/css/components/navigation/filter-panel.css` (`ui-prototype/css/components/navigation/filter-panel.css:1`) | `src/main/resources/static/css/components/navigation/filter-panel.css` | Đại |
| `ui-prototype/css/components/navigation/pagination.css` (`ui-prototype/css/components/navigation/pagination.css:1`) | `src/main/resources/static/css/components/navigation/pagination.css` | Đại |
| `ui-prototype/css/components/navigation/tabs.css` (`ui-prototype/css/components/navigation/tabs.css:1`) | `src/main/resources/static/css/components/navigation/tabs.css` | Đại |
| `ui-prototype/css/components/showcase.css` (`ui-prototype/css/components/showcase.css:1`) | `src/main/resources/static/css/components/showcase.css` | Đại |
| `ui-prototype/css/layouts.css` (`ui-prototype/css/layouts.css:1`) | `src/main/resources/static/css/layouts.css` | Đại |
| `ui-prototype/css/pages/contract/contract-detail.css` (`ui-prototype/css/pages/contract/contract-detail.css:1`) | `src/main/resources/static/css/pages/contract/contract-detail.css` | Đại; Huy gửi thay đổi cho hai detail |
| `ui-prototype/css/reset.css` (`ui-prototype/css/reset.css:1`) | `src/main/resources/static/css/reset.css` | Đại |
| `ui-prototype/css/tokens.css` (`ui-prototype/css/tokens.css:1`) | `src/main/resources/static/css/tokens.css` | Đại |
| `ui-prototype/css/utilities.css` (`ui-prototype/css/utilities.css:1`) | `src/main/resources/static/css/utilities.css` | Đại |

### Manifest asset đầy đủ

Tất cả asset do Đại copy/tích hợp nguyên tên dưới `src/main/resources/static/assets/`. Dòng usage là bằng chứng dùng asset, không bịa số dòng trong ảnh binary. “Chưa thấy usage trực tiếp” không chứng minh asset thừa: có thể tên icon sinh động từ code. Không xóa trong audit.

| Asset nguồn | Bytes | Usage/bằng chứng | Đích |
| --- | --- | --- | --- |
| `ui-prototype/assets/brand/apple-touch-icon.png` | 4846 | `ui-prototype/components/action/button-group.html:8` | `src/main/resources/static/assets/brand/apple-touch-icon.png` |
| `ui-prototype/assets/brand/favicon-32.png` | 936 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/favicon-32.png` |
| `ui-prototype/assets/brand/favicon.ico` | 30329 | `ui-prototype/components/action/button-group.html:6` | `src/main/resources/static/assets/brand/favicon.ico` |
| `ui-prototype/assets/brand/favicon.png` | 7568 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/favicon.png` |
| `ui-prototype/assets/brand/favicon.svg` | 2965 | `ui-prototype/components/action/button-group.html:7` | `src/main/resources/static/assets/brand/favicon.svg` |
| `ui-prototype/assets/brand/logo-horizontal-mono.svg` | 14305 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-horizontal-mono.svg` |
| `ui-prototype/assets/brand/logo-horizontal-white.png` | 30634 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-horizontal-white.png` |
| `ui-prototype/assets/brand/logo-horizontal-white.svg` | 14305 | `ui-prototype/components/layout/admin-sidebar.html:20` | `src/main/resources/static/assets/brand/logo-horizontal-white.svg` |
| `ui-prototype/assets/brand/logo-horizontal.png` | 41013 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-horizontal.png` |
| `ui-prototype/assets/brand/logo-horizontal.svg` | 14305 | `ui-prototype/components/index.html:41` | `src/main/resources/static/assets/brand/logo-horizontal.svg` |
| `ui-prototype/assets/brand/logo-mark-mono.svg` | 2972 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-mark-mono.svg` |
| `ui-prototype/assets/brand/logo-mark-white.png` | 11877 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-mark-white.png` |
| `ui-prototype/assets/brand/logo-mark-white.svg` | 2972 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-mark-white.svg` |
| `ui-prototype/assets/brand/logo-mark.png` | 17222 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-mark.png` |
| `ui-prototype/assets/brand/logo-mark.svg` | 2972 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/brand/logo-mark.svg` |
| `ui-prototype/assets/documents/component-certificate.txt` | 153 | `ui-prototype/components/data-display/file-attachment-item.html:34` | `src/main/resources/static/assets/documents/component-certificate.txt` |
| `ui-prototype/assets/icons/activity-log.svg` | 310 | `ui-prototype/components/layout/admin-sidebar.html:50` | `src/main/resources/static/assets/icons/activity-log.svg` |
| `ui-prototype/assets/icons/audit-log.svg` | 281 | `ui-prototype/components/layout/admin-header.html:67` | `src/main/resources/static/assets/icons/audit-log.svg` |
| `ui-prototype/assets/icons/calendar.svg` | 347 | `ui-prototype/css/components/domain/lesson/lesson-card.css:24` | `src/main/resources/static/assets/icons/calendar.svg` |
| `ui-prototype/assets/icons/cancel.svg` | 230 | `ui-prototype/components/layout/admin-header.html:22` | `src/main/resources/static/assets/icons/cancel.svg` |
| `ui-prototype/assets/icons/certificate.svg` | 508 | `ui-prototype/css/components/action/component-icon.css:27` | `src/main/resources/static/assets/icons/certificate.svg` |
| `ui-prototype/assets/icons/chat-attachment.svg` | 207 | `ui-prototype/pages/admin/report-detail.html:202` | `src/main/resources/static/assets/icons/chat-attachment.svg` |
| `ui-prototype/assets/icons/chat-search.svg` | 175 | `ui-prototype/pages/chat/messages.html:120` | `src/main/resources/static/assets/icons/chat-search.svg` |
| `ui-prototype/assets/icons/chat-send.svg` | 179 | `ui-prototype/pages/chat/messages.html:238` | `src/main/resources/static/assets/icons/chat-send.svg` |
| `ui-prototype/assets/icons/check-circle.svg` | 229 | `ui-prototype/css/components/feedback/alert.css:2` | `src/main/resources/static/assets/icons/check-circle.svg` |
| `ui-prototype/assets/icons/check-double.svg` | 229 | `ui-prototype/css/components/feedback/alert.css:10` | `src/main/resources/static/assets/icons/check-double.svg` |
| `ui-prototype/assets/icons/chevron-right.svg` | 202 | `ui-prototype/components/layout/admin-header.html:31` | `src/main/resources/static/assets/icons/chevron-right.svg` |
| `ui-prototype/assets/icons/clock.svg` | 222 | `ui-prototype/css/components/action/component-icon.css:39` | `src/main/resources/static/assets/icons/clock.svg` |
| `ui-prototype/assets/icons/close.svg` | 200 | `ui-prototype/css/components/action/component-icon.css:15` | `src/main/resources/static/assets/icons/close.svg` |
| `ui-prototype/assets/icons/component-bookmark.svg` | 175 | `ui-prototype/css/components/action/component-icon.css:51` | `src/main/resources/static/assets/icons/component-bookmark.svg` |
| `ui-prototype/assets/icons/component-download.svg` | 212 | `ui-prototype/css/components/action/component-icon.css:48` | `src/main/resources/static/assets/icons/component-download.svg` |
| `ui-prototype/assets/icons/copyright.svg` | 279 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/icons/copyright.svg` |
| `ui-prototype/assets/icons/dang-xuat.svg` | 267 | `ui-prototype/components/layout/admin-header.html:68` | `src/main/resources/static/assets/icons/dang-xuat.svg` |
| `ui-prototype/assets/icons/dashboard.svg` | 390 | `ui-prototype/components/layout/admin-sidebar.html:28` | `src/main/resources/static/assets/icons/dashboard.svg` |
| `ui-prototype/assets/icons/dau-tich.svg` | 195 | `ui-prototype/components/form/select.html:55` | `src/main/resources/static/assets/icons/dau-tich.svg` |
| `ui-prototype/assets/icons/dinh-vi.svg` | 371 | `ui-prototype/components/form/input.html:65` | `src/main/resources/static/assets/icons/dinh-vi.svg` |
| `ui-prototype/assets/icons/dispute.svg` | 276 | `ui-prototype/components/layout/admin-sidebar.html:42` | `src/main/resources/static/assets/icons/dispute.svg` |
| `ui-prototype/assets/icons/email.svg` | 255 | `ui-prototype/pages/auth/forgot-password.html:62` | `src/main/resources/static/assets/icons/email.svg` |
| `ui-prototype/assets/icons/empty-inbox.svg` | 235 | `ui-prototype/css/components/feedback/empty-state.css:17` | `src/main/resources/static/assets/icons/empty-inbox.svg` |
| `ui-prototype/assets/icons/error-circle.svg` | 227 | `ui-prototype/css/components/feedback/alert.css:4` | `src/main/resources/static/assets/icons/error-circle.svg` |
| `ui-prototype/assets/icons/footer-link-arrow.svg` | 225 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/icons/footer-link-arrow.svg` |
| `ui-prototype/assets/icons/info-circle.svg` | 228 | `ui-prototype/css/components/feedback/alert.css:1` | `src/main/resources/static/assets/icons/info-circle.svg` |
| `ui-prototype/assets/icons/library.svg` | 313 | `ui-prototype/css/components/action/component-icon.css:30` | `src/main/resources/static/assets/icons/library.svg` |
| `ui-prototype/assets/icons/loading.svg` | 199 | `ui-prototype/css/components/feedback/loading.css:2` | `src/main/resources/static/assets/icons/loading.svg` |
| `ui-prototype/assets/icons/lock.svg` | 260 | `ui-prototype/css/components/action/component-icon.css:39` | `src/main/resources/static/assets/icons/lock.svg` |
| `ui-prototype/assets/icons/logo.svg` | 2972 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/icons/logo.svg` |
| `ui-prototype/assets/icons/mat-tat.svg` | 402 | `ui-prototype/components/form/password-input.html:48` | `src/main/resources/static/assets/icons/mat-tat.svg` |
| `ui-prototype/assets/icons/mat.svg` | 266 | `ui-prototype/components/form/password-input.html:46` | `src/main/resources/static/assets/icons/mat.svg` |
| `ui-prototype/assets/icons/message.svg` | 302 | `ui-prototype/components/layout/user-header.html:30` | `src/main/resources/static/assets/icons/message.svg` |
| `ui-prototype/assets/icons/mui-ten-len.svg` | 206 | `ui-prototype/components/form/select.html:39` | `src/main/resources/static/assets/icons/mui-ten-len.svg` |
| `ui-prototype/assets/icons/mui-ten-xuong.svg` | 205 | `ui-prototype/components/form/select.html:41` | `src/main/resources/static/assets/icons/mui-ten-xuong.svg` |
| `ui-prototype/assets/icons/notification.svg` | 259 | `ui-prototype/components/layout/admin-header.html:49` | `src/main/resources/static/assets/icons/notification.svg` |
| `ui-prototype/assets/icons/password.svg` | 284 | Chưa thấy usage literal; kiểm runtime trước khi loại | `src/main/resources/static/assets/icons/password.svg` |
| `ui-prototype/assets/icons/payment-copy.svg` | 238 | `ui-prototype/js/pages/admin/dashboard.js:93` | `src/main/resources/static/assets/icons/payment-copy.svg` |
| `ui-prototype/assets/icons/phone.svg` | 307 | `ui-prototype/pages/auth/register.html:45` | `src/main/resources/static/assets/icons/phone.svg` |
| `ui-prototype/assets/icons/profile.svg` | 366 | `ui-prototype/components/layout/user-header.html:58` | `src/main/resources/static/assets/icons/profile.svg` |
| `ui-prototype/assets/icons/receipt.svg` | 329 | `ui-prototype/components/layout/user-header.html:68` | `src/main/resources/static/assets/icons/receipt.svg` |
| `ui-prototype/assets/icons/search.svg` | 238 | `ui-prototype/components/layout/admin-header.html:20` | `src/main/resources/static/assets/icons/search.svg` |
| `ui-prototype/assets/icons/settings.svg` | 271 | `ui-prototype/components/layout/admin-sidebar.html:31` | `src/main/resources/static/assets/icons/settings.svg` |
| `ui-prototype/assets/icons/shield-alert.svg` | 281 | `ui-prototype/css/components/feedback/alert.css:11` | `src/main/resources/static/assets/icons/shield-alert.svg` |
| `ui-prototype/assets/icons/shield-user.svg` | 336 | `ui-prototype/components/layout/admin-header.html:65` | `src/main/resources/static/assets/icons/shield-user.svg` |
| `ui-prototype/assets/icons/shield.svg` | 382 | `ui-prototype/pages/admin/payout-request-detail.html:234` | `src/main/resources/static/assets/icons/shield.svg` |
| `ui-prototype/assets/icons/star.svg` | 188 | `ui-prototype/css/components/data-display/rating.css:16` | `src/main/resources/static/assets/icons/star.svg` |
| `ui-prototype/assets/icons/tutor-search.svg` | 333 | `ui-prototype/components/layout/admin-sidebar.html:38` | `src/main/resources/static/assets/icons/tutor-search.svg` |
| `ui-prototype/assets/icons/tutor-verification.svg` | 454 | `ui-prototype/components/layout/admin-header.html:52` | `src/main/resources/static/assets/icons/tutor-verification.svg` |
| `ui-prototype/assets/icons/verified.svg` | 582 | `ui-prototype/components/index.html:48` | `src/main/resources/static/assets/icons/verified.svg` |
| `ui-prototype/assets/icons/wallet.svg` | 459 | `ui-prototype/components/layout/admin-header.html:53` | `src/main/resources/static/assets/icons/wallet.svg` |
| `ui-prototype/assets/icons/warning-triangle.svg` | 262 | `ui-prototype/css/components/feedback/alert.css:3` | `src/main/resources/static/assets/icons/warning-triangle.svg` |

## 6. Link lỗi, trùng lặp và nguy cơ khi chuyển

| Phát hiện | Bằng chứng | Kết luận và việc cần làm |
| --- | --- | --- |
| Link/asset/CSS url thiếu trong prototype | static-check hiện tại FAIL 0, `scripts/checks/static-check.mjs:1–5` | Không phát hiện link tĩnh lỗi theo bộ kiểm. Không suy navigation JSP đã đúng; phải chạy D cho action/redirect/server route |
| Không có fetch component loader | Không match fetch( trong toàn bộ JS/HTML; các script trực tiếp như `ui-prototype/pages/home.html:23–28` | Component inline/cloned, không có loader cần gỡ hiện tại. Dùng JSP include thay vùng inline đúng một lần |
| Ảnh logo giống byte | `ui-prototype/assets/brand/logo-mark.svg:1` và `ui-prototype/assets/icons/logo.svg:1`, SHA-256 trùng | Không xóa alias tự động; Đại chọn canonical sau kiểm usage |
| CSS contract chung nằm dưới pages | `ui-prototype/css/pages/contract/contract-detail.css:1`; R-P22/P23 | Một file chung do Đại tích hợp theo yêu cầu Huy |
| Shell bị lặp inline | 23 user headers / 11 admin sidebar; R-Pxx từng dòng; `ui-prototype/js/core/admin-sidebar.js:2–4` | Chuyển include và bỏ markup tương ứng trong page; không giữ cả hai |
| Script init dễ lặp | `ui-prototype/js/core/auth-shell.js:19–28`, `ui-prototype/js/core/select.js:46–59,88`, `ui-prototype/js/core/user-header.js:306–337` | once ở DOMContentLoaded không chống nạp script hai lần. tabs có guard riêng `ui-prototype/js/core/tabs.js:4–5`, không áp dụng mặc nhiên cho module khác |
| Router phụ thuộc .html và độ sâu | `ui-prototype/js/core/route.js:67–78,134–147`; `ui-prototype/js/core/admin-sidebar.js:46–65` | Đổi registry và active menu sang pageKey; action không được trông chờ rewrite href/src (router không rewrite form action, `ui-prototype/js/core/route.js:98`) |
| Query state hồ sơ gia sư lệch registry | `ui-prototype/js/pages/tutor/my-profile.js:12–13` đọc state; `ui-prototype/js/core/route.js:24` chỉ liệt kê hash | state hiện là preview client. Production lấy trạng thái từ server; không mở verified từ query |
| Nguồn data riêng | `ui-prototype/js/pages/admin/tutor-review-data.js:1–5,356–360`, `ui-prototype/js/pages/admin/payout-data.js:1–7,75`, `ui-prototype/js/pages/admin/audit-logs.js:1`, `ui-prototype/js/pages/chat/messages.js:5–6` và phần thread | Không coi toàn bộ trang đọc Store chung. Facade report/job và fixture tutor/payout có mức đồng bộ khác nhau |
| Hardcode không persistence | `ui-prototype/js/pages/account/profile.js:18,72–86`; `ui-prototype/js/pages/tutor/my-profile.js:6–13,116`; `ui-prototype/js/pages/job/create.js:14,45,170–172` | Hồ sơ chỉ đổi DOM; tạo tin draft riêng; backend chưa có |
| Formatter trùng logic | static-check ghi 6 file formatMoney: charts, store, audit-logs, payout-data, invitation/create, job/applicants | Không lỗi link, nhưng Đại/Huy chốt định dạng và làm D; không sửa prototype trong audit |
| Thay đổi chưa commit/file mới | git status ban đầu rỗng | Không có xung đột sẵn có do local changes; vẫn có xung đột tích hợp nếu nhiều người sửa shared |

## 7. Ngoài phạm vi và khoảng trống

P02, P07, P08, P20, P25–P31 được thống kê đầy đủ; chưa giao API chat/realtime/payout/nhật ký/thương lượng/ứng tuyển mới. Các route và JSP đích của chúng chỉ là vị trí dự kiến để chốt navigation. Không phát sinh nhiệm vụ B/C cho BS hoặc bổ sung chưa được duyệt.

P04/P05/P11/P12 chỉ đề xuất chuyển UI phục vụ quản lý cơ bản BB12, phải chốt workflow nằm trong BB12 trước phần C; kiểm duyệt nâng cao không tự động được duyệt vì có HTML. P21–P23 chỉ hỗ trợ BB07/TC02/TC03/BB13; attendance/tự release đang trong demo không tự được giao production. Wallet không bao gồm rút tiền thật. Giá trị phí/hoàn tiền demo không là policy được chốt.

Đường dẫn `src/main/webapp/WEB-INF/views/catalog/`, `cart/`, `order/` và `home.jsp` hiện chưa có; tạo JSP tại đây là A từ source có sẵn, không phải tạo chức năng mới B. Layout/fragment chưa có là nhiệm vụ nền, không được cộng thành trang sản phẩm.


## 8. src ảnh và icon theo từng trang

Các src dưới đây là literal trong HTML hiện tại; icon sinh động còn có vị trí trong R-Pxx JS URL và manifest asset. Đích static giữ hậu tố assets, dùng c:url hoặc EduRoute.asset đã hỗ trợ context path. Không copy script HTML loader.

| Mã | src hiện tại / file:dòng | Đổi |
| --- | --- | --- |
| P01 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/account/profile.html:27`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/account/profile.html:38`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/account/profile.html:47`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/account/profile.html:50`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/account/profile.html:66`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/account/profile.html:68`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/account/profile.html:71`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/account/profile.html:76`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/account/profile.html:84`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P02 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/audit-logs.html:43`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/audit-logs.html:51`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/audit-logs.html:54`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/audit-logs.html:57`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/audit-logs.html:61`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/audit-logs.html:65`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/audit-logs.html:69`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/audit-logs.html:73`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/audit-logs.html:83`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/audit-logs.html:85`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/audit-logs.html:94`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/audit-logs.html:112`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/audit-logs.html:125`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/audit-logs.html:128`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/audit-logs.html:130`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/audit-logs.html:131`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/admin/audit-logs.html:263`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P03 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/dashboard.html:35`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/dashboard.html:43`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/dashboard.html:46`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/dashboard.html:49`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/dashboard.html:53`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/dashboard.html:57`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/dashboard.html:61`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/dashboard.html:65`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/dashboard.html:76`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/dashboard.html:78`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/dashboard.html:87`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/dashboard.html:105`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/dashboard.html:118`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/dashboard.html:121`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/dashboard.html:123`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/dashboard.html:124`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/dashboard.html:306`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P04 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/job-review-detail.html:37`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/job-review-detail.html:45`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/job-review-detail.html:48`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/job-review-detail.html:51`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/job-review-detail.html:55`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/job-review-detail.html:59`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/job-review-detail.html:63`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/job-review-detail.html:67`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/job-review-detail.html:76`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/job-review-detail.html:78`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/job-review-detail.html:87`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/job-review-detail.html:105`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/job-review-detail.html:118`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/job-review-detail.html:121`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/job-review-detail.html:123`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/job-review-detail.html:124`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/admin/job-review-detail.html:143`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/admin/job-review-detail.html:147`)<br>`../../assets/icons/library.svg` (`ui-prototype/pages/admin/job-review-detail.html:151`)<br>`../../assets/icons/certificate.svg` (`ui-prototype/pages/admin/job-review-detail.html:162`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/admin/job-review-detail.html:166`)<br>`../../assets/icons/check-circle.svg` (`ui-prototype/pages/admin/job-review-detail.html:178`)<br>`../../assets/icons/check-double.svg` (`ui-prototype/pages/admin/job-review-detail.html:187`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P05 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/job-review-queue.html:38`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/job-review-queue.html:46`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/job-review-queue.html:49`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/job-review-queue.html:52`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/job-review-queue.html:56`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/job-review-queue.html:60`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/job-review-queue.html:64`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/job-review-queue.html:68`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/job-review-queue.html:77`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/job-review-queue.html:79`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/job-review-queue.html:88`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/job-review-queue.html:106`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/job-review-queue.html:119`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/job-review-queue.html:122`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/job-review-queue.html:124`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/job-review-queue.html:125`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/job-review-queue.html:153`)<br>`../../assets/icons/warning-triangle.svg` (`ui-prototype/pages/admin/job-review-queue.html:158`)<br>`../../assets/icons/check-circle.svg` (`ui-prototype/pages/admin/job-review-queue.html:163`)<br>`../../assets/icons/shield-alert.svg` (`ui-prototype/pages/admin/job-review-queue.html:178`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P06 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/manage.html:50`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/manage.html:58`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/manage.html:61`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/manage.html:64`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/manage.html:68`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/manage.html:72`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/manage.html:76`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/manage.html:80`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/manage.html:90`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/manage.html:92`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/manage.html:101`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/manage.html:119`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/manage.html:132`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/manage.html:135`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/manage.html:137`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/manage.html:138`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P07 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/payout-request-detail.html:47`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/payout-request-detail.html:55`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/payout-request-detail.html:58`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/payout-request-detail.html:61`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/payout-request-detail.html:65`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/payout-request-detail.html:69`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/payout-request-detail.html:73`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/payout-request-detail.html:77`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/payout-request-detail.html:87`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/payout-request-detail.html:89`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/payout-request-detail.html:103`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/payout-request-detail.html:111`)<br>`../../assets/icons/warning-triangle.svg` (`ui-prototype/pages/admin/payout-request-detail.html:115`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/payout-request-detail.html:124`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/payout-request-detail.html:127`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/payout-request-detail.html:129`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/payout-request-detail.html:130`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/admin/payout-request-detail.html:179`)<br>`../../assets/icons/check-circle.svg` (`ui-prototype/pages/admin/payout-request-detail.html:183`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/admin/payout-request-detail.html:229`)<br>`../../assets/icons/shield.svg` (`ui-prototype/pages/admin/payout-request-detail.html:234`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/payout-request-detail.html:284`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/admin/payout-request-detail.html:290`)<br>`../../assets/icons/check-double.svg` (`ui-prototype/pages/admin/payout-request-detail.html:362`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P08 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/payout-requests.html:45`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/payout-requests.html:53`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/payout-requests.html:56`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/payout-requests.html:59`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/payout-requests.html:63`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/payout-requests.html:67`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/payout-requests.html:71`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/payout-requests.html:75`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/payout-requests.html:85`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/payout-requests.html:87`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/payout-requests.html:96`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/payout-requests.html:104`)<br>`../../assets/icons/warning-triangle.svg` (`ui-prototype/pages/admin/payout-requests.html:108`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/payout-requests.html:117`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/payout-requests.html:120`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/payout-requests.html:122`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/payout-requests.html:123`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/payout-requests.html:146`)<br>`../../assets/icons/check-double.svg` (`ui-prototype/pages/admin/payout-requests.html:156`)<br>`../../assets/icons/shield-alert.svg` (`ui-prototype/pages/admin/payout-requests.html:186`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P09 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/report-detail.html:58`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/report-detail.html:66`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/report-detail.html:69`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/report-detail.html:72`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/report-detail.html:76`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/report-detail.html:80`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/report-detail.html:84`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/report-detail.html:88`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/report-detail.html:97`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/report-detail.html:99`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/report-detail.html:113`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/report-detail.html:121`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/report-detail.html:134`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/report-detail.html:137`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/report-detail.html:139`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/report-detail.html:140`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/admin/report-detail.html:170`)<br>`../../assets/icons/chat-attachment.svg` (`ui-prototype/pages/admin/report-detail.html:202`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/admin/report-detail.html:214`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/report-detail.html:226`)<br>`../../assets/icons/shield-alert.svg` (`ui-prototype/pages/admin/report-detail.html:268`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/admin/report-detail.html:269`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P10 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/reports.html:53`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/reports.html:61`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/reports.html:64`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/reports.html:67`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/reports.html:71`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/reports.html:75`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/reports.html:79`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/reports.html:83`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/reports.html:92`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/reports.html:94`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/reports.html:113`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/reports.html:121`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/reports.html:134`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/reports.html:137`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/reports.html:139`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/reports.html:140`)<br>`../../assets/icons/shield-alert.svg` (`ui-prototype/pages/admin/reports.html:172`)<br>`../../assets/icons/check-double.svg` (`ui-prototype/pages/admin/reports.html:177`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/reports.html:202`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P11 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:42`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:50`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:53`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:56`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:60`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:64`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:68`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:72`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:81`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:83`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:92`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:100`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:113`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:116`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:118`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:119`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:133`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:146`)<br>`../../assets/icons/certificate.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:159`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:189`)<br>`../../assets/icons/info-circle.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:190`)<br>`../../assets/icons/shield.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:196`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:232`)<br>`../../assets/icons/check-circle.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:234`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/admin/tutor-review-detail.html:236`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P12 | `../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:40`)<br>`../../assets/icons/dashboard.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:48`)<br>`../../assets/icons/settings.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:51`)<br>`../../assets/icons/tutor-verification.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:54`)<br>`../../assets/icons/tutor-search.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:58`)<br>`../../assets/icons/dispute.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:62`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:66`)<br>`../../assets/icons/activity-log.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:70`)<br>`../../assets/icons/search.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:79`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:81`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:90`)<br>`../../assets/icons/notification.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:98`)<br>`../../assets/icons/warning-triangle.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:102`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:111`)<br>`../../assets/icons/shield-user.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:114`)<br>`../../assets/icons/audit-log.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:116`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:117`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:141`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:146`)<br>`../../assets/icons/shield-alert.svg` (`ui-prototype/pages/admin/tutor-review-queue.html:167`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P13 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/auth/forgot-password.html:25`)<br>`../../assets/icons/email.svg` (`ui-prototype/pages/auth/forgot-password.html:62`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P14 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/auth/login.html:26`)<br>`../../assets/icons/email.svg` (`ui-prototype/pages/auth/login.html:66`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/auth/login.html:75`)<br>`../../assets/icons/mat.svg` (`ui-prototype/pages/auth/login.html:78`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P15 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/auth/register.html:24`)<br>`../../assets/icons/email.svg` (`ui-prototype/pages/auth/register.html:44`)<br>`../../assets/icons/phone.svg` (`ui-prototype/pages/auth/register.html:45`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/auth/register.html:47`)<br>`../../assets/icons/mat.svg` (`ui-prototype/pages/auth/register.html:47`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P16 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/auth/reset-password.html:27`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/auth/reset-password.html:62`)<br>`../../assets/icons/mat.svg` (`ui-prototype/pages/auth/reset-password.html:65`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P17 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/auth/verify-email.html:26`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P18 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/cart/index.html:43`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/cart/index.html:54`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/cart/index.html:63`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/cart/index.html:66`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/cart/index.html:82`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/cart/index.html:84`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/cart/index.html:90`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/cart/index.html:178`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P19 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/catalog/detail.html:43`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/catalog/detail.html:54`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/catalog/detail.html:63`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/catalog/detail.html:66`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/catalog/detail.html:82`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/catalog/detail.html:84`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/catalog/detail.html:90`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/catalog/detail.html:230`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P20 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/chat/messages.html:42`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/chat/messages.html:53`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/chat/messages.html:62`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/chat/messages.html:65`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/chat/messages.html:81`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/chat/messages.html:83`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/chat/messages.html:86`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/chat/messages.html:91`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/chat/messages.html:99`)<br>`../../assets/icons/chat-search.svg` (`ui-prototype/pages/chat/messages.html:120`)<br>`../../assets/icons/close.svg` (`ui-prototype/pages/chat/messages.html:136`)<br>`../../assets/icons/info-circle.svg` (`ui-prototype/pages/chat/messages.html:192`)<br>`../../assets/icons/chat-attachment.svg` (`ui-prototype/pages/chat/messages.html:226`)<br>`../../assets/icons/chat-send.svg` (`ui-prototype/pages/chat/messages.html:238`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/chat/messages.html:307`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P21 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/contract/confirm.html:52`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/contract/confirm.html:63`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/contract/confirm.html:72`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/contract/confirm.html:75`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/contract/confirm.html:91`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/contract/confirm.html:93`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/contract/confirm.html:96`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/contract/confirm.html:101`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/contract/confirm.html:109`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/contract/confirm.html:490`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P22 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/contract/student-detail.html:43`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/contract/student-detail.html:54`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/contract/student-detail.html:63`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/contract/student-detail.html:66`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/contract/student-detail.html:82`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/contract/student-detail.html:84`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/contract/student-detail.html:87`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/contract/student-detail.html:92`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/contract/student-detail.html:100`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/contract/student-detail.html:210`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/contract/student-detail.html:352`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/contract/student-detail.html:432`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P23 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/contract/tutor-detail.html:47`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/contract/tutor-detail.html:58`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/contract/tutor-detail.html:67`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/contract/tutor-detail.html:70`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/contract/tutor-detail.html:86`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/contract/tutor-detail.html:88`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/contract/tutor-detail.html:91`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/contract/tutor-detail.html:96`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/contract/tutor-detail.html:104`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/contract/tutor-detail.html:449`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P24 | `../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/home.html:37`)<br>`../assets/icons/message.svg` (`ui-prototype/pages/home.html:48`)<br>`../assets/icons/verified.svg` (`ui-prototype/pages/home.html:57`)<br>`../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/home.html:60`)<br>`../assets/icons/profile.svg` (`ui-prototype/pages/home.html:76`)<br>`../assets/icons/chevron-right.svg` (`ui-prototype/pages/home.html:78`)<br>`../assets/icons/dang-xuat.svg` (`ui-prototype/pages/home.html:84`)<br>`../assets/icons/search.svg` (`ui-prototype/pages/home.html:102`)<br>`../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/home.html:134`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P25 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/invitation/create.html:48`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/invitation/create.html:59`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/invitation/create.html:68`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/invitation/create.html:71`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/invitation/create.html:87`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/invitation/create.html:89`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/invitation/create.html:92`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/invitation/create.html:97`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/invitation/create.html:105`)<br>`../../assets/icons/dinh-vi.svg` (`ui-prototype/pages/invitation/create.html:135`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/invitation/create.html:145`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/invitation/create.html:151`)<br>`../../assets/icons/cancel.svg` (`ui-prototype/pages/invitation/create.html:151`)<br>`../../assets/icons/shield.svg` (`ui-prototype/pages/invitation/create.html:157`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/invitation/create.html:183`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P26 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/invitation/negotiation.html:53`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/invitation/negotiation.html:64`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/invitation/negotiation.html:73`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/invitation/negotiation.html:76`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/invitation/negotiation.html:92`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/invitation/negotiation.html:94`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/invitation/negotiation.html:97`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/invitation/negotiation.html:102`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/invitation/negotiation.html:110`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/invitation/negotiation.html:364`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P27 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/job/applicants.html:49`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/job/applicants.html:60`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/job/applicants.html:69`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/job/applicants.html:72`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/job/applicants.html:88`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/job/applicants.html:90`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/job/applicants.html:93`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/job/applicants.html:98`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/job/applicants.html:106`)<br>`../../assets/icons/mat.svg` (`ui-prototype/pages/job/applicants.html:134`)<br>`../../assets/icons/dau-tich.svg` (`ui-prototype/pages/job/applicants.html:178`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/job/applicants.html:220`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P28 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/job/create.html:48`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/job/create.html:59`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/job/create.html:68`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/job/create.html:71`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/job/create.html:87`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/job/create.html:89`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/job/create.html:92`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/job/create.html:97`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/job/create.html:105`)<br>`../../assets/icons/dau-tich.svg` (`ui-prototype/pages/job/create.html:175`)<br>`../../assets/icons/dinh-vi.svg` (`ui-prototype/pages/job/create.html:252`)<br>`../../assets/icons/info-circle.svg` (`ui-prototype/pages/job/create.html:306`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/job/create.html:340`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P29 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/job/detail.html:44`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/job/detail.html:55`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/job/detail.html:64`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/job/detail.html:67`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/job/detail.html:83`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/job/detail.html:85`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/job/detail.html:88`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/job/detail.html:93`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/job/detail.html:101`)<br>`../../assets/icons/info-circle.svg` (`ui-prototype/pages/job/detail.html:117`)<br>`../../assets/icons/clock.svg` (`ui-prototype/pages/job/detail.html:124`)<br>`../../assets/icons/library.svg` (`ui-prototype/pages/job/detail.html:136`)<br>`../../assets/icons/dinh-vi.svg` (`ui-prototype/pages/job/detail.html:144`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/job/detail.html:152`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/job/detail.html:186`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P30 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/job/discover.html:52`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/job/discover.html:63`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/job/discover.html:72`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/job/discover.html:75`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/job/discover.html:91`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/job/discover.html:93`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/job/discover.html:96`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/job/discover.html:101`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/job/discover.html:109`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/job/discover.html:128`)<br>`../../assets/icons/dau-tich.svg` (`ui-prototype/pages/job/discover.html:161`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/job/discover.html:194`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P31 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/job/my-job.html:46`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/job/my-job.html:57`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/job/my-job.html:66`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/job/my-job.html:69`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/job/my-job.html:85`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/job/my-job.html:87`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/job/my-job.html:90`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/job/my-job.html:95`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/job/my-job.html:103`)<br>`../../assets/icons/dau-tich.svg` (`ui-prototype/pages/job/my-job.html:158`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/job/my-job.html:218`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P32 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/order/history.html:54`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/order/history.html:65`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/order/history.html:74`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/order/history.html:77`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/order/history.html:93`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/order/history.html:95`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/order/history.html:98`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/order/history.html:103`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/order/history.html:111`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/order/history.html:265`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P33 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/payment/checkout.html:43`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/payment/checkout.html:54`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/payment/checkout.html:63`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/payment/checkout.html:66`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/payment/checkout.html:82`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/payment/checkout.html:84`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/payment/checkout.html:87`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/payment/checkout.html:92`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/payment/checkout.html:100`)<br>`../../assets/icons/shield.svg` (`ui-prototype/pages/payment/checkout.html:229`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/payment/checkout.html:339`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/payment/checkout.html:351`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P34 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/payment/qr.html:33`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P35 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/payment/result.html:40`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/payment/result.html:51`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/payment/result.html:60`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/payment/result.html:63`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/payment/result.html:79`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/payment/result.html:81`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/payment/result.html:84`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/payment/result.html:89`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/payment/result.html:97`)<br>`../../assets/icons/lock.svg` (`ui-prototype/pages/payment/result.html:132`)<br>`../../assets/icons/shield.svg` (`ui-prototype/pages/payment/result.html:163`)<br>`../../assets/icons/payment-copy.svg` (`ui-prototype/pages/payment/result.html:188`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/payment/result.html:247`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P36 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/tutor/manage.html:54`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/tutor/manage.html:65`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/tutor/manage.html:74`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/tutor/manage.html:77`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/tutor/manage.html:93`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/tutor/manage.html:95`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/tutor/manage.html:98`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/tutor/manage.html:103`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/tutor/manage.html:111`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/tutor/manage.html:374`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P37 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/tutor/my-profile.html:35`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/tutor/my-profile.html:46`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/tutor/my-profile.html:55`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/tutor/my-profile.html:58`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/tutor/my-profile.html:74`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/tutor/my-profile.html:76`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/tutor/my-profile.html:79`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/tutor/my-profile.html:84`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/tutor/my-profile.html:92`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P38 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/tutor/profile.html:51`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/tutor/profile.html:62`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/tutor/profile.html:71`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/tutor/profile.html:74`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/tutor/profile.html:90`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/tutor/profile.html:92`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/tutor/profile.html:95`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/tutor/profile.html:100`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/tutor/profile.html:108`)<br>`../../assets/icons/certificate.svg` (`ui-prototype/pages/tutor/profile.html:144`)<br>`../../assets/icons/calendar.svg` (`ui-prototype/pages/tutor/profile.html:169`)<br>`../../assets/icons/star.svg` (`ui-prototype/pages/tutor/profile.html:175`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/tutor/profile.html:244`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P39 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/tutor/search.html:56`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/tutor/search.html:67`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/tutor/search.html:76`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/tutor/search.html:79`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/tutor/search.html:95`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/tutor/search.html:97`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/tutor/search.html:100`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/tutor/search.html:105`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/tutor/search.html:113`)<br>`../../assets/icons/dinh-vi.svg` (`ui-prototype/pages/tutor/search.html:157`)<br>`../../assets/icons/dau-tich.svg` (`ui-prototype/pages/tutor/search.html:172`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/tutor/search.html:199`) | assets production, context path; giữ alt/size; kiểm Network không404 |
| P40 | `../../assets/brand/logo-horizontal.svg` (`ui-prototype/pages/wallet/overview.html:45`)<br>`../../assets/icons/message.svg` (`ui-prototype/pages/wallet/overview.html:56`)<br>`../../assets/icons/verified.svg` (`ui-prototype/pages/wallet/overview.html:65`)<br>`../../assets/icons/mui-ten-xuong.svg` (`ui-prototype/pages/wallet/overview.html:68`)<br>`../../assets/icons/profile.svg` (`ui-prototype/pages/wallet/overview.html:84`)<br>`../../assets/icons/chevron-right.svg` (`ui-prototype/pages/wallet/overview.html:86`)<br>`../../assets/icons/wallet.svg` (`ui-prototype/pages/wallet/overview.html:89`)<br>`../../assets/icons/receipt.svg` (`ui-prototype/pages/wallet/overview.html:94`)<br>`../../assets/icons/dang-xuat.svg` (`ui-prototype/pages/wallet/overview.html:102`)<br>`../../assets/brand/logo-horizontal-white.svg` (`ui-prototype/pages/wallet/overview.html:365`) | assets production, context path; giữ alt/size; kiểm Network không404 |

