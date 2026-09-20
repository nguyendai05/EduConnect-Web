# EduConnect Web

EduConnect là ứng dụng kết nối học viên và phụ huynh với gia sư, được tổ chức theo kiến trúc nguyên khối có mô-đun (modular monolith). Kho mã nguồn hiện chỉ chứa bộ khung nền tảng của dự án trong Sprint 0.

## Công nghệ sử dụng

- Nền tảng giao diện: HTML5, CSS3 và JavaScript thuần (Vanilla JavaScript)
- Định hướng backend: Java 17, Spring Boot 3.x, Spring MVC, JSP/JSTL
- Định hướng lưu trữ dữ liệu: Spring Data JPA, MySQL 8 và Flyway
- Công cụ biên dịch và đóng gói: Maven

## Kiến trúc dự án

Backend sử dụng kiến trúc nguyên khối có mô-đun và tổ chức package theo tính năng (package-by-feature). Các thành phần giao diện cơ bản dùng chung được phát triển tách biệt với tài nguyên riêng của từng trang, giúp chuyển bản mẫu HTML sang JSP sau này mà ít phải thay đổi cấu trúc.

## Cấu trúc kho mã nguồn

- `docs/`: tài liệu kiến trúc, kế hoạch giao diện, ghi chú cơ sở dữ liệu và quy ước của nhóm
- `ui-prototype/`: các giá trị thiết kế dùng chung (design token), component dùng chung và bản mẫu trang, không phụ thuộc framework
- `src/main/java/`: điểm khởi chạy Spring Boot và các package theo tính năng
- `src/main/resources/static/`: nơi lưu CSS, JavaScript và hình ảnh cho ứng dụng chính thức sau này
- `src/main/webapp/WEB-INF/views/`: nơi lưu các trang JSP và mảnh giao diện JSP (fragment) sau này
- `scripts/`: các tập lệnh hỗ trợ dự án, chỉ bổ sung khi cần

## Các giai đoạn phát triển

1. Xây dựng HTML/CSS/JS và hệ thống component dùng chung
2. Tích hợp JSP
3. Tích hợp Spring MVC và tầng lưu trữ dữ liệu
4. Tích hợp các tính năng nghiệp vụ

## Bắt đầu

Yêu cầu: JDK 17 trở lên và Maven 3.6.3 trở lên.

```bash
mvn clean compile
mvn clean test
mvn clean package
```

Ở giai đoạn này, ứng dụng mới chỉ có bộ khung; cấu hình cơ sở dữ liệu và bảo mật chưa được triển khai theo phạm vi đã xác định.

## Quy trình làm việc với Git

Xem [quy trình làm việc với Git](docs/conventions/git-workflow.md) và [mục lục tài liệu dự án](docs/README.md).
