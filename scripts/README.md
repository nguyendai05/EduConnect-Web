# Kiểm tra prototype

Chạy từ root repository bằng Node.js đang có trên máy; không cần cài package:

```powershell
node scripts/checks/static-check.mjs
node scripts/checks/store-check.mjs
node scripts/checks/hook-check.mjs
node scripts/checks/source-check.mjs
```

- `static-check`: 40 trang, cú pháp JS, link/asset/CSS url(), ID/ARIA và thứ tự nav/header/sidebar.
- `store-check`: các bất biến và thao tác trên dữ liệu mẫu cô lập trong Node VM; không gọi DB hay thanh toán.
- `hook-check`: đối chiếu selector với đúng HTML và script mà trang thực sự nạp, gồm hook được tạo động.
- `source-check`: phát hiện mã tham chiếu không tồn tại và nguồn dữ liệu trang bị nhân đôi.

Đây là các kiểm thử hồi quy, không thay cho việc kiểm tra browser. Script chèn mã chạy một lần và log cũ đã được dọn. Kết quả UI hiện tại nằm trong `docs/ui/qa/20261010-2340/02-UI-QA.md`.

## Thymeleaf foundation

```powershell
.\mvnw.cmd -B -ntp clean verify
node scripts/checks/template-check.mjs
node scripts/checks/route-check.mjs
node scripts/checks/database-static-check.mjs
```

- `template-check`: kiểm asset template, preview scripts, link URL sạch và không có namespace Thymeleaf trong JS/CSS. Không xem `width:`/`path:` là namespace `th:`.
- `route-check`: giữ API router, query/anchor, context path và không sửa URL trong DOM.
- `PagesSmokeTest`: đọc `pages.csv`, kiểm view/UTF-8, tài nguyên và thứ tự CSS/JS/head/body.
- `PreviewDisabledTest`: cả 40 trang bỏ script preview khi cấu hình preview tắt.
- `SecurityPermitAllTest`: GET công khai, meta CSRF, POST thiếu CSRF bị chặn.

Sau khi thêm trang vào `src/test/resources/pages.csv`, cập nhật oracle từ prototype đóng băng khi có nguồn tham chiếu phù hợp:

```powershell
node scripts/checks/generate-page-assets.mjs
```

Không sửa prototype để làm test xanh; trang mới sau đợt migration phải bổ sung asset contract đã review tương ứng. BEM class `__` được giữ, test chỉ cấm biểu thức preprocessing chưa xử lý. Các check prototype phía trên vẫn chạy trên nguồn tham chiếu đóng băng.
