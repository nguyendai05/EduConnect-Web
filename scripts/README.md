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
