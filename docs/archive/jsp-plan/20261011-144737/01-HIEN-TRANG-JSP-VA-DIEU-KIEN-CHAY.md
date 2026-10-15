# Hiện trạng JSP và điều kiện chạy EduConnect

Audit bắt đầu lúc **14:47:37 ngày 11/10/2026 (Asia/Bangkok, UTC+07)**. Báo cáo dựa trên file đang có trên máy, không dùng lại kết luận audit cũ. Đây là báo cáo phân công giai đoạn JSP; mọi file, route, DTO hoặc endpoint có nhãn “đề xuất” đều chưa được tạo.

## 1. Snapshot và ranh giới kiểm tra

| Hạng mục | Kết quả kiểm tra |
| --- | --- |
| Root vật lý / Git | `D:\project ca nhan\TMDT-WEB`; tên sản phẩm EduConnect, Maven name `EduConnect Web` tại `pom.xml:19` |
| Branch | `feature/ui-dai-auth` |
| HEAD đầy đủ | `e12fb53937edaa60121229d60a8ff42a870e06ab` |
| Staged, unstaged, deleted, renamed, untracked trước audit | Không có; `git status --porcelain=v1 --untracked-files=all`, `git diff --name-status`, `git diff --cached --name-status` đều rỗng |
| File bị ignore | `.idea/`, `.codegraph/`; kiểm riêng `git ls-files --others --ignored --exclude-standard ui-prototype src` không có file ứng dụng bị che bởi ignore |
| Sau build | Có output Maven trong `target/`, bị ignore tại `.gitignore:2`; không sửa nguồn ứng dụng. Không chạy clean hoặc xóa artifact |
| Hướng dẫn | Không tìm thấy file `AGENTS.md` trong repo, thư mục cha và các vị trí tổ tiên đã kiểm tra. Áp dụng đầy đủ AGENTS.md do người dùng cung cấp trong phiên này; không tạo file thay thế |
| Quy ước đã đọc | `docs/conventions/coding-convention.md:5–19`, `docs/conventions/git-workflow.md:17–24`, `docs/architecture/README.md:5–22`, `scripts/README.md:3–17`, README gốc và README prototype/core |
| CodeGraph | Có `.codegraph/`, status 87 file index, 370 node, 289 edge; đã dùng context/files/explore cho kiến trúc. HTML/CSS/asset không có trong index nên kiểm kê trực tiếp trên filesystem |
| Không thực hiện | Checkout, reset, stash, clean, đổi nhánh, commit, push; không sửa Java/JSP/HTML/JS/CSS/POM/config; không tạo test mới |

Các ví dụ tên nhánh/thành viên cũ ở `docs/conventions/git-workflow.md:11–15` không được dùng để thay phân công ba người trong yêu cầu hiện tại. Các hướng dẫn thiết kế trong `ui-prototype/README.md:61` còn nói “không có trang chủ”, trong khi `ui-prototype/pages/home.html:1` và `ui-prototype/js/core/route.js:15` đã có home. Báo cáo lấy source hiện tại làm chuẩn.

Kiểm kê gồm 40 HTML sản phẩm, 51 HTML component rời và một showcase `ui-prototype/components/index.html`; 96 CSS, 65 JS. Trong `src/` có 19 Java: một lớp khởi động và 18 package-info; views/static/test chỉ giữ chỗ. Manifest từng trang, component và asset nằm ở báo cáo 02. Không có thay đổi chưa commit/file mới trước audit để đối chiếu thêm; trạng thái này đã được kiểm tra, không suy từ HEAD.

## 2. Stack và container thực tế

