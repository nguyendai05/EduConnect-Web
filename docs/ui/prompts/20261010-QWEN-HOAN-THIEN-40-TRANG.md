# Prompt cho Qwen: hoàn thiện đủ trang Edu Connect và đồng bộ prototype

Bạn đang làm việc trong repository Edu Connect tại:

`D:/project ca nhan/TMDT-WEB`

Hãy **thực hiện việc cập nhật mã giao diện**, không chỉ trả lời bằng kế hoạch. Hoàn thiện bộ prototype gồm **31 trang hiện có + 9 trang còn thiếu**, đồng bộ thiết kế, component, navigation, tham số URL, dữ liệu mẫu, trạng thái và các luồng thao tác. Tiếp tục cho đến khi đủ các kết quả và kiểm tra được quy định bên dưới. Nếu môi trường chặn một loại kiểm chứng, ghi đúng giới hạn và làm tiếp các phần không bị chặn.

## 1. Mục tiêu và giới hạn công việc

### Phải làm

1. Khảo sát working tree hiện tại trước khi sửa. Snapshot audit tham chiếu là branch `feature/ui-dai-auth`, HEAD `08740ff453905fdd64233b4d7326cec1dca60056`; **không mặc định workspace vẫn giống snapshot**.
2. Giữ và hoàn thiện 31 trang hiện có; bổ sung 9 trang được liệt kê ở mục3. Nếu một trang đã được người khác tạo sau audit, hoàn thiện chính trang đó, không tạo bản trùng.
3. Thêm các tab/modal/section còn thiếu vào trang phù hợp. Không tạo một page riêng cho từng mã BB/TC.
4. Đồng bộ dữ liệu và trạng thái mẫu xuyên trang: chọn dịch vụ/lớp → giỏ → đơn đăng ký → hợp đồng → thanh toán mẫu → lịch sử/ví → review/report/cancel → quản trị/thống kê tương ứng.
5. Giữ nguyên ngôn ngữ thiết kế và khả năng responsive/accessibility hiện có.
6. Kiểm tra file, liên kết, ID, tham số, dữ liệu, thao tác và responsive. Viết tài liệu kết quả mới, phân biệt kiểm tra tĩnh, kiểm chứng browser và phần bị chặn.

### Phạm vi là prototype UI

- Công nghệ hiện tại: HTML/CSS/JavaScript thuần. Không thêm React/Vue/Next, Tailwind CDN, bundler, package manager hoặc thư viện UI/chart chỉ để làm nhiệm vụ này.
- Backend hiện có chỉ là skeleton Spring Boot. **Không triển khai Java/controller/service/entity/security/database/migration/PayOS/email/JSP trong lượt này.** Các API/DTO/route server trong audit là đề xuất cho giai đoạn tích hợp sau.
- Không tạo API giả bằng server trả thành công để tuyên bố đã có backend. Không dùng request mạng tới dịch vụ thật.
- Tạo trải nghiệm mẫu đầy đủ và nhất quán, nhưng không tuyên bố xác thực, bảo mật, quyền sở hữu, giao dịch hay persistence server đã được triển khai.
- Không gửi email, tạo tài khoản thật, chuyển tiền, hoàn tiền thật hoặc ghi vào database.
- BS01–BS09 chưa được giao triển khai. Không thêm chat realtime, rút tiền ngân hàng, tự giải ngân theo lịch, tự hủy lớp thiếu sĩ số hoặc tính năng bổ sung chưa duyệt. Giữ UI đã có. Kiểm tra capacity, trạng thái, hủy đơn/hoàn tiền **mô phỏng** và payment cơ bản thuộc luồng BB/TC vẫn phải thể hiện.
- Không mở Google Docs hoặc dịch vụ bên ngoài để tìm thêm yêu cầu. Tài liệu audit local đủ cho phạm vi này; bản online trước đó chưa được đối chiếu.

## 2. Đọc trước khi sửa và bảo toàn công việc đang làm

Đọc hướng dẫn AGENTS.md áp dụng trong workspace và các file sau:

- `README.md`, `ui-prototype/README.md`.
- `docs/ui/redesign.md`, `docs/ui/responsive-qa.md`, `docs/ui/page-map.md`, `docs/ui/component-inventory.md`.
- `docs/conventions/coding-convention.md`.
- `ui-prototype/components/README.md`, `ui-prototype/js/core/README.md`, `ui-prototype/css/components/README.md`.
- `ui-prototype/css/tokens.css`, `base.css`, `layouts.css`.
- `ui-prototype/assets/brand/README.md` và các component/shell đang được dùng thật.
- Bốn báo cáo trong `docs/audit-phan-cong/20261010-2214/`:
  - `01-HIEN-TRANG-VA-TRANG-CAN-LAM.md`.
  - `02-DOI-CHIEU-23-CHUC-NANG.md`.
  - `03-PHAN-CONG-CHI-TIET-DE-XUAT.md`.
  - `04-PHU-THUOC-VA-HOP-DONG-DUNG-CHUNG.md`.

Các báo cáo là bằng chứng/phân công/đề xuất trên snapshot. Nếu code hiện tại khác báo cáo, khảo sát lại và ghi chênh lệch; không sửa code về bản cũ chỉ để khớp audit. Phạm vi triển khai trong **prompt này** là UI prototype, không toàn bộ backend trong các gói phân công audit.

Trước khi sửa:

1. Ghi root, branch, HEAD, Git status. Workspace đã có nhiều file WIP; không checkout/reset/clean/pull/merge/commit/push và không hủy thay đổi có sẵn.
2. Lưu danh sách file và baseline diff/hash tại vị trí tạm bền vững trong môi trường được phép; xác nhận có thể đọc lại giữa các lượt lệnh. Nếu không, dùng phương pháp đối chiếu khác và ghi giới hạn, không báo hash pass khi baseline đã mất.
3. Lập danh sách trang/file hiện có và các liên kết/handler/dataset cần sửa. Dùng CodeGraph cho câu hỏi cấu trúc khi công cụ và index có sẵn; HTML/CSS và chi tiết IIFE không được index trả về thì đọc file cụ thể. Không khẳng định một page không tồn tại chỉ vì index không có HTML.
4. Đọc component API trước khi dùng. Không đổi tên class, `name`, `id`, `data-*`, event hoặc API dùng chung nếu chưa cập nhật tất cả caller liên quan.

