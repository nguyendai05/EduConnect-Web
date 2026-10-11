# 01 — PAGE INVENTORY (40 trang bắt buộc)

Ngày kiểm tra: 2026-10-10 · Branch: `feature/ui-dai-auth` · HEAD lúc khảo sát: `08740ff453905fdd64233b4d7326cec1dca60056`
Kiểm bằng: `scripts/checks/static-check.mjs` → **40/40 trang tồn tại, 0 trang trùng, 0 link hỏng**.

**31 trang cũ được GIỮ NGUYÊN tên file** (không đổi tên, không xóa). **9 trang mới** đánh dấu 🆕.
Mã BB/TC lấy từ `docs/audit-phan-cong/20261010-2214/02-DOI-CHIEU-23-CHUC-NANG.md`.

> **BS01–BS09 chưa được giao triển khai.** Các trang chat/payout/audit chỉ giữ hành vi mẫu hiện có, không mở rộng.

---

## 1. Bảng 40 trang

| # | Trang | Shell / role | BB-TC | File JS | File CSS | Params | Entry point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `pages/home.html` 🆕 | user / public+learner+tutor | TC10 | `js/pages/home.js` | `css/pages/home.css` | — | Brand header+footer, nav "Trang chủ" |
| 2 | `pages/auth/login.html` | auth / public | BB02 | `js/pages/auth/login.js` | `css/pages/auth/login.css` | — | Header menu → Đăng xuất; link từ register |
| 3 | `pages/auth/register.html` | auth / public | BB01 | `js/pages/auth/register.js` | `css/pages/auth/register.css` | — | Link từ login |
| 4 | `pages/auth/verify-email.html` 🆕 | auth / public | BB01 | `js/pages/auth/verify-email.js` | `css/pages/auth/verify-email.css` | `token` | Link từ register; khối token DEMO trên trang |
| 5 | `pages/auth/forgot-password.html` 🆕 | auth / public | BB04 | `js/pages/auth/forgot-password.js` | `css/pages/auth/forgot-password.css` | — | Link "Quên mật khẩu" ở login |
| 6 | `pages/auth/reset-password.html` 🆕 | auth / public | BB04 | `js/pages/auth/reset-password.js` | `css/pages/auth/reset-password.css` | `token` | Link từ verify-email/forgot-password |
| 7 | `pages/account/profile.html` | user / learner+tutor | TC01 | `js/pages/account/profile.js` | `css/pages/account/profile.css` | — | Header menu "Hồ sơ cá nhân" |
| 8 | `pages/tutor/search.html` | user / public+learner | TC08, TC06, TC07 | `js/pages/tutor/search.js` | `css/pages/tutor/search.css` | `q` | Nav "Tìm gia sư"; form tìm ở home |
| 9 | `pages/tutor/profile.html` | user / public+learner | TC09, TC04, TC05 | `js/pages/tutor/profile.js` | `css/pages/tutor/profile.css` | `id` | Card ở search/home; link tutor từ catalog |
| 10 | `pages/tutor/my-profile.html` | user / tutor | BB13 | `js/pages/tutor/my-profile.js` | `css/pages/tutor/my-profile.css` | `#lich-ranh` | Header menu gia sư |
| 11 | `pages/tutor/manage.html` 🆕 | user / tutor | BB13, BB10, BB11 | `js/pages/tutor/manage.js` | `css/pages/tutor/manage.css` | `tab=services\|classes\|orders\|revenue` | Header menu gia sư (3 mục) |
| 12 | `pages/invitation/create.html` | user / learner | BB07 | `js/pages/invitation/create.js` | `css/pages/invitation/create.css` | `tutor`, `offering` | CTA "Mời gia sư" ở catalog/tutor profile |
| 13 | `pages/invitation/negotiation.html` | user / learner+tutor | BB07 | `js/pages/invitation/negotiation.js` | `css/pages/invitation/negotiation.css` | `invite` | Từ invitation create / tin nhắn |
| 14 | `pages/job/create.html` | user / learner | BB12 | `js/pages/job/create.js` | `css/pages/job/create.css` | — | Footer "Đăng tin"; menu |
| 15 | `pages/job/my-job.html` | user / learner | BB12 | `js/pages/job/my-job.js` | `css/pages/job/my-job.css` | — | Menu học viên |
| 16 | `pages/job/discover.html` | user / tutor | BB12 | `js/pages/job/discover.js` | `css/pages/job/discover.css` | — | Nav "Tin tìm gia sư" |
| 17 | `pages/job/detail.html` | user / public+tutor | BB12 | `js/pages/job/detail.js` | `css/pages/job/detail.css` | `id` (dạng `TT-*`) | Card ở discover |
| 18 | `pages/job/applicants.html` | user / learner | BB12 | `js/pages/job/applicants.js` | `css/pages/job/applicants.css` | xem §5 (gap) | Từ my-job |
| 19 | `pages/catalog/detail.html` 🆕 | user / public+learner | BB05, TC09 | `js/pages/catalog/detail.js` | `css/pages/catalog/detail.css` | `id` (`OF-SVC-*` / `OF-GRP-*`) | Card ở home; link từ tutor profile/search |
| 20 | `pages/cart/index.html` 🆕 | user / learner | BB06 | `js/pages/cart/index.js` | `css/pages/cart/index.css` | — (không nhận giá từ query) | Header menu "Giỏ đăng ký" |
| 21 | `pages/order/history.html` 🆕 | user / learner | BB09, TC02, TC03, TC04, TC05, TC06, TC07 | `js/pages/order/history.js` | `css/pages/order/history.css` | `status`, `channel`, `id` | Header menu "Đơn đăng ký của tôi" |
| 22 | `pages/contract/confirm.html` | user / learner+tutor | TC02 | `js/pages/contract/confirm.js` | `css/pages/contract/confirm.css` | `contract`, `order` | Từ cart checkout / order history |
| 23 | `pages/contract/student-detail.html` | user / learner | TC02, TC03 | `js/pages/contract/student-detail.js` | `css/pages/contract/student-detail.css` | `id` | Link contract ở order history |
| 24 | `pages/contract/tutor-detail.html` | user / tutor | TC02, TC03 | `js/pages/contract/tutor-detail.js` | `css/pages/contract/tutor-detail.css` | `id` | Link từ tutor/manage tab Đơn |
| 25 | `pages/payment/checkout.html` | user / learner | BB08 | `js/pages/payment/checkout.js` | `css/pages/payment/checkout.css` | `contract`, `from` (allowlist), `order`, `payment` | Từ contract confirm / order history |
| 26 | `pages/payment/qr.html` | user / learner | BB08 | `js/pages/payment/qr.js` | `css/pages/payment/qr.css` | `contract`, `payment` | Từ checkout |
| 27 | `pages/payment/result.html` | user / learner | BB08 | `js/pages/payment/result.js` | `css/pages/payment/result.css` | `status`, `id`, legacy `view`, `payment` | Redirect từ QR |
| 28 | `pages/wallet/overview.html` | user / learner+tutor | BB09 | `js/pages/wallet/overview.js` | `css/pages/wallet/overview.css` | `#transactions` | Header menu (2 mục) |
| 29 | `pages/chat/messages.html` | user / learner+tutor | BS (giữ nguyên) | `js/pages/chat/messages.js` | `css/pages/chat/messages.css` | `contract`, `tutor` | Icon tin nhắn ở header |
| 30 | `pages/admin/dashboard.html` | admin | BB10, BB11, BB12 | `js/pages/admin/dashboard.js` | `css/pages/admin/dashboard.css` | — | Sidebar "Tổng quan" |
| 31 | `pages/admin/manage.html` 🆕 | admin | BB12 | `js/pages/admin/manage.js` | `css/pages/admin/manage.css` | `tab=users\|offerings\|orders` | Sidebar "Quản lý nền tảng" |
| 32 | `pages/admin/tutor-review-queue.html` | admin | BB12 | `js/pages/admin/tutor-review-queue.js` | `css/pages/admin/tutor-review-queue.css` | `status` | Sidebar |
| 33 | `pages/admin/tutor-review-detail.html` | admin | BB12 | `js/pages/admin/tutor-review-detail.js` | `css/pages/admin/tutor-review-detail.css` | `id` (`HSGS-*`) | Từ queue |
| 34 | `pages/admin/job-review-queue.html` | admin | BB12 | `js/pages/admin/job-review-queue.js` | `css/pages/admin/job-review-queue.css` | `status` | Sidebar |
| 35 | `pages/admin/job-review-detail.html` | admin | BB12 | `js/pages/admin/job-review-detail.js` | `css/pages/admin/job-review-detail.css` | `id` (`TT-*`) | Từ queue |
| 36 | `pages/admin/reports.html` | admin | TC05 | `js/pages/admin/reports.js` | `css/pages/admin/reports.css` | `status` | Sidebar |
| 37 | `pages/admin/report-detail.html` | admin | TC05 | `js/pages/admin/report-detail.js` | `css/pages/admin/report-detail.css` | `id` (`RP-*`) | Từ queue |
| 38 | `pages/admin/payout-requests.html` | admin | BB12 (BS chưa giao) | `js/pages/admin/payout-requests.js` | `css/pages/admin/payout-requests.css` | `status` | Sidebar |
| 39 | `pages/admin/payout-request-detail.html` | admin | BB12 (BS chưa giao) | `js/pages/admin/payout-request-detail.js` | `css/pages/admin/payout-request-detail.css` | `id` (`PO-*`) | Từ queue |
| 40 | `pages/admin/audit-logs.html` | admin | BB12 | `js/pages/admin/audit-logs.js` | `css/pages/admin/audit-logs.css` | `module` | Sidebar |

