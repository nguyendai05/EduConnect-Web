# 03 — DỮ LIỆU MẪU, STATE VÀ BÀN GIAO

Ngày kiểm tra: 2026-10-10 · Branch: `feature/ui-dai-auth` · HEAD lúc khảo sát: `08740ff453905fdd64233b4d7326cec1dca60056`

Tài liệu này mô tả nguồn dữ liệu dùng chung đã dựng trong lượt này, các giả định demo **chưa được nhóm chốt**, file dùng chung đã thay đổi, và ánh xạ frontend → API đề xuất cho giai đoạn backend.

> **Phạm vi:** prototype UI thuần (HTML/CSS/JS vanilla). **Chưa có backend.** Không có xác thực, không phân quyền thật, không persistence server, không giao dịch thật, không gửi email. Mọi con số tiền là dữ liệu tổng hợp.

---

## 1. Kiến trúc dữ liệu dùng chung

Trước lượt này mỗi trang tự giữ fixture riêng cho cùng một thực thể (contract `HD-*`, tutor `GS-*`, transaction `TT-*` xuất hiện rời rạc trong `js/pages/admin/*-data.js`, `js/pages/contract/*`, `js/pages/wallet/*`). Lượt này thêm **một nguồn chuẩn** mà các trang mới tiêu thụ qua façade:

| File | Global | Vai trò |
| --- | --- | --- |
| `ui-prototype/js/data/fixtures.js` | `window.EduFixtures` | Thực thể + quan hệ, chỉ đọc (`Object.freeze`) |
| `ui-prototype/js/data/store.js` | `window.EduStore` | Store có version, đọc/ghi kiểm soát, state machine, helper tiền/ID/format |
| `ui-prototype/js/core/route.js` | `window.EduRoute` | Sổ đăng ký 40 tuyến + resolver base path + `URLSearchParams` |
| `ui-prototype/js/core/charts.js` | `window.EduChart` | `bar()` và `pie()` dùng chung cho dashboard và tutor/manage |
| `ui-prototype/css/components/data-display/chart.css` | — | Style biểu đồ, dùng token, không palette thứ hai |

Thứ tự nạp bắt buộc (các script đều `defer`, chạy theo thứ tự trong tài liệu):

```
js/core/route.js → js/data/fixtures.js → js/data/store.js → js/core/charts.js → js/core/<component>.js → js/pages/<page>.js
```

`store.js` ném lỗi ngay nếu `fixtures.js` chưa nạp, để tránh im lặng chạy với dữ liệu rỗng.

### 1.1. Persistence mẫu

| Khóa sessionStorage | Nội dung | Version |
| --- | --- | --- |
| `educonnect:demo-store:v4` | Toàn bộ state đột biến được (offerings/orders/contracts/payments/wallets/financialEvents/ledger/reviews/reports/enrollments/invitations/jobs/applications/accountStates) | `4` |
| `educonnect:session:v1` | Persona demo đang đăng nhập | — |
| `educonnect:cart:v1` | Giỏ đăng ký | `1` |
| `educonnect:idempotency:v1` | Tập khóa chống bấm lặp | — |
| `educonnect:auth-notice:v1` | Cờ thông báo giữa `reset-password.js` và `login.js`, dạng `{code, at}` — **không chứa mật khẩu** | — |

Các khóa cũ `educonnect:*-decisions:v1` của bốn façade có sẵn (`EduTutorReview`, `EduJobReview`, `EduReport`, `EduPayout`) **được giữ nguyên** — không phá API, không bắt các trang admin cũ đổi theo. Danh sách `LEGACY_KEYS` trong `store.js` chỉ migrate có kiểm soát và **không gọi `sessionStorage.clear()`**.

**Giới hạn phải nói rõ:** sessionStorage chỉ đồng bộ trong **cùng một tab và cùng origin**. Không đồng bộ nhiều tab, nhiều tài khoản, nhiều thiết bị hay server. Reload/back trong cùng tab thì giữ state; mở tab mới thì về fixture gốc.

### 1.2. Quy tắc ghi

