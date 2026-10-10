# Thiết kế giao diện Edu Connect

Hướng thiết kế đã chọn: học thuật hiện đại, gần gũi và có chiều sâu. Nền giấy ngà, xanh mực và điểm nhấn đỏ đất tạo sự liên hệ với việc học; tiêu đề serif đi cùng chữ sans-serif ở phần nội dung và thao tác.

## Phạm vi đã rà

Prototype có 31 màn hình thuộc 10 nhóm: xác thực, tài khoản, gia sư, tin tìm gia sư, lời mời, hợp đồng, thanh toán, ví, trò chuyện và quản trị. Ngoài trang sản phẩm còn có các trang minh họa component.

Các vấn đề thiết kế chính trước khi sửa:

- Màu xanh dương bị ghi cố định ở nhiều component, tách khỏi token chung.
- Header lớn, điều hướng biến mất ở một số kích thước màn hình.
- Nhiều thẻ có cùng màu, đường viền, bóng đổ và cấp độ chữ; khó nhận biết đâu là nội dung cần chú ý.
- Tên Edu Connect và TriThức xuất hiện xen kẽ.
- Khối mô phỏng trạng thái chiếm diện tích như nội dung chính của sản phẩm.

## Ngôn ngữ thiết kế

| Thành phần | Quy ước |
| --- | --- |
| Màu chính | `--color-primary`: xanh `#1f5245` cho liên kết, lựa chọn và hành động chính |
| Màu nền | `--color-background`: nền `#f5f4ef`; mặt giấy dùng `--color-paper` |
| Nhấn | `--color-accent`: đỏ đất `#b56c51`, màu chữ nhấn `--color-secondary` (`#934832`); dùng ở số thứ tự, lời nhắn và tiêu đề hộp thoại |
| Nội dung | Segoe UI / Arial; dùng font hệ thống, không cần tải font ngoài |
| Tiêu đề | Cambria / Georgia; dùng ở màn người dùng và xác thực; khu quản trị dùng sans-serif |
| Thẻ | Viền mảnh, bo góc nhỏ, hạn chế bóng đổ; màu sắc và bố cục thể hiện vai trò của thẻ |
| Trạng thái | Thành công, chờ xử lý, lỗi, thông tin có token riêng; luôn đi kèm nhãn chữ |
| Logo | Giữ tài sản hiện tại tại `assets/icons/logo.svg`; thay tệp này khi có logo mới |

Token trong `ui-prototype/css/tokens.css` là nguồn màu, font, khoảng cách, đường bo và bóng đổ. CSS component và CSS trang sử dụng token; không thiết lập một bảng màu thứ hai ở từng trang.

## Tổ chức giao diện

- `UserHeader`: thương hiệu gọn, điều hướng rõ; màn hình nhỏ có hàng điều hướng cuộn ngang. Menu tài khoản hỗ trợ phím mũi tên và Escape.
- `UserFooter`: nền xanh mực, liên kết và nội dung có độ tương phản phù hợp. `AccountFooter` tiếp tục dùng cho hai màn quản lý hồ sơ.
- `BrandMasthead`: tiêu đề chức năng dùng chung cho tìm gia sư và tìm lớp, không có khẩu hiệu hoặc khối trang trí. Mẫu HTML ở `components/layout/brand-masthead.html`, CSS ở `css/components/layout/brand-masthead.css`.
- Bộ lọc dùng `details` / `summary`, đóng ban đầu trên màn hình nhỏ, mở trên desktop. `js/core/search-filters.js` đồng bộ khi qua breakpoint 64rem; các `name`, `id` và `data-*` của form vẫn giữ nguyên.
- Sidebar quản trị chuyển thành hàng điều hướng cuộn ngang trên màn hình nhỏ, vẫn truy cập được các mục quản trị.
- Các khu minh họa trạng thái và nút giả lập đã được bỏ khỏi trang sản phẩm. Form, modal và trạng thái cần thiết vẫn hoạt động trong luồng thao tác.
- Quy tắc `[hidden]` dùng chung bảo đảm form, bản ghi bị lọc và trạng thái tải được ẩn dù component có `display: grid` hoặc `display: flex`.