`components/index.html` là **component showcase, không tính vào 40 trang sản phẩm**.

---

## 2. Tabs / modal / section (không tách thành trang riêng)

Đúng yêu cầu "không tạo một page riêng cho từng mã BB/TC":

| Nơi chứa | Tabs | Modal / drawer |
| --- | --- | --- |
| `tutor/manage.html` | `services` · `classes` · `orders` · `revenue` | Tạo/sửa offering, chi tiết offering (kèm snapshot đơn cũ vs giá hiện tại), chi tiết đơn chưa có contract |
| `admin/manage.html` | `users` · `offerings` · `orders` | Chi tiết người dùng, xác nhận lock/unlock/disable + reason, chi tiết offering, chi tiết đơn |
| `order/history.html` | tabs trạng thái: all · created · awaiting_payment · active · completed · cancellation_pending · cancelled | Chi tiết đơn (khi chưa có contract), hủy đơn + reason + policy preview, đánh giá, báo cáo |
| `catalog/detail.html` | — | Chọn lựa chọn (`options`) của SERVICE, chọn số chỗ của GROUP_CLASS, giải thích khi full/closed |
| `cart/index.html` | — | Xác nhận checkout, xử lý `stale-price`/`not-enough-seats`/`closed` |
| `admin/dashboard.html` | — | — (bar + pie render thẳng vào section) |
| `home.html` | — | — |
| `auth/verify-email.html` | — | Các panel trạng thái token (valid/expired/used/missing/bogus) chuyển bằng `hidden` |
| `auth/reset-password.html` | — | Panel lỗi token thay cho form |