| Nội dung | Đã xác minh và bằng chứng |
| --- | --- |
| Framework khai báo | Spring Boot **3.5.16**, starter web/MVC (`pom.xml:7–10,27–30`) |
| Java mục tiêu | **17** (`pom.xml:22–24`); Maven compile thực sự dùng `release 17` |
| Java trên máy | Microsoft OpenJDK **21.0.10**; `java -version` và Maven `-version` |
| Packaging | **WAR**, `pom.xml:17`; build sinh executable WAR có `WarLauncher.class` |
| MVC resolved | WAR chứa `spring-webmvc-6.2.19.jar`; đây là dependency đã resolve, không chỉ suy từ parent |
| Container resolved | Tomcat embed core/EL/Jasper **10.1.55**; `pom.xml:59–75` khai báo Jasper và starter-tomcat provided |
| JSP/JSTL | Jasper 10.1.55; JSTL implementation 3.0.1; JSTL API 3.0.2 trong WAR. Khai báo `pom.xml:59–70` đã đủ phần dependency JSP cơ bản |
| Servlet namespace | WAR chứa `jakarta.servlet-api-6.0.0.jar`, JSTL Jakarta. Java hiện chưa dùng Servlet API trực tiếp. Không đề xuất thêm `javax.servlet`/JSTL cũ |
| Security | Có starter-security (`pom.xml:35–38`), chưa có SecurityFilterChain tùy chỉnh. Dependency không phải bằng chứng BB01–BB04 hoặc phân quyền đã hoàn tất |
| Persistence | JPA, MySQL, Flyway được khai báo (`pom.xml:39–57`); chưa có datasource, entity/repository/service hay SQL migration |
| Cách khởi động khai báo | `EduConnectApplication.main` gọi `SpringApplication.run` (`src/main/java/com/educonnect/EduConnectApplication.java:6–11`); executable WAR dự kiến `java -jar target/educonnect-web-0.0.1-SNAPSHOT.war` |
| Deploy WAR vào Tomcat ngoài | Chưa đủ initializer: application không extends `SpringBootServletInitializer`. Chỉ bổ sung nếu nhóm chọn external container; thiếu này không tự chứng minh executable WAR không chạy |

