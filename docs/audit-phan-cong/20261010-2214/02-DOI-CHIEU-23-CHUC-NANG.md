# Đối chiếu 23 chức năng

Snapshot, sổ E00–E16 và kiểm chứng K01–K07 nằm trong báo cáo 01 cùng thư mục. Mọi đường dẫn là tương đối repository. Mức triển khai đánh giá **luồng mục tiêu**, không chấm số màn hình. Dependency Maven, package giữ chỗ, mock success và dữ liệu fixture không được tính là backend đã có.

## Tổng hợp đúng 23 mã

| Mã | Chức năng | Mức triển khai | Mức kiểm chứng | Kết luận trang | Chịu trách nhiệm |
| --- | --- | --- | --- | --- | --- |
| BB01 | Đăng ký/email xác nhận | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa register, thêm verify | Đại |
| BB02 | Đăng nhập | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa login | Đại |
| BB03 | Đăng xuất | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa header/session, không trang mới | Đạt |
| BB04 | Lấy lại mật khẩu | Chưa tìm thấy | Chỉ kiểm tra tĩnh | Tạo forgot/reset; showcase không phải luồng | Đại |
| BB05 | Chi tiết dịch vụ/lớp | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa tutor/profile, tạo catalog/detail | Huy + Đạt |
| BB06 | Giỏ hàng | Chưa tìm thấy | Chỉ kiểm tra tĩnh | Tạo cart; sửa CTA/checkout | Huy |
| BB07 | Đặt hàng | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa matching/confirm; không tạo màn order thứ hai | Huy |
| BB08 | Thanh toán trực tuyến | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa checkout/QR/result | Huy |
| BB09 | Lịch sử mua hàng | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Tạo order/history; giữ wallet/contract detail | Đạt |
| BB10 | Biểu đồ cột theo khoảng ngày | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa admin/dashboard, thêm tab tutor/manage | Đại |
| BB11 | Biểu đồ tròn | Chưa tìm thấy | Chỉ kiểm tra tĩnh | Thêm pie section dashboard/manage | Đại |
| BB12 | Admin quản lý cơ bản | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa moderation, tạo admin/manage tabs | Huy |
| BB13 | Gia sư quản lý cơ bản | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa profile/contract; tạo tutor/manage tabs | Huy |
| TC01 | Cập nhật cá nhân | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa hai profile | Đạt |
| TC02 | Cập nhật trạng thái đơn | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa section/action của order/contract/manage | Huy |
| TC03 | Hủy đơn | Chưa tìm thấy | Chỉ kiểm tra tĩnh | Thêm cancel/refund modal vào history/detail | Huy |
| TC04 | Đánh giá sau mua | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Thêm review modal; sửa review list | Đại |
| TC05 | Báo cáo và xử lý | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa admin reports; thêm report modal công khai | Đại |
| TC06 | Lọc nhiều tiêu chí | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa search/catalog tab | Đại |
| TC07 | Sắp xếp | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa sort trong search/catalog tab | Đạt |
| TC08 | Tìm gian hàng gia sư | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Sửa search/profile | Đạt |
| TC09 | Xem sản phẩm gian hàng | Chỉ giao diện/mock | Chỉ kiểm tra tĩnh | Thêm offering list/tab tutor/profile | Đạt |
| TC10 | Sản phẩm mới nhất trang chủ | Chưa tìm thấy | Chỉ kiểm tra tĩnh | Tạo home | Đạt |

Số lượng: **18 Chỉ giao diện/mock; 5 Chưa tìm thấy; 0 Đã đủ theo kiểm tra mã; 0 Đã có một phần; 0 Chỉ backend; 0 Không đủ dữ liệu**. “Đã có một phần” được dành cho khi có một phần nghiệp vụ/persistence thật; snapshot này chỉ có prototype. Không đưa tỷ lệ hoàn thành.

Mức kiểm chứng chung: **23 Chỉ kiểm tra tĩnh**, 0 đã kiểm chứng luồng nghiệp vụ cụ thể. K03 chạy thành công 14 assertions ở bốn store mock trong Node VM, chỉ là kiểm tra thành phần dữ liệu preview. Browser local, build/test Java và đối chiếu Google Docs bị chặn như 01; không đánh dấu chức năng hoàn thành bởi K01/K02/K03.

## BB01 — Đăng ký và gửi email xác nhận

