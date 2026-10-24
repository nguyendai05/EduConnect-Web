# Đăng ký OTP email và đăng nhập với MySQL

## Tương thích nền JPA v1

Record `com.educonnect.user.UserAccount` và hai JDBC repository giữ nguyên vai trò. Entity mới ở `.domain`, repository mới hậu tố JpaRepository; không có đăng ký qua JPA song song. `markEmailVerified` nay trả affected rows, tăng cả version và authentication_version; service chỉ complete pending khi ghi đúng một row, nếu không ném OptimisticLockingFailureException để rollback. Không trộn managed Entity vào flow JDBC hiện tại; caller tương lai phải refresh/clear sau JDBC. Xem entity-handoff.md. Các kết quả kiểm tra lịch sử phía dưới không thay cho biên bản verification của shared foundation.


Đăng ký được lưu tạm trong `pending_registrations` (Flyway V4). Tài khoản/vai trò/hồ sơ chỉ được tạo sau khi chứng minh quyền sở hữu email bằng OTP. DAI-01 giữ đường JDBC này và bổ sung reset qua Entity/Repository JPA dùng chung `auth_tokens` + `user_accounts`. Không sửa V1–V4, seed hoặc dữ liệu tài khoản của nhóm. Remember-me chưa triển khai.

## Phạm vi DAI-01 ngày 23/10/2026

Đối chiếu nhiệm vụ Nguyễn Xuân Đại và hướng dẫn bàn giao chung giai đoạn 3 trong `03_Nhom_A_Web`: thực hiện BB01–BB04 và bàn giao A01 trên nền main PR #24. Năm trang auth dùng form/server thật, giữ shell/component của prototype; không dùng fixtures/store để xác thực hoặc đặt lại mật khẩu. Đã gỡ tầng đọc/view tổng quát `workspace`, Entity/repository trùng, fragment/CSS/JS tích hợp hàng loạt ngoài phạm vi. Các trang nghiệp vụ trở về nền riêng của từng chủ luồng; đây chưa phải phần triển khai DAI-02–DAI-06/HUY/DAT.

## A01 — hợp đồng người đăng nhập hiện có

`PageModelAdvice.CurrentUser` là record trình bày an toàn:

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| id | Long | ID tài khoản đăng nhập |
| email | String | Email đã xác minh dùng đăng nhập |
| displayName | String | Tên hiển thị |
| homeUrl | String | `/home`, `/tutor/manage` hoặc `/admin/dashboard` theo quyền |

`currentUser = null` khi guest. Không có lớp CurrentUserDTO hoặc trường publicCode/roles/emailVerified trong hợp đồng này. Record JDBC `com.educonnect.user.UserAccount` có hash mật khẩu để xác thực, không đưa ra Model/API; Entity JPA cùng tên nằm trong `.user.domain`, không bind trực tiếp từ request.

Ví dụ đặt trong template dùng layout/advice hiện có (mẫu đã có tại `fragments/session-header.html`):

```html
<a th:if="${currentUser == null}" th:href="@{/auth/login}">Đăng nhập</a>
<span th:if="${currentUser != null}" th:text="${currentUser.displayName}"></span>
<a sec:authorize="hasRole('ADMIN')" th:href="@{/admin/dashboard}">Quản trị</a>
<form th:if="${currentUser != null}" method="post" th:action="@{/auth/logout}">
    <button type="submit">Đăng xuất</button>
</form>
```

Khai báo `xmlns:sec="http://www.thymeleaf.org/extras/spring-security"` để dùng `sec:authorize`. Vai trò tại Controller/Service lấy từ `Authentication.getAuthorities()` (`ROLE_LEARNER`, `ROLE_TUTOR`, `ROLE_ADMIN`); không tin role/id gửi từ form. Template ẩn menu không thay quyền server hoặc kiểm chủ sở hữu bản ghi ở Service. `/job/applicants` dành cho học viên đăng tin, không dành cho gia sư.

