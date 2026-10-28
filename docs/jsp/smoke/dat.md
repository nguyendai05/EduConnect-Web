# Smoke JSP - Đạt

## P01 account/profile - trạng thái sau khi bỏ phần chạy preview

- Đã chuyển file JSP, JS và CSS riêng cho P01.
- Theo yêu cầu hiện tại, đã bỏ controller, cấu hình resource handler, header preview riêng và bộ kiểm thử/ảnh tạm; đã dừng server preview.
- Cú pháp JS được kiểm bằng `node --check src/main/resources/static/js/pages/account/profile.js`.
- Build chỉ chứng minh nguồn Java còn lại và đóng gói, không chứng minh JSP render thành công.

## Kết quả kiểm trước khi bỏ preview

Bản trước đã được render bằng Tomcat/Jasper qua HTTP ở root và context /educonnect; kiểm edit/save/cancel/Enter/fieldErrors, state mẫu, responsive 1440/768/390px và console/assets. Kết quả đó thuộc cấu hình preview đã xóa, không dùng để đánh dấu HTTP của cấu trúc hiện tại đã pass.

## Các phần cần kiểm sau khi nhận nền

- Đại bàn giao route/view mapping, hai fragment header/footer và CSS/assets chung.
- Bên cấp model truyền profile/formErrors/state từ request hoặc Spring model; không lấy owner từ URL.
- Khi mở qua HTTP: kiểm direct URL, refresh, #ho-so, context root và /educonnect, asset/console, tiếng Việt và responsive.
- Kiểm edit/dirty/cancel, validation/focus, bio 300 ký tự, lưu DOM có nhãn chưa lưu server, submit không gọi endpoint khi API chưa có.
- C vẫn chờ A01/A02 của Đại; chưa nghiệm thu persistence, session, quyền, lỗi API hoặc logout thật.
- P37 và các trang còn lại chưa chuyển trong lượt P01.
