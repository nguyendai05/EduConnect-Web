# Quy trình làm việc với Git

Luồng làm việc giữa các nhánh được thống nhất như sau:

```text
feature/* -> develop -> main
```

Ví dụ về tên nhánh:

- `feature/ui-foundation`
- `feature/ui-dai-auth-account`
- `feature/ui-huy-tutor-matching`
- `feature/ui-dat-job-market`
- `feature/ui-phuong-contract-payment`

## Quy tắc

- Không viết mã trực tiếp trên nhánh `main`.
- Tạo yêu cầu hợp nhất mã (pull request) vào nhánh `develop`.
- Cần có ít nhất một người rà soát mã (reviewer) trước khi hợp nhất.
- Chỉ hợp nhất `develop` vào `main` sau khi ứng dụng đã tích hợp chạy thành công.
- Không đẩy mã cưỡng bức (force-push) lên các nhánh dùng chung.
- Cập nhật nhánh `develop` mới nhất trước khi tạo nhánh tính năng mới.