Phạm vi file được cập nhật:

- `ui-prototype/pages/`, `css/pages/`, `js/pages/`.
- `ui-prototype/components/`, `css/components/`, `js/core/` khi cần dùng chung thật.
- Một vùng dữ liệu mẫu dùng chung trong `ui-prototype/js/`, với ranh giới rõ và ít module cần thiết.
- `ui-prototype/README.md`, `docs/ui/page-map.md`, `docs/ui/component-inventory.md`: cập nhật đúng thực tế, giữ nội dung hợp lệ trước đó.
- Tài liệu kiểm tra/bàn giao **mới** dưới `docs/ui/qa/<YYYYMMDD-HHMM>/`.

Không sửa `src/`, `pom.xml`, cấu hình IDE/Git, các báo cáo audit cũ hoặc ghi đè `docs/ui/responsive-qa.md` đang có. Không chỉnh logo/bộ asset nhận diện. CSS foundation chỉ chỉnh khi thật sự cần và có kiểm tra hồi quy; ưu tiên dùng token/component hiện hữu.

## 3. Danh mục trang bắt buộc

### 3.1. Giữ 31 trang hiện có

Tất cả dưới `ui-prototype/pages/`:

| Nhóm | Trang phải giữ |
| --- | --- |
| Auth | `auth/login.html`, `auth/register.html` |
| Account | `account/profile.html` |
| Tutor | `tutor/search.html`, `tutor/profile.html`, `tutor/my-profile.html` |
| Invitation | `invitation/create.html`, `invitation/negotiation.html` |
| Job | `job/create.html`, `job/my-job.html`, `job/discover.html`, `job/detail.html`, `job/applicants.html` |
| Contract | `contract/confirm.html`, `contract/student-detail.html`, `contract/tutor-detail.html` |
| Payment | `payment/checkout.html`, `payment/qr.html`, `payment/result.html` |
| Wallet | `wallet/overview.html` |
| Chat | `chat/messages.html` |
| Admin | `admin/dashboard.html`, `admin/tutor-review-queue.html`, `admin/tutor-review-detail.html`, `admin/job-review-queue.html`, `admin/job-review-detail.html`, `admin/reports.html`, `admin/report-detail.html`, `admin/payout-requests.html`, `admin/payout-request-detail.html`, `admin/audit-logs.html` |

Không đổi tên các trang hiện có. Các component showcase không được cộng vào số trang sản phẩm. Không xóa page ngoài danh sách nếu sau audit có thêm page hợp lệ.

### 3.2. Bổ sung 9 trang

| HTML mới dưới `pages/` | JS mới dưới `js/pages/` | CSS mới dưới `css/pages/` | Mục đích |
| --- | --- | --- | --- |
| `auth/verify-email.html` | `auth/verify-email.js` | `auth/verify-email.css` | Kết quả xác minh mẫu: hợp lệ/hết hạn/đã dùng/gửi lại |
| `auth/forgot-password.html` | `auth/forgot-password.js` | `auth/forgot-password.css` | Yêu cầu reset và phản hồi chung |
| `auth/reset-password.html` | `auth/reset-password.js` | `auth/reset-password.css` | Form mật khẩu mới và token lỗi/hết hạn/đã dùng |
| `catalog/detail.html` | `catalog/detail.js` | `catalog/detail.css` | Chi tiết có ID của dịch vụ/gói học hoặc lớp nhóm |
| `cart/index.html` | `cart/index.js` | `cart/index.css` | Giỏ đăng ký học: thêm/sửa/xóa/tổng/checkout |
| `order/history.html` | `order/history.js` | `order/history.css` | Danh sách/chi tiết đơn, liên kết hợp đồng/thanh toán |
| `tutor/manage.html` | `tutor/manage.js` | `tutor/manage.css` | Tabs dịch vụ/lớp/đơn/doanh thu của gia sư |
| `admin/manage.html` | `admin/manage.js` | `admin/manage.css` | Tabs người dùng/dịch vụ-lớp/đơn của admin |
| `home.html` | `home.js` | `home.css` | Trang chủ với dịch vụ/lớp mới công khai và còn đăng ký |

Kết quả tối thiểu là **40 trang yêu cầu**. Không tạo các trang đăng ký lớp, chi tiết đơn, cancel, review, report, thống kê riêng nếu `catalog/detail`, drawer/modal/section và tabs hiện có đã đáp ứng. Nếu phát hiện cần route ngoài chín trang, ghi rõ luồng không thể đáp ứng bằng trang hiện tại; không tự mở rộng sang nhóm page BS.

## 4. Nội dung và hành vi phải đủ trên từng trang mới

### Auth

- Login/register giữ form/layout hiện có, thêm liên kết tới các trang auth mới.
- Verify email đọc token mẫu đã định nghĩa; không có token/không hợp lệ/hết hạn/đã dùng hiển thị trạng thái rõ, không thay bằng tài khoản khác.
- Forgot password validate email; submit mẫu trả thông báo chung, không phân biệt email có tài khoản; trạng thái loading/error/đã nhận yêu cầu hợp lý.
- Reset password: hai trường mới/xác nhận, giới hạn hợp lệ, không khớp và token không hợp lệ; password không lưu trong localStorage/sessionStorage, log hoặc fixture JSON.
- Login thành công nếu được mô phỏng phải cập nhật một demo persona chung và điều hướng đúng vai trò. Login thất bại không đổi persona. Logout xóa trạng thái persona mẫu phù hợp và về login. Đây **không phải auth thật**.
- Không xây một hệ thống mật khẩu/token thật ở frontend. Dùng dữ liệu thử tổng hợp/token có dấu DEMO để biểu diễn trạng thái; tài liệu QA ghi cách mở fixture hợp lệ. Không gửi email.