`clone → mutate → validate → persist → commit/render`. Nếu `sessionStorage.setItem` thất bại, hàm trả `{ ok:false, reason:'storage-failed' }` và **state không đổi** — UI không được báo "đã lưu".

`EduStore.once(key, fn)` bảo đảm một thao tác chỉ tạo một bản ghi. Đã kiểm chứng: checkout lặp, cancel lặp, review lần hai, report quyết định lần hai đều bị chặn.

Dữ liệu trong storage bị hỏng/không đúng shape → `isValidState()` trả false, store nạp lại từ fixture và đánh dấu `EduStore.corruptReset() === true` để QA nhìn thấy. Trang **không crash và không tự lấy bản ghi khác thay thế**.

---

## 2. Mô hình ID và quan hệ

| Tiền tố | Thực thể | Ghi chú |
| --- | --- | --- |
| `PARENT-01` `STUDENT-01` `TUTOR-01` `TUTOR-02` `ADMIN-01` | persona demo | `TUTOR-02` có `profileStatus: 'pending'` để kiểm UI gate |
| `HV-200x` | learner | Ánh xạ persona ↔ learner qua `personaId` |
| `GS-xx` | tutor / hồ sơ gia sư | Giữ nguyên ID các trang cũ đang dùng (`GS-01`…`GS-05`) |
| `OF-SVC-1xxx` | SERVICE | offering |
| `OF-GRP-2xxx` | GROUP_CLASS | có `capacity`, `enrolled`, `schedule` |
| `JOB-2026-03xx` | tin tìm gia sư | **do learner đăng**, không phải offering của tutor |
| `APP-2026-04xx` | application | thuộc một job |
| `INV-20261009-0xx` | invitation + proposals | mỗi proposal có `version`; bản `accepted` là nguồn snapshot |
| `OD-2026-000x` | **order** | items mang snapshot bất biến |
| `HD-xxxxxxxx-xxx` | **contract** | giữ đúng ID mà `contract/*.html` đang dùng |
| `EN-2026-01xx` | enrollment lớp nhóm | nối order ↔ group class |
| `PAY-2026-000x` | payment attempt | nối order + contract |
| `FE-2026-00xx` | financial event | `release` / `hold` / `planned` / `refund` / `withdrawal` |
| `TT-xxxxx` | ledger | giữ ID cũ đang hiển thị ở wallet |
| `RV-2026-000x` | review | chỉ gắn đơn `completed` |
| `RP-2026-00xx` | report | người gửi và admin thấy **cùng ID** |

### Quan hệ bắt buộc (đã kiểm bằng script)

- `order.contractId` ↔ `contract.orderId` **hai chiều**; `contract.total === order.total`.
- `order.items[].offeringId`, `tutorId` phải tồn tại; `order.total === Σ(unitPrice × sessions × seats)`.
- `payment.walletUsed + payment.payosDue === payment.total`.
- `review.orderId` phải trỏ đơn có `status === 'completed'`.
- `enrollment.offeringId` phải là `GROUP_CLASS`; `enrolled ≤ capacity`.
- `report.targetId` phải tồn tại trong đúng tập theo `targetType`.

### Order ≠ Contract ≠ Ledger

Ba khái niệm tách riêng. Order giữ **snapshot bất biến** (`unitPrice`, `sessions`, `termsVersion`, `snapshotReason`). Contract là thỏa thuận ký trên order. Ledger/financial event là dòng tiền. Sửa giá offering **không** làm đơn/hợp đồng cũ đổi theo — đã kiểm chứng bằng test.

Ba channel đều có order và relation đúng: `INVITATION` (OD-2026-0001, 0004, 0007), `JOB` (OD-2026-0002 qua `APP-2026-0402`), `GROUP_CLASS` (OD-2026-0003, 0006, 0008 qua enrollment).

---

## 3. Tiền, phí và refund

### 3.1. Các khái niệm riêng biệt

`total` · `availableToUse` · `escrowHeld` · `payosDue` · `grossReleased` · `tutorNetReleased` · `platformFeeReleased` · `refunded` — không gộp lẫn.

**Bất biến:** `grossReleased = tutorNetReleased + platformFeeReleased`

