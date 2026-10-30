# DAI-02 — Hồ sơ người dùng và duyệt hồ sơ gia sư

Chủ luồng: Nguyễn Xuân Đại. Phạm vi: TC01 và phần hồ sơ của BB12. Bốn trang chạy bằng DB thật trong profile `db-dev`: `account/profile`, `tutor/my-profile`, `admin/tutor-review-queue`, `admin/tutor-review-detail`. Không còn controller preview cho các trang này (giống `/tutor/manage`).

## URL và form

| Method | URL | Vai trò | Ý nghĩa |
|---|---|---|---|
| GET/POST | `/account/profile` | đã đăng nhập | Xem/sửa họ tên, SĐT, giới thiệu; người học thêm loại (SELF/PARENT), cấp học và khu vực mặc định. Form gửi `version` (user_accounts). |
| GET/POST | `/tutor/my-profile` | TUTOR | Tiêu đề, kinh nghiệm, giới thiệu, môn/cấp/khu vực/hình thức. Form gửi `userVersion` + `tutorVersion`. |
| POST | `/tutor/my-profile/submit` | TUTOR | DRAFT/REJECTED → PENDING. Gửi lặp khi đã PENDING không lỗi, không ghi thêm. |
| POST | `/tutor/my-profile/evidence` | TUTOR | Tải minh chứng (multipart). CSRF đi theo query `_csrf` vì `CsrfFilter` chạy trước khi tách phần thân multipart. |
| POST | `/tutor/my-profile/evidence/{fileId}/delete` | TUTOR | Xóa minh chứng của chính mình. |
| GET | `/files/private/{id}` | chủ tệp hoặc ADMIN | Đọc minh chứng. Người khác nhận 404. |
| GET | `/admin/tutor-review-queue?status=&q=&page=` | ADMIN | Hàng đợi theo trạng thái, tìm theo tên/email/tiêu đề, 10 hồ sơ mỗi trang. Đếm theo trạng thái cho các tab. |
| GET/POST | `/admin/tutor-review-detail?id=` | ADMIN | Xem hồ sơ + minh chứng; POST `action=approve|reject`, `reason`, `version` (tutor_profiles). |

## Quy tắc đã cài

- Vai trò, ID người dùng, trạng thái duyệt không lấy từ form. Service đọc lại tài khoản từ DB (ACTIVE, đã xác minh email, `authenticationVersion` khớp phiên) và kiểm vai trò ở `AccountGuard`.
- Sửa chồng: so `version`; lệch trả 409 kèm hướng dẫn tải lại. Khóa `PESSIMISTIC_WRITE` hồ sơ gia sư khi sửa/gửi/duyệt.
- Hồ sơ PENDING bị khóa chỉnh sửa. Gửi duyệt cần: giới thiệu ≥ 20 ký tự, tiêu đề, ≥ 1 môn/cấp/khu vực/hình thức, ≥ 1 minh chứng.
- Duyệt: chỉ khi PENDING, `version` khớp, tài khoản ACTIVE đã xác minh email và còn ít nhất một minh chứng. Từ chối bắt buộc lý do ≥ 10 ký tự. Gửi lặp cùng quyết định trả kết quả cũ, không ghi nhật ký/thông báo lần hai.
- Mỗi quyết định ghi `audit_logs` (`TUTOR_REVIEW`; gia sư gửi/gửi lại là `TUTOR_PROFILE_SUBMIT`, `TUTOR_PROFILE_REREVIEW`) và `notifications` (`TUTOR_REVIEW`, khóa sự kiện `tutor-review:{tutorId}:{version}`) trong cùng transaction.
- Minh chứng: PDF/PNG/JPG theo **nội dung** (không tin Content-Type), ≤ 5 MB, tối đa 5 tệp. Lưu ngoài `static` tại `app.storage.private-dir` (mặc định `storage/private`, gitignore; đổi bằng `EDUCONNECT_PRIVATE_STORAGE_DIR`), tên tệp trên đĩa là UUID. Trả `Content-Disposition: inline`, `nosniff`, `Cache-Control: private, no-store`.
- Hồ sơ APPROVED không được xóa minh chứng cuối cùng.

