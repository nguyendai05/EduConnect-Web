# Bản đồ các trang giao diện

Các trang trong ứng dụng chính thức sử dụng đường dẫn mô tả rõ tính năng. Các số 01–53 của giao diện trên Google Drive chỉ là mã tham chiếu thiết kế, không bắt buộc dùng làm tên tệp trong ứng dụng chính thức.

| Nhóm chức năng | Thư mục | Ví dụ ánh xạ |
| --- | --- | --- |
| Xác thực | `auth/` | 42 Đăng nhập -> `auth/login`; 43 Đăng ký -> `auth/register` |
| Tài khoản | `account/` | Các trang tài khoản -> `account/<descriptive-name>` |
| Tìm gia sư | `tutor/` | 01 Tìm gia sư -> `tutor/search` |
| Lời mời | `invitation/` | Các trang lời mời -> `invitation/<descriptive-name>` |
| Tin tuyển gia sư | `job/` | Các trang tin tuyển gia sư -> `job/<descriptive-name>` |
| Hợp đồng | `contract/` | Các trang hợp đồng -> `contract/<descriptive-name>` |
| Buổi học | `lesson/` | Các trang buổi học -> `lesson/<descriptive-name>` |
| Thanh toán | `payment/` | Các trang thanh toán -> `payment/<descriptive-name>` |
| Ví | `wallet/` | 11 Ví -> `wallet/index` |
| Trò chuyện | `chat/` | Các trang trò chuyện -> `chat/<descriptive-name>` |
| Thông báo | `notification/` | Các trang thông báo -> `notification/<descriptive-name>` |
| Quản trị | `admin/` | 33 Chi tiết duyệt gia sư -> `admin/tutor-review-detail`; 34 Chi tiết duyệt tin -> `admin/job-review-detail`; 40 Hàng đợi tin -> `admin/job-review-queue` |

Trong các ví dụ trên, `<descriptive-name>` là phần giữ chỗ cho tên mô tả chức năng của trang.

Không nên dùng các tên như `01.html`, `02.html` hoặc `03.html` cho tệp trang trong ứng dụng chính thức.

## 40 trang prototype hiện có

Danh sách entry point thật dưới `ui-prototype/pages/`. Đã kiểm bằng `scripts/checks/static-check.mjs`: **40/40 tồn tại, 0 trùng, 0 link hỏng**. `components/index.html` là trang trưng bày component, **không tính** vào 40 trang sản phẩm.

| # | Entry point | Vai trò | Ghi chú |
| --- | --- | --- | --- |
| 1 | `home.html` | public / mọi vai trò | Trang chủ, "mới công khai" theo `publishedAt` |
| 2 | `auth/login.html` | public | `?state=` |
| 3 | `auth/register.html` | public | |
| 4 | `auth/verify-email.html` | public | `?token=` (token DEMO) |
| 5 | `auth/forgot-password.html` | public | |
| 6 | `auth/reset-password.html` | public | `?token=` (token DEMO) |
| 7 | `account/profile.html` | learner / tutor | |
| 8 | `tutor/search.html` | public / learner | `?q=` |
| 9 | `tutor/profile.html` | public / learner | `?id=` |
| 10 | `tutor/my-profile.html` | tutor | `#lich-ranh` |
| 11 | `tutor/manage.html` | tutor | `?tab=services\|classes\|orders\|revenue` |
| 12 | `invitation/create.html` | learner | `?tutor=`, `?offering=` |
| 13 | `invitation/negotiation.html` | learner / tutor | `?invite=` |
| 14 | `job/create.html` | learner | |
| 15 | `job/my-job.html` | learner | |
| 16 | `job/discover.html` | tutor | |
| 17 | `job/detail.html` | public / tutor | `?id=` mã tin `TT-*` |
| 18 | `job/applicants.html` | learner | `?id=`, nhận cả `?job=` cũ |
| 19 | `catalog/detail.html` | public / learner | `?id=` dùng chung SERVICE và GROUP_CLASS |
| 20 | `cart/index.html` | learner | không nhận giá từ query |
| 21 | `order/history.html` | learner | `?status=`, `?channel=`, `?id=` |
| 22 | `contract/confirm.html` | learner / tutor | `?contract=`, `?order=` |
| 23 | `contract/student-detail.html` | learner | `?id=` |
| 24 | `contract/tutor-detail.html` | tutor | `?id=` |
| 25 | `payment/checkout.html` | learner | `?contract=`, `?from=` (allowlist), `?order=`, `?payment=` |
| 26 | `payment/qr.html` | learner | `?contract=`, `?payment=` — QR là DEMO |
| 27 | `payment/result.html` | learner | `?status=`, `?id=`, legacy `?view=`, `?payment=` |
| 28 | `wallet/overview.html` | learner / tutor | `#transactions` |
| 29 | `chat/messages.html` | learner / tutor | `?contract=`, `?tutor=` — chưa có realtime (BS) |
| 30 | `admin/dashboard.html` | admin | |
| 31 | `admin/manage.html` | admin | `?tab=users\|offerings\|orders` |
| 32 | `admin/tutor-review-queue.html` | admin | `?status=` |
| 33 | `admin/tutor-review-detail.html` | admin | `?id=` |
| 34 | `admin/job-review-queue.html` | admin | `?status=` |
| 35 | `admin/job-review-detail.html` | admin | `?id=` |
| 36 | `admin/reports.html` | admin | `?status=` |
| 37 | `admin/report-detail.html` | admin | `?id=` |
| 38 | `admin/payout-requests.html` | admin | `?status=` |
| 39 | `admin/payout-request-detail.html` | admin | `?id=` |
| 40 | `admin/audit-logs.html` | admin | `?module=` |