1. **Mục tiêu:** tạo tài khoản, email xác minh có thời hạn; gia sư chỉ hoạt động sau duyệt hồ sơ, ba vai trò tách quyền.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh; chưa gửi email hoặc chạy account thật.
3. **Chuỗi bằng chứng:** `auth/register.html` → `register.js:29` validate → `:63` timeout → `:52` showSuccess. E15/E14 chỉ giả lập profile duyệt. API/account/token/quyền server đều chưa có (E00). Chưa có dependency gửi mail trong pom.
4. **Tái sử dụng:** form register, AuthShell, input/password/alert; trạng thái draft/pending/rejected/verified của UI.
5. **Còn thiếu:** account unique/hash password, token hash/expiry/consume, mail thử, resend throttling, chống enumeration, approval gate ở server; lỗi email trùng và token lặp/hết hạn.
6. **Trang:** hoàn thiện register; đề xuất `auth/verify-email.html`; sửa tutor/my-profile và admin tutor review qua gói liên quan, không vẽ lại.
7. **Độ khó toàn bộ/còn lại:** Khó / Khó; gần toàn bộ auth backend thiếu dù form có sẵn.
8. **Gói/phụ thuộc:** AUTH-REGISTER-01 sau SHARED-DB-01, SHARED-AUTH-01; approval theo SHARED-PROFILE-01, UI moderation trong BB12-01.
9. **Nghiệm thu/quyết định:** register/email/token lần đầu thành công; trùng email không tạo account thứ hai; token hết hạn/lặp không xác minh lại; tutor pending không được bán/nhận lớp. Nhóm chốt lựa chọn vai trò và hồ sơ tối thiểu (Q01, Q07 tại 04).

## BB02 — Đăng nhập

1. **Mục tiêu:** xác thực thật, session và phân quyền máy chủ cho learner/parent, tutor, admin.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh; không có login thành công đã chạy.
3. **Chuỗi:** login HTML → `login.js:44` → `:67–74` simulateSubmit luôn invalid_credentials. Header `user-header.js:19` chọn persona theo data-*; không phải principal. E00 không có auth handler/session/security config.
4. **Tái sử dụng:** form, loading, thông báo locked/banned/invalid.
5. **Thiếu:** login server, session fixation protection, cookie/CSRF, status tài khoản/email gate, session expiry, role/ownership; thông báo lỗi thống nhất.
6. **Trang:** sửa login, shell/header lấy current user; không thêm route login khác.
7. **Độ khó:** Khó / Trung bình–khó sau nền tảng auth; UI lỗi khá rõ.
8. **Gói:** AUTH-LOGIN-01 sau SHARED-AUTH-01, AUTH-REGISTER-01, SHARED-UI-01.
9. **Nghiệm thu:** ba role đăng nhập và tới đúng entry; email chưa verify/locked/banned bị từ chối; session hết hạn/401 xử lý rõ; gọi trực tiếp admin API bằng learner bị chặn. Chính sách khóa/expiry cần chốt Q01.

## BB03 — Đăng xuất

1. **Mục tiêu:** vô hiệu hóa session theo cơ chế thật, cập nhật UI, về login và không dùng lại session cũ.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** nút logout header → `user-header.js:223` đóng menu và dispatch `user-header:action`; search/profile chỉ toast chưa sẵn sàng. Admin HTML link thẳng login (E03). Không logout endpoint hay session cần vô hiệu hóa (E00).
4. **Tái sử dụng:** menu/button/event UI và login destination.
5. **Thiếu:** gọi logout CSRF/session endpoint, xóa state user sau thành công, ngăn bfcache hiển thị dữ liệu riêng, xử lý mạng thất bại/401/lặp.
6. **Trang:** sửa header dùng chung và bỏ handler toast logout ở search/profile; không tạo trang mới.
7. **Độ khó:** Dễ–trung bình / Dễ khi Đại cung cấp auth contract; không giao session security cho Đạt.
8. **Gói:** BB03-UI-01 sau SHARED-AUTH-01, SHARED-UI-01; phối hợp TC08-UI-01 và BB05-UI-01 trong file search/profile theo thứ tự.
9. **Nghiệm thu:** learner/tutor/admin logout; API riêng trả 401 bằng session cũ; mạng lỗi không báo logout thành công giả. Cơ chế session nằm Q01.

## BB04 — Lấy lại mật khẩu