Login POST `/auth/login` nhận `email/password` và CSRF; lỗi redirect `?error` không phân biệt sai mật khẩu/email/khóa/chưa xác minh. Logout chỉ POST `/auth/logout` có CSRF, hủy session. Guest vào trang riêng được chuyển login; sai vai trò trả 403. Session cũ bị thu hồi khi tài khoản bị khóa, mất xác minh, đổi role hoặc authentication_version: redirect `/auth/login?expired`. Có thể bắt 403/redirect trong fetch để yêu cầu người dùng đăng nhập lại; không tự phát quyền từ browser store.

## Quên và đặt lại mật khẩu

1. POST `/auth/forgot-password`: chuẩn hóa/validate email; chỉ cấp token cho tài khoản ACTIVE đã xác minh. Email không có, tài khoản không đủ điều kiện hoặc đang bị giới hạn nhận cùng thông báo tiếp nhận, không khẳng định mail đã tới inbox.
2. `PasswordResetService` khóa dòng tài khoản qua Spring Data JPA, kiểm cooldown/số lần gửi một giờ, thu hồi token cũ. Sinh 32 byte SecureRandom, email nhận secret Base64 URL, DB chỉ lưu SHA-256 BINARY(32) với purpose RESET_PASSWORD/thời hạn. SMTP lỗi rollback cả token mới và việc thu hồi token cũ; trang hiện lỗi gửi chung, không lộ thông tin SMTP.
3. GET `/auth/reset-password?token=...` chỉ đọc, không tiêu thụ token. Form POST hiển thị khi token đúng purpose, còn hạn, chưa dùng/chưa thu hồi và tài khoản còn đủ điều kiện. Thiếu/sai/hết hạn/đã dùng có thông báo và liên kết yêu cầu mới.
4. POST validate mật khẩu/xác nhận (8–72 ký tự, tối đa 72 byte UTF-8, không NUL). Khóa tài khoản rồi locking-refresh token để đọc trạng thái mới nhất dưới MySQL REPEATABLE READ. Chỉ một yêu cầu đồng thời thắng; lưu BCrypt, tăng authentication_version và @Version, đánh dấu used_at, thu hồi token còn lại trong cùng transaction. Mật khẩu cũ không còn dùng được; các phiên cũ bị thu hồi ở request tiếp theo.
5. Hủy session của trình duyệt vừa đổi và redirect `/auth/login?reset`. Không tự đăng nhập. Trang auth đặt Cache-Control no-store/Referrer-Policy no-referrer; mật khẩu không được điền lại hoặc log.

Cấu hình trong `.env.local`/môi trường, cùng SMTP đang dùng cho OTP:

```dotenv
EDUCONNECT_PUBLIC_BASE_URL=http://localhost:8080
EDUCONNECT_RESET_TTL=30m
EDUCONNECT_RESET_COOLDOWN=60s
EDUCONNECT_RESET_MAX_SENDS=5
```

Base URL là cấu hình tin cậy, không lấy Host header; gồm context path nếu triển khai dưới thư mục con, dùng HTTPS khi public. TTL 30m, cooldown 60s, 5 lần/giờ là **mặc định phát triển đề xuất**, chưa chốt Q01/Q08 trong DECISIONS.md. Giới hạn lưu theo tài khoản trong DB, gồm cả các token đã dùng/thu hồi. Chưa có giới hạn tổng theo IP; không xem các mặc định này là chính sách phát hành đã nghiệm thu.

## Luồng và trường hợp quay lại đăng ký

1. POST `/auth/register` kiểm form, chuẩn hóa email và khóa bản ghi chờ theo email.
2. Email đã thuộc tài khoản xác minh: báo đã được sử dụng, hướng người dùng đăng nhập. Không thay mật khẩu/vai trò/tên của tài khoản đó.
3. Email chưa có tài khoản: lưu hash mật khẩu, tên/phone/role tạm. Sinh OTP 6 số bằng SecureRandom và challenge UUID riêng cho lượt này. Gửi mail qua SMTP.
4. Session chỉ lưu challenge UUID, không lưu OTP hoặc mật khẩu. `/auth/verify-email` hiển thị email che bớt, mã yêu cầu 8 ký tự và thời hạn còn lại.
5. POST `/auth/verify-email` lấy challenge từ session, đối chiếu hash OTP/thời hạn/số lần sai ở máy chủ. Đúng mã thì tạo tài khoản có email_verified_at, role và hồ sơ trong cùng transaction, đánh dấu lượt đã dùng và xóa hash OTP/mật khẩu/tên/phone tạm.
6. Đóng trang rồi quay lại: cùng session và lượt còn hiện hành thì tiếp tục nhập mã hoặc gửi lại. Nếu mất session/đổi trình duyệt, đăng ký lại cùng email được phép; sau cooldown sẽ thay thông tin tạm, gửi mã mới và thay challenge. Lượt và mã cũ không dùng được. Chỉ thông tin gắn với lượt cuối đã xác minh mới tạo tài khoản.

