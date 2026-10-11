# Phụ thuộc và hợp đồng dùng chung

Snapshot như báo cáo 01; chưa triển khai. **Hiện tại không có API nghiệp vụ, DTO Java, enum Java, entity hoặc migration thực thi** (E00/E16). Các API/model/file mới dưới đây đều là **đề xuất** để nhóm chốt trước phát triển. Không trình bày path REST/JSP đề xuất như route hiện có.

## 1. Quyền điều phối file/module

Một file chỉ có một người ghi ở một thời điểm. Người cung cấp module có thể giao patch có phạm vi; chủ file áp sau khi khóa phiên bản/slot. Cùng chủ sở hữu cũng không giao hai gói chạy song song chỉnh cùng file. Không refactor ngay trong audit.

| File/module thực tế hoặc mới đề xuất | Điều phối | Người cung cấp/tiêu thụ | Ranh giới và thứ tự |
| --- | --- | --- | --- |
| `pom.xml`, `src/main/resources/application.yml`; test profile mới | Đại | Huy cần DB/PayOS, Đạt cần static/JSP | SHARED-DB-01; chỉ Đại sửa dependency/config; không chèn credential |
| `src/main/resources/db/migration/` (hiện chỉ README) | Đại | Huy draft commerce DDL; Đại draft account/review/report | V1 accounts → V2 catalog/order → V3 ledger/report. Huy gửi schema request, không tự tạo migration trùng số |
| `config/PageController.java`, `WebMvcConfig.java` **mới** | Đại | Chủ page gửi route/view/nav requirements | SHARED-UI-01 phát router v1, sau đó nhận patch mapping batch; không owner tự sửa PageController |
| `security/`, `auth/`; `user` account/profile và tutor profile backend **mới** | Đại | Tất cả API cần principal; Đạt logout/profile | SHARED-AUTH → REGISTER/LOGIN/RESET; SHARED-PROFILE song song phần riêng. Không Huy/Đạt sửa session security |
| `js/core/api-client.js`, `session.js` **mới** và production mirrors | Đại | Tất cả pages | A01 freeze; caller không copy fetch/auth/error logic sang page |
| `ui-prototype/components/layout/*.html`, core shell/header/sidebar JS; JSP fragments **mới** | Đại, cấp lượt riêng Đạt cho header | Đạt logout/home/history; Huy cart/manage/admin nav | SHARED-UI → BB03-UI → nav patch mới; Huy cung cấp link và role, không edit layout trực tiếp |
| `ui-prototype/css/{tokens,base,layouts}.css` | Đại | Chủ page | Chỉ thay foundation khi có nhu cầu cụ thể; không sửa hàng loạt các thay đổi WIP hiện tại trong audit |
| Form/table/tabs/modal/pagination: `components/{form,data-display/table.html,navigation,feedback}`; `css/components/`; `js/core/{modal,tabs,pagination,select,...}.js` | Đại | Đạt/Huy gửi component contract change | Ưu tiên API/slot hiện có; một patch chung, test component rồi caller update. Scope riêng page không kéo CSS component vào page |
| `catalog/entity/{Offering,GroupClass}.java`, detail/availability/write backend **mới** | Huy | Đại catalog query, Đạt detail/list/home | Freeze fields/readonly projections trước SHARED-CATALOG; Huy thay model báo version, Đại không sửa entity khi viết query |
| Public query `tutor/controller/PublicTutorController.java`, `catalog/controller/CatalogQueryController.java`, `catalog/service/CatalogQueryService.java`, `catalog/repository/CatalogQueryRepository.java` **mới** | Đại | Đạt TC07/08/09/10, Huy availability source | Gói SHARED-CATALOG; Huy cấp detail/eligibility contract, không clone query theo từng mã |
| `order/`, `contract/`, `payment/`, `wallet/`, `cart/`, `enrollment/` business DTO/enum/entity **mới** | Huy | Đại stats/review/report, Đạt history/detail | SHARED-COMMERCE version1 → create/read → payment/event → cancel; chỉ Huy đổi shared states/monetary fields |
| `invitation/`, `job/` backend **mới**, invitation/job prototype page files | Huy | Đại user gates, Đạt storefront selection | MATCHING-01; Huy BB12 JobModeration dùng cùng service, không viết duplicate state logic |
| `ui-prototype/pages/tutor/search.html`, `js/pages/tutor/search.js`, `css/pages/tutor/search.css` | Đạt | Đại filter patch/API; Huy detail link | TC08 shell + TC06 patch → TC07 sort → BB03 remove logout toast nếu còn; không Đại edit search trực tiếp |
| `ui-prototype/pages/tutor/profile.html`, `js/pages/tutor/profile.js`, `css/pages/tutor/profile.css` | Đạt | Huy data; Đại review/report modules | BB05-UI skeleton → TC09 list → REVIEW/REPORT slots; một lượt patch host |
| `ui-prototype/pages/account/profile.html`, `tutor/my-profile.html` và JS/CSS tương ứng | Đạt | Đại profile/approval DTO | TC01-UI; Huy quản lý offering ở manage riêng, không sửa phí profile bằng UI catalog |
| `ui-prototype/pages/order/history.html` và JS/CSS **mới** | Đạt | Huy cancel/read; Đại review/report | BB09 shell → cancellation → review/report; các module bên ngoài mount theo slot, không cùng edit history |
| `ui-prototype/pages/contract/confirm.html` và JS/CSS | Huy | Đại auth, Đạt selection | BB07-01 xong rồi BB08 quote-context patch; không script frontend tự tính paid |
| `ui-prototype/pages/contract/{student-detail,tutor-detail}.html`, JS/CSS | Huy | Đạt order summary patch; Đại review/report | TC02 base → BB09 summary → TC03 cancel → REVIEW/REPORT mount; Huy áp toàn host patch |
| `ui-prototype/pages/payment/*.html`, JS/CSS; wallet/overview files | Huy | Đạt history links; Đại ledger/stats read | BB08 → TC03 refund presentation; wallet mutation chỉ server Huy, không Đại chart cập nhật wallet |
| `ui-prototype/pages/tutor/manage.html`, JS/CSS **mới** | Huy | Đại stats module, Đạt header | BB13 shell có stats slot → STATS mount patch; Đại không sửa host manage |
| Admin `tutor-review-*`, `job-review-*` pages/JS/CSS/data; admin/manage **mới**; audit-logs integration tối thiểu | Huy | Đại approval/account API/audit event | BB12; chỉ dùng data fixture để QA trước integration, production read server. Không giao payout automation |
| `ui-prototype/pages/admin/dashboard.html`, JS/CSS + aggregate service **mới** | Đại | Huy ledger/event reads | STATS; không hard-code fee, migration/revenue data Huy cung cấp contract |
| `ui-prototype/pages/admin/{reports,report-detail}.html`, JS/CSS/report-data + report backend **mới** | Đại | Huy financial events, Đạt sender host | REPORT; chỉ Đại kết luận report, Huy kiểm tra/refund tiền theo event, không hai bên tự refund |
| Review/report reusable forms **mới**, `notification/` outbox/record **mới** | Đại | Huy event source, Đạt host mount | REVIEW/REPORT; Huy gửi typed notification request vào facade, không sửa notification module |
| `ui-prototype/pages/home.html`, JS/CSS **mới** | Đạt | Đại latest catalog/router, Huy detail | TC10; brand nav nhận lượt sau shared header, không copy data nguồn |

