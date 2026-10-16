# Entity dùng chung — hợp đồng persistence v1

Nguồn kỹ thuật: Flyway V1–V4 trong `src/main/resources/db/migration/`, gồm CHECK được V3 siết lại. Không thay migration đã áp dụng để ép mapping. Nền này có 51 Entity, 9 EmbeddedId, 31 enum và 51 JPA repository. Không có Entity cho `dev_seed_runs`, `flyway_schema_history` và bốn view.

Codex tạo trọn bộ nền ban đầu dưới điều phối của Đại. Maintainer bên dưới chịu trách nhiệm thay đổi tiếp theo; ownership trang/controller hiện tại giữ nguyên. Đạt tiếp tục controller/page và tích hợp DTO, không được giao thêm backend Entity trong catalog này.

## Quy ước và quyền ghi

- Entity/key/enum trong `com.educonnect.<feature>.domain`; repository trong `.repository`, tên `<Entity>JpaRepository`. Một bảng có một Entity và một repository chuẩn; feature service không sao chép chúng.
- PK BIGINT AUTO_INCREMENT dùng `Long`/IDENTITY. ID String và shared primary key không tự sinh. Chín khóa ghép dùng `@EmbeddedId`, Serializable, equals/hashCode theo giá trị.
- `UserAccount` record của JDBC auth giữ nguyên ở `com.educonnect.user`; Entity là `com.educonnect.user.domain.UserAccount`. Hai JDBC repository không bị thay thế hoặc trùng bean với JPA.
- Scalar FK là nguồn ghi chính; navigation to-one thông thường LAZY và read-only. Sau khi đổi scalar FK của Entity đang managed, refresh/clear và reload trước khi dùng navigation đã load; không dùng navigation cũ làm nguồn quyết định nghiệp vụ. Bốn shared PK dùng `@MapsId` qua account/contract; đặt parent association khi tạo.
- Không inverse collections, cascade remove/all hoặc orphanRemoval. FK SQL RESTRICT giữ lịch sử. Không Entity trực tiếp trong request/response.
- Các FK ghép của Invitation, JobSelection, RegistrationSource, OrderStatusHistory và Refund giữ scalar writer; không khai báo navigation ghép để tránh trùng quyền ghi. SQL vẫn bảo vệ toàn bộ FK ghép.
- Enum dùng STRING + JDBC VARCHAR, không native ENUM/ordinal. Role.code và role-code key vẫn String. History và các mã mở như notification_type/action_code/scope/failure_code vẫn String.
- DATETIME(6) dùng Instant/JDBC TIMESTAMP, UTC ở Hibernate và session MySQL. DATE/TIME dùng LocalDate/LocalTime. Tiền BigDecimal(19,0), rate BigDecimal(9,6), digest byte[] BINARY(32), JSON dùng Map<String,Object>/SqlTypes.JSON. Boolean webhook dùng JDBC BIT theo metadata mặc định Connector/J (tinyInt1isBit=true); không đổi tùy chọn driver này mà không validate lại.
- TEXT/CHAR, nullability, length, precision và default được ghi rõ. Default Java chỉ phản ánh literal default SQL; không tự tạo timestamp. `create()` và setters hỗ trợ service dựng instance; service phải cung cấp các trường bắt buộc trước persist.
- Generated `Refund.pendingContractId` chỉ đọc, có @Generated INSERT/UPDATE, không setter. Không thêm vào constructor/write SQL.
- `version` Java khởi tạo null để Spring Data nhận đúng Entity mới; Hibernate cấp 0 khi persist, SQL default 0 giữ nguyên. `version` dùng @Version đúng 14 bảng; authentication_version/history entity_version/offering_version_seen có ý nghĩa khác.
- Query chuyên biệt trong `.query`, DTO trong `.dto`, tách owner theo feature/page. Đổi file chung cần maintainer review; mọi migration do Đại điều phối.

## Catalog thực tế

Đường dẫn dưới đây tương đối với repository; repository tương ứng cùng feature và tên `<Entity>JpaRepository.java`.

