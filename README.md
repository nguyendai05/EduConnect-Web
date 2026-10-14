# EduConnect Web

Nền Spring MVC + Thymeleaf cho 40 trang EduConnect. Đợt này chỉ render giao diện và dữ liệu demo trong JavaScript; chưa triển khai nghiệp vụ, xác thực hay phân quyền thực tế.

## Chạy ngay sau khi clone

Cần JDK 17+ (JDK 21 cũng được); bytecode được biên dịch với release 17. Maven Wrapper dùng Maven 3.9.16; lần đầu cần mạng để tải Maven/dependency. Không cần cài Maven riêng, Node hoặc MySQL để chạy ứng dụng.

```powershell
.\mvnw.cmd spring-boot:run
```

Mở http://localhost:8080/ hoặc http://localhost:8080/home. Profile mặc định `ui-preview` loại auto-config datasource/JPA/Flyway. Các trang khác có trong [page map](docs/ui/page-map.md).

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

- `ui-preview` mặc định: không kết nối DB; permitAll cho request, CSRF vẫn bật; persona/role là demo browser.
- `db-dev`: phải cấp `EDUCONNECT_DB_URL`, `EDUCONNECT_DB_USERNAME`, `EDUCONNECT_DB_PASSWORD` qua môi trường. Spring không tự đọc `.env.local`; file này chỉ thuộc JDBC helper thủ công.

```powershell
java -jar target\educonnect-web-0.0.1-SNAPSHOT.jar --spring.profiles.active=db-dev
```

Không chạy profile DB vào schema đang có dữ liệu để thử giao diện. Flyway quản lý migration; không chạy drop/seed từ quy trình UI. Xem [tài liệu DB](docs/database/README.md).

## Cấu trúc và bàn giao

- `src/main/resources/templates/{layouts,fragments,pages}`: nguồn view chính.
- `src/main/resources/static/{css,js,assets}`: nguồn asset chính; dữ liệu giả nằm trong `js/preview`.
- `src/main/java/com/educonnect/<feature>/web`: controller GET theo tính năng và sở hữu.
- `ui-prototype/`: tham chiếu đóng băng; không sửa để phát triển ứng dụng chính.
- `database/`, `db/migration/`, `DBConnect.java`: nền DB được giữ nguyên.

[Cấu trúc Thymeleaf và cách thêm trang](docs/architecture/thymeleaf-structure.md) · [Sở hữu](docs/architecture/ownership.md) · [Quy trình đóng góp](CONTRIBUTING.md) · [Tài liệu](docs/README.md).
