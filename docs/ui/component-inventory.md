# Danh sách component giao diện dùng chung

Danh sách này xác định các component giao diện có thể dùng chung trong Sprint 0 và sprint giao diện tiếp theo. Đây là tài liệu hỗ trợ lập kế hoạch, không yêu cầu xây dựng ngay tất cả component. Chỉ tạo component khi có trang thực tế cần sử dụng.

Tên component được giữ bằng tiếng Anh để thuận tiện đối chiếu với mã nguồn; phần mô tả tiếng Việt giải thích vai trò của từng component.

## Bố cục

- UserHeader: phần đầu trang dành cho người dùng
- UserFooter: phần chân trang dành cho người dùng
- AdminHeader: phần đầu trang quản trị
- AdminSidebar: thanh bên của trang quản trị
- Container: khung chứa nội dung

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

## Thành phần nghiệp vụ

- TutorCard: thẻ thông tin gia sư
- JobCard: thẻ tin tuyển gia sư
- ApplicantCard: thẻ thông tin ứng viên
- LessonCard: thẻ thông tin buổi học
- WalletBalanceCard: thẻ số dư ví

Không cần tạo ngay mọi component trong danh sách. Mục đích là giúp nhóm nhận biết thành phần nào nên thuộc giao diện dùng chung, tránh sao chép lặp lại trong từng trang.
