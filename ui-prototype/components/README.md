# Quy tắc xây dựng component

1. Cân nhắc chuyển component vào nhóm giao diện dùng chung khi được sử dụng trên từ hai trang trở lên.
2. Luôn tách riêng các xử lý dùng chung giữa nhiều trang.
3. Không sao chép component từ trang này sang trang khác.
4. Giữ thành phần riêng trong trang của nó nếu ít có khả năng tái sử dụng.
5. Không ghi cố định màu thương hiệu trong CSS của trang; hãy dùng các giá trị thiết kế dùng chung (design token).
6. Không tự tạo kiểu nút bấm, ô nhập liệu hoặc nhãn trạng thái riêng cho từng trang.
7. Nếu component hiện có gần đáp ứng nhu cầu, hãy bổ sung biến thể với lý do rõ ràng thay vì sao chép component.
8. Không chia một khối chỉ xuất hiện một lần thành quá nhiều component.

# Cách dùng AccountFooter

`AccountFooter` là footer tối giản dành cho các trang quản lý tài khoản, hồ sơ cá nhân và hồ sơ gia sư. Component đã có sẵn giao diện responsive, vì vậy trang sử dụng không cần tạo CSS footer riêng.

## 1. Thêm stylesheet dùng chung

Trong phần `<head>` của trang, thêm stylesheet sau (đường dẫn này dùng cho các trang nằm trong `ui-prototype/pages/<nhóm>/`):

```html
<link rel="stylesheet" href="../../css/components/layout/account-footer.css">
```

## 2. Chèn component ở cuối trang

Đặt markup sau ngay sau `</main>`:

```html
<footer class="account-footer" data-component="account-footer">
    <div class="container">
        <span>© 2026 Edu Connect</span>
        <span>
            <a href="#dieu-khoan">Điều khoản sử dụng</a>
            <a href="#bao-mat">Chính sách bảo mật</a>
        </span>
    </div>
</footer>
```

## 3. Quy tắc khi tái sử dụng

- Giữ nguyên hai thuộc tính `class="account-footer"` và `data-component="account-footer"` để nhận đúng style component.
- Chỉ thêm liên kết chính sách khi có trang đích thực tế.
- Không copy CSS vào `css/pages/...`; nếu cần điều chỉnh chung, sửa tại `css/components/layout/account-footer.css`.
- Nếu footer cần logo và liên kết điều hướng, dùng `UserFooter` thay vì mở rộng `AccountFooter`.

Mẫu đang được dùng tại `pages/account/profile.html` và `pages/tutor/my-profile.html`.

# Component thương hiệu

`layout/brand-masthead.html` là mẫu tiêu đề chức năng của màn tìm gia sư và tìm lớp. Component dùng token chung và HTML ngữ nghĩa, không cần JavaScript; khi chuyển sang JSP có thể tách trực tiếp markup thành fragment.

Bộ lọc responsive dùng `details` có `data-search-filters` và `js/core/search-filters.js`. Giữ `summary` làm nút mở/đóng có hỗ trợ bàn phím tự nhiên của trình duyệt.


`UserFooter` dùng bố cục gọn với thương hiệu, bản quyền và liên kết tới trang hiện có. Không thêm hotline, chứng nhận hoặc liên kết giữ chỗ vào footer.


# Xem toàn bộ component

Mở `components/index.html` để đối chiếu bảng màu, nút, biểu mẫu, trạng thái, bộ lọc, tab, upload, bảng và hộp thoại trong một trang. Bộ mẫu dùng stylesheet và JavaScript thực tế của các component, không thêm thư viện giao diện.

Không dùng dải viền màu ở cạnh thẻ, ô lựa chọn, panel, modal hay toast; không tạo lại bằng inset shadow, gradient hoặc pseudo-element. Khung giữ viền trung tính mảnh. Trạng thái chọn dùng radio/checkbox, dấu chọn, nhãn và nền; focus bàn phím vẫn được giữ.
