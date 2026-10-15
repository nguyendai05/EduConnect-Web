# Kiến trúc EduConnect

Ứng dụng nguyên khối có mô-đun, package theo tính năng, Spring MVC + Thymeleaf và executable JAR với embedded Tomcat.

- [Cấu trúc, layout/fragment/preview, URL và cách thêm trang](thymeleaf-structure.md)
- [Sở hữu file và quy tắc PR](ownership.md)

Nền hiện tại chỉ render 40 trang preview qua controller GET; chưa có nghiệp vụ hoặc xác thực/phân quyền thật. Thư mục prototype là tham chiếu đóng băng, nguồn chính nằm trong src/main/resources. Kế hoạch view cũ chỉ lưu tại docs/archive/jsp-plan.
