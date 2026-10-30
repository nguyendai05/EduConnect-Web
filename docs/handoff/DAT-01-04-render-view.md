# DAT-01 đến DAT-04 — Render view theo prototype

Cập nhật ngày 29/10/2026. `ui-prototype/` là nguồn tham chiếu, không bị sửa. Các view thật tiếp tục dùng Thymeleaf, DTO công khai, quyền phiên hiện có và các form/action đang triển khai.

## Phạm vi

| Luồng | View | Bố cục và dữ liệu |
|---|---|---|
| DAT-01 | `tutor/manage` | Header, tabs, bảng dịch vụ và form đang có; đồng bộ khoảng cách, ô nhập và nút; giữ các thao tác lưu/gửi duyệt/đóng. |
| DAT-01 | `catalog/detail` | Giữ hero, nội dung, lịch học và cột đăng ký theo mẫu. |
| DAT-01 | `catalog/index` | Chế độ danh sách khi `/catalog/detail` không có ID; thẻ dịch vụ và phân trang. |
| DAT-02 | `home` | Hero tìm kiếm và các thẻ dịch vụ thật; đồng bộ khung và chiều cao thẻ. |
| DAT-02 | `tutor/search` | Render từ `TutorSearchResponse`; bộ lọc lấy danh mục thật, giữ query, sắp xếp và phân trang ở server. |
| DAT-02 | `tutor/profile` | Render `TutorProfileResponse`; tên, giới thiệu, kinh nghiệm và dịch vụ công khai; liên kết dùng đúng ID số của gia sư/dịch vụ. |
| DAT-03 | `invitation/create` | Form chia nhóm, thông tin gia sư và cột tổng đề xuất; giữ requestKey/version/CSRF/consent. |
| DAT-03 | `invitation/negotiation` | Danh sách thẻ; chi tiết hai cột gồm nội dung, hai bên và thao tác theo quyền. |
| DAT-04 | `job/discover` | Giữ khung tìm kiếm đã đồng bộ với tìm gia sư. |
| DAT-04 | `job/create` | Breadcrumb, header, form chia phần và cột hướng dẫn theo mẫu; giữ lưu nháp/gửi duyệt. |
| DAT-04 | `job/detail` | Hero tin, thông tin học và cột ứng tuyển/quản lý; form theo quyền hiện có. |
| DAT-04 | `job/my-job` | Header thao tác, bộ lọc, thẻ tin và cột tổng quan từ kết quả thật. |
| DAT-04 | `job/applicants` | Tóm tắt tin, danh sách gia sư và các đề xuất; giữ điều kiện chọn/từ chối/consent. |
| DAT-04 | `admin/job-review-queue` | Bộ lọc và bảng tin theo mẫu; bảng cuộn trong khung riêng trên điện thoại. |
| DAT-04 | `admin/job-review-detail` | Nội dung và cột quyết định duyệt; giữ version/lý do/phê duyệt/từ chối. |

14 trang chính và một view danh sách catalog bổ sung được rà soát.

## Cấu trúc render

- `static/css/pages/dat-render.css`: lớp bố cục/component dùng chung, chỉ nạp trên các view trên, dùng token màu và kích thước hiện có.
- `templates/pages/tutor/fragments-live.html`: các khối HTML tìm kiếm/hồ sơ thật, giữ class bố cục của prototype.
- `TutorDiscoveryPageController` chỉ chạy trong `db-dev`, nhận form tìm kiếm hoặc ID hồ sơ rồi gọi `TutorDiscoveryService`. Bổ sung danh mục chỉ đọc cho bộ lọc, không thay thuật toán truy vấn kết quả.
- `TutorPageController` giữ route hồ sơ riêng `/tutor/my-profile`. `TutorPreviewPageController` giữ hai route tham chiếu khi không chạy `db-dev`; view prototype chỉ render trong chế độ đó.
- Khi chạy DB, hai trang công khai không nạp fixture/store. Không dựng điểm đánh giá, số lớp đã dạy, lịch rảnh hoặc minh chứng khi DTO chưa cung cấp. A02/A08 vẫn theo bàn giao của chủ luồng tương ứng.
- Cập nhật asset contract của 14 view theo danh sách CSS/JS thực tế; không chạy generator từ prototype để ghi đè thiết kế tham chiếu.

## Xác minh

- Biên dịch Java thành công.
- `TutorManageMvcTest` và `TutorDiscoveryMvcTest`: 19 test qua; có kiểm context path, escape nội dung, ID số, form thật/CSRF, không nạp fixture, khoảng giá sai và hồ sơ không tồn tại/ID sai.
- `template-check.mjs`, `route-check.mjs`, kiểm cú pháp JS mới và `git diff --check`: qua.
- Kiểm trực tiếp các view với MySQL hiện có bằng khách, học viên, gia sư và quản trị viên. Chỉ đọc trang/tìm kiếm; không gửi form tạo, sửa, chọn gia sư hoặc quyết định duyệt để thử giao diện.
- Đối chiếu desktop và màn hình 390 px cho nhóm tìm kiếm/hồ sơ, quản lý dịch vụ, form đăng tin, tin của tôi, ứng viên, lời mời và duyệt tin. Không tràn trang; bảng quản trị cuộn trong khung riêng.
- Không chạy toàn bộ bộ test MySQL/SMTP hoặc đánh dấu các nghiệp vụ A02/A08/Q10 đã hoàn tất.

Sau khi cập nhật source, khởi động lại Spring Boot và tải lại không dùng cache để nhận template/controller mới.