Mã yêu cầu trên email phải trùng mã yêu cầu trên trang. Một trình duyệt giữ challenge cũ không thể dùng mã từ lượt đăng ký trên trình duyệt khác để kích hoạt thông tin của lượt đó. Đây cũng là cách tránh kích hoạt nhầm mật khẩu do người khác đăng ký trước bằng email của nạn nhân.

Các tài khoản chưa xác minh từ phiên bản trước được giữ nguyên. Để xác minh qua form đăng ký, phải nhập đúng mật khẩu cũ; chỉ cập nhật dấu xác minh, giữ tên, hồ sơ, hash mật khẩu và vai trò hiện có. Không tự nâng tài khoản bị khóa/vô hiệu hóa.

## Giới hạn OTP

Mặc định trong `app.email-verification`: ttl 10m, resend-cooldown 60s, max-attempts 5, max-sends-per-hour 5. Giới hạn gửi lưu trong DB theo email, dùng chung cho đăng ký lại và gửi lại; tải lại trang/đổi session không xóa giới hạn. Sau 5 lần sai, mã bị khóa cho đến khi yêu cầu mã mới theo giới hạn gửi. Thời hạn được kiểm bằng Clock UTC ở máy chủ; bộ đếm JS chỉ hỗ trợ giao diện.

OTP lưu bằng BCrypt, không lưu mã thô trong DB hoặc log. Unique email của bảng chờ cùng SELECT FOR UPDATE tuần tự hóa gửi/nhập mã đồng thời. Unique email ở user_accounts tiếp tục bảo vệ tạo tài khoản trùng. POST có CSRF; dữ liệu SQL được bind tham số.

## Resend SMTP

Điền `.env.local` từ `.env.example`, giữ nguyên các biến DB:

```dotenv
EDUCONNECT_MAIL_HOST=smtp.resend.com
EDUCONNECT_MAIL_PORT=465
EDUCONNECT_MAIL_USERNAME=resend
EDUCONNECT_MAIL_PASSWORD=<Resend API key>
EDUCONNECT_MAIL_FROM=<địa chỉ gửi thuộc domain đã xác minh>
```

Main đọc file local khi chạy từ root, ưu tiên system properties/env đã có. File local không vào Git. SMTP dùng SSL và kiểm hostname, giới hạn connect/read/write 5 giây. Gửi UTF-8 và header Resend-Idempotency-Key theo challenge. Không có fallback in OTP ra màn hình/log hoặc báo gửi thành công giả.

Resend yêu cầu API key và domain đã xác minh: https://resend.com/docs/send-with-smtp . Thiếu cấu hình/from hoặc SMTP lỗi được hiển thị lỗi phù hợp; transaction rollback nên chưa có tài khoản mới. Nếu gửi lại thất bại, lượt/mã cũ được giữ nếu còn hạn. SMTP và commit DB không phải một giao dịch phân tán: nếu mail đã được SMTP nhận nhưng commit DB thất bại, người dùng cần yêu cầu lại mã; không được giả định inbox đã nhận chỉ từ phản hồi SMTP.

Khởi động `./mvnw.cmd spring-boot:run` (mặc định db-dev). Migration V4 tự áp qua Flyway. Profile ui-preview chỉ xem trang, không gửi OTP. `database/tools/connect.ps1` chỉ nạp biến DB, bỏ qua biến mail trong cùng file local.

## Cấu trúc code