| Bảng | Entity path | ID/key | Repository path | Maintainer |
|---|---|---|---|---|
| `roles` | `src/main/java/com/educonnect/user/domain/Role.java` | `String` | `src/main/java/com/educonnect/user/repository/RoleJpaRepository.java` | Đại |
| `subjects` | `src/main/java/com/educonnect/common/reference/domain/Subject.java` | `Long` | `src/main/java/com/educonnect/common/reference/repository/SubjectJpaRepository.java` | Đại |
| `grade_levels` | `src/main/java/com/educonnect/common/reference/domain/GradeLevel.java` | `Long` | `src/main/java/com/educonnect/common/reference/repository/GradeLevelJpaRepository.java` | Đại |
| `areas` | `src/main/java/com/educonnect/common/reference/domain/Area.java` | `Long` | `src/main/java/com/educonnect/common/reference/repository/AreaJpaRepository.java` | Đại |
| `delivery_modes` | `src/main/java/com/educonnect/common/reference/domain/DeliveryMode.java` | `Long` | `src/main/java/com/educonnect/common/reference/repository/DeliveryModeJpaRepository.java` | Đại |
| `user_accounts` | `src/main/java/com/educonnect/user/domain/UserAccount.java` | `Long` | `src/main/java/com/educonnect/user/repository/UserAccountJpaRepository.java` | Đại |
| `user_roles` | `src/main/java/com/educonnect/user/domain/UserRole.java` | `UserRoleId` | `src/main/java/com/educonnect/user/repository/UserRoleJpaRepository.java` | Đại |
| `learner_profiles` | `src/main/java/com/educonnect/user/domain/LearnerProfile.java` | `Long` | `src/main/java/com/educonnect/user/repository/LearnerProfileJpaRepository.java` | Đại |
| `auth_tokens` | `src/main/java/com/educonnect/auth/domain/AuthToken.java` | `Long` | `src/main/java/com/educonnect/auth/repository/AuthTokenJpaRepository.java` | Đại |
| `pending_registrations` | `src/main/java/com/educonnect/auth/domain/PendingRegistration.java` | `String` | `src/main/java/com/educonnect/auth/repository/PendingRegistrationJpaRepository.java` | Đại |
| `tutor_profiles` | `src/main/java/com/educonnect/tutor/domain/TutorProfile.java` | `Long` | `src/main/java/com/educonnect/tutor/repository/TutorProfileJpaRepository.java` | Đại |
| `tutor_subjects` | `src/main/java/com/educonnect/tutor/domain/TutorSubject.java` | `TutorSubjectId` | `src/main/java/com/educonnect/tutor/repository/TutorSubjectJpaRepository.java` | Đại |
| `tutor_grade_levels` | `src/main/java/com/educonnect/tutor/domain/TutorGradeLevel.java` | `TutorGradeLevelId` | `src/main/java/com/educonnect/tutor/repository/TutorGradeLevelJpaRepository.java` | Đại |
| `tutor_areas` | `src/main/java/com/educonnect/tutor/domain/TutorArea.java` | `TutorAreaId` | `src/main/java/com/educonnect/tutor/repository/TutorAreaJpaRepository.java` | Đại |
| `tutor_delivery_modes` | `src/main/java/com/educonnect/tutor/domain/TutorDeliveryMode.java` | `TutorDeliveryModeId` | `src/main/java/com/educonnect/tutor/repository/TutorDeliveryModeJpaRepository.java` | Đại |
| `private_files` | `src/main/java/com/educonnect/file/domain/PrivateFile.java` | `Long` | `src/main/java/com/educonnect/file/repository/PrivateFileJpaRepository.java` | Đại |
| `tutor_profile_evidence` | `src/main/java/com/educonnect/tutor/domain/TutorProfileEvidence.java` | `TutorProfileEvidenceId` | `src/main/java/com/educonnect/tutor/repository/TutorProfileEvidenceJpaRepository.java` | Đại |
| `offerings` | `src/main/java/com/educonnect/lesson/domain/Offering.java` | `Long` | `src/main/java/com/educonnect/lesson/repository/OfferingJpaRepository.java` | Huy |
| `offering_time_slots` | `src/main/java/com/educonnect/lesson/domain/OfferingTimeSlot.java` | `Long` | `src/main/java/com/educonnect/lesson/repository/OfferingTimeSlotJpaRepository.java` | Huy |
| `enrollments` | `src/main/java/com/educonnect/lesson/domain/Enrollment.java` | `Long` | `src/main/java/com/educonnect/lesson/repository/EnrollmentJpaRepository.java` | Huy |
| `invitations` | `src/main/java/com/educonnect/invitation/domain/Invitation.java` | `Long` | `src/main/java/com/educonnect/invitation/repository/InvitationJpaRepository.java` | Huy |
| `job_posts` | `src/main/java/com/educonnect/job/domain/JobPost.java` | `Long` | `src/main/java/com/educonnect/job/repository/JobPostJpaRepository.java` | Huy |
| `job_applications` | `src/main/java/com/educonnect/job/domain/JobApplication.java` | `Long` | `src/main/java/com/educonnect/job/repository/JobApplicationJpaRepository.java` | Huy |
| `job_selections` | `src/main/java/com/educonnect/job/domain/JobSelection.java` | `Long` | `src/main/java/com/educonnect/job/repository/JobSelectionJpaRepository.java` | Huy |
| `registration_sources` | `src/main/java/com/educonnect/order/domain/RegistrationSource.java` | `Long` | `src/main/java/com/educonnect/order/repository/RegistrationSourceJpaRepository.java` | Huy |
| `carts` | `src/main/java/com/educonnect/order/domain/Cart.java` | `Long` | `src/main/java/com/educonnect/order/repository/CartJpaRepository.java` | Huy |
| `cart_items` | `src/main/java/com/educonnect/order/domain/CartItem.java` | `Long` | `src/main/java/com/educonnect/order/repository/CartItemJpaRepository.java` | Huy |
| `orders` | `src/main/java/com/educonnect/order/domain/Order.java` | `Long` | `src/main/java/com/educonnect/order/repository/OrderJpaRepository.java` | Huy |
| `order_items` | `src/main/java/com/educonnect/order/domain/OrderItem.java` | `Long` | `src/main/java/com/educonnect/order/repository/OrderItemJpaRepository.java` | Huy |
| `contracts` | `src/main/java/com/educonnect/contract/domain/Contract.java` | `Long` | `src/main/java/com/educonnect/contract/repository/ContractJpaRepository.java` | Huy |
| `order_status_transitions` | `src/main/java/com/educonnect/order/domain/OrderStatusTransition.java` | `OrderStatusTransitionId` | `src/main/java/com/educonnect/order/repository/OrderStatusTransitionJpaRepository.java` | Huy |
| `order_status_history` | `src/main/java/com/educonnect/order/domain/OrderStatusHistory.java` | `Long` | `src/main/java/com/educonnect/order/repository/OrderStatusHistoryJpaRepository.java` | Huy |
| `contract_status_history` | `src/main/java/com/educonnect/contract/domain/ContractStatusHistory.java` | `Long` | `src/main/java/com/educonnect/contract/repository/ContractStatusHistoryJpaRepository.java` | Huy |
| `idempotency_records` | `src/main/java/com/educonnect/order/domain/IdempotencyRecord.java` | `Long` | `src/main/java/com/educonnect/order/repository/IdempotencyRecordJpaRepository.java` | Huy |
| `payments` | `src/main/java/com/educonnect/payment/domain/Payment.java` | `Long` | `src/main/java/com/educonnect/payment/repository/PaymentJpaRepository.java` | Huy |
| `payment_attempts` | `src/main/java/com/educonnect/payment/domain/PaymentAttempt.java` | `Long` | `src/main/java/com/educonnect/payment/repository/PaymentAttemptJpaRepository.java` | Huy |
| `payment_webhook_events` | `src/main/java/com/educonnect/payment/domain/PaymentWebhookEvent.java` | `Long` | `src/main/java/com/educonnect/payment/repository/PaymentWebhookEventJpaRepository.java` | Huy |
| `payment_allocations` | `src/main/java/com/educonnect/payment/domain/PaymentAllocation.java` | `PaymentAllocationId` | `src/main/java/com/educonnect/payment/repository/PaymentAllocationJpaRepository.java` | Huy |
| `refunds` | `src/main/java/com/educonnect/payment/domain/Refund.java` | `Long` | `src/main/java/com/educonnect/payment/repository/RefundJpaRepository.java` | Huy |
| `refund_status_history` | `src/main/java/com/educonnect/payment/domain/RefundStatusHistory.java` | `Long` | `src/main/java/com/educonnect/payment/repository/RefundStatusHistoryJpaRepository.java` | Huy |
| `ledger_accounts` | `src/main/java/com/educonnect/wallet/domain/LedgerAccount.java` | `Long` | `src/main/java/com/educonnect/wallet/repository/LedgerAccountJpaRepository.java` | Huy |
| `wallets` | `src/main/java/com/educonnect/wallet/domain/Wallet.java` | `Long` | `src/main/java/com/educonnect/wallet/repository/WalletJpaRepository.java` | Huy |
| `escrow_accounts` | `src/main/java/com/educonnect/wallet/domain/EscrowAccount.java` | `Long` | `src/main/java/com/educonnect/wallet/repository/EscrowAccountJpaRepository.java` | Huy |
| `releases` | `src/main/java/com/educonnect/wallet/domain/Release.java` | `Long` | `src/main/java/com/educonnect/wallet/repository/ReleaseJpaRepository.java` | Huy |
| `money_journals` | `src/main/java/com/educonnect/wallet/domain/MoneyJournal.java` | `Long` | `src/main/java/com/educonnect/wallet/repository/MoneyJournalJpaRepository.java` | Huy |
| `ledger_entries` | `src/main/java/com/educonnect/wallet/domain/LedgerEntry.java` | `Long` | `src/main/java/com/educonnect/wallet/repository/LedgerEntryJpaRepository.java` | Huy |
| `reviews` | `src/main/java/com/educonnect/lesson/domain/Review.java` | `Long` | `src/main/java/com/educonnect/lesson/repository/ReviewJpaRepository.java` | Đại |
| `reports` | `src/main/java/com/educonnect/admin/domain/Report.java` | `Long` | `src/main/java/com/educonnect/admin/repository/ReportJpaRepository.java` | Đại |
| `report_evidence` | `src/main/java/com/educonnect/admin/domain/ReportEvidence.java` | `ReportEvidenceId` | `src/main/java/com/educonnect/admin/repository/ReportEvidenceJpaRepository.java` | Đại |
| `notifications` | `src/main/java/com/educonnect/notification/domain/Notification.java` | `Long` | `src/main/java/com/educonnect/notification/repository/NotificationJpaRepository.java` | Đại |
| `audit_logs` | `src/main/java/com/educonnect/admin/domain/AuditLog.java` | `Long` | `src/main/java/com/educonnect/admin/repository/AuditLogJpaRepository.java` | Đại |

## Khóa ghép

| Class | Thuộc tính và cột | Maintainer |
|---|---|---|
| `user.domain.UserRoleId` | `userId` → `user_id BIGINT`; `roleCode` → `role_code VARCHAR(24)` | Đại |
| `tutor.domain.TutorSubjectId` | `tutorId` → `tutor_id BIGINT`; `subjectId` → `subject_id BIGINT` | Đại |
| `tutor.domain.TutorGradeLevelId` | `tutorId` → `tutor_id BIGINT`; `gradeLevelId` → `grade_level_id BIGINT` | Đại |
| `tutor.domain.TutorAreaId` | `tutorId` → `tutor_id BIGINT`; `areaId` → `area_id BIGINT` | Đại |
| `tutor.domain.TutorDeliveryModeId` | `tutorId` → `tutor_id BIGINT`; `deliveryModeId` → `delivery_mode_id BIGINT` | Đại |
| `tutor.domain.TutorProfileEvidenceId` | `tutorId` → `tutor_id BIGINT`; `fileId` → `file_id BIGINT` | Đại |
| `order.domain.OrderStatusTransitionId` | `fromStatus` → `from_status VARCHAR(32)`; `toStatus` → `to_status VARCHAR(32)`; `actorRoleCode` → `actor_role_code VARCHAR(24)` | Huy |
| `payment.domain.PaymentAllocationId` | `paymentId` → `payment_id BIGINT`; `contractId` → `contract_id BIGINT` | Huy |
| `admin.domain.ReportEvidenceId` | `reportId` → `report_id BIGINT`; `fileId` → `file_id BIGINT` | Đại |

