> Thư mục này là tham chiếu đóng băng; không sửa để phát triển ứng dụng. Nguồn chính nằm ở `src/main/resources/` (Thymeleaf và static).

# Bản mẫu giao diện

Thư mục bản mẫu là nơi xây dựng các thành phần giao diện có thể tái sử dụng, không phụ thuộc framework, trước khi tích hợp JSP.

```text
Thiết kế tham khảo
  -> Giá trị thiết kế dùng chung (Design Token)
  -> Component giao diện dùng chung
  -> Component nghiệp vụ
  -> Trang giao diện
  -> Mảnh giao diện JSP (JSP Fragment) / Trang JSP
```

Các tệp HTML trên Google Drive không phải mã nguồn của ứng dụng chính thức. Có thể tham khảo bố cục, kiểu chữ, component, khoảng cách, nội dung và trạng thái giao diện trong các tệp này, nhưng không được sao chép nguyên tệp vào kho mã nguồn.

Xây dựng các thành phần cơ bản dùng chung trước, tiếp đến là component nghiệp vụ, cuối cùng mới ghép thành các trang. CSS dùng chung được đặt trong `css/components/`, xử lý JavaScript dùng chung được đặt trong `js/core/`, còn tài nguyên riêng của từng trang được đặt trong thư mục tính năng tương ứng thuộc `css/pages/` hoặc `js/pages/`.

## Hàng đợi duyệt tin tìm gia sư

Trang `pages/admin/job-review-queue.html` tham chiếu thiết kế số 40, ghép AdminShell, AdminHeader, AdminSidebar, Table, Badge, Pagination, SearchInput, Select, Tabs, StatCard, Loading và EmptyState dùng chung. CSS riêng chỉ tổ chức bố cục trang; các biến thể bảng kiểm duyệt và select native nằm trong CSS component.

Trang sử dụng dữ liệu mẫu chung trong `js/pages/admin/job-review-data.js`, hỗ trợ tìm kiếm không dấu theo mã tin, tiêu đề, người đăng, môn/lớp và khu vực; lọc trạng thái, dấu hiệu rà soát, môn học; sắp xếp, phân trang, làm mới. Liên kết Xem chi tiết mở `admin/job-review-detail.html?id=<mã-tin>`.

Pagination giữ nguyên markup cũ và bổ sung hai sự kiện: `pagination:update` nhận `{ total, pageSize, current }` khi dữ liệu đổi; `pagination:change` trả `{ page, pageSize, total }` khi người dùng chuyển trang. Slot `data-page-numbers` bật sinh số trang tự động, không cần viết lại phân trang trong từng trang.

## Chi tiết duyệt tin tìm gia sư

Trang `pages/admin/job-review-detail.html` tham chiếu thiết kế số 34, hiển thị người đăng, mô tả, môn/lớp, lịch học, hình thức, khu vực, ngân sách, yêu cầu gia sư và nội dung cần rà soát. Trang dùng chung Card, Avatar, InfoRow, Badge, Alert, Modal, Textarea, Button, Toast và Admin shell.

Duyệt tin cần xác nhận trong Modal rồi chuyển trạng thái sang Đang tuyển. Từ chối tin cần lý do từ 10 đến 1000 ký tự, có mẫu lý do để chọn nhanh. Kết quả và lý do được lưu trong `sessionStorage` với khóa `educonnect:job-review-decisions:v1`, đồng bộ khi quay lại hoặc làm mới hàng đợi. Tin đã xử lý không thể duyệt/từ chối lần nữa trong prototype. Nếu lưu thất bại, trạng thái giữ nguyên và hiển thị phản hồi lỗi để thử lại. Chưa gọi API, gửi thông báo thực tế, tạo hợp đồng hoặc thu phí.

Chạy từ thư mục gốc của project để xem hai trang trên cùng origin:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory ui-prototype
```

Mở `http://127.0.0.1:8765/pages/admin/job-review-queue.html` hoặc `http://127.0.0.1:8765/pages/admin/job-review-detail.html?id=TT-8841`. Đóng phiên tab hoặc xóa khóa lưu nói trên để dùng lại trạng thái mẫu ban đầu.

## Bảng điều khiển và các trang quản trị còn lại

Khu vực quản trị có mười trang dùng chung AdminShell, AdminHeader và AdminSidebar; nhãn số trên sidebar giống nhau ở cả mười trang và khớp với số bản ghi chờ xử lý của từng hàng đợi.

