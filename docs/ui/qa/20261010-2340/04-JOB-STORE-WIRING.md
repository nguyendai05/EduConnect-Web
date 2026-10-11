# 04 — Hợp nhất bảng tin tìm gia sư (JOB) về một nguồn

Tài liệu này đồng thời là **spec wiring** cho các trang `job/*`. Áp dụng từ 2026-10-10.

## 1. Vì sao phải làm

Trước khi hợp nhất, thực thể "tin tìm gia sư" có **bốn bảng dữ liệu riêng**:

| Nơi giữ bảng | Mã tin dùng | Nội dung gắn với `TT-8841` |
|---|---|---|
| `js/data/fixtures.js` (store) | `TT-8833/38/39/41` (4 tin) | Gia sư Tiếng Anh lớp 10 |
| `js/pages/job/detail.js` | `TT-8841, -8820, -8796, -8750, -8620, -88412, -88209, -88590, -87910` (9 tin) | **Toán lớp 11 tại Thủ Đức** |
| `js/pages/job/applicants.js` | `TT-88412, -88209, -88590, -87910` (4 tin) | Toán lớp 11 tại Thủ Đức |
| `js/pages/admin/job-review-data.js` | `TT-8833…TT-8841` (9 tin) | Gia sư Tiếng Anh lớp 10 |

Hệ quả đã kiểm chứng:

1. `TT-8841` là **hai tin khác nhau** tùy trang (đây là va chạm mã thứ hai sau vụ `TT-8841` vừa là tin vừa là bút toán ví).
2. `detail.js` có cặp `TT-8841` / `TT-88412` trùng tiêu đề, trùng phụ huynh, chỉ khác mã và ngày đăng.
3. `applicants.js` nối sang `HD-20260926-018` và `HD-20260926-011` — **hai mã hợp đồng không tồn tại** trong store (store chỉ có `HD-20260810-018`). Bấm "Xem hợp đồng" là sang trang not-found.
4. Số "X gia sư đã ứng tuyển" và "24 tin phù hợp" là chữ ký tay, không liên quan bản ghi ứng tuyển nào.
5. Nút "Ứng tuyển" chỉ mở modal thành công — không có bản ghi được tạo, bấm lại lần hai vẫn thành công.

## 2. Quy tắc đã chốt

- **Một thực thể một bảng**: `EduStore` là nguồn duy nhất cho tin, hồ sơ ứng tuyển, số đếm và mốc nối đơn/hợp đồng. Trang không được giữ `const jobs = { 'TT-…': … }`.
- **Một không gian tên**: `TT-*` chỉ dành cho tin tìm gia sư (bút toán ví là `BT-*`). Mã tin chuẩn là `TT-8833 … TT-8841`, khớp hàng đợi kiểm duyệt admin.
- **Không bịa mã HD**: hợp đồng của tin phải lần theo `selectedApplicationId → order(channel JOB) → contractId`. Tin chưa có đơn thì hiển thị "chưa có đơn", không được gắn mã hợp đồng tự viết.
- **Số đếm dẫn xuất**: "X gia sư đã ứng tuyển" = `applicationsOfJob(id).length`; "Y tin phù hợp" = số card thực render.
- **Thao tác phải ghi store**: ứng tuyển / chọn hồ sơ / đóng tin gọi `applyToJob` / `selectApplication` / `closeJob`, có `idempotency` để bấm đúp không tạo bản ghi thứ hai.
- **Không đụng tiền**: ba thao tác trên không được tạo `financialEvents`, `ledger`, không đổi `wallets` (đã có assertion chặn).

## 3. API phía store (`window.EduStore`)