## Enum đóng

| Enum (cùng domain Entity) | Cột | Giá trị chính xác |
|---|---|---|
| `user.domain.AccountStatus` | `user_accounts.status` | `ACTIVE, LOCKED, DISABLED` |
| `user.domain.LearnerKind` | `learner_profiles.learner_kind` | `SELF, PARENT` |
| `auth.domain.AuthTokenPurpose` | `auth_tokens.purpose` | `VERIFY_EMAIL, RESET_PASSWORD` |
| `auth.domain.RegistrationRole` | `pending_registrations.role_code` | `LEARNER, TUTOR` |
| `tutor.domain.TutorReviewStatus` | `tutor_profiles.review_status` | `DRAFT, PENDING, APPROVED, REJECTED` |
| `file.domain.FilePurpose` | `private_files.purpose` | `TUTOR_EVIDENCE, REPORT_EVIDENCE` |
| `lesson.domain.OfferingType` | `offerings.offering_type` | `SERVICE, GROUP_CLASS` |
| `lesson.domain.OfferingStatus` | `offerings.status` | `DRAFT, IN_REVIEW, PUBLISHED, UNPUBLISHED, REJECTED, CLOSED` |
| `lesson.domain.EnrollmentStatus` | `enrollments.status` | `RESERVED, CONFIRMED, COMPLETED, CANCELLED, EXPIRED` |
| `invitation.domain.InvitationStatus` | `invitations.status` | `PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED` |
| `job.domain.JobPostStatus` | `job_posts.status` | `DRAFT, PENDING, OPEN, MATCHED, CLOSED, REJECTED` |
| `job.domain.JobApplicationStatus` | `job_applications.status` | `SUBMITTED, SELECTED, REJECTED, WITHDRAWN` |
| `order.domain.RegistrationSourceKind` | `registration_sources.source_kind` | `INVITATION, JOB_APPLICATION, CATALOG` |
| `order.domain.OrderStatus` | `orders.status` | `AWAITING_PAYMENT, PAID, IN_PROGRESS, COMPLETED, CANCELLATION_PENDING, CANCELLED` |
| `order.domain.OrderItemType` | `order_items.offering_type_snapshot` | `SERVICE, GROUP_CLASS, DIRECT` |
| `contract.domain.ContractStatus` | `contracts.status` | `AWAITING_PAYMENT, ACTIVE, COMPLETED, CANCELLATION_PENDING, CANCELLED` |
| `order.domain.IdempotencyStatus` | `idempotency_records.status` | `PROCESSING, COMPLETED, FAILED` |
| `payment.domain.PaymentStatus` | `payments.status` | `PENDING, FUNDED, FAILED, CANCELLED, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED` |
| `payment.domain.PaymentProvider` | `payment_attempts.provider` | `PAYOS` |
| `payment.domain.PaymentAttemptStatus` | `payment_attempts.status` | `PENDING, SUCCEEDED, FAILED, CANCELLED, EXPIRED` |
| `payment.domain.WebhookEventStatus` | `payment_webhook_events.status` | `RECEIVED, APPLIED, REJECTED` |
| `payment.domain.RefundDestination` | `refunds.destination` | `WALLET, ORIGINAL_PROVIDER` |
| `payment.domain.RefundStatus` | `refunds.status` | `REQUESTED, PROCESSING, SUCCEEDED, FAILED, REJECTED` |
| `wallet.domain.LedgerAccountKind` | `ledger_accounts.account_kind` | `USER_WALLET, ESCROW, PROVIDER_CLEARING, PLATFORM_REVENUE` |
| `wallet.domain.ReleaseReason` | `releases.reason_code` | `COMPLETION, MANUAL_MILESTONE` |
| `wallet.domain.ReleaseRoundingMode` | `releases.rounding_mode` | `HALF_UP` |
| `wallet.domain.JournalKind` | `money_journals.journal_kind` | `TOP_UP, WALLET_PAYMENT, PROVIDER_PAYMENT, RELEASE, REFUND` |
| `wallet.domain.EntrySide` | `ledger_entries.entry_side` | `DEBIT, CREDIT` |
| `lesson.domain.ReviewStatus` | `reviews.status` | `PUBLISHED, HIDDEN` |
| `admin.domain.ReportReason` | `reports.reason_code` | `CONTENT, CONDUCT, PAYMENT, NO_SHOW, OTHER` |
| `admin.domain.ReportStatus` | `reports.status` | `OPEN, INVESTIGATING, RESOLVED, DISMISSED` |

`OrderStatus` không có NEW; NEW chỉ là marker khởi tạo trong V2 transition/history. `OrderItemType` có DIRECT; OfferingType không có. Contract dùng ACTIVE, Order dùng IN_PROGRESS. AuthToken riêng không có nghĩa đã làm password reset/link verification.

## Từ điển cột và constraints

Các dòng dưới đây ghi đầy đủ cột SQL → thuộc tính Java (type Java thể hiện trong source), nullable, default, generated và constraints từ SQL. Tất cả cột không ghi NULL là NOT NULL, trừ generated column. Ràng buộc composite được giữ trong database; service vẫn phải kiểm quyền/ownership và invariants liên bảng.

### `roles` — `Role`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `code` | `code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `label` | `label VARCHAR(100) NOT NULL` |

Constraints/index: `PRIMARY KEY (code)`.

### `subjects` — `Subject`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `code` | `code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `name` | `name VARCHAR(120) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_subjects_code UNIQUE (code)`.

### `grade_levels` — `GradeLevel`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `code` | `code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `name` | `name VARCHAR(120) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_grade_levels_code UNIQUE (code)`.

### `areas` — `Area`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `code` | `code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `name` | `name VARCHAR(120) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_areas_code UNIQUE (code)`.

### `delivery_modes` — `DeliveryMode`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `code` | `code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `name` | `name VARCHAR(120) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_delivery_modes_code UNIQUE (code)`.

### `user_accounts` — `UserAccount`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `email` | `email VARCHAR(254) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL` |
| `passwordHash` | `password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `emailVerifiedAt` | `email_verified_at DATETIME(6) NULL` |
| `displayName` | `display_name VARCHAR(120) NOT NULL` |
| `phone` | `phone VARCHAR(24) NULL` |
| `bio` | `bio TEXT NULL` |
| `authenticationVersion` | `authentication_version BIGINT NOT NULL DEFAULT 0` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `updatedAt` | `updated_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_users_code UNIQUE (public_code)`; `CONSTRAINT uq_users_email UNIQUE (email)`; `CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'LOCKED', 'DISABLED'))`; `CONSTRAINT ck_users_email_normalized CHECK (BINARY email = BINARY LOWER(TRIM(email)))`; `CONSTRAINT ck_users_version CHECK (version >= 0 AND authentication_version >= 0)`.

### `user_roles` — `UserRole`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `userId` | `user_id BIGINT NOT NULL` |
| `roleCode` | `role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |

Constraints/index: `PRIMARY KEY (user_id, role_code)`; `CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_ur_role FOREIGN KEY (role_code) REFERENCES roles (code) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `learner_profiles` — `LearnerProfile`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `userId` | `user_id BIGINT NOT NULL` |
| `learnerKind` | `learner_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `gradeLevelId` | `grade_level_id BIGINT NULL` |
| `areaId` | `area_id BIGINT NULL` |

Constraints/index: `PRIMARY KEY (user_id)`; `CONSTRAINT fk_lp_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_lp_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_lp_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_lp_kind CHECK (learner_kind IN ('SELF','PARENT'))`.

### `auth_tokens` — `AuthToken`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `userId` | `user_id BIGINT NOT NULL` |
| `purpose` | `purpose VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `tokenHash` | `token_hash BINARY(32) NOT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `expiresAt` | `expires_at DATETIME(6) NOT NULL` |
| `usedAt` | `used_at DATETIME(6) NULL` |
| `revokedAt` | `revoked_at DATETIME(6) NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_tokens_hash UNIQUE (token_hash)`; `CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_tokens_purpose CHECK (purpose IN ('VERIFY_EMAIL','RESET_PASSWORD'))`; `CONSTRAINT ck_tokens_time CHECK (expires_at > created_at AND (used_at IS NULL OR used_at >= created_at) AND (revoked_at IS NULL OR revoked_at >= created_at))`; `INDEX ix_tokens_user_expiry (user_id, purpose, expires_at)`.