`held` và `planned` **không** vào doanh thu. `withdrawal` là chuyển số dư ra ngân hàng, **không** phát sinh doanh thu lần nữa. `revenueSummary()` chỉ cộng các event `type === 'release'`.

**Bất biến liên thực thể (thêm ở lượt sau):** hủy đơn phải kéo theo trạng thái hợp đồng.
`cancelOrder()` và `completeRefund()` gọi `syncContractForOrder(draft, order)`:
`order.cancelled → contract.cancelled`, `order.cancellation_pending → contract.cancellation_pending`.
Lý do tồn tại: trước đó hai hàm chỉ sửa `orders`, nên `HD-20260928-027` vẫn đọc "Chờ thanh toán"
trên trang xác nhận trong khi `OD-2026-0003` đã "Đã hủy" — browser đo ra sự lệch này.
Test: nhóm 13 của `store-check.mjs`; mutation chứng minh (đục `syncContractForOrder` → `FAIL: 2`).

### 3.1b. Ký quỹ (escrow) và hoàn tiền: một nguồn dẫn xuất, không còn field trùng

Trước lượt này `wallets` trong fixture tự cất `escrowHeld`, `grossReleased`, `refunded` — trùng với những gì
suy ra từ `payments` + `financialEvents` + `orders.refund`, và **lệch thật**:

| Bản ghi | Field cũ | Dẫn xuất đúng | Vì sao lệch |
| --- | --- | --- | --- |
| `HV-2001` | escrowHeld 5.040.000 ₫ | **3.780.000 ₫** | `HD-20260919-024` đã giải ngân 1.260.000 ₫ (6 buổi) nhưng field vẫn ghi toàn bộ |
| `HV-2002` | escrowHeld 3.600.000 ₫ | **2.880.000 ₫** | `HD-20260810-018` đã giải ngân 4 buổi = 720.000 ₫ |
| `GS-05` | escrowHeld 3.168.000 ₫ (qua event `hold`) | **0 ₫** | event `hold` gán tiền cho `HD-20260928-027` chưa từng được thanh toán; các hợp đồng của GS-05 đã tất toán |

Công thức duy nhất trong `store.js` (`escrowOf` → `escrowHeldOf` → `walletSummary`/`heldSummary`):

```
escrow(hợp đồng) = max(0, Σ payment{verified | refund_pending | refunded}.total
                          − Σ release event grossReleased
                          − order.refund.amount khi refund.state = succeeded)
```

Ba trang ví / dashboard / checkout và `tutor/manage` nay đi qua hàm này nên không còn đọc ba nguồn khác nhau.
Field trung gian đã xóa khỏi fixtures và `store-check` có assertion **cấm** `escrowHeld`/`grossReleased`/`refunded`
quay lại làm field ví.

**Chính sách hủy demo** áp rate trên **phần chưa giải ngân** (`paid − released`), không trên toàn bộ tiền đã nhận.
Phần không hoàn được ghi thành một event `release` có `tutorNetReleased = 0` = phí hủy của nền tảng, để không có
tiền nằm lại vô danh: `3.600.000 = 720.000 (4 buổi đã học) + 1.440.000 (hoàn) + 1.440.000 (phí hủy)`.
Cách ghi nhận phí hủy (ai nhận, ledger nào) vẫn là **câu hỏi nghiệp vụ chưa chốt**.

### 3.1c. Không gian tên mã: `TT-*` là tin tìm gia sư, `BT-*` là bút toán ví

Trước đây hai bộ dùng chung `TT-*`, và **một mã rơi đúng vào cả hai**: `TT-8841` vừa là tin
"Tìm gia sư Tiếng Anh lớp 10" (`jobs`, hàng đợi kiểm duyệt admin, nhật ký kiểm toán đều tham chiếu),
vừa là bút toán escrow `HD-20260810-018` (`ledger`). Trang ví hiển thị "Mã bút toán TT-8841" trong khi
trang quản trị gọi cùng chuỗi đó là một cái tin — người đọc không phân biệt được hai vật.
Các màn job còn dùng `TT-88412 / TT-88209 / TT-88590 / TT-87910 / TT-8796` làm mã tin, trùng tiếp với mã bút toán.