### Catalog detail

- Một trang dùng chung hai loại: SERVICE và GROUP_CLASS, đọc `?id=<offeringId>`.
- Hiển thị tutor, môn/cấp học, nội dung, số buổi, thời lượng/buổi, phí và đơn vị, hình thức, khu vực, lịch, điều khoản, trạng thái công khai và điều kiện đăng ký.
- SERVICE có chọn lựa phù hợp và CTA mời dạy hoặc thêm giỏ theo flow mẫu được định nghĩa.
- GROUP_CLASS có lịch cụ thể, tổng chỗ/số chỗ còn lại, điều kiện nhận đăng ký, CTA thêm giỏ/đăng ký; full/closed/không công khai không có CTA thành công giả.
- Giữ offering ID, lựa chọn và version điều khoản khi sang giỏ/mời. ID không tồn tại phải có empty/error và link quay lại; không lấy offering đầu tiên thay thế.

### Cart

- List có offering/tutor/type/lịch/số buổi/giá/unit/lựa chọn; sửa lựa chọn và xóa; tổng chính xác; trạng thái rỗng.
- Không mặc định mọi dịch vụ đều có quantity như hàng hóa. Định nghĩa mẫu hợp lý: một lựa chọn học viên/chỗ cho mỗi item nếu chưa có nghiệp vụ khác; ghi giả định trong bàn giao.
- Validate lại item mẫu khi checkout: published/open, cùng price/terms version, group còn chỗ; data stale phải thông báo và cập nhật lựa chọn, không tự âm thầm đổi giá.
- Checkout mẫu tạo order/items và liên kết contract/enrollment cần thiết theo mô hình ở mục5; chỉ chuyển trang sau khi lưu state thành công.

### Order history

- Tách đơn đăng ký khỏi hợp đồng và ledger ví.
- Tabs/filter/search/date/sort/page theo dữ liệu mẫu thật của store; số lượng/tổng/trạng thái lấy cùng nguồn.
- Hiển thị ba channel INVITATION/JOB/GROUP_CLASS, item/price snapshot, trạng thái đơn/payment, contract links khi đã có.
- Đơn chưa có contract mở drawer/modal chi tiết, không dẫn tới contract fixture không liên quan.
- Có action hợp lệ theo state: tiếp tục xác nhận/thanh toán, hủy mẫu/đọc refund status, review khi completed, report khi phù hợp. Không nút chỉ toast “chưa sẵn sàng” cho thao tác trong phạm vi.

### Tutor manage

- Tabs tối thiểu: dịch vụ, lớp nhóm, đơn đăng ký, doanh thu.
- List/form/modal create/edit/close offering mẫu; fields môn/cấp/buổi/giá/unit/mode/location/schedule; lớp có capacity.
- Chỉ hiển thị tài nguyên đúng tutor persona mẫu, trạng thái profile chưa duyệt không nhận lớp/publish thành công. Nói rõ đây chỉ là UI gate.
- Sửa offering không làm giá/terms của đơn/hợp đồng cũ đổi theo.
- Đơn có link tutor-detail hoặc drawer khi chưa có contract; revenue chỉ tính các release mẫu, tách held/planned/refund và không coi withdrawal là doanh thu.
- Chart bar theo ngày và pie có label/unit/range/no-data/accessibility như mục7.

### Admin manage

- Tabs tối thiểu: người dùng, dịch vụ/lớp, đơn đăng ký; nối AdminSidebar và dashboard.
- Users list/search/filter/details; thao tác mẫu lock/unlock/disable với xác nhận và reason; không thể tùy sửa role/password/ledger.
- Offerings list/filter/detail/publish/reject/close mẫu theo transition hợp lệ, cùng dữ liệu catalog và tutor manage.
- Order list/detail/filter/contract links/payment/refund states; không dropdown đổi status tùy ý. Action là event có điều kiện, được dùng chung với contract/order store.
- Tutor/job moderation queue/detail vẫn giữ trang riêng hiện có; cùng record với profile/tin người dùng, không mỗi vùng một tập fixture khác.
- Không đưa payout bổ sung vào tabs này để giả đủ BB12.

### Home

- Hero/tiêu đề gọn, tìm gia sư và danh mục dịch vụ/lớp dễ tiếp cận; không thêm slogan, chứng nhận, thống kê hoặc hotline thiếu căn cứ.
- Latest items dựa `publishedAt`, ưu tiên thời điểm công khai, có tie-break ID; chỉ approved/open/còn nhận đăng ký theo store mẫu.
- Card có offering ID/tutor/loại/môn/cấp/học phí/unit và link đúng detail. Có no-data/error state hợp lý.
- Brand public dẫn home; người đã đăng nhập vẫn tới trang đúng role qua menu, không lẫn admin shell.

## 5. Đồng bộ dữ liệu mẫu và quy tắc state

### 5.1. Một nguồn chuẩn cho mỗi thực thể

Hiện các page có nhiều fixtures riêng cho cùng tutor/contract/payment. Phải khảo sát chúng, lập mapping IDs và chuyển về nguồn dữ liệu chung có ranh giới gọn. Không sao chép thêm một tập fixture cho mỗi trang mới.

Thiết kế ít module cần thiết trong `ui-prototype/js/`:

