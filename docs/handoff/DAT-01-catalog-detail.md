# DAT-01 — Chi tiết dịch vụ/lớp

Chủ luồng: Nguyễn Khắc Trường Đạt. Lượt triển khai ngày 26/10/2026, tiếp nối `/tutor/manage`.

## Đã triển khai

- `/catalog/detail?id={id}` nhận ID số dương, đọc DB trong `db-dev`, trả `OfferingDetailResponse`/`OfferingCardResponse` ra giao diện thay vì Entity.
- Hiển thị mã công khai, gia sư, môn/cấp/khu vực/hình thức, giá mỗi buổi và tổng gói mỗi học viên, số buổi/thời lượng, lịch/múi giờ, mô tả và phiên bản điều khoản. Lớp nhóm có sức chứa, ngày bắt đầu/kết thúc và số chỗ còn lại.
- Chỉ công khai PUBLISHED/CLOSED khi gia sư APPROVED, tài khoản ACTIVE và đã xác minh email. CLOSED vẫn xem được chi tiết, không có form đăng ký mới. Bản nháp/chờ duyệt/ngừng công khai/bị từ chối không được đọc công khai.
- ID/kiểu dữ liệu sai trả 400; không tìm thấy hoặc không đủ điều kiện công khai trả 404; lỗi đọc DB trả 503 với thông báo riêng.
- Form học viên gửi đúng `offeringId`, `version`, `seats` và CSRF đến `/cart/add` hiện có. Khách có nút đăng nhập; tài khoản không có vai trò LEARNER không có form đăng ký. Khi đóng/đầy thì không có form đăng ký.
- Liên kết hồ sơ dùng đúng `tutorId`; liên kết lời mời mang `tutorId` và `offeringId`. Luồng lời mời còn thuộc DAT-03, chưa nghiệm thu khả năng nhận ID số DB ở trang lời mời.
- Không có ID: giữ danh sách catalog công khai và phân trang qua `OfferingCardResponse`.
- Controller inject trực tiếp Service qua constructor; chỉ đăng ký trong `db-dev`, không thêm luồng preview song song.

## Ranh giới giao dịch

Giữ các chữ ký `CatalogService.getPublicOffering`, `isPublic`, `getSchedule`, `availableSeats`, `registrationIssue` mà giỏ/hợp đồng đang dùng. Bổ sung kiểm email đã xác minh vào điều kiện công khai. Số chỗ là ảnh chụp tham khảo theo Enrollment hiện có; chỉ luồng giao dịch của Huy thực hiện kiểm/khóa/giữ/trả chỗ. Không sửa giỏ, hợp đồng, bảng Enrollment, migration hoặc snapshot giá/điều khoản của đơn cũ.

## Chưa nghiệm thu

- Tương tác trực quan trong trình duyệt; thao tác ghi vào giỏ/lời mời và tranh chấp chỗ. Đã kiểm đọc dữ liệu MySQL/HTTP như mục dưới.
- Hợp đồng A04/SourceSnapshot và các quyết định Q02/Q06/Q07/Q10 còn cần nhóm xác nhận ở phần tương ứng.
- Không thêm hoặc chạy bộ test tự động. Theo yêu cầu tiếp theo của người dùng, đã bổ sung kiểm tra chạy thực tế với MySQL và HTTP; không coi kết quả biên dịch là nghiệm thu chức năng.

## Kiểm tra chạy thực tế — 26/10/2026

- Khởi động Spring Boot `db-dev`, kết nối MySQL 8.4.7 và validate mapping thành công. Tắt Flyway riêng bằng tham số chạy để không áp migration vào DB hiện có; không đổi cấu hình dự án.
- Phiên kiểm tra dùng port 18081. Khi chạy từ công cụ trên máy này, Java 21 cần `-Djava.net.preferIPv4Stack=true -Djdk.net.unixdomain.tmpdir=D:/ProTMDT/.codex-tmp` để mở socket loopback; thư mục tạm ngắn xử lý lỗi NIO của môi trường.
- `/home` và `/catalog/detail` trả 200. ID không phải số/âm và page âm trả 400; ID số dương không tồn tại trả 404.
- Mở 19 ID thật 2001–2019: 9 dịch vụ/lớp PUBLISHED đủ điều kiện và 3 bản CLOSED đủ điều kiện trả 200; 7 bản còn lại trả 404 do chưa công khai hoặc không đủ điều kiện gia sư/tài khoản. Không có phản hồi 500.
- Các lớp nhóm render ngày học/sức chứa/lịch thành công. Khách không có form thêm giỏ. Bản đóng hiển thị thông báo và không có form thêm giỏ.
- Đăng nhập demo học viên thành công; mở SERVICE 2002 và GROUP_CLASS 2014/2015 trả 200, có form `/cart/add`, đúng offeringId và CSRF. Bản đóng 2016 không có form thêm giỏ. Không bấm thêm giỏ, tạo đơn, gửi lời mời hoặc gửi email.
- Dữ liệu hiện có chưa tạo ra lớp PUBLISHED hết chỗ trong những ID đã mở; chưa xác nhận nhánh hết chỗ qua HTTP. Không tạo/sửa dữ liệu chỉ để dựng nhánh này.

Thứ tự đọc: `CatalogPageController` → `CatalogService` → `OfferingDetailResponse`/`OfferingCardResponse` → `OfferingJpaRepository`/`OfferingTimeSlotJpaRepository` → `pages/catalog/detail.html`.
