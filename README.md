# EduConnect Web

Ứng dụng Spring MVC + Thymeleaf cho 40 trang EduConnect. DAI-01: đăng ký/OTP, đăng nhập/đăng xuất, quên/đặt lại mật khẩu và phiên/quyền nối MySQL. Các nghiệp vụ khác vẫn đang dùng giao diện/dữ liệu preview.

## Chạy ngay sau khi clone

Cần JDK 17+ và MySQL 8.0.16+; bytecode được biên dịch với release 17. Maven Wrapper dùng Maven 3.9.16; lần đầu cần mạng để tải Maven/dependency. Không cần cài Maven riêng hoặc Node để chạy ứng dụng.

Tạo `.env.local` từ `.env.example`, điền kết nối MySQL trên máy. Chạy từ thư mục gốc repo; `main()` đọc `.env.local`, ưu tiên system properties và biến môi trường đã có. Database development đã có V1–V3 và dữ liệu thì dùng tiếp, Flyway sẽ áp V4 cho đăng ký OTP; database mới cần tạo schema trống rồi để Flyway áp migration theo [hướng dẫn DB](database/README.md). Không chạy lại bộ SQL tạo bảng vào database đã có dữ liệu.

```powershell
.\mvnw.cmd spring-boot:run
```

Mở http://localhost:8080/auth/register hoặc http://localhost:8080/auth/login. Profile mặc định là `db-dev`; ứng dụng kết nối MySQL và Flyway kiểm tra migration. Các trang khác có trong [page map](docs/ui/page-map.md).

```powershell
.\mvnw.cmd -B -ntp clean verify
java -jar target\educonnect-web-0.0.1-SNAPSHOT.jar
```

Linux/macOS dùng `./mvnw`. Maven Enforcer yêu cầu Java 17+, Maven 3.9+ và chặn dependency servlet cũ/layout dialect không dùng.

## Kiểm tra

```powershell
node scripts/checks/template-check.mjs
node scripts/checks/route-check.mjs
node scripts/checks/static-check.mjs
node scripts/checks/hook-check.mjs
node scripts/checks/source-check.mjs
node scripts/checks/store-check.mjs
node scripts/checks/database-static-check.mjs
```

Node 22+ chỉ cần khi chạy Node checks. Java tests đọc 40 URL từ `src/test/resources/pages.csv`, asset oracle từ `page-assets.json`; kiểm view, UTF-8, link, asset, CSS/JS/head/body, preview và CSRF. Các test DBConnect cũ vẫn được giữ.

## Profile

- `db-dev` mặc định: kết nối MySQL từ `EDUCONNECT_DB_URL`, `EDUCONNECT_DB_USERNAME`, `EDUCONNECT_DB_PASSWORD` hoặc `.env.local` khi chạy `main()`. Xác thực/kiểm quyền ở máy chủ; CSRF bật.
- `ui-preview`: dùng riêng để xem giao diện không cần DB, permitAll và persona demo. Các form xác thực bị vô hiệu hóa trong profile này để không báo thành công giả.

```powershell
java -jar target\educonnect-web-0.0.1-SNAPSHOT.jar --spring.profiles.active=db-dev
# Chỉ xem giao diện, không kết nối DB:
java -jar target\educonnect-web-0.0.1-SNAPSHOT.jar --spring.profiles.active=ui-preview
```

Không chạy profile DB vào schema đang có dữ liệu để thử giao diện. Flyway quản lý migration; không chạy drop/seed từ quy trình UI. Xem [tài liệu DB](docs/database/README.md).

## Đăng nhập và đăng ký

- Đăng ký học viên hoặc gia sư: lưu đăng ký tạm, gửi OTP 6 số qua Resend SMTP, chỉ tạo tài khoản/vai trò/hồ sơ khi xác minh thành công. OTP hạn 10 phút, tối đa 5 lần sai, chờ 60 giây giữa lần gửi, tối đa 5 lần gửi/email/giờ. Gia sư bắt đầu ở `DRAFT`, không được tự duyệt hay đăng ký admin.
- Đăng nhập bằng email/mật khẩu từ DB. Học viên tới `/home`, gia sư tới `/tutor/manage`, admin tới `/admin/dashboard`. Menu dùng người đăng nhập thật; đăng xuất bằng POST `/auth/logout` có CSRF.
- Phiên dùng cookie HttpOnly, SameSite=Lax, timeout 30 phút. Đổi trạng thái tài khoản/vai trò/`authentication_version` làm phiên cũ mất hiệu lực ở request tiếp theo.
- Email chưa xác minh không được đăng nhập. Đăng ký lại cùng email đang chờ sẽ phát mã mới (theo giới hạn gửi), thay thông tin tạm và vô hiệu hóa lượt cũ. Email đã xác minh được hướng về đăng nhập. Quên mật khẩu gửi liên kết dùng một lần qua SMTP; reset lưu hash mật khẩu mới và thu hồi phiên cũ. Ghi nhớ đăng nhập dài hạn chưa triển khai.
- Nếu đã nạp seed development: dùng `learner01@example.test`, `tutor01@example.test` hoặc `admin@example.test`, mật khẩu demo công khai `EduconnectDemo!2026`.

Resend SMTP mặc định `smtp.resend.com:465`, SSL, username `resend`. Điền `EDUCONNECT_MAIL_PASSWORD` bằng Resend API key và `EDUCONNECT_MAIL_FROM` bằng địa chỉ thuộc domain đã xác minh trong `.env.local`; không commit API key. Thiếu cấu hình hoặc gửi mail lỗi thì không báo đăng ký thành công.

[Bàn giao DAI-01/A01, cấu hình reset, kiểm quyền và kiểm thử MySQL](docs/architecture/authentication.md).

## Cấu trúc và bàn giao

- `src/main/resources/templates/{layouts,fragments,pages}`: nguồn view chính.
- `src/main/resources/static/{css,js,assets}`: nguồn asset chính; dữ liệu giả nằm trong `js/preview`.
- `src/main/java/com/educonnect/<feature>/web`: controller GET theo tính năng và sở hữu.
- `ui-prototype/`: tham chiếu đóng băng; không sửa để phát triển ứng dụng chính.
- `database/`, `db/migration/`, `DBConnect.java`: nền DB được giữ nguyên.

[Cấu trúc Thymeleaf và cách thêm trang](docs/architecture/thymeleaf-structure.md) · [Sở hữu](docs/architecture/ownership.md) · [Quy trình đóng góp](CONTRIBUTING.md) · [Tài liệu](docs/README.md).