- Fixture/entities và các relations: account/persona, tutor/profile, offering/group, invitation/proposal/job/application, cart, order/items, contract/enrollment, payment attempt, financial events, review/report/notice.
- Store mẫu có version và đọc/ghi có kiểm soát; page chỉ tiêu thụ façade, không mỗi page tự parse/mutate JSON khác nhau.
- Helpers ID/link/format/status được dùng chung khi có ít nhất hai caller.
- Các façade đang tồn tại như `EduJobReview`, `EduTutorReview`, `EduReport`, `EduPayout` cần giữ API hoặc cập nhật toàn bộ caller cùng lúc. Không để queue đọc store mới nhưng detail vẫn ghi store cũ.

Không xây framework/store/event bus/ORM giả phức tạp. Dữ liệu/adapter dùng chung vừa đủ để các trang đọc cùng record và kiểm tra UI thuận tiện.

### 5.2. Persistence mẫu

- Ưu tiên sessionStorage như prototype hiện tại: đồng bộ chuyển trang/reload/back trong **cùng tab và origin**. Không tuyên bố sessionStorage đồng bộ nhiều tab, nhiều tài khoản, thiết bị hoặc server.
- Chọn key/version chuẩn, parse/validate shape và IDs trước dùng. Dữ liệu lỗi không làm crash trang, không tự lấy bản ghi khác thay thế.
- Nếu cần migrate các key mẫu cũ, đọc/đối chiếu/migrate có kiểm soát, không `sessionStorage.clear()` xóa tất cả storage của origin.
- Write theo snapshot mới: clone → validate → persist → commit/render. Nếu storage thất bại, state/UI không báo đã lưu và không mutate thành trạng thái thành công.
- Không lưu password, credential, token xác thực thật, giấy tờ/địa chỉ/số điện thoại thật. Dùng fixture tổng hợp sẵn có hoặc dữ liệu thử tổng hợp bổ sung; email demo dùng domain dành cho thử như `.test`.
- View/page riêng không là chứng cứ phân quyền: việc lọc theo persona chỉ phục vụ preview. Server authorization là việc khác chưa triển khai.

### 5.3. IDs và quan hệ

Phải có stable IDs và references kiểm tra được:

- Tutor ↔ active offerings ↔ group schedules/capacity.
- Invitation/proposal version hoặc job/application selection hoặc group enrollment là nguồn của order.
- Order khác Contract. Order có items với immutable selection/price/terms snapshots, channel/source reference; contract/enrollment liên kết item theo mô hình mẫu được ghi rõ.
- Payment attempt liên kết order và contract/escrow liên quan; ledger/financial event giữ references; history/wallet/detail hiển thị cùng record.
- Review liên kết người mua/item/contract/offering/tutor, chỉ fixture completed đủ điều kiện.
- Report giữ reporter, target type/id, reason/evidence metadata, state/resolution/notice; admin queue/detail và người gửi nhìn cùng report ID.
- Không tạo record thành công ở trang gửi rồi điều hướng tới một record mẫu unrelated có sẵn.

Danh mục giá hiện tại, giá thương lượng và giá snapshot hợp đồng có thể khác nhau **có lý do**. Không ép mọi giá của cùng tutor bằng nhau. Chỉ các màn hiển thị **cùng hợp đồng/đơn/phiên thanh toán** phải khớp total/fee/sessions/schedule. Khi catalog đổi giá, đơn cũ giữ snapshot; đề xuất thương lượng được chấp nhận phải tạo snapshot đúng đề xuất đó.

### 5.4. Tính tiền và mâu thuẫn fee

- Chuẩn hóa currency VND, số tiền integer, display bằng Intl; đơn vị `/buổi`/toàn gói phải rõ, không nhân sai duration hay sessions.
- `total`, `availableToUse`, `escrowHeld`, `payosDue`, `grossReleased`, `tutorNetReleased`, `platformFeeReleased`, `refunded` là các khái niệm riêng.
- `grossReleased = tutorNetReleased + platformFeeReleased`; held/planned không vào doanh thu. Withdrawal là chuyển từ số dư ra ngân hàng, không phát sinh revenue lần nữa.
- Audit phát hiện dashboard dùng8%, contract detail dùng10%. **Không tự quyết phí production hoặc bịa rằng8% là policy lịch sử.** Để demo nhất quán, có thể dùng cấu hình rõ `DEMO_FEE_RATE = 0.10` phù hợp ví dụ contract hiện có, ghi đây là giả định mẫu chưa được nhóm chốt. Dashboard phải tính từ release event và feeRateSnapshot mẫu tương ứng, không giữ hard-code8% hoặc nhân lại GMV tổng. Nếu chọn phương án mẫu khác, giải thích và bảo đảm mọi màn cùng reference vẫn khớp.
- Hủy/refund có policy mẫu riêng, ghi trong QA/bàn giao là giả định chưa chốt. Không quảng cáo mọi trường hợp hoàn100%; không hoàn phần đã released khi demo policy không cho phép. Refund state khác cancellation state.
- Capacity/basic state checks vẫn phải có ở demo; không làm hệ scheduler tự giải ngân/tự hủy nhóm thiếu sĩ số thuộc BS.

### 5.5. Sự kiện và trạng thái

- Định nghĩa một bảng status/event/action dùng chung cho order/contract/payment/refund/offerings/review/report. Không dùng một chuỗi `pending` lẫn cho lesson pending, order unpaid và payment pending.
- Không status dropdown tùy ý. Action hợp lệ phải kiểm tra record hiện tại, persona mẫu, version và điều kiện như completed/paid/full/closed.
- Bấm lặp không tạo hai đơn, enrollment, review, report conclusion, refund hoặc release mẫu. Khi save lỗi giữ state trước đó.
- Cancellation của phiên QR khác hủy đơn; đóng tin tìm gia sư khác hủy hợp đồng; hỗ trợ/report khác đã refund.
- Payment result không được ghi paid/credit ví/activate hợp đồng chỉ vì URL `status=success`. Nếu giữ status query để trình diễn, nó chỉ chọn presentation; không mutate financial store. Giao dịch mẫu thành công phải là record demo được fixture hoặc QA flow kiểm soát, được đánh dấu rõ là demo.
- QR phải tiếp tục là DEMO không có bank/payment payload dùng được. Không tạo link thanh toán thật hoặc copy nội dung tài khoản ngân hàng thật.
- Trang money/action cần một dấu “Bản xem trước”/“Giao dịch mô phỏng” phù hợp; không lặp ghi chú kỹ thuật ở từng hàng hoặc biến giao diện thành công cụ debug.