Boot 3.5.16 hỗ trợ Java 17–25, Maven từ 3.6.3 và Tomcat 10.1/Servlet 6.0; JDK 21 hiện tại phù hợp dải hỗ trợ. [System requirements chính thức](https://docs.spring.io/spring-boot/3.5/system-requirements.html). WAR phù hợp JSP với Tomcat; executable JAR không hỗ trợ JSP. [JSP limitations](https://docs.spring.io/spring-boot/3.5/reference/web/servlet.html#web.servlet.embedded-container.jsp-limitations). External WAR cần initializer; hiện nên ưu tiên executable WAR. [Traditional deployment](https://docs.spring.io/spring-boot/3.5/how-to/deployment/traditional-deployment.html).

Không nâng framework, đổi MVC sang Servlet thuần hoặc thay dependency chỉ để chuyển JSP. **Giảng viên cần xác nhận Spring MVC controller + JSP có đáp ứng yêu cầu “JSP/Servlet” không** (Q01 báo cáo 05).

## 3. View/config/route đang có

`src/main/resources/application.yml:1–6` chỉ đặt tên ứng dụng và port 8080.

| Hạng mục | Trạng thái |
| --- | --- |
| View resolver JSP | Chưa cấu hình prefix/suffix; chưa có custom resolver |
| Prefix/suffix đề xuất | `spring.mvc.view.prefix=/WEB-INF/views/`, `spring.mvc.view.suffix=.jsp`; không dùng thư mục templates cho JSP |
| Static mapping | Chưa override; Boot mặc định phục vụ classpath static trên `/**`, nhưng static hiện chỉ có .gitkeep. Prototype nằm ngoài static nên không tự xuất hiện trong WAR |
| Context path | Chưa đặt; mặc định dự kiến root, chưa đo runtime. Cần URL dùng context path thay vì suy độ sâu thư mục HTML |
| Encoding | HTML đã dùng meta UTF-8; chưa có JSP pageEncoding/contentType và chưa cấu hình force request/response UTF-8 tường minh |
| Controller trả view / API | **0/0 controller ứng dụng**. CodeGraph files/context và Java inventory chỉ thấy application + package-info |
| View name/model/redirect server | Chưa có; toàn bộ handler/view/model trong ma trận 02 là đề xuất |
| JSP/JSPF/tag/tagx | **0 file** trên filesystem, WAR cũng chỉ có .gitkeep trong views |
| Route render JSP | **0 route đã có bằng chứng** |
| Router prototype | `ui-prototype/js/core/route.js:14–55` đăng ký 40 đường HTML và showcase; không phải HTTP handler server (`:2–3,134–147`) |
| API client | Chưa có client HTTP thật, không tìm thấy `fetch(` trong JS/HTML hiện tại. `EduStore` là façade demo, không phải API |
| Layout loader HTML | Không có loader fetch component hiện tại; shell/component đã inline trong trang. Không giao “xóa fetch loader” như một lỗi đang tồn tại |

Boot phục vụ static từ classpath và cho phép cấu hình MVC qua WebMvcConfigurer; không cần thêm `@EnableWebMvc` cho chuyển đổi tối thiểu. [Servlet web applications](https://docs.spring.io/spring-boot/3.5/reference/web/servlet.html). Các thuộc tính view và encoding đề xuất theo [application properties 3.5](https://docs.spring.io/spring-boot/3.5/appendix/application-properties/index.html).

Những điều kiện còn thiếu: controller/view đầu tiên; resolver; asset production; layout server; profile preview cô lập hoặc DB local đã xác nhận; security routing phù hợp. Với starter JPA/MySQL/Flyway hiện có mà không cấu hình datasource/DB nhúng, startup thường bị chặn khi auto-config datasource. Đây là **rủi ro suy từ cấu hình**, chưa phải lỗi startup đã tái hiện. Nếu dùng Security mặc định, custom trang login/admin cũng cần security contract; không giả định tất cả GET đều public.

## 4. Kiểm tra thực sự đã chạy

Lệnh Maven dùng executable có sẵn:
`C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.3\plugins\maven\lib\maven3\bin\mvn.cmd`.

| Lệnh/thao tác | Kết quả | Giới hạn |
| --- | --- | --- |
| `java -version`, `node --version` | JDK 21.0.10; Node 24.14.0 | Không đổi toolchain |
| `mvn -version` | Lệnh không ở PATH | Đã tìm và dùng Maven bundled 3.9.11 |
| Bundled Maven `-version` | Exit 0; có dòng “Access is denied.” trước banner | Banner và các goal kế tiếp vẫn chạy; chưa xác minh nguyên nhân dòng cảnh báo launcher |
| Lần `validate` đầu có `-Dmaven.repo.local=...` không quote | Fail do PowerShell tách đối số thành plugin prefix `.repo.local=C` | Lỗi cách gọi của audit, không phải lỗi POM; đã bỏ đối số không cần thiết |
| Bundled Maven `-o -B -ntp '-DskipTests' validate` | BUILD SUCCESS | Chỉ validate POM |
| Bundled Maven `-o -B -ntp package` | **BUILD SUCCESS**, 15.551 giây; compile 19 source release 17; repackage WAR | Không có Java test thực tế; không compile JSP vì không có JSP. Sinh target bị ignore; không gọi DB/email/payment |
| Đọc ZIP WAR bằng .NET read-only | Có WarLauncher/Jasper/JSTL/Servlet/MVC và placeholder views | Không phải deploy hay HTTP smoke test |
| `node scripts/checks/static-check.mjs` | Exit 0, FAIL 0; 40 trang; 65/65 JS syntax; 46 CSS url trong 96 CSS; 23 user header, 11 admin sidebar đúng thứ tự | Chỉ static prototype |
| `node scripts/checks/store-check.mjs` | Exit 0, PASS 583, FAIL 0 | VM/storage cô lập, dữ liệu giả lập |
| `node scripts/checks/hook-check.mjs` | Exit 0, FAIL 0 | HTML/JS selectors; payment/checkout báo 0 hook theo bộ kiểm này, không suy rằng mọi ID runtime đã được kiểm |
| `node scripts/checks/source-check.mjs` | Exit 0, FAIL 0; 105 mã fixture; 84 file quét | Cho phép nguồn preview riêng của chat và audit logs; không chứng minh entity thật |
| Khởi động ứng dụng | **Không chạy** | Chưa có profile local cô lập; chưa xác nhận DB/migration an toàn. Không đọc/đưa giá trị bí mật local vào báo cáo |
| Browser/responsive/context path/JSP route | **Chưa chạy trong audit này** | Chưa có JSP/controller để kiểm; không tái sử dụng browser pass cũ |

Nguồn các bộ kiểm: `scripts/checks/static-check.mjs:1–38`, `scripts/checks/store-check.mjs:1–48`, `scripts/checks/hook-check.mjs:1–31`, `scripts/checks/source-check.mjs:1–16,87–95`. Không chạy migration, gửi email, thanh toán hay hoàn tiền thật.

## 5. Bốn mức hoàn thành độc lập

| Mức | Kết luận audit |
| --- | --- |
| 1. Build/package | Đã chứng minh bằng offline package thành công |
| 2. Ứng dụng khởi động | Chưa xác minh |
| 3. HTTP route render JSP | Chưa có triển khai; 0 route chứng minh |
| 4. Trang với backend thật | Chưa có backend/API; toàn bộ UI dùng fixture/hardcode/DOM/storage |

**Đã chuyển JSP: 0; đang chuyển JSP: 0; chưa chuyển: 40 trang sản phẩm.** Không tính .gitkeep hay dependency JSP là “đang chuyển”. Showcase/component là tài nguyên phát triển, không cộng vào 40. Chín trang bổ sung đã tồn tại ở mức HTML (báo cáo 02), nhưng chưa chuyển JSP.

Phân biệt thêm: đã có giao diện và component; có dữ liệu/mutation demo; đang thiếu toàn bộ C backend thật; chưa xác minh startup/render/browser. Task A hoặc D xong không làm BB/TC hoàn tất end-to-end.

## 6. Chốt trạng thái sau khi viết báo cáo

Kiểm lại lúc **15:14:23 ngày 11/10/2026 UTC+07**: branch và HEAD giữ nguyên; `git diff --name-only` và `git diff --cached --name-only` rỗng. `git status --porcelain=v1 --untracked-files=all` chỉ có đúng năm Markdown mới trong `docs/audit-jsp/20261011-144737/`; không có file nguồn mới hoặc thay đổi ứng dụng. Output package nằm trong `target/` bị ignore, không xóa sau build. Báo cáo cũ không được ghi đè.

- `docs/audit-jsp/20261011-144737/01-HIEN-TRANG-JSP-VA-DIEU-KIEN-CHAY.md`
- `docs/audit-jsp/20261011-144737/02-MA-TRAN-CHUYEN-TRANG-VA-ASSET.md`
- `docs/audit-jsp/20261011-144737/03-NEN-TANG-DUNG-CHUNG-VA-BAN-GIAO.md`
- `docs/audit-jsp/20261011-144737/04-NHIEM-VU-JSP-CHO-BA-THANH-VIEN.md`
- `docs/audit-jsp/20261011-144737/05-KIEM-THU-RUI-RO-VA-DIEM-CAN-CHOT.md`

Java inventory được kiểm trực tiếp và qua CodeGraph: `src/main/java/com/educonnect/EduConnectApplication.java:1–12`; 18 `package-info.java` ở admin, auth, chat, common/constant, common/exception, common/util, common/validation, config, contract, invitation, job, lesson, notification, payment, security, tutor, user, wallet. Không có class controller/service/repository/entity khác. Runtime config duy nhất `src/main/resources/application.yml:1–6`; migration chỉ có README, chưa SQL. Đây là bằng chứng kiểm kê âm tính cho backend chưa có, không suy từ tên package.