- RegistrationForm/RegistrationController: validation và bind các trường được phép; session giữ challenge sau khi gửi mã thành công.
- RegistrationService → EmailVerificationService: đăng ký tạm, gửi/gửi lại, kiểm mã và hoàn tất giao dịch.
- PendingRegistrationRepository: dữ liệu tạm, khóa dòng, giới hạn gửi/thử mã; UserAccountRepository: tài khoản/vai trò/hồ sơ đã xác minh.
- OtpMailSender: gửi MIME email qua JavaMailSender, cấu hình Resend SMTP chuẩn Spring Boot.
- AccountUserDetailsService/AccountPrincipal: nạp tài khoản/role, kiểm BCrypt và yêu cầu email verified trước đăng nhập.
- SessionAccountFilter: đối chiếu trạng thái ACTIVE, email verified, role và authentication_version mỗi request có phiên. Reset tăng stamp trong cùng transaction đổi mật khẩu.
- PageModelAdvice: currentUser chỉ gồm id/email/displayName/homeUrl. Header dùng dữ liệu phiên thật và POST logout có CSRF.

Session HttpOnly, SameSite=Lax, timeout 30 phút không hoạt động, đổi ID khi login. Khi triển khai HTTPS cần bật `server.servlet.session.cookie.secure=true`. DatabaseSecurityConfig bảo vệ URL theo role; service nghiệp vụ tiếp theo vẫn phải kiểm quyền sở hữu từng bản ghi.

## Kiểm thử

```powershell
. ./database/tools/connect.ps1 -LoadOnly -NoPrompt
$env:EDUCONNECT_MYSQL_TESTS = 'true'
./mvnw.cmd -B -ntp clean verify
```

MySqlOtpTest dùng mail mock để kiểm đăng ký bỏ dở/quay lại cùng email, mã cũ, hết hạn, resend/cooldown/giới hạn giờ, 5 lần sai, replay, email đã xác minh, giữ nguyên tài khoản cũ và rollback thật khi SMTP lỗi. Dữ liệu test dùng email UUID, rollback hoặc xóa đúng bản ghi riêng; không gửi tới người thật. MySqlAuthTest kiểm HTTP đăng ký → OTP → tài khoản/hồ sơ → đăng nhập → currentUser/quyền → đăng xuất. OtpMailSenderTest kiểm cấu trúc email UTF-8, OTP, thời hạn, mã yêu cầu và idempotency header.

MySqlPasswordResetTest kiểm reset thật và phiên cũ, replay, token sai purpose/hết hạn/thu hồi, giới hạn gửi, khóa tài khoản, rollback khi SMTP lỗi và hai transaction đồng thời. PasswordResetWebTest kiểm CSRF/context path/validation/trạng thái link/thông báo mail lỗi. PasswordResetMailSenderTest kiểm MIME UTF-8. AuthFlowTest kiểm ví dụ A01, guest/null và phân quyền URL.

Để chạy cả SharedEntitiesMySqlTest, dùng instance/schema test riêng và các biến `EDUCONNECT_JPA_TEST_*` theo [entity-handoff.md](entity-handoff.md); đặt DB_URL của auth về cùng schema test. Không coi MySQL bị skip là đã qua. `SmtpConnectionTest` bật riêng bằng `EDUCONNECT_SMTP_CONNECTION_TEST=true`, nạp các biến SMTP vào terminal test; chỉ kiểm kết nối TLS/xác thực, **không gửi email**. Kiểm mail thật tới inbox vẫn cần địa chỉ người nhận cho phép và đánh giá delivery riêng.

## Kết quả DAI-01 ngày 23/10/2026

Nền: main PR #24, commit `7b7a42d`; Java 21.0.10 (release 17), Maven 3.9.16, MySQL 8.0.45. Tạo instance test riêng dưới `target/mysql-dai01`, bind loopback port 33318, schema trống `educonnect_test_shared`. Flyway thực sự áp V1–V4, Hibernate validate; không dùng H2 hoặc nạp seed, không sửa migration/DB nhóm. Kiểm reset ban đầu đã phát hiện race dưới REPEATABLE READ; sau khi đổi sang locking refresh, ca đồng thời chỉ có một lần sử dụng thành công.

