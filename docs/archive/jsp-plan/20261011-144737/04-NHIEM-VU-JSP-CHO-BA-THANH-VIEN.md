# Đề xuất nhiệm vụ JSP cho ba thành viên

Đây là đầu vào để soạn Docs giao việc, **chưa triển khai**. Đại = **Nguyễn Xuân Đại**, Huy = **Tạ Văn Huy**, Đạt = **Nguyễn Khắc Trường Đạt**. Giữ nguyên phân công chức năng do người dùng đưa; chủ trang nhận module của chủ nghiệp vụ, không đổi chủ chức năng.

## 1. Phạm vi và điều kiện chung

A = chuyển trang đã có; B = tạo trang HTML/JSP mới còn thiếu thuộc BB/TC; C = nối backend thật; D = kiểm/sửa tham chiếu. Bộ 40 HTML và chín trang bổ sung đều đã có nên **chưa có nhiệm vụ B tạo trang mới cần thiết**. TC02 thiếu control ở seller nhưng không thiếu cả trang.

Mọi đường production/file Java/DTO/endpoint dưới đây là đề xuất. Hiện views/static chỉ có placeholder, API/service/DTO chưa có (báo cáo 01). Với C, ước lượng chỉ gồm hợp đồng/adapter UI và kiểm tích hợp; không bao gồm xây toàn bộ backend/DB/gateway. Nếu backend chưa sẵn, thành viên bàn giao contract và đánh blocked C, không dùng simulation để nghiệm thu end-to-end.

Đơn vị 1/2/3/5 là độ lớn tương đối **riêng giai đoạn JSP**: 1 nhỏ; 2 nhỏ–vừa; 3 vừa; 5 lớn/khó hoặc ảnh hưởng nền/tiền/quyền. Không gán deadline, không cộng thành ước lượng toàn bộ sản phẩm. Đại/Huy chia phần khó 5; Đạt chỉ 1–3, tập trung UI và read adapter có contract.

**Quy tắc file**: nguồn prototype trong ma trận chỉ đọc để chuyển; sau chuyển duy trì bản production duy nhất. Page JSP/JS/CSS riêng thuộc một chủ; A trước C của cùng page, không chạy song song hai task trên cùng file. Shared config/controller/layout/core/CSS/assets do Đại sửa/tích hợp. Huy có quyền tác giả logic order-actions/data adapter riêng, gửi package/patch cho Đại tích hợp shared; Đạt không sửa logic đó. Chủ trang tự remove callback cũ và tích hợp module trong page mình. Không để Đại/Huy cùng chỉnh page JS của Đạt.

Lệnh chung nghiệm thu khi triển khai: Maven `package` (bundled executable ở báo cáo 01 hoặc Maven PATH), boot **profile local đã xác nhận an toàn**, mở HTTP route Pxx/direct/refresh; kiểm Network/Console, responsive và context path. Bốn Node checks hiện chỉ kiểm **prototype**, không tự kiểm JSP; cần áp checklist 05 cho HTML đã render. Không viết test mới ở audit này.

## 2. Đối chiếu đủ 23 chức năng

| Mã / chủ nghiệp vụ giữ nguyên | Trang/module | Nhiệm vụ JSP và ranh giới |
| --- | --- | --- |
| BB01 Đại | P15/P17 | JSP-DAI-05, JSP-DAI-06 A; JSP-DAI-10 C; gửi mail sandbox |
| BB02 Đại | P14 | JSP-DAI-05 A; JSP-DAI-03, JSP-DAI-10 session/C |
| BB03 Đạt | Action header, không trang mới | JSP-DAT-06; Đại cung cấp endpoint/shared/security |
| BB04 Đại | P13/P16 | JSP-DAI-04, JSP-DAI-06 A; JSP-DAI-10 C |
| BB05 Huy dữ liệu, Đạt UI | P19; P38 gateway | JSP-HUY-01, JSP-HUY-12 dữ liệu; JSP-DAT-04, JSP-DAT-08 UI và read integration |
| BB06 Huy | P18 | JSP-HUY-02 A; JSP-HUY-10 C |
| BB07 Huy | P18/P21–23 | JSP-HUY-03, JSP-HUY-10; không tự giao lời mời/ứng tuyển/chữ ký số nâng cao |
| BB08 Huy | P33–35/P40 | JSP-HUY-04, JSP-HUY-05 A; JSP-HUY-11 C sandbox |
| BB09 Đạt | P32 | JSP-DAT-05 A; JSP-DAT-10 C read; Huy cấp DTO/actions |
| BB10 Đại | P03; P36 module | JSP-DAI-07, JSP-DAI-12; Huy nhận module, không đổi chủ BB10 |
| BB11 Đại | P03; P36 module | JSP-DAI-07, JSP-DAI-12 charts pie; Huy nhận module |
| BB12 Huy | P06; P04/05/P11/12 hỗ trợ | JSP-HUY-07, JSP-HUY-09, JSP-HUY-13; C workflow chỉ khi nằm phạm vi BB12 đã chốt |
| BB13 Huy | P36; P23 hỗ trợ | JSP-HUY-06, JSP-HUY-13; không mở thêm job BS nghiệp vụ |
| TC01 Đạt | P01/P37 form | JSP-DAT-02, JSP-DAT-07; Đại auth, Huy tutor fields hỗ trợ |
| TC02 Huy | P36 orders, P21–23 | JSP-HUY-08; control hiện chưa có, cần chốt transitions |
| TC03 Huy | P32/P21/P33–35/P40 liên quan | JSP-HUY-08; Đạt tích hợp module trong history; cancel payment ≠ cancel order |
| TC04 Đại | Module P32/P38 | JSP-DAI-08, JSP-DAI-11; Đạt chỉ tích hợp anchor/UI |
| TC05 Đại | Module P32/P38/P22, P09/P10 | JSP-DAI-08, JSP-DAI-09, JSP-DAI-11; chủ trang nhận module |
| TC06 Đại | Filter module P39 | JSP-DAI-08, JSP-DAI-11; Đạt chủ page; Huy endpoint |
| TC07 Đạt | P39 | JSP-DAT-03, JSP-DAT-09; query sort contract server từ Huy/Đại |
| TC08 Đạt | P39 | JSP-DAT-03, JSP-DAT-09; Q06 cần xác nhận tutor là gian hàng |
| TC09 Đạt | P38 | JSP-DAT-03, JSP-DAT-09; đúng offering/tutor relation |
| TC10 Đạt | P24 | JSP-DAT-01, JSP-DAT-08; latest published stable sort |

Chức năng bổ sung chưa duyệt không xuất hiện trong nhiệm vụ B/C. P02/P07/P08/P20/P25–31 HOLD; không phân công triển khai mới. Huy là đầu mối file/navigation của các luồng giao dịch/công việc hiện có theo yêu cầu, không phải phê duyệt nghiệp vụ ngoài 23.

## 3. Bảng tổng hợp

| Mã | Chủ / review | Tên | BB/TC | Loại | Độ lớn | Page / tiên quyết và trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| JSP-DAI-01 | Đại; Huy | Chốt WAR, resolver và môi trường preview an toàn | Nền cho toàn bộ BB/TC | D | 5 | Nền/module; Có thể chốt/read configuration ngay; chỉ triển khai sau lượt audit.; chờ: Boot chờ Q01/Q03/Q04; không tự thêm DB thật. |
| JSP-DAI-02 | Đại; Huy; Đạt kiểm UI | Layout, fragment, assets và registry production | Nền dùng chung | A/D | 5 | Nền/module; Có thể chốt manifest/hook ngay; code chờ JSP-DAI-01.; chờ: Chốt registry/menu HOLD Q02/Q08; không tự tạo tất cả page ngoài phạm vi. |
| JSP-DAI-03 | Đại; Huy | Ranh giới API client, session, quyền và CSRF | BB01–BB04; nền toàn bộ | C/D | 5 | Nền/module; Spec/schema làm ngay; nền client làm sau01/02.; chờ: C thật chờ auth/session service; không lấy demo login làm endpoint thật. |
| JSP-DAI-04 | Đại; Đạt | Trang mẫu forgot-password chứng minh đầy đủ chuỗi JSP | BB04 phần giao diện | A/D | 1 | P13; Chuẩn bị mẫu ngay; thực hiện sau nền01/02.; chờ: Render chờ boot preview; gửi email thật nằm C riêng. |
| JSP-DAI-05 | Đại; Huy | Chuyển login và register | BB01, BB02 | A/D | 2 | P14, P15; A làm sau mẫu; DTO/error contract làm ngay.; chờ: C auth chờ10. |
| JSP-DAI-06 | Đại; Huy | Chuyển verify-email và reset-password | BB01, BB04 | A/D | 2 | P17, P16; State mapping/A sau nền; có thể chuẩn bị now.; chờ: Token thật, single-use và resend chờ10. |
| JSP-DAI-07 | Đại; Huy | Dashboard JSP và module bar/pie dùng lại ở seller | BB10, BB11 | A/D | 3 | P03; A/module DTO mẫu sau02; đọc metric hiện tại ngay.; chờ: Thống kê thật chờ API C12/Q07. |
| JSP-DAI-08 | Đại; Huy; Đạt kiểm hooks | Tách filter, review và report thành module bàn giao | TC04, TC05, TC06 | A/D | 5 | Nền/module; Spec/hook contract làm ngay; module sau02.; chờ: Tích hợp trang chờ chủ page sẵn; quyền/eligibility backend chờ11. |
| JSP-DAI-09 | Đại; Huy | Chuyển hàng đợi và chi tiết báo cáo | TC05 | A/D | 2 | P10, P09; A sau02/08; schema ngay.; chờ: C report decision chờ11. |
| JSP-DAI-10 | Đại; Huy | Nối backend auth và khôi phục mật khẩu | BB01, BB02, BB04; nền BB03 | C | 3 | P14, P15, P13, P17, P16; Spec có thể now; C chờ backend.; chờ: Backend auth/mail sandbox chưa có; không dùng task này để ước lượng toàn bộ backend. |
| JSP-DAI-11 | Đại; Huy; Đạt tích hợp trang | Nối review/report và điều kiện lọc thật | TC04, TC05, TC06 | C | 3 | Nền/module; Spec/fixture DTO now.; chờ: API/repository thật chưa có; backend implementation nằm kế hoạch BB/TC riêng. |
| JSP-DAI-12 | Đại; Huy | Nối dữ liệu thống kê thật | BB10, BB11 | C | 2 | P03; Metric contract now.; chờ: API số liệu thật chưa có. |
| JSP-DAI-13 | Đại; Huy và Đạt | Tích hợp navigation/shared và kiểm toàn bộ đợt | Toàn bộ 23; HOLD chỉ navigation | D | 3 | Nền/module; Manifest template now; kiểm sau pages.; chờ: Các page chưa giao, Q02/Q08 chưa chốt. |
| JSP-HUY-01 | Huy; Đại; Đạt nhận | Hợp đồng dữ liệu BB05 cho catalog/detail | BB05 phần dữ liệu/backend | C (chuẩn bị contract) | 2 | Nền/module; Làm ngay, không cần backend.; chờ: Read API thật chưa có; không đổi owner BB05. |
| JSP-HUY-02 | Huy; Đại; Đạt kiểm link giỏ | Chuyển cart/index | BB06; đầu vào BB07 | A/D | 2 | P18; A sau nền; DTO ngay.; chờ: C cart/order chờ10. |
| JSP-HUY-03 | Huy; Đại | Chuyển xác nhận và hai góc nhìn hợp đồng | BB07; TC02/TC03 hỗ trợ; BB13 | A/D | 3 | P21, P22, P23; A/contract schema sau nền.; chờ: C order/status/refund chờ08/10; business signature/attendance ngoài phạm vi chờ Q02. |
| JSP-HUY-04 | Huy; Đại | Chuyển checkout, QR và payment result | BB08 | A/D | 3 | P33, P34, P35; A sau nền; state mapping ngay.; chờ: Gateway sandbox/webhook thật chờ11. |
| JSP-HUY-05 | Huy; Đại | Chuyển wallet overview và ledger | BB08/TC03 phần hiển thị | A/D | 2 | P40; A sau nền, DTO now.; chờ: C ví chờ11; payout HOLD. |
| JSP-HUY-06 | Huy; Đại | Chuyển tutor/manage và nhận module thống kê | BB13; TC02 UI chờ; BB10/BB11 module | A/D | 3 | P36; A sau nền/charts; DTO ngay.; chờ: TC02/real CRUD chờ08/13, không tự gọi transitionOffering là cập nhật đơn. |
| JSP-HUY-07 | Huy; Đại | Chuyển admin/manage | BB12 | A/D | 3 | P06; A sau nền; action schema now.; chờ: C admin quyền/service chờ13. |
| JSP-HUY-08 | Huy; Đại; Đạt nhận module | Module trạng thái đơn và hủy/hoàn tiền | TC02, TC03 | C/D (thêm control trong trang hiện có) | 5 | Nền/module; Policy/schema/slot làm ngay; module sau nền.; chờ: Transition/policy Q07 và API/refund backend chưa có. |
| JSP-HUY-09 | Huy; Đại; Đạt đối chiếu tutor | Chuyển cặp hàng đợi/chi tiết quản lý cơ bản | BB12 phần đã chốt | A/D | 3 | P05, P04, P12, P11; Manifest/DTO now; A sau Q02+nền.; chờ: Nếu workflow ngoài BB12 thì HOLD, không giao C nâng cao. |
| JSP-HUY-10 | Huy; Đại | Nối cart và tạo đơn BB07 | BB06, BB07 | C | 3 | P18, P21; Contract/examples now.; chờ: Repo chưa có cart/order service/database; kế hoạch backend riêng. |
| JSP-HUY-11 | Huy; Đại | Nối payment sandbox và dữ liệu ví | BB08; ví hiển thị | C | 5 | P33, P34, P35, P40; Payment DTO/error state now.; chờ: Gateway và webhook backend/sandbox chưa có; không dùng QR demo làm chứng nhận BB08. |
| JSP-HUY-12 | Huy; Đại; Đạt nhận | Nối dữ liệu BB05 và cung cấp read contracts cho Đạt | BB05 dữ liệu; BB09/TC08/TC09/TC10 hỗ trợ read | C | 2 | Nền/module; Schema/examples now.; chờ: API/read service chưa có. |
| JSP-HUY-13 | Huy; Đại | Nối seller/admin CRUD trong quản lý cơ bản | BB12, BB13 | C | 3 | P36, P06; DTO/actions now.; chờ: Management services/permission backend chưa có; workflow bổ sung không tự mở. |
| JSP-DAT-01 | Đạt; Đại; Huy review data | Chuyển home và sản phẩm mới nhất | TC10 | A/D | 1 | P24; A sau mẫu; mapping/schema chuẩn bị ngay.; chờ: C newest API chờ JSP-HUY-12/Dat08. |
| JSP-DAT-02 | Đạt; Đại; Huy review tutor fields | Chuyển hai form hồ sơ cá nhân/gia sư | TC01; phần xác minh nâng cao HOLD | A/D | 2 | P01, P37; A sau nền; dễ–trung bình.; chờ: Persist C chờ07; workflow verification ngoài TC01 chờ Q02. |
| JSP-DAT-03 | Đạt; Đại: filter/review/report; Huy: read DTO | Chuyển tutor/search và tutor/profile | TC07, TC08, TC09; TC06/TC04/TC05 module Đại | A/D | 3 | P39, P38; A và state mẫu sau nền; spec now.; chờ: C read/ownership chờ JSP-HUY-12/Dat08; nghĩa TC08/TC09 Q06. |
| JSP-DAT-04 | Đạt; Huy: BB05 dữ liệu; Đại: layout | BB05: chuyển UI catalog/detail theo DTO Huy | BB05 phần UI | A/D | 2 | P19; A sau contract1/nền; không chờ full backend.; chờ: C offering/cart thật chờ JSP-HUY-12/10. |
| JSP-DAT-05 | Đạt; Huy: đơn/hủy; Đại: review/report | Chuyển order/history và tích hợp module được bàn giao | BB09; TC03 Huy; TC04/TC05 Đại | A/D | 3 | P32; UI shell/state mẫu có thể trước modules; tích hợp sau handoff.; chờ: Module C/API history chưa có; không nhận lỗi backend thành trách nhiệm dựng backend của Đạt. |
| JSP-DAT-06 | Đạt; Đại | BB03: tích hợp đăng xuất và kiểm user navigation | BB03; D cho trang Đạt | D/C | 1 | Nền/module; Mapping/hook now; C chờ auth.; chờ: Endpoint/session thật chưa có; file shared chỉ Đại. |
| JSP-DAT-07 | Đạt; Đại auth; Huy tutor fields | Nối cập nhật TC01 theo form contract | TC01 | C | 2 | P01, P37; DTO/form spec now; UI integration mức dễ–trung bình.; chờ: Profile backend chưa có; Đại hỗ trợ quyền. |
| JSP-DAT-08 | Đạt; Huy dữ liệu; Đại client/modules | Nối read API home và catalog/detail | TC10; BB05 UI | C/D | 2 | P24, P19; Field mapping/state layout now.; chờ: JSP-HUY-12 và các read endpoints chưa có; chỉ adapter UI đơn giản cho Đạt. |
| JSP-DAT-09 | Đạt; Huy dữ liệu; Đại client/modules | Nối read API tìm kiếm và hồ sơ gian hàng | TC07, TC08, TC09; module TC06/TC04/TC05 Đại | C/D | 2 | P39, P38; Field mapping/state layout now.; chờ: JSP-HUY-12 và các read endpoints chưa có; chỉ adapter UI đơn giản cho Đạt. |
| JSP-DAT-10 | Đạt; Huy dữ liệu; Đại client/modules | Nối read API lịch sử đơn và modules hành động | BB09; TC03 Huy; TC04/TC05 Đại | C/D | 2 | P32; Field mapping/state layout now.; chờ: JSP-HUY-12 và các read endpoints chưa có; chỉ adapter UI đơn giản cho Đạt. |