**Không tạo** trang riêng cho: đăng ký lớp, chi tiết đơn, cancel, review, report, thống kê.

---

## 3. Luồng xuyên trang (đã nối bằng dữ liệu chung)

| Luồng | Chuỗi trang | Record nối |
| --- | --- | --- |
| Chọn dịch vụ → giỏ → đơn → hợp đồng → thanh toán | `catalog/detail?id=OF-SVC-1001` → `cart/index` → `contract/confirm?contract=&order=` → `payment/checkout` → `payment/qr` → `payment/result` | `OD-*` → `HD-*` → `PAY-*` |
| Lớp nhóm còn chỗ → giỏ → đơn + ghi danh | `catalog/detail?id=OF-GRP-2001` → `cart` → `order/history` | `EN-*`, trừ `enrolled`, trả chỗ khi hủy |
| Lời mời → thương lượng → đơn | `tutor/profile?id=` → `invitation/create?tutor=&offering=` → `invitation/negotiation?invite=` → `contract/confirm` | `INV-*` + `proposals[].version` |
| Tin tìm gia sư → duyệt → ứng tuyển → chọn | `job/create` → `admin/job-review-queue` → `job/discover` → `job/detail?id=` → `job/applicants` | `JOB-*` / `TT-*`, `APP-*` |
| Đơn → hủy → hoàn tiền → ví | `order/history` (modal cancel) → `wallet/overview#transactions` | `cancellation.state` ≠ `refund.state`, `TT-*` |
| Hoàn tất → đánh giá → hồ sơ công khai | `order/history` (review) → `tutor/profile?id=` | `RV-*`, `ratingSummary()` |
| Báo cáo → admin xử lý → người gửi thấy kết quả | `tutor/profile` / `order/history` → `admin/reports` → `admin/report-detail?id=` | `RP-*` **cùng ID** hai phía |
| Gia sư quản lý → catalog công khai đổi | `tutor/manage?tab=services` (submit→duyệt) → `home` / `catalog/detail` | `OFFERING_TRANSITIONS` |
| Admin quản lý → cùng record với queue riêng | `admin/manage?tab=offerings` ↔ `admin/tutor-review-queue` | cùng tập `offerings` / `tutors` |

