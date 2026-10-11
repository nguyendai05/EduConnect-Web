# Kiểm tra responsive prototype — 10/10/2026

## Phạm vi

Kiểm tra 31 trang trong `ui-prototype/pages/` và trang đối chiếu component bằng Chrome headless. HTML, CSS, JS và tài nguyên được phục vụ từ working tree hiện tại trong một origin kiểm thử cô lập; mỗi nhóm viewport dùng browser context mới để tránh cache và trạng thái mẫu từ lượt trước.

| Chiều rộng | Chiều cao | Nhóm |
| --- | --- | --- |
| 320, 360, 390, 430px | 844px | Điện thoại |
| 768, 1024px | 1000px | Tablet và ranh giới gộp cột |
| 1280, 1440px | 1000px | Desktop |

Tổng cộng 256 lượt tải và đo. Ngoài ra kiểm tra màn ngang 844×390px, viewport 390×500px và rail trên desktop 1440×650px, tablet 1024×768px.

Trang cần tham số dùng mã tồn tại trong dữ liệu mẫu: gia sư GS-01, tin TT-8841/TT-88412, hợp đồng HD-20260919-024 và HD-20260926-025, cùng mã hồ sơ tương ứng trong dữ liệu quản trị. Các phép thử thanh toán chỉ chạy luồng mô phỏng trong prototype.

## Kết quả

- Không tràn ngang toàn trang, không có lỗi JavaScript khi tải và không có ảnh nội bộ bị hỏng ở 256 lượt đo.
- Ô nhập, select và textarea đang hiển thị, có thể chỉnh sửa có cỡ chữ ít nhất 16px ở ≤1024px. Nút nhỏ, nút lọc và phân trang dùng chiều cao vùng bấm 44px trên màn chạm.
- Header người dùng hai hàng được tính đúng ở tablet; anchor người dùng và quản trị không nằm dưới vùng header/điều hướng cố định.
- Hàng đợi dashboard trên mobile 390px được đưa từ khoảng 5061px xuống khoảng 347px tính từ đầu trang sau khi làm gọn phần đầu trang. Các chỉ số và biểu đồ vẫn có trong trang.
- Khung chat mobile giữ ô soạn và nút gửi trong màn hình thông thường; màn thấp vẫn cuộn tới và bấm được. Mở chat từ hợp đồng hiển thị tin nhắn mới nhất.
- Cột thanh toán, xác nhận, thương lượng và xử lý báo cáo gộp sớm hơn ở tablet. Các sidebar gộp cột không bị giữ chiều cao/cuộn của rail desktop.
- Số dư trong thẻ ví nền xanh giữ màu chữ của component; bỏ selector trang quá rộng từng làm số tiền nhỏ và khó đọc.
- Nhãn đối chiếu học phí ở ứng viên dùng màu trung tính, không dùng đất nung cho đánh giá ngân sách.

## Kiểm thử thao tác

37 phép thử tại 320, 390, 768, 1024, 1440px và hai viewport thấp đã đạt:

- Menu tài khoản nằm trong viewport, mục cuối truy cập được, Escape đóng menu và trả focus.
- Bộ lọc mở/đóng được, giữ lựa chọn; kết quả và liên kết hồ sơ truy cập được.
- Popover quản trị, tìm kiếm nhanh và cả sáu mục điều hướng truy cập được; anchor hàng đợi không bị che.
- Chat gửi bằng Enter, giữ bản nháp khi đổi người nhận, chuyển danh sách/hội thoại và đóng pane thông tin bằng Escape.
- Chọn hai ứng viên mở đối chiếu; modal vừa viewport, bảng cuộn nội bộ và đóng được.
- Ví kiểm tra khoảng ngày không hợp lệ, đặt lại bộ lọc, chuyển tab và dùng phân trang.
- Thanh toán khóa nút khi chưa đồng ý; sau khi đồng ý, bước QR giữ đúng mã hợp đồng.
- Trên màn thấp, nút gửi chat và thao tác modal vẫn bấm được.

30 phép thử rail trên ba viewport đã đạt: hồ sơ gia sư, tạo tin, chi tiết tin, mời dạy, thương lượng, xác nhận hợp đồng và bốn trang xử lý quản trị. Kiểm tra cả việc truy cập nút cuối và chiều cao của rail sticky so với vùng nhìn thấy.

10 phép thử hồi quy component đã đạt: input/focus, select, checkbox/radio/switch, tab/chip, modal, upload, luồng hồ sơ→mời dạy, đối chiếu ứng viên, bộ lọc bảng quản trị và tương phản các nút/badge chính.

## Các trường hợp giữ nguyên

`.pagination__summary` của tìm gia sư cố ý ẩn thị giác để hỗ trợ screen reader. Vùng bảng rộng và thanh điều hướng cuộn ngang có chủ ý, không được tính là tràn toàn trang. Không thêm rule che tràn ở body.

## Footer bảng và trạng thái phân trang

Sửa lỗi hover từng đổi nền của trang hiện tại sang màu giấy trong khi chữ vẫn trắng. Rule hover chỉ áp dụng cho nút không phải trang hiện tại; trạng thái đang chọn giữ nền xanh thông và chữ sáng.

Năm bảng quản trị dùng chung `table-footer` và `table-footer__page-size` trong CSS Table. Tóm tắt, phân trang và select nằm trên cùng nền; Pagination dùng nền trong suốt khi gắn vào bảng. Nút trước/sau có chữ giữ chiều rộng tự nhiên ở tablet, vùng bấm tối thiểu 44px trên màn chạm.

Đã kiểm tra 25 trường hợp trên 5 bảng × 5 độ rộng: hover số trang hiện tại, đổi số hàng, đi tới trang sau rồi trở lại trang trước. Không có điều khiển chồng lên nhau, tràn toàn trang hoặc lỗi JavaScript. Bảng duyệt tin cuộn ngang khi vùng chứa hẹp hơn 1088px; ở viewport 1440px và 1920px, bảng nằm vừa vùng chứa.

## Kiểm tra sau khi làm gọn nội dung

Bỏ gạch trang trí dưới tiêu đề và menu đầu trang; bỏ breadcrumb không có liên kết ở 11 màn, 28 đoạn mô tả lặp, badge trang trí và ghi chú kỹ thuật về cách dựng biểu đồ. Metadata của bản ghi, phí, trạng thái, điều kiện xác nhận và các liên kết điều hướng cần thiết vẫn được giữ.

Đã đo lại 31 trang và bộ component tại 320, 390, 768, 1024, 1440px: 160 lượt, không tràn ngang hoặc lỗi JavaScript. 37 kiểm thử thao tác đã đạt. Kiểm tra bổ sung 8 mã hợp đồng hợp lệ, 2 trường hợp mã không tồn tại, modal chi tiết buổi học và việc gỡ gạch/breadcrumb đã đạt; JavaScript không còn ghi vào các breadcrumb đã xóa.

## Giới hạn và kiểm tra lại

Đây là kiểm tra bằng trình duyệt trên máy tính với viewport mô phỏng, chưa xác nhận trên Safari/iOS hoặc bàn phím ảo của thiết bị thật. Các viewport thấp dùng để kiểm tra khả năng truy cập thao tác, không mô phỏng đầy đủ hành vi bàn phím hệ điều hành.

Khi tích hợp JSP hoặc thay dữ liệu mẫu bằng dữ liệu thật, cần kiểm tra lại tên dài, số tiền dài, nhiều dòng lịch học, nhiều tệp đính kèm và thông báo validation. Giữ nguyên tên trường, ID và các thuộc tính hành vi trong lúc chuyển template.