| Thiết kế | Trang |
| --- | --- |
| 32 Tổng quan | `admin/dashboard.html` |
| 39 và 33 Duyệt gia sư | `admin/tutor-review-queue.html`, `admin/tutor-review-detail.html` |
| 40 và 34 Duyệt tin | `admin/job-review-queue.html`, `admin/job-review-detail.html` |
| 37 và 38 Rút tiền | `admin/payout-requests.html`, `admin/payout-request-detail.html` |
| 35 và 36 Báo cáo và tranh chấp | `admin/reports.html`, `admin/report-detail.html` |
| 41 Nhật ký hệ thống | `admin/audit-logs.html` |

Mỗi cặp trang danh sách - chi tiết dùng chung dữ liệu mẫu trong `js/pages/admin/<nghiệp-vụ>-data.js` và lưu quyết định xử lý vào `sessionStorage` theo khóa `educonnect:<nghiệp-vụ>-decisions:v1`, nên duyệt ở trang chi tiết sẽ phản ánh ngay vào bộ đếm của hàng đợi. Trang danh sách có tìm kiếm không dấu, bộ lọc, sắp xếp, phân trang cùng trạng thái đang tải và trạng thái trống; trang chi tiết đọc tham số `id`, báo rõ khi mã không hợp lệ, xác nhận mọi thao tác đổi trạng thái bằng Modal và giữ nguyên trạng thái nếu lưu thất bại.

Rút tiền áp quy tắc hai bước: duyệt chỉ ủy quyền, sau đó mới xác nhận đã chuyển khoản; thao tác duyệt bị khóa cho tới khi tích xác nhận đối chiếu. Báo cáo và tranh chấp chỉ kết luận một lần, lý do hoặc ghi chú xử lý phải dài từ 10 đến 1000 ký tự. Nhật ký hệ thống không lưu mật khẩu, token, số định danh hay số điện thoại đầy đủ, các trường nhạy cảm hiển thị dạng đã che.

Trang tổng quan dùng thẻ chỉ số và biểu đồ dựng bằng CSS thuần, có mô tả chữ cho từng biểu đồ; chưa thêm thư viện biểu đồ nào.

## Điều hướng giữa các trang

Mọi lượt chuyển trang dùng `<a href>` thật; `<button>` chỉ còn cho lọc, mở menu, modal và đổi trạng thái. Prototype không có trang chủ, nên thương hiệu ở đầu trang trỏ theo vai trò đang hiển thị: trang phía người dùng về `tutor/search.html`, trang phía gia sư về `job/discover.html`, trang quản trị về `admin/dashboard.html`. Khu người dùng và khu quản trị không liên kết chéo, ngoại trừ đăng xuất về trang đăng nhập.

Bảng tham số mà trang đích thực sự đọc:

| Trang đích | Tham số | Nguồn liên kết |
| --- | --- | --- |
| `tutor/profile.html` | `id` | danh sách tìm gia sư, danh sách ứng viên |
| `invitation/create.html` | `tutor` | trang hồ sơ gia sư |
| `invitation/negotiation.html` | `invite` | biểu mẫu mời sau khi xác nhận gửi |
| `contract/confirm.html` | `contract` | thương lượng lời mời, chọn gia sư cho tin |
| `payment/checkout.html` | `contract`, `from` (`contract` hoặc `contract-detail`) | xác nhận hợp đồng, chi tiết hợp đồng |
| `payment/qr.html` | `contract` | thanh toán |
| `payment/result.html` | `status`, `id` | mã QR |
| `contract/student-detail.html`, `contract/tutor-detail.html` | `id` | kết quả thanh toán, tin nhắn, ví |
| `chat/messages.html` | `contract` | trang hồ sơ, trang hợp đồng |
| `wallet/overview.html#transactions` | anchor | menu tài khoản |
| `tutor/my-profile.html#lich-ranh` | anchor | menu tài khoản của gia sư |
| `admin/*-queue`, `admin/reports`, `admin/payout-requests` | `status` | thẻ trên `admin/dashboard.html` |
| `admin/audit-logs.html` | `module` | thẻ trên `admin/dashboard.html` |

