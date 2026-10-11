# Kiểm chứng UI và clean project — 11/10/2026

Snapshot: branch `feature/ui-dai-auth`, HEAD `08740ff453905fdd64233b4d7326cec1dca60056`. Khảo sát và sửa working tree có sẵn; không checkout, reset, commit hoặc push. Phạm vi: 40 trang HTML prototype, component/shell, script và tài liệu chạy kiểm tra; không thay backend.

## Những lỗi đã sửa

1. UserHeader nối Trang chủ vào cuối nav của trang cũ, trong khi trang mới đặt ở đầu. Markup và script đều dùng cùng thứ tự **Trang chủ → Tìm gia sư → Tin tìm gia sư** ở 23 trang; active state lấy từ trang thật, không từ thuộc tính clone.
2. Các link “Về trang chủ” và logo trên 5 trang auth trỏ tìm gia sư. Đã sửa về home.
3. Admin/manage không nạp admin-sidebar chung; các trang dùng nhãn quản lý khác nhau và badge giữ số cũ. 11 trang dùng cùng 7 mục; chi tiết chọn mục cha; sidebar/dashboard lấy số từ đúng hàng đợi và façade hồ sơ/rút tiền.
4. Header lấy vai trò từ loại trang khiến persona tutor trên home hiện như phụ huynh. Menu/danh tính dùng persona demo, có wallet cho tutor và lối vào admin. Logout admin cũng xóa phiên mẫu; lỗi storage không chuyển trang như đã thành công.
5. Report detail crash vì evidence là chuỗi nhưng renderer cần name/kind/meta; thiếu resolutions/excerpt/reference; handler nhận object kết quả như record. Đã sửa adapter, tiêu thụ result.report, giới hạn ghi chú đúng 10–600, và không fallback sang báo cáo khác khi ID sai.
6. Search/job discovery hiển thị tổng chưa lọc và đổi nút trang không đổi thẻ. Đã nối filter/sort/page/chips với cùng tập kết quả; reset page khi đổi filter, newest dùng publishedAt, giữ query từ home. Số đếm dịch vụ/lớp dùng đúng đơn vị.
7. Payment result chỉ đổi tiêu đề bằng status URL, kể cả record pending. Hiện dùng trạng thái record; verified mới hiển thị thành công, refund/expired có trạng thái riêng, query không ghi tiền; đường quay lại dùng from allowlist.

## Kiểm tra tĩnh/Node

Chạy từ root repository:

| Lệnh | Kết quả | Phạm vi |
| --- | --- | --- |
| `node scripts/checks/static-check.mjs` | PASS; 40/40 trang, 65/65 JS, FAIL0 | File/link/CSS url()/ID/ARIA/CDN; nav 23 headers và 11 sidebars; có hồi quy shape report façade. Không phải browser/E2E |
| `node scripts/checks/store-check.mjs` | 583 PASS, 0 FAIL | Store trong Node VM và storage giả cô lập; không DB/payment thật |
| `node scripts/checks/hook-check.mjs` | FAIL0 | Selector thuộc đúng script được trang nạp, gồm hook động |
| `node scripts/checks/source-check.mjs` | FAIL0 | Mã tham chiếu và nguồn dữ liệu; hai ngoại lệ có lý do là danh bạ chat và audit fixture |

Có kiểm tra hồi quy nav chạy ngoài repository: trước sửa phát hiện 20 markup thiếu Trang chủ, thứ tự runtime và identity/active sai; sau sửa không còn lỗi. Không tạo bộ test theo mỗi nút hoặc thêm dependency.

## Browser thực sự chạy

Edge, origin thử 127.0.0.1:8765, server chỉ đọc ui-prototype, Cache-Control no-store. Dữ liệu thay đổi chỉ trong tab thử của prototype.