Các đường Java rút gọn trong bảng đều dưới `src/main/java/com/educonnect/`; production mirrors tuân báo cáo03. `ui-prototype/assets/brand/` untracked và 165 file WIP giữ nguyên khi khảo sát; không dùng audit như quyền để ghi đè công việc của người khác.

## 2. Data/state hiện tại và thay đổi đề xuất

### Hiện tại từ code

| Nguồn | Trường/trạng thái thực tế | Ý nghĩa/giới hạn |
| --- | --- | --- |
| Header `user-header.js:19` | persona A/B/C/D/E/STUDENT/TUTOR, profileName/profileRole | UI variant, không security role |
| `tutor/my-profile.js:6` / `admin/tutor-review-data.js:349` | draft, pending, rejected, verified | State preview; readDecisions/review validate local, server enum chưa có |
| `TUTORS[*].plans` trong profile.js | subject, grade, price, desc; button data subject/grade/price | Không offeringId/publication/terms/sessions/capacity |
| Search data-* | name, subject, grade, district, region, delivery, price, days, periods, verified, rating | Search/sort in-browser; counts/page chưa từ database |
| Invitation negotiation | pending, countered, accepted, rejected, expired; fee/sessions/minutes/week/slots phiên bản | Proposal/consent local; không Order entity |
| Job/admin job store | pending, hiring, closed, rejected; review reason/reviewedAt | Job tuyển người, không OrderStatus |
| Contract/student detail | label trạng thái tiếng Việt, fee/dates/schedule/awaitingDeposit; lesson completed/pending/upcoming/reported/cancelled | Contract/lesson có fixture riêng, không đồng bộ data persisted |
| Payment checkout/QR | contract, reference, total, wallet, due, expiresAt, state pending/expired/cancelled; result views pending/success/failed/cancelled | Các record preview và cách trình bày; state từ URL không authoritative |
| Wallet `overview.js:3` | id,type,title,date,time,amount,account,before,after,status,contract | Sổ giao dịch mẫu, không accounting ledger thật |
| Report store `report-data.js:442` | open/investigating/resolved/dismissed, resolution,note,reviewedAt | Local decision; không refund command thực |
| Payout store `payout-data.js:122` | pending→processing→completed hoặc rejected; reason/transactionCode | Withdrawal preview khác disbursement revenue và refund order |
| Dashboard `buildSnapshot` | gmvTrend/escrowMix, fee8%, released/escrow hard-code | Biểu đồ cột/thanh tỷ trọng, không pie/database aggregate |
| Java/DB | Không DTO/enum/entity/bảng | Không thể công bố DTO REST đã có từ fields fixture |

### Mô hình và trạng thái mới — đề xuất cần chốt

Tất cả tên entity/table dưới đây mới đề xuất. Tên table chỉ là ý tưởng DDL, Đại chốt actual naming trong SHARED-DB-01; không bảng nào đang tồn tại trong code.

| Mô hình/bảng đề xuất | Quan hệ/fields cần | Owner logic/schema |
| --- | --- | --- |
| Account `accounts`, AccountToken `account_tokens` | id/role/emailVerified/accountStatus/passwordHash/version; tokenHash/purpose/expiry/consumedAt/accountId | Đại/Đại |
| TutorProfile `tutor_profiles`, subject/availability/attachment | accountId, reviewStatus, accepting, subject/rate/slot records, verified/publication timestamps/version; attachment owner/access metadata | Đại/Đại |
| Offering `offerings`, GroupClass `group_classes` | tutorId/type/subject/grade/sessions/duration/mode/location/price/currency/termsVersion/publishedAt/status/version; group schedule/capacity/open seats | Huy/Đại |
| Invitation/ProposalVersion, Job/Application | owner/tutor/sourceId/version/consent/expiry; selectedApplication invariant, public reviewed job | Huy/Đại |
| Cart/CartItem | ownerId/revision/offeringId/choice/termsVersion, no authoritative client price | Huy/Đại |
| Order `orders` / OrderItem `order_items` | buyerId/channel/sourceId/idemKey/status/version; itemId/offeringId/tutorId immutable title/price/sessions/terms snapshots | Huy/Đại |
| Contract `contracts` / Enrollment `enrollments` / Reservation | orderItem link, participants, agreed terms/version/schedule/status; groupId/learnerId/seat hold/expiry/unique active enrollment | Huy/Đại |
| PaymentAttempt `payment_attempts`, WalletAccount, LedgerEntry | orderId/providerPaymentId/amount/status/expiry; owner/currency/accountKind; businessEventId/unique key/debit-credit/release/refund references | Huy/Đại |
| Release/Refund records | grossReleased/tutorNet/platformFee/feeRateSnapshot/releasedAt; refundRequested/refundableQuote/approved/postedAt/idem event | Huy/Đại |
| Review `reviews` | buyerId/orderItemId/contractId/offeringId/tutorId/rating/text; unique eligibility key quyết định Q09 | Đại/Đại |
| Report `reports`, decision/evidence/outbox/audit | reporter/target/reason/evidence access/status/version/resolution/actor/time; notification delivery id/event ref | Đại/Đại |