Mã không tồn tại trong dữ liệu mẫu phải hiển thị trạng thái "không tìm thấy" kèm đường quay lại trang danh sách; trang đích không được âm thầm thay bằng một bản ghi khác. Ở `admin/reports.html`, giá trị `status=unresolved` gộp hai trạng thái chưa kết luận nên bỏ chọn mọi thẻ và đặt `aria-label` riêng cho vùng kết quả.

Chạy bản mẫu: `python -m http.server 8765 --bind 127.0.0.1 --directory ui-prototype` từ thư mục gốc project. Mỗi lần sửa CSS hoặc JS dùng chung, nạp lại trang ở chế độ không dùng cache hoặc mở một ngữ trình duyệt cô lập, vì trình duyệt có thể giữ bản CSS cũ và khiến liên kết vừa sửa trông như không có tác dụng.


## Thiết kế học thuật hiện đại

Xem [hướng thiết kế và cách chuẩn bị cho JSP](../docs/ui/redesign.md). Các trang dùng chung token xanh mực, nền giấy ấm và kiểu chữ hệ thống; các màn tìm kiếm và xác thực ưu tiên chức năng chính. [Bộ logo và favicon](assets/brand/README.md) dùng SVG vector thật, có bản màu, một màu và trắng cho các nền tương ứng.

Tiêu đề không có gạch trang trí hoặc nhãn nhỏ lặp lại tên trang. Breadcrumb chỉ xuất hiện khi có liên kết điều hướng tới trang cha. Mô tả đầu trang chỉ giữ thông tin cần cho bản ghi hoặc thao tác, không diễn giải lại tiêu đề.

Bộ lọc mở trên desktop và thu gọn ở chiều rộng ≤64rem. Các khối minh họa trạng thái đã được bỏ khỏi trang sản phẩm. Điều hướng người dùng và quản trị vẫn hiển thị ở màn hình nhỏ.

## Bố cục responsive

Header hai hàng, bộ lọc và thanh điều hướng quản trị dùng cùng ngưỡng 64rem. Cỡ chữ control là 16px ở ngưỡng này; chiều cao header và khoảng dừng khi nhảy đến anchor lấy từ token chung. Bảng rộng cuộn trong vùng bảng, không làm tràn toàn trang.

Chat chuyển giữa danh sách và hội thoại ở ≤48rem; khung chat tính theo chiều cao viewport và header. Rail tóm tắt và thao tác trở về luồng thường khi gộp cột; khi sticky, chiều cao được giới hạn để nút cuối vẫn truy cập được. Hàng đợi cần xử lý trên dashboard quản trị nằm ngay dưới tiêu đề.

Xem [phạm vi và kết quả kiểm tra responsive](../docs/ui/responsive-qa.md).

## Bộ prototype 40 trang

Prototype hiện có **40 trang sản phẩm** dưới `pages/` (31 trang có sẵn + 9 trang thêm mới: `home`, `auth/verify-email`, `auth/forgot-password`, `auth/reset-password`, `catalog/detail`, `cart/index`, `order/history`, `tutor/manage`, `admin/manage`). `components/index.html` là trang trưng bày component, **không tính** vào 40 trang sản phẩm.

Danh sách đầy đủ kèm vai trò, tham số URL, mã BB/TC và luồng: [`docs/ui/qa/20261010-2340/01-PAGE-INVENTORY.md`](../docs/ui/qa/20261010-2340/01-PAGE-INVENTORY.md).

### Cách chạy

Dùng server tĩnh có sẵn, không cần cài thêm gì. Cả hai cách đều hoạt động vì `js/core/route.js` tự suy ra gốc prototype từ chính thẻ `<script>` đang nạp, không giả định server luôn phục vụ root `/ui-prototype` hay luôn root `/`:

```bash
# Cách 1 — phục vụ từ repo root, URL có tiền tố /ui-prototype/
python3 -m http.server 8123 --bind 127.0.0.1
#   http://127.0.0.1:8123/ui-prototype/pages/home.html

# Cách 2 — phục vụ thẳng thư mục ui-prototype
python3 -m http.server 8765 --bind 127.0.0.1 --directory ui-prototype
#   http://127.0.0.1:8765/pages/home.html
```

Trên Windows có thể `python` bị chặn quyền trong venv của công cụ khác; khi đó dùng `python3`.