### 5.6. Bộ dữ liệu kiểm tra tối thiểu

Bổ sung vừa đủ fixtures để kiểm các trạng thái, không hàng trăm record cho có:

- Learner/parent, tutor approved, tutor pending/rejected và admin personas mẫu.
- SERVICE và GROUP_CLASS có ID; offering published/open, closed/unpublished; group còn chỗ và full.
- Mỗi channel INVITATION/JOB/GROUP_CLASS có ít nhất một order và relation đúng.
- Order chưa có contract, awaiting payment, active, completed, cancellation pending/cancelled với refund pending/succeeded phù hợp.
- Payment enough wallet/due0, partial wallet, pending, failed/expired/cancelled và verified-success fixture; financial events nhất quán.
- Review eligible/ineligible/already-reviewed; report open/investigating/resolved/dismissed.
- Có no-data và ID không hợp lệ để kiểm empty/error; cấu hình scenario trong QA/doc, không thêm các nút giả lập/trình chọn state vào màn sản phẩm.

## 6. Navigation, URL và các trang hiện có phải cập nhật

### 6.1. Liên kết thật và base path

- `<a href>` cho navigation; `<button>` cho hành động/filter/modal/save. Không `href="#"`, link rỗng hoặc nút chỉ toast cho luồng yêu cầu đã nằm trong scope.
- `pages/home.html` nằm nông hơn các page trong `pages/<module>/`. Phải xử lý đúng asset/script/style/nav ở **cả hai độ sâu**; không copy `../../…` từ page con sang home gây hỏng.
- Header hiện có JS hard-code paths theo page con; khi dùng home phải sửa bằng resolver/base path hoặc contract data-* gọn dùng chung, cập nhật tất cả caller. Không giả định server luôn phục vụ root `/ui-prototype` hay luôn root `/`.
- Có thể dùng một route registry/helper dưới `js/core/` để tạo URL bằng `URL`/`URLSearchParams`, giữ relative/base/context đúng; không tạo mini-router SPA. Page vẫn là HTML riêng.
- Không URL arbitrary open redirect; `from`/return route là allowlist. Encode parameters; không đưa tên/nội dung người dùng thẳng vào HTML/URL không escape.

### 6.2. Navigation theo persona

- Public: home, tìm gia sư/danh mục, chi tiết tutor/offering, login/register.
- Learner: giỏ, đơn đăng ký, hồ sơ, ví, tin của mình/lời mời ở điểm hợp lý; lịch sử đơn khác lịch sử giao dịch ví.
- Tutor: quản lý dịch vụ/lớp/đơn/doanh thu, hồ sơ giảng dạy/lịch rảnh, tìm tin, ví.
- Admin: dashboard, manage mới, tutor/job review queues, reports, payout pages hiện có, audit logs. Cập nhật tất cả sidebar/header admin cho cùng danh sách/active state; không thêm link mới chỉ ở một trang.
- Brand/header/footer/menu chỉ dẫn tới trang/section có thật. Footer không thêm chính sách/chứng nhận/hotline giữ chỗ. Breadcrumb chỉ giữ khi có link trang cha thật.
- `.is-active`/`aria-current="page"` đúng; anchor nằm dưới sticky header phải có offset token.

### 6.3. Giữ contract URL hiện hữu

Phải đọc handler thật trước khi thay; duy trì các link cũ khi chúng vẫn hợp lệ:

| Trang đích | Params/anchor hiện đang dùng |
| --- | --- |
| `tutor/profile.html` | `id` |
| `invitation/create.html` | `tutor`; thêm `offering`/selection khi cần, không bỏ tutor ID |
| `invitation/negotiation.html` | `invite` |
| `contract/confirm.html` | `contract`; thêm order reference khi cần |
| `payment/checkout.html` | `contract`, `from=contract|contract-detail`; bổ sung order/payment reference có mapping |
| `payment/qr.html` | `contract`; context cùng checkout |
| `payment/result.html` | `status`,`id`, legacy `view` nếu còn caller; phân biệt id legacy contract với paymentId mới bằng contract rõ, không đổi semantic âm thầm |
| `contract/student-detail.html`, `contract/tutor-detail.html` | `id` |
| `chat/messages.html` | `contract`; rà cả link `tutor` đang được profile tạo và khả năng handler thực sự đọc |
| `wallet/overview.html` | `#transactions` |
| `tutor/my-profile.html` | `#lich-ranh` |
| Admin queues/reports/payouts | `status` |
| `admin/audit-logs.html` | `module` |

Mã thiếu/sai/không render được: error/empty có đường quay lại, không silent fallback bản ghi khác. Nếu link chat theo tutor không có conversation hợp lệ, thể hiện chưa có hội thoại và link quay lại; không mở ngẫu nhiên contract khác. Không triển khai chat realtime.

Params **mới đề xuất** cần thống nhất trong code/docs:

- `catalog/detail.html?id=<offeringId>`.
- `cart/index.html` đọc cart hiện tại, không nhận authoritative price từ query.
- `order/history.html?status=<allowed>&channel=<allowed>&id=<orderId>` nếu mở drawer; unsupported filter xử lý rõ.
- `tutor/manage.html?tab=services|classes|orders|revenue`.
- `admin/manage.html?tab=users|offerings|orders`.
- Auth token query chỉ token DEMO phục vụ prototype, không credential thật.

### 6.4. Sửa các page cũ để nối đủ luồng

