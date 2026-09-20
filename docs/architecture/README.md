# Kiến trúc

EduConnect được định hướng theo kiến trúc nguyên khối có mô-đun (modular monolith). Mã backend được nhóm theo tính năng nghiệp vụ thay vì chia theo tầng kỹ thuật ở cấp gốc của ứng dụng. Mỗi tính năng có thể bổ sung các package controller, service, repository, DTO hoặc entity riêng khi việc triển khai thực sự cần đến chúng.

## Ánh xạ bản mẫu giao diện sang JSP

Bản mẫu giao diện được tổ chức tương ứng với cấu trúc JSP dự kiến để việc chuyển đổi chủ yếu là chuyển tệp theo ánh xạ sau:

```text
ui-prototype/components/layout/user-header.html
  -> src/main/webapp/WEB-INF/views/fragments/layout/user-header.jspf

ui-prototype/pages/tutor/search.html
  -> src/main/webapp/WEB-INF/views/tutor/search.jsp

ui-prototype/css/ and ui-prototype/js/
  -> src/main/resources/static/css/ and src/main/resources/static/js/
```

Các thành phần bố cục, điều hướng, biểu mẫu, phản hồi trạng thái và giao diện dùng chung có thể tái sử dụng nên được chuyển thành mảnh giao diện JSP (fragment). Mã HTML riêng của từng trang nên được chuyển thành trang JSP trong thư mục tính năng tương ứng. CSS và các xử lý JavaScript dùng chung cần độc lập với từng trang để có thể chuyển vào `static/` mà không phải thiết kế lại giao diện.

Bộ khung hiện tại chỉ xác định ranh giới giữa các phần của ứng dụng. Chưa có controller, service, repository, entity, chức năng xác thực hay xử lý cơ sở dữ liệu.