### Tabs / modal / section — không tách thành trang riêng

Các chức năng dưới đây nằm trong trang hiện có, **không** có entry point riêng:

- `tutor/manage.html`: tabs dịch vụ · lớp nhóm · đơn đăng ký · doanh thu; modal tạo/sửa/đóng offering, chi tiết đơn chưa có hợp đồng
- `admin/manage.html`: tabs người dùng · dịch vụ/lớp · đơn đăng ký; modal xác nhận lock/unlock/disable kèm lý do
- `order/history.html`: tabs theo 7 trạng thái đơn; modal chi tiết đơn, hủy đơn + xem chính sách hoàn, đánh giá, báo cáo
- `catalog/detail.html`: chọn lựa chọn của SERVICE, chọn số chỗ của GROUP_CLASS, giải thích khi full/closed
- `cart/index.html`: xác nhận checkout, xử lý giá/điều khoản hết hiệu lực và hết chỗ
- `auth/verify-email.html`, `auth/reset-password.html`: các panel trạng thái token chuyển bằng thuộc tính `hidden`

Không tạo trang riêng cho: đăng ký lớp, chi tiết đơn, hủy đơn, đánh giá, báo cáo, thống kê.

### Route JSP / REST trong tương lai — CHỈ LÀ ĐỀ XUẤT

**Chưa có route server nào tồn tại.** Prototype là HTML tĩnh, chưa có JSP fragment, controller hay endpoint. Điều hướng prototype sử dụng đường dẫn HTML; sổ route trong `js/core/route.js` không tạo endpoint Spring MVC.

Bảng ánh xạ frontend → API đề xuất cho giai đoạn tích hợp nằm ở `docs/ui/qa/20261010-2340/03-DATA-VA-BAN-GIAO.md` §8 — toàn bộ là **đề xuất**, không phải API đã có.

### Hiện trạng sau đồng bộ — 11/10/2026

- Đủ 40 entry point HTML; không có route backend/JSP thực thi.
- UserHeader có thứ tự Trang chủ → Tìm gia sư → Tin tìm gia sư trên mọi trang; logo/link auth về home. AdminSidebar có cùng 7 mục trên 11 trang, chi tiết chọn mục cha.
- Các trang job, invitation, order, contract, payment, wallet, catalog và report dùng EduStore cho dữ liệu đã nối. Profile moderation/payout vẫn có bộ dữ liệu preview riêng; sidebar/dashboard lấy số đếm từ chính façade của chúng, không giữ số cố định.
- `job/applicants.html` nhận cả `id` và `job` cũ. Search/filter/sort/page, report evidence/decision và payment result đã được rà lại bằng browser.
- Kiểm thử: `node scripts/checks/static-check.mjs`, `store-check.mjs`, `hook-check.mjs`, `source-check.mjs` trong `scripts/checks/`.
- Chi tiết phạm vi browser và giới hạn: [UI QA](qa/20261010-2340/02-UI-QA.md). Các API backend trong tài liệu bàn giao vẫn là đề xuất.

## URL MVC hiện hành