Quan hệ đề xuất: Account1→profile; Tutor1→Offering nhiều; Order1→OrderItem nhiều; mỗi item có link Contract và/hoặc Enrollment được chốt Q02, **không gộp Order=Contract**; PaymentAttempt nhiều→Order; ledger event liên kết order/contract/attempt/refund; Review giữ buyer/item/contract/offering; Report target có type/id; audit/notice giữ businessEventId. Huy draft, Đại kiểm migration/FK/index, Huy test integration tiền, Đại review quyền và totals, Đạt test consumer.

Enums đề xuất (chưa phải quyết định nghiệp vụ):

- Role: `LEARNER`, `TUTOR`, `ADMIN`; phụ huynh/người học có thể cùng LEARNER với profile subtype theo Q01.
- OfferingStatus: `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `CLOSED`; group capacity là invariant riêng, không chỉ status label.
- Channel: `INVITATION`, `JOB`, `GROUP_CLASS`.
- OrderStatus: `PENDING_CONFIRMATION`, `AWAITING_PAYMENT`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLATION_REQUESTED`, `CANCELLED`; refunded là trạng thái refund riêng, tránh coi CANCELLED luôn đã trả tiền.
- ContractStatus: `AWAITING_CONSENT`, `AWAITING_ESCROW`, `ACTIVE`, `COMPLETED`, `CANCELLED`; allowedActions phụ thuộc principal/event/version.
- PaymentStatus: `PENDING`, `SUCCEEDED`, `FAILED`, `EXPIRED`, `CANCELLED`; RefundStatus: `REQUESTED`, `APPROVED`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `REJECTED`.
- Tutor review/report statuses giữ semantic hiện có nếu nhóm đồng ý; không tự ánh xạ lesson.pending thành order.awaiting payment.

Không endpoint `PATCH status=<bất kỳ>` cho đơn/hợp đồng. Submit event cụ thể với version/idemKey; Huy service xác minh từ trạng thái trước và quyền, trả new state/allowedActions. Due/available/escrow/released/fee/refunded giữ trường riêng; một transaction/event unique điều phối update trạng thái và ledger. Không kích hoạt contract chỉ vì browser redirect success.

## 3. Hợp đồng API đề xuất

Tất cả method/path dưới đây **chưa có**. Prefix `/api` là đề xuất phù hợp UI JavaScript/JSP định hướng hiện tại; nhóm có thể chọn form MVC tương đương nhưng phải giữ DTO/rules. Principal lấy từ server session; userId/role client không cấp quyền. ID/version/requestId là kỹ thuật, không cần để lộ cho người dùng ngoài khi giúp xử lý lỗi.

Error envelope đề xuất: `{ code, message, fieldErrors, requestId }`. 400 input; 401 session; 403 role/owner; 404 không thấy/không được công khai; 409 version/terms/availability/duplicate business state; 413 file quá lớn; 429 giới hạn; 502/503 external failure. Không stacktrace/secret/private profile trong response/log. Với resource riêng có thể dùng404 để không lộ tồn tại, phải thống nhất Q01.

### A01 — Auth/session, Đại cung cấp; mọi page dùng

| Method/path đề xuất | Input | Response | Quyền/lỗi/gói |
| --- | --- | --- | --- |
| `POST /api/auth/register` | name,email,phone,password,requestedRole (không ADMIN) | accountId,emailVerificationRequired,tutorReviewStatus | Public; 400/409/429/mail retry; AUTH-REGISTER-01 |
| `POST /api/auth/email-verification/request` | email | accepted chung, không lộ email tồn tại | Public;429; AUTH-REGISTER-01 |
| `POST /api/auth/email-verification/confirm` | token | verified, nextAction | Token đúng/expiry/single-use;400/409; AUTH-REGISTER-01 |
| `GET /api/auth/csrf` | Không | token/headerName (chỉ client cần) | Cơ chế CSRF đã chốt; SHARED-AUTH-01 |
| `POST /api/auth/login` | email,password + CSRF theo cơ chế | user{id,role,displayName,accountStatus,emailVerified,tutorStatus}, session cookie | Public; invalid/locked/banned/unverified,429; SHARED-AUTH/AUTH-LOGIN |
| `GET /api/auth/session` | Cookie | user/permissions hoặc401 | Không tin persona data-*; SHARED-AUTH-01 |
| `POST /api/auth/logout` | Cookie/CSRF | 204 (đề xuất idempotent) | Auth/đã logout; invalid session policy; server invalidate; Đạt BB03-UI dùng |
| `POST /api/auth/password-reset/request` | email | accepted chung | Public;429/mail sink; AUTH-RESET-01 |
| `POST /api/auth/password-reset/confirm` | token,newPassword | reset,nextAction | Token valid/consume,invalid400,used409; AUTH-RESET-01 |

Client façade mới đề xuất: `EduApi.request(method,path,{body,query,signal})` xử lý same-origin cookie/CSRF/errors; `EduSession.current()/logout()/clear()` không tự giữ authoritative role. Header tiêu thụ current user; không lưu password/token trong sessionStorage. Client contract xuất bản xong mới Đạt nối logout.

