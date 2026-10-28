# Profile UI - draft P01

Chủ UI: Đạt; backend/session/profile API: Đại. Đây là bản nhu cầu để thống nhất A02, chưa phải backend đã tồn tại.

## P01

- Route `/account/profile`, view `account/profile`, người sở hữu lấy từ session server.
- Các trường UI nguồn: name, email, phone, bio; nhận thêm id/avatar. Email đang editable trong prototype, cần Đại xác nhận chính sách trước khi bật C. Bio giao diện giới hạn 300 ký tự.
- Rendering: server model `profile`, `formErrors`; trạng thái ready/loading/empty/error, initials và nhãn vai trò do server cấp.
- C cần xác nhận danh sách editableFields, version/concurrency, DTO cập nhật, chính sách đổi email/avatar và lỗi từng field. Không gửi owner/role/verified từ form.
- GET/PATCH `/api/account/profile` là đề xuất theo tài liệu giai đoạn 3. URL/method/payload cuối cùng do Đại bàn giao.
- UI save thành công phải đọc hồ sơ server mới; cancel trở về dữ liệu server gần nhất. Lỗi lưu giữ dữ liệu người dùng đang nhập; lỗi từng field gắn vào input có aria-invalid.
- P37 tutor/my-profile chưa triển khai ở lượt này; mở rộng draft sau khi đối chiếu trang đó với Huy/Đại.