- Tutor search: một query state cho q/filter/sort/page; filter dữ liệu mẫu đang public/eligible. Bỏ total128 hard-code, count/pagination/visible list phải cùng dữ liệu. Thêm tab catalog service/group nếu cần; search tutor và search offering khác kết quả nhưng dùng controls rõ.
- Tutor profile: offering list có IDs/link detail; selection không chỉ đổi summary; public reviews từ store. Thêm report modal và trạng thái gửi.
- Invitation create/negotiation: submit/accept tạo hoặc update record có ID/version thật trong **demo store**, giữ terms đúng sang order/contract; không chỉ success rồi mở fixture khác.
- Job create/my-job/discover/detail/applicants: record tạo/duyệt/application/selection cùng source; chọn duy nhất; closed/pending không nhận application. Không coi tin learner là offering tutor.
- Contract confirm/detail: hiển thị order/item/terms/financial references đúng; actions/cancel/review/report đọc state chung, learner/tutor không có hai mảng lesson/state không liên quan.
- Payment/wallet: total/available/held/due/released/refund cùng nguồn; wallet đúng persona; result đọc verified demo record, query presentation không mutate tiền.
- Admin review/report: queue/detail/counter/dashboard đọc cùng record; decisions reflect khi quay lại/reload; reason bounds, terminal/repeated/storage failure được giữ.
- Dashboard: bỏ hard-coded “integrity passed”, service connected, real metrics nếu chưa có kiểm tra thật; rõ demo marker, metrics tính từ fixture shared.
- Payout/chat/audit pages: giữ hành vi/luồng mẫu hiện có; chỉ sửa chung về shell/links/data references cần thiết. Không mở rộng business/automation BS.

## 7. Biểu đồ, review/report/cancel và form dùng chung

### Biểu đồ

- Bar có from/to, validate from≤to; chọn chỉ số/đơn vị/range rõ; tutor xem tutorNetReleased mẫu, admin platformFeeReleased/count mẫu.
- Pie/donut thật cho order status hoặc channel đã định nghĩa; **không gọi thanh tỷ trọng hiện có là pie**.
- Dùng CSS/SVG/HTML native phù hợp, không thêm chart package. Dùng cùng dataset totals, legend/count/% và mô tả chữ/bảng accessible.
- Zero data không NaN/Infinity; label dài/số tiền dài không tràn; không chỉ dùng màu để phân biệt. Không cộng GMV/held vào revenue.
- Làm thành module/component gọn dùng ở dashboard và tutor/manage; không copy hai implementation tính khác nhau.

### Các action bổ sung

- Review: modal completed contract/item, rating và text validation; lưu review mẫu unique theo key mô hình demo; profile rating/list update; chưa completed/already reviewed không tạo success.
- Report: modal trên tutor/contract, reason và evidence metadata mẫu; lưu report ID; admin xử lý cùng report; sender xem outcome/notice. Không giả upload evidence thật đã lên server; không tự refund khi report resolved.
- Cancel/refund: preview amount/policy/destination/trạng thái cần thiết, reason/confirm; update order/cancellation/refund mẫu qua state layer một lần; feedback pending/succeeded/failed rõ; return group seat theo policy demo.
- Không tạo một modal khổng lồ chứa cả ba chức năng; dùng component/slot nhỏ tái sử dụng, host trang giữ ownership rõ.

### API component đã có phải tôn trọng

- `EduModal.open(id, {title,message,confirmText,cancelText,variant})`, `EduModal.close(id)`; `modal:confirm` cancelable, `modal:close` có `detail.reason`; validate lỗi phải ngăn đóng khi phù hợp.
- `EduToast.show({type,title,message,duration,actionLabel,onAction})`; thông báo textContent, không nhét business logic vào toast.
- Tabs: `[data-tabs]`, unique tab/panel IDs, `tabs:change` có `{tabId,panelId}`, keyboard arrows/Home/End.
- Pagination: `pagination:update` nhận `{total,pageSize,current}`; `pagination:change` trả `{page,pageSize,total}`. Component page **1-based**; nếu adapter dùng0-based phải chuyển rõ một chỗ, không off-by-one.
- Bộ lọc responsive: `[data-search-filters]`, `search-filters.js`, breakpoint64rem; không đổi markup hành vi vô cớ.
- Select hiện có dùng `[data-component="select"]`, trigger/value/options; đọc source trước bổ sung option/native fallback.

Không đăng ký listener trùng mỗi render, init lặp hay nhầm `.detail` event. Dữ liệu người dùng dùng textContent/createElement hoặc escape theo context; không nội suy trực tiếp reason/review/query vào innerHTML.

## 8. Thiết kế, responsive và accessibility

Giữ `docs/ui/redesign.md` và token làm nguồn chuẩn. Không redesign lại theo sở thích mới.