1. **Mục tiêu:** request reset, token/link giới hạn thời gian, đổi password và xử lý token không hợp lệ.
2. **Triển khai/kiểm chứng:** Chưa tìm thấy / Chỉ kiểm tra tĩnh, trong `pages/auth`, JS auth và toàn backend.
3. **Chuỗi:** `components/layout/auth-shell.html:56,65` chỉ panel forgot/reset trình diễn; core auth-shell đổi variant. Không trang nhận token, API/reset token/account DB (E04/E00). Showcase không được tính là luồng ứng dụng.
4. **Tái sử dụng:** AuthShell, password input, validation/loading/alert pattern.
5. **Thiếu:** toàn luồng server/request email/token hash/expiry/consume, chống enumeration/rate limit và invalidation phiên sau reset.
6. **Trang:** đề xuất `auth/forgot-password.html`, `auth/reset-password.html`; thêm link login.
7. **Độ khó:** Khó / Khó; token lifecycle và account security chưa có.
8. **Gói:** AUTH-RESET-01 sau SHARED-AUTH-01, AUTH-REGISTER-01, SHARED-UI-01.
9. **Nghiệm thu:** token đúng/expired/used; password mới login được, password cũ không dùng được; email không tồn tại không bị lộ. Chốt TTL và hủy phiên Q01.

## BB05 — Xem chi tiết sản phẩm

1. **Mục tiêu:** offering dịch vụ/gói/lớp nhóm có môn/cấp/nội dung/buổi/phí/lịch/hình thức/tutor và điều kiện đăng ký.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** tutor/profile → `profile.js:TUTORS[*].plans` → `:734` chọn plan DOM; `:566` chỉ link tutor ID sang invitation. Không offering ID/endpoint/data. Job detail mô tả nhu cầu người học, không thay offering. Group detail/capacity chưa có (E05/E08/E00).
4. **Tái sử dụng:** hero tutor, plans, lịch, summary; Card/InfoRow/TutorSummary.
5. **Thiếu:** offering stable ID, publication, số buổi/terms, group schedule/capacity/enrollment gate; truyền lựa chọn vào cart/mời; dữ liệu server tránh fixture lặp.
6. **Trang:** sửa tutor/profile; đề xuất một `catalog/detail.html` dùng chung service/group, không ba trang riêng theo kênh.
7. **Độ khó:** Trung bình–khó / UI dễ–trung bình, dữ liệu/quy tắc khó; chia việc có ý nghĩa.
8. **Gói:** BB05-DATA-01 (Huy) sau SHARED-COMMERCE-01, SHARED-PROFILE-01; BB05-UI-01 (Đạt) nối dữ liệu sau gói đó. Huy điều phối nghiệm thu, không tính review thành lượt thứ ba.
9. **Nghiệm thu:** ID tồn tại đúng offering; unpublished/closed/full/không đủ quyền không đăng ký; 404 rõ; chọn plan giữ đúng ID/giá/terms; race chỗ cuối xử lý server. Chốt loại offering/group schedule Q02/Q06.

## BB06 — Quản lý giỏ hàng

1. **Mục tiêu:** thêm/sửa/xóa lựa chọn/tính tiền và revalidate server lúc checkout.
2. **Triển khai/kiểm chứng:** Chưa tìm thấy / Chỉ kiểm tra tĩnh; phạm vi toàn 31 pages, JS và `src/`.
3. **Chuỗi:** plan selection E05 chỉ state DOM; checkout E10 mở một contract fixture, không cart/cart item/API/entity. Không có thao tác giỏ để truy vết tới server (E00).
4. **Tái sử dụng:** Card/table, checkout summary, modal/toast; không coi sessionStorage payment preview là cart.
5. **Thiếu:** Cart/CartItem, owner CRUD, item IDs/terms, totals quote, expired/price changed/unavailable feedback, bảo đảm group capacity trước checkout.
6. **Trang:** đề xuất `cart/index.html`; sửa CTA offering và header người học; giữ checkout hiện có.
7. **Độ khó:** Khó / Khó; UI mới và invariant số tiền/chỗ chưa có.
8. **Gói:** BB06-01 sau SHARED-COMMERCE-01, BB05-DATA-01, SHARED-AUTH-01.
9. **Nghiệm thu:** thêm/sửa/xóa/reload theo owner; cart rỗng; item trùng/sai ID/đổi giá/đóng/full không tạo đơn sai; tiền request client bị bỏ qua. Giỏ nhận loại nào, quantity và multi-item order cần Q02.

## BB07 — Đặt hàng