| Kiểm tra | Kết quả |
|---|---|
| `mvnw.cmd -o -B -ntp verify` với opt-in MySQL/JPA/SMTP connection | 150 tổng; 149 passed, 0 failure/error; 1 skipped: ResendSmtpSmokeTest gửi email thật |
| AuthFlowTest / MySqlAuthTest / MySqlOtpTest | 14 / 2 / 10 passed |
| MySqlPasswordResetTest / PasswordResetWebTest / PasswordResetMailSenderTest | 7 / 7 / 2 passed |
| SharedEntitiesMySqlTest | 10 passed, dùng DB thật; đủ 51 Entity/51 Repository và transaction manager chung |
| SmtpConnectionTest | 1 passed: TLS/xác thực SMTP cấu hình local; không gửi thư, chưa chứng minh inbox delivery |
| template / route / static / hook / source / store / database-static | Tất cả qua; không sửa prototype; 4 migration |
| Trình duyệt, profile db-dev | Mở đủ 5 trang auth; token test hợp lệ hiển thị form, thiếu token có thông báo; không có console error/warning |

Các mail trong test chức năng được mock, MIME có kiểm riêng; không gửi OTP/reset tới người thật. Tài khoản thử dùng UUID, rollback hoặc xóa đúng fixture riêng. Kết quả lịch sử ngày 16/10 phía dưới giữ làm tham chiếu, không phải số liệu lần chạy này. Chưa chốt Q01/Q08; cần nhóm duyệt TTL/giới hạn/email policy và xác nhận delivery tới người nhận được phép trước nghiệm thu môi trường gửi mail thực tế. Phần hồ sơ, quản trị, đánh giá, báo cáo và thống kê sẽ làm theo DAI-02–DAI-06.

## Kết quả kiểm tra ngày 16 tháng 10 năm 2026

`clean verify` 115 tests passed; sau khi sửa làm tròn bộ đếm chờ, `verify` 116 tests passed, 0 failures/errors/skipped, gồm 9 MySQL OTP tests. Flyway V4 đã áp thành công trên MySQL 8.0.45. Các kiểm tra template/route/static/hook/source/store/database-static đều qua.

SMTP local + Chromium kiểm end-to-end việc nhận mail MIME thật qua SMTP, dữ liệu chờ chưa tạo tài khoản, số lần sai lưu qua request, resend chặn mã cũ, đăng ký lại cùng email từ trình duyệt khác, mã yêu cầu gắn session, hết hạn/gửi lại/xác minh, đăng nhập bằng mật khẩu của lượt mới và đăng xuất. Màn hình OTP 390 × 844 không tràn và không có lỗi JavaScript. Script chỉ tạo/xóa đúng tài khoản kiểm thử riêng. Gửi thực tế qua Resend còn phụ thuộc API key và from/domain của máy người dùng.

## Kiểm tra Resend SMTP thật

ResendSmtpSmokeTest chỉ chạy khi đặt EDUCONNECT_RESEND_SMOKE=true và EDUCONNECT_SMTP_TEST_RECIPIENT bằng địa chỉ được chủ email cho phép kiểm thử. Phải nạp các biến SMTP/DB vào môi trường test vì SpringBootTest không gọi main để đọc .env.local. Chạy Maven với -Dtest=ResendSmtpSmokeTest test. Test gửi một email OTP thật, yêu cầu email chưa có tài khoản/đăng ký chờ, không sửa dữ liệu đang có và rollback tất cả thay đổi DB.

Ngày 16 tháng 10 năm 2026: TLS SMTP, xác thực và sender check đều thành công. Test Resend thật xác nhận gửi được email SMTP, đăng ký chờ → xác minh OTP → đăng nhập → đăng xuất; 1 test passed. Chấp nhận gửi SMTP chưa chứng minh thư đã đến inbox; người nhận cần kiểm tra hộp thư hoặc trạng thái delivery của Resend. OTP được giữ nội bộ trong kiểm thử, không ghi vào log. API key không được in hoặc lưu trong repo.