### `pending_registrations` — `PendingRegistration`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `email` | `email VARCHAR(254) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL` |
| `challengeId` | `challenge_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `passwordHash` | `password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `displayName` | `display_name VARCHAR(120) NULL` |
| `phone` | `phone VARCHAR(24) NULL` |
| `roleCode` | `role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `existingUserId` | `existing_user_id BIGINT NULL` |
| `otpHash` | `otp_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `expiresAt` | `expires_at DATETIME(6) NULL` |
| `lastSentAt` | `last_sent_at DATETIME(6) NULL` |
| `sendWindowStartedAt` | `send_window_started_at DATETIME(6) NULL` |
| `sendCount` | `send_count INT NOT NULL DEFAULT 0` |
| `failedAttempts` | `failed_attempts INT NOT NULL DEFAULT 0` |
| `completedAt` | `completed_at DATETIME(6) NULL` |

Constraints/index: `PRIMARY KEY (email)`; `CONSTRAINT uq_pending_challenge UNIQUE (challenge_id)`; `CONSTRAINT fk_pending_existing_user FOREIGN KEY (existing_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT`; `CONSTRAINT ck_pending_role CHECK (role_code IS NULL OR role_code IN ('LEARNER', 'TUTOR'))`; `CONSTRAINT ck_pending_counts CHECK (send_count >= 0 AND failed_attempts >= 0)`; `CONSTRAINT ck_pending_email CHECK (BINARY email = BINARY LOWER(TRIM(email)))`.

### `tutor_profiles` — `TutorProfile`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `userId` | `user_id BIGINT NOT NULL` |
| `reviewStatus` | `review_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `headline` | `headline VARCHAR(180) NOT NULL` |
| `experienceYears` | `experience_years SMALLINT NOT NULL` |
| `reviewedBy` | `reviewed_by BIGINT NULL` |
| `reviewedAt` | `reviewed_at DATETIME(6) NULL` |
| `reviewNote` | `review_note TEXT NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `updatedAt` | `updated_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (user_id)`; `CONSTRAINT fk_tp_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_tp_reviewer FOREIGN KEY (reviewed_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_tp_status CHECK (review_status IN ('DRAFT','PENDING','APPROVED','REJECTED'))`; `CONSTRAINT ck_tp_experience CHECK (experience_years BETWEEN 0 AND 80)`; `CONSTRAINT ck_tp_decision CHECK ((review_status IN ('APPROVED','REJECTED') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR (review_status IN ('DRAFT','PENDING')))`.