`pages/home.html` nằm **nông hơn** các trang trong `pages/<module>/` một cấp, nên đường dẫn trong file này dùng một cấp `../`, còn các trang con dùng hai cấp `../../`. `route.js` chuẩn hoá cả hai về đúng độ sâu khi chạy (idempotent), vì vậy không được copy `../../` từ trang con sang `home.html`.

### Tham số URL đang dùng

| Trang | Tham số |
| --- | --- |
| `tutor/profile.html` | `id` |
| `tutor/search.html` | `q` |
| `tutor/my-profile.html` | `#lich-ranh` |
| `tutor/manage.html` | `tab=services\|classes\|orders\|revenue` |
| `invitation/create.html` | `tutor`, `offering` |
| `invitation/negotiation.html` | `invite` |
| `job/detail.html`, `job/applicants.html` | `id` (mã tin dạng `TT-*`) |
| `catalog/detail.html` | `id` (`OF-SVC-*` hoặc `OF-GRP-*`) |
| `cart/index.html` | không nhận tham số — **không** lấy giá từ query |
| `order/history.html` | `status`, `channel`, `id` (mở chi tiết) |
| `contract/confirm.html` | `contract`, `order` |
| `contract/student-detail.html`, `contract/tutor-detail.html` | `id` |
| `payment/checkout.html` | `contract`, `from` (allowlist), `order`, `payment` |
| `payment/qr.html` | `contract`, `payment` |
| `payment/result.html` | `status`, `id`, legacy `view`, `payment` |
| `wallet/overview.html` | `#transactions` |
| `auth/verify-email.html`, `auth/reset-password.html` | `token` (chỉ token **DEMO**) |
| `auth/login.html` | `state` |
| `admin/manage.html` | `tab=users\|offerings\|orders` |
| admin queue / reports / payouts | `status` |
| `admin/*-detail.html` | `id` |
| `admin/audit-logs.html` | `module` |
| `chat/messages.html` | `contract`, `tutor` |

Tham số ngoài danh sách cho phép được báo rõ trên trang và đưa về trạng thái hợp lệ, không âm thầm bỏ qua. `from`/return route đi qua allowlist `EduRoute.RETURN_ALLOWLIST` để tránh open redirect. ID sai hoặc thiếu hiển thị empty/error kèm đường quay lại, **không** tự thay bằng bản ghi khác.

### Dữ liệu mẫu và trạng thái demo

Một nguồn chuẩn duy nhất cho mỗi thực thể:

| File | Global | Vai trò |
| --- | --- | --- |
| `js/data/fixtures.js` | `EduFixtures` | Thực thể và quan hệ, chỉ đọc |
| `js/data/store.js` | `EduStore` | Store có version, đọc/ghi kiểm soát, state machine, helper tiền/ID/format |
| `js/core/route.js` | `EduRoute` | Sổ đăng ký 40 tuyến + resolver base path |
| `js/core/charts.js` | `EduChart` | `bar()` và `pie()` dùng chung cho dashboard và tutor/manage |

Thứ tự nạp bắt buộc (các script đều `defer`, chạy theo thứ tự trong tài liệu):

```
route.js -> fixtures.js -> store.js -> charts.js -> core/<component>.js -> pages/<page>.js
```

Khóa `sessionStorage`:

| Khóa | Version | Nội dung |
| --- | --- | --- |
| `educonnect:demo-store:v4` | 4 | Toàn bộ state đột biến được |
| `educonnect:session:v1` | — | Persona demo đang đăng nhập |
| `educonnect:cart:v1` | 1 | Giỏ đăng ký |
| `educonnect:idempotency:v1` | — | Khóa chống bấm lặp |
| `educonnect:auth-notice:v1` | — | Cờ thông báo giữa `reset-password` và `login` (không chứa mật khẩu) |
| `educonnect:tutor-review-decisions:v1`, `educonnect:payout-decisions:v1` | 1 | Quyết định của hai façade preview riêng; job/report hiện dùng EduStore |

**Phạm vi persistence:** `sessionStorage` chỉ đồng bộ trong **cùng một tab và cùng origin**. Không đồng bộ nhiều tab, nhiều tài khoản, nhiều thiết bị hay server. Đóng tab là mất trạng thái mẫu.

