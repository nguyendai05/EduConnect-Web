# DAT-01 — Trang quản lý dịch vụ/lớp

Chủ luồng: Nguyễn Khắc Trường Đạt. Phạm vi lượt này: `/tutor/manage`, chưa triển khai `catalog/detail`.

## Chức năng đã nối

- Đọc danh sách dịch vụ/lớp của gia sư từ MySQL qua repository JPA hiện có; tìm theo mã/tiêu đề/môn, lọc loại và trạng thái.
- Đọc mô tả, điều khoản, giá VND mỗi buổi, số buổi, thời lượng, lịch tuần và thông tin lớp nhóm.
- Tạo bản nháp; sửa bản nháp/bản bị từ chối hoặc dịch vụ đang công khai; gửi duyệt; đóng dịch vụ/lớp.
- Theo xác nhận của Đạt ngày 17/10/2026: lưu sửa bản PUBLISHED chuyển thẳng IN_REVIEW, tạm ngừng công khai và xóa reviewed_by/reviewed_at/review_note cũ. Giữ mốc công khai lịch sử vì Q10 chưa chốt. Trang báo rõ trước khi lưu và sau khi lưu.
- Bản đã có Enrollment cho phép đổi tiêu đề/mô tả/giá/điều khoản cho đăng ký mới; giữ nguyên môn/cấp/khu vực/hình thức, số buổi/thời lượng, lịch/ngày/sức chứa cho tới khi Q02/Q06 được thống nhất. Không ghi lại các khung lịch khi giữ kế hoạch học này.
- Form lấy môn/cấp/khu vực/hình thức từ danh mục DB; không lấy ID chủ sở hữu hoặc quyền từ trình duyệt.
- Bean Validation, kiểm danh mục, lịch không trùng, múi giờ IANA, ngày/sức chứa lớp nhóm; hiển thị lỗi và giữ dữ liệu form khi phù hợp.
- Transaction cho Offering + OfferingTimeSlot; khóa hồ sơ gia sư rồi Offering, kiểm version; requestKey làm mã tạo ổn định để gửi lại không tạo hai bản ghi.
- Dữ liệu điều khoản tăng phiên bản khi sửa; không ghi vào Order/Contract/Enrollment hoặc giữ/trả chỗ.
- Trang `/tutor/manage` chỉ chạy trong `db-dev`; đã bỏ controller preview và thông báo xem giao diện riêng của trang. JS không phụ thuộc EduFixtures/EduStore.

## URL/form

| Method | URL | Ý nghĩa |
|---|---|---|
| GET | `/tutor/manage?q=&type=&status=` | Danh sách; cần tài khoản TUTOR trong db-dev |
| GET | `/tutor/manage?edit={id}#tm-editor` | Nạp form sửa bản thuộc gia sư |
| POST | `/tutor/manage/offerings` | Tạo nháp; requestKey UUID; CSRF |
| POST | `/tutor/manage/offerings/{id}` | Sửa nháp/bị từ chối/công khai; version hiện tại; bản công khai tự chuyển chờ duyệt lại; CSRF |
| POST | `/tutor/manage/offerings/{id}/status` | action=submit hoặc close, version, CSRF |

Service kiểm lại tài khoản ACTIVE, email đã xác minh, role TUTOR, authenticationVersion và chủ bản ghi. Không có thao tác tự duyệt/công khai. Các lỗi quyền/ID/dữ liệu cũ/không có DB trả 403/404/409/503 tương ứng, input sai trả 400.

## File chính