- Thương hiệu Edu Connect, xanh thông `--color-primary`, đất nung accent, nền giấy ngà; chữ system Segoe UI/Arial, tiêu đề Cambria/Georgia ở khu user/auth, admin sans-serif.
- Dùng bộ logo SVG hiện có; giữ tỷ lệ logo ngang, không đổi asset hoặc kéo font ngoài.
- Không hard-code palette thứ hai; không tự định nghĩa button/input/badge/table riêng trong CSS page nếu component có sẵn.
- Viền neutral1px đều các cạnh; không border-left/top màu, inset-shadow giả viền, gradient/pseudo-element dựng vạch cạnh; không gạch trang trí dưới title/menu.
- Đất nung không dùng cho success/warning/error/loading/disabled/selected states; dùng semantic tokens và nhãn chữ.
- Không nhãn nhỏ lặp title, mô tả diễn giải lại title, nhiều hộp màu lồng; nội dung tập trung thao tác/dữ liệu/điều kiện giúp quyết định.
- Layout User/Admin/Auth shell đúng role, cùng header/footer/sidebar và link active.
- `[hidden]` vẫn thực sự hidden dù component display grid/flex; ID unique.
- Mobile320/360/390/430, tablet768/1024, desktop1280/1440; kiểm thêm màn thấp390×500, ngang844×390 và rail desktop1440×650.
- Header user hai hàng, nav mobile cuộn có chủ ý; admin sidebar chuyển nav horizontal ở≤64rem. Không mất nút/page navigation ở mobile.
- Inputs/select/textarea editable font≥16px ở≤1024; vùng bấm chính mobile≥44px; table rộng cuộn trong wrapper, không toàn body.
- Bộ lọc đúng64rem ở cả CSS/JS, resize không xóa selections.
- Rail/sticky không che thao tác cuối; khi gộp cột bỏ giới hạn/scroll desktop; header/anchor offsets lấy token.
- Không `overflow-x:hidden` ở body để che lỗi; sửa nguồn gây tràn.
- Labels/form errors aria-describedby/aria-invalid, headings hierarchy, table caption/scope, focus visible, modal Escape/return focus; tabs/menu keyboard đầy đủ.
- Contrast chữ thông thường≥4.5:1; chữ nhỏ trên nền giấy dùng text-secondary. Animation nếu có ngắn/nhẹ, respect reduced motion, không cần thêm animation để đạt mục tiêu.

## 9. Thứ tự thực hiện và tránh sửa đè

Bạn có thể tự triển khai trong một phiên, nhưng phải xử lý các file giao nhau theo thứ tự sau. Không chia page cho nhiều tiến trình tự do ghi cùng file.

1. **Khảo sát + freeze contract:** inventory31/current pages, class/event APIs, route registry/params, IDs/relations/state and demo policy, mapping các fixture cũ.
2. **Shared foundation:** data/store/route helpers tối thiểu và compatibility adapters; sửa base path home; kế hoạch header/sidebar/nav. Không sửa business state rải ở page trước khi nguồn chuẩn rõ.
3. **New page skeletons:** đủ9 HTML/JS/CSS với shell/component đúng, params/empty/error rõ và links thật.
4. **Catalog/auth/profile:** auth links/states, search/filter/sort/public predicate mẫu, detail/profile/list/home. Search/profile files chỉ sửa một lượt cơ sở rồi nối review/report sau.
5. **Matching/cart/order/payment:** ba sources → same demo order/contract → checkout/QR/result → wallet/history; source/version/price snapshots hợp lệ. `confirm.*` trước payment-context, payment/wallet base trước refund integration.
6. **Management/action/stats:** tutor/admin manage, moderation shared; contract/history cancel/review/report slots; aggregate chart. Header/sidebar update cuối theo danh mục đã chốt để không lệch.
7. **Regression + docs:** toàn40 required pages cùng component showcase; test luồng và viewport; cập nhật maps/readme và báo cáo mới.

Ranh giới nếu sau này chuyển patch cho ba thành viên vẫn theo audit: Đại điều phối shared layout/client/catalog-query/stats/review/report; Huy commerce/matching/payment/manage; Đạt search/profile/history/home/detail UI. Trong lượt prototype này không tính lại số chức năng hoặc thay phân công backend chỉ vì một agent đang sửa toàn UI.

## 10. Kiểm chứng bắt buộc trong môi trường cho phép

Đọc tool/script hiện có trước chạy; ưu tiên công cụ sẵn có. Không tự cài dependencies hoặc đổi firewall/browser/security policy để vượt blocker. Dùng server static local và browser context/dữ liệu mẫu cô lập nếu có; không dùng tài khoản hay dữ liệu thật. Không thay file source chỉ để test pass.

### A. Kiểm tra tĩnh

- Đủ40 trang yêu cầu, không page trùng; HTML/CSS/JS/asset local đích tồn tại.
- `node --check` toàn script JavaScript hiện tại và mới nếu Node có sẵn.
- Kiểm href/src và cả CSS url(), các depth khác nhau của home/subpage, anchors/IDs, tab/panel/label/error refs.
- Không liên kết `#` đơn/rỗng/placeholder; chính sách footer chỉ link page/section thật.
- Không inline business JS; tránh page CSS override component; không thêm CDN/framework/package file ngoài scope.
- Data references tồn tại, cùng contract/order/payment amount/sessions/fee/terms/schedule; unique ID/event/review/enrollment; no negative/unbalanced financial totals.
- Totals/filter/page không hard-code; chart pie/legend/totals hợp lý; publication+capacity fixtures đúng predicate.
- Không secret/password thật trong code/storage/log/QA.

### B. Browser smoke toàn trang

Mở toàn40 required pages với query IDs hợp lệ; auth/token/state fixtures theo tài liệu; root home và từng nhóm. Kiểm console, assets, document title, main content, nav/footer, empty/invalid ID, input/errors/menu/modal keyboard.

Chạy responsive sweep với viewport ở mục8 nếu công cụ cho phép. Ưu tiên thao tác ở320/390/768/1024/1440 và ít nhất một viewport thấp; chụp các trang mới và những trang cũ bị sửa shared shell. Không tái sử dụng các con số “256 lượt pass/37 phép thử pass” trong QA cũ làm kết quả lượt này.

### C. Luồng có tương tác — tối thiểu

