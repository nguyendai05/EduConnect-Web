# Bản mẫu giao diện

Thư mục bản mẫu là nơi xây dựng các thành phần giao diện có thể tái sử dụng, không phụ thuộc framework, trước khi tích hợp JSP.

```text
Thiết kế tham khảo
  -> Giá trị thiết kế dùng chung (Design Token)
  -> Component giao diện dùng chung
  -> Component nghiệp vụ
  -> Trang giao diện
  -> Mảnh giao diện JSP (JSP Fragment) / Trang JSP
```

Các tệp HTML trên Google Drive không phải mã nguồn của ứng dụng chính thức. Có thể tham khảo bố cục, kiểu chữ, component, khoảng cách, nội dung và trạng thái giao diện trong các tệp này, nhưng không được sao chép nguyên tệp vào kho mã nguồn.

Xây dựng các thành phần cơ bản dùng chung trước, tiếp đến là component nghiệp vụ, cuối cùng mới ghép thành các trang. CSS dùng chung được đặt trong `css/components/`, xử lý JavaScript dùng chung được đặt trong `js/core/`, còn tài nguyên riêng của từng trang được đặt trong thư mục tính năng tương ứng thuộc `css/pages/` hoặc `js/pages/`.