Vì thiết kế (spec + ảnh screen) ấn định `TT-*` là **mã tin tìm gia sư**, nên **bút toán đổi tiền tố sang `BT-*`**
(8 dòng ledger + mọi `ledgerId` tham chiếu + bộ sinh `nextIdIn(draft.ledger, 'BT-')` + caption "mã BT-*" ở trang ví).
`STATE_VERSION` tăng lên 3 để payload cũ không đọc lại được mã kiểu cũ.
`store-check` giờ giữ chốt bằng ba assertion: *một mã chỉ thuộc đúng một bộ sưu tập*,
*tiền tố `TT-` chỉ dành cho jobs*, *tiền tố `BT-` chỉ dành cho ledger* (mutation chứng minh: đổi một bút toán
về `TT-8841` → `FAIL: 3` với dòng `TT-8841: ledger vs jobs`).

**Version state:** `STATE_VERSION = 4`, key `educonnect:demo-store:v4` (ghép từ hằng số), `isValidState` đòi đúng
version; `LEGACY_KEYS` nay **suy ra** từ `STATE_VERSION` (`v0…v${STATE_VERSION-1}`) nên tăng version là các key cũ
tự được dọn, không thể quên — và vẫn **không** dùng `sessionStorage.clear()`.
Nếu không đổi key, tab đang mở sẽ đọc mãi payload cũ và mọi con số trên màn hình thuộc mô hình cũ.

Sửa fixture kèm theo (mỗi cái do một assertion mới tìm ra, không phải dọn cosmetic):
`FE-2026-0004` gắn GS-05 trong khi `HD-20260919-024` thuộc GS-01; `FE-2026-0009/0010` gắn GS-01 trong khi
`HD-20260926-025` thuộc GS-04 → doanh thu gán sai người nhận. Ba hợp đồng `completed` chưa giải ngân hết
(`HD-20260926-025` 4.200.000/5.600.000 · `HD-20260715-012` 1.980.000/3.520.000 · `HD-20260820-013` 0/3.600.000)
→ thêm `FE-2026-0011…0014`. Hai đơn `OD-2026-0007`/`OD-2026-0008` giải ngân mà không có bản ghi thanh toán
→ thêm `PAY-2026-0010/0011`. Thiếu ví `GS-03`, `GS-04`, `HV-2003` → thêm.

Tiền tệ: `VND`, số nguyên, hiển thị qua `Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' })`. Đơn vị `/buổi` và toàn gói phân biệt bằng `unit` + `unitLabel`.

### 3.2. GIẢ ĐỊNH DEMO CHƯA ĐƯỢC NHÓM CHỐT

| Giả định | Giá trị | Lý do chọn | Cần ai chốt |
| --- | --- | --- | --- |
| **`DEMO_FEE_RATE`** | `0.10` (10%) | Khớp ví dụ hợp đồng đang hiển thị ở contract detail. Audit phát hiện dashboard cũ hard-code **8%** — con số đó **đã bị gỡ**, không phải policy lịch sử và không được bịa ra làm chuẩn. | Nhóm nghiệp vụ/tài chính |
| **Chính sách refund** | `before-first-session` 100% · `after-first-session` 50% · `released-not-refundable` 0% · `group-full-closed` 100% | Đủ để trình diễn các nhánh refund khác nhau. **Không quảng cáo hoàn 100% mọi trường hợp.** | Nhóm nghiệp vụ |
| **`seats` trong giỏ** | Mỗi item một `seats` = số học viên/chỗ; SERVICE mặc định 1 | Không mặc định mọi dịch vụ có `quantity` như hàng hóa. | Nhóm nghiệp vụ |
| **Order → Contract** | Một order tạo một contract; contract kế thừa `total`/`termsVersion` của order | Đủ cho luồng demo; thực tế có thể một order nhiều hợp đồng. | Backend/kiến trúc |
| **Group enrollment** | Trừ chỗ khi checkout, trả chỗ khi hủy/refund thành công | Policy demo, **không** phải scheduler tự hủy lớp thiếu sĩ số (thuộc BS, chưa được giao). | Nhóm nghiệp vụ |
| **Dashboard metrics** | Tính từ fixture dùng chung; mục "Số dư đang giữ khớp ký quỹ" ghi rõ **"Chưa kiểm tra được"** | Không thể khẳng định đối soát ledger khi chưa có backend. | — |