Đổi persona demo để xem theo vai trò (không phải đăng nhập thật): mở console của trang bất kỳ đã nạp store rồi chạy `EduStore.setSession('TUTOR-01')` (gia sư đã duyệt) · `'TUTOR-02'` (gia sư **chưa duyệt**, để kiểm UI gate) · `'PARENT-01'` · `'STUDENT-01'` · `'ADMIN-01'`, sau đó reload. `EduStore.logout()` để xóa phiên. Xóa key `educonnect:demo-store:v4` chỉ đặt lại store. Nếu cần đặt lại toàn bộ dữ liệu preview của dự án (persona, cart, quyết định), chỉ xóa các key có tiền tố `educonnect:`; **không** dùng `sessionStorage.clear()` xóa dữ liệu của origin.

Token demo cho luồng xác thực: `DEMO-VERIFY-VALID` / `-EXPIRED` / `-USED`, `DEMO-RESET-VALID` / `-EXPIRED` / `-USED`. Email demo dùng domain `.test`. Không có email nào được gửi đi.

### Những gì CHƯA phải backend

Prototype **chưa có** backend. Cụ thể:

- Chưa có API, controller, service, entity, security, database, migration.
- Chưa có xác thực thật: đăng nhập/đăng xuất chỉ đổi persona demo trong `sessionStorage`. Việc một trang chỉ hiển thị dữ liệu của một persona **không phải** bằng chứng phân quyền — server authorization là việc khác.
- Chưa có giao dịch thật: QR là DEMO không có payload ngân hàng dùng được, không có link thanh toán thật, không chuyển tiền hay hoàn tiền thật. `?status=success` trên `payment/result.html` chỉ chọn cách hiển thị, **không** làm thay đổi số dư.
- Chưa gửi email, chưa tạo tài khoản thật, chưa ghi vào database.
- `DEMO_FEE_RATE = 0.10` và chính sách hoàn tiền là **giả định demo chưa được nhóm chốt**, không phải policy production.
- BS01–BS09 chưa được giao: chưa có chat realtime, rút tiền ngân hàng, tự giải ngân theo lịch, tự hủy lớp thiếu sĩ số.

Ánh xạ frontend → API **đề xuất** cho giai đoạn tích hợp: [`docs/ui/qa/20261010-2340/03-DATA-VA-BAN-GIAO.md`](../docs/ui/qa/20261010-2340/03-DATA-VA-BAN-GIAO.md) §8.

### Kiểm tra

```bash
node scripts/checks/static-check.mjs   # trang, cú pháp JS, href/src, CSS url(), ID trùng, aria ref, CDN
node scripts/checks/store-check.mjs     # 583 kiểm tra dữ liệu mẫu cô lập
node scripts/checks/hook-check.mjs      # selector đúng HTML/script của trang
node scripts/checks/source-check.mjs    # tham chiếu và nguồn dữ liệu
```

Kết quả và giới hạn kiểm chứng browser/responsive: [`docs/ui/qa/20261010-2340/02-UI-QA.md`](../docs/ui/qa/20261010-2340/02-UI-QA.md).

## Điều hướng và project sau clean — 11/10/2026

Nav người dùng thống nhất: **Trang chủ → Tìm gia sư → Tin tìm gia sư**. Cùng thứ tự ở 23 trang có UserHeader, kể cả trước khi JavaScript chạy. Menu lấy persona đang mở; liên kết về trang chủ ở năm trang auth dẫn `pages/home.html`.

11 trang admin có cùng bảy mục: Tổng quan, Quản lý nền tảng, Hồ sơ gia sư, Tin tìm gia sư, Báo cáo & tranh chấp, Yêu cầu rút tiền, Nhật ký hệ thống. Trang chi tiết chọn mục cha; badge và dashboard đọc cùng hàng đợi và quyết định đã lưu.

Bộ lọc/sắp xếp/phân trang của hai trang tìm kiếm sử dụng cùng tập kết quả. Trang tìm gia sư hiển thị dịch vụ/lớp của gia sư nên số đếm dùng đúng đơn vị đó. Kết quả thanh toán hiển thị trạng thái bản ghi mẫu; `status=success` không biến phiên đang chờ thành thành công.

Các kiểm thử hồi quy nằm tại `scripts/checks/`. `target/`, script inject chạy một lần, log evidence cũ và tệp tham khảo Tailwind không dùng đã được dọn. Bản sao trước khi sửa được lưu ngoài repository; không xóa mã nguồn, trang mới, bộ thương hiệu hay báo cáo audit.