## Chuẩn bị chuyển sang JSP

HTML, CSS và JavaScript thuần tiếp tục là nền tảng của prototype. Không thêm framework, bundler hay bước build giao diện.

1. Giữ token và CSS/JS dùng chung trong tài nguyên static của ứng dụng.
2. Tách header, footer, sidebar và masthead thành JSP fragment; giữ lớp CSS và thuộc tính hành vi hiện tại.
3. Thay dữ liệu mẫu bằng dữ liệu từ controller, giữ `name`, `id`, nhãn form và cấu trúc HTML ngữ nghĩa.
4. Đổi URL mẫu sang route của ứng dụng có context path. Escape dữ liệu được đưa vào HTML bằng cơ chế của JSP/JSTL.
5. Tiếp tục kiểm tra menu, modal, biểu mẫu, bộ lọc, phân trang và trạng thái trống sau khi thay nguồn dữ liệu.

`components/tai-lieu.html` là tài liệu tham khảo cũ có Tailwind CDN và bảng màu riêng; các trang sản phẩm không phụ thuộc vào tệp này. Tài liệu hiện tại cho lần redesign nằm ở đây và token trong prototype.

Các dữ liệu, liên kết chưa triển khai và hành vi mô phỏng vẫn thuộc phạm vi prototype; việc redesign không tích hợp API hay backend.

## Rà soát nội dung trang

Giữ lại dữ liệu, thao tác, điều kiện và phản hồi tại đúng nơi người dùng cần. Loại bỏ khẩu hiệu lặp lại, cam kết chưa có căn cứ, hướng dẫn hiển nhiên, quy trình giải thích nhiều lần, ghi chú về mã nguồn và các khu minh họa dành cho người phát triển. Footer chỉ liên kết đến các trang hiện có.

Màn đăng nhập và đăng ký tập trung vào form. Các trang danh sách tập trung vào bộ lọc và kết quả. Thông tin về phí, ký quỹ, thời hạn phản hồi, quyền riêng tư và hậu quả của thao tác vẫn được giữ tại form hoặc hộp thoại xác nhận.


## Component xanh mực và đỏ đất

Xem bộ mẫu tại `ui-prototype/components/index.html`. Trang này chỉ phục vụ đối chiếu component, không nằm trong menu của sản phẩm. Các mẫu dùng chính CSS và JavaScript dùng chung của prototype.

- Nút chính xanh mực; nút phụ nền trắng, viền trung tính; màu đỏ lỗi tách biệt với đỏ đất nhận diện.
- Ô nhập, textarea và select có cùng góc bo nhỏ. Viền focus giữ nguyên độ dày để không dịch bố cục.
- Tag phân loại nền trung tính; badge trạng thái có màu ngữ nghĩa riêng; xác minh hiển thị icon và nhãn gọn.
- Tab và bộ lọc ưu tiên trạng thái chọn rõ ràng, không kéo thành các khối cao giống thẻ nội dung.
- Thẻ, panel và hộp thoại dùng viền trung tính mảnh; không dùng dải màu trang trí ở bất kỳ cạnh nào, kể cả inset shadow giả viền. Thẻ danh sách ưu tiên đường phân cách và phân cấp chữ, hạn chế hộp màu lồng trong thẻ.
- Hồ sơ ở chế độ xem trình bày như thông tin, chuyển về ô nhập khi chỉnh sửa.
- Hộp thoại dùng tiêu đề serif và nút theo component chung, không có dải màu trên mép. Toast đặt ở góc dưới để tránh che điều hướng.
- Bảng giữ hàng trắng và đường phân cách mảnh; nhãn cột đọc được ở kích thước nhỏ.


Các ô radio, thẻ lựa chọn và mục menu không dùng vạch màu bên cạnh. Trạng thái chọn được thể hiện qua dấu radio/checkbox, dấu chọn, nhãn và nền; viền khung giữ trung tính. Focus bàn phím vẫn có chỉ báo riêng. Không đưa lại kiểu nhấn cạnh bằng border, inset shadow, gradient hoặc pseudo-element.