### A02 — Self profile/approval, Đại cung cấp; Đạt/Huy dùng

| Method/path | Input | Response | Quyền/lỗi |
| --- | --- | --- | --- |
| `GET /api/me/profile` | Không | id,name,contact/bio,version,editableFields | Own LEARNER/TUTOR;401 |
| `PATCH /api/me/profile` | allowlisted name/phone/bio/email-change-request,version | saved profile/version, emailVerificationRequired nếu đổi mail | Own;400/409; không role/status input |
| `GET /api/me/tutor-profile` | Không | tutorId,bio,education,subjects/rates,slots,attachments,reviewStatus,publicEligible,version,editableFields | Own TUTOR;403/404 |
| `PATCH /api/me/tutor-profile` | allowed fields/version | profile/new status/reapprovalRequired | Own TUTOR;400/409 |
| `POST /api/me/tutor-profile/submission` | version | PENDING_REVIEW/profileVersion | TUTOR; thiếu evidence400,duplicate409 |
| `POST /api/me/evidence` / `GET /api/me/evidence/{id}` | file/purpose; id | attachmentId/metadata; controlled bytes | Owner/admin authorized,403/413/type400; no public raw private URL |

DTO phải tách self private fields và public tutor fields; public list không trả contact/identity/evidence gốc. SHARED-PROFILE-01 own implementation; Đạt TC01-UI chỉ render editableFields/server errors, Huy BB12 consume moderation phía A10.

### A03–A04 — Catalog, Đại query/Huy detail; Đạt tiêu thụ

| Method/path | Params/body | Response | Quyền/lỗi/owner |
| --- | --- | --- | --- |
| `GET /api/tutors` | q,subjectId,gradeId,minFee,maxFee,regionId,district,mode,days,periods,sort,page,size | items{tutorId,name,specialties,rating,feeFrom,publicStatus},page,size,total | Public approved eligible **luôn áp server**;400 range/allowlist; Đại SHARED-CATALOG |
| `GET /api/tutors/{id}` | tutorId | PublicTutorResponse, review summary; không private contact | Public eligibility404; Đại query, fields từ SHARED-PROFILE |
| `GET /api/offerings` | type/subject/grade/fee/area/mode/schedule,q,sort,page,size | items{offeringId,tutorId,type,title,fee,currency,priceUnit,publishedAt,status,availability},pagination | Public approved/open; sort rating/price-asc/price-desc/newest+stableId; Đại |
| `GET /api/tutors/{id}/offerings` | page,size,type | cùng offering summaries | Public tutor eligible;404/400; Đại; Đạt TC09 |
| `GET /api/offerings/{id}` | offeringId | detail{id,type,tutor,subject,grade,description,sessions,durationMinutes,fee,currency,priceUnit,mode,location,schedule,termsVersion,status,publishedAt,capacity,availableSeats,registrationConditions,allowedActions,version} | Public visible404; availability/display không giữ chỗ; Huy BB05-DATA, Đạt BB05-UI |

Home dùng `/api/offerings?sort=newest&size=<chốt>&page=0` với predicate published/open/còn đăng ký, không endpoint latest thứ hai cần viết lại query. Empty `items:[]/total:0` khác lỗi. TC06 Đại cung cấp params/filter patch; TC07/08/09/10 Đạt consume. DTO detail phải frozen trước UI, runtime capacity vẫn kiểm lại checkout.

### A05 — Matching/cart/order/contract, Huy cung cấp; Đạt lịch sử/chi tiết dùng

| Method/path | Input | Response | Quyền/lỗi/gói |
| --- | --- | --- | --- |
| `POST /api/invitations` | tutorId,offeringId nếu có,terms/slots/version,idemKey | invitationId,proposalVersion,status,expiresAt | LEARNER, tutor public;400/409; MATCHING |
| `GET /api/invitations/{id}` | ID | participants,version,currentTerms,status,allowedActions | Participant/ADMIN,403/404; MATCHING |
| `POST /api/invitations/{id}/counter` / `accept` / `reject` | version,newTerms hoặc reason,idemKey | newVersion/status,agreedTermsRef nếu accepted | Đúng bên theo event;expired/version409; MATCHING |
| `POST /api/jobs` / `GET /api/me/jobs` / `GET /api/jobs/{id}` | Create fields/own page/ID | job/owned page/public reviewed detail | Owner create/list; public approved detail;400/403/404; MATCHING |
| `POST /api/jobs/{id}/applications` | proposedTerms,version,idemKey | applicationId,status | eligible TUTOR, mỗi tutor1 active application;409; MATCHING |
| `POST /api/jobs/{id}/selection` | applicationId,jobVersion,idemKey | selectedSourceId,termsRef | Chủ tin, duy nhất selected;403/409; MATCHING |
| `POST /api/jobs/{id}/closure` | version,reason | closed job | Chủ tin/admin đúng rule; không cancel order; MATCHING |
| `GET /api/cart` / `POST /api/cart/items` | Không / offeringId,choice,termsVersion | cart{id,revision,items,serverTotal,currency,warnings} | Own LEARNER,400/409; BB06 |
| `PATCH /api/cart/items/{id}` / `DELETE /api/cart/items/{id}` | choice/quantity nếu Q02 cho phép,revision | new cart revision/total | Owner; stale/unavailable409; BB06 |
| `POST /api/orders` | cartRevision hoặc channel/sourceId/sourceVersion,consentVersion,idemKey | order{id,status,items,total,currency,contractRefs,enrollmentRefs,allowedActions,version} | LEARNER owner; giá/terms/capacity/source409,403; BB07 |
| `GET /api/me/orders` / `GET /api/tutor/orders` / `GET /api/admin/orders` | from,to,status,channel,page,size | owned/scoped OrderPage | role tương ứng,401/403/400; BB07 query; Đạt/Huy consume |
| `GET /api/orders/{id}` | ID | order,items immutable snapshots,contracts,payments,refund summaries,allowedActions,version | Buyer/participating tutor/ADMIN đúng scope;403/404; BB07 |
| `GET /api/contracts/{id}` | ID | participants,orderItemRef,terms/schedule,status,consent,financialSummary,allowedActions,version | Participant/admin;403/404; BB07/TC02 |
| `POST /api/contracts/{id}/consents` | termsVersion,contractVersion,idemKey | consent state/nextAction | Bên còn cần consent;409 expired/stale; BB07 |
| `POST /api/contracts/{id}/events` | event,version,idemKey,lessonRef nếu cần | new contract/order/allowedActions/financial summary | Role/event allowlist;400/403/409; TC02 |