1. **Mục tiêu:** tạo đơn đăng ký với item/giá snapshot, liên kết hợp đồng theo điều khoản; đủ cả mời/tin/lớp nhóm.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** E07 lời mời accepted → storage proposal; E08 chọn ứng viên đổi DOM; E09 consent local → checkout. Không Order/OrderItem hay Contract entity/transaction. Kênh group không tìm thấy (E00/E16).
4. **Tái sử dụng:** invitation/create/negotiation, job/create/detail/applicants, contract/confirm và thông báo lỗi.
5. **Thiếu:** matching persistent/version/expiry, đúng owner/role; atomic tạo order, snapshots và liên kết từng contract/enrollment; idempotent submit/chọn duy nhất/hold seat.
6. **Trang:** hoàn thiện các trang matching/confirm; cart → confirm/checkout. Không tạo order detail trùng contract detail, đơn chưa có contract dùng drawer history.
7. **Độ khó:** Khó / Khó, toàn bộ nguồn dữ liệu giao dịch còn thiếu.
8. **Gói:** SHARED-COMMERCE-01 → MATCHING-01 và BB06-01 → BB07-01; UI nhóm lấy BB05-DATA-01. BB08-01 tiếp nhận order/quote.
9. **Nghiệm thu:** mỗi kênh tạo đúng order/items/contract nguồn; repeated submit một kết quả; expired proposal, hai người chọn đồng thời, giá sai/full không phát sinh bản ghi nửa chừng. Q02/Q03/Q06 chốt modeling/consent.

## BB08 — Thanh toán trực tuyến

1. **Mục tiêu:** dùng available trước, PayOS phần thiếu; server verify/status, fail/repeat; result không tự quyết paid.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh; không PayOS sandbox/live được chạy.
3. **Chuỗi:** `checkout.js:193` storage pending/amounts fixture → `qr.js:133` ma trận DEMO → `result.js:110` status URL và `:211` báo chưa nối đối soát. Comment nói rõ không network/wallet/contract mutation (E10). Không wallet ledger/payment adapter/webhook (E00).
4. **Tái sử dụng:** breakdown available/escrow/due, consent, lỗi storage, QR/result layouts.
5. **Thiếu:** authoritative quote, balance lock/hold, due=0, PayOS sandbox create/status/webhook verify, amount/order matching, retry/expiry/reconciliation/idempotent ledger, release hold fail/cancel/late success.
6. **Trang:** sửa checkout/qr/result; result đọc transaction ID/state server, không đổi contract từ query.
7. **Độ khó:** Rất khó / Rất khó; rủi ro tiền/concurrency, backend gần như từ đầu.
8. **Gói:** BB08-01 sau SHARED-COMMERCE-01, BB07-01, SHARED-AUTH-01; cấp ledger cho TC02-01, TC03-01, STATS-01.
9. **Nghiệm thu:** đủ ví/thiếu ví/không ví; lặp webhook và request; sai signature/amount; expired/late success/failed; giả `status=success` không credit; tiền available/held không âm. Q03/Q05/Q08 chốt release/refund, provider sandbox/hợp đồng thông báo.

## BB09 — Xem lịch sử mua hàng

1. **Mục tiêu:** đơn của mình với chi tiết/items/contract/payment và trạng thái ba kênh.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** header “Lịch sử giao dịch” → wallet/#transactions → `overview.js:3,20,61` list/filter/modal fixtures → student-detail contract fixture. Không order history/query ownership (E11/E12/E00).
4. **Tái sử dụng:** wallet tables/date filters/empty; student-detail layout/timeline.
5. **Thiếu:** order list/read owned API, pagination, multi-item and pending no-contract rendering, related transaction/contract distinction, error/empty states.
6. **Trang:** đề xuất order/history; thêm order section ở student-detail, drawer khi chưa có contract. Không biến ledger thành order list.
7. **Độ khó:** Trung bình / UI dễ–trung bình sau Huy cung cấp read API; server ownership nằm shared commerce.
8. **Gói:** BB09-UI-01 sau BB07-01/BB08-01/read DTO, SHARED-UI-01. Cancel/review/report modal module của Huy/Đại bàn giao sau, Đạt điều phối host history.
9. **Nghiệm thu:** đúng owner, đủ ba kênh, đơn chưa ký quỹ/chưa contract; 403/404/401/empty; paging không trộn user. Modeling order contract cần Q02/Q03.

## BB10 — Biểu đồ cột theo khoảng thời gian

1. **Mục tiêu:** from/to; tutor net released income, admin platform fee hoặc count; đơn vị/range rõ.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** dashboard → `buildSnapshot` hard-code finance/6 tháng → `renderGmvChart:225` CSS bars. Không date query/API/ledger. Contract tutor có tiền dự kiến/đếm completed, không phải dataset revenue thật (E13/E12/E00).
4. **Tái sử dụng:** CSS bars, mô tả giá trị accessible, StatCard/date inputs của wallet.
5. **Thiếu:** aggregate release event/fee snapshot theo timezone, range validation/zero-filled buckets, owner metric; fix fee 8%/10% lệch, không dùng GMV/held làm revenue.
6. **Trang:** sửa admin/dashboard và revenue tab tutor/manage do Huy tạo; Đại cung cấp module chart riêng, không cùng sửa host file song song.
7. **Độ khó:** Khó / Trung bình–khó sau ledger; cần định nghĩa chỉ số, không chỉ vẽ biểu đồ.
8. **Gói:** STATS-01 (chia sẻ với BB11, tính công một lần) sau BB08-01, TC02-01, BB13-01 shell; SHARED-AUTH-01.
9. **Nghiệm thu:** range đảo/empty/boundary; released 100 với fee 10 ⇒ tutor 90/admin 10, held không vào revenue; quyền tutor chỉ own. Q04 chốt rate/mốc/rounding.