| Trang | URL | View name | Controller |
|---|---|---|---|
| account/profile.html | /account/profile | pages/account/profile | com.educonnect.user.web.AccountPageController |
| admin/audit-logs.html | /admin/audit-logs | pages/admin/audit-logs | com.educonnect.admin.web.AuditLogsPageController |
| admin/dashboard.html | /admin/dashboard | pages/admin/dashboard | com.educonnect.admin.web.DashboardPageController |
| admin/job-review-detail.html | /admin/job-review-detail | pages/admin/job-review-detail | com.educonnect.admin.web.JobReviewPageController |
| admin/job-review-queue.html | /admin/job-review-queue | pages/admin/job-review-queue | com.educonnect.admin.web.JobReviewPageController |
| admin/manage.html | /admin/manage | pages/admin/manage | com.educonnect.admin.web.AdminManagePageController |
| admin/payout-request-detail.html | /admin/payout-request-detail | pages/admin/payout-request-detail | com.educonnect.admin.web.PayoutPageController |
| admin/payout-requests.html | /admin/payout-requests | pages/admin/payout-requests | com.educonnect.admin.web.PayoutPageController |
| admin/report-detail.html | /admin/report-detail | pages/admin/report-detail | com.educonnect.admin.web.ReportPageController |
| admin/reports.html | /admin/reports | pages/admin/reports | com.educonnect.admin.web.ReportPageController |
| admin/tutor-review-detail.html | /admin/tutor-review-detail | pages/admin/tutor-review-detail | com.educonnect.admin.web.TutorReviewPageController |
| admin/tutor-review-queue.html | /admin/tutor-review-queue | pages/admin/tutor-review-queue | com.educonnect.admin.web.TutorReviewPageController |
| auth/forgot-password.html | /auth/forgot-password | pages/auth/forgot-password | com.educonnect.auth.web.AuthPageController |
| auth/login.html | /auth/login | pages/auth/login | com.educonnect.auth.web.AuthPageController |
| auth/register.html | /auth/register | pages/auth/register | com.educonnect.auth.web.AuthPageController |
| auth/reset-password.html | /auth/reset-password | pages/auth/reset-password | com.educonnect.auth.web.AuthPageController |
| auth/verify-email.html | /auth/verify-email | pages/auth/verify-email | com.educonnect.auth.web.AuthPageController |
| cart/index.html | /cart/index | pages/cart/index | com.educonnect.order.web.CartPageController |
| catalog/detail.html | /catalog/detail | pages/catalog/detail | com.educonnect.lesson.web.CatalogPageController |
| chat/messages.html | /chat/messages | pages/chat/messages | com.educonnect.chat.web.ChatPageController |
| contract/confirm.html | /contract/confirm | pages/contract/confirm | com.educonnect.contract.web.ContractPageController |
| contract/student-detail.html | /contract/student-detail | pages/contract/student-detail | com.educonnect.contract.web.ContractPageController |
| contract/tutor-detail.html | /contract/tutor-detail | pages/contract/tutor-detail | com.educonnect.contract.web.ContractPageController |
| home.html | / và /home | pages/home | com.educonnect.web.HomePageController |
| invitation/create.html | /invitation/create | pages/invitation/create | com.educonnect.invitation.web.InvitationPageController |
| invitation/negotiation.html | /invitation/negotiation | pages/invitation/negotiation | com.educonnect.invitation.web.InvitationPageController |
| job/applicants.html | /job/applicants | pages/job/applicants | com.educonnect.job.web.JobPageController |
| job/create.html | /job/create | pages/job/create | com.educonnect.job.web.JobPageController |
| job/detail.html | /job/detail | pages/job/detail | com.educonnect.job.web.JobPageController |
| job/discover.html | /job/discover | pages/job/discover | com.educonnect.job.web.JobPageController |
| job/my-job.html | /job/my-job | pages/job/my-job | com.educonnect.job.web.JobPageController |
| order/history.html | /order/history | pages/order/history | com.educonnect.order.web.OrderPageController |
| payment/checkout.html | /payment/checkout | pages/payment/checkout | com.educonnect.payment.web.PaymentPageController |
| payment/qr.html | /payment/qr | pages/payment/qr | com.educonnect.payment.web.PaymentPageController |
| payment/result.html | /payment/result | pages/payment/result | com.educonnect.payment.web.PaymentPageController |
| tutor/manage.html | /tutor/manage | pages/tutor/manage | com.educonnect.tutor.web.TutorManagePageController |
| tutor/my-profile.html | /tutor/my-profile | pages/tutor/my-profile | com.educonnect.tutor.web.TutorPageController |
| tutor/profile.html | /tutor/profile | pages/tutor/profile | com.educonnect.tutor.web.TutorPageController |
| tutor/search.html | /tutor/search | pages/tutor/search | com.educonnect.tutor.web.TutorPageController |
| wallet/overview.html | /wallet/overview | pages/wallet/overview | com.educonnect.wallet.web.WalletPageController |

URL/anchor/query được giữ, không hỗ trợ link prototype .html. Vai trò trong bảng prototype là mô phỏng, không phải authorization server.