Mức phí phải được đọc từ `EduStore.DEMO_FEE_RATE` / `feeRateSnapshot` của từng event. **Không hard-code 8% hay 10% ở bất kỳ màn nào.**

### 3.3. Payment result không tin URL

`EduStore.resolvePaymentResult({ paymentId, contractId, queryStatus })`:

- Chỉ bản ghi có `status === 'verified'` trong store mới là thành công thật (fixture `PAY-2026-0007` có cờ `demoVerifiedSuccess: true`).
- `?status=success` chỉ chọn **presentation** (`'success-presentation-only'`), **không mutate** financial store. Đã kiểm chứng: state trước và sau giống hệt nhau.
- `paymentId` không tồn tại → `state: 'missing'`, **không fallback** sang bản ghi khác.

QR vẫn là DEMO, không có payload ngân hàng dùng được, không link thanh toán thật.

---

## 4. Bảng status / action dùng chung

Không dùng một chuỗi `pending` cho nhiều khái niệm. Mỗi bảng có `label`, `badge`, `terminal`, `actions`:

| Bảng | Giá trị |
| --- | --- |
| `ORDER_STATUS` | `created` · `awaiting_payment` · `active` · `completed` · `cancellation_pending` · `cancelled` |
| `PAYMENT_STATUS` | `unpaid` · `pending` · `verified` · `failed` · `expired` · `cancelled` · `refunded` · `refund_pending` |
| `REFUND_STATE` | `none` · `pending` · `succeeded` · `failed` |
| `CANCELLATION_STATE` | `none` · `pending` · `cancelled` · `rejected` |
| `CONTRACT_STATUS` | `draft` · `awaiting_payment` · `active` · `completed` · `cancellation_pending` · `cancelled` |
| `OFFERING_STATUS` | `draft` · `in_review` · `published` · `rejected` · `unpublished` · `closed` |
| `REPORT_STATE` | `open` · `investigating` · `resolved` · `dismissed` |

**Refund state ≠ cancellation state.** Hủy **phiên QR** (`PAY-…cancelled`) ≠ hủy **đơn** (`OD-…cancelled`). Đóng **tin tìm gia sư** (`job.availability='closed'`) ≠ hủy **hợp đồng**.

`OFFERING_TRANSITIONS` là máy trạng thái tường minh: `draft → in_review → published|rejected`; `published → unpublished|closed`. Không có status dropdown tùy ý — `transitionOffering()` từ chối mọi cạnh không nằm trong bảng.

`EduStore.orderActions(orderId, personaId)` trả action hợp lệ sau khi kiểm tra **record hiện tại + persona + điều kiện** (ví dụ `review` chỉ hiện khi `reviewEligibility() === 'eligible'`).

---

## 5. Bộ dữ liệu kiểm tra tối thiểu

Đủ phủ trạng thái, không phình hàng trăm record: **5 persona · 7 tutor · 12 offering · 3 job · 3 application · 4 invitation · 8 order · 7 contract · 3 enrollment · 9 payment · 4 wallet · 10 financial event · 8 ledger · 3 review · 4 report · 6 auth token**.

