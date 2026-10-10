# Bản mẫu giao diện

Thư mục bản mẫu là nơi xây dựng các thành phần giao diện có thể tái sử dụng, không phụ thuộc framework, trước khi tích hợp JSP.

```text
Thiết kế tham khảo
  -> Giá trị thiết kế dùng chung (Design Token)
  -> Component giao diện dùng chung
  -> Component nghiệp vụ
  -> Trang giao diện
  -> Mảnh giao diện JSP (JSP Fragment) / Trang JSP
```

Các tệp HTML trên Google Drive không phải mã nguồn của ứng dụng chính thức. Có thể tham khảo bố cục, kiểu chữ, component, khoảng cách, nội dung và trạng thái giao diện trong các tệp này, nhưng không được sao chép nguyên tệp vào kho mã nguồn.

Xây dựng các thành phần cơ bản dùng chung trước, tiếp đến là component nghiệp vụ, cuối cùng mới ghép thành các trang. CSS dùng chung được đặt trong `css/components/`, xử lý JavaScript dùng chung được đặt trong `js/core/`, còn tài nguyên riêng của từng trang được đặt trong thư mục tính năng tương ứng thuộc `css/pages/` hoặc `js/pages/`.

## Hàng đợi duyệt tin tìm gia sư

Trang `pages/admin/job-review-queue.html` tham chiếu thiết kế số 40, ghép AdminShell, AdminHeader, AdminSidebar, Table, Badge, Pagination, SearchInput, Select, Tabs, StatCard, Loading và EmptyState dùng chung. CSS riêng chỉ tổ chức bố cục trang; các biến thể bảng kiểm duyệt và select native nằm trong CSS component.

Trang sử dụng dữ liệu mẫu chung trong `js/pages/admin/job-review-data.js`, hỗ trợ tìm kiếm không dấu theo mã tin, tiêu đề, người đăng, môn/lớp và khu vực; lọc trạng thái, dấu hiệu rà soát, môn học; sắp xếp, phân trang, làm mới. Liên kết Xem chi tiết mở `admin/job-review-detail.html?id=<mã-tin>`.

Pagination giữ nguyên markup cũ và bổ sung hai sự kiện: `pagination:update` nhận `{ total, pageSize, current }` khi dữ liệu đổi; `pagination:change` trả `{ page, pageSize, total }` khi người dùng chuyển trang. Slot `data-page-numbers` bật sinh số trang tự động, không cần viết lại phân trang trong từng trang.

## Chi tiết duyệt tin tìm gia sư

Trang `pages/admin/job-review-detail.html` tham chiếu thiết kế số 34, hiển thị người đăng, mô tả, môn/lớp, lịch học, hình thức, khu vực, ngân sách, yêu cầu gia sư và nội dung cần rà soát. Trang dùng chung Card, Avatar, InfoRow, Badge, Alert, Modal, Textarea, Button, Toast và Admin shell.

Duyệt tin cần xác nhận trong Modal rồi chuyển trạng thái sang Đang tuyển. Từ chối tin cần lý do từ 10 đến 1000 ký tự, có mẫu lý do để chọn nhanh. Kết quả và lý do được lưu trong `sessionStorage` với khóa `educonnect:job-review-decisions:v1`, đồng bộ khi quay lại hoặc làm mới hàng đợi. Tin đã xử lý không thể duyệt/từ chối lần nữa trong prototype. Nếu lưu thất bại, trạng thái giữ nguyên và hiển thị phản hồi lỗi để thử lại. Chưa gọi API, gửi thông báo thực tế, tạo hợp đồng hoặc thu phí.

Chạy từ thư mục gốc của project để xem hai trang trên cùng origin:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory ui-prototype
```

Mở `http://127.0.0.1:8765/pages/admin/job-review-queue.html` hoặc `http://127.0.0.1:8765/pages/admin/job-review-detail.html?id=TT-8841`. Đóng phiên tab hoặc xóa khóa lưu nói trên để dùng lại trạng thái mẫu ban đầu.

## Bảng điều khiển và các trang quản trị còn lại

Khu vực quản trị có mười trang dùng chung AdminShell, AdminHeader và AdminSidebar; nhãn số trên sidebar giống nhau ở cả mười trang và khớp với số bản ghi chờ xử lý của từng hàng đợi.

| Thiết kế | Trang |
| --- | --- |
| 32 Tổng quan | `admin/dashboard.html` |
| 39 và 33 Duyệt gia sư | `admin/tutor-review-queue.html`, `admin/tutor-review-detail.html` |
| 40 và 34 Duyệt tin | `admin/job-review-queue.html`, `admin/job-review-detail.html` |
| 37 và 38 Rút tiền | `admin/payout-requests.html`, `admin/payout-request-detail.html` |
| 35 và 36 Báo cáo và tranh chấp | `admin/reports.html`, `admin/report-detail.html` |
| 41 Nhật ký hệ thống | `admin/audit-logs.html` |