---

## 4. Trạng thái mẫu có thể mở trực tiếp (không có nút giả lập trên UI)

| Mục đích | URL |
| --- | --- |
| Verify token hợp lệ / hết hạn / đã dùng / không có / không tồn tại | `pages/auth/verify-email.html?token=DEMO-VERIFY-VALID` · `-EXPIRED` · `-USED` · *(bỏ token)* · `?token=KHONG-TON-TAI` |
| Reset token hợp lệ / hết hạn / đã dùng | `pages/auth/reset-password.html?token=DEMO-RESET-VALID` · `-EXPIRED` · `-USED` |
| SERVICE published+open | `pages/catalog/detail.html?id=OF-SVC-1001` |
| SERVICE đã đóng | `pages/catalog/detail.html?id=OF-SVC-1006` |
| GROUP còn chỗ / còn đúng 1 chỗ / FULL / chưa công khai | `?id=OF-GRP-2001` · `OF-GRP-2004` · `OF-GRP-2002` · `OF-GRP-2005` |
| ID không tồn tại (empty/error) | `pages/catalog/detail.html?id=OF-SVC-9999` |
| Đơn chưa có contract | `pages/order/history.html?id=OD-2026-0004` |
| Đơn đang chờ hủy + refund pending | `pages/order/history.html?id=OD-2026-0006` |
| Đơn đã hủy + refund succeeded | `pages/order/history.html?id=OD-2026-0005` |
| Payment verified-success (fixture kiểm soát) | `pages/payment/result.html?id=PAY-2026-0007` |
| URL `status=success` nhưng payment pending (không được mutate) | `pages/payment/result.html?status=success&id=PAY-2026-0003` |
| Filter không hợp lệ | `pages/order/history.html?status=khong-ton-tai` · `pages/admin/manage.html?tab=bogus` · `pages/tutor/manage.html?tab=bogus` |
| Report open / investigating / resolved / dismissed | `pages/admin/report-detail.html?id=RP-2026-0011` · `0010` · `0009` · `0008` |

**Đổi persona demo** (không phải đăng nhập thật): mở console trang bất kỳ đã nạp store rồi chạy
`EduStore.setSession('TUTOR-01')` (gia sư đã duyệt) · `'TUTOR-02'` (gia sư **chưa duyệt** — để kiểm UI gate) · `'PARENT-01'` · `'STUDENT-01'` · `'ADMIN-01'`, sau đó reload.
`EduStore.logout()` chỉ xóa persona đăng nhập mẫu. Xóa key `educonnect:demo-store:v4` chỉ đặt lại store; cart và quyết định của façade có key riêng.

---

## 5. Hiện trạng cập nhật — 11/10/2026

40 trang vẫn giữ tên file. Tin/ứng tuyển/đơn/hợp đồng/thanh toán và báo cáo đã nối dữ liệu mẫu theo phần đã triển khai. Nav/header/sidebar và link về home đã được chuẩn hóa. Các trang chi tiết có heading và phản hồi mã không hợp lệ; report detail được sửa adapter evidence và quyết định.

Tutor review/payout còn collection preview riêng; sidebar/dashboard đọc cùng façade của hàng đợi này. Chưa có backend/phân quyền thật. Phí10% là giả định demo. Xem [QA hiện tại](02-UI-QA.md) để biết kiểm chứng và giới hạn; không dùng ghi chú tiến độ cũ như kết quả hiện tại.
