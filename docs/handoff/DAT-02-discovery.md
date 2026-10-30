# DAT-02 — Phần triển khai độc lập

> Cập nhật 29/10/2026: hai route công khai đã được tách sang `TutorDiscoveryPageController` và render DTO thật theo prototype. `/tutor/my-profile` được giữ trong controller hồ sơ riêng hiện có. Chi tiết view, kiểm thử và các phần A02/A08 vẫn còn chờ nằm ở [DAT-01-04-render-view.md](DAT-01-04-render-view.md). Nội dung bên dưới ghi lại trạng thái bàn giao ngày 26/10.

Chủ luồng: Nguyễn Khắc Trường Đạt. Ngày 26/10/2026. Chỉ triển khai phần độc lập trong lúc chờ đầu vào liên nhóm.

## Đã triển khai

- `TutorSearchRequest` nhận `q`, `subjectId`, `gradeLevelIds`, `areaId`, `deliveryModeId`, `offeringType`, `minPrice`, `maxPrice`, `weekdays`, `startTime`, `endTime`, `timeZone`, `sort`, `page`, `size`.
- Ràng buộc từ khóa tối đa 200 ký tự; giá nguyên VND không âm, min không lớn hơn max; ID dương; ISO weekday 1–7; giờ đầu/cuối phải đủ và tăng dần; lọc lịch cần múi giờ IANA. Trang bắt đầu từ 0, size 1–48, page tối đa 100000.
- `tutor/repository/TutorDiscoveryRepository` dùng mapping hiện có qua EntityManager, tham số query được bind. Không tạo Entity hoặc JpaRepository trùng. Data và count dùng chung điều kiện lọc; sắp xếp và phân trang tại DB.
- Kết quả nhóm theo gia sư, tổng đếm distinct gia sư. Giá thấp nhất/số dịch vụ được tính từ các dịch vụ khớp bộ lọc. Các điều kiện phải khớp cùng một dịch vụ, tránh ghép môn của dịch vụ này với giá của dịch vụ khác.
- Lọc nhiều cấp học/ngày trong nhóm theo OR; các nhóm điều kiện kết hợp AND. Lọc giờ yêu cầu một khung lịch nằm trọn trong khoảng giờ chọn, cùng múi giờ và ngày tương ứng.
- Chỉ đọc dịch vụ PUBLISHED của gia sư APPROVED, tài khoản ACTIVE và email đã xác minh; không trả Entity/tài khoản/minh chứng riêng tư ra response.
- Sắp xếp hỗ trợ `name`, `price-asc`, `price-desc`, đều có ID gia sư để giữ thứ tự ổn định. `newest`/`rating` chưa hỗ trợ, không âm thầm thay bằng tiêu chí khác.
- `TutorDiscoveryService.search` trả `TutorSearchResponse`; `profile` chuẩn bị hồ sơ công khai tối thiểu và trang dịch vụ qua `TutorProfileResponse`. Không ghi hoặc sửa hồ sơ của Đại.
- `/home` inject Service trực tiếp, nhận tối đa 6 `OfferingCardResponse` công khai còn nhận đăng ký; loại lớp hết chỗ theo Enrollment và hạn giữ chỗ hiện có. Có trạng thái trống/lỗi DB riêng; lỗi DB trả 503. Giữ đường dẫn hiện có, chỉ chạy trong `db-dev`.

## Còn chờ

- **TutorPageController:** `/tutor/my-profile` vẫn nằm chung. Chưa sửa controller hoặc nối `/tutor/search`/`/tutor/profile` trong lượt này; hai trang này vẫn giữ hiện trạng trước lượt triển khai. Chờ Đại tách route hồ sơ riêng theo phân công, rồi nối Request/Response và giao diện thật.
- **A02:** thống nhất các trường hồ sơ được công khai và điều kiện trạng thái với Đại. Hiện chỉ chuẩn bị dữ liệu tối thiểu từ tên hiển thị, headline, kinh nghiệm và trạng thái đã có trong mapping; không tự lấy email/điện thoại/bằng cấp ra DTO.
- **A08:** điểm/đánh giá và sắp xếp theo đánh giá chờ Đại bàn giao.
- **Q10:** chưa quyết định hành vi mốc công khai khi đăng lại. Không sửa `published_at`/`first_published_at`. Home tạm hiển thị “Dịch vụ & lớp đang nhận đăng ký” theo ID giảm dần, chưa nhận là danh sách “mới nhất”.
- **Giỏ/lời mời:** giữ đúng ID liên kết; kiểm nối đầu cuối với Huy/DAT-03 khi sẵn sàng.
- Chưa nối bộ lọc/phân trang lên route nên chưa nghiệm thu giữ query URL hoặc chống kết quả request cũ ghi đè ở UI.

## Xác nhận lượt này

Không thêm/chạy bộ test tự động. Biên dịch Java thành công. Theo yêu cầu tiếp theo, đã khởi động `db-dev` với MySQL và kiểm tra trực tiếp các Service mới bằng chương trình tạm trong `target/runtime-check`, không thêm mã kiểm tra vào source ứng dụng.

- `/home` trả HTTP 200, query trả 6 DTO dịch vụ/lớp đang nhận đăng ký.
- Query mặc định trả 3 gia sư; hồ sơ công khai đầu tiên và danh sách dịch vụ đọc thành công.
- Chạy `name`, `price-asc`, `price-desc` ở trang 0 và 1 với size 2, không có lỗi truy vấn/projection.
- Query kết hợp môn/cấp/khu vực/hình thức và khoảng giá chạy thành công.
- Query theo thứ/giờ/múi giờ chạy thành công; từ khóa chứa ký tự `%`, `_`, `!` chạy thành công với escape literal.
- Catalog đọc 9 dịch vụ PUBLISHED đủ điều kiện từ DB. Không sửa dữ liệu, chạy migration hoặc gửi email trong phiên kiểm tra.

Các kết quả trên xác nhận backend mới thực thi được với DB thật; chưa nghiệm thu UI tìm kiếm/hồ sơ do chưa nối route. Không đánh dấu toàn bộ DAT-02 hoàn thành.

Thứ tự đọc: `TutorSearchRequest` → `TutorDiscoveryService` → `TutorDiscoveryRepository` → các `*Response` → `HomePageController` → `pages/home.html`.