| Cần kiểm | Record |
| --- | --- |
| Learner/parent, student | `PARENT-01`, `STUDENT-01` |
| Tutor approved / pending / rejected | `GS-05` / `GS-13` / `GS-14` |
| Admin | `ADMIN-01` |
| Offering published+open | `OF-SVC-1001…1005`, `OF-GRP-2001`, `OF-GRP-2004` |
| Offering closed / unpublished / draft | `OF-SVC-1006`, `OF-GRP-2003` / `OF-GRP-2005` / `OF-SVC-1007` |
| Group còn chỗ / còn đúng 1 chỗ / FULL | `OF-GRP-2001` (5/8) / `OF-GRP-2004` (3/4) / `OF-GRP-2002` (6/6) |
| Ba channel | `OD-2026-0001` INVITATION · `OD-2026-0002` JOB · `OD-2026-0003` GROUP_CLASS |
| Order chưa có contract | `OD-2026-0004` (`contractId: null`) |
| Awaiting payment / active / completed | `OD-2026-0003` / `OD-2026-0001` / `OD-2026-0002`, `OD-2026-0007`, `OD-2026-0008` |
| Cancellation pending + refund pending | `OD-2026-0006` |
| Cancelled + refund succeeded | `OD-2026-0005` |
| Ví đủ / due 0 | `PAY-2026-0001` |
| Partial wallet | `PAY-2026-0002` |
| Pending / failed / expired / cancelled | `PAY-2026-0003` / `0008` / `0004` / `0009` |
| Verified-success cho QA | `PAY-2026-0007` |
| Review eligible / already-reviewed / ineligible | `OD-2026-0002` / `OD-2026-0007`,`OD-2026-0008` / `OD-2026-0001` |
| Report open / investigating / resolved / dismissed | `RP-2026-0011` / `0010` / `0009` / `0008` |
| Verify token valid / expired / used | `DEMO-VERIFY-VALID` / `-EXPIRED` / `-USED` |
| Reset token valid / expired / used | `DEMO-RESET-VALID` / `-EXPIRED` / `-USED` |
| ID không hợp lệ (empty/error) | bất kỳ ID ngoài danh sách, ví dụ `catalog/detail.html?id=OF-SVC-9999` |

**Không có nút giả lập/trình chọn state nào trên màn sản phẩm.** Cấu hình scenario bằng query param hoặc bằng fixture, ghi ở đây.

---

## 6. Bảo mật dữ liệu mẫu

- Không password, credential hay token xác thực thật. Token đều có tiền tố `DEMO-`.
- Email demo dùng domain `.test` (RFC 6761): `mai.lan@demo.test`, `admin@demo.test`, …
- Không giấy tờ/địa chỉ/số điện thoại thật; fixture cũ đã che (`09•• ••• 812`, `CCCD 079••••••012`).
- Mật khẩu **không** được ghi vào localStorage/sessionStorage/log/fixture.
- `EduStore.escapeHtml()` có sẵn; dữ liệu người dùng phải qua `textContent`/`createElement`, không nội suy vào `innerHTML`.
- `EduRoute.safeReturn()` là allowlist (`contract`, `contract-detail`, `cart`, `order-history`) — không open redirect.
- Đã kiểm bằng script: không email domain thật, không chuỗi `password=`, không số điện thoại 10 chữ liên tiếp trong fixture.

---

## 7. File dùng chung đã thay đổi và cách giữ compatibility