Group enrollment/capacity là service của MATCHING-01/BB07 transaction, không cần một public endpoint cho client tự xác nhận chỗ. Order request channel=GROUP_CLASS/offeringId phải giữ chỗ/unique enrollment theo Q06. Ba kênh đều tạo record có source reference; không chứng minh BB07 chỉ bằng đăng ký nhóm. Huy query API release sớm cho Đạt, state chưa settlement phải được biểu diễn pending thật.

### A06–A07 — Payment/wallet/cancel/refund, Huy cung cấp; Đại aggregate/review, Đạt history dùng

| Method/path | Input | Response | Quyền/lỗi |
| --- | --- | --- | --- |
| `POST /api/orders/{id}/payment-quote` | orderVersion | total,availableToUse,walletHold,payosDue,currency,quoteVersion,expiry | Buyer; stale409; amounts server; BB08 |
| `POST /api/orders/{id}/payments` | quoteVersion,idemKey | paymentId,status,amount,expiresAt,checkoutUrl/qrData nếu due>0; financialSummary | Buyer; balance/quote409,provider502/503; due0 không PayOS; BB08 |
| `GET /api/payments/{id}` | paymentId | verified status/orderId/amount/expiry/summary/nextAction | Buyer/admin/participant authorized projection,403/404; BB08 |
| `POST /api/payments/payos/webhook` | Provider payload/signature | ack theo provider contract | Không user session; verify provider signature/order/amount, replay idempotent; invalid400; BB08. Không chọn thuật toán từ fixture |
| `GET /api/me/wallet` / `GET /api/me/transactions` | Range/type/page | available/escrow/released/refund/pending fields tách; ledger page | Own user/tutor;401/400; khác role dataset; BB08 |
| `POST /api/orders/{id}/cancellation-quote` | orderVersion | eligible,reason,refundableHeld,alreadyReleased,proposedRefund,currency,policyVersion | Buyer/authorized participant; không tùy amount client; TC03 |
| `POST /api/orders/{id}/cancellations` | reason,policyVersion,orderVersion,idemKey | cancellationId,status,refund{id,status,amount},notifications | Buyer/authorized event;403/409; TC03 |
| `POST /api/admin/cancellations/{id}/decision` | action,note,version,idemKey | outcome/refund state | ADMIN nếu Q05 cần approval;400/403/409; TC03 |
| `GET /api/refunds/{id}` | ID | amount/currency/status/lastFailure/nextAction | Owner/admin authorized;403/404; TC03 |

Đề xuất invariants: `grossReleased = tutorNetReleased + platformFeeReleased`; tiền ký quỹ còn giữ không vào doanh thu; refund không vượt phần hoàn được đã thực giữ, release/refund không double-post; available không âm. Phí lấy policy version/snapshot khi thỏa thuận, không dùng hard-code8%/10% ở chart. Credit available do release khác bank withdrawal; không giao withdrawal bổ sung. Mỗi webhook/command có business event unique; xử lý late success phải đối chiếu order/cancellation và reserve, không chỉ nhìn expiry UI.

Result page dùng paymentId để fetch A06, bỏ quyền quyết định từ `?status`. Có thể còn `status` phục vụ preview, production phải lấy server state; client pending không báo paid. Payment cancel khác order cancel; TC03 không bị bỏ vì đã có QR cancel.

### A08–A11 — Review/report/admin/statistics

| ID/method/path đề xuất | Input → response | Quyền/lỗi | Cung cấp → dùng |
| --- | --- | --- | --- |
| A08 `POST /api/orders/{id}/reviews` | itemId/contractId,rating,text,idemKey → saved ReviewResponse | Buyer+completed eligible,400/403/409 duplicate | Đại REVIEW → Đạt/Huy detail host |
| A08 `GET /api/offerings/{id}/reviews` / `GET /api/tutors/{id}/reviews` | page,size → items/aggregate | Public eligible404; sanitized public projection | Đại REVIEW → Đạt profile/catalog |
| A09 `POST /api/reports` | targetType,targetId,reason,evidenceIds,relatedContractRef,idemKey → reportId/status | Signed-in valid target/own evidence,400/403/404 | Đại REPORT → Đạt/Huy modal |
| A09 `GET /api/me/reports` / `GET /api/reports/{id}` | page/id → permitted details/status/outcome | Sender/authorized participant/admin projections,403/404 | Đại → sender section |
| A09 `GET /api/admin/reports` | status,type,severity,q,page,size → ReportPage | ADMIN403 | Đại → reports UI |
| A09 `POST /api/admin/reports/{id}/decisions` | action/resolution,note,version → outcome/audit/notificationRef | ADMIN,invalid400/stale/terminal409 | Đại → admin detail; approved financial request cho Huy TC03 |
| A09 `GET /api/me/notifications` | page → own notices | Owner401 | Đại notification facade; minimal notice thuộc BB/TC, không realtime BS |
| A10 `GET /api/admin/users` / `POST /api/admin/users/{id}/actions` | filters; event/reason/version → page/account state | ADMIN400/403/409, không tùy sửa password/ledger | Đại account API → Huy manage |
| A10 `GET /api/admin/tutor-profiles` / `POST /api/admin/tutor-profiles/{id}/reviews` | filters; approved/rejected,reason,version → profile state/audit | ADMIN; thiếu evidence400/stale409 | Đại profile → Huy tutor review UI |
| A10 `GET /api/admin/jobs` / `POST /api/admin/jobs/{id}/reviews` | filters; approve/reject,reason,version → job state/audit | ADMIN;400/409 | Huy MATCHING/BB12 → Huy review UI |
| A10 `GET /api/admin/offerings` / `POST /api/admin/offerings/{id}/actions` | filters; publish/close/reject,reason,version → state | ADMIN; valid transition409 | Huy BB12 → manage |
| A10 `GET /api/tutor/offerings` / `POST /api/tutor/offerings` / `PATCH /api/tutor/offerings/{id}` | fields/version → page/detail/reapproval | Own eligible TUTOR;400/403/409 | Huy BB13 → tutor/manage |
| A10 `GET /api/admin/audit-events` | module/from/to/page → masked events | ADMIN403,range400 | Đại audit/notification facade, Huy host logs integration |
| A11 `GET /api/statistics` | from,to,bucket,metric,dimension,scope theo quyền → period/timezone/currency/unit/barSeries/pieSeries/totals/asOf | TUTOR own net release; ADMIN platformFee/count;400/403 | Đại STATS → dashboard/module tutor/manage |

