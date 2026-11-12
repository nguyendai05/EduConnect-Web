# DAI-03 — Quản trị nền tảng, duyệt khóa học và nhật ký hệ thống

Chủ luồng: Nguyễn Xuân Đại. Phạm vi: phần quản trị người dùng, khóa học, đơn đăng ký và nhật ký hệ thống của `BB12` (kèm hợp đồng bàn giao `A10`). Ba trang chạy bằng dữ liệu MySQL thật trong profile `db-dev`: `admin/manage`, `admin/offering-review-detail`, `admin/audit-logs`. Không còn nạp dữ liệu mẫu `EduFixtures`/`EduStore` trên các trang này (`preview = false`).

## URL và form

| Method | URL | Vai trò | Ý nghĩa |
|---|---|---|---|
| GET | `/admin/manage?tab=&q=&role=&status=&type=&page=` | ADMIN | Danh sách thực thể toàn nền tảng theo 3 tab (`users`, `offerings`, `orders`), tìm kiếm theo từ khóa, lọc trạng thái/vai trò/loại hình, phân trang 10 dòng/trang kèm bộ đếm tổng trên từng tab. |
| POST | `/admin/manage/account-status` | ADMIN | Đổi trạng thái tài khoản (`ACTIVE`, `LOCKED`, `DISABLED`) có kiểm `version` (`user_accounts`) và bắt buộc lý do ≥ 10 ký tự khi khóa hoặc vô hiệu hóa. |
| GET/POST | `/admin/offering-review-detail?id=` | ADMIN | Xem chi tiết khóa học + lịch học và quyết định duyệt (`action=approve`, chuyển `IN_REVIEW` → `PUBLISHED`) hoặc từ chối (`action=reject`, chuyển `IN_REVIEW` → `REJECTED`, bắt buộc lý do ≥ 10 ký tự) kèm `version` (`offerings`). |
| GET | `/admin/audit-logs?group=&q=&actor=&range=&from=&to=&sort=&page=` | ADMIN | Nhật ký hệ thống chỉ đọc (read-only), lọc theo nhóm nghiệp vụ (`all`, `tutor`, `offering`, `job`, `account`, `order`, `dispute`), từ khóa, vai trò người thực hiện, khoảng thời gian theo múi giờ Việt Nam (`UTC+7`), sắp xếp mới nhất/cũ nhất và xem chi tiết JSON đã che trường nhạy cảm. |

## Quy tắc đã cài

- **Kiểm quyền tại máy chủ**: Mọi thao tác đọc/ghi trong `AdminManageService`, `OfferingReviewService` và `AuditLogService` đều gọi `AccountGuard.require(principal, "ADMIN")` bên cạnh cấu hình URL `/admin/**` trong `SecurityConfig`.
- **Khóa/mở khóa/vô hiệu hóa tài khoản (`AdminManageService.changeStatus`)**:
  - Khóa bản ghi `user_accounts` bằng `PESSIMISTIC_WRITE` và kiểm `version`; nếu lệch phiên bản trả `409 Conflict` kèm hướng dẫn tải lại trang.
  - Không cho phép quản trị viên tự khóa hoặc tự vô hiệu hóa tài khoản của chính mình.
  - Khi chuyển sang `LOCKED` hoặc `DISABLED`, bắt buộc nhập lý do ≥ 10 ký tự và tăng `authentication_version` thêm 1 để thu hồi ngay các phiên đăng nhập hiện có của tài khoản đó (`AccountPrincipalValidator`).
  - Gửi lặp cùng trạng thái trả kết quả thành công mà không tăng `authentication_version` hay ghi nhật ký trùng.
  - Ghi bản ghi `audit_logs` (`action_code = 'USER_STATUS_CHANGE'`, metadata gồm `previousStatus`, `newStatus`, `previousVersion`, `resultingVersion`, `reason`) trong cùng transaction.
- **Duyệt khóa học (`OfferingReviewService.decide`)**:
  - Khóa bản ghi `offerings` bằng `PESSIMISTIC_WRITE`, kiểm `version` và chỉ cho phép xử lý khi khóa học đang ở trạng thái `IN_REVIEW`.
  - Chỉ cho phép duyệt công khai (`PUBLISHED`) khi hồ sơ gia sư sở hữu khóa học đã ở trạng thái `APPROVED` và tài khoản gia sư đang `ACTIVE`, đã xác minh email.
  - Từ chối (`REJECTED`) bắt buộc lý do ≥ 10 ký tự. Gửi lặp cùng quyết định trả kết quả hiện tại mà không ghi trùng nhật ký hay thông báo.
  - Ghi đồng thời `audit_logs` (`action_code = 'OFFERING_REVIEW'`) và `notifications` (`notification_type = 'OFFERING_REVIEW'`, khóa sự kiện `offering-review:{offeringId}:{version}`) trong cùng transaction.