- `lesson/repository/OfferingJpaRepository`, `OfferingTimeSlotJpaRepository`: mở rộng repository có sẵn, không tạo mapping trùng.
- `lesson/service/TutorOfferingService`, `OfferingProblem`; `lesson/dto/OfferingResponse`; `lesson/dto/OfferingRequest`.
- Quy ước DTO theo yêu cầu Đạt: tất cả nằm trong `lesson/dto`; dữ liệu nhận vào dùng đuôi `Request`, dữ liệu trả ra/hiển thị dùng đuôi `Response`. Một cặp DTO tương ứng dùng cùng tên gốc, chỉ khác hai hậu tố, ví dụ `OfferingRequest` / `OfferingResponse` và `OfferingTimeSlotRequest` / `OfferingTimeSlotResponse`. DTO nhận gồm `OfferingRequest`, `OfferingFilterRequest`, `OfferingStatusRequest`, `OfferingTimeSlotRequest`. DTO trả gồm `OfferingResponse`, `OfferingTimeSlotResponse`, `OfferingOptionResponse`, `OfferingOptionsResponse`; không còn DTO lồng trong service hoặc DTO cũ nằm ở `web`.
- `tutor/web/TutorManagePageController` chỉ chạy trong `db-dev`, inject `TutorOfferingService` trực tiếp qua constructor; không dùng `ObjectProvider`, không có controller preview song song.
- Template/CSS/JS riêng `tutor/manage`.
- `src/test/java/com/educonnect/lesson/`: Service, MVC và MySQL opt-in.
- `src/test/resources/page-assets.json`: chỉ bỏ hai asset demo của `/tutor/manage`; cần Đại review fixture dùng chung.
- `PagesSmokeTest` và `PreviewDisabledTest`: cập nhật riêng kỳ vọng `/tutor/manage` trả 404 trong `ui-preview`, vì trang này chỉ đăng ký trong `db-dev`; vẫn kiểm tra các trang còn lại như trước.

## Cách nhận form — cập nhật theo yêu cầu Đạt ngày 21/10/2026

- GET `/tutor/manage`: `@ModelAttribute("filterRequest") OfferingFilterRequest` nhận bộ lọc `q/type/status` (mức 3). Bộ lọc chỉ đọc dữ liệu, không ghi DB.
- POST tạo/sửa: `@Valid @ModelAttribute("offeringRequest") OfferingRequest` và `BindingResult` nhận dữ liệu, kiểm tra lỗi và giữ lại form (mức 4).
- POST đổi trạng thái: `@Valid @ModelAttribute("statusRequest") OfferingStatusRequest` và `BindingResult`; DTO chỉ có `version/action`, chỉ nhận `submit/close`.
- Bỏ `@InitBinder`, `WebDataBinder`, allowlist và cấu hình auto-grow riêng. Giới hạn 14 khung lịch nằm ở `@Size(max = 14)` trên DTO, kết hợp giới hạn mặc định của Spring cho chỉ số quá lớn.
- Bỏ `publishedEdit` khỏi DTO đầu vào. Cờ này là thuộc tính model do controller lấy từ service; không nhận quyền, chủ sở hữu, trạng thái duyệt hoặc cờ hiển thị từ form.
- Inject service trực tiếp qua constructor. Theo yêu cầu tiếp theo của Đạt, đã xóa controller preview để chỉ học và phát triển một luồng `db-dev`.
- Giữ kiểm tra nghiệp vụ tại service: tài khoản/chủ sở hữu, lịch, danh mục, phiên bản, duyệt lại và bảo vệ kế hoạch học đã có đăng ký. Service vẫn kiểm tra các annotation của DTO khi gọi trực tiếp hoặc gửi duyệt dữ liệu đã lưu trong DB.
- Service tách riêng từng thao tác: `createDraft` tạo nháp, `update` cập nhật, `submitForReview` gửi duyệt và `close` đóng dịch vụ/lớp. Mỗi thao tác ghi có `@Transactional` riêng, giữ thứ tự khóa hồ sơ gia sư rồi dịch vụ/lớp; không còn `save` hoặc `transition` gộp nhiều thao tác trong service.
- `checkAccess` chỉ kiểm tra quyền; controller dùng hàm này trước khi xử lý form tạo, thay cho việc gọi `options` rồi bỏ kết quả. `requireTutor` không còn tham số cờ khóa bản ghi.
- Các bước dùng chung được tách thành hàm kiểm tra form, kiểm tra lịch, kiểm tra danh mục, chép dữ liệu form, thay lịch, xóa thông tin duyệt cũ và chuyển dữ liệu đã nạp thành form sửa. Controller giữ nguyên URL, DTO và các thuộc tính model của giao diện.
- Mã controller/service/DTO viết từng câu lệnh, nhánh `if/else` rõ ràng; dùng vòng lặp cho các bước xử lý danh sách/lịch.