## BB11 — Biểu đồ tròn

1. **Mục tiêu:** pie trạng thái order/contract hoặc tỷ trọng giao dịch theo ba kênh, phạm vi/quyền rõ.
2. **Triển khai/kiểm chứng:** Chưa tìm thấy / Chỉ kiểm tra tĩnh; khảo sát dashboard JS/CSS và pages.
3. **Chuỗi:** `dashboard.js:251` `renderEscrowChart` dựng các span width trong thanh ngang; `:283` aria-label cũng ghi thanh tỷ trọng. Không pie, không cơ cấu đúng order/channel/query/DB (E13/E00).
4. **Tái sử dụng:** legend/list và mô tả dữ liệu; không gọi thanh ngang hiện tại là tròn.
5. **Thiếu:** donut/pie, aggregate enum/channel, denominator/zero/no data, scope server, labels/count/% và khả năng đọc không chỉ theo màu.
6. **Trang:** thêm pie section trong admin/dashboard/revenue tab tutor/manage; không route thống kê mới.
7. **Độ khó:** Trung bình / Trung bình, nền dữ liệu/phân quyền dùng chung BB10.
8. **Gói:** STATS-01 sau SHARED-COMMERCE-01, BB07-01 và ledger khi dùng payment count; không cộng lại 8 đơn vị.
9. **Nghiệm thu:** tổng count/% phù hợp dữ liệu thật ba kênh hoặc status đã chốt; 0 records không NaN; owner scope đúng. Q04 chọn dimension/count denominator.

## BB12 — Admin quản lý cơ bản

1. **Mục tiêu:** users, offerings/group classes, orders với contract link, thao tác admin.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh; K03 xác nhận store mock duyệt có chặn lỗi/lặp, chưa admin API.
3. **Chuỗi:** admin review queue/detail → `EduTutorReview.review`/`EduJobReview.review` → sessionStorage (E14). Dashboard/logs/payout không thay users/offerings/orders CRUD. E00 không controller/service/entity/role gate.
4. **Tái sử dụng:** mười admin layouts, table/search/filter/pagination/modal/reason, review validation.
5. **Thiếu:** user account state controls; offering/list approval; orders readonly details/action hợp lệ; persistent moderation/audit/notification, concurrency/version và admin auth.
6. **Trang:** đề xuất admin/manage có 3 tabs; hoàn thiện tutor/job review queue/detail; audit tối thiểu dùng trang logs có sẵn.
7. **Độ khó:** Khó / Khó; nhiều loại dữ liệu, nhưng admin orders dùng commerce của Huy.
8. **Gói:** BB12-01 sau SHARED-AUTH-01, SHARED-PROFILE-01, BB05-DATA-01, MATCHING-01, BB07-01. Profile approval API Đại bàn giao, UI admin Huy.
9. **Nghiệm thu:** non-admin 403; stale version409; khóa user không delete ledger; hidden/closed offering không còn bán; order/contract nhìn đúng liên kết. Q07 chốt quyền sửa sau publish và record retention.

## BB13 — Gia sư quản lý cơ bản

1. **Mục tiêu:** own services/classes/orders/released revenue, không chỉ profile/điểm danh.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** my-profile DOM → tutor-detail fixtures/`render:269` đếm trạng thái buổi → available wallet chung dataset learner. Không CRUD offering/group/order/aggregate owned server (E15/E12/E11/E00).
4. **Tái sử dụng:** Tutor shell, detail/lesson cards, wallet/stat/table.
5. **Thiếu:** own CRUD offerings/group capacity/schedule, listing own orders, valid actions; doanh thu giải ngân thật, approval gate và stop-selling rules.
6. **Trang:** đề xuất tutor/manage tabs dịch vụ/lớp/đơn/doanh thu; giữ my-profile và tutor-detail làm màn con.
7. **Độ khó:** Khó / Trung bình–khó sau commerce; phần nền thống kê chỉ tính ở STATS-01.
8. **Gói:** BB13-01 sau BB05-DATA-01, BB07-01, SHARED-PROFILE-01; STATS-01 cấp chart/metric, TC02-01 cấp actions.
9. **Nghiệm thu:** không xem/sửa tài nguyên tutor khác; pending profile không publish; closed/full class không nhận mới; planned/held/released phân biệt. Q06/Q07 về capacity/sửa offering.

