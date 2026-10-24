# Sở hữu file và quy tắc PR

## Phân công giai đoạn 3 — nguồn hiện hành

Áp dụng tài liệu “Hoàn thành chức năng” ngày 23/10/2026 trong thư mục bàn giao 03_Nhom_A_Web. Phân công giai đoạn 2 được thay thế. Mỗi người làm Repository/query → Service/DTO/form → Controller → giao diện → kiểm thử trong luồng của mình.

- Đại: DAI-01 auth/nền chung; DAI-02 hồ sơ và duyệt gia sư; DAI-03 quản trị/nhật ký; DAI-04 đánh giá; DAI-05 báo cáo; DAI-06 thống kê. 14 trang, 22 Entity.
- Huy: giỏ đăng ký, đơn/lịch sử, hợp đồng, thanh toán và ví. 9 trang, 23 Entity.
- Đạt: trang chủ, khám phá gia sư/dịch vụ, quản lý dịch vụ, lời mời, tin và duyệt tin. 14 trang, 6 Entity: Offering, OfferingTimeSlot, Invitation, JobPost, JobApplication, JobSelection.
- Chat và hai trang yêu cầu rút tiền chưa được giao nghiệp vụ.

Dùng 51 Entity/51 JpaRepository đã có trên main (PR #24); không tạo mapping hoặc service đăng ký thứ hai. Catalog persistence và maintainer tại [shared-entities.md](shared-entities.md). Migration do Đại điều phối.

## Nền chung

Nguyễn Xuân Đại giữ: pom/wrapper/cấu hình, SecurityConfig, PageModelAdvice, layouts/, fragments/, CSS nền và component dùng chung, js/core/route.js, js/preview/, db/migration/, test contracts/checks và CI. Người khác gửi PR/yêu cầu; chủ nền chung phải duyệt. Migration mới chỉ Đại tạo theo timestamp; không sửa V1–V4.

HomePageController thuộc Đạt; PageModelAdvice cùng package web là file chung thuộc Đại. Các controller hiện có giữ URL/template. DAI-02 cần tách handler /tutor/my-profile khỏi TutorPageController sang TutorProfilePageController trước khi Đạt sửa hai trang công khai; lớp mới này chưa được tạo trong DAI-01.

## Bảng theo trang

Mỗi dòng sở hữu template pages/<trang>, CSS/JS riêng cùng tên và controller được chỉ ra. CSS/JS dùng chung được xem là file chung, không chuyển quyền vì được một trang nạp.

| Trang | Chủ sở hữu | Controller |
|---|---|---|
| account/profile | Nguyễn Xuân Đại | com.educonnect.user.web.AccountPageController |
| admin/audit-logs | Nguyễn Xuân Đại | com.educonnect.admin.web.AuditLogsPageController |
| admin/dashboard | Nguyễn Xuân Đại | com.educonnect.admin.web.DashboardPageController |
| admin/job-review-detail | Đạt | com.educonnect.admin.web.JobReviewPageController |
| admin/job-review-queue | Đạt | com.educonnect.admin.web.JobReviewPageController |
| admin/manage | Nguyễn Xuân Đại | com.educonnect.admin.web.AdminManagePageController |
| admin/payout-request-detail | Chưa giao nghiệp vụ | com.educonnect.admin.web.PayoutPageController |
| admin/payout-requests | Chưa giao nghiệp vụ | com.educonnect.admin.web.PayoutPageController |
| admin/report-detail | Nguyễn Xuân Đại | com.educonnect.admin.web.ReportPageController |
| admin/reports | Nguyễn Xuân Đại | com.educonnect.admin.web.ReportPageController |
| admin/tutor-review-detail | Nguyễn Xuân Đại | com.educonnect.admin.web.TutorReviewPageController |
| admin/tutor-review-queue | Nguyễn Xuân Đại | com.educonnect.admin.web.TutorReviewPageController |
| auth/forgot-password | Nguyễn Xuân Đại | com.educonnect.auth.web.AuthPageController |
| auth/login | Nguyễn Xuân Đại | com.educonnect.auth.web.AuthPageController |
| auth/register | Nguyễn Xuân Đại | com.educonnect.auth.web.AuthPageController |
| auth/reset-password | Nguyễn Xuân Đại | com.educonnect.auth.web.AuthPageController |
| auth/verify-email | Nguyễn Xuân Đại | com.educonnect.auth.web.AuthPageController |
| cart/index | Huy | com.educonnect.order.web.CartPageController |
| catalog/detail | Đạt | com.educonnect.lesson.web.CatalogPageController |
| chat/messages | Chưa giao nghiệp vụ | com.educonnect.chat.web.ChatPageController |
| contract/confirm | Huy | com.educonnect.contract.web.ContractPageController |
| contract/student-detail | Huy | com.educonnect.contract.web.ContractPageController |
| contract/tutor-detail | Huy | com.educonnect.contract.web.ContractPageController |
| home | Đạt | com.educonnect.web.HomePageController |
| invitation/create | Đạt | com.educonnect.invitation.web.InvitationPageController |
| invitation/negotiation | Đạt | com.educonnect.invitation.web.InvitationPageController |
| job/applicants | Đạt | com.educonnect.job.web.JobPageController |
| job/create | Đạt | com.educonnect.job.web.JobPageController |
| job/detail | Đạt | com.educonnect.job.web.JobPageController |
| job/discover | Đạt | com.educonnect.job.web.JobPageController |
| job/my-job | Đạt | com.educonnect.job.web.JobPageController |
| order/history | Huy | com.educonnect.order.web.OrderPageController |
| payment/checkout | Huy | com.educonnect.payment.web.PaymentPageController |
| payment/qr | Huy | com.educonnect.payment.web.PaymentPageController |
| payment/result | Huy | com.educonnect.payment.web.PaymentPageController |
| tutor/manage | Đạt | com.educonnect.tutor.web.TutorManagePageController |
| tutor/my-profile | Nguyễn Xuân Đại | com.educonnect.tutor.web.TutorPageController |
| tutor/profile | Đạt | com.educonnect.tutor.web.TutorPageController |
| tutor/search | Đạt | com.educonnect.tutor.web.TutorPageController |
| wallet/overview | Huy | com.educonnect.wallet.web.WalletPageController |

## Quy tắc

- Ownership theo luồng giai đoạn 3 ở trên; file chung vẫn cần Đại review. A01 là model phiên hiện có, A02–A11 chỉ được dùng khi chủ luồng bàn giao thực tế.
- Chỉ sửa template, CSS/JS riêng và controller thuộc phạm vi mình; nếu controller chứa trang của nhiều người thì tách theo owner hoặc gửi PR chủ nền chung xem xét.
- Không sửa prototype đóng băng, DB nền hoặc migration cũ. Cập nhật JSON/CSV contracts và common fragments cần review của Đại.
- PR vào main, ít nhất một người review; PR file chung phải được Đại duyệt. CI xanh trước merge, không force-push/rebase nhánh chung.
- Chưa có CODEOWNERS vì chưa có username GitHub của ba thành viên. Bổ sung sau khi nhóm cung cấp username; hiện quy tắc review là quy trình của nhóm.
