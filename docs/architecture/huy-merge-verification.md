# Kiểm chứng bản sửa PR #25 — backend-huy

Ngày 23/10/2026. Nền `origin/main` 7b7a42d, tip PR trước sửa 7614b21. PR không xung đột Git; hai job CI thất bại vì contract/confirm redirect trong ui-preview và asset contract còn mô tả nguồn JS demo/CDN cũ.

## Phạm vi bản sửa

- GET xác nhận chỉ dựng DTO thỏa thuận từ mục giỏ thuộc người đăng nhập. Mở/refresh không tạo order, contract hoặc xóa giỏ; ID hợp đồng không thuộc người xem trả 404, không fallback hợp đồng khác.
- POST `/contract/sign` yêu cầu LEARNER, CSRF, ID/version hợp lệ và đủ ba cam kết chưa được chọn sẵn. Service kiểm lại quyền, giá/điều khoản, trạng thái công khai, tutor ACTIVE/APPROVED và chỗ.
- Một item được xác nhận tạo Order/OrderItem/RegistrationSource/Contract/Enrollment trong cùng transaction. Khóa learner và offering, kiểm số chỗ bằng locking current read của MySQL; creation_key ổn định theo item và learner giúp gửi lại trả cùng contract. Mã công khai dùng UUID.
- Học viên chấp thuận tại POST. Với nguồn CATALOG, tutor_accepted_at lấy từ published_at của offer, không giả lập một chữ ký mới của gia sư ở lúc học viên mở trang. Đây là phương án phát triển theo Q03 đã được schema dự trù, cần nhóm chốt trước nghiệm thu chính sách.
- Snapshot giữ nguyên sau khi dịch vụ đổi giá/điều khoản. Mục được chốt mới bị xóa; các mục khác giữ nguyên. Reservation quá hạn không chiếm chỗ.
- Home chỉ đọc tối đa sáu dịch vụ PUBLISHED của gia sư APPROVED với tài khoản ACTIVE; nạp đủ các quan hệ cần cho view khi open-in-view=false.
- Bỏ Home AJAX không còn được dùng và jQuery CDN ở trang hợp đồng. Giữ form POST/CSRF, đưa CSS inline về file trang và cập nhật oracle tài nguyên theo trang thật; không nới assertion của smoke test.

## Kiểm thử thực tế

Java 21.0.10 (release 17), Maven Wrapper 3.9.16, MySQL 8.0.45 trên instance loopback riêng port 33318/schema `educonnect_test_shared`. Giữ ddl-auto=validate và Flyway V1–V4, không sửa seed/migration hoặc dùng database nhóm. Mail mock; tài khoản UUID rollback hoặc xóa đúng fixture riêng.

- `mvnw.cmd -o -B -ntp clean verify` với EDUCONNECT_MYSQL_TESTS và EDUCONNECT_JPA_TESTS: **148 tổng, 147 passed, 0 failure/error; 1 skipped là ResendSmtpSmokeTest**.
- CheckoutWebTest: 6 ca quyền/CSRF/consent, GET chỉ đọc, context path, 404 và bỏ dữ liệu actor/tổng tiền giả từ client.
- MySqlCheckoutTest: 10 ca thật gồm snapshot, ID người khác, phiên bản cũ, tutor khóa, rollback giữa transaction, hết hạn giữ chỗ, gửi lặp đồng thời và hai học viên tranh chỗ cuối.
- Hồi quy MySqlOtpTest, MySqlAuthTest và SharedEntitiesMySqlTest thực sự chạy, đủ 51 Entity/51 JpaRepository.
- Bảy script template/route/static/hook/source/store/database-static: pass.
- Trình duyệt: guest Home → chi tiết; tài khoản test riêng đăng nhập → giỏ → GET thỏa thuận → refresh. Ba cam kết không được tick sẵn, không lỗi console; mở/refresh vẫn 0 đơn và còn mục trong giỏ. Thao tác tạo hợp đồng được kiểm bằng MVC/service tests, không giao kết hợp đồng hoặc thanh toán thật qua browser.

## Giới hạn bàn giao

PR hiện nối nguồn CATALOG; nguồn INVITATION/JOB_APPLICATION, lịch sử giao dịch đầy đủ và PayOS/webhook/ledger tiếp tục theo HUY-02/HUY-03, chưa được nghiệm thu bởi các test này. Bước thanh toán vẫn là phần sẽ tích hợp; URL hay việc xem thỏa thuận không đánh dấu đã trả tiền.

`app.checkout.platform-fee-rate=0.10`, `fee-policy-version=DEV-PROPOSAL`, `reservation-ttl=30m` là mặc định phát triển có thể cấu hình, chưa chốt Q02/Q03/Q04/Q06. Adapter thanh toán sau này phải kiểm lại reservation/trạng thái dưới khóa trước khi xác nhận tiền hoặc chỗ; không tự dùng lại chỗ đã hết hạn. Có thể đọc DTO xem trước trong HUY-02 mà không tạo trước một Contract giả, vì schema hiện yêu cầu cả hai mốc chấp thuận NOT NULL.