### `tutor_subjects` — `TutorSubject`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `subjectId` | `subject_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (tutor_id, subject_id)`; `CONSTRAINT fk_tutor_subjects_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_tutor_subjects_ref FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `tutor_grade_levels` — `TutorGradeLevel`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `gradeLevelId` | `grade_level_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (tutor_id, grade_level_id)`; `CONSTRAINT fk_tutor_grade_levels_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_tutor_grade_levels_ref FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `tutor_areas` — `TutorArea`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `areaId` | `area_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (tutor_id, area_id)`; `CONSTRAINT fk_tutor_areas_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_tutor_areas_ref FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `tutor_delivery_modes` — `TutorDeliveryMode`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `deliveryModeId` | `delivery_mode_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (tutor_id, delivery_mode_id)`; `CONSTRAINT fk_tutor_delivery_modes_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_tutor_delivery_modes_ref FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `private_files` — `PrivateFile`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `ownerUserId` | `owner_user_id BIGINT NOT NULL` |
| `storageKey` | `storage_key VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `purpose` | `purpose VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `originalName` | `original_name VARCHAR(255) NOT NULL` |
| `mimeType` | `mime_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `byteSize` | `byte_size BIGINT NOT NULL` |
| `sha256` | `sha256 BINARY(32) NOT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_files_storage UNIQUE (storage_key)`; `CONSTRAINT fk_files_owner FOREIGN KEY (owner_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_files_purpose CHECK (purpose IN ('TUTOR_EVIDENCE','REPORT_EVIDENCE'))`; `CONSTRAINT ck_files_size CHECK (byte_size > 0)`.

### `tutor_profile_evidence` — `TutorProfileEvidence`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `fileId` | `file_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (tutor_id, file_id)`; `CONSTRAINT uq_tpe_file UNIQUE (file_id)`; `CONSTRAINT fk_tpe_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_tpe_file FOREIGN KEY (file_id) REFERENCES private_files (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `offerings` — `Offering`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `offeringType` | `offering_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `title` | `title VARCHAR(220) NOT NULL` |
| `description` | `description TEXT NOT NULL` |
| `subjectId` | `subject_id BIGINT NOT NULL` |
| `gradeLevelId` | `grade_level_id BIGINT NOT NULL` |
| `areaId` | `area_id BIGINT NOT NULL` |
| `deliveryModeId` | `delivery_mode_id BIGINT NOT NULL` |
| `unitPrice` | `unit_price DECIMAL(19,0) NOT NULL` |
| `currency` | `currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND'` |
| `sessionCount` | `session_count SMALLINT NOT NULL` |
| `durationMinutes` | `duration_minutes SMALLINT NOT NULL` |
| `capacity` | `capacity INT NULL` |
| `startsOn` | `starts_on DATE NULL` |
| `endsOn` | `ends_on DATE NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `firstPublishedAt` | `first_published_at DATETIME(6) NULL` |
| `publishedAt` | `published_at DATETIME(6) NULL` |
| `reviewedBy` | `reviewed_by BIGINT NULL` |
| `reviewedAt` | `reviewed_at DATETIME(6) NULL` |
| `reviewNote` | `review_note TEXT NULL` |
| `termsVersion` | `terms_version INT NOT NULL` |
| `termsText` | `terms_text TEXT NOT NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `updatedAt` | `updated_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_off_code UNIQUE (public_code)`; `CONSTRAINT uq_off_owner UNIQUE (id, tutor_id)`; `CONSTRAINT fk_off_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_off_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_off_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_off_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_off_mode FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_off_reviewer FOREIGN KEY (reviewed_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_off_type CHECK (offering_type IN ('SERVICE','GROUP_CLASS'))`; `CONSTRAINT ck_off_status CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','UNPUBLISHED','REJECTED','CLOSED'))`; `CONSTRAINT ck_off_amount CHECK (unit_price > 0 AND currency = 'VND' AND session_count > 0 AND duration_minutes > 0 AND terms_version > 0)`; `CONSTRAINT ck_off_capacity CHECK ((offering_type='SERVICE' AND capacity IS NULL) OR (offering_type='GROUP_CLASS' AND capacity > 0 AND starts_on IS NOT NULL AND ends_on >= starts_on))`; `CONSTRAINT ck_off_publication CHECK (status <> 'PUBLISHED' OR (published_at IS NOT NULL AND first_published_at IS NOT NULL AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL))`; `INDEX ix_off_latest (status, published_at, id)`; `INDEX ix_off_filter (status, subject_id, grade_level_id, delivery_mode_id, unit_price)`; `INDEX ix_off_tutor (tutor_id, status, id)`; `INDEX ix_off_area (area_id, status)`.

V3 thay ck_off_capacity bằng ck_off_capacity_present: SERVICE capacity NULL; GROUP_CLASS capacity IS NOT NULL >0, starts_on/ends_on IS NOT NULL và ends_on>=starts_on.

### `offering_time_slots` — `OfferingTimeSlot`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `offeringId` | `offering_id BIGINT NOT NULL` |
| `weekday` | `weekday TINYINT NOT NULL` |
| `startTime` | `start_time TIME NOT NULL` |
| `endTime` | `end_time TIME NOT NULL` |
| `timeZone` | `time_zone VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT fk_ots_offering FOREIGN KEY (offering_id) REFERENCES offerings (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT uq_ots_slot UNIQUE (offering_id, weekday, start_time)`; `CONSTRAINT ck_ots_time CHECK (weekday BETWEEN 1 AND 7 AND start_time >= '00:00:00' AND end_time <= '23:59:59' AND end_time > start_time)`.

### `enrollments` — `Enrollment`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `contractId` | `contract_id BIGINT NOT NULL` |
| `offeringId` | `offering_id BIGINT NOT NULL` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `seatCount` | `seat_count INT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `reservedUntil` | `reserved_until DATETIME(6) NULL` |
| `confirmedAt` | `confirmed_at DATETIME(6) NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_enroll_contract UNIQUE (contract_id)`; `CONSTRAINT fk_enroll_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_enroll_offering FOREIGN KEY (offering_id) REFERENCES offerings (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_enroll_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_enroll_status CHECK (status IN ('RESERVED','CONFIRMED','COMPLETED','CANCELLED','EXPIRED'))`; `CONSTRAINT ck_enroll_seats CHECK (seat_count > 0)`; `CONSTRAINT ck_enroll_reservation CHECK (status <> 'RESERVED' OR reserved_until IS NOT NULL)`; `INDEX ix_enroll_capacity (offering_id, status, reserved_until)`.

### `invitations` — `Invitation`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `offeringId` | `offering_id BIGINT NULL` |
| `subjectId` | `subject_id BIGINT NOT NULL` |
| `gradeLevelId` | `grade_level_id BIGINT NOT NULL` |
| `areaId` | `area_id BIGINT NOT NULL` |
| `deliveryModeId` | `delivery_mode_id BIGINT NOT NULL` |
| `proposedUnitPrice` | `proposed_unit_price DECIMAL(19,0) NOT NULL` |
| `sessionCount` | `session_count SMALLINT NOT NULL` |
| `termsVersion` | `terms_version INT NOT NULL` |
| `termsText` | `terms_text TEXT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `acceptedAt` | `accepted_at DATETIME(6) NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `expiresAt` | `expires_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_inv_code UNIQUE (public_code)`; `CONSTRAINT uq_inv_parties UNIQUE (id, learner_id, tutor_id)`; `CONSTRAINT fk_inv_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_inv_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_inv_offering FOREIGN KEY (offering_id, tutor_id) REFERENCES offerings (id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_inv_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_inv_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_inv_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_inv_mode FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_inv_status CHECK (status IN ('PENDING','ACCEPTED','DECLINED','CANCELLED','EXPIRED'))`; `CONSTRAINT ck_inv_amount CHECK (proposed_unit_price > 0 AND session_count > 0 AND terms_version > 0)`; `CONSTRAINT ck_inv_acceptance CHECK (status <> 'ACCEPTED' OR accepted_at IS NOT NULL)`; `CONSTRAINT ck_inv_expiry CHECK (expires_at > created_at)`; `INDEX ix_inv_owner (learner_id, status, created_at)`.

### `job_posts` — `JobPost`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `title` | `title VARCHAR(220) NOT NULL` |
| `description` | `description TEXT NOT NULL` |
| `subjectId` | `subject_id BIGINT NOT NULL` |
| `gradeLevelId` | `grade_level_id BIGINT NOT NULL` |
| `areaId` | `area_id BIGINT NOT NULL` |
| `deliveryModeId` | `delivery_mode_id BIGINT NOT NULL` |
| `budgetPerSession` | `budget_per_session DECIMAL(19,0) NOT NULL` |
| `sessionCount` | `session_count SMALLINT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_jobs_code UNIQUE (public_code)`; `CONSTRAINT fk_jobs_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_jobs_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_jobs_grade FOREIGN KEY (grade_level_id) REFERENCES grade_levels (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_jobs_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_jobs_mode FOREIGN KEY (delivery_mode_id) REFERENCES delivery_modes (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_jobs_status CHECK (status IN ('DRAFT','PENDING','OPEN','MATCHED','CLOSED','REJECTED'))`; `CONSTRAINT ck_jobs_amount CHECK (budget_per_session > 0 AND session_count > 0)`; `INDEX ix_jobs_owner (learner_id, created_at)`.

### `job_applications` — `JobApplication`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `jobId` | `job_id BIGINT NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `proposedUnitPrice` | `proposed_unit_price DECIMAL(19,0) NOT NULL` |
| `message` | `message TEXT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_apps_tutor UNIQUE (job_id, tutor_id)`; `CONSTRAINT uq_apps_selection UNIQUE (job_id, id, tutor_id)`; `CONSTRAINT fk_apps_job FOREIGN KEY (job_id) REFERENCES job_posts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_apps_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_apps_status CHECK (status IN ('SUBMITTED','SELECTED','REJECTED','WITHDRAWN'))`; `CONSTRAINT ck_apps_price CHECK (proposed_unit_price > 0)`.

### `job_selections` — `JobSelection`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `jobId` | `job_id BIGINT NOT NULL` |
| `applicationId` | `application_id BIGINT NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `selectedBy` | `selected_by BIGINT NOT NULL` |
| `termsVersion` | `terms_version INT NOT NULL` |
| `termsText` | `terms_text TEXT NOT NULL` |
| `selectedAt` | `selected_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (job_id)`; `CONSTRAINT uq_sel_app UNIQUE (application_id)`; `CONSTRAINT uq_sel_source UNIQUE (job_id, application_id, tutor_id)`; `CONSTRAINT fk_sel_application FOREIGN KEY (job_id, application_id, tutor_id) REFERENCES job_applications (job_id, id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_sel_actor FOREIGN KEY (selected_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_sel_terms CHECK (terms_version > 0)`.

### `registration_sources` — `RegistrationSource`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `sourceKind` | `source_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `invitationId` | `invitation_id BIGINT NULL` |
| `jobId` | `job_id BIGINT NULL` |
| `applicationId` | `application_id BIGINT NULL` |
| `offeringId` | `offering_id BIGINT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_sources_invitation UNIQUE (invitation_id)`; `CONSTRAINT uq_sources_application UNIQUE (application_id)`; `CONSTRAINT fk_sources_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_sources_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_sources_invitation FOREIGN KEY (invitation_id, learner_id, tutor_id) REFERENCES invitations (id, learner_id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_sources_selection FOREIGN KEY (job_id, application_id, tutor_id) REFERENCES job_selections (job_id, application_id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_sources_offering FOREIGN KEY (offering_id, tutor_id) REFERENCES offerings (id, tutor_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_sources_kind CHECK ((source_kind='INVITATION' AND invitation_id IS NOT NULL AND job_id IS NULL AND application_id IS NULL) OR (source_kind='JOB_APPLICATION' AND invitation_id IS NULL AND job_id IS NOT NULL AND application_id IS NOT NULL) OR (source_kind='CATALOG' AND invitation_id IS NULL AND job_id IS NULL AND application_id IS NULL AND offering_id IS NOT NULL))`.

### `carts` — `Cart`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `updatedAt` | `updated_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_carts_owner UNIQUE (learner_id)`; `CONSTRAINT fk_carts_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `cart_items` — `CartItem`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `cartId` | `cart_id BIGINT NOT NULL` |
| `offeringId` | `offering_id BIGINT NOT NULL` |
| `seatCount` | `seat_count INT NOT NULL` |
| `offeringVersionSeen` | `offering_version_seen BIGINT NOT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_ci_offering UNIQUE (cart_id, offering_id)`; `CONSTRAINT fk_ci_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_ci_offering FOREIGN KEY (offering_id) REFERENCES offerings (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_ci_quantity CHECK (seat_count > 0 AND offering_version_seen >= 0)`.

### `orders` — `Order`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `totalAmount` | `total_amount DECIMAL(19,0) NOT NULL` |
| `currency` | `currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND'` |
| `creationKey` | `creation_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `cancellationReason` | `cancellation_reason VARCHAR(600) NULL` |
| `cancelledAt` | `cancelled_at DATETIME(6) NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `updatedAt` | `updated_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_orders_code UNIQUE (public_code)`; `CONSTRAINT uq_orders_creation UNIQUE (learner_id, creation_key)`; `CONSTRAINT fk_orders_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_orders_status CHECK (status IN ('AWAITING_PAYMENT','PAID','IN_PROGRESS','COMPLETED','CANCELLATION_PENDING','CANCELLED'))`; `CONSTRAINT ck_orders_amount CHECK (total_amount > 0 AND currency='VND')`; `CONSTRAINT ck_orders_cancel CHECK (status <> 'CANCELLED' OR cancelled_at IS NOT NULL)`; `INDEX ix_orders_history (learner_id, created_at, id)`; `INDEX ix_orders_stats (status, created_at)`.

### `order_items` — `OrderItem`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `orderId` | `order_id BIGINT NOT NULL` |
| `lineNumber` | `line_number INT NOT NULL` |
| `registrationSourceId` | `registration_source_id BIGINT NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `titleSnapshot` | `title_snapshot VARCHAR(220) NOT NULL` |
| `offeringTypeSnapshot` | `offering_type_snapshot VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `unitPriceSnapshot` | `unit_price_snapshot DECIMAL(19,0) NOT NULL` |
| `sessionCountSnapshot` | `session_count_snapshot SMALLINT NOT NULL` |
| `seatCount` | `seat_count INT NOT NULL` |
| `lineTotal` | `line_total DECIMAL(19,0) NOT NULL` |
| `feeRateSnapshot` | `fee_rate_snapshot DECIMAL(9,6) NOT NULL` |
| `feePolicyVersion` | `fee_policy_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `termsVersionSnapshot` | `terms_version_snapshot INT NOT NULL` |
| `termsTextSnapshot` | `terms_text_snapshot TEXT NOT NULL` |
| `termsHash` | `terms_hash BINARY(32) NOT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_items_line UNIQUE (order_id, line_number)`; `CONSTRAINT uq_items_source UNIQUE (registration_source_id)`; `CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_items_source FOREIGN KEY (registration_source_id) REFERENCES registration_sources (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_items_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_items_type CHECK (offering_type_snapshot IN ('SERVICE','GROUP_CLASS','DIRECT'))`; `CONSTRAINT ck_items_total CHECK (unit_price_snapshot > 0 AND session_count_snapshot > 0 AND seat_count > 0 AND line_total = unit_price_snapshot * session_count_snapshot * seat_count)`; `CONSTRAINT ck_items_seat CHECK (offering_type_snapshot='GROUP_CLASS' OR seat_count=1)`; `CONSTRAINT ck_items_fee CHECK (fee_rate_snapshot BETWEEN 0 AND 1 AND terms_version_snapshot > 0 AND line_number > 0)`; `INDEX ix_items_tutor (tutor_id, order_id)`.

### `contracts` — `Contract`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `orderItemId` | `order_item_id BIGINT NOT NULL` |
| `learnerId` | `learner_id BIGINT NOT NULL` |
| `tutorId` | `tutor_id BIGINT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `agreedTermsText` | `agreed_terms_text TEXT NOT NULL` |
| `agreedTermsHash` | `agreed_terms_hash BINARY(32) NOT NULL` |
| `learnerAcceptedAt` | `learner_accepted_at DATETIME(6) NOT NULL` |
| `tutorAcceptedAt` | `tutor_accepted_at DATETIME(6) NOT NULL` |
| `completedAt` | `completed_at DATETIME(6) NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_contracts_code UNIQUE (public_code)`; `CONSTRAINT uq_contracts_item UNIQUE (order_item_id)`; `CONSTRAINT fk_contracts_item FOREIGN KEY (order_item_id) REFERENCES order_items (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_contracts_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_contracts_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_contracts_status CHECK (status IN ('AWAITING_PAYMENT','ACTIVE','COMPLETED','CANCELLATION_PENDING','CANCELLED'))`; `CONSTRAINT ck_contracts_complete CHECK (status <> 'COMPLETED' OR completed_at IS NOT NULL)`; `INDEX ix_contracts_tutor (tutor_id, status, created_at)`.

### `order_status_transitions` — `OrderStatusTransition`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `fromStatus` | `from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `toStatus` | `to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `actorRoleCode` | `actor_role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |

Constraints/index: `PRIMARY KEY (from_status, to_status, actor_role_code)`; `CONSTRAINT fk_ost_role FOREIGN KEY (actor_role_code) REFERENCES roles (code) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_ost_different CHECK (from_status <> to_status)`.

### `order_status_history` — `OrderStatusHistory`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `orderId` | `order_id BIGINT NOT NULL` |
| `fromStatus` | `from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `toStatus` | `to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `actorUserId` | `actor_user_id BIGINT NOT NULL` |
| `reason` | `reason VARCHAR(600) NOT NULL` |
| `entityVersion` | `entity_version BIGINT NOT NULL` |
| `changedAt` | `changed_at DATETIME(6) NOT NULL` |
| `actorRoleCode` | `actor_role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_order_status_history_version UNIQUE (order_id, entity_version)`; `CONSTRAINT fk_order_status_history_entity FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_order_status_history_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_order_status_history_change CHECK (from_status IS NULL OR from_status <> to_status)`; `CONSTRAINT fk_osh_transition FOREIGN KEY (from_status, to_status, actor_role_code) REFERENCES order_status_transitions (from_status, to_status, actor_role_code) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `contract_status_history` — `ContractStatusHistory`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `contractId` | `contract_id BIGINT NOT NULL` |
| `fromStatus` | `from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `toStatus` | `to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `actorUserId` | `actor_user_id BIGINT NOT NULL` |
| `reason` | `reason VARCHAR(600) NOT NULL` |
| `entityVersion` | `entity_version BIGINT NOT NULL` |
| `changedAt` | `changed_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_contract_status_history_version UNIQUE (contract_id, entity_version)`; `CONSTRAINT fk_contract_status_history_entity FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_contract_status_history_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_contract_status_history_change CHECK (from_status IS NULL OR from_status <> to_status)`.

### `idempotency_records` — `IdempotencyRecord`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `scope` | `scope VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `requestKey` | `request_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `actorUserId` | `actor_user_id BIGINT NOT NULL` |
| `requestHash` | `request_hash BINARY(32) NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `orderId` | `order_id BIGINT NULL` |
| `responseHash` | `response_hash BINARY(32) NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `expiresAt` | `expires_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_idem_scope UNIQUE (scope, actor_user_id, request_key)`; `CONSTRAINT fk_idem_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_idem_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_idem_status CHECK (status IN ('PROCESSING','COMPLETED','FAILED'))`; `CONSTRAINT ck_idem_expiry CHECK (expires_at > created_at)`.

### `payments` — `Payment`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `orderId` | `order_id BIGINT NOT NULL` |
| `amount` | `amount DECIMAL(19,0) NOT NULL` |
| `walletAmount` | `wallet_amount DECIMAL(19,0) NOT NULL` |
| `providerAmount` | `provider_amount DECIMAL(19,0) NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `fundedAt` | `funded_at DATETIME(6) NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_pay_code UNIQUE (public_code)`; `CONSTRAINT uq_pay_order UNIQUE (order_id)`; `CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_pay_total CHECK (amount > 0 AND wallet_amount >= 0 AND provider_amount >= 0 AND amount=wallet_amount+provider_amount)`; `CONSTRAINT ck_pay_status CHECK (status IN ('PENDING','FUNDED','FAILED','CANCELLED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED'))`; `CONSTRAINT ck_pay_funded CHECK (status NOT IN ('FUNDED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED') OR funded_at IS NOT NULL)`.

### `payment_attempts` — `PaymentAttempt`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `paymentId` | `payment_id BIGINT NOT NULL` |
| `attemptNumber` | `attempt_number INT NOT NULL` |
| `provider` | `provider VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `providerOrderCode` | `provider_order_code BIGINT NOT NULL` |
| `providerReference` | `provider_reference VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `requestKey` | `request_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `amount` | `amount DECIMAL(19,0) NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `verifiedAt` | `verified_at DATETIME(6) NULL` |
| `failureCode` | `failure_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |
| `expiresAt` | `expires_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_attempt_number UNIQUE (payment_id, attempt_number)`; `CONSTRAINT uq_attempt_request UNIQUE (request_key)`; `CONSTRAINT uq_attempt_provider_code UNIQUE (provider, provider_order_code)`; `CONSTRAINT uq_attempt_reference UNIQUE (provider, provider_reference)`; `CONSTRAINT fk_attempt_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_attempt_amount CHECK (amount > 0 AND attempt_number > 0)`; `CONSTRAINT ck_attempt_provider CHECK (provider='PAYOS')`; `CONSTRAINT ck_attempt_status CHECK (status IN ('PENDING','SUCCEEDED','FAILED','CANCELLED','EXPIRED'))`; `CONSTRAINT ck_attempt_verification CHECK (status <> 'SUCCEEDED' OR verified_at IS NOT NULL)`; `CONSTRAINT ck_attempt_expiry CHECK (expires_at > created_at)`.

### `payment_webhook_events` — `PaymentWebhookEvent`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `provider` | `provider VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `eventKey` | `event_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `paymentAttemptId` | `payment_attempt_id BIGINT NULL` |
| `payloadHash` | `payload_hash BINARY(32) NOT NULL` |
| `signatureVerified` | `signature_verified BOOLEAN NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `receivedAt` | `received_at DATETIME(6) NOT NULL` |
| `processedAt` | `processed_at DATETIME(6) NULL` |
| `errorCode` | `error_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_webhook_event UNIQUE (provider, event_key)`; `CONSTRAINT fk_webhook_attempt FOREIGN KEY (payment_attempt_id) REFERENCES payment_attempts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_webhook_status CHECK (status IN ('RECEIVED','APPLIED','REJECTED'))`; `CONSTRAINT ck_webhook_applied CHECK (status <> 'APPLIED' OR (signature_verified=1 AND payment_attempt_id IS NOT NULL AND processed_at IS NOT NULL))`.

### `payment_allocations` — `PaymentAllocation`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `paymentId` | `payment_id BIGINT NOT NULL` |
| `contractId` | `contract_id BIGINT NOT NULL` |
| `amount` | `amount DECIMAL(19,0) NOT NULL` |
| `walletAmount` | `wallet_amount DECIMAL(19,0) NOT NULL` |
| `providerAmount` | `provider_amount DECIMAL(19,0) NOT NULL` |

Constraints/index: `PRIMARY KEY (payment_id, contract_id)`; `CONSTRAINT uq_alloc_contract UNIQUE (contract_id)`; `CONSTRAINT fk_alloc_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_alloc_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_alloc_total CHECK (amount > 0 AND wallet_amount >= 0 AND provider_amount >= 0 AND amount=wallet_amount+provider_amount)`.

### `refunds` — `Refund`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `paymentId` | `payment_id BIGINT NOT NULL` |
| `contractId` | `contract_id BIGINT NOT NULL` |
| `requestKey` | `request_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `basisAmountSnapshot` | `basis_amount_snapshot DECIMAL(19,0) NOT NULL` |
| `refundRateSnapshot` | `refund_rate_snapshot DECIMAL(9,6) NOT NULL` |
| `amount` | `amount DECIMAL(19,0) NOT NULL` |
| `policyVersion` | `policy_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `destination` | `destination VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `requestedBy` | `requested_by BIGINT NOT NULL` |
| `reason` | `reason VARCHAR(600) NOT NULL` |
| `providerReference` | `provider_reference VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `failureCode` | `failure_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `requestedAt` | `requested_at DATETIME(6) NOT NULL` |
| `processedAt` | `processed_at DATETIME(6) NULL` |
| `pendingContractId` | `pending_contract_id BIGINT GENERATED ALWAYS AS (CASE WHEN status IN ('REQUESTED','PROCESSING') THEN contract_id ELSE NULL END) STORED` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_refund_key UNIQUE (request_key)`; `CONSTRAINT uq_refund_pending UNIQUE (pending_contract_id)`; `CONSTRAINT uq_refund_provider_ref UNIQUE (provider_reference)`; `CONSTRAINT fk_refund_allocation FOREIGN KEY (payment_id, contract_id) REFERENCES payment_allocations (payment_id, contract_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_refund_actor FOREIGN KEY (requested_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_refund_status CHECK (status IN ('REQUESTED','PROCESSING','SUCCEEDED','FAILED','REJECTED'))`; `CONSTRAINT ck_refund_destination CHECK (destination IN ('WALLET','ORIGINAL_PROVIDER'))`; `CONSTRAINT ck_refund_amount CHECK (basis_amount_snapshot > 0 AND refund_rate_snapshot BETWEEN 0 AND 1 AND amount > 0 AND amount=ROUND(basis_amount_snapshot*refund_rate_snapshot,0) AND amount <= basis_amount_snapshot)`; `CONSTRAINT ck_refund_processed CHECK (status NOT IN ('SUCCEEDED','FAILED','REJECTED') OR processed_at IS NOT NULL)`.

### `refund_status_history` — `RefundStatusHistory`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `refundId` | `refund_id BIGINT NOT NULL` |
| `fromStatus` | `from_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL` |
| `toStatus` | `to_status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `actorUserId` | `actor_user_id BIGINT NOT NULL` |
| `reason` | `reason VARCHAR(600) NOT NULL` |
| `changedAt` | `changed_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT fk_rh_refund FOREIGN KEY (refund_id) REFERENCES refunds (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_rh_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `ledger_accounts` — `LedgerAccount`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `accountCode` | `account_code VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `accountKind` | `account_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `ownerUserId` | `owner_user_id BIGINT NULL` |
| `currency` | `currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND'` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_la_code UNIQUE (account_code)`; `CONSTRAINT uq_la_owner UNIQUE (owner_user_id)`; `CONSTRAINT fk_la_owner FOREIGN KEY (owner_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_la_kind CHECK (account_kind IN ('USER_WALLET','ESCROW','PROVIDER_CLEARING','PLATFORM_REVENUE'))`; `CONSTRAINT ck_la_owner_kind CHECK ((account_kind='USER_WALLET' AND owner_user_id IS NOT NULL) OR (account_kind <> 'USER_WALLET' AND owner_user_id IS NULL))`; `CONSTRAINT ck_la_currency CHECK (currency='VND')`.

### `wallets` — `Wallet`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `userId` | `user_id BIGINT NOT NULL` |
| `ledgerAccountId` | `ledger_account_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (user_id)`; `CONSTRAINT uq_wallet_account UNIQUE (ledger_account_id)`; `CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_wallet_account FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `escrow_accounts` — `EscrowAccount`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `contractId` | `contract_id BIGINT NOT NULL` |
| `ledgerAccountId` | `ledger_account_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (contract_id)`; `CONSTRAINT uq_escrow_account UNIQUE (ledger_account_id)`; `CONSTRAINT fk_escrow_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_escrow_account FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `releases` — `Release`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `contractId` | `contract_id BIGINT NOT NULL` |
| `releaseKey` | `release_key VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `reasonCode` | `reason_code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `grossAmount` | `gross_amount DECIMAL(19,0) NOT NULL` |
| `feeRateSnapshot` | `fee_rate_snapshot DECIMAL(9,6) NOT NULL` |
| `feeAmount` | `fee_amount DECIMAL(19,0) NOT NULL` |
| `tutorNetAmount` | `tutor_net_amount DECIMAL(19,0) NOT NULL` |
| `feePolicyVersion` | `fee_policy_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `roundingMode` | `rounding_mode VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `approvedBy` | `approved_by BIGINT NOT NULL` |
| `releasedAt` | `released_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_release_key UNIQUE (release_key)`; `CONSTRAINT fk_release_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_release_actor FOREIGN KEY (approved_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_release_reason CHECK (reason_code IN ('COMPLETION','MANUAL_MILESTONE'))`; `CONSTRAINT ck_release_split CHECK (gross_amount > 0 AND fee_amount >= 0 AND tutor_net_amount >= 0 AND gross_amount=fee_amount+tutor_net_amount)`; `CONSTRAINT ck_release_rate CHECK (fee_rate_snapshot BETWEEN 0 AND 1 AND rounding_mode='HALF_UP' AND fee_amount=ROUND(gross_amount*fee_rate_snapshot,0))`; `INDEX ix_release_time (released_at, contract_id)`.

### `money_journals` — `MoneyJournal`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `businessKey` | `business_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `journalKind` | `journal_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `paymentId` | `payment_id BIGINT NULL` |
| `contractId` | `contract_id BIGINT NULL` |
| `releaseId` | `release_id BIGINT NULL` |
| `refundId` | `refund_id BIGINT NULL` |
| `walletUserId` | `wallet_user_id BIGINT NULL` |
| `memo` | `memo VARCHAR(255) NOT NULL` |
| `postedAt` | `posted_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_journal_business UNIQUE (business_key)`; `CONSTRAINT uq_journal_release UNIQUE (release_id)`; `CONSTRAINT uq_journal_refund UNIQUE (refund_id)`; `CONSTRAINT fk_journal_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_journal_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_journal_release FOREIGN KEY (release_id) REFERENCES releases (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_journal_refund FOREIGN KEY (refund_id) REFERENCES refunds (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_journal_wallet FOREIGN KEY (wallet_user_id) REFERENCES wallets (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_journal_references CHECK ((journal_kind='TOP_UP' AND wallet_user_id IS NOT NULL AND payment_id IS NULL AND contract_id IS NULL AND release_id IS NULL AND refund_id IS NULL) OR (journal_kind IN ('WALLET_PAYMENT','PROVIDER_PAYMENT') AND payment_id IS NOT NULL AND contract_id IS NOT NULL AND release_id IS NULL AND refund_id IS NULL AND wallet_user_id IS NULL) OR (journal_kind='RELEASE' AND release_id IS NOT NULL AND contract_id IS NOT NULL AND payment_id IS NULL AND refund_id IS NULL AND wallet_user_id IS NULL) OR (journal_kind='REFUND' AND refund_id IS NOT NULL AND contract_id IS NOT NULL AND payment_id IS NULL AND release_id IS NULL AND wallet_user_id IS NULL))`.

### `ledger_entries` — `LedgerEntry`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `journalId` | `journal_id BIGINT NOT NULL` |
| `lineNumber` | `line_number INT NOT NULL` |
| `ledgerAccountId` | `ledger_account_id BIGINT NOT NULL` |
| `entrySide` | `entry_side VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `amount` | `amount DECIMAL(19,0) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_entry_line UNIQUE (journal_id, line_number)`; `CONSTRAINT fk_entry_journal FOREIGN KEY (journal_id) REFERENCES money_journals (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_entry_account FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_entry_side CHECK (entry_side IN ('DEBIT','CREDIT'))`; `CONSTRAINT ck_entry_amount CHECK (amount > 0 AND line_number > 0)`; `INDEX ix_entry_account (ledger_account_id, journal_id)`.

### `reviews` — `Review`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `contractId` | `contract_id BIGINT NOT NULL` |
| `reviewerUserId` | `reviewer_user_id BIGINT NOT NULL` |
| `rating` | `rating TINYINT NOT NULL` |
| `comment` | `comment VARCHAR(1000) NOT NULL` |
| `status` | `status VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_review_contract UNIQUE (contract_id)`; `CONSTRAINT fk_review_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_review_user FOREIGN KEY (reviewer_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_review_rating CHECK (rating BETWEEN 1 AND 5)`; `CONSTRAINT ck_review_status CHECK (status IN ('PUBLISHED','HIDDEN'))`.

### `reports` — `Report`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `publicCode` | `public_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `reporterUserId` | `reporter_user_id BIGINT NOT NULL` |
| `targetUserId` | `target_user_id BIGINT NOT NULL` |
| `relatedContractId` | `related_contract_id BIGINT NULL` |
| `reasonCode` | `reason_code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `description` | `description TEXT NOT NULL` |
| `status` | `status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `assignedAdminId` | `assigned_admin_id BIGINT NULL` |
| `resolution` | `resolution TEXT NULL` |
| `resolvedBy` | `resolved_by BIGINT NULL` |
| `resolvedAt` | `resolved_at DATETIME(6) NULL` |
| `version` | `version BIGINT NOT NULL DEFAULT 0` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_report_code UNIQUE (public_code)`; `CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_report_target FOREIGN KEY (target_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_report_contract FOREIGN KEY (related_contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_report_assigned FOREIGN KEY (assigned_admin_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_report_resolved FOREIGN KEY (resolved_by) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT ck_report_status CHECK (status IN ('OPEN','INVESTIGATING','RESOLVED','DISMISSED'))`; `CONSTRAINT ck_report_reason CHECK (reason_code IN ('CONTENT','CONDUCT','PAYMENT','NO_SHOW','OTHER'))`; `CONSTRAINT ck_report_target CHECK (reporter_user_id <> target_user_id)`; `CONSTRAINT ck_report_resolution CHECK ((status IN ('RESOLVED','DISMISSED') AND resolution IS NOT NULL AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL) OR (status IN ('OPEN','INVESTIGATING') AND resolved_at IS NULL))`; `INDEX ix_report_queue (status, created_at)`.

### `report_evidence` — `ReportEvidence`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `reportId` | `report_id BIGINT NOT NULL` |
| `fileId` | `file_id BIGINT NOT NULL` |

Constraints/index: `PRIMARY KEY (report_id, file_id)`; `CONSTRAINT uq_re_file UNIQUE (file_id)`; `CONSTRAINT fk_re_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_re_file FOREIGN KEY (file_id) REFERENCES private_files (id) ON DELETE RESTRICT ON UPDATE RESTRICT`.

### `notifications` — `Notification`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `recipientUserId` | `recipient_user_id BIGINT NOT NULL` |
| `eventKey` | `event_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `notificationType` | `notification_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `title` | `title VARCHAR(180) NOT NULL` |
| `body` | `body VARCHAR(1000) NOT NULL` |
| `orderId` | `order_id BIGINT NULL` |
| `refundId` | `refund_id BIGINT NULL` |
| `reportId` | `report_id BIGINT NULL` |
| `readAt` | `read_at DATETIME(6) NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT uq_notice_event UNIQUE (recipient_user_id, event_key)`; `CONSTRAINT fk_notice_user FOREIGN KEY (recipient_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_notice_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_notice_refund FOREIGN KEY (refund_id) REFERENCES refunds (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_notice_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `INDEX ix_notice_inbox (recipient_user_id, read_at, created_at)`.

### `audit_logs` — `AuditLog`

| Thuộc tính | Định nghĩa SQL |
|---|---|
| `id` | `id BIGINT NOT NULL AUTO_INCREMENT` |
| `actorUserId` | `actor_user_id BIGINT NULL` |
| `actionCode` | `action_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `orderId` | `order_id BIGINT NULL` |
| `reportId` | `report_id BIGINT NULL` |
| `targetUserId` | `target_user_id BIGINT NULL` |
| `metadata` | `metadata JSON NOT NULL` |
| `createdAt` | `created_at DATETIME(6) NOT NULL` |

Constraints/index: `PRIMARY KEY (id)`; `CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_audit_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_audit_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `CONSTRAINT fk_audit_target FOREIGN KEY (target_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT`; `INDEX ix_audit_time (created_at)`.

## Ngoài domain catalog

| Đối tượng | Vai trò / hướng dùng |
|---|---|
| dev_seed_runs | Tracking fixture development; không repository domain |
| flyway_schema_history | Flyway quản lý; không tự insert/update/fabricate |
| v_ledger_balances | Số dư CREDIT−DEBIT; query/DTO read-only sau này |
| v_wallet_balances | Available balance dẫn xuất; không thêm cached balance |
| v_escrow_balances | Held amount theo contract; read-only |
| v_tutor_revenue | Chỉ release có journal RELEASE; không coi held/planned là revenue |

## Phụ thuộc và trách nhiệm service còn lại

Account/role/reference → profile/file → offering → invitation/job/selection → source → order/item/contract/enrollment → payment/allocation → ledger/journal/release/refund → review/report/notification/audit.

Entity availability không đồng nghĩa feature backend đã triển khai. Chưa thêm checkout, provider payment, wallet posting, refund orchestration, reset password, AI, chat hoặc payout. Service sau này phải thực thi quyền/ownership, capacity dưới lock, balanced journals, tổng order/allocation, idempotency, transition matrix, eligibility review, retention và chính sách phí/refund. Policy Q02–Q10 trong DECISIONS còn cần nhóm chốt; không lấy giá/trạng thái từ browser demo làm nguồn tin cậy.
