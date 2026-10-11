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
| Màu chính | `--color-primary`: xanh thông `#1D4B40` cho hành động chính, liên kết chính, lựa chọn và focus. `--color-primary-hover` `#173C33`. |
| Tint xanh thông | `--color-primary-container` `#E3EEEA`: nền phụ, vùng tóm tắt, tag phân loại như "Trực tuyến", "Tại nhà". |
| Nhấn | `--color-secondary` và `--color-accent`: đất nung `#AD532A`, `--color-secondary-text` `#93451F` cho chữ nhỏ, `--color-accent-on-ink` `#E9A982` cho chữ đất nung trên nền mực. |
| Tint đất nung | `--color-secondary-container` `#F3E1D6`: callout trung tính hoặc khối nội dung cần nổi bật có lý do rõ ràng. |
| Nền | `--color-background` và `--color-paper` `#F7F4EE`; mặt thẻ `--color-surface` `#FFFDFA`; `--color-surface-low` `#EEEAE2`; `--color-border` `#D8D2C6`. |
| Chữ | `--color-text` `#1E2623`; `--color-text-secondary` `#5F6860` cho chữ nhỏ; `--color-text-muted` `#6C746D` chỉ dùng cho mô tả phụ trên nền trắng. |
| Ngữ nghĩa | Thành công `#2F9E5B` / chữ `#1F6F43` trên `#E2F1E9`; cảnh báo `#B7791F` / chữ `#7A510E` trên `#F8ECC9`; lỗi và từ chối `#C0263B` / chữ `#A61E34` trên `#FBE5E9`. |
| Nội dung | Segoe UI / Arial; dùng font hệ thống, không cần tải font ngoài. |
| Tiêu đề | Cambria / Georgia; dùng ở màn người dùng và xác thực; khu quản trị dùng sans-serif. |
| Thẻ | Viền trung tính 1px đều bốn cạnh, bo góc nhỏ, bóng nhẹ; không tô mọi thẻ, không lồng nhiều hộp màu. |
| Trạng thái | Luôn đi kèm nhãn chữ; không truyền đạt chỉ bằng màu. |
| Logo | Hai người đồng hành, xanh thông và đất nung. Bộ vector tại `ui-prototype/assets/brand/`; logo ngang dùng ở header, bản trắng dùng trên nền tối, biểu tượng riêng dùng cho favicon. |

Token trong `ui-prototype/css/tokens.css` là nguồn màu, font, khoảng cách, đường bo và bóng đổ. CSS component và CSS trang sử dụng token; không thiết lập một bảng màu thứ hai ở từng trang.

## Phân vai màu

Xanh thông đảm nhận mọi thứ có thể tương tác hoặc biểu thị trạng thái: nút chính, liên kết chính, radio và checkbox đang chọn, vòng focus, nền lựa chọn. Đất nung chỉ dùng cho số thứ tự mục, một số icon, callout trung tính và liên kết điều hướng phụ.

Tuyệt đối không dùng đất nung hoặc tint đất nung cho thành công, cảnh báo, lỗi, từ chối, chờ duyệt, badge trạng thái, lỗi validation, kết quả giao dịch, trạng thái chọn của control, disabled hay loading. "Cần bổ sung hồ sơ" là cảnh báo nên dùng nền vàng nhạt với chữ cảnh báo đậm. "Đã duyệt" và "Đã xác minh" là thành công; "Bản nháp" và "Đã đóng" là trung tính; "Trực tuyến" là phân loại chứ không phải trạng thái.

## Dấu ấn và cạnh khối

Bản sắc dựa vào bảng màu Thông–Đất nung, tiêu đề serif và nhịp khoảng cách. Không thêm gạch trang trí dưới tiêu đề, nhãn nhỏ lặp lại tên trang, vạch đứng, dải màu ở mép hay góc màu. Menu đầu trang dùng màu chữ, độ đậm và `aria-current` để nhận biết trang đang mở, không dùng vạch dưới mục đang chọn. Chỉ báo tab, focus, radio và checkbox vẫn giữ theo chức năng.

Mọi card, panel, ô lựa chọn, modal và toast giữ viền trung tính 1px đều các cạnh. Không tạo nhấn cạnh bằng `border-top`, `border-left`, `border-inline`, một cạnh dày hơn các cạnh còn lại, `inset box-shadow` giả viền, hay gradient dựng vạch màu ở mép khối. Trạng thái chọn thể hiện bằng dấu radio/checkbox, nhãn hoặc nền phù hợp; vẫn giữ chỉ báo focus bàn phím và nét viền có chức năng của icon, radio, checkbox, spinner.

Chữ thông thường phải đạt tương phản 4.5:1. Vì `--color-text-muted` chỉ đạt 4.39 trên nền giấy, mọi chữ nhỏ trong component dùng `--color-text-secondary`; chữ đất nung nhỏ dùng `--color-secondary-text`.

## Tổ chức giao diện