```js
job(id)                     // tin | null
jobBoard()                  // tin approved + đã đăng, mới nhất trước
applicationsOfJob(id)       // hồ sơ của một tin
applicationOfTutor(jobId, tutorId)
applicationsByTutor(tutorId)
jobsByLearner(learnerId)
application(id)
orderByApplication(appId)   // đơn kênh JOB tạo từ hồ sơ được chọn | null
contractOfJob(jobId)        // hợp đồng lần ra qua hồ sơ chọn → đơn | null
timeAgo(iso, now?)          // '2 giờ trước' | '3 ngày trước' | 'vừa đăng' | 'chưa đăng'
JOB_APPLICATION_STATUS      // ['submitted','shortlisted','selected','rejected','withdrawn']
applyToJob({ jobId, tutorId, proposedRate, message, slots:[{day,time}], idempotency })
selectApplication({ jobId, applicationId, learnerId, idempotency })
closeJob({ jobId, learnerId, idempotency })
```

`applyToJob` chặn: `job-not-found`, `job-not-approved` (tin chờ duyệt), `job-closed`,
`tutor-not-found`, `invalid-rate`, `already-applied` (một gia sư một lượt/tin), `duplicated` (idempotency).
`selectApplication` chặn: `job-not-found`, `not-job-owner`, `job-closed`, `application-not-found`
(kể cả hồ sơ của tin khác), `application-not-selectable`. Khi thành công: hồ sơ → `selected`,
các hồ sơ `submitted|shortlisted` còn lại của tin → `rejected`, tin → `availability:'closed'`
và gắn `selectedApplicationId`.
`closeJob` chặn: `job-not-found`, `not-job-owner`, `job-not-open`. Đóng tay **không** gắn `selectedApplicationId`.

### Hình dạng bản ghi

```js
job = { id, learnerId, title, subject, subjectLabel, grade, gradeLabel, level,      // level: thpt|thcs|adult
        sessionsPerWeek, durationMinutes, budgetPerSession, sessions,
        mode, modeLabel, region, district, experienceYears, experienceLabel,
        gender, genderLabel,                                                       // gender: all|female|male
        status,                                                                    // approved|pending|rejected
        availability,                                                              // open|closed
        publishedAt, expiresAt, description, focus: [string], tutorNote, privateNote?,
        signal, selectedApplicationId }
application = { id, jobId, tutorId, proposedRate, message, status, slots:[{day,time}], createdAt }
learner = { id, name, initials, studentName, grade, region, district, responseRate, memberSince }
```

## 4. Cách render thẻ (để không vỡ `hook-check.mjs`)

B keeping markup in HTML: đưa **một** mẫu thẻ vào `<template data-…-template>` trong file HTML,
JS `cloneNode(true)` rồi điền dữ liệu. Nhờ vậy selector/`data-*` mà JS dùng vẫn tồn tại trong HTML
và `hook-check.mjs` không phải ngoại lệ. Không sao chép chuỗi HTML trong JS.

Persona: `EduStore.getPersona()` → `{ role, learnerId, tutorId, … }`; `sessionLearnerId()` /
`sessionTutorId()` trả id đang đăng nhập. Trang công khai (`discover`, `detail`) phải chạy được
khi chưa đăng nhập (ẩn nút hành động, nói rõ cần đăng nhập) chứ không ném lỗi.

## 5. Cổng kiểm tra

```bash
node scripts/checks/store-check.mjs    # 574 PASS / 0 FAIL
node scripts/checks/static-check.mjs   # FAIL: 0
node scripts/checks/hook-check.mjs     # FAIL: 0
node scripts/checks/source-check.mjs   # chống mã bịa + chống bảng riêng
```

Không sửa `js/data/store.js`, `js/data/fixtures.js`, `css/components/*`, hay file dưới `docs/`.
Không chạy lệnh git làm thay đổi working tree.

## 6. API mở rộng cho kiểm duyệt và thương lượng (cùng phiên)

Kiểm duyệt tin (thay cho store thứ hai `educonnect:job-review-decisions:v1` — key này bị loại, chỉ
được `removeItem` đúng key đó, cấm `sessionStorage.clear()`):

```js
jobQueue(bucket)      // 'all'|'pending'|'hiring'|'closed'|'rejected'; sắp theo submittedAt tăng dần (đọc SLA)
jobQueueCounts()      // { all, total, pending, hiring, closed, rejected }
jobBucket(job)        // pending | rejected | hiring (approved+open) | closed (approved+closed)
jobPoster(jobId)      // { name, initials, role, district, responseRate, learnerId } | null — role suy từ grade của learner
JOB_QUEUE_BUCKETS, JOB_DECISIONS
decideJob({ jobId, decision:'approve'|'reject'|'close'|'reopen', reviewerId, note, idempotency })
```