A11 metric/unit phải explicit: tiền VND của event releasedAt hoặc count đơn/giao dịch; dimension chọn order status/channel theo Q04. Date from/to boundary/timezone/empty buckets được freeze trước UI. Nếu tutorId filter admin được phép, server bỏ/deny tutor override của tutor thường. Pie count các trạng thái phải đếm một thực thể đã chốt, không trộn order, lesson và contract trong cùng denominator.

## 4. Điểm giao nhau và kế hoạch nối từng luồng

| Luồng | Nhà cung cấp/đầu ra cần có | Consumer/điều kiện nối | Điểm giao nhau xử lý |
| --- | --- | --- | --- |
| Register→verify→login→logout | Đại A01 account/session/token tested | Đại auth pages; Đạt BB03 header sau client freeze | Header/core do Đại cấp lượt, Huy chỉ áp admin link patch |
| Profile→approval→public tutor | Đại A02/A10,publicEligible/event | Đạt TC01; Huy BB12; Đại catalog query | Tutor entity một owner Đại; offering Huy reference readonly |
| Search/filter/sort→profile→offerings/detail | Đại A03/A04 query; Huy A04 detail/eligibility | Đạt TC08→TC07 và BB05→TC09 | Search/profile Đạt ghi một lần; filter patch Đại được Đạt áp, no parallel overwrite |
| Mời dạy→thương lượng→order/contract | Huy A05 invitation/version/terms + ordercreate | Huy matching/confirm; Đạt selection truyền offering ID | Contract terms DTO Huy duy nhất, không mỗi page một fixture |
| Tin→ứng tuyển→chọn gia sư→order | Huy A05 job/application/selection/moderation | Huy job/admin/create | Admin/job service cùng owner, shared selected uniqueness; không khác data store |
| Group→detail→cart/hold→order | Huy A04 group + MATCHING seat service | Đạt detail/list; Huy cart/order | Capacity server/DB, UI availability chỉ informative; basic race checks không BS |
| Order→wallet hold→PayOS/result | Huy A06/A07 authoritative amounts/verify | Huy payment/wallet; Đạt history | Huy tiền/enum owner; Đại chỉ read aggregation; no URL-authoritative payment |
| History→cancel/refund→notice | Huy read/cancel/refund + Đại notice | Đạt history host; Huy detail/admin | Cancellation module Huy bàn giao slot; Đạt không tính refund |
| Completed→review→public rating | Huy TC02 completed/ownership → Đại A08 | Đạt/Huy host modal, Đạt profile list | Không review từ fixture success; aggregate query nhận real persisted rating |
| Report→admin decision→status/financial request | Đại A09 persist/evidence/version/notice | Đại admin; Đạt sender; Huy approved refund if needed | Đại quyết định report, Huy monetary invariant; unique event ngăn double refund |
| Released ledger→statistics | Huy Release/read projection → Đại A11 | Đại dashboard, Huy tutor/manage slot |8%/10% snapshot chốt Q04; không count completed UI/withdrawal as revenue |

Các gói giao cùng file phải nối tiếp:

1. `tutor/search.*`: TC08-UI-01 dựng API/query/filter slot → patch TC06 từ SHARED-CATALOG → TC07-UI-01 → BB03 cleanup nếu còn. Đạt điều phối; Đại chỉ ghi backend/patch riêng.
2. `tutor/profile.*`: BB05-UI-01 → TC09-UI-01 → REVIEW-01/REPORT-01 patch được Đạt áp. BB05 DATA Huy chỉ backend.
3. `contract/confirm.*`: BB07-01 → BB08-01 context patch, cùng Huy, không hai gói đang edit đồng thời.
4. `contract/student-detail.*` / `tutor-detail.*`: TC02-01 base → BB09 summary patch → TC03 module → REVIEW/REPORT module; Huy ghi host, Đạt/Đại chỉ cung cấp patch.
5. `order/history.*`: BB09-UI-01 shell → TC03 cancellation mount → REVIEW/REPORT; Đạt ghi host.
6. `payment.*` / `wallet/overview.*`: BB08-01 → TC03-01 update refund UI, cùng Huy và tuần tự.
7. `tutor/manage.*`: BB13-01 phát stats slot sớm → STATS-01 module → Huy mount. Stats không đòi full manage trước viết aggregate; shell không đòi stats trước tạo.
8. `layout/header/core`: SHARED-UI-01 → Đạt BB03-UI-01 → batch nav history/cart/home/manage; Đại điều phối file, phát latest base cho chủ patch.
9. `migration`, `application`, `PageController`, `api-client`: mỗi batch Đại áp, Huy/Đạt không chạy migration hoặc sửa trực tiếp cùng lúc.