## Đề xuất cho Q07 — chờ nhóm xác nhận

Hồ sơ **đã duyệt** quay về Chờ duyệt và tạm ẩn khỏi tìm kiếm công khai khi gia sư sửa tiêu đề, số năm kinh nghiệm, môn, cấp học, hoặc thêm/xóa minh chứng. Giới thiệu, khu vực, hình thức dạy sửa tự do. Quy tắc nằm ở `TutorProfileService` (`professionalChanged`, `reopen`); đổi kết luận Q07 chỉ cần sửa ở đó. Chưa có kết luận về giới hạn loại/kích thước tệp, hiện dùng 5 MB/5 tệp.

## A02 cho Đạt/Huy

`TutorProfileService.load(tutorId)` trả `TutorProfileDTO` (không kiểm quyền; người gọi phải tự kiểm). Dùng `status() == APPROVED` làm điều kiện công khai. `reviewNote` chỉ hiển thị cho chủ hồ sơ hoặc admin. Đạt đọc hồ sơ qua DTO này, không sửa hồ sơ ở luồng khác.

## Dữ liệu và lệch so với giao diện mẫu

Schema chỉ có `headline`, `experience_years`, bốn danh mục, minh chứng và `bio/phone` trong `user_accounts`. Các trường của bản mẫu giai đoạn 1 không có cột (học vấn/trường/chuyên ngành, học phí theo môn, lịch rảnh, bật/tắt nhận lớp) nên không đưa vào; học phí và lịch thuộc `offerings` (DAT-01). Muốn thêm cần migration mới do Đại tạo.

## Kiểm

- `PrivateFileServiceTest` (không cần DB), `TutorProfileMySqlTest` (opt-in, 5 kịch bản trên MySQL thật, rollback): `EDUCONNECT_JPA_TESTS=true` + `EDUCONNECT_JPA_TEST_URL` trỏ `educonnect_test_shared`.
- Đã chạy luồng HTTP đầy đủ trên `educonnect_dev` (gia sư tạm → lưu → tải minh chứng → gửi duyệt → admin từ chối/duyệt → gửi lại → duyệt lại; sai vai trò, sai version, CSRF multipart, truy cập tệp của người khác) rồi xóa dữ liệu tạm.
- `PagesSmokeTest`: bốn trang trên trả 404 ở profile preview (cùng cách với `/tutor/manage`).

## Còn lại

- Minh chứng của dữ liệu seed (`Chung-chi-DEMO.pdf`…) chỉ có metadata, chưa có tệp trên đĩa nên "Mở tệp" trả 404.
- Số đếm trên menu admin (`data-admin-count`) vẫn do script preview; chưa nối DB.

## Môn học / cấp học tùy chỉnh (V9)

- `V9__custom_subject_grade.sql`: thêm `created_by` (người tạo, NULL = danh mục hệ thống) và `UNIQUE(name)` cho `subjects` và `grade_levels`. Cột `name` dùng collation không phân biệt hoa/thường và dấu nên "Toán" và "toan" là một mục.
- `CustomCatalogService` dùng chung: tên đã có thì dùng lại, chưa có thì tạo (mã `TUTOR-…`). Tên 2–60 ký tự, chỉ chữ/số và `. + & ( ) / ' -`. Mỗi người thêm tối đa 10 môn và 5 cấp học mới.
- Dùng ở: hồ sơ gia sư (chip + ô "Thêm môn/cấp học khác"), form khóa học của gia sư (ô cấp học giờ cũng tự nhập được, môn đã có từ trước) và form đăng tin tìm gia sư (cả môn và cấp học).
- Hồ sơ gia sư chỉ hiện chip của danh mục hệ thống, mục đã chọn và mục chính mình tạo; mục của người khác chỉ là gợi ý khi gõ.
