# Cấu trúc Thymeleaf EduConnect

## Cây thư mục

```text
src/main/java/com/educonnect/
  security/SecurityConfig.java
  web/{PageModelAdvice,HomePageController}.java
  <feature>/web/*PageController.java
src/main/resources/
  application.yml
  application-ui-preview.yml
  application-db-dev.yml
  db/migration/
  templates/
    layouts/{user,admin,auth,payment-minimal}.html
    fragments/{header-*,footer-*,sidebar-admin,meta-head,preview-scripts}.html
    pages/<group>/<page>.html
  static/{css,js/{core,pages,preview},assets}/
src/test/resources/{pages.csv,page-assets.json}
src/test/java/com/educonnect/{config,web,security}/
```

## Layout và fragment

Trang dùng `th:replace` gọi `page(title, active, styles, content, scripts, headScripts, preview)`. Năm slot chính đúng hợp đồng layout; hai tham số thêm giữ vị trí JS head/body và bật/tắt preview từng trang. `content` giữ cả body, wrapper shell, main và dialog để giữ class/id/data-* của nguồn. Không có layout dialect.

Layout chèn CSS nền cố định, sau đó CSS riêng đúng thứ tự. Payment-minimal chỉ tokens + base. Fragment scripts được đặt đúng vị trí gốc; các script preview có điều kiện `uiPreviewEnabled and preview`. Để tắt demo cho một trang, đổi tham số cuối `true` thành `false` trong lời gọi layout của trang đó; cấu hình toàn cục `app.ui-preview.enabled=false` tắt cả bộ.

Header/footer/sidebar nằm trong một file fragment cho từng loại. `active` điều khiển class/ARIA của nav. `variant` giữ các khác biệt ngoài active; không xóa tùy tiện một variant chỉ vì nhìn gần giống nhau. Có thêm footer-auth để giữ footer login/register. Meta-head chứa charset, viewport, favicon, CSRF và app-base.

## Khác biệt được giữ ngoài active

- Header user: menu 37/45 element, persona/variant A/B/C/TUTOR, nhãn/avatar/verification và summary ẩn; sự hiện diện của data-active-nav khác nhau; hai shell có thêm user-shell__header.
- Header admin: popup tìm kiếm/thông báo có số entry khác nhau (60/66/72 element), nhãn/link bản ghi và trạng thái khác nhau. Giữ đủ biến thể bằng variant.
- Sidebar admin: đã gom về một biến thể theo active.
- Footer user: thường hoặc có thêm user-shell__footer; footer-account riêng cho account/profile và tutor/my-profile.
- Auth: class và nhãn login/register khác nhau, giữ hai biến thể header/footer.
- Payment QR: header tối giản riêng, không có footer trang; footer dialog vẫn ở content.

Ba trang job có nav is-active nhưng không có data-active-nav trong nguồn. Active được suy từ class đang chọn; không tự thêm data-attribute vào header thiếu thuộc tính đó. Kiểm HTTP đã so sánh toàn bộ class/id/data-* với nguồn.

### Ma trận variant


**header-user**

| Variant | Trang nguồn |
|---|---|
| v1 | account/profile, contract/student-detail |
| v2 | cart/index, catalog/detail |
| v3 | chat/messages, contract/tutor-detail |
| v4 | contract/confirm |
| v5 | home |
| v6 | invitation/create, tutor/profile, tutor/search |
| v7 | invitation/negotiation, payment/checkout, payment/result, wallet/overview |
| v8 | job/applicants, job/my-job |
| v9 | job/create |
| v10 | job/detail, job/discover, tutor/my-profile |
| v11 | order/history |
| v12 | tutor/manage |

**footer-user**

| Variant | Trang nguồn |
|---|---|
| v1 | cart/index, catalog/detail, chat/messages, contract/confirm, contract/student-detail, contract/tutor-detail, home, invitation/create, invitation/negotiation, job/applicants, job/create, job/detail, job/discover, job/my-job, payment/checkout, payment/result, tutor/profile, tutor/search, wallet/overview |
| v2 | order/history, tutor/manage |

**footer-account**

| Variant | Trang nguồn |
|---|---|
| v1 | account/profile, tutor/my-profile |

**header-admin**

| Variant | Trang nguồn |
|---|---|
| v1 | admin/audit-logs |
| v2 | admin/dashboard |
| v3 | admin/job-review-detail, admin/job-review-queue |
| v4 | admin/manage |
| v5 | admin/payout-request-detail |
| v6 | admin/payout-requests |
| v7 | admin/report-detail |
| v8 | admin/reports |
| v9 | admin/tutor-review-detail |
| v10 | admin/tutor-review-queue |

**sidebar-admin**

| Variant | Trang nguồn |
|---|---|
| v1 | admin/audit-logs, admin/dashboard, admin/job-review-detail, admin/job-review-queue, admin/manage, admin/payout-request-detail, admin/payout-requests, admin/report-detail, admin/reports, admin/tutor-review-detail, admin/tutor-review-queue |

**header-auth**