1. Register form validation → verify sample valid/expired/used → login persona sample → logout. Chỉ demo, không email/session thật.
2. Home latest → catalog detail → tutor profile/list → offering detail cùng ID; search tiếng Việt có/không dấu; combined filters+4 sorts+page/empty.
3. SERVICE selection → invitation → negotiation accepted terms → order/contract confirm → payment context; record tạo mới được tìm trong history, không fixture unrelated.
4. Job create → admin approve → tutor application → owner selection → order/contract; queue/detail/list cùng IDs/status.
5. GROUP_CLASS còn chỗ → cart → order/enrollment; full/closed/duplicate/last-seat simulation bị chặn đúng; giữ/sửa/xóa cart.
6. Wallet enough/due0 và partial-wallet fixtures; checkout consent; QR DEMO đúng reference; result status query không mutate financial state; missing ID/no wrong fallback.
7. Order history owned persona sample → contract/payment/wallet; cancel sample→refund state→balance/capacity update đúng một lần; repeated/cannot cancel/storage failure.
8. Completed review→public list/rating; ineligible/already-reviewed chặn. User report→admin queue/detail→outcome→sender notice; invalid reason/repeated terminal/storage failure.
9. Tutor manage offering/class create/edit/close→catalog public list thay đổi; old order price snapshot không đổi; tutor pending cannot publish mẫu.
10. Admin manage users/offerings/orders filters/actions/links; sidebar active đồng nhất tất cả admin pages; nonmatching persona chỉ demo access feedback.
11. Date range bars và pie tại dashboard/tutor revenue; invalid range/0data/totals; held/planned không revenue, same release dataset.
12. Regression cũ: profile edit/cancel/reapproval, menu/Escape, modal confirm validation, pagination/table/footer, invitation/job links, chat/payout/audit pages không hỏng navigation.

Kiểm tra tĩnh/VM component không được ghi “E2E pass”. Nếu không mở browser/server được, ghi rõ chưa kiểm chứng browser, tiếp tục syntax/data/link checks, không dừng ở lời hứa sẽ kiểm tra sau. Nếu assertion fail, sửa đúng nguyên nhân rồi chạy lại phần liên quan; không đổi test để né lỗi.

## 11. Kết quả phải bàn giao

### Mã nguồn

- 9 page mới hoàn chỉnh hoặc page đã được tạo sau audit được hoàn thiện, JS/CSS đúng layout.
- Các page hiện có được nối vào flows/data/navigation; không tách một tập40 page mới độc lập bỏ nguyên31 page cũ.
- Shared data/store/helpers và component variants vừa đủ, không tạo framework hoặc backend.
- Không TODO/placeholder thay cho thao tác trong phạm vi. Phần backend chưa có vẫn được nói đúng là chưa có, không fake network success.

### Tài liệu

- Cập nhật `ui-prototype/README.md`: cách chạy bằng tool hiện có, pages/URL params, data/demo states, storage scope/version và những gì chưa là backend.
- Cập nhật `docs/ui/page-map.md`: đủ40 required HTML entry points; tabs/modal/sections ghi riêng; routes JSP/REST tương lai nếu nhắc phải đánh dấu đề xuất.
- Cập nhật component-inventory khi thực sự thêm component/variant; không liệt kê component tưởng tượng.
- Tạo thư mục QA mới `docs/ui/qa/<YYYYMMDD-HHMM>/` (không ghi đè), tối thiểu:
  - `01-PAGE-INVENTORY.md`: page/role/BB-TC/file/params/entry/luồng/state, phân biệt31 cũ và9 mới.
  - `02-UI-QA.md`: lệnh/kịch bản/viewport/kết quả/bằng chứng/giới hạn, số liệu thực chạy.
  - `03-DATA-VA-BAN-GIAO.md`: schema fixture/references/storage/version/events, demo assumptions và decisions chưa chốt, files changed/shared collision, mapping frontend→API proposal cho giai đoạn backend; không viết API đã tồn tại.

### Trả lời cuối bằng tiếng Việt

1. Đã bổ sung/hoàn thiện page nào và tổng required pages.
2. Luồng/data/nav đã đồng bộ; những decision chỉ là giả định demo, nhất là fee/refund/order–contract/group.
3. File shared đã thay và cách giữ compatibility callers.
4. Kết quả tests/browser/responsive thực chạy, phần bị chặn.
5. Source backend chưa tích hợp, không commit/push; WIP ban đầu được giữ.
6. Đường dẫn đầy đủ tới tài liệu QA và các page chính để xem kết quả.

Không kết thúc bằng “có thể làm tiếp” khi phần công việc trong prompt còn thiếu. Hoàn thành mã và kiểm tra trong phạm vi môi trường hỗ trợ; ghi rõ phần thật sự bị chặn.

## 12. Checklist hoàn thành

- [ ] 40 required pages có thật;31 page cũ giữ đúng filenames;9 page mới không trùng.
- [ ] Cùng design tokens/brand/components; home/subpages base paths đúng.
- [ ] Header/footer/admin sidebar và active state đồng nhất; link không trỏ placeholder.
- [ ] IDs/URL contracts đúng, invalid/missing không fallback record khác.
- [ ] Catalog/profile/group/service/search/filter/sort/page/latest cùng dữ liệu.
- [ ] Ba channel đều nối tới demo order/contract/enrollment có reference đúng.
- [ ] Cart CRUD/quote/status/capacity; order khác contract/ledger.
- [ ] Payment/QR/result/wallet/history/fees/release/refund cùng financial sample source; URL success không tạo paid.
- [ ] Review/report/cancel action không chỉ toast; admin/sender phản ánh cùng record; lặp/storage failure xử lý đúng.
- [ ] Tutor/admin manage đủ tabs; public eligibility và ownership chỉ ghi là UI preview.
- [ ] Có bar range và pie thật; range/0data/metric/unit/scope rõ, không GMV/held làm revenue.
- [ ] Auth pages đủ các trạng thái, không lưu password/credential thật.
- [ ] Responsive/keyboard/focus/contrast/hidden/table/rail kiểm tra; không body overflow hack.
- [ ] Không framework/CDN/backend/migration/live network/BS implementation.
- [ ] Không sửa báo cáo audit cũ, không ghi đè QA cũ/WIP hoặc commit/push.
- [ ] QA mới có bằng chứng thực và blocker; maps/readme đồng bộ thực tế.

**Bắt đầu bằng việc đọc và kiểm kê workspace, sau đó triển khai tuần tự.**
