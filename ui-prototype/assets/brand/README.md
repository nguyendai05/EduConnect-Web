# Logo Edu Connect

Logo hai người đồng hành được vector hóa từ bộ PNG do người dùng cung cấp trong `C:\Users\Dizan\Downloads\logo`. File bảng giới thiệu 1–2 chỉ dùng để đối chiếu; file 3 cung cấp phần chữ, file 4 cung cấp biểu tượng chính và file 7 cung cấp biểu tượng tối ưu cho favicon.

Các SVG chứa đường vector và hình tròn thật, không nhúng ảnh hoặc dùng font bên ngoài. Phần chữ được chuyển thành outline. Viền alpha và chi tiết nhiễu của PNG đã được làm sạch; mảng màu dùng xanh thông `#1D4B40`, đất nung `#AD532A`. Phiên bản trắng được tạo từ cùng hình học với bản màu.

| File | Cách dùng |
| --- | --- |
| `logo-horizontal.svg` | Logo chính trên header nền sáng |
| `logo-horizontal-mono.svg` | Logo ngang một màu xanh thông |
| `logo-horizontal-white.svg` | Logo ngang trắng trên footer và sidebar nền tối |
| `logo-mark.svg` | Biểu tượng hai màu, không có chữ |
| `logo-mark-mono.svg` | Biểu tượng một màu |
| `logo-mark-white.svg` | Biểu tượng trắng |
| `favicon.svg` | Favicon vector, hai màu trên nền sáng và tự chuyển trắng theo giao diện tối của trình duyệt |
| `favicon.ico` | Favicon dự phòng, chứa 16, 24, 32, 48, 64, 128, 256px |
| `favicon-32.png` | Favicon PNG 32px |
| `apple-touch-icon.png` | Biểu tượng 180px, có nền giấy và khoảng trống |
| `logo-horizontal.png`, `logo-horizontal-white.png` | Bản PNG ngang nền trong suốt, rộng 1600px |
| `logo-mark.png`, `logo-mark-white.png` | Bản PNG biểu tượng nền trong suốt, 512px |

`../icons/logo.svg` giữ cùng biểu tượng với `logo-mark.svg` để tương thích với đường dẫn logo cũ. Nếu thay hình học biểu tượng, cần cập nhật hai file này cùng nhau.

Header dùng logo ngang rộng 208px trên desktop, 168px trên mobile. Sidebar quản trị dùng bản trắng rộng 140px; footer dùng bản trắng rộng 184px. Giữ đúng tỷ lệ; không ép logo ngang vào khung vuông. Favicon chỉ dùng biểu tượng, không dùng phần chữ.

Khi chuyển sang JSP, sao chép bộ file này vào tài nguyên static và đổi tiền tố URL theo context path của ứng dụng. Logo không cần JavaScript hoặc font được tải qua mạng.