## 4. Nhiệm vụ chi tiết

Mọi “làm ngay” dưới đây nghĩa là có thể bắt đầu trong đợt triển khai kế tiếp; lượt hiện tại kết thúc ở audit. Source evidence dẫn đến working tree đang kiểm, không dẫn audit cũ. Root prefix cho đường Java trong current evidence là `src/main/java/com/educonnect/`; ma trận 02 có đường đầy đủ. Task page giữ dòng evidence trực tiếp dưới đây.

### Đại

#### JSP-DAI-01 — Chốt WAR, resolver và môi trường preview an toàn

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-01 — Chốt WAR, resolver và môi trường preview an toàn |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | Nền cho toàn bộ BB/TC; D; Chốt WAR, resolver và môi trường preview an toàn. Độ lớn 5: 5: chạm build/container/security/profile và điều kiện chung. |
| 4. Hiện trạng | pom.xml:10,17,23,59–75 đã khai báo Boot/JDK/WAR/JSP; src/main/resources/application.yml:1–6 chưa có resolver/DB/profile; src/main/java/com/educonnect/EduConnectApplication.java:6–11 chưa có initializer. Offline package đã pass. |
| 5. File sửa/tạo | `pom.xml (chỉ khi dependency thực sự thiếu; hiện chưa cần)`<br>`src/main/resources/application.yml`<br>`src/main/resources/application-ui-preview.yml (mới)`<br>`src/main/java/com/educonnect/EduConnectApplication.java (chỉ nếu chọn external WAR)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | Q01 MVC+JSP được giảng viên chấp nhận; Q03 run mode; Q04 profile local; Maven/JDK hiện có. |
| 7. Bước thực hiện | 1. Chốt executable WAR/Tomcat và giữ Jakarta, quản lý version bằng parent.<br>2. Thêm prefix/suffix/UTF-8 và preview loại datasource/JPA/Flyway, giới hạn GET allowlist; không mutation thật.<br>3. Package, boot preview tại loopback; lưu kết quả, không đưa secrets vào tài liệu. |
| 8. Đầu ra/người nhận | Cấu hình chạy + lệnh package/start + ranh giới preview → cả nhóm. |
| 9. Hoàn thành/kiểm | mvn package pass; boot preview không kết nối DB/migration/mail/payment; phân biệt package với boot; external WAR chỉ nghiệm thu nếu đã chọn và có initializer. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Có thể chốt/read configuration ngay; chỉ triển khai sau lượt audit. Chặn: Boot chờ Q01/Q03/Q04; không tự thêm DB thật. |

#### JSP-DAI-02 — Layout, fragment, assets và registry production

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-02 — Layout, fragment, assets và registry production |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy; Đạt kiểm UI |
| 3. Mục tiêu/BB-TC/loại | Nền dùng chung; A/D; Layout, fragment, assets và registry production. Độ lớn 5: 5: ảnh hưởng toàn bộ 40 trang và nhiều core modules. |
| 4. Hiện trạng | ui-prototype/js/core/route.js:14–55,67–78 còn registry HTML; ui-prototype/js/core/admin-sidebar.js:2–4,46–65 dùng markup inline/.html; 51 component rời nhưng chưa có JSP fragment. |
| 5. File sửa/tạo | `src/main/java/com/educonnect/config/PageViewController.java (mới)`<br>`src/main/java/com/educonnect/config/PageModelAdvice.java (mới)`<br>`src/main/webapp/WEB-INF/views/fragments/** (mới theo bảng 02)`<br>`src/main/resources/static/css/{tokens,reset,base,utilities,layouts}.css`<br>`src/main/resources/static/css/components/**`<br>`src/main/resources/static/js/core/**`<br>`src/main/resources/static/assets/**`<br>`src/main/resources/static/css/pages/contract/contract-detail.css` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-01; sơ đồ layouts báo cáo 03; R-Pxx; manifest page từ Huy/Đạt. |
| 7. Bước thực hiện | 1. Copy nền/component/assets cần dùng theo tên; tạo head/scripts/start/end fragments, giữ hooks/ID prefix.<br>2. Đổi EduRoute sang HTTP/context path và active pageKey; layout nạp core/script theo allowlist một lần.<br>3. Tạo mapping nhận manifest page; không đặt nghiệp vụ vào PageViewController; kiểm CSS/shared và init guards. |
| 8. Đầu ra/người nhận | Layout/route/init contract v1 + shared source duy nhất → Huy/Đạt. |
| 9. Hoàn thành/kiểm | Không có shell trùng; assets không404; context /educonnect; tabs/modal/select/header chỉ bind một lần; 51 component được phân loại, showcase không thành trang production. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Có thể chốt manifest/hook ngay; code chờ JSP-DAI-01. Chặn: Chốt registry/menu HOLD Q02/Q08; không tự tạo tất cả page ngoài phạm vi. |

#### JSP-DAI-03 — Ranh giới API client, session, quyền và CSRF

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-03 — Ranh giới API client, session, quyền và CSRF |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | BB01–BB04; nền toàn bộ; C/D; Ranh giới API client, session, quyền và CSRF. Độ lớn 5: 5: auth/CSRF và mọi mutation phụ thuộc. |
| 4. Hiện trạng | ui-prototype/js/data/store.js:269,282–309 fallback persona và login demo; pom.xml:35–38 có security starter nhưng chưa có security class; không API client HTTP. |
| 5. File sửa/tạo | `src/main/resources/static/js/core/api-client.js (mới)`<br>`src/main/resources/static/js/core/session.js (mới)`<br>`src/main/java/com/educonnect/security/SecurityConfig.java (mới)`<br>`src/main/java/com/educonnect/config/PageModelAdvice.java (chỉ Đại)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-01, JSP-DAI-02; Q05 cookie/session/form vs JSON; endpoint/error/CSRF contract do Huy và chủ BB cung cấp. |
| 7. Bước thực hiện | 1. Chốt currentUser/HTTP error/fieldErrors/base URL/CSRF header contract.<br>2. Tạo client nhỏ và session server boundary; chỉ preview dùng fixture adapter tách rõ.<br>3. Cấu hình quyền public/learner/tutor/admin, POST logout+CSRF; kiểm anonymous và ownership cùng Huy. |
| 8. Đầu ra/người nhận | Client/session/error contract + security handoff → Huy/Đạt. |
| 9. Hoàn thành/kiểm | Không personaStorage làm auth; 401/403/CSRF rõ; không gửi hai request; test cookie session thực chỉ khi backend auth sẵn; preview không được gắn nhãn production. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Spec/schema làm ngay; nền client làm sau01/02. Chặn: C thật chờ auth/session service; không lấy demo login làm endpoint thật. |

#### JSP-DAI-04 — Trang mẫu forgot-password chứng minh đầy đủ chuỗi JSP

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-04 — Trang mẫu forgot-password chứng minh đầy đủ chuỗi JSP |
| 2. Phụ trách/hỗ trợ/review | Đại; Đạt |
| 3. Mục tiêu/BB-TC/loại | BB04 phần giao diện; A/D; Trang mẫu forgot-password chứng minh đầy đủ chuỗi JSP. Độ lớn 1: 1: DOM nhỏ, không Store/tiền. |
| 4. Hiện trạng | P13: JS setTimeout, không gửi email (JS:63–66); bằng chứng `ui-prototype/pages/auth/forgot-password.html:1`, `ui-prototype/js/pages/auth/forgot-password.js:63`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/auth/forgot-password.jsp (tạo từ ui-prototype/pages/auth/forgot-password.html)`<br>`src/main/resources/static/js/pages/auth/forgot-password.js (tạo từ ui-prototype/js/pages/auth/forgot-password.js)`<br>`src/main/resources/static/css/pages/auth/forgot-password.css (tạo từ ui-prototype/css/pages/auth/forgot-password.css)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-01, JSP-DAI-02; auth layout, requestForm/pageState. Không cần mail backend. |
| 7. Bước thực hiện | 1. Chuyển HTML sang JSP giữ form hooks và UTF-8; tách auth layout.<br>2. Chuyển CSS/JS riêng; gửi mapping /auth/forgot-password cho controller chung.<br>3. Mở route/refresh/context khác root; submit demo chỉ feedback; ghi C email chưa có. |
| 8. Đầu ra/người nhận | P13 mẫu + manifest + kết quả smoke → Huy/Đạt dùng làm khuôn. |
| 9. Hoàn thành/kiểm | Route→controller→JSP→layout→CSS/JS; script đúng một bản; tiếng Việt; JS validation/loading/message; không gửi email. Mở `/auth/forgot-password` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Chuẩn bị mẫu ngay; thực hiện sau nền01/02. Chặn: Render chờ boot preview; gửi email thật nằm C riêng. |

#### JSP-DAI-05 — Chuyển login và register

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-05 — Chuyển login và register |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | BB01, BB02; A/D; Chuyển login và register. Độ lớn 2: 2: hai page cùng auth shell, hành vi client có sẵn. |
| 4. Hiện trạng | P14: EduStore.login chọn persona; không kiểm mật khẩu (JS:147; store:302–309); bằng chứng `ui-prototype/pages/auth/login.html:1`, `ui-prototype/js/pages/auth/login.js:8`; JSP chưa có; P15: JS validation + setTimeout (JS:65–71); bằng chứng `ui-prototype/pages/auth/register.html:1`, `ui-prototype/js/pages/auth/register.js:68`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/auth/login.jsp (tạo từ ui-prototype/pages/auth/login.html)`<br>`src/main/resources/static/js/pages/auth/login.js (tạo từ ui-prototype/js/pages/auth/login.js)`<br>`src/main/resources/static/css/pages/auth/login.css (tạo từ ui-prototype/css/pages/auth/login.css)`<br>`src/main/webapp/WEB-INF/views/auth/register.jsp (tạo từ ui-prototype/pages/auth/register.html)`<br>`src/main/resources/static/js/pages/auth/register.js (tạo từ ui-prototype/js/pages/auth/register.js)`<br>`src/main/resources/static/css/pages/auth/register.css (tạo từ ui-prototype/css/pages/auth/register.css)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-04; auth form/error schema. |
| 7. Bước thực hiện | 1. Chuyển hai page/forms và page assets giữ hooks; dùng shared password-input.<br>2. Thay link/redirect theo registry; không lấy state query làm auth.<br>3. Chuẩn bị success/invalid/locked/banned/verification states; bàn giao C cho JSP-DAI-10. |
| 8. Đầu ra/người nhận | P14/P15 + auth manifest → Đại tích hợp; Huy review. |
| 9. Hoàn thành/kiểm | Form lỗi/keyboard/refresh; không lưu mật khẩu; A chạy demo có nhãn; chưa khẳng định tạo user hay session thật. Mở `/auth/login`, `/auth/register` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A làm sau mẫu; DTO/error contract làm ngay. Chặn: C auth chờ10. |

#### JSP-DAI-06 — Chuyển verify-email và reset-password

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-06 — Chuyển verify-email và reset-password |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | BB01, BB04; A/D; Chuyển verify-email và reset-password. Độ lớn 2: 2: hai page auth tương tự; token backend tách khỏi A. |
| 4. Hiện trạng | P17: EduFixtures.authTokens; resend setTimeout; bằng chứng `ui-prototype/pages/auth/verify-email.html:1`, `ui-prototype/js/pages/auth/verify-email.js:6`; JSP chưa có; P16: EduFixtures.authTokens + cờ sessionStorage; không đổi mật khẩu thật; bằng chứng `ui-prototype/pages/auth/reset-password.html:1`, `ui-prototype/js/pages/auth/reset-password.js:6`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/auth/verify-email.jsp (tạo từ ui-prototype/pages/auth/verify-email.html)`<br>`src/main/resources/static/js/pages/auth/verify-email.js (tạo từ ui-prototype/js/pages/auth/verify-email.js)`<br>`src/main/resources/static/css/pages/auth/verify-email.css (tạo từ ui-prototype/css/pages/auth/verify-email.css)`<br>`src/main/webapp/WEB-INF/views/auth/reset-password.jsp (tạo từ ui-prototype/pages/auth/reset-password.html)`<br>`src/main/resources/static/js/pages/auth/reset-password.js (tạo từ ui-prototype/js/pages/auth/reset-password.js)`<br>`src/main/resources/static/css/pages/auth/reset-password.css (tạo từ ui-prototype/css/pages/auth/reset-password.css)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-04; tokenState schema; quy ước thông báo login. |
| 7. Bước thực hiện | 1. Chuyển markup/token states và assets.<br>2. Bỏ danh sách token demo khỏi production, giữ preview riêng; validate query phía handler.<br>3. Thay navigation/login notice; bàn giao C cho10. |
| 8. Đầu ra/người nhận | P16/P17 + state/route contract → Đại auth; Huy review. |
| 9. Hoàn thành/kiểm | missing/unknown/expired/used/valid; không lộ token; A không tuyên bố email đã xác minh hoặc mật khẩu đã đổi. Mở `/auth/verify-email`, `/auth/reset-password` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: State mapping/A sau nền; có thể chuẩn bị now. Chặn: Token thật, single-use và resend chờ10. |

#### JSP-DAI-07 — Dashboard JSP và module bar/pie dùng lại ở seller

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-07 — Dashboard JSP và module bar/pie dùng lại ở seller |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | BB10, BB11; A/D; Dashboard JSP và module bar/pie dùng lại ở seller. Độ lớn 3: 3: dashboard động + biểu đồ dùng ở hai chủ trang. |
| 4. Hiện trạng | P03: EduStore + façade tutor/payout; bar/pie demo (JS:305,356); bằng chứng `ui-prototype/pages/admin/dashboard.html:1`, `ui-prototype/js/pages/admin/dashboard.js:12`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/admin/dashboard.jsp (tạo từ ui-prototype/pages/admin/dashboard.html)`<br>`src/main/resources/static/js/pages/admin/dashboard.js (tạo từ ui-prototype/js/pages/admin/dashboard.js)`<br>`src/main/resources/static/css/pages/admin/dashboard.css (tạo từ ui-prototype/css/pages/admin/dashboard.css)`<br>`src/main/resources/static/js/core/charts.js (Đại duy nhất)`<br>`src/main/resources/static/css/components/data-display/chart.css (Đại duy nhất)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03; Huy thống nhất metric/status DTO; Q07 đơn vị/thời gian. |
| 7. Bước thực hiện | 1. Chuyển dashboard, xử lý các panel sinh động và range input.<br>2. Chuẩn hóa EduChart bar/pie với empty/invalid/error, không tự đổi policy tiền.<br>3. Bàn giao init/options/schema cho Huy P36, không sửa JS seller trực tiếp. |
| 8. Đầu ra/người nhận | P03 + charts contract/examples → Huy JSP-HUY-06; C chờ12. |
| 9. Hoàn thành/kiểm | Khoảng ngày sai/empty, tỷ lệ0/100; bar tính từ metric chốt; pie totals khớp; init không tạo panel thứ hai. Mở `/admin/dashboard` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A/module DTO mẫu sau02; đọc metric hiện tại ngay. Chặn: Thống kê thật chờ API C12/Q07. |

#### JSP-DAI-08 — Tách filter, review và report thành module bàn giao

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-08 — Tách filter, review và report thành module bàn giao |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy; Đạt kiểm hooks |
| 3. Mục tiêu/BB-TC/loại | TC04, TC05, TC06; A/D; Tách filter, review và report thành module bàn giao. Độ lớn 5: 5: nhiều chủ trang, dữ liệu/ownership và duplicate events. |
| 4. Hiện trạng | ui-prototype/js/pages/order/history.js:459–531 gọi review/report; ui-prototype/js/pages/tutor/profile.js:377–411,501 review/report; contract/student-detail.js dùng submitReport; ui-prototype/js/pages/tutor/search.js:1–8 đọc offerings. Module độc lập chưa có. |
| 5. File sửa/tạo | `src/main/resources/static/js/modules/catalog-filters.js (mới)`<br>`src/main/resources/static/js/modules/reviews.js (mới)`<br>`src/main/resources/static/js/modules/reports.js (mới)`<br>`src/main/webapp/WEB-INF/views/fragments/domain/review/** (mới)`<br>`src/main/webapp/WEB-INF/views/fragments/domain/report/** (mới)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03; Đạt/Huy bàn giao DOM anchors/ID prefix; Huy order/offering DTO; Q06 gian hàng. |
| 7. Bước thực hiện | 1. Định nghĩa eligibility/actions/errors/events và filter query với chủ trang.<br>2. Tách logic từ source đọc hiện tại thành module mới, không tự sửa JS/JSP trang của Huy/Đạt.<br>3. Bàn giao patch đề nghị: remove handler cũ, include module một lần; chủ trang thực hiện, Đại review. |
| 8. Đầu ra/người nhận | Review/report → Đạt P32/P38 và Huy P22/P21 nếu cần; filter schema → Đạt P39. |
| 9. Hoàn thành/kiểm | Không hai handler cho cùng modal; reviews chỉ order đã mua/đủ eligibility; report target hợp lệ; filter giữ sort cùng tập. C thật cần11. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Spec/hook contract làm ngay; module sau02. Chặn: Tích hợp trang chờ chủ page sẵn; quyền/eligibility backend chờ11. |

#### JSP-DAI-09 — Chuyển hàng đợi và chi tiết báo cáo

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-09 — Chuyển hàng đợi và chi tiết báo cáo |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | TC05; A/D; Chuyển hàng đợi và chi tiết báo cáo. Độ lớn 2: 2: cặp list/detail cùng admin layout. |
| 4. Hiện trạng | P10: EduReport→EduStore; unresolved gộp trạng thái; bằng chứng `ui-prototype/pages/admin/reports.html:1`, `ui-prototype/js/pages/admin/reports.js:144`; JSP chưa có; P09: EduReport→EduStore; quyết định demo; bằng chứng `ui-prototype/pages/admin/report-detail.html:1`, `ui-prototype/js/pages/admin/report-detail.js:306`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/admin/reports.jsp (tạo từ ui-prototype/pages/admin/reports.html)`<br>`src/main/resources/static/js/pages/admin/reports.js (tạo từ ui-prototype/js/pages/admin/reports.js)`<br>`src/main/resources/static/css/pages/admin/reports.css (tạo từ ui-prototype/css/pages/admin/reports.css)`<br>`src/main/webapp/WEB-INF/views/admin/report-detail.jsp (tạo từ ui-prototype/pages/admin/report-detail.html)`<br>`src/main/resources/static/js/pages/admin/report-detail.js (tạo từ ui-prototype/js/pages/admin/report-detail.js)`<br>`src/main/resources/static/css/pages/admin/report-detail.css (tạo từ ui-prototype/css/pages/admin/report-detail.css)`<br>`src/main/resources/static/js/pages/admin/report-data.js` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-08; ReportDTO; timeline/resolution. |
| 7. Bước thực hiện | 1. Chuyển hai trang admin dùng cùng report façade.<br>2. Mapping status/id/unresolved và detail actions; giữ validation lý do.<br>3. Bàn giao endpoint expectations cho11; integrate nav do Đại. |
| 8. Đầu ra/người nhận | P09/P10 + façade contract → Đại TC05; Huy review. |
| 9. Hoàn thành/kiểm | List/detail đồng bộ cùng nguồn; unresolved, id không tồn tại, quyết định một lần; A demo/C thật riêng. Mở `/admin/reports`, `/admin/report-detail` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau02/08; schema ngay. Chặn: C report decision chờ11. |

#### JSP-DAI-10 — Nối backend auth và khôi phục mật khẩu

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-10 — Nối backend auth và khôi phục mật khẩu |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | BB01, BB02, BB04; nền BB03; C; Nối backend auth và khôi phục mật khẩu. Độ lớn 3: 3 riêng phần nối JSP/API, không gồm xây auth service. |
| 4. Hiện trạng | P14: EduStore.login chọn persona; không kiểm mật khẩu (JS:147; store:302–309); bằng chứng `ui-prototype/pages/auth/login.html:1`, `ui-prototype/js/pages/auth/login.js:8`; JSP chưa có; P15: JS validation + setTimeout (JS:65–71); bằng chứng `ui-prototype/pages/auth/register.html:1`, `ui-prototype/js/pages/auth/register.js:68`; JSP chưa có; P13: JS setTimeout, không gửi email (JS:63–66); bằng chứng `ui-prototype/pages/auth/forgot-password.html:1`, `ui-prototype/js/pages/auth/forgot-password.js:63`; JSP chưa có; P17: EduFixtures.authTokens; resend setTimeout; bằng chứng `ui-prototype/pages/auth/verify-email.html:1`, `ui-prototype/js/pages/auth/verify-email.js:6`; JSP chưa có; P16: EduFixtures.authTokens + cờ sessionStorage; không đổi mật khẩu thật; bằng chứng `ui-prototype/pages/auth/reset-password.html:1`, `ui-prototype/js/pages/auth/reset-password.js:6`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/auth/login.jsp (tạo từ ui-prototype/pages/auth/login.html)`<br>`src/main/resources/static/js/pages/auth/login.js (tạo từ ui-prototype/js/pages/auth/login.js)`<br>`src/main/resources/static/css/pages/auth/login.css (tạo từ ui-prototype/css/pages/auth/login.css)`<br>`src/main/webapp/WEB-INF/views/auth/register.jsp (tạo từ ui-prototype/pages/auth/register.html)`<br>`src/main/resources/static/js/pages/auth/register.js (tạo từ ui-prototype/js/pages/auth/register.js)`<br>`src/main/resources/static/css/pages/auth/register.css (tạo từ ui-prototype/css/pages/auth/register.css)`<br>`src/main/webapp/WEB-INF/views/auth/forgot-password.jsp (tạo từ ui-prototype/pages/auth/forgot-password.html)`<br>`src/main/resources/static/js/pages/auth/forgot-password.js (tạo từ ui-prototype/js/pages/auth/forgot-password.js)`<br>`src/main/resources/static/css/pages/auth/forgot-password.css (tạo từ ui-prototype/css/pages/auth/forgot-password.css)`<br>`src/main/webapp/WEB-INF/views/auth/verify-email.jsp (tạo từ ui-prototype/pages/auth/verify-email.html)`<br>`src/main/resources/static/js/pages/auth/verify-email.js (tạo từ ui-prototype/js/pages/auth/verify-email.js)`<br>`src/main/resources/static/css/pages/auth/verify-email.css (tạo từ ui-prototype/css/pages/auth/verify-email.css)`<br>`src/main/webapp/WEB-INF/views/auth/reset-password.jsp (tạo từ ui-prototype/pages/auth/reset-password.html)`<br>`src/main/resources/static/js/pages/auth/reset-password.js (tạo từ ui-prototype/js/pages/auth/reset-password.js)`<br>`src/main/resources/static/css/pages/auth/reset-password.css (tạo từ ui-prototype/css/pages/auth/reset-password.css)`<br>`src/main/java/com/educonnect/auth/controller/AuthApiController.java (đề xuất nếu endpoint feature cần bổ sung)`<br>`src/main/java/com/educonnect/auth/dto/** (đề xuất contract; không tạo toàn bộ backend trong task JSP)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-03, JSP-DAI-05, JSP-DAI-06; auth service/token/email sandbox sẵn, API schema; chưa có trong repo. |
| 7. Bước thực hiện | 1. Đối chiếu endpoint/auth service đã bàn giao, validation/CSRF/fieldErrors.<br>2. Thay simulation/fixture call-site bằng client thật; giữ token ngoài model/log.<br>3. Kiểm register→verify→login và forgot→reset bằng mail sandbox, logout qua hook Đạt. |
| 8. Đầu ra/người nhận | Auth C evidence, error contract → Đạt logout; Huy giao dịch. |
| 9. Hoàn thành/kiểm | Session server, token expiry/single-use, reset không lưu mật khẩu client; không gửi mail thật. Chưa có service thì task còn blocked dù A pass. Mở `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/verify-email`, `/auth/reset-password` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Spec có thể now; C chờ backend. Chặn: Backend auth/mail sandbox chưa có; không dùng task này để ước lượng toàn bộ backend. |

#### JSP-DAI-11 — Nối review/report và điều kiện lọc thật

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-11 — Nối review/report và điều kiện lọc thật |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy; Đạt tích hợp trang |
| 3. Mục tiêu/BB-TC/loại | TC04, TC05, TC06; C; Nối review/report và điều kiện lọc thật. Độ lớn 3: 3: ba adapter liên quan quyền; không bao gồm dựng DB. |
| 4. Hiện trạng | ui-prototype/js/data/store.js:1440,1476,1509 mutation demo; chưa có service/API Java. |
| 5. File sửa/tạo | `src/main/resources/static/js/modules/reviews.js`<br>`src/main/resources/static/js/modules/reports.js`<br>`src/main/resources/static/js/modules/catalog-filters.js`<br>`src/main/java/com/educonnect/lesson/dto/** (đề xuất contract review)`<br>`src/main/java/com/educonnect/admin/dto/** (đề xuất contract report)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-08, JSP-DAI-09; Huy order ownership/eligibility và API; Q06 đối tượng sản phẩm/gian hàng. |
| 7. Bước thực hiện | 1. Chốt DTO/errors/unique-per-order/allowedActions; query server validation.<br>2. Nối module qua API thật, kiểm 401/403 và lỗi submission.<br>3. Chủ page tự tích hợp adapter được bàn giao; Đại kiểm không còn mutation demo production. |
| 8. Đầu ra/người nhận | Modules C → Đạt P32/P38/P39, Huy P22; admin TC05 P09/P10. |
| 9. Hoàn thành/kiểm | Người chưa mua không review; duplicate không tạo bản ghi thứ hai; report ownership đúng; filter/sort/paging server cùng tập. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Spec/fixture DTO now. Chặn: API/repository thật chưa có; backend implementation nằm kế hoạch BB/TC riêng. |

#### JSP-DAI-12 — Nối dữ liệu thống kê thật

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-12 — Nối dữ liệu thống kê thật |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy |
| 3. Mục tiêu/BB-TC/loại | BB10, BB11; C; Nối dữ liệu thống kê thật. Độ lớn 2: 2: client/DTO charts đã sẵn từ07. |
| 4. Hiện trạng | P03: EduStore + façade tutor/payout; bar/pie demo (JS:305,356); bằng chứng `ui-prototype/pages/admin/dashboard.html:1`, `ui-prototype/js/pages/admin/dashboard.js:12`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/admin/dashboard.jsp (tạo từ ui-prototype/pages/admin/dashboard.html)`<br>`src/main/resources/static/js/pages/admin/dashboard.js (tạo từ ui-prototype/js/pages/admin/dashboard.js)`<br>`src/main/resources/static/css/pages/admin/dashboard.css (tạo từ ui-prototype/css/pages/admin/dashboard.css)` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | JSP-DAI-07; Huy ledger/order aggregation DTO; Q07 metric/timezone; statistics API sẵn. |
| 7. Bước thực hiện | 1. Nối range query từ controls tới API.<br>2. Render bar/pie từ cùng response schema, rõ lỗi/empty.<br>3. Bàn giao adapter thống kê seller cho Huy, kiểm tổng đối chiếu ledger. |
| 8. Đầu ra/người nhận | P03 C + chart adapter → Huy P36. |
| 9. Hoàn thành/kiểm | from≤to; tổng/slices đúng endpoint; timezone/currency nhất quán; không gọi store fixture production. Mở `/admin/dashboard` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Metric contract now. Chặn: API số liệu thật chưa có. |

#### JSP-DAI-13 — Tích hợp navigation/shared và kiểm toàn bộ đợt

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAI-13 — Tích hợp navigation/shared và kiểm toàn bộ đợt |
| 2. Phụ trách/hỗ trợ/review | Đại; Huy và Đạt |
| 3. Mục tiêu/BB-TC/loại | Toàn bộ 23; HOLD chỉ navigation; D; Tích hợp navigation/shared và kiểm toàn bộ đợt. Độ lớn 3: 3: kiểm chéo nhiều route nhưng không viết backend. |
| 4. Hiện trạng | ui-prototype/js/core/route.js:14–55 đăng ký40+showcase; 23user/11admin nav hiện đúng static; route JSP chưa có. |
| 5. File sửa/tạo | `src/main/java/com/educonnect/config/PageViewController.java`<br>`src/main/java/com/educonnect/config/PageModelAdvice.java`<br>`src/main/webapp/WEB-INF/views/fragments/layout/**`<br>`src/main/resources/static/js/core/route.js`<br>`src/main/resources/static/js/core/{user-header,admin-header,admin-sidebar}.js` |
| File chung phải gửi tích hợp | Đại là đầu mối duy nhất; nhận manifest Huy/Đạt, không sửa trang riêng của họ |
| 6. Đầu vào/tiên quyết | Manifests nhiệm vụ page; module handoff; quyết định HOLD/menu Q02/Q08; kiểm05. |
| 7. Bước thực hiện | 1. Nhận manifest từng page và tích hợp mapping/nav/aliases được chốt.<br>2. Chạy package/start và toàn bộ route direct/deep-link/context/query; mỗi chủ trang sửa file riêng của mình.<br>3. Ghi pass A/D/C riêng, các blocker còn lại; không mở nghiệp vụ ngoài phạm vi. |
| 8. Đầu ra/người nhận | Registry + checklist nghiệm thu theo Pxx → cả nhóm. |
| 9. Hoàn thành/kiểm | Đủ mọi route thuộc phạm vi; không menu404/double init; shared chỉ Đại; tài khoản/vai trò thật kiểm khi C sẵn. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Manifest template now; kiểm sau pages. Chặn: Các page chưa giao, Q02/Q08 chưa chốt. |

### Huy

#### JSP-HUY-01 — Hợp đồng dữ liệu BB05 cho catalog/detail

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-01 — Hợp đồng dữ liệu BB05 cho catalog/detail |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại; Đạt nhận |
| 3. Mục tiêu/BB-TC/loại | BB05 phần dữ liệu/backend; C (chuẩn bị contract); Hợp đồng dữ liệu BB05 cho catalog/detail. Độ lớn 2: 2: cần data policy nhưng phạm vi một page. |
| 4. Hiện trạng | ui-prototype/js/pages/catalog/detail.js:8–11 đọc EduStore; ui-prototype/js/data/fixtures.js:68,82 chứa tutors/offerings; chưa có Java DTO/API. |
| 5. File sửa/tạo | `src/main/java/com/educonnect/lesson/dto/OfferingDetailDto.java (đề xuất khi nối backend)`<br>`src/main/java/com/educonnect/tutor/dto/TutorSummaryDto.java (đề xuất khi nối backend)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | Q06 sản phẩm/gian hàng; StoreOffering schema hiện tại; Đạt yêu cầu fields/empty/error; Đại session contract. |
| 7. Bước thực hiện | 1. Chốt id/type/status/pricing/currency/seats/terms/tutorSummary/allowedActions.<br>2. Bàn giao schema và mẫu ready/not-found/private/closed; xác định GET /api/offerings/{id}.<br>3. Review DOM mapping với Đạt; C thực hiện JSP-HUY-12 khi service sẵn. |
| 8. Đầu ra/người nhận | OfferingDetailDTO contract v1 → Đạt JSP-DAT-04 và Đại mapping. |
| 9. Hoàn thành/kiểm | Đạt dựng cả hai loại SERVICE/GROUP_CLASS mà không tự đoán giá/status; không coi contract là endpoint đã chạy. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Làm ngay, không cần backend. Chặn: Read API thật chưa có; không đổi owner BB05. |

#### JSP-HUY-02 — Chuyển cart/index

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-02 — Chuyển cart/index |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại; Đạt kiểm link giỏ |
| 3. Mục tiêu/BB-TC/loại | BB06; đầu vào BB07; A/D; Chuyển cart/index. Độ lớn 2: 2: một page có thao tác giỏ. |
| 4. Hiện trạng | P18: EduStore.cart* + checkoutFromCart demo; bằng chứng `ui-prototype/pages/cart/index.html:1`, `ui-prototype/js/pages/cart/index.js:3`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/cart/index.jsp (tạo từ ui-prototype/pages/cart/index.html)`<br>`src/main/resources/static/js/pages/cart/index.js (tạo từ ui-prototype/js/pages/cart/index.js)`<br>`src/main/resources/static/css/pages/cart/index.css (tạo từ ui-prototype/css/pages/cart/index.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-04; JSP-HUY-01; CartDTO/totals/errors. |
| 7. Bước thực hiện | 1. Chuyển JSP/JS/CSS, giữ DOM hooks item/quantity/total.<br>2. Thay navigation catalog/contract/checkout theo registry; validation preview rõ.<br>3. Bàn giao cart→order payload/idempotency cho10 và Đạt nút cartAdd. |
| 8. Đầu ra/người nhận | P18 + cart manifest → Đại; Đạt BB05; JSP-HUY-10. |
| 9. Hoàn thành/kiểm | Thêm/sửa/xóa, empty, seats limit, lỗi storage preview; totals A demo không là giá thật. Mở `/cart/index` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau nền; DTO ngay. Chặn: C cart/order chờ10. |

#### JSP-HUY-03 — Chuyển xác nhận và hai góc nhìn hợp đồng

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-03 — Chuyển xác nhận và hai góc nhìn hợp đồng |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB07; TC02/TC03 hỗ trợ; BB13; A/D; Chuyển xác nhận và hai góc nhìn hợp đồng. Độ lớn 3: 3: ba page chung data/layout; module tiền được tách. |
| 4. Hiện trạng | P21: EduStore contract/order/payments; chữ ký local demo; bằng chứng `ui-prototype/pages/contract/confirm.html:1`, `ui-prototype/js/pages/contract/confirm.js:1`; JSP chưa có; P22: EduStore; releaseSession/submitReport demo; bằng chứng `ui-prototype/pages/contract/student-detail.html:1`, `ui-prototype/js/pages/contract/student-detail.js:1`; JSP chưa có; P23: EduStore + markAttendance demo; bằng chứng `ui-prototype/pages/contract/tutor-detail.html:1`, `ui-prototype/js/pages/contract/tutor-detail.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/contract/confirm.jsp (tạo từ ui-prototype/pages/contract/confirm.html)`<br>`src/main/resources/static/js/pages/contract/confirm.js (tạo từ ui-prototype/js/pages/contract/confirm.js)`<br>`src/main/resources/static/css/pages/contract/confirm.css (tạo từ ui-prototype/css/pages/contract/confirm.css)`<br>`src/main/webapp/WEB-INF/views/contract/student-detail.jsp (tạo từ ui-prototype/pages/contract/student-detail.html)`<br>`src/main/resources/static/js/pages/contract/student-detail.js (tạo từ ui-prototype/js/pages/contract/student-detail.js)`<br>`src/main/resources/static/css/pages/contract/student-detail.css (tạo từ ui-prototype/css/pages/contract/student-detail.css)`<br>`src/main/webapp/WEB-INF/views/contract/tutor-detail.jsp (tạo từ ui-prototype/pages/contract/tutor-detail.html)`<br>`src/main/resources/static/js/pages/contract/tutor-detail.js (tạo từ ui-prototype/js/pages/contract/tutor-detail.js)`<br>`src/main/resources/static/css/pages/contract/tutor-detail.css (tạo từ ui-prototype/css/pages/contract/tutor-detail.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03; order/contract/payment DTO; Đại report module; contract-detail CSS request. |
| 7. Bước thực hiện | 1. Chuyển ba page cùng layout hợp đồng; nhận shared contract CSS từ Đại.<br>2. Giữ phân biệt id/contract/order và ownership fields; remove handler report cũ khi nhận module.<br>3. Mapping payment/history; không đưa attendance/tự giải ngân chưa duyệt vào C. |
| 8. Đầu ra/người nhận | P21/P22/P23 → Đại mapping; Đạt history link; JSP-HUY-10/08. |
| 9. Hoàn thành/kiểm | Same order/contract/payments; các ID sai không fallback; buyer/tutor states; module init một lần. Mở `/contract/confirm`, `/contract/student-detail`, `/contract/tutor-detail` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A/contract schema sau nền. Chặn: C order/status/refund chờ08/10; business signature/attendance ngoài phạm vi chờ Q02. |

#### JSP-HUY-04 — Chuyển checkout, QR và payment result

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-04 — Chuyển checkout, QR và payment result |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB08; A/D; Chuyển checkout, QR và payment result. Độ lớn 3: 3: nhiều state/redirect nhưng chưa gồm giao dịch thật. |
| 4. Hiện trạng | P33: EduStore/FIX; không giao dịch thật; bằng chứng `ui-prototype/pages/payment/checkout.html:1`, `ui-prototype/js/pages/payment/checkout.js:2`; JSP chưa có; P34: QR DEMO; timer; mutate chỉ hủy phiên (JS:184–207); bằng chứng `ui-prototype/pages/payment/qr.html:1`, `ui-prototype/js/pages/payment/qr.js:2`; JSP chưa có; P35: Store.resolvePaymentResult; status query không xác nhận đã trả tiền; bằng chứng `ui-prototype/pages/payment/result.html:1`, `ui-prototype/js/pages/payment/result.js:3`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/payment/checkout.jsp (tạo từ ui-prototype/pages/payment/checkout.html)`<br>`src/main/resources/static/js/pages/payment/checkout.js (tạo từ ui-prototype/js/pages/payment/checkout.js)`<br>`src/main/resources/static/css/pages/payment/checkout.css (tạo từ ui-prototype/css/pages/payment/checkout.css)`<br>`src/main/webapp/WEB-INF/views/payment/qr.jsp (tạo từ ui-prototype/pages/payment/qr.html)`<br>`src/main/resources/static/js/pages/payment/qr.js (tạo từ ui-prototype/js/pages/payment/qr.js)`<br>`src/main/resources/static/css/pages/payment/qr.css (tạo từ ui-prototype/css/pages/payment/qr.css)`<br>`src/main/webapp/WEB-INF/views/payment/result.jsp (tạo từ ui-prototype/pages/payment/result.html)`<br>`src/main/resources/static/js/pages/payment/result.js (tạo từ ui-prototype/js/pages/payment/result.js)`<br>`src/main/resources/static/css/pages/payment/result.css (tạo từ ui-prototype/css/pages/payment/result.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03; PaymentDTO/OrderDTO; from allowlist; không cần gateway thật để A. |
| 7. Bước thực hiện | 1. Chuyển ba page/assets, QR giữ shell tối giản.<br>2. Thay form action/JS routes; nhận payment status từ DTO, timer/cancel một lần.<br>3. Bàn giao payment/expiry/cancel/result expectations cho11; không tạo QR thật trong A. |
| 8. Đầu ra/người nhận | P33/P34/P35 → Đại mapping, Đạt link history, JSP-HUY-11. |
| 9. Hoàn thành/kiểm | ID/query lỗi; status spoof không success; QR cancel không cancel order; pagehide dọn interval. Mở `/payment/checkout`, `/payment/qr`, `/payment/result` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau nền; state mapping ngay. Chặn: Gateway sandbox/webhook thật chờ11. |

#### JSP-HUY-05 — Chuyển wallet overview và ledger

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-05 — Chuyển wallet overview và ledger |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB08/TC03 phần hiển thị; A/D; Chuyển wallet overview và ledger. Độ lớn 2: 2: một page đọc số liệu, không payout mutation. |
| 4. Hiện trạng | P40: EduStore walletSummary/ledger theo persona; bằng chứng `ui-prototype/pages/wallet/overview.html:1`, `ui-prototype/js/pages/wallet/overview.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/wallet/overview.jsp (tạo từ ui-prototype/pages/wallet/overview.html)`<br>`src/main/resources/static/js/pages/wallet/overview.js (tạo từ ui-prototype/js/pages/wallet/overview.js)`<br>`src/main/resources/static/css/pages/wallet/overview.css (tạo từ ui-prototype/css/pages/wallet/overview.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03; WalletSummary/LedgerDTO; Q07 metric; history links. |
| 7. Bước thực hiện | 1. Chuyển page, giữ #transactions và persona-display preview.<br>2. Tách ví/ledger read UI khỏi payout buttons chưa duyệt.<br>3. Bàn giao read endpoints cho11; mapping nav gửi Đại. |
| 8. Đầu ra/người nhận | P40 + wallet DTO/display → Đại; JSP-HUY-11. |
| 9. Hoàn thành/kiểm | Anchor/empty/filter; số dư/ledger cùng owner; không giao rút tiền thật. Mở `/wallet/overview` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau nền, DTO now. Chặn: C ví chờ11; payout HOLD. |

#### JSP-HUY-06 — Chuyển tutor/manage và nhận module thống kê

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-06 — Chuyển tutor/manage và nhận module thống kê |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB13; TC02 UI chờ; BB10/BB11 module; A/D; Chuyển tutor/manage và nhận module thống kê. Độ lớn 3: 3: page dài nhưng nội dung lặp tab/table, backend riêng. |
| 4. Hiện trạng | P36: EduStore CRUD offering demo; tab orders đọc; charts dùng EduChart; bằng chứng `ui-prototype/pages/tutor/manage.html:1`, `ui-prototype/js/pages/tutor/manage.js:2`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/tutor/manage.jsp (tạo từ ui-prototype/pages/tutor/manage.html)`<br>`src/main/resources/static/js/pages/tutor/manage.js (tạo từ ui-prototype/js/pages/tutor/manage.js)`<br>`src/main/resources/static/css/pages/tutor/manage.css (tạo từ ui-prototype/css/pages/tutor/manage.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-07; Offering/SellerOrderDTO; tab allowlist; Đại charts. |
| 7. Bước thực hiện | 1. Chuyển bốn tab/forms/modal; page JS/CSS riêng do Huy.<br>2. Tích hợp charts của Đại theo contract, không sửa core charts.<br>3. Đánh dấu tab orders read-only hiện tại; chuẩn bị anchor cho TC02 trong08; C seller13. |
| 8. Đầu ra/người nhận | P36 + seller manifest/anchor → Đại; JSP-HUY-08/13. |
| 9. Hoàn thành/kiểm | services/classes/orders/revenue đúng tab query; errors/empty; không duplicate chart; A không gọi transition thật. Mở `/tutor/manage` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau nền/charts; DTO ngay. Chặn: TC02/real CRUD chờ08/13, không tự gọi transitionOffering là cập nhật đơn. |

#### JSP-HUY-07 — Chuyển admin/manage

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-07 — Chuyển admin/manage |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB12; A/D; Chuyển admin/manage. Độ lớn 3: 3: ba loại entity trong một page. |
| 4. Hiện trạng | P06: EduStore; khóa tài khoản, duyệt offering giả lập; bằng chứng `ui-prototype/pages/admin/manage.html:1`, `ui-prototype/js/pages/admin/manage.js:2`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/admin/manage.jsp (tạo từ ui-prototype/pages/admin/manage.html)`<br>`src/main/resources/static/js/pages/admin/manage.js (tạo từ ui-prototype/js/pages/admin/manage.js)`<br>`src/main/resources/static/css/pages/admin/manage.css (tạo từ ui-prototype/css/pages/admin/manage.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03; AdminUser/Offering/OrderDTO; admin tab/actions contract. |
| 7. Bước thực hiện | 1. Chuyển users/offerings/orders panels và modals.<br>2. Điều hướng/query cùng registry; giữ lỗi/empty và không lấy admin persona làm quyền thật.<br>3. Bàn giao C lock/review/read orders cho13. |
| 8. Đầu ra/người nhận | P06 → Đại mapping; JSP-HUY-13. |
| 9. Hoàn thành/kiểm | Ba tab/paging; ID sai; admin shell một bản; mutation demo không production. Mở `/admin/manage` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau nền; action schema now. Chặn: C admin quyền/service chờ13. |

#### JSP-HUY-08 — Module trạng thái đơn và hủy/hoàn tiền

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-08 — Module trạng thái đơn và hủy/hoàn tiền |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại; Đạt nhận module |
| 3. Mục tiêu/BB-TC/loại | TC02, TC03; C/D (thêm control trong trang hiện có); Module trạng thái đơn và hủy/hoàn tiền. Độ lớn 5: 5: trạng thái/tiền/quyền nhiều trang; phần khó Huy chia với Đại session. |
| 4. Hiện trạng | ui-prototype/js/pages/tutor/manage.js:237–301 chỉ đọc order drawer; order/history.js dùng cancelOrder; ui-prototype/js/data/store.js:1149 cancel demo. Chưa có API status/refund thật. |
| 5. File sửa/tạo | `src/main/resources/static/js/modules/order-actions.js (mới)`<br>`src/main/webapp/WEB-INF/views/fragments/domain/order/** (mới)`<br>`src/main/java/com/educonnect/payment/dto/OrderActionDto.java (đề xuất contract)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-03; JSP-HUY-03/06; Đạt history hooks; Q07 transition/refund policy; Order service/refund sandbox sẵn cho C. |
| 7. Bước thực hiện | 1. Chốt allowed transitions, cancellation vs refund states, idempotency/error/ownership.<br>2. Tạo control TC02 trong slot seller và module cancel/refund mới; chủ page tích hợp, shared fragment gửi Đại.<br>3. Nối API khi có; kiểm duplicate/race/partial failure với sandbox, không chuyển tiền thật. |
| 8. Đầu ra/người nhận | OrderAction module/schema → Đạt P32; Huy P36/P21–23; Đại tích hợp shared. |
| 9. Hoàn thành/kiểm | TC02 không nhầm offering status; refund != cancelled; tổng server; lỗi giữ trạng thái; server deny sai role/owner; Control mới không là trang mới. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Policy/schema/slot làm ngay; module sau nền. Chặn: Transition/policy Q07 và API/refund backend chưa có. |

#### JSP-HUY-09 — Chuyển cặp hàng đợi/chi tiết quản lý cơ bản

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-09 — Chuyển cặp hàng đợi/chi tiết quản lý cơ bản |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại; Đạt đối chiếu tutor |
| 3. Mục tiêu/BB-TC/loại | BB12 phần đã chốt; A/D; Chuyển cặp hàng đợi/chi tiết quản lý cơ bản. Độ lớn 3: 3: bốn trang nhưng hai mẫu list/detail rất giống; tách handoff từng cặp. |
| 4. Hiện trạng | P05: EduStore.jobQueue; lọc/paging demo; bằng chứng `ui-prototype/pages/admin/job-review-queue.html:1`, `ui-prototype/js/pages/admin/job-review-queue.js:2`; JSP chưa có; P04: EduStore qua job-review-data; quyết định demo; bằng chứng `ui-prototype/pages/admin/job-review-detail.html:1`, `ui-prototype/js/pages/admin/job-review-detail.js:34`; JSP chưa có; P12: EduTutorReview fixture riêng; sessionStorage; bằng chứng `ui-prototype/pages/admin/tutor-review-queue.html:1`, `ui-prototype/js/pages/admin/tutor-review-queue.js:146`; JSP chưa có; P11: EduTutorReview: fixture HSGS riêng; chưa gắn tutor thật; bằng chứng `ui-prototype/pages/admin/tutor-review-detail.html:1`, `ui-prototype/js/pages/admin/tutor-review-detail.js:232`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/admin/job-review-queue.jsp (tạo từ ui-prototype/pages/admin/job-review-queue.html)`<br>`src/main/resources/static/js/pages/admin/job-review-queue.js (tạo từ ui-prototype/js/pages/admin/job-review-queue.js)`<br>`src/main/resources/static/css/pages/admin/job-review-queue.css (tạo từ ui-prototype/css/pages/admin/job-review-queue.css)`<br>`src/main/webapp/WEB-INF/views/admin/job-review-detail.jsp (tạo từ ui-prototype/pages/admin/job-review-detail.html)`<br>`src/main/resources/static/js/pages/admin/job-review-detail.js (tạo từ ui-prototype/js/pages/admin/job-review-detail.js)`<br>`src/main/resources/static/css/pages/admin/job-review-detail.css (tạo từ ui-prototype/css/pages/admin/job-review-detail.css)`<br>`src/main/webapp/WEB-INF/views/admin/tutor-review-queue.jsp (tạo từ ui-prototype/pages/admin/tutor-review-queue.html)`<br>`src/main/resources/static/js/pages/admin/tutor-review-queue.js (tạo từ ui-prototype/js/pages/admin/tutor-review-queue.js)`<br>`src/main/resources/static/css/pages/admin/tutor-review-queue.css (tạo từ ui-prototype/css/pages/admin/tutor-review-queue.css)`<br>`src/main/webapp/WEB-INF/views/admin/tutor-review-detail.jsp (tạo từ ui-prototype/pages/admin/tutor-review-detail.html)`<br>`src/main/resources/static/js/pages/admin/tutor-review-detail.js (tạo từ ui-prototype/js/pages/admin/tutor-review-detail.js)`<br>`src/main/resources/static/css/pages/admin/tutor-review-detail.css (tạo từ ui-prototype/css/pages/admin/tutor-review-detail.css)`<br>`src/main/resources/static/js/pages/admin/job-review-data.js`<br>`src/main/resources/static/js/pages/admin/tutor-review-data.js` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | Q02 xác nhận các UI này nằm BB12; JSP-DAI-02, JSP-DAI-03; data façade contract; không mở workflow nâng cao. |
| 7. Bước thực hiện | 1. Chuyển theo hai cặp list/detail cùng table/modal layout; có thể bàn giao từng cặp riêng.<br>2. Giữ phân biệt HSGS fixture với tutorId; status/id/query; files data do Huy, shared do Đại.<br>3. C endpoints kiểm duyệt chỉ nối khi được chốt và backend sẵn; không triển khai các bổ sung chưa duyệt. |
| 8. Đầu ra/người nhận | P04/P05/P11/P12 hai gói list/detail → Đại nav; Đạt read profile. |
| 9. Hoàn thành/kiểm | List/detail cùng source; ID lạ/error/empty; validation reason; không coi tệp demo là bằng cấp thật. Mở `/admin/job-review-queue`, `/admin/job-review-detail`, `/admin/tutor-review-queue`, `/admin/tutor-review-detail` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Manifest/DTO now; A sau Q02+nền. Chặn: Nếu workflow ngoài BB12 thì HOLD, không giao C nâng cao. |

#### JSP-HUY-10 — Nối cart và tạo đơn BB07

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-10 — Nối cart và tạo đơn BB07 |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB06, BB07; C; Nối cart và tạo đơn BB07. Độ lớn 3: 3 cho adapter và kiểm giao dịch, không xây schema/backend. |
| 4. Hiện trạng | P18: EduStore.cart* + checkoutFromCart demo; bằng chứng `ui-prototype/pages/cart/index.html:1`, `ui-prototype/js/pages/cart/index.js:3`; JSP chưa có; P21: EduStore contract/order/payments; chữ ký local demo; bằng chứng `ui-prototype/pages/contract/confirm.html:1`, `ui-prototype/js/pages/contract/confirm.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/cart/index.jsp (tạo từ ui-prototype/pages/cart/index.html)`<br>`src/main/resources/static/js/pages/cart/index.js (tạo từ ui-prototype/js/pages/cart/index.js)`<br>`src/main/resources/static/css/pages/cart/index.css (tạo từ ui-prototype/css/pages/cart/index.css)`<br>`src/main/webapp/WEB-INF/views/contract/confirm.jsp (tạo từ ui-prototype/pages/contract/confirm.html)`<br>`src/main/resources/static/js/pages/contract/confirm.js (tạo từ ui-prototype/js/pages/contract/confirm.js)`<br>`src/main/resources/static/css/pages/contract/confirm.css (tạo từ ui-prototype/css/pages/contract/confirm.css)`<br>`src/main/java/com/educonnect/payment/dto/{CartDto,OrderSummaryDto}.java (đề xuất contract)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-HUY-02, JSP-HUY-03; JSP-DAI-03; cart/order service/API sẵn; server pricing/seats/idempotency. |
| 7. Bước thực hiện | 1. Nối cart CRUD vào client; thay checkoutFromCart demo bằng POST orders.<br>2. Nhận orderId/contractId/allowedActions từ response, không bịa ID.<br>3. Kiểm rollback/error/duplicate và hướng sang checkout/history. |
| 8. Đầu ra/người nhận | P18/P21 C + OrderSummaryDTO → Đạt history; Huy payment. |
| 9. Hoàn thành/kiểm | Server recompute giá/chỗ; click lặp chỉ một order; dữ liệu refresh còn; C không pass nếu API thiếu. Mở `/cart/index`, `/contract/confirm` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Contract/examples now. Chặn: Repo chưa có cart/order service/database; kế hoạch backend riêng. |

#### JSP-HUY-11 — Nối payment sandbox và dữ liệu ví

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-11 — Nối payment sandbox và dữ liệu ví |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB08; ví hiển thị; C; Nối payment sandbox và dữ liệu ví. Độ lớn 5: 5: state tiền/người dùng nhiều page; khó chia cùng Đại auth/quyền. |
| 4. Hiện trạng | P33: EduStore/FIX; không giao dịch thật; bằng chứng `ui-prototype/pages/payment/checkout.html:1`, `ui-prototype/js/pages/payment/checkout.js:2`; JSP chưa có; P34: QR DEMO; timer; mutate chỉ hủy phiên (JS:184–207); bằng chứng `ui-prototype/pages/payment/qr.html:1`, `ui-prototype/js/pages/payment/qr.js:2`; JSP chưa có; P35: Store.resolvePaymentResult; status query không xác nhận đã trả tiền; bằng chứng `ui-prototype/pages/payment/result.html:1`, `ui-prototype/js/pages/payment/result.js:3`; JSP chưa có; P40: EduStore walletSummary/ledger theo persona; bằng chứng `ui-prototype/pages/wallet/overview.html:1`, `ui-prototype/js/pages/wallet/overview.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/payment/checkout.jsp (tạo từ ui-prototype/pages/payment/checkout.html)`<br>`src/main/resources/static/js/pages/payment/checkout.js (tạo từ ui-prototype/js/pages/payment/checkout.js)`<br>`src/main/resources/static/css/pages/payment/checkout.css (tạo từ ui-prototype/css/pages/payment/checkout.css)`<br>`src/main/webapp/WEB-INF/views/payment/qr.jsp (tạo từ ui-prototype/pages/payment/qr.html)`<br>`src/main/resources/static/js/pages/payment/qr.js (tạo từ ui-prototype/js/pages/payment/qr.js)`<br>`src/main/resources/static/css/pages/payment/qr.css (tạo từ ui-prototype/css/pages/payment/qr.css)`<br>`src/main/webapp/WEB-INF/views/payment/result.jsp (tạo từ ui-prototype/pages/payment/result.html)`<br>`src/main/resources/static/js/pages/payment/result.js (tạo từ ui-prototype/js/pages/payment/result.js)`<br>`src/main/resources/static/css/pages/payment/result.css (tạo từ ui-prototype/css/pages/payment/result.css)`<br>`src/main/webapp/WEB-INF/views/wallet/overview.jsp (tạo từ ui-prototype/pages/wallet/overview.html)`<br>`src/main/resources/static/js/pages/wallet/overview.js (tạo từ ui-prototype/js/pages/wallet/overview.js)`<br>`src/main/resources/static/css/pages/wallet/overview.css (tạo từ ui-prototype/css/pages/wallet/overview.css)`<br>`src/main/java/com/educonnect/payment/dto/PaymentResultDto.java (đề xuất contract)`<br>`src/main/java/com/educonnect/wallet/dto/WalletSummaryDto.java (đề xuất contract)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-HUY-04, JSP-HUY-05, JSP-HUY-10; JSP-DAI-03; gateway sandbox/webhook verification/service ledger sẵn; Q07. |
| 7. Bước thực hiện | 1. Nối create/read/cancel payment session, timeout/idempotency.<br>2. Result đọc server-verified status; ví/ledger từ server cùng order.<br>3. Kiểm sandbox success/pending/fail/cancel/spoof query, không gọi payout hoặc giao dịch thật. |
| 8. Đầu ra/người nhận | PaymentResult/Wallet C → Đạt history; Đại statistics. |
| 9. Hoàn thành/kiểm | status=success query không tự cộng ví; signature webhook do backend xác minh; lỗi/timeout không duplicate; server ledger totals. Mở `/payment/checkout`, `/payment/qr`, `/payment/result`, `/wallet/overview` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Payment DTO/error state now. Chặn: Gateway và webhook backend/sandbox chưa có; không dùng QR demo làm chứng nhận BB08. |

#### JSP-HUY-12 — Nối dữ liệu BB05 và cung cấp read contracts cho Đạt

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-12 — Nối dữ liệu BB05 và cung cấp read contracts cho Đạt |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại; Đạt nhận |
| 3. Mục tiêu/BB-TC/loại | BB05 dữ liệu; BB09/TC08/TC09/TC10 hỗ trợ read; C; Nối dữ liệu BB05 và cung cấp read contracts cho Đạt. Độ lớn 2: 2: read adapter; full backend không trong estimate. |
| 4. Hiện trạng | ui-prototype/js/data/fixtures.js:68,82,159; ui-prototype/js/pages/catalog/detail.js:8–11; chưa có read API. |
| 5. File sửa/tạo | `src/main/java/com/educonnect/lesson/dto/OfferingDetailDto.java (contract đề xuất)`<br>`src/main/java/com/educonnect/tutor/dto/TutorSummaryDto.java (contract đề xuất)`<br>`src/main/resources/static/js/modules/catalog-data.js (adapter mới nếu cần, gửi Đại tích hợp)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-HUY-01; real catalog/tutor/order read service/API; Q06; Đại client03. |
| 7. Bước thực hiện | 1. Đối chiếu GET offering/list/tutor offerings/newest/history contracts.<br>2. Cấp async read adapter và ready/empty/error examples; không thay UI BB05 của Đạt.<br>3. Đạt nhận adapter, tích hợp JSP-DAT-08, JSP-DAT-09, JSP-DAT-10 theo nhóm trang; Huy kiểm server pricing/visibility. |
| 8. Đầu ra/người nhận | Read API/DTO/adapter → Đạt P19/P24/P32/P38/P39; Đại filter. |
| 9. Hoàn thành/kiểm | ID không fallback; public visibility; newest sort stable; history ownership; contract chưa chạy phải ghi blocked. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Schema/examples now. Chặn: API/read service chưa có. |

#### JSP-HUY-13 — Nối seller/admin CRUD trong quản lý cơ bản

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-HUY-13 — Nối seller/admin CRUD trong quản lý cơ bản |
| 2. Phụ trách/hỗ trợ/review | Huy; Đại |
| 3. Mục tiêu/BB-TC/loại | BB12, BB13; C; Nối seller/admin CRUD trong quản lý cơ bản. Độ lớn 3: 3: adapter hai page quản lý, khó backend đã tách. |
| 4. Hiện trạng | P36: EduStore CRUD offering demo; tab orders đọc; charts dùng EduChart; bằng chứng `ui-prototype/pages/tutor/manage.html:1`, `ui-prototype/js/pages/tutor/manage.js:2`; JSP chưa có; P06: EduStore; khóa tài khoản, duyệt offering giả lập; bằng chứng `ui-prototype/pages/admin/manage.html:1`, `ui-prototype/js/pages/admin/manage.js:2`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/tutor/manage.jsp (tạo từ ui-prototype/pages/tutor/manage.html)`<br>`src/main/resources/static/js/pages/tutor/manage.js (tạo từ ui-prototype/js/pages/tutor/manage.js)`<br>`src/main/resources/static/css/pages/tutor/manage.css (tạo từ ui-prototype/css/pages/tutor/manage.css)`<br>`src/main/webapp/WEB-INF/views/admin/manage.jsp (tạo từ ui-prototype/pages/admin/manage.html)`<br>`src/main/resources/static/js/pages/admin/manage.js (tạo từ ui-prototype/js/pages/admin/manage.js)`<br>`src/main/resources/static/css/pages/admin/manage.css (tạo từ ui-prototype/css/pages/admin/manage.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-HUY-06, JSP-HUY-07; JSP-DAI-03; real offering/user/order API; Q02/Q07; charts từ Đại. |
| 7. Bước thực hiện | 1. Nối read/list/save/transition đã duyệt, phân biệt tutor/admin allowedActions.<br>2. Server validate ownership và state; errors trả về form/modal đúng field.<br>3. Nối charts seller qua adapter Đại; TC02 dùng module08, không duplicate logic. |
| 8. Đầu ra/người nhận | P06/P36 C → Đại kiểm quyền/navigation; Đạt catalog đọc dữ liệu mới. |
| 9. Hoàn thành/kiểm | Không user/tutor tự thành admin; illegal transition403/409; snapshot đơn không đổi theo offering; thao tác lưu lỗi không mất dữ liệu. Mở `/tutor/manage`, `/admin/manage` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: DTO/actions now. Chặn: Management services/permission backend chưa có; workflow bổ sung không tự mở. |

### Đạt

#### JSP-DAT-01 — Chuyển home và sản phẩm mới nhất

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-01 — Chuyển home và sản phẩm mới nhất |
| 2. Phụ trách/hỗ trợ/review | Đạt; Đại; Huy review data |
| 3. Mục tiêu/BB-TC/loại | TC10; A/D; Chuyển home và sản phẩm mới nhất. Độ lớn 1: 1: một page read-only, layout đơn giản. |
| 4. Hiện trạng | P24: EduStore.latestOfferings(6), fixture publishedAt; bằng chứng `ui-prototype/pages/home.html:1`, `ui-prototype/js/pages/home.js:3`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/home.jsp (tạo từ ui-prototype/pages/home.html)`<br>`src/main/resources/static/js/pages/home.js (tạo từ ui-prototype/js/pages/home.js)`<br>`src/main/resources/static/css/pages/home.css (tạo từ ui-prototype/css/pages/home.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-04; LatestOfferingDTO mẫu từ JSP-HUY-01/12. |
| 7. Bước thực hiện | 1. Chuyển home.jsp/layout và assets, giữ độ sâu nguồn một cấp chỉ làm reference.<br>2. Đổi form GET q sang /tutor/search, card links catalog/profile theo registry.<br>3. Bàn giao mapping/css/js manifest cho Đại. |
| 8. Đầu ra/người nhận | P24 → Đại; read C nối ở08. |
| 9. Hoàn thành/kiểm | Home route/direct/refresh; q và newest ổn định; empty; JS card init một lần. Mở `/home` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau mẫu; mapping/schema chuẩn bị ngay. Chặn: C newest API chờ JSP-HUY-12/Dat08. |

#### JSP-DAT-02 — Chuyển hai form hồ sơ cá nhân/gia sư

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-02 — Chuyển hai form hồ sơ cá nhân/gia sư |
| 2. Phụ trách/hỗ trợ/review | Đạt; Đại; Huy review tutor fields |
| 3. Mục tiêu/BB-TC/loại | TC01; phần xác minh nâng cao HOLD; A/D; Chuyển hai form hồ sơ cá nhân/gia sư. Độ lớn 2: 2: hai page cùng form layout, backend/auth Đại hỗ trợ. |
| 4. Hiện trạng | P01: Hồ sơ hardcode trong HTML; lưu chỉ đổi DOM (JS:18,72–86); bằng chứng `ui-prototype/pages/account/profile.html:1`, `ui-prototype/js/pages/account/profile.js:1`; JSP chưa có; P37: HTML/form + states JS; thay state client (JS:12,116); bằng chứng `ui-prototype/pages/tutor/my-profile.html:1`, `ui-prototype/js/pages/tutor/my-profile.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/account/profile.jsp (tạo từ ui-prototype/pages/account/profile.html)`<br>`src/main/resources/static/js/pages/account/profile.js (tạo từ ui-prototype/js/pages/account/profile.js)`<br>`src/main/resources/static/css/pages/account/profile.css (tạo từ ui-prototype/css/pages/account/profile.css)`<br>`src/main/webapp/WEB-INF/views/tutor/my-profile.jsp (tạo từ ui-prototype/pages/tutor/my-profile.html)`<br>`src/main/resources/static/js/pages/tutor/my-profile.js (tạo từ ui-prototype/js/pages/tutor/my-profile.js)`<br>`src/main/resources/static/css/pages/tutor/my-profile.css (tạo từ ui-prototype/css/pages/tutor/my-profile.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-04; ProfileDTO/TutorProfileDTO; chỉ trường TC01 đã chốt. |
| 7. Bước thực hiện | 1. Chuyển hai form/layout/account-footer; giữ edit/cancel/fieldErrors.<br>2. Tách trạng thái verified khỏi query production; không mở workflow xác minh mới.<br>3. Bàn giao mapping và form field contract; C profile ở07. |
| 8. Đầu ra/người nhận | P01/P37 → Đại mapping; Huy fields tutor; Đạt07. |
| 9. Hoàn thành/kiểm | Edit/cancel không mất dữ liệu; tiếng Việt; lịch rảnh responsive; không nói dữ liệu DOM đã lưu DB. Mở `/account/profile`, `/tutor/my-profile` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau nền; dễ–trung bình. Chặn: Persist C chờ07; workflow verification ngoài TC01 chờ Q02. |

#### JSP-DAT-03 — Chuyển tutor/search và tutor/profile

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-03 — Chuyển tutor/search và tutor/profile |
| 2. Phụ trách/hỗ trợ/review | Đạt; Đại: filter/review/report; Huy: read DTO |
| 3. Mục tiêu/BB-TC/loại | TC07, TC08, TC09; TC06/TC04/TC05 module Đại; A/D; Chuyển tutor/search và tutor/profile. Độ lớn 3: 3: hai page dài nhưng chỉ UI, filter/business đã bàn giao. |
| 4. Hiện trạng | P39: EduStore.list offerings; UI tên Tìm gia sư; cần chốt nghĩa gian hàng; bằng chứng `ui-prototype/pages/tutor/search.html:1`, `ui-prototype/js/pages/tutor/search.js:1`; JSP chưa có; P38: EduStore tutor/offering/review; submitReport demo; bằng chứng `ui-prototype/pages/tutor/profile.html:1`, `ui-prototype/js/pages/tutor/profile.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/tutor/search.jsp (tạo từ ui-prototype/pages/tutor/search.html)`<br>`src/main/resources/static/js/pages/tutor/search.js (tạo từ ui-prototype/js/pages/tutor/search.js)`<br>`src/main/resources/static/css/pages/tutor/search.css (tạo từ ui-prototype/css/pages/tutor/search.css)`<br>`src/main/webapp/WEB-INF/views/tutor/profile.jsp (tạo từ ui-prototype/pages/tutor/profile.html)`<br>`src/main/resources/static/js/pages/tutor/profile.js (tạo từ ui-prototype/js/pages/tutor/profile.js)`<br>`src/main/resources/static/css/pages/tutor/profile.css (tạo từ ui-prototype/css/pages/tutor/profile.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-08; JSP-HUY-01 read DTO; Q06 gian hàng; filter/module anchors. |
| 7. Bước thực hiện | 1. Chuyển list/profile UI, giữ q/filter/sort/paging và id; page assets riêng.<br>2. Nhận filter schema/review/report modules của Đại; remove handlers cũ theo patch handoff.<br>3. Mapping catalogue/giỏ/history; lời mời/chat HOLD gửi Đại chốt menu, không tự thêm backend. |
| 8. Đầu ra/người nhận | P38/P39 → Đại mapping/modules; Huy read contracts. |
| 9. Hoàn thành/kiểm | Cùng tập filter/sort; sản phẩm đúng tutor; ID lạ; reviews/empty/report modal một handler; phần khó do module Đại. Mở `/tutor/search`, `/tutor/profile` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A và state mẫu sau nền; spec now. Chặn: C read/ownership chờ JSP-HUY-12/Dat08; nghĩa TC08/TC09 Q06. |

#### JSP-DAT-04 — BB05: chuyển UI catalog/detail theo DTO Huy

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-04 — BB05: chuyển UI catalog/detail theo DTO Huy |
| 2. Phụ trách/hỗ trợ/review | Đạt; Huy: BB05 dữ liệu; Đại: layout |
| 3. Mục tiêu/BB-TC/loại | BB05 phần UI; A/D; BB05: chuyển UI catalog/detail theo DTO Huy. Độ lớn 2: 2: một page read UI; policy dữ liệu Huy xử lý. |
| 4. Hiện trạng | P19: EduStore.offering/tutor/cartAdd; chỉ công khai offering hợp lệ; bằng chứng `ui-prototype/pages/catalog/detail.html:1`, `ui-prototype/js/pages/catalog/detail.js:8`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/catalog/detail.jsp (tạo từ ui-prototype/pages/catalog/detail.html)`<br>`src/main/resources/static/js/pages/catalog/detail.js (tạo từ ui-prototype/js/pages/catalog/detail.js)`<br>`src/main/resources/static/css/pages/catalog/detail.css (tạo từ ui-prototype/css/pages/catalog/detail.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-HUY-01 contract v1; JSP-DAI-02, JSP-DAI-03, JSP-DAI-04; OfferingDetailDTO examples. |
| 7. Bước thực hiện | 1. Map các trường từ DTO đã nhận vào JSP/DOM, chuyển assets.<br>2. Giữ hai loại sản phẩm và available/closed/private/not-found states.<br>3. Nút cartAdd gọi adapter Huy/Đại; gửi mapping cho Đại, không tự viết backend BB05. |
| 8. Đầu ra/người nhận | P19 UI + data field mapping → Huy review; Đại integrate. |
| 9. Hoàn thành/kiểm | Khớp schema Huy, giá không từ query; button availability; ID sai; khi C thiếu giữ nhãn demo/blocked. Mở `/catalog/detail` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: A sau contract1/nền; không chờ full backend. Chặn: C offering/cart thật chờ JSP-HUY-12/10. |

#### JSP-DAT-05 — Chuyển order/history và tích hợp module được bàn giao

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-05 — Chuyển order/history và tích hợp module được bàn giao |
| 2. Phụ trách/hỗ trợ/review | Đạt; Huy: đơn/hủy; Đại: review/report |
| 3. Mục tiêu/BB-TC/loại | BB09; TC03 Huy; TC04/TC05 Đại; A/D; Chuyển order/history và tích hợp module được bàn giao. Độ lớn 3: 3: page nhiều vùng nhưng hành động khó được tách. |
| 4. Hiện trạng | P32: EduStore.ordersByLearner; modal cancel/review/report đang cùng JS; bằng chứng `ui-prototype/pages/order/history.html:1`, `ui-prototype/js/pages/order/history.js:2`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/order/history.jsp (tạo từ ui-prototype/pages/order/history.html)`<br>`src/main/resources/static/js/pages/order/history.js (tạo từ ui-prototype/js/pages/order/history.js)`<br>`src/main/resources/static/css/pages/order/history.css (tạo từ ui-prototype/css/pages/order/history.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-02, JSP-DAI-03, JSP-DAI-08; JSP-HUY-08 module; HistoryPageDTO từ JSP-HUY-12/10. |
| 7. Bước thực hiện | 1. Chuyển table/filter/detail UI giữ status/channel/id query.<br>2. Tích hợp cancel module Huy, review/report module Đại; bỏ callback cũ theo handoff.<br>3. Gửi manifest links/detail/checkout cho Đại; không sửa logic tiền/review eligibility. |
| 8. Đầu ra/người nhận | P32 UI → Đại mapping; Huy/Dai review modules; read C ở08. |
| 9. Hoàn thành/kiểm | History filters/detail/empty/error; chỉ một event mỗi modal; Đạt không phải tự quyết refund/eligibility. Mở `/order/history` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: UI shell/state mẫu có thể trước modules; tích hợp sau handoff. Chặn: Module C/API history chưa có; không nhận lỗi backend thành trách nhiệm dựng backend của Đạt. |

#### JSP-DAT-06 — BB03: tích hợp đăng xuất và kiểm user navigation

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-06 — BB03: tích hợp đăng xuất và kiểm user navigation |
| 2. Phụ trách/hỗ trợ/review | Đạt; Đại |
| 3. Mục tiêu/BB-TC/loại | BB03; D cho trang Đạt; D/C; BB03: tích hợp đăng xuất và kiểm user navigation. Độ lớn 1: 1: action integration, không xây auth service. |
| 4. Hiện trạng | ui-prototype/js/core/user-header.js:311–318 và ui-prototype/js/core/admin-header.js:17–24 gọi Store.logout; ui-prototype/js/data/store.js:309 chỉ xóa demo session. |
| 5. File sửa/tạo | `JSP/JS riêng P01/P19/P24/P32/P37/P38/P39 theo ma trận (chỉ Đạt)`<br>`Yêu cầu tích hợp shared user-header/admin-header/route/security gửi Đại, không tự sửa` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAI-03, JSP-DAI-10 auth logout endpoint/CSRF; Đại fragment POST logout + route; không cần trang mới. |
| 7. Bước thực hiện | 1. Gửi Đại vị trí action/logout label/return route của các page do Đạt quản lý.<br>2. Tích hợp header đã bàn giao, kiểm CSRF/session thật khi auth có.<br>3. Kiểm refresh/back/deep link sau logout và cart/profile protected navigation. |
| 8. Đầu ra/người nhận | BB03 integration checklist → Đại nền/auth; Huy review user flow. |
| 9. Hoàn thành/kiểm | POST logout, invalidated server session, không mutation GET; không persona fallback thành authenticated; demo logout không được coi C pass. Kiểm theo module/layout/HTTP contract ở03/05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Mapping/hook now; C chờ auth. Chặn: Endpoint/session thật chưa có; file shared chỉ Đại. |

#### JSP-DAT-07 — Nối cập nhật TC01 theo form contract

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-07 — Nối cập nhật TC01 theo form contract |
| 2. Phụ trách/hỗ trợ/review | Đạt; Đại auth; Huy tutor fields |
| 3. Mục tiêu/BB-TC/loại | TC01; C; Nối cập nhật TC01 theo form contract. Độ lớn 2: 2: form adapter, không auth/DB. |
| 4. Hiện trạng | P01: Hồ sơ hardcode trong HTML; lưu chỉ đổi DOM (JS:18,72–86); bằng chứng `ui-prototype/pages/account/profile.html:1`, `ui-prototype/js/pages/account/profile.js:1`; JSP chưa có; P37: HTML/form + states JS; thay state client (JS:12,116); bằng chứng `ui-prototype/pages/tutor/my-profile.html:1`, `ui-prototype/js/pages/tutor/my-profile.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/account/profile.jsp (tạo từ ui-prototype/pages/account/profile.html)`<br>`src/main/resources/static/js/pages/account/profile.js (tạo từ ui-prototype/js/pages/account/profile.js)`<br>`src/main/resources/static/css/pages/account/profile.css (tạo từ ui-prototype/css/pages/account/profile.css)`<br>`src/main/webapp/WEB-INF/views/tutor/my-profile.jsp (tạo từ ui-prototype/pages/tutor/my-profile.html)`<br>`src/main/resources/static/js/pages/tutor/my-profile.js (tạo từ ui-prototype/js/pages/tutor/my-profile.js)`<br>`src/main/resources/static/css/pages/tutor/my-profile.css (tạo từ ui-prototype/css/pages/tutor/my-profile.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAT-02; JSP-DAI-03, JSP-DAI-10; profile service/API sẵn, owner server; Q02 phạm vi tutor edit. |
| 7. Bước thực hiện | 1. Nối GET/PATCH profile qua client; giữ dirty/fieldErrors/cancel.<br>2. Đọc data server sau save/refresh, không chỉ thay text DOM.<br>3. Kiểm lỗi validation/network/401; tutor verified state là dữ liệu server. |
| 8. Đầu ra/người nhận | P01/P37 C evidence → Đại quyền/session; Huy dữ liệu tutor. |
| 9. Hoàn thành/kiểm | Reload còn dữ liệu; user không sửa owner khác; errors đúng field; không triển khai xác minh nâng cao chưa duyệt. Mở `/account/profile`, `/tutor/my-profile` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: DTO/form spec now; UI integration mức dễ–trung bình. Chặn: Profile backend chưa có; Đại hỗ trợ quyền. |

#### JSP-DAT-08 — Nối read API home và catalog/detail

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-08 — Nối read API home và catalog/detail |
| 2. Phụ trách/hỗ trợ/review | Đạt; Huy dữ liệu; Đại client/modules |
| 3. Mục tiêu/BB-TC/loại | TC10; BB05 UI; C/D; Nối read API home và catalog/detail. Độ lớn 2: 2: hai read UI cùng OfferingDTO, không gồm backend. |
| 4. Hiện trạng | P24: EduStore.latestOfferings(6), fixture publishedAt; bằng chứng `ui-prototype/pages/home.html:1`, `ui-prototype/js/pages/home.js:3`; JSP chưa có; P19: EduStore.offering/tutor/cartAdd; chỉ công khai offering hợp lệ; bằng chứng `ui-prototype/pages/catalog/detail.html:1`, `ui-prototype/js/pages/catalog/detail.js:8`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/home.jsp (tạo từ ui-prototype/pages/home.html)`<br>`src/main/resources/static/js/pages/home.js (tạo từ ui-prototype/js/pages/home.js)`<br>`src/main/resources/static/css/pages/home.css (tạo từ ui-prototype/css/pages/home.css)`<br>`src/main/webapp/WEB-INF/views/catalog/detail.jsp (tạo từ ui-prototype/pages/catalog/detail.html)`<br>`src/main/resources/static/js/pages/catalog/detail.js (tạo từ ui-prototype/js/pages/catalog/detail.js)`<br>`src/main/resources/static/css/pages/catalog/detail.css (tạo từ ui-prototype/css/pages/catalog/detail.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAT-01, JSP-DAT-04; JSP-HUY-12 ready adapter; Đại03; error/empty DTO chuẩn. |
| 7. Bước thực hiện | 1. Nhận read adapter newest/offering detail đã chạy từ Huy, tích hợp hai page cùng OfferingDTO.<br>2. Thay fixture reader bằng async client, giữ loading/error/empty và stable newest sort.<br>3. Đối chiếu API visibility/giá với Huy; cart mutation dùng adapter Huy, không tự xây backend. |
| 8. Đầu ra/người nhận | P19/P24 read C → Huy dữ liệu; Đại integration. |
| 9. Hoàn thành/kiểm | ID private/not-found; newest sort đúng; không fallback hardcode; giá server; một page chưa có API thì blocked riêng. Mở `/home`, `/catalog/detail` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Field mapping/state layout now. Chặn: JSP-HUY-12 và các read endpoints chưa có; chỉ adapter UI đơn giản cho Đạt. |

#### JSP-DAT-09 — Nối read API tìm kiếm và hồ sơ gian hàng

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-09 — Nối read API tìm kiếm và hồ sơ gian hàng |
| 2. Phụ trách/hỗ trợ/review | Đạt; Huy dữ liệu; Đại client/modules |
| 3. Mục tiêu/BB-TC/loại | TC07, TC08, TC09; module TC06/TC04/TC05 Đại; C/D; Nối read API tìm kiếm và hồ sơ gian hàng. Độ lớn 2: 2: hai read UI, điều kiện lọc/phân quyền do Đại/Huy cấp. |
| 4. Hiện trạng | P39: EduStore.list offerings; UI tên Tìm gia sư; cần chốt nghĩa gian hàng; bằng chứng `ui-prototype/pages/tutor/search.html:1`, `ui-prototype/js/pages/tutor/search.js:1`; JSP chưa có; P38: EduStore tutor/offering/review; submitReport demo; bằng chứng `ui-prototype/pages/tutor/profile.html:1`, `ui-prototype/js/pages/tutor/profile.js:1`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/tutor/search.jsp (tạo từ ui-prototype/pages/tutor/search.html)`<br>`src/main/resources/static/js/pages/tutor/search.js (tạo từ ui-prototype/js/pages/tutor/search.js)`<br>`src/main/resources/static/css/pages/tutor/search.css (tạo từ ui-prototype/css/pages/tutor/search.css)`<br>`src/main/webapp/WEB-INF/views/tutor/profile.jsp (tạo từ ui-prototype/pages/tutor/profile.html)`<br>`src/main/resources/static/js/pages/tutor/profile.js (tạo từ ui-prototype/js/pages/tutor/profile.js)`<br>`src/main/resources/static/css/pages/tutor/profile.css (tạo từ ui-prototype/css/pages/tutor/profile.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAT-03; JSP-HUY-12 list/tutor adapters; Đại03/08/11; Q06. |
| 7. Bước thực hiện | 1. Nhận API query/filter/sort/paging + tutor detail/offerings/reviews schema.<br>2. Nối loading/empty/error/query cho hai page; eligibility/report từ module Đại.<br>3. Kiểm ID/quyền và cùng tập lọc/sắp xếp với Huy/Đại. |
| 8. Đầu ra/người nhận | P38/P39 read C → Huy read; Đại filter/review/report. |
| 9. Hoàn thành/kiểm | Filter/sort/paging cùng tập; offerings đúng tutor; không dùng query để tự đổi quyền; 404/401/403; module init một lần. Mở `/tutor/search`, `/tutor/profile` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Field mapping/state layout now. Chặn: JSP-HUY-12 và các read endpoints chưa có; chỉ adapter UI đơn giản cho Đạt. |

#### JSP-DAT-10 — Nối read API lịch sử đơn và modules hành động

| Trường | Nội dung |
| --- | --- |
| 1. Mã/tên | JSP-DAT-10 — Nối read API lịch sử đơn và modules hành động |
| 2. Phụ trách/hỗ trợ/review | Đạt; Huy dữ liệu; Đại client/modules |
| 3. Mục tiêu/BB-TC/loại | BB09; TC03 Huy; TC04/TC05 Đại; C/D; Nối read API lịch sử đơn và modules hành động. Độ lớn 2: 2: một table/detail read UI; nghiệp vụ tiền được Huy xử lý. |
| 4. Hiện trạng | P32: EduStore.ordersByLearner; modal cancel/review/report đang cùng JS; bằng chứng `ui-prototype/pages/order/history.html:1`, `ui-prototype/js/pages/order/history.js:2`; JSP chưa có |
| 5. File sửa/tạo | `src/main/webapp/WEB-INF/views/order/history.jsp (tạo từ ui-prototype/pages/order/history.html)`<br>`src/main/resources/static/js/pages/order/history.js (tạo từ ui-prototype/js/pages/order/history.js)`<br>`src/main/resources/static/css/pages/order/history.css (tạo từ ui-prototype/css/pages/order/history.css)` |
| File chung phải gửi tích hợp | Mapping PageViewController/PageModelAdvice, config/security, fragments/layout/core/assets/CSS component gửi Đại; không sửa song song |
| 6. Đầu vào/tiên quyết | JSP-DAT-05; JSP-HUY-12 history adapter; JSP-HUY-08; Đại08/11; auth03/10. |
| 7. Bước thực hiện | 1. Nhận HistoryPageDTO/selectedOrder/paging từ Huy, nối query và loading/empty/error.<br>2. Tích hợp cancel/refund/review/report adapters đã kiểm, không sửa business policy.<br>3. Refresh/read lại sau action, kiểm own orders và lỗi mạng. |
| 8. Đầu ra/người nhận | P32 read C → Huy order; Đại modules/quyền. |
| 9. Hoàn thành/kiểm | Chỉ user orders; filters/status/channel/id; reload phản ánh server; mutation một lần; refund/review C chưa sẵn thì đánh blocked riêng. Mở `/order/history` và chạy checklist Pxx ở05. Package sau tích hợp; Network/Console/refresh/context path. C đòi API thực, không chỉ screenshot UI. |
| 10. Làm ngay/chờ/chốt | Làm: Field mapping/state layout now. Chặn: JSP-HUY-12 và các read endpoints chưa có; chỉ adapter UI đơn giản cho Đạt. |

## 5. Bàn giao và chống xung đột

| Gói | Bên gửi → bên nhận | Trước khi bên nhận bắt đầu | File/logic không sửa chéo |
| --- | --- | --- | --- |
| Nền route/layout/client | Đại → Huy/Đạt | JSP-DAI-01, JSP-DAI-02, JSP-DAI-04;03 contract freeze | Controller/common config/fragments/core/CSS nền |
| BB05 | JSP-HUY-01 → Đạt04; JSP-HUY-12 → Đạt08 | OfferingDetailDTO ready/empty/private; giá/availability/terms/action | Huy giữ data/backend; Đạt giữ P19 JSP/page JS/CSS |
| Charts | Đại07/12 → JSP-HUY-06/13 | Init/options, metric/timezone, series/error samples | Core charts/CSS Đại; Huy chỉ page seller |
| Filter | Đại08/11 → Đạt03/09 | Query/filter schema, same result set | Module Đại; page search Đạt |
| Review/report | Đại08/11 → Đạt05/03 và JSP-HUY-03 | Eligibility/targets/events/ID prefix; patch remove callback cũ | Modules Đại; parent page owner tích hợp |
| Cancel/status/refund | JSP-HUY-08 → Đạt05/10; Đại tích hợp fragment/module chung | AllowedActions, policy/errors/idempotency; server ready cho C | Logic Huy; history page Đạt; router/layout Đại |
| Read history | JSP-HUY-10/12 → Đạt05/10 | OrderSummary/HistoryPageDTO + errors | Đạt không xây backend đơn |
| TC01/auth/logout | Đại03/10 → Đạt06/07 | Session/CSRF/logout/profile contract | Đạt TC01/logout integration; Đại server auth/shared |
| BB12 queues | JSP-HUY-09 → Đại13 | Q02 xác nhận basic management | Không triển khai tutor/job workflow nâng cao chưa duyệt |

Huy/Đạt gửi source→target manifest, query/navigation/actions, model DTO examples, state map, module anchors, kiểm đã chạy và điều kiện C còn thiếu. Đại hợp nhất shared rồi trả kết quả smoke route; page owner sửa file riêng nếu integration phát hiện lỗi.

**Thứ tự bắt buộc**: JSP-DAI-01 → JSP-DAI-02 → JSP-DAI-04; JSP-DAI-03 contract có thể thiết kế song song nhưng code advice/security tích hợp tuần tự. JSP-HUY-01 có thể chuẩn bị ngay. A page sau nền → module handoff → C page sau API → JSP-DAI-13 kiểm chung. Các task C trên cùng JSP/JS là đợt sau A, không chạy song song cùng file. Nhóm không gán deadline ở audit này.


