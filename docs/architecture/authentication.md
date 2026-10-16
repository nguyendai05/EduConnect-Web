# Đăng ký OTP email và đăng nhập với MySQL

## Tương thích nền JPA v1

Record `com.educonnect.user.UserAccount` và hai JDBC repository giữ nguyên vai trò. Entity mới ở `.domain`, repository mới hậu tố JpaRepository; không có đăng ký qua JPA song song. `markEmailVerified` nay trả affected rows, tăng cả version và authentication_version; service chỉ complete pending khi ghi đúng một row, nếu không ném OptimisticLockingFailureException để rollback. Không trộn managed Entity vào flow JDBC hiện tại; caller tương lai phải refresh/clear sau JDBC. Xem entity-handoff.md. Các kết quả kiểm tra lịch sử phía dưới không thay cho biên bản verification của shared foundation.


Đăng ký được lưu tạm trong `pending_registrations` (Flyway V4). Tài khoản/vai trò/hồ sơ chỉ được tạo sau khi chứng minh quyền sở hữu email bằng OTP. Không thay đổi dữ liệu hay checksum V1–V3. Quên mật khẩu và remember-me chưa triển khai.

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
- SessionAccountFilter: đối chiếu trạng thái ACTIVE, email verified, role và authentication_version mỗi request có phiên. Đổi mật khẩu sau này phải tăng stamp trong cùng transaction.
- PageModelAdvice: currentUser chỉ gồm id/email/displayName/homeUrl. Header dùng dữ liệu phiên thật và POST logout có CSRF.

Session HttpOnly, SameSite=Lax, timeout 30 phút không hoạt động, đổi ID khi login. Khi triển khai HTTPS cần bật `server.servlet.session.cookie.secure=true`. DatabaseSecurityConfig bảo vệ URL theo role; service nghiệp vụ tiếp theo vẫn phải kiểm quyền sở hữu từng bản ghi.

## Kiểm thử

```powershell
. ./database/tools/connect.ps1 -LoadOnly -NoPrompt
$env:EDUCONNECT_MYSQL_TESTS = 'true'
./mvnw.cmd -B -ntp clean verify
```

MySqlOtpTest dùng mail mock để kiểm đăng ký bỏ dở/quay lại cùng email, mã cũ, hết hạn, resend/cooldown/giới hạn giờ, 5 lần sai, replay, email đã xác minh, giữ nguyên tài khoản cũ và rollback thật khi SMTP lỗi. Dữ liệu test dùng email UUID, rollback hoặc xóa đúng bản ghi riêng; không gửi tới người thật. MySqlAuthTest kiểm HTTP đăng ký → OTP → tài khoản/hồ sơ → đăng nhập → currentUser/quyền → đăng xuất. OtpMailSenderTest kiểm cấu trúc email UTF-8, OTP, thời hạn, mã yêu cầu và idempotency header.

## Kết quả kiểm tra ngày 16 tháng 10 năm 2026

`clean verify` 115 tests passed; sau khi sửa làm tròn bộ đếm chờ, `verify` 116 tests passed, 0 failures/errors/skipped, gồm 9 MySQL OTP tests. Flyway V4 đã áp thành công trên MySQL 8.0.45. Các kiểm tra template/route/static/hook/source/store/database-static đều qua.

SMTP local + Chromium kiểm end-to-end việc nhận mail MIME thật qua SMTP, dữ liệu chờ chưa tạo tài khoản, số lần sai lưu qua request, resend chặn mã cũ, đăng ký lại cùng email từ trình duyệt khác, mã yêu cầu gắn session, hết hạn/gửi lại/xác minh, đăng nhập bằng mật khẩu của lượt mới và đăng xuất. Màn hình OTP 390 × 844 không tràn và không có lỗi JavaScript. Script chỉ tạo/xóa đúng tài khoản kiểm thử riêng. Gửi thực tế qua Resend còn phụ thuộc API key và from/domain của máy người dùng.

## Kiểm tra Resend SMTP thật

ResendSmtpSmokeTest chỉ chạy khi đặt EDUCONNECT_RESEND_SMOKE=true và EDUCONNECT_SMTP_TEST_RECIPIENT bằng địa chỉ được chủ email cho phép kiểm thử. Phải nạp các biến SMTP/DB vào môi trường test vì SpringBootTest không gọi main để đọc .env.local. Chạy Maven với -Dtest=ResendSmtpSmokeTest test. Test gửi một email OTP thật, yêu cầu email chưa có tài khoản/đăng ký chờ, không sửa dữ liệu đang có và rollback tất cả thay đổi DB.

Ngày 16 tháng 10 năm 2026: TLS SMTP, xác thực và sender check đều thành công. Test Resend thật xác nhận gửi được email SMTP, đăng ký chờ → xác minh OTP → đăng nhập → đăng xuất; 1 test passed. Chấp nhận gửi SMTP chưa chứng minh thư đã đến inbox; người nhận cần kiểm tra hộp thư hoặc trạng thái delivery của Resend. OTP được giữ nội bộ trong kiểm thử, không ghi vào log. API key không được in hoặc lưu trong repo.