- Mở toàn 40 trang với ID/token fixture hợp lệ trên viewport desktop mặc định (document clientWidth 1257px) và viewport 390×844 (clientWidth 375px do scrollbar). Tất cả có nội dung/heading đúng, không ảnh hỏng và không tràn ngang toàn trang.
- Lượt desktop ban đầu tìm được lỗi renderEvidence ở report-detail; đã sửa và kiểm lại bằng thao tác xử lý báo cáo. Lượt 40 trang mobile sau sửa không ghi lỗi JavaScript.
- Report RP-2026-0011: chọn phương án, nhập ghi chú mẫu, chốt → status resolved, modal đóng, nút xử lý khóa; badge reports từ2 xuống1 và danh sách unresolved có1 dòng. Đây là thao tác mẫu, không gửi thông báo bên ngoài hoặc chuyển tiền.
- Job discovery: 7 kết quả, trang1 có5 thẻ, trang2 có2 thẻ; lọc Toán còn2 kết quả và total2; bỏ chip trở lại7.
- Tutor search từ query Lê Hoàng Yến có3 dịch vụ/lớp, total3; sort mới công khai trả OF-GRP-2004 → OF-SVC-1005 → OF-GRP-2001 theo timestamp.
- Payment pending PAY-2026-0003 với status=success vẫn hiện chờ/verified=false; PAY-2026-0007 verified hiện thành công dù không truyền status.
- Login persona tutor qua form mẫu, đợi navigation hoàn tất rồi mở home: đúng Lê Hoàng Yến, menu có6 mục tutor và wallet; logout về login. Không lưu/gửi password thật.
- Thêm 18 lượt đo: 6 trang đại diện ở 320, 1024 và 1440px, không tràn ngang. Menu trên viewport thấp 390×500 nằm trong vùng nhìn thấy; prefix `/ui-prototype/` vẫn sinh link đúng. Viewport override đã được reset.
- Keyboard thật: ArrowDown mở menu và focus mục0 ngay, ArrowDown tiếp theo tới mục1; Escape đóng và trả focus về nút tài khoản. Đã sửa thứ tự hiện menu/focus để CSS visibility không chặn focus.

Các phép đo breakpoint, keyboard, prefix deployment bổ sung và ảnh minh chứng được lưu ngoài repository tại `C:/Users/Dizan/.codex/visualizations/2026/10/10/01a12658-af5e-7631-8b30-535a12cbeee4/cleanup-20261011/`. Chỉ ghi kết quả của các phép thử thực sự chạy; không dùng lại số pass trong nhật ký agent cũ.

## Clean và bảo toàn

- Xóa target/ gồm154 file build, 196.887.112 bytes; file tham khảo Tailwind không được trang/JS/CSS sử dụng; script inject-shared chạy một lần; 4 log evidence cũ. Tổng khoảng187,8MiB, không xóa src, 40 trang, asset thương hiệu hoặc dữ liệu mẫu.
- Giữ 4 kiểm thử hồi quy và chuyển về scripts/checks, chỉnh ROOT và README/lệnh chạy. Không coi test còn hữu ích là rác.
- Nhật ký QA dài được thay bằng báo cáo hiện tại này. Bản gốc và baseline 451 file đã được sao lưu ngoài repository trước sửa; audit/phân công và prompt trước đây vẫn giữ nguyên.
- Giữ .git, .idea, .codegraph, WIP có sẵn. Tệp kiểm tra tạm/ảnh/JSON kết quả không đặt trong project.
- Đối chiếu hash baseline 451 file: không thay `src`, `pom.xml`, các báo cáo audit hoặc prompt cũ; chỉ thay UI/tài liệu chạy kiểm tra và di chuyển/xóa các tệp đã phân loại. Tổng xóa160 file artefact, 196.953.904 bytes; 4 test được di chuyển, không bị xóa.

## Giới hạn

Đây là prototype UI; chưa có API/auth/phân quyền/database/PayOS/email thật. Tutor review/payout vẫn có collection mẫu riêng; nav/dashboard đọc cùng façade nhưng việc hợp nhất domain với backend thuộc giai đoạn sau. Chưa nghiệm thu Safari/iOS/thiết bị thật, chưa đo coverage tổng thể hoặc toàn bộ 23 nghiệp vụ end-to-end. Maven không có trên PATH, backend source không thay và không chạy build Java. Không dùng build/static pass làm bằng chứng nghiệp vụ đã hoàn thành.