- **Nhật ký hệ thống chỉ đọc & che trường nhạy cảm (`AuditLogService`)**:
  - Truy vấn `@Transactional(readOnly = true)` kết hợp `audit_logs`, `user_accounts` (actor và target), `orders` và `reports`.
  - Lọc khoảng ngày (`today`, `7d`, `30d`, `custom` với `from`/`to`) quy đổi chính xác theo múi giờ `Asia/Ho_Chi_Minh` (`UTC+7`) sang mốc `UTC` trong DB.
  - Hàm `AuditLogService.sanitizeMetadata(...)` duyệt đệ quy toàn bộ `Map`/danh sách trong `metadata` JSON và thay thế giá trị của mọi khóa nhạy cảm (`password`, `password_hash`, `token`, `secret`, `otp`, `session`, `cookie`, `authorization`, `credential`, `cccd`, `cmnd`, `bank_account`, `card_number`, `cvv`, `pin`, `signature`…) bằng `"[ĐÃ CHE]"` trước khi trả ra DTO và giao diện.

## Hợp đồng bàn giao A10 (Nhật ký quản trị)

Các luồng nghiệp vụ ghi nhận thao tác quan trọng thông qua entity `com.educonnect.admin.domain.AuditLog` và `com.educonnect.admin.repository.AuditLogJpaRepository` trong cùng `@Transactional` với thay đổi dữ liệu chính:
- `TUTOR_PROFILE_SUBMIT`, `TUTOR_PROFILE_REREVIEW`, `TUTOR_REVIEW` (`TutorProfileService`, `TutorReviewService`) -> nhóm `tutor`, liên kết `/admin/tutor-review-detail?id={tutorId}`.
- `OFFERING_REVIEW` (`OfferingReviewService`) -> nhóm `offering`, liên kết `/admin/offering-review-detail?id={offeringId}`.
- `JOB_REVIEW` (`JobReviewService`) -> nhóm `job`, liên kết `/admin/job-review-detail?id={jobId}`.
- `USER_STATUS_CHANGE` (`AdminManageService`) -> nhóm `account`, liên kết `/admin/manage?tab=users&q={publicCode}`.
- `ORDER_CREATED` -> nhóm `order`, liên kết `/admin/manage?tab=orders&q={orderCode}`.
- `REPORT_CREATED`, `REPORT_DECIDED` -> nhóm `dispute`, liên kết `/admin/reports`.

## Dữ liệu và lệch so với giao diện mẫu

- Bảng `audit_logs` trong schema `V1__educonnect_schema.sql` lưu `id`, `actor_user_id`, `action_code`, `order_id`, `report_id`, `target_user_id`, `metadata` (JSON) và `created_at` (UTC); không có cột địa chỉ IP hay User-Agent riêng nên giao diện thật hiển thị mã tham chiếu `AUD-xxxx`, thời gian `UTC+7`, người thực hiện + vai trò, hành động, liên kết đối tượng, tóm tắt biến động và hộp thoại JSON đã che trường nhạy cảm.

## Kiểm thử

- `AuditLogServiceTest`: kiểm thử đơn vị (chạy mặc định không cần MySQL) cho đệ quy che trường nhạy cảm `sanitizeMetadata`, kiểm quyền `ADMIN`, kiểm ràng buộc tham số lọc (`q` > 100 ký tự, `from > to`, sai định dạng ngày) và `AuditLogsPageController`.
- `TutorProfileMySqlTest`: kiểm thử tích hợp trên MySQL thật (`adminListsRealDataAndChangesAccountStatusWithReason`, `adminReviewsOfferingWithGuardsAuditAndNotification`, `adminViewsAndFiltersAuditLogsWithRedaction`).
- `PagesSmokeTest` & `PreviewDisabledTest`: `/admin/manage` và `/admin/audit-logs` nằm trong `DATABASE_PAGES`, trả `404` ở profile `ui-preview`.