## 5. Các đợt thực hiện theo phụ thuộc

Đây là thứ tự đầu ra, không lịch ngày, không ba lane cố định bỏ qua file chung. Gói có thể khởi động thiết kế/UI trên contract draft nhưng chỉ báo nối thật sau API verified.

### Đợt 0 — Chốt mô hình và ranh giới

- Đại draft auth/account/profile/API errors; Huy draft Order–Contract–Payment–Offering–Enrollment/ledger/events; Đạt đối chiếu fields/slots/navigation.
- Quyết định Q01–Q07 ảnh hưởng module liên quan; Q08 môi trường provider; Q09/Q10 scope/UI. Có thể thống nhất contract tạm trên giấy, phải đánh dấu chưa quyết định.
- Bàn giao: A01–A11 version1 với owner, enum mapping, model/DDL request, route list9 đề xuất, matrix patch host; không schema/service chờ nhau vòng tròn.
- Đại SHARED-DB-01 là registry migration, không bắt mỗi người tự tạo migration.

### Đợt 1 — Nền account/DB/JSP

- Đại SHARED-DB-01 phase1, SHARED-AUTH-01, SHARED-PROFILE-01, SHARED-UI-01; auth/register/reset tiến triển trên auth contract.
- Huy thiết kế commerce/catalog/matching với account IDs, giao DDL draft phase2/3 cho Đại; không cần chờ UI xong.
- Đạt dựng profile/detail/history theo DTO freeze trong file riêng; chưa mount shared header khi Đại đang đổi.
- Bàn giao: auth API/current principal/logout, profile/edit/admin review contract, JSP/router/client v1, DB cô lập có migration phase1. Đạt nối BB03/TC01 khi API test pass.

### Đợt 2 — Catalog và ba nguồn đăng ký

- Huy SHARED-COMMERCE-01 + BB05-DATA-01 và MATCHING-01; Đại viết migration phase2/3 nhận draft và SHARED-CATALOG-01 query.
- Đạt BB05-UI-01/TC09-UI-01; TC08-UI-01 nhận filter contract Đại → TC07-UI-01, TC10-UI-01 trên home riêng.
- Huy BB06-01 cart và BB12 moderation/management shells; admin account/profile consume Đại APIs.
- Bàn giao: public catalog/detail, persistent invite/job/group sources, cart quote/revision, capacity service với isolated concurrency tests; đúng offering ID đi tới cart/mời.
- Việc song song an toàn: Đại backend query, Huy backend detail/source, Đạt page files; shared model chỉ Huy ghi, migration chỉ Đại; same search/profile gói nối tiếp.

### Đợt 3 — Đơn, thanh toán, trạng thái và hủy

- Huy BB07-01 tạo/read order/contract đầy đủ3channels, rồi BB08-01 balance/PayOS; Đạt BB09-UI-01 nối read sớm và mount forms sau.
- Huy TC02-01 events/release → TC03-01 cancel/refund; BB13-01 own management host/revenue slot. BB12-01 nối admin order/offerings trên same query, không duplicate logic.
- Bàn giao: idempotent order create/snapshots, authoritative payment status/ledger/balance, allowedActions, cancellation/refund/notice/capacity release; tiền sandbox/DB cô lập test thành công.
- Cùng file confirm/payment/contract/wallet thực hiện tuần tự như mục4. Payment dependencies không được thay bằng result URL/mock timeout.

### Đợt 4 — Review/report/statistics và ghép luồng

- Đại REVIEW-01 sau completed event; REPORT-01 có thể bắt đầu base earlier và nối admin/sender; STATS-01 nhận release projection.
- Huy mount stats vào tutor/manage; xử lý financial consequence approved report thông qua TC03, không Đại tự refund; Đạt áp review/report/cancel modules vào host thuộc mình.
- Bàn giao: eligible reviews/real aggregate rating, report submission→admin→sender notification có cùng ID, bar range+pie đúng metric/scope; loại business fixtures khỏi production.
- Với chỗ chưa có Q04/Q05, chỉ test non-financial read/UI contract; không hard-code phí/refund để chạy cho có.

### Đợt 5 — Nghiệm thu tích hợp

- Huy kiểm tra invariants/concurrency/replay/snapshots ở tiền/order/group; Đại kiểm tra role/owner/auth/aggregation/evidence; Đạt chạy UI learner/tutor/admin trên data thử cô lập theo task acceptance.
- Mỗi người nghiệm thu tám mã của mình; BB05 Huy điều phối cả DATA+UI, Đạt xác nhận fields/CTA; hỗ trợ/review không tăng số mã.
- Bàn giao: checklist23 mã với UI→API→DB→UI evidence, tests commands/results/context, những chỗ còn bị chặn. Build success đơn thuần không ký đủ chức năng.
- Không chạm DB/email/payment thật để chứng minh bài; không tự cài tool trong audit hiện tại. Khi môi trường chưa đủ, ghi bị chặn và test phần khác; không bỏ capacity/cancel/basic payment vì BS chờ duyệt.

## 6. Bộ kiểm tra tích hợp cần có khi triển khai (chưa chạy trong audit)

