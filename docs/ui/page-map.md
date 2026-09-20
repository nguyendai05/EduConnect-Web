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
| Quản trị | `admin/` | 33 Chi tiết duyệt gia sư -> `admin/tutor-review-detail` |

Trong các ví dụ trên, `<descriptive-name>` là phần giữ chỗ cho tên mô tả chức năng của trang.

Không nên dùng các tên như `01.html`, `02.html` hoặc `03.html` cho tệp trang trong ứng dụng chính thức.
