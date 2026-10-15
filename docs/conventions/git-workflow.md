# Quy trình làm việc với Git

Luồng làm việc giữa các nhánh được thống nhất như sau:

```text
feature/<nhom>-<mo-ta> -> main
```

Ví dụ về tên nhánh:

- `feature/auth-validation`
- `feature/job-apply`
- `feature/tutor-profile`

## Quy tắc

- Không viết mã trực tiếp trên nhánh `main`.
- Tạo yêu cầu hợp nhất mã (pull request) vào nhánh `main`.
- Cần có ít nhất một người rà soát mã (reviewer) trước khi hợp nhất.
- Chỉ merge PR vào `main` sau khi build/test/CI tích hợp thành công.
- Không đẩy mã cưỡng bức (force-push) lên các nhánh dùng chung.
- Cập nhật `main` trước khi tạo feature/<nhom>-<mo-ta>; không sửa lịch sử nhánh chung.

## Thymeleaf foundation và PR

- Tên branch: feature/<nhom>-<mo-ta>, ví dụ feature/auth-validation hoặc feature/job-apply.
- Commit: feat(web): ..., chore(build): ..., fix(web): ...; thông điệp tiếng Anh hoặc tiếng Việt không dấu.
- PR vào main, ít nhất một reviewer; file chung cần Nguyễn Xuân Đại duyệt theo ownership.
- Build bằng wrapper, chạy test/checks; không đưa secret, JS/CSS inline hoặc sửa prototype/migration cũ.