| Cụm | Kịch bản success | Lỗi/concurrency cần chứng minh | Owner nghiệm thu |
| --- | --- | --- | --- |
| Auth/profile | verify→login→self edit→logout | duplicate/expiry/token replay, forbidden role/status writes, unverified tutor gate | Đại; Đạt UI |
| Public catalog | filter+sort+page→tutor→offering | unpublished/banned/full, ID404, invalid query, newest publication, stale UI response | Đại API; Huy detail; Đạt UI |
|3 channels/order | invite terms, job select, group cart each create order | repeated submit, changed price/terms/sourceVersion, last seat/two-selection races, rollback | Huy; Đạt consume |
| Payment/state/refund | wallet first, PayOS due, verified status, release, refund | duplicate/invalid webhook, due0, expiry/late success, release-vs-refund race, no double credit | Huy; Đại ledger review |
| History/admin/seller | owned records/link/actions/CRUD |403 user/tutor other IDs, stale409, no arbitrary status, immutable order price | Huy API; Đạt learner UI |
| Review/report | completed review; sender→admin→notice | duplicate/ineligible review, unauthorized evidence, terminal report decision repeat, safe text render | Đại; Huy financial consumer |
| Charts | range released net/fee + pie | held/planned excluded, sum/invariants/range0/invalid/timezone, tutor own scope | Đại; Huy reconcile |

Audit hiện tại chỉ K01/K02/K03 thành công trong phạm vi tĩnh/VM; K04 UI, K05 Java/Semgrep, K06 Python và Google Docs chưa đạt. Các kịch bản bảng này là acceptance **đề xuất**, không kết quả đã chạy.

## 7. Câu hỏi thực sự cản trở quyết định triển khai

Đây là blocker chốt thiết kế/API/ước lượng cho gói tương ứng, **không ngăn phân công và lập bốn báo cáo**. Không tự biến đề xuất thành quyết định. Có thể triển khai phần độc lập/test skeleton trong lúc chờ, nhưng chưa kết luận phần phụ thuộc đã đủ.

| ID/mã | Quyết định cần chốt | Phương án đề xuất | Tác động nếu chưa chốt |
| --- | --- | --- | --- |
| Q01 BB01/02/03/04, TC01 | Role learner/parent và tạo tutor; email gate; session/CSRF/expiry, reset TTL và invalidate | Cookie session server, learner/parent subtype chung; không public-register ADMIN; token single-use hashed; reset revoke sessions; error policy uniform | SHARED-AUTH/REGISTER/RESET/client và migration phase1 chưa thể freeze; Đạt logout chờ A01 |
| Q02 BB05/06/07/09/12/13, TC09 | Offering loại gì, cart đa item hay một lựa chọn, quantity, orderitem↔contract/enrollment | Offering type SERVICE/GROUP_CLASS; Order có items snapshot, contract liên kết item; không gộp order=contract; quantity theo seat/learner rõ | Schema/cart/order/detail/history DTO khác nhau; cần chốt trước phase2, U thấp chắc chắn |
| Q03 BB07/08, TC02/04 | Khi nào order được tạo/confirm; hai bên consent; completion và release tối thiểu | Accepted source version→order+terms snapshot, consent rõ, chỉ ACTIVE sau verified full escrow; manual event cơ bản release một lần; không tự động BS | State machine/allowedActions/eligibility review/revenue chưa freeze; payment result không tự thay |
| Q04 BB10/11/13, BB08, TC02 | Phí8% hay10%, snapshot/rounding và releasedAt; pie đếm order/status hay transaction/channel | Chốt một policy có version; gross=tutorNet+fee, revenue chỉ released ledger; pie chọn order count by status hoặc transactions by channel rõ denominator | Có mâu thuẫn code fixture E13/E12; STATS và release expected values không thể nghiệm thu tài chính |
| Q05 TC03, BB08/09, TC05 | Điều kiện/thời hạn hủy, phần đã giải ngân, formula/approval/refund destination và retry | Refund quote server từ tiền thực giữ chưa released theo policy; cancelled khác refundSucceeded; dùng wallet available nếu nhóm chốt; unique event | Refund API/schema/state tests và report financial consequence bị chặn quyết định; không hard-code100% từ fixture |
| Q06 BB05/06/07/13, TC03/06 | Group schedules/min capacity nếu có, seat reservation TTL/expiry/duplicates, thế nào lịch phù hợp | Basic capacity lock/unique enrollment/hold expiry trước paid, release khi fail/cancel; schedule predicate được định nghĩa; min-students automation chưa giao BS | Group detail/checkout last seat race và query filter chưa nghiệm thu; không bỏ capacity vì chờ BS |
| Q07 BB01/12/13, TC01/08/09 | Fields tutor/offering nào cần duyệt lại, publicEligible và evidence access/type/size | pending không publish, admin approve; critical edits reapprove/version; account/profile field allowlist, private evidence controlled | Profile/query/admin/catalog eligibility có thể lệch; schema/public fields/CRUD rules chưa freeze |
| Q08 BB08/TC03 | PayOS sandbox credentials/docs đúng phiên bản, webhook URL/môi trường DB/mail thử cô lập; xử lý late webhook | Nhóm cung cấp môi trường thử + secrets qua config ngoài git; server verify provider contract; không live transactions | Backend build/E2E/provider verification chưa chạy được; audit ghi blocked, không cài công cụ/sửa firewall |
| Q09 TC04/05 | Review per-contract/per-item, edit/window; report target/evidence và quyền consequence | Unique buyer-item-contract theo model Q02, chỉ completed; report typed target, sender read own; admin versioned decision, money handled Huy event | Review unique constraint/form eligibility và report/admin/refund handoff cần chốt; không suy từ reviews mẫu |
| Q10 TC07/10, TC09 | publishedAt sau duyệt lại, số latest items và loại dịch vụ/lớp hiện home | Sort newest bằng publication timestamp, ID tie-break, approved/open/available; reapproval timestamp policy explicit | Catalog latest/sort test và home dataset chưa freeze; home layout vẫn có thể bắt đầu |

BS01–BS09 chỉ chờ giảng viên chọn đúng hai chức năng; chưa có mô tả từng BS trong đầu vào để ánh xạ chính xác. Không đặt tên BS cho các dòng fixture, không giao triển khai phần bổ sung, không xóa chúng. Các câu hỏi về payment/capacity/state/cancel/refund trên thuộc BB/TC nên vẫn phải chốt và làm theo owner đã phân công.
