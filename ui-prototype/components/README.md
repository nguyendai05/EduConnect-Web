# Quy tắc xây dựng component

1. Cân nhắc chuyển component vào nhóm giao diện dùng chung khi được sử dụng trên từ hai trang trở lên.
2. Luôn tách riêng các xử lý dùng chung giữa nhiều trang.
3. Không sao chép component từ trang này sang trang khác.
4. Giữ thành phần riêng trong trang của nó nếu ít có khả năng tái sử dụng.
5. Không ghi cố định màu thương hiệu trong CSS của trang; hãy dùng các giá trị thiết kế dùng chung (design token).
6. Không tự tạo kiểu nút bấm, ô nhập liệu hoặc nhãn trạng thái riêng cho từng trang.
7. Nếu component hiện có gần đáp ứng nhu cầu, hãy bổ sung biến thể với lý do rõ ràng thay vì sao chép component.
8. Không chia một khối chỉ xuất hiện một lần thành quá nhiều component.