- `UserHeader`: thương hiệu gọn, điều hướng rõ; màn hình nhỏ có hàng điều hướng cuộn ngang. Menu tài khoản hỗ trợ phím mũi tên và Escape.
- `UserFooter`: nền xanh mực, liên kết và nội dung có độ tương phản phù hợp. `AccountFooter` tiếp tục dùng cho hai màn quản lý hồ sơ.
- `BrandMasthead`: một tiêu đề chức năng dùng chung cho tìm gia sư và tìm lớp, không có nhãn lặp phía trên, gạch dưới hoặc đường phân cách phụ. Mẫu HTML ở `components/layout/brand-masthead.html`, CSS ở `css/components/layout/brand-masthead.css`.
- Bộ lọc dùng `details` / `summary`, đóng ban đầu trên màn hình nhỏ, mở trên desktop. `js/core/search-filters.js` đồng bộ khi qua breakpoint 64rem; các `name`, `id` và `data-*` của form vẫn giữ nguyên.
- Sidebar quản trị chuyển thành hàng điều hướng cuộn ngang ở ≤64rem, vẫn truy cập được cả sáu mục quản trị. Khoảng dừng anchor bao gồm chiều cao header và hàng điều hướng.
- Các khu minh họa trạng thái và nút giả lập đã được bỏ khỏi trang sản phẩm. Form, modal và trạng thái cần thiết vẫn hoạt động trong luồng thao tác.
- Quy tắc `[hidden]` dùng chung bảo đảm form, bản ghi bị lọc và trạng thái tải được ẩn dù component có `display: grid` hoặc `display: flex`.

## Chuẩn bị chuyển sang JSP

HTML, CSS và JavaScript thuần tiếp tục là nền tảng của prototype. Không thêm framework, bundler hay bước build giao diện.

1. Giữ token và CSS/JS dùng chung trong tài nguyên static của ứng dụng.
2. Tách header, footer, sidebar và masthead thành JSP fragment; giữ lớp CSS và thuộc tính hành vi hiện tại.
3. Thay dữ liệu mẫu bằng dữ liệu từ controller, giữ `name`, `id`, nhãn form và cấu trúc HTML ngữ nghĩa.
4. Đổi URL mẫu sang route của ứng dụng có context path. Escape dữ liệu được đưa vào HTML bằng cơ chế của JSP/JSTL.
5. Tiếp tục kiểm tra menu, modal, biểu mẫu, bộ lọc, phân trang và trạng thái trống sau khi thay nguồn dữ liệu.

Tệp tham khảo cũ `components/tai-lieu.html` đã được dọn vì không được trang sản phẩm sử dụng và có bảng màu/CDN riêng. Đối chiếu giao diện bằng tài liệu này, token của prototype và `components/index.html`.

Các dữ liệu, liên kết chưa triển khai và hành vi mô phỏng vẫn thuộc phạm vi prototype; việc redesign không tích hợp API hay backend.

## Rà soát nội dung trang

Giữ lại dữ liệu, thao tác, điều kiện và phản hồi tại đúng nơi người dùng cần. Loại bỏ khẩu hiệu lặp lại, cam kết chưa có căn cứ, hướng dẫn hiển nhiên, quy trình giải thích nhiều lần, ghi chú về mã nguồn và các khu minh họa dành cho người phát triển. Footer chỉ liên kết đến các trang hiện có.

Màn đăng nhập và đăng ký tập trung vào form. Các trang danh sách tập trung vào bộ lọc và kết quả. Thông tin về phí, ký quỹ, thời hạn phản hồi, quyền riêng tư và hậu quả của thao tác vẫn được giữ tại form hoặc hộp thoại xác nhận.

Breadcrumb chỉ có nhãn trang hiện tại hoặc các nhãn không dẫn đi đâu phải bỏ khỏi HTML. Chỉ giữ breadcrumb có liên kết tới trang cha; không lặp hai cấp cùng một URL. Không viết một câu mô tả bên dưới mỗi tiêu đề nếu câu đó chỉ diễn giải tên chức năng. Giữ mã bản ghi, đối tượng đang xử lý, trạng thái và điều kiện thao tác khi chúng giúp phân biệt dữ liệu hoặc quyết định đúng.

Ghi chú kỹ thuật về cách dựng biểu đồ và lời nhắc "dữ liệu minh họa" lặp ở từng hàng được bỏ khỏi giao diện sản phẩm. Prototype vẫn giữ một chỉ báo dữ liệu minh họa ở dashboard và thông báo QR không dùng để chuyển tiền thật.


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

## Quy tắc responsive

- Header người dùng hai hàng và control chữ 16px ở ≤64rem. `--user-header-height`, `--admin-nav-height`, `--scroll-offset` và `--admin-scroll-offset` là nguồn kích thước cho header, anchor và rail sticky.
- Bộ lọc thu gọn ở ≤64rem; CSS và JavaScript dùng đúng cùng điều kiện, kể cả tại 1024px. Việc mở, đóng hoặc đổi kích thước không xóa lựa chọn.
- Các lưới nội dung thanh toán, xác nhận hợp đồng và thương lượng gộp cột trước khi phần chính bị bóp ở tablet. Sidebar chỉ có một thẻ vẫn chiếm đủ chiều rộng sau khi gộp cột.
- Các rail sticky giới hạn chiều cao theo viewport và có cuộn nội bộ; bỏ giới hạn khi rail trở về luồng thường. Chat tính chiều cao từ header và gutter, chuyển sang một pane ở ≤48rem và mở tại tin nhắn mới nhất khi đi từ hợp đồng.
- Dashboard ưu tiên hàng đợi trước các chỉ số và biểu đồ. Thẻ tóm tắt quản trị dùng biến thể `stat-card--compact`, giữ dữ liệu và nhãn nhưng giảm khoảng trống. Các số tiền dài cần đủ chiều rộng để đọc.
- Giữ cuộn ngang của bảng và nội dung ẩn dành cho screen reader. Không dùng `overflow-x: hidden` ở body để che lỗi bố cục.

Kết quả và giới hạn của lần kiểm tra nằm trong [báo cáo responsive](responsive-qa.md).