| File | Thay đổi | Compatibility với caller cũ |
| --- | --- | --- |
| `js/core/route.js` | **MỚI** | Thêm mới, không đổi API nào |
| `js/data/fixtures.js` | **MỚI** | Thêm mới |
| `js/data/store.js` | **MỚI** | Thêm mới; **không** đụng bốn façade `EduTutorReview`/`EduJobReview`/`EduReport`/`EduPayout` và khóa storage của chúng |
| `js/core/charts.js` | **MỚI** | Thêm mới |
| `css/components/data-display/chart.css` | **MỚI** | Thêm mới |
| `js/core/admin-sidebar.js` | File **rỗng** → normalizer: chèn mục "Quản lý người dùng & đơn" nếu thiếu, đặt `is-active`/`aria-current` theo trang hiện tại (trang chi tiết tính là mục hàng đợi cha) | Trước đây không trang admin nào nạp file này; nay nạp ở cả 10 trang admin nên danh sách + active state đồng nhất, không thêm link chỉ ở một trang |
| `js/core/user-header.js` | Menu dựng lại từ registry theo **vai trò persona**; nav thêm "Trang chủ"; brand header+footer dẫn về `home.html`; logout thật sự gọi `EduStore.logout()` rồi về `login` | Vẫn giữ `data-user-variant` A–E/STUDENT/TUTOR, class `user-header--private`/`--tutor`, khối summary, toàn bộ hành vi keyboard/Escape/focusout, và vẫn dispatch `user-header:action`. Bốn trang đang nghe event này (`job/applicants`, `job/discover`, `tutor/profile`, `tutor/search`) chỉ xử lý action **khác** logout nên không xung đột. Khi `route.js` chưa nạp (trang showcase) thì fallback về tiền tố `../../` như cũ |
| 31 trang HTML cũ | Chèn `route.js`, `fixtures.js`, `store.js` (và `admin-sidebar.js` cho 10 trang admin) **trước** thẻ script core đầu tiên | Chỉ thêm thẻ `<script defer>`; không đổi markup/CSS/hành vi sẵn có. Thứ tự defer bảo đảm `EduRoute`/`EduStore` tồn tại trước khi JS trang chạy |
| `pages/admin/dashboard.html` | Thêm link `chart.css` + script `charts.js` | Chỉ thêm |
| `js/pages/admin/dashboard.js` | Gỡ metric hard-code: GMV 18,47 tỷ / phí 8% 1,478 tỷ / escrow 6,82 tỷ / released 11,94 tỷ → **tính từ store** (7.440.000 / 744.000 / 8.640.000 / 6.696.000 ₫). Biểu đồ cột GMV tự vẽ bằng div → `EduChart.bar` + ô chọn khoảng ngày. Thêm `EduChart.pie` thật cho trạng thái đơn. Ba mục "integrity" từ khẳng định "Đạt" cố định → tính từ fixture, mục đối soát ledger ghi "Chưa kiểm tra được". Guard chia 0 | `renderEscrowChart`/`renderChecks`/`renderServices` giữ nguyên chữ ký; `snapshot.gmvTrend` không còn được biểu đồ dùng nhưng vẫn còn trong snapshot nên không vỡ cấu trúc |
| `pages/tutor/search.html` + `js/pages/tutor/search.js` | Bỏ tổng **128** hard-code: `data-total`/`data-last-page`/summary và `data-result-count` giờ lấy từ đúng tập card đang có (4). `applyView()` đồng bộ `pagination` bằng event `pagination:update` `{total,pageSize,current}` | Bỏ tham số `preserveReferenceCount` và cập nhật **cả hai** call site (dòng 217, 232) trong cùng lượt; `pagination.js` đã lắng nghe `pagination:update` sẵn |

**Không sửa:** `src/`, `pom.xml`, cấu hình IDE/Git, bốn báo cáo trong `docs/audit-phan-cong/20261010-2214/`, `docs/ui/responsive-qa.md`, logo/asset nhận diện, `css/tokens.css`/`base.css`/`layouts.css`.

WIP có sẵn trong working tree (169 file modified trước khi bắt đầu) được **giữ nguyên**; không checkout/reset/clean/pull/merge/commit/push. Đã backup `ui-prototype/pages/` trước khi chèn script.

---

## 8. Ánh xạ frontend → API ĐỀ XUẤT cho giai đoạn backend

**Toàn bộ bảng dưới là ĐỀ XUẤT. Chưa có API nào tồn tại.** Không có controller/service/entity/migration nào được triển khai trong lượt này.

