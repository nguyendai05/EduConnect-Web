# Danh sách component giao diện dùng chung

Danh sách này xác định các component giao diện có thể dùng chung trong Sprint 0 và sprint giao diện tiếp theo. Đây là tài liệu hỗ trợ lập kế hoạch, không yêu cầu xây dựng ngay tất cả component. Chỉ tạo component khi có trang thực tế cần sử dụng.

Tên component được giữ bằng tiếng Anh để thuận tiện đối chiếu với mã nguồn; phần mô tả tiếng Việt giải thích vai trò của từng component.

## Bố cục

- UserHeader: phần đầu trang dành cho người dùng
- UserFooter: phần chân trang dành cho người dùng
- AccountFooter: phần chân trang tối giản cho các màn quản lý hồ sơ cá nhân
- AdminHeader: phần đầu trang quản trị
- AdminSidebar: thanh bên của trang quản trị
- Container: khung chứa nội dung
- BrandMasthead: tiêu đề chức năng gọn, dùng cho màn tìm gia sư và tìm lớp

## Điều hướng

- Breadcrumb: đường dẫn phân cấp
- Tabs: các thẻ chuyển đổi nội dung
- Pagination: phân trang
- Dropdown: trình đơn thả xuống

## Thao tác

- Button: nút bấm
- IconButton: nút bấm dạng biểu tượng

## Biểu mẫu

- FormField: trường biểu mẫu
- Input: ô nhập liệu
- PasswordInput: ô nhập mật khẩu
- Textarea: vùng nhập văn bản nhiều dòng
- Select: danh sách lựa chọn
- Checkbox: ô đánh dấu
- Radio: nút chọn một phương án trong nhóm
- Switch: công tắc bật/tắt
- FileUpload: thành phần tải tệp lên
- SearchInput: ô tìm kiếm

## Phản hồi trạng thái

- Badge: nhãn trạng thái hoặc số lượng
- Alert: thông báo hoặc cảnh báo
- Toast: thông báo ngắn xuất hiện tạm thời
- Modal: hộp thoại phủ lên nội dung trang
- Loading: chỉ báo đang tải
- EmptyState: giao diện khi chưa có dữ liệu

## Hiển thị dữ liệu

- Card: thẻ nội dung
- InfoRow: dòng thông tin
- Avatar: ảnh đại diện
- Table: bảng dữ liệu
- Chart: biểu đồ dùng chung (`js/core/charts.js` + `css/components/data-display/chart.css`), có hai biến thể:
  - `EduChart.bar(container, { title, metricLabel, unit, from, to, rows, total, invalidReason, emptyLabel })` — biểu đồ cột theo mốc thời gian, kèm ô chọn khoảng ngày do trang tự render, báo lỗi khi `from > to`, empty state khi không có dữ liệu, không sinh `NaN`/`Infinity` khi tổng bằng 0
  - `EduChart.pie(container, { title, slices, emptyLabel })` — donut SVG thật bằng `stroke-dasharray`, legend có nhãn chữ + số lượng + phần trăm
  - Cả hai luôn sinh kèm bảng số liệu có `caption`/`scope` để không chỉ phân biệt bằng màu; đang dùng ở `admin/dashboard.html` và `tutor/manage.html` — **không nhân bản implementation thứ hai**

## Thành phần nghiệp vụ

- TutorCard: thẻ thông tin gia sư
- JobCard: thẻ tin tuyển gia sư
- ApplicantCard: thẻ thông tin ứng viên
- LessonCard: thẻ thông tin buổi học
- WalletBalanceCard: thẻ số dư ví

Không cần tạo ngay mọi component trong danh sách. Mục đích là giúp nhóm nhận biết thành phần nào nên thuộc giao diện dùng chung, tránh sao chép lặp lại trong từng trang.

## Module JavaScript dùng chung (không phải component render)

Ngoài component giao diện, prototype có bốn module dùng chung trong `js/core/` và `js/data/`. Đây là hạ tầng, không phải component có markup riêng:

- `EduRoute` (`js/core/route.js`): sổ đăng ký 40 tuyến, resolver base path theo độ sâu trang, sinh URL bằng `URLSearchParams`, allowlist `from`/return route chống open redirect, chuẩn hoá `href`/`src` cục bộ
- `EduFixtures` (`js/data/fixtures.js`): thực thể mẫu và quan hệ, chỉ đọc
- `EduStore` (`js/data/store.js`): store có version, bảng trạng thái/hành động, helper tiền tệ và định dạng, `escapeHtml`
- `EduChart` (`js/core/charts.js`): xem mục Chart ở trên

Hai module core có hành vi được cập nhật và ảnh hưởng tới mọi trang:

- `user-header.js`: menu tài khoản dựng lại từ registry theo **vai trò persona** (learner 5 mục, tutor 5 mục) thay vì hard-code theo biến thể chữ cái; brand ở header và footer dẫn về `home.html`; logout gọi `EduStore.logout()` rồi về trang đăng nhập. Vẫn giữ `data-user-variant`, các class biến thể, khối summary, hành vi keyboard/Escape/focusout và sự kiện `user-header:action`
- `admin-sidebar.js`: trước đây là file rỗng. Nay chuẩn hoá sidebar trên cả 10 trang admin — chèn mục còn thiếu (`manage.html`), đồng bộ `is-active`/`aria-current="page"` theo trang hiện tại, trang chi tiết được tính là đang ở mục hàng đợi cha