Mỗi cặp trang danh sách - chi tiết dùng chung dữ liệu mẫu trong `js/pages/admin/<nghiệp-vụ>-data.js` và lưu quyết định xử lý vào `sessionStorage` theo khóa `educonnect:<nghiệp-vụ>-decisions:v1`, nên duyệt ở trang chi tiết sẽ phản ánh ngay vào bộ đếm của hàng đợi. Trang danh sách có tìm kiếm không dấu, bộ lọc, sắp xếp, phân trang cùng trạng thái đang tải và trạng thái trống; trang chi tiết đọc tham số `id`, báo rõ khi mã không hợp lệ, xác nhận mọi thao tác đổi trạng thái bằng Modal và giữ nguyên trạng thái nếu lưu thất bại.

Rút tiền áp quy tắc hai bước: duyệt chỉ ủy quyền, sau đó mới xác nhận đã chuyển khoản; thao tác duyệt bị khóa cho tới khi tích xác nhận đối chiếu. Báo cáo và tranh chấp chỉ kết luận một lần, lý do hoặc ghi chú xử lý phải dài từ 10 đến 1000 ký tự. Nhật ký hệ thống không lưu mật khẩu, token, số định danh hay số điện thoại đầy đủ, các trường nhạy cảm hiển thị dạng đã che.

Trang tổng quan dùng thẻ chỉ số và biểu đồ dựng bằng CSS thuần, có mô tả chữ cho từng biểu đồ; chưa thêm thư viện biểu đồ nào.

## Điều hướng giữa các trang

Mọi lượt chuyển trang dùng `<a href>` thật; `<button>` chỉ còn cho lọc, mở menu, modal và đổi trạng thái. Prototype không có trang chủ, nên thương hiệu ở đầu trang trỏ theo vai trò đang hiển thị: trang phía người dùng về `tutor/search.html`, trang phía gia sư về `job/discover.html`, trang quản trị về `admin/dashboard.html`. Khu người dùng và khu quản trị không liên kết chéo, ngoại trừ đăng xuất về trang đăng nhập.

Bảng tham số mà trang đích thực sự đọc:

| Trang đích | Tham số | Nguồn liên kết |
| --- | --- | --- |
| `tutor/profile.html` | `id` | danh sách tìm gia sư, danh sách ứng viên |
| `invitation/create.html` | `tutor` | trang hồ sơ gia sư |
| `invitation/negotiation.html` | `invite` | biểu mẫu mời sau khi xác nhận gửi |
| `contract/confirm.html` | `contract` | thương lượng lời mời, chọn gia sư cho tin |
| `payment/checkout.html` | `contract`, `from` (`contract` hoặc `contract-detail`) | xác nhận hợp đồng, chi tiết hợp đồng |
| `payment/qr.html` | `contract` | thanh toán |
| `payment/result.html` | `status`, `id` | mã QR |
| `contract/student-detail.html`, `contract/tutor-detail.html` | `id` | kết quả thanh toán, tin nhắn, ví |
| `chat/messages.html` | `contract` | trang hồ sơ, trang hợp đồng |
| `wallet/overview.html#transactions` | anchor | menu tài khoản |
| `tutor/my-profile.html#lich-ranh` | anchor | menu tài khoản của gia sư |
| `admin/*-queue`, `admin/reports`, `admin/payout-requests` | `status` | thẻ trên `admin/dashboard.html` |
| `admin/audit-logs.html` | `module` | thẻ trên `admin/dashboard.html` |

Mã không tồn tại trong dữ liệu mẫu phải hiển thị trạng thái "không tìm thấy" kèm đường quay lại trang danh sách; trang đích không được âm thầm thay bằng một bản ghi khác. Ở `admin/reports.html`, giá trị `status=unresolved` gộp hai trạng thái chưa kết luận nên bỏ chọn mọi thẻ và đặt `aria-label` riêng cho vùng kết quả.

Chạy bản mẫu: `python -m http.server 8765 --bind 127.0.0.1 --directory ui-prototype` từ thư mục gốc project. Mỗi lần sửa CSS hoặc JS dùng chung, nạp lại trang ở chế độ không dùng cache hoặc mở một ngữ trình duyệt cô lập, vì trình duyệt có thể giữ bản CSS cũ và khiến liên kết vừa sửa trông như không có tác dụng.


## Thiết kế học thuật hiện đại

Xem [hướng thiết kế và cách chuẩn bị cho JSP](../docs/ui/redesign.md). Các trang dùng chung token xanh mực, nền giấy ấm và kiểu chữ hệ thống; các màn tìm kiếm và xác thực ưu tiên chức năng chính. Logo hiện tại được giữ để cập nhật sau.

Bộ lọc mở trên desktop và thu gọn trên điện thoại. Các khối minh họa trạng thái đã được bỏ khỏi trang sản phẩm. Điều hướng người dùng và quản trị vẫn hiển thị ở màn hình nhỏ.