Thứ tự đọc: `OfferingFilterRequest` → `OfferingRequest` → `OfferingStatusRequest` → `TutorManagePageController` → `TutorOfferingService` → repository → template. `OfferingResponse` chỉ phục vụ hiển thị danh sách, không phải đối tượng nhận form.

## Kiểm thử

```powershell
.\mvnw.cmd -B -ntp clean verify
node scripts/checks/template-check.mjs
node scripts/checks/route-check.mjs
node scripts/checks/static-check.mjs
node scripts/checks/hook-check.mjs
node scripts/checks/source-check.mjs
node scripts/checks/store-check.mjs
node scripts/checks/database-static-check.mjs
```

Các test Service/MVC kiểm quyền, chống gán owner/status/reviewer/publishedEdit từ form, CSRF, escape HTML, context path, lịch, loại lớp, dữ liệu cũ và gửi lại. Bổ sung kiểm sửa bản công khai về IN_REVIEW, xóa duyệt cũ, giữ mốc công khai và giữ kế hoạch học đã có đăng ký. Test MySQL mới dùng cùng guard `EDUCONNECT_JPA_TESTS=true`, `EDUCONNECT_JPA_TEST_URL` chỉ đến schema `educonnect_test_shared` cô lập. Test MySQL rollback dữ liệu và không gửi mail. Không dùng DB development có dữ liệu để thay thế cấu hình test.

Lượt kiểm local đã chạy build/tests không cần DB và các script; MySQL/SMTP opt-in chưa được cấu hình nên chưa xác nhận tích hợp DB hoặc tranh chấp khóa bằng nhiều kết nối. Kiểm giao diện desktop/mobile dùng HTML do MVC test render, không phải bằng chứng dữ liệu đã lưu trên MySQL.

Sau khi đơn giản hóa form ngày 21/10/2026: `mvnw -o -B -ntp verify` thành công, 139 test chạy qua và 26 test MySQL/SMTP opt-in được bỏ qua. Cả 7 script kiểm tra bên trên đều qua. Test bổ sung kiểm DTO bộ lọc, DTO trạng thái, lỗi chuyển kiểu số, lịch trên 14 khung/chỉ số quá lớn, cờ công khai lấy từ DB và không thể gửi giả kết quả kiểm tra nhóm/lịch.

## Phần còn chờ và bàn giao

- Q07 phần sửa bản đang công khai đã được Đạt xác nhận ngày 17/10/2026 và triển khai như trên. A02/điều kiện admin duyệt và công khai lại vẫn cần nối với Đại; không tự bật PUBLISHED hoặc sửa mốc công khai Q10.
- Q02/Q06: giữ/trả chỗ và Enrollment do transaction Huy điều phối. Chặn thay đổi kế hoạch học của bản đã có Enrollment trong lúc chờ thống nhất; không tự tính chỗ còn trống từ UI.
- Q03/A04/SourceSnapshot: chưa bàn giao đầy đủ hợp đồng dịch vụ/nguồn đăng ký cho luồng đặt đơn ở lượt một trang này.
- A05 từ Huy và A11 từ Đại: tab đơn/doanh thu hiển thị chưa kết nối, không hiển thị số giả.
- Quy trình admin duyệt dịch vụ chưa thuộc lượt triển khai này; IN_REVIEW chưa đồng nghĩa đã công khai.
- Tài liệu chung ghi mặc định ui-preview nhưng mã hiện tại mặc định db-dev. Không thay cấu hình chung trong lượt này.
- Ownership cũ trong repo chưa khớp PDF giai đoạn 3; thực hiện theo phân công mới do người dùng cung cấp. Đại cần đồng bộ tài liệu sở hữu và review fixture dùng chung.

Trạng thái: đã nối backend và giao diện trang đầu trong `db-dev`, đã kiểm Service/MVC; chờ kiểm MySQL thật, đầu vào liên nhóm và các quyết định nêu trên trước khi nghiệm thu toàn bộ DAT-01.