`decideJob` chặn `job-not-found`, `invalid-decision`, `invalid-transition` (kèm `bucket`),
`reason-required` (reject cần lý do ≥ 10 ký tự), `duplicated`. `approve` đặt `publishedAt = now`,
`expiresAt = +30 ngày` và tin lập tức xuất hiện trên `jobBoard()`; mọi quyết định lưu
`job.decision = { action, reviewerId, note, at }`. Không sinh đơn, không sinh tiền.

Lời mời & thương lượng (trang `invitation/create`, `invitation/negotiation`):

```js
createInvitation({ learnerId, tutorId, offeringId, message, proposal:{pricePerSession,sessions,durationMinutes,scheduleText}, idempotency })
respondInvitation({ invitationId, by:'learner'|'tutor', decision:'accept'|'decline'|'counter', proposal, note, idempotency })
invitation(id), invitationsOfLearner(id), invitationsOfTutor(id), currentProposal(inv), acceptedProposal(id)
INVITATION_STATUS = ['pending','negotiating','accepted','declined','expired']
INVITATION_TERMINAL = ['accepted','declined','expired']
```

Quy tắc đã chốt và đã có assertion: không tự duyệt đề xuất của chính mình
(`cannot-answer-own-proposal`), `counter` sinh phiên bản N+1 và đưa phiên bản cũ về `countered`,
`accept` lưu snapshot làm nguồn dựng đơn (`acceptedProposal`), một offering không mở hai lời mời
cùng lúc (`invitation-open-exists`), và **chấp nhận lời mời không tự tạo đơn** (orders/ledger/ví
giữ nguyên — chặn đúng ràng buộc "không được tuyên bố đã thanh toán/chốt đơn chỉ vì bấm nút").
Mã lời mời mới theo khuôn fixture `INV-YYYYMMDD-NNN`.

`getPersona()` (không tham số) nay trả **persona của phiên đang mở**; trước đây nó luôn trả
`DEFAULT_PERSONA_ID` nên lệch với `sessionTutorId()`/`sessionLearnerId()`.

## 7. Tình trạng wiring (đo bằng `source-check`, không đo bằng lời báo cáo)

| Trang | Trạng thái | Bằng chứng |
|---|---|---|
| `job/detail` | xong | 0 literal `TT-*`; submit tạo `APP-2026-0415` thật, modal nêu mã vừa sinh |
| `job/applicants` | xong | 3 hồ sơ `TT-8833`, link hợp đồng `HD-20260926-025` suy dẫn; `HD-…-018/-011` biến mất |
| `job/discover` | xong | 7 card từ `jobBoard()`, "7 tin phù hợp", 3 card `applied` theo hồ sơ GS-05 |
| `job/my-job` | xong | render `jobsByLearner(sessionLearnerId())`, đóng tin gọi `closeJob` |
| `admin/job-review-*` | xong | hàng đợi khớp `jobQueueCounts()`; duyệt `TT-8840` → `decision.reviewerId = ADMIN-01`; key `job-review-decisions:v1` chỉ còn `removeItem` |
| `invitation/create` | xong | tạo `INV-20261011-001` thật rồi chuyển sang trang thương lượng theo mã |
| `invitation/negotiation` | xong | `INV-20261009-018` hiển thị `240.000 ₫ · 30 buổi` của store; chuỗi cũ `220.000 · 8 buổi` không còn |
| `tutor/profile`, `tutor/search` | xong | GS-01 đọc 2 dịch vụ + 1 review (`ratingSummary = 4,0/1`); search render 8 thẻ, số kết quả = số thẻ thật |
| `admin/dashboard.js`, `admin/audit-logs.js`, `chat/messages.js` | **chưa nối** | còn bảng hằng số; dashboard ghi "5 tin chờ" trong khi store `pending 0` (xem `02-UI-QA.md` §Q7) |