## TC01 — Cập nhật thông tin cá nhân

1. **Mục tiêu:** account/profile chung, learner thông tin cá nhân và tutor chuyên môn/môn/phí theo quyền.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** account/profile → `profile.js:72` validate rồi DOM; my-profile → `:116` apply pending. Refresh không dữ liệu persistent; trạng thái URL không phải quyền (E15/E00).
4. **Tái sử dụng:** read/edit/cancel, error controls, tutor schedule/file-upload UI.
5. **Thiếu:** current principal profile GET/PATCH, allowlist fields, email change verification, optimistic version, critical tutor edits reapprove; upload validation/access hạn chế.
6. **Trang:** hoàn thiện hai profile; không route tài khoản trùng mới.
7. **Độ khó:** Trung bình–khó / UI dễ–trung bình; backend/reapproval/upload security do Đại SHARED-PROFILE-01.
8. **Gói:** TC01-UI-01 sau SHARED-PROFILE-01, SHARED-AUTH-01; BB12-01 sử dụng approval đầu ra.
9. **Nghiệm thu:** save/reload/cancel; invalid fields/409/storage khác người; tutor không tự bật verified; email mới chưa verify không có quyền mới. Q07 chốt edit reapproval và upload types/size.

## TC02 — Cập nhật trạng thái đơn hàng

1. **Mục tiêu:** sự kiện hợp lệ và quyền sở hữu, đồng bộ order/contract/payment; không endpoint đặt status tùy ý.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** student-detail modal → `student-detail.js:288–315` đổi lesson.pending thành completed/reported; tutor-detail → `:358–402` upcoming thành pending. Admin store có lifecycle riêng. Không order status service/transaction, hai trang không chia sẻ state (E12/E14/E00).
4. **Tái sử dụng:** actions/modal/disabled, timeline/status badge; phải tách lesson/order/contract enums.
5. **Thiếu:** event state machine ở server, allowedActions DTO, version/idem, rules consent/payment/complete/release và audit; không dùng completed UI làm release chứng cứ.
6. **Trang:** sửa action sections trong contract/history/manage, không route status mới.
7. **Độ khó:** Khó / Khó vì transactional consistency và ba kênh.
8. **Gói:** TC02-01 sau MATCHING-01, BB07-01, BB08-01; release output cho STATS-01/REVIEW-01; server states điều phối Huy.
9. **Nghiệm thu:** legal transition thành công; role sai/stale/repeated/race/không đủ ký quỹ bị chặn; ledger/order/contract đồng bộ. Quy tắc completed/release tối thiểu Q03; không triển khai tự động BS.

## TC03 — Hủy đơn hàng

1. **Mục tiêu:** request cancellation, conditions/refund amount, notification và trạng thái refund.
2. **Triển khai/kiểm chứng:** Chưa tìm thấy / Chỉ kiểm tra tĩnh trong toàn pages/JS/backend; chỉ có dấu vết hoàn tiền mẫu.
3. **Chuỗi:** QR cancel E10 chỉ hủy payment preview; my-job close chỉ đóng tin; contract support E12 mở thông tin; wallet refund E11 là fixture. Không cancel order form/service/refund ledger/notification (E00).
4. **Tái sử dụng:** Modal/textarea/status/timeline và wallet refund list.
5. **Thiếu:** refund quote trên số tiền thật còn held, approval/event rules, cancellation request, refund ledger/retry/notification, capacity release; xử lý payment late success.
6. **Trang:** thêm modal cancel/refund vào order/history/student-detail; trạng thái vào admin/manage nếu cần duyệt. Không route cancel riêng.
7. **Độ khó:** Rất khó / Khó; rủi ro tiền và rules chưa chốt.
8. **Gói:** TC03-01 sau BB07-01, BB08-01, TC02-01; Đạt host BB09-UI-01 nhận module modal. REPORT-01 chỉ phát event approved adjustment, không tự tính tiền.
9. **Nghiệm thu:** unpaid/paid/partial released/đã hủy; lặp refund không credit hai lần; fail theo dõi retry; quá thời hạn/release cạnh tranh; chỗ lớp trả đúng. Q05/Q06 chốt thời hạn/formula/destination.

## TC04 — Đánh giá sản phẩm đã mua