| Façade frontend đã dùng | Endpoint đề xuất | Ghi chú tích hợp |
| --- | --- | --- |
| `EduStore.list('offerings')`, `latestOfferings()`, `isPubliclyListable()` | `GET /api/offerings?type=&status=&page=&size=` | Predicate public = `status='published' AND availability='open'`; sort `publishedAt DESC, id ASC` |
| `EduStore.offering(id)` | `GET /api/offerings/{id}` | 404 phải về empty/error, không trả bản ghi đầu tiên |
| `EduStore.saveOffering()`, `transitionOffering()` | `POST/PATCH /api/tutor/offerings`, `POST /api/tutor/offerings/{id}/transitions` | `profileStatus='approved'` là **server authorization thật**, thay cho UI gate hiện tại |
| `EduStore.cartItems/cartAdd/cartUpdate/cartRemove` | `GET/POST/PATCH/DELETE /api/cart/items` | Giỏ nên server-side để nhiều thiết bị khớp; hiện chỉ sessionStorage cùng tab |
| `EduStore.validateCartForCheckout()` | `POST /api/cart/validate` | Trả `stale-price`/`not-enough-seats`/`closed` để client không âm thầm đổi giá |
| `EduStore.checkoutFromCart()` | `POST /api/orders` | Phải tạo order + contract + enrollment trong **một transaction**; `idempotencyKey` bắt buộc |
| `EduStore.ordersByLearner()`, `orderActions()` | `GET /api/orders?status=&channel=&page=` | Action trả về từ server theo state, client không tự suy ra |
| `EduStore.cancelOrder()`, `completeRefund()` | `POST /api/orders/{id}/cancellations`, `POST /api/refunds/{id}/complete` | Refund policy phải là cấu hình server, không phải hằng số frontend |
| `EduStore.releaseSession({contractId, lessonNo})` | `POST /api/contracts/{id}/sessions/{lessonNo}/confirmation` | Demo suy "buổi đã điểm danh chưa giải ngân" = `completedSessions − Σ sessionsReleased`. Backend cần **attendance record** thật (ai điểm danh, lúc nào) thay vì hiệu hai con số đếm; phí hủy (phần không hoàn) hiện ghi là release net 0 — chưa có quy ước nghiệp vụ. |
| `EduStore.markAttendance({contractId, lessonNo, status, note, homework})` | `PUT /api/contracts/{id}/sessions/{lessonNo}/attendance` | `absent` không tăng `completedSessions` vì không có buổi học để giải ngân; chỉ hợp đồng `active` nhận điểm danh; đánh dấu bắt buộc theo thứ tự. |
| `EduStore.sessionsOf(contractId)` | `GET /api/contracts/{id}/sessions` | Mỗi phần tử có `source: 'attendance' \| 'suy-dien' \| 'khong-xac-dinh'`. Backend phải trả mốc ngày thật cho từng buổi; hiện chỉ buổi đã điểm danh là có ngày thật, phần còn lại suy diễn nhịp 3 ngày và UI nói rõ điều đó. |
| `EduStore.resolvePaymentResult()` | `GET /api/payments/{id}` | **Không** tin `?status=` từ redirect; phải xác minh chữ ký/webhook cổng thanh toán |
| `EduStore.revenueSeries()`, `revenueSummary()`, `splitRelease()` | `GET /api/tutor/revenue?metric=&from=&to=`, `GET /api/admin/finance/summary` | `feeRateSnapshot` lưu theo từng release event, không đọc từ cấu hình hiện hành |
| `EduStore.walletSummary()`, ledger | `GET /api/wallets/me`, `GET /api/wallets/me/transactions` | Tách `availableToUse`/`escrowHeld`/`grossReleased` |
| `EduStore.submitReview()`, `reviewEligibility()` | `POST /api/orders/{id}/reviews` | Unique constraint theo `orderId`; chỉ nhận khi order `completed` |
| `EduStore.submitReport()`, `decideReport()` | `POST /api/reports`, `POST /api/admin/reports/{id}/decisions` | `state` terminal phải chặn ở DB, không chỉ ở client |
| `EduStore.userList()`, `setAccountState()` | `GET /api/admin/users`, `POST /api/admin/users/{id}/state` | Role/password/ledger **không** được phép sửa qua endpoint này |
| `EduStore.login()`, `logout()`, auth token | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/verify-email?token=` | Hiện tại chỉ là demo persona trong sessionStorage — **không phải xác thực** |

---

## 9. Việc chưa làm / bị chặn

- **BS01–BS09 chưa được giao:** không thêm chat realtime, rút tiền ngân hàng thật, tự giải ngân theo lịch, tự hủy lớp thiếu sĩ số. UI đã có được giữ nguyên.
- **Không triển khai Java:** không controller/service/entity/security/database/migration/PayOS/email/JSP.
- Bốn façade admin cũ (`EduTutorReview`, `EduJobReview`, `EduReport`, `EduPayout`) **vẫn đọc fixture riêng** của chúng. Lượt này không ép chúng sang store mới vì sẽ phải sửa đồng thời queue + detail + counter + dashboard; đây là hạng mục nên làm ở lượt sau để tránh "queue đọc store mới nhưng detail ghi store cũ".
- Chưa đối chiếu bản Google Doc online (prompt yêu cầu không mở dịch vụ bên ngoài).
