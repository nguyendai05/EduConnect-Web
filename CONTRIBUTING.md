# Đóng góp EduConnect

Đọc [ownership](docs/architecture/ownership.md), [Git workflow](docs/conventions/git-workflow.md) và [cấu trúc Thymeleaf](docs/architecture/thymeleaf-structure.md) trước khi sửa.

Tạo feature/<nhom>-<mo-ta>, chỉ sửa file thuộc phạm vi mình; PR vào main, ít nhất một reviewer. File chung cần Nguyễn Xuân Đại duyệt. Không sửa prototype/DB nền, không commit bí mật và không viết JS/CSS inline vào template.

Chạy .\mvnw.cmd -B -ntp clean verify và các checks trong [scripts/README](scripts/README.md). Dùng Maven Wrapper; chưa cần DB cho ui-preview. Không force-push nhánh chung.