1. **Mục tiêu:** learner đánh giá sau contract completed, liên kết order/item/service/tutor, giới hạn số lần.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh; có list review mẫu, chưa có đánh giá sau mua.
3. **Chuỗi:** `tutor/profile.js:49` reviews fixture → `:665` render; không form POST/contract eligibility/data unique (E05/E00).
4. **Tái sử dụng:** Rating, review card/list, modal trên contract detail.
5. **Thiếu:** Review entity/unique eligibility endpoint, validation/rating range/output encoding, moderation if agreed; aggregate rating thật, error repeat/ownership.
6. **Trang:** thêm review modal completed contract và review list public; không trang review mới.
7. **Độ khó:** Trung bình / Trung bình; phụ thuộc order/contract completed thật.
8. **Gói:** REVIEW-01 sau SHARED-COMMERCE-01, TC02-01 và SHARED-CATALOG-01; Đạt tích hợp host profile/detail theo file lock.
9. **Nghiệm thu:** eligible buyer1 review; chưa completed/user khác/lặp không được tạo; rating reflect catalog; nhập markup không thực thi. Q09 chốt per-contract hay per-item, edit/review window.

## TC05 — Báo cáo gian hàng/khách hàng và xử lý

1. **Mục tiêu:** lý do/evidence, admin tiếp nhận/kết luận và thông báo cả hai chiều, quyền đúng.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh; K03 có tests store preview, không xác nhận luồng gửi→admin→DB.
3. **Chuỗi:** contract/student-detail report đổi lesson DOM; confirm report lưu preview; admin/reports/detail gọi `EduReport.decide:442` dataset khác trong sessionStorage. Không liên thông người gửi→admin, evidence upload/persistent outcome/notice (E09/E12/E14/E00).
4. **Tái sử dụng:** admin queue/detail, reason length/resolution rules, Modal/Textarea/FileUpload.
5. **Thiếu:** Report API target tutor/user/contract, owner visibility; evidence restricted access, admin decision version/audit/outbox notice; financial consequence bàn giao Huy.
6. **Trang:** sửa admin reports; thêm report modal trên public tutor/contract; người gửi theo dõi trạng thái trong section/modal hiện có, không route complaint riêng.
7. **Độ khó:** Khó / Khó, nhiều role và artifact/access liên quan.
8. **Gói:** REPORT-01 sau SHARED-AUTH-01, SHARED-PROFILE-01, SHARED-COMMERCE-01; TC03-01 nhận refund-approved event nếu nghiệp vụ yêu cầu.
9. **Nghiệm thu:** report hợp lệ xuất hiện admin và sender view; unauthorized evidence403; stale/lặp conclusion bị chặn, notification có record; decision không tự chuyển tiền. Q09 về evidence và consequential actions.

## TC06 — Lọc theo nhiều tiêu chí

1. **Mục tiêu:** subject/grade/price/area/mode/schedule theo danh mục dịch vụ/lớp, kết hợp search/sort/page.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** tutor/search form → `search.js:getState:45` → `cardMatches:85` → `applyView:117` hidden DOM. Job discover lọc tin học viên không thay danh mục offering. Không SQL query/server publication gate (E06/E00).
4. **Tái sử dụng:** filter controls/chips/reset và normalize tiếng Việt.
5. **Thiếu:** stable catalog IDs/params, allowlist/validation, query AND/OR lịch, pagination counts; filter eligibility luôn bắt buộc server, không chỉ checkbox verifiedOnly.
6. **Trang:** sửa search và catalog tab; không route filter mới.
7. **Độ khó:** Trung bình–khó / Trung bình–khó; nền query cấp nhiều mã do Đại điều phối.
8. **Gói:** SHARED-CATALOG-01 sau SHARED-PROFILE-01, BB05-DATA-01; Đại bàn giao filter patch/DTO cho Đạt TC08-UI-01, áp nối tiếp cùng search file.
9. **Nghiệm thu:** combined criteria/zero/invalid range/schedule; response count+page thống nhất; hidden tutor/offering không lọt khi bỏ verified checkbox. Q06 chốt semantics lịch phù hợp.

## TC07 — Sắp xếp hiển thị

1. **Mục tiêu:** price asc/desc, rating/newest, kết hợp filter và paging ổn định.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** search sort → `search.js:107` rating/price asc/desc hoặc initialOrder → append DOM; không publishedAt/newest/paging query. Sort job/my-job khác domain (E06/E00).
4. **Tái sử dụng:** Select/currentSort/render list; giữ filter state.
5. **Thiếu:** newest option, query sort contract, stable tie-break ID, server approved sort fields, pagination reset và URL state.
6. **Trang:** sửa sort trên search/catalog tab, không trang mới.
7. **Độ khó:** Dễ–trung bình / Dễ; query phức tạp do Đại shared catalog cung cấp.
8. **Gói:** TC07-UI-01 sau SHARED-CATALOG-01 và TC08-UI-01, nối tiếp chỉnh search file.
9. **Nghiệm thu:** đúng cả4 sort + filters/page, equal price stable, empty và invalid sort fallback. Newest dùng publishedAt theo Q07/Q10, không createdAt nháp.