| Variant | Trang nguồn |
|---|---|
| v1 | auth/forgot-password, auth/login, auth/reset-password, auth/verify-email |
| v2 | auth/register |

**footer-auth**

| Variant | Trang nguồn |
|---|---|
| v1 | auth/forgot-password, auth/login, auth/reset-password, auth/verify-email |
| v2 | auth/register |

**header-payment-minimal**

| Variant | Trang nguồn |
|---|---|
| v1 | payment/qr |

## URL và JavaScript

URL không có `.html`; `/` và `/home` cùng view `pages/home`. Query/anchor được giữ. Không hỗ trợ URL prototype cũ. Controller chỉ có GET và trả view name; không đưa mock model hoặc nghiệp vụ vào Java.

`EduRoute` giữ API/registry keys. app-base lấy từ meta server; page/asset/path/go sinh URL có context path. normalize/applyScope là hàm tương thích không sửa DOM; không MutationObserver. paymentQr có shell payment-minimal. Key components được giữ để tương thích registry, chưa có route showcase trong ứng dụng.

JS/CSS phục vụ như tài nguyên tĩnh, không dùng Thymeleaf trong chúng; `${...}` trong JS riêng là template literal JavaScript. Dữ liệu server cần đi qua data-* hoặc meta. Không thêm script/style inline. Test kiểm namespace Thymeleaf thay vì substring th: vì width:/path: là cú pháp hợp lệ; kiểm preprocessing chưa xử lý thay vì cấm __ của BEM.

## Thêm một trang mới

1. Xác định owner, nhóm URL và layout trong ownership; tạo branch feature/<nhom>-<mo-ta>.
2. Tạo template pages/<group>/<page>.html từ mẫu cùng layout; khai báo title, active, styles, content, headScripts/scripts và preview flag.
3. Giữ hook class/id/data-*, CSS/JS riêng ở static/css/pages và static/js/pages; asset chung cần chủ nền chung review.
4. Link và asset dùng th:href/th:src với @{...}; giữ query/anchor. Không dùng đường dẫn ../../ hoặc .html mới.
5. Thêm GET trả view vào controller đúng owner; tạo controller/package-info mới khi cần.
6. Thêm đúng một dòng URL,view,layout vào pages.csv; thêm asset oracle đã review trong page-assets.json, gồm vị trí head/body. Không sửa prototype đóng băng.
7. Nếu trang cần điều hướng bằng JS, thêm registry key trong route.js qua PR chủ nền chung duyệt; không tự sửa DOM URL.
8. Chạy wrapper clean verify, template-check, route-check và các check prototype; mở trực tiếp/refresh URL, kiểm Console/Network.
9. Mở PR vào main; ít nhất một người review và chủ nền chung duyệt khi có file chung.

## Nối dữ liệu thật cho một trang (giai đoạn sau)

1. Đặt preview=false cho trang; loại phụ thuộc EduFixtures/EduStore khỏi JS riêng của trang.
2. Triển khai service/repository/entity trong feature tương ứng, dùng schema và migration đã thống nhất; không làm việc này trong nền preview hiện tại.
3. Controller gọi service, bổ sung model attribute; dùng th:text/th:field để binding/escape dữ liệu, không dùng th:utext cho nội dung chưa tin cậy.
4. Form mutation bổ sung th:action, method POST, validation và CSRF; request fetch dùng token/header từ meta. Không tắt CSRF để sửa lỗi 403.
5. Bổ sung principal/currentUser và phân quyền server trong SecurityConfig; persona browser không chứng minh quyền.
6. Chọn profile DB được phép, test service/MVC/validation và cập nhật asset oracle nếu thay tài nguyên.

## Lỗi môi trường/thư viện

| Hiện tượng | Kiểm tra |
|---|---|
| javax.servlet hoặc thư viện view cũ | Enforcer chặn; dùng Jakarta theo Boot 3.5 |
| Flyway không nhận MySQL | Giữ flyway-core + flyway-mysql, version do Boot quản lý |
| Build trên JDK khác nhau | Wrapper 3.9.16, requireJavaVersion>=17, java.version=17/release 17 |
| IDE không nhận wrapper | Reload Maven project; chọn Maven Wrapper và JDK17/21 trong IDE |
| UI đòi DB | Profile mặc định phải là ui-preview; không kích hoạt db-dev để xem UI |
| 403 khi POST | CSRF vẫn bật; gửi token, không thay permitAll bằng tắt CSRF |
| URL sai dưới context path | Dùng @{...}, app-base và EduRoute; không dùng ..//MutationObserver |
| Preview script bị thiếu | Kiểm flag toàn cục/trang và fragment preview-scripts; không nạp fake data vô điều kiện |

[Tài liệu Thymeleaf](https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf.html) · [Boot Servlet](https://docs.spring.io/spring-boot/3.5/reference/web/servlet.html) · [Maven Wrapper](https://maven.apache.org/tools/wrapper/) · [Enforcer](https://maven.apache.org/enforcer/enforcer-rules/bannedDependencies.html).

Chi tiết khác biệt fragment theo variant: [fragment-differences.json](fragment-differences.json).
