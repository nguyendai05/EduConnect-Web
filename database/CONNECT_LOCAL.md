# Tự kết nối và test MySQL local bằng DBConnect

File chạy: src/main/java/com/educonnect/config/DBConnect.java, class com.educonnect.config.DBConnect.

## 1. Cấu hình trên máy

Đã kiểm service MySQL80 và TCP 127.0.0.1:3306 đang hoạt động. Lần thử credential trước đó bị MySQL từ chối user root; chưa xác nhận đăng nhập JDBC thành công. Không reset mật khẩu hoặc sửa database.

Sửa ba dòng trong **.env.local** ở root repository:

- EDUCONNECT_DB_URL: mặc định jdbc:mysql://127.0.0.1:3306/educonnect_dev?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true
- EDUCONNECT_DB_USERNAME: mặc định root; đổi nếu tài khoản local của bạn khác.
- EDUCONNECT_DB_PASSWORD: mật khẩu tài khoản MySQL local, **không phải EduconnectDemo!2026**.

.env.local đã được .gitignore bỏ qua. .env.example là mẫu chia sẻ, không điền secret thật vào mẫu này. Không gửi mật khẩu trong chat/PR/tài liệu. Password có dấu #, =, $() được giữ như ký tự literal; có thể bọc giá trị bằng một cặp nháy đơn hoặc kép, không dùng cú pháp PowerShell.

DBConnect ưu tiên biến môi trường EDUCONNECT_DB_* của cấu hình Run/terminal; nếu không có thì đọc .env.local. Nếu đã đặt env cũ, cập nhật/xóa env trong Run Configuration để tránh ghi đè file mới.

## 2. Chạy trong IntelliJ IDEA

1. Mở repository như Maven project và Reload Maven để có mysql-connector-j.
2. Mở DBConnect.java → chạy main() / Run DBConnect.main().
3. Working directory đặt root repo; helper cũng tìm .env.local qua thư mục có pom.xml nếu chạy từ thư mục con.
4. Thành công sẽ in Server, Database, Timezone và SELECT 1 = 1. Mật khẩu không được in.
5. Muốn chỉ kiểm cú pháp/config, đặt Program arguments: --config-only. Kết quả này **không** chứng minh đã kết nối.

Chạy DBConnect.main() là kiểm JDBC độc lập, không chạy EduConnectApplication hay Flyway; không tự tạo schema, seed, controller hoặc ghi dữ liệu nghiệp vụ. Ứng dụng Spring/JPA vẫn dùng DataSource từ application-db-dev.yml.

## 3. Chạy trong terminal

Từ root repo, sau Maven package:

```powershell
java --class-path "target/classes;target/educonnect-web-0.0.1-SNAPSHOT/WEB-INF/lib/*" com.educonnect.config.DBConnect
```

Chỉ kiểm config, không kết nối:

```powershell
java --class-path "target/classes;target/educonnect-web-0.0.1-SNAPSHOT/WEB-INF/lib/*" com.educonnect.config.DBConnect --config-only
```

Nếu muốn nạp cùng cấu hình vào terminal để chạy application/helper khác:

```powershell
./database/tools/connect.ps1 -LoadOnly
# Sau đó app chạy từ terminal này sẽ thấy SPRING_PROFILES_ACTIVE=db-dev và EDUCONNECT_DB_*.
```

connect.ps1 không có -LoadOnly sẽ gọi DatabaseTool connection, cũng chỉ kiểm JDBC/metadata, không migrate/seed. Khi file còn placeholder, script có thể hỏi password bằng Read-Host -AsSecureString, không ghi password prompt vào file.

## 4. Workbench và Navicat cùng connection

| Trường | Giá trị local |
| --- | --- |
| Connection name gợi ý | Educonnect Local |
| Loại kết nối | MySQL / TCP-IP |
| Hostname | 127.0.0.1 |
| Port | 3306 |
| Username | root hoặc user local đã cấu hình |
| Password | Mật khẩu MySQL local của user trên |
| Database/default schema | educonnect_dev |

Workbench: dùng connection local hiện có hoặc tạo connection tên trên, đặt hostname/port/user/default schema và Test Connection. Navicat: tạo connection MySQL cùng thông tin, Test Connection, sau đó mở educonnect_dev. Password được nhập trong client, không lấy mật khẩu DEMO ứng dụng để điền.

Nếu chưa có educonnect_dev, sau khi đăng nhập server thành công mới chạy database/00_create_database.sql theo database/README.md. Kiểm database rỗng và chọn đúng đường Flyway/SQL thủ công trước khi áp schema; DBConnect không làm việc này tự động.

## 5. Đọc lỗi

| Kết quả | Cách xử lý |
| --- | --- |
| MySQL error 1045 | Kiểm Test Connection trong Workbench/Navicat với cùng host/port/user; dùng đúng mật khẩu/quyền host, không reset user tự động |
| MySQL error 1049 | Chưa có database trong URL; tạo đúng development database bằng file 00 |
| Thiếu driver | Reload Maven project hoặc package; không chạy chỉ với target/classes mà thiếu jar runtime |
| Timeout / lỗi network | Kiểm service/cổng; DBConnect đặt connect/socket timeout 5 giây |
| Cấu hình chưa hợp lệ | Điền password thay placeholder, kiểm ba key và URL; không đặt credential trong JDBC URL |

Caller Java có thể dùng try-with-resources với DBConnect.getConnection() để đóng Connection. Không giữ Connection static dùng chung. CLI chỉ in thông báo phân loại lỗi và SQLState/error code, không log vendor message hoặc password.