## TC08 — Tìm kiếm gian hàng

1. **Mục tiêu:** tìm tutor theo tên/chuyên môn, chỉ hồ sơ đủ điều kiện công khai.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** search query → `search.js:85` dataset.name/subject/grade/district includes → DOM. verifiedOnly có thể tắt; header persona fixed. Không publication/approval query server (E06/E03/E00).
4. **Tái sử dụng:** form/search/no diacritics, tutor card, empty states, profile links ID.
5. **Thiếu:** current query API, q normalization/limit, specialist fields, public predicate enforced, debounce/race/stale request và totals/paging.
6. **Trang:** hoàn thiện search/profile; tab catalog đồng bộ TC06/TC07; không route tutor search mới.
7. **Độ khó:** Trung bình / UI dễ–trung bình; server/query Đại phụ trách.
8. **Gói:** TC08-UI-01 sau SHARED-CATALOG-01, SHARED-UI-01; Đạt điều phối search files và áp filter patch từ Đại.
9. **Nghiệm thu:** có/không dấu, specialty, empty/notfound/network; banned/pending không xuất hiện dù request sửa tay; last query wins. Q07 eligibility/publication.

## TC09 — Xem sản phẩm thuộc gian hàng

1. **Mục tiêu:** tutor public page liệt kê active services/groups, tới detail và đăng ký đúng lựa chọn.
2. **Triển khai/kiểm chứng:** Chỉ giao diện/mock / Chỉ kiểm tra tĩnh.
3. **Chuỗi:** profile `TUTORS[*].plans` → `:698` buttons không offering ID → `:734` selected summary, link mời chung tutor; chưa group/service detail/API (E05/E00).
4. **Tái sử dụng:** plan cards/tags/pricing layout và tutor header.
5. **Thiếu:** offering list by tutor, server eligibility, link detail ID, empty/no-sale state và group capacity label; không nhân bản data ở frontend.
6. **Trang:** thêm offering list/tab trên tutor/profile; tái dùng catalog/detail của BB05.
7. **Độ khó:** Trung bình / Dễ–trung bình sau catalog API; không giao backend khó cho Đạt.
8. **Gói:** TC09-UI-01 sau SHARED-CATALOG-01, BB05-DATA-01, BB05-UI-01; nối tiếp profile file sau review/report patches.
9. **Nghiệm thu:** đúng tutor, chỉ active published, list empty; each link giữ ID/terms, closed/full feedback; không lộ offering tutor khác. Q07 publication/capacity presentation.

## TC10 — Hiển thị sản phẩm mới nhất trên trang chủ

1. **Mục tiêu:** homepage latest approved/open offering theo thời điểm công khai.
2. **Triển khai/kiểm chứng:** Chưa tìm thấy / Chỉ kiểm tra tĩnh; toàn pages/JS/backend, brand hiện trỏ search/discover/admin dashboard.
3. **Chuỗi:** không homepage hay handler feed; page-map/README là định hướng. Tutor cards hiện có không timestamp publication/query latest (E06/E16/E00).
4. **Tái sử dụng:** Card/TutorCard, header/footer, catalog detail links.
5. **Thiếu:** public home route/template, list latest query publishedAt+eligibility, max/page, empty/error/loading và brand navigation.
6. **Trang:** đề xuất `home.html` → route `/` khi JSP; không thay role dashboard.
7. **Độ khó:** Dễ–trung bình / Dễ–trung bình; nền feed/query đã tính SHARED-CATALOG-01.
8. **Gói:** TC10-UI-01 sau SHARED-CATALOG-01, BB05-UI-01, SHARED-UI-01; header cập nhật sau BB03-UI-01.
9. **Nghiệm thu:** newest theo publishedAt; nháp/closed/full không hiện, link đúng detail; empty/network không dùng mock success; public và signed-in thấy dữ liệu đúng. Q10 chốt giới hạn và publishedAt sau duyệt lại.

## Ràng buộc phạm vi

Không mã nào bị bỏ vì chờ BS01–BS09. Không giao code chat/rút tiền/tự giải ngân/tự hủy nhóm thiếu sĩ số; không xóa UI có sẵn. Các câu hỏi Q01–Q10 ở 04 chỉ ảnh hưởng thiết kế/API tương ứng, không ngăn việc đọc mã/lập báo cáo. Tất cả gói được định nghĩa và có chủ sở hữu trong 03; file giao nhau và API đều điều phối ở 04.
