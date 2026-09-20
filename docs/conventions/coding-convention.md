# Quy ước viết mã

## Giao diện (frontend)

- Dùng kebab-case cho tên class CSS và tên tệp CSS của component.
- Dùng camelCase cho tên biến và hàm JavaScript.
- Tránh viết CSS trực tiếp trong thuộc tính `style` của phần tử HTML, trừ trường hợp ngoại lệ đã được ghi rõ trong tài liệu.
- Không viết mã JavaScript trực tiếp trong trang HTML.
- Dùng các giá trị thiết kế dùng chung (design token) thay vì ghi cố định màu thương hiệu trong mã.
- CSS của từng trang không được định nghĩa lại các component dùng chung.
- CSS của component chỉ được áp dụng cho chính component đó.

## Java

- Dùng chữ thường cho tên package.
- Dùng PascalCase cho tên lớp và camelCase cho tên phương thức, biến.
- Không đặt logic nghiệp vụ trong controller.
- Dùng hằng số có tên hoặc enum cho các trạng thái, tránh dùng chuỗi ký tự cố định rải rác trong mã.
- Đặt mã của từng tính năng trong package tương ứng; không tạo các package theo tầng kỹ thuật ở cấp gốc của ứng dụng.
