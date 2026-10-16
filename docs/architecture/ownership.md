# Sở hữu file và quy tắc PR

## Catalog Entity dùng chung v1

Codex tạo toàn bộ nền ban đầu dưới điều phối Đại. Maintainer từng Entity/key/enum/repository được chốt theo [shared-entities.md](shared-entities.md): Đại giữ account/auth/reference/tutor/file/admin/review/notification; Huy giữ offering/enrollment/job/invitation/order/contract/payment/wallet. Đây là ownership backend; không thay ownership controller/page phía dưới. Đạt tiếp tục trang/controller/DTO integration, không nhận thêm backend Entity theo đề xuất audit cũ. Một mapping/repository chuẩn mỗi bảng; shared-file review qua maintainer, migration duy nhất Đại điều phối.


## Nền chung

Nguyễn Xuân Đại giữ: pom/wrapper/cấu hình, SecurityConfig, PageModelAdvice, layouts/, fragments/, CSS nền và component dùng chung, js/core/route.js, js/preview/, db/migration/, test contracts/checks và CI. Người khác gửi PR/yêu cầu; chủ nền chung phải duyệt. Migration mới chỉ Đại tạo theo timestamp; không sửa V1–V3.

HomePageController thuộc Đạt; PageModelAdvice cùng package web là file chung thuộc Đại. Controller admin dashboard/manage/audit-logs được tách riêng; tutor/manage được tách khỏi ba trang tutor của Đạt để không chia cùng một file controller.

## Bảng theo trang

Mỗi dòng sở hữu template pages/<trang>, CSS/JS riêng cùng tên và controller được chỉ ra. CSS/JS dùng chung được xem là file chung, không chuyển quyền vì được một trang nạp.

| Trang | Chủ sở hữu | Controller |
|---|---|---|
| account/profile | Đạt | com.educonnect.user.web.AccountPageController |
| admin/audit-logs | Huy | com.educonnect.admin.web.AuditLogsPageController |
| admin/dashboard | Nguyễn Xuân Đại | com.educonnect.admin.web.DashboardPageController |
| admin/job-review-detail | Huy | com.educonnect.admin.web.JobReviewPageController |
| admin/job-review-queue | Huy | com.educonnect.admin.web.JobReviewPageController |
| admin/manage | Huy | com.educonnect.admin.web.AdminManagePageController |
| admin/payout-request-detail | Chưa giao; Huy làm đầu mối | com.educonnect.admin.web.PayoutPageController |
| admin/payout-requests | Chưa giao; Huy làm đầu mối | com.educonnect.admin.web.PayoutPageController |
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
| chat/messages | Chưa giao; Huy làm đầu mối | com.educonnect.chat.web.ChatPageController |
| contract/confirm | Huy | com.educonnect.contract.web.ContractPageController |
| contract/student-detail | Huy | com.educonnect.contract.web.ContractPageController |
| contract/tutor-detail | Huy | com.educonnect.contract.web.ContractPageController |
| home | Đạt | com.educonnect.web.HomePageController |
| invitation/create | Huy | com.educonnect.invitation.web.InvitationPageController |
| invitation/negotiation | Huy | com.educonnect.invitation.web.InvitationPageController |
| job/applicants | Huy | com.educonnect.job.web.JobPageController |
| job/create | Huy | com.educonnect.job.web.JobPageController |
| job/detail | Huy | com.educonnect.job.web.JobPageController |
| job/discover | Huy | com.educonnect.job.web.JobPageController |
| job/my-job | Huy | com.educonnect.job.web.JobPageController |
| order/history | Đạt | com.educonnect.order.web.OrderPageController |
| payment/checkout | Huy | com.educonnect.payment.web.PaymentPageController |
| payment/qr | Huy | com.educonnect.payment.web.PaymentPageController |
| payment/result | Huy | com.educonnect.payment.web.PaymentPageController |
| tutor/manage | Huy | com.educonnect.tutor.web.TutorManagePageController |
| tutor/my-profile | Đạt | com.educonnect.tutor.web.TutorPageController |
| tutor/profile | Đạt | com.educonnect.tutor.web.TutorPageController |
| tutor/search | Đạt | com.educonnect.tutor.web.TutorPageController |
| wallet/overview | Huy | com.educonnect.wallet.web.WalletPageController |

## Quy tắc

- Đại: auth 5 trang và admin dashboard/reports/report-detail/tutor-review-queue/tutor-review-detail.
- Huy: admin audit-logs/manage/job-review-queue/job-review-detail; cart; contract; invitation; job; payment; tutor/manage; wallet.
- Đạt: home; account/profile; catalog/detail; order/history; tutor/my-profile/profile/search.
- Chat/messages và admin payout-requests/payout-request-detail chưa giao; Huy làm đầu mối, không coi đầu mối là phân công triển khai đã chốt.
- Chỉ sửa template, CSS/JS riêng và controller thuộc phạm vi mình; nếu controller chứa trang của nhiều người thì tách theo owner hoặc gửi PR chủ nền chung xem xét.
- Không sửa prototype đóng băng, DB nền hoặc migration cũ. Cập nhật JSON/CSV contracts và common fragments cần review của Đại.
- PR vào main, ít nhất một người review; PR file chung phải được Đại duyệt. CI xanh trước merge, không force-push/rebase nhánh chung.
- Chưa có CODEOWNERS vì chưa có username GitHub của ba thành viên. Bổ sung sau khi nhóm cung cấp username; hiện quy tắc review là quy trình của nhóm.
