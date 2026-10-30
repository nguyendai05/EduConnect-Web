package com.educonnect.tutor;

import com.educonnect.admin.dto.TutorReviewForm;
import com.educonnect.admin.dto.AccountStatusForm;
import com.educonnect.admin.service.AdminManageService;
import com.educonnect.admin.service.TutorReviewService;
import com.educonnect.auth.OtpMailSender;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.file.service.PrivateFileService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.tutor.dto.TutorProfileForm;
import com.educonnect.tutor.service.TutorProfileService;
import com.educonnect.tutor.service.TutorProfileService.SaveResult;
import com.educonnect.user.domain.*;
import com.educonnect.user.dto.AccountProfileForm;
import com.educonnect.user.service.AccountProfileService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** DAI-02: opt-in MySQL/Flyway test, rolled back; kiểm hồ sơ gia sư, minh chứng và duyệt bằng DB thật. */
@SpringBootTest
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_JPA_TESTS", matches = "true")
@Transactional
class TutorProfileMySqlTest {
    private static final byte[] PDF = "%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF".getBytes();

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) throws Exception {
        String url = System.getenv("EDUCONNECT_JPA_TEST_URL");
        if (url == null || !url.matches("jdbc:mysql://(?:127\\.0\\.0\\.1|localhost):[0-9]+/educonnect_test_shared(?:\\?.*)?"))
            throw new IllegalStateException("Chỉ dùng schema educonnect_test_shared trên MySQL test cô lập.");
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> System.getenv().getOrDefault("EDUCONNECT_JPA_TEST_USERNAME", "root"));
        registry.add("spring.datasource.password", () -> System.getenv().getOrDefault("EDUCONNECT_JPA_TEST_PASSWORD", ""));
        var storage = Files.createTempDirectory("educonnect-private-test");
        registry.add("app.storage.private-dir", storage::toString);
    }

    @Autowired EntityManager em;
    @Autowired TutorProfileService tutors;
    @Autowired TutorReviewService reviews;
    @Autowired AdminManageService manage;
    @Autowired AccountProfileService accountsService;
    @Autowired PrivateFileService files;
    @MockitoBean OtpMailSender mail;

    AccountPrincipal user(String role) {
        Instant now = Instant.now();
        var account = UserAccount.create();
        account.setPublicCode("TEST-" + UUID.randomUUID());
        account.setEmail(UUID.randomUUID() + "@example.test");
        account.setPasswordHash("{noop}test-only");
        account.setDisplayName("Người dùng test DAI-02");
        account.setStatus(AccountStatus.ACTIVE);
        account.setEmailVerifiedAt(now);
        account.setCreatedAt(now);
        account.setUpdatedAt(now);
        em.persist(account);
        em.flush();
        var userRole = UserRole.create();
        userRole.setId(new UserRoleId(account.getId(), role));
        em.persist(userRole);
        if ("TUTOR".equals(role)) {
            var profile = com.educonnect.tutor.domain.TutorProfile.create();
            profile.setAccount(account);
            profile.setReviewStatus(TutorReviewStatus.DRAFT);
            profile.setHeadline("");
            profile.setExperienceYears((short) 0);
            profile.setUpdatedAt(now);
            em.persist(profile);
        } else if ("LEARNER".equals(role)) {
            var learner = LearnerProfile.create();
            learner.setAccount(account);
            learner.setLearnerKind(LearnerKind.SELF);
            em.persist(learner);
        }
        em.flush();
        return new AccountPrincipal(new com.educonnect.user.UserAccount(account.getId(), account.getEmail(), account.getPasswordHash(),
                account.getDisplayName(), "ACTIVE", true, 0L, Set.of(role)));
    }

    TutorProfileForm completeForm(AccountPrincipal tutor) {
        var current = tutors.view(tutor);
        var form = tutors.formOf(current);
        form.setHeadline("Gia sư Toán THPT");
        form.setExperienceYears(3);
        form.setBio("Gia sư nhiều năm kinh nghiệm, dạy theo lộ trình cá nhân hóa.");
        form.setSubjectIds(List.of(current.subjects().get(0).id()));
        form.setGradeLevelIds(List.of(current.gradeLevels().get(0).id()));
        form.setAreaIds(List.of(current.areas().get(0).id()));
        form.setDeliveryModeIds(List.of(current.deliveryModes().get(0).id()));
        return form;
    }

    MockMultipartFile pdf(String name) {
        return new MockMultipartFile("file", name, "application/pdf", PDF);
    }

    TutorProfileForm saved(AccountPrincipal tutor) {
        var form = completeForm(tutor);
        tutors.save(tutor, form);
        em.flush();
        em.clear();
        return form;
    }

    TutorReviewForm decision(String action, String reason, long version) {
        var form = new TutorReviewForm();
        form.setAction(action);
        form.setReason(reason);
        form.setVersion(version);
        return form;
    }

    @Test void saveReloadSubmitApproveAndReReview() {
        var tutor = user("TUTOR");
        var admin = user("ADMIN");
        saved(tutor);
        var reloaded = tutors.view(tutor);
        assertEquals("Gia sư Toán THPT", reloaded.headline());
        assertEquals(1, reloaded.selectedNames(reloaded.subjects()).size());
        assertFalse(reloaded.canSubmit(), "chưa có minh chứng");
        assertThrows(ServiceProblem.class, () -> tutors.submit(tutor, reloaded.tutorVersion()));

        assertEquals(SaveResult.SAVED, tutors.addEvidence(tutor, pdf("bang.pdf")));
        em.flush();
        em.clear();
        var ready = tutors.view(tutor);
        assertTrue(ready.canSubmit());
        assertEquals(1, ready.evidence().size());
        tutors.submit(tutor, ready.tutorVersion());
        em.flush();
        em.clear();
        assertEquals(TutorReviewStatus.PENDING, tutors.view(tutor).status());
        tutors.submit(tutor, ready.tutorVersion()); // gửi lặp không lỗi

        var pending = tutors.view(tutor);
        assertFalse(pending.editable());
        assertThrows(ServiceProblem.class, () -> tutors.save(tutor, tutors.formOf(pending)));

        assertThrows(ServiceProblem.class, () -> reviews.decide(admin, tutor.getId(), decision("reject", "ngắn", pending.tutorVersion())));
        assertThrows(ServiceProblem.class, () -> reviews.decide(admin, tutor.getId(), decision("approve", null, pending.tutorVersion() + 5)));
        assertThrows(ServiceProblem.class, () -> reviews.decide(tutor, tutor.getId(), decision("approve", null, pending.tutorVersion())),
                "gia sư không tự duyệt");
        assertEquals(1, reviews.queue(admin, TutorReviewStatus.PENDING, pending.displayName(), 0).rows().stream()
                .filter(row -> row.userId().equals(tutor.getId())).count());

        assertEquals(TutorReviewStatus.APPROVED, reviews.decide(admin, tutor.getId(), decision("approve", null, pending.tutorVersion())));
        assertEquals(TutorReviewStatus.APPROVED, reviews.decide(admin, tutor.getId(), decision("approve", null, pending.tutorVersion())));
        em.flush();
        em.clear();
        var approved = tutors.view(tutor);
        assertEquals(TutorReviewStatus.APPROVED, approved.status());
        assertEquals(admin.getId(), em.find(com.educonnect.tutor.domain.TutorProfile.class, tutor.getId()).getReviewedBy());

        var edit = tutors.formOf(approved);
        edit.setBio("Chỉ đổi phần giới thiệu, không cần duyệt lại và vẫn dài đủ.");
        assertEquals(SaveResult.SAVED, tutors.save(tutor, edit));
        em.flush();
        em.clear();
        assertEquals(TutorReviewStatus.APPROVED, tutors.view(tutor).status());

        var again = tutors.formOf(tutors.view(tutor));
        again.setHeadline("Tiêu đề mới cần duyệt lại");
        assertEquals(SaveResult.SENT_FOR_REREVIEW, tutors.save(tutor, again));
        em.flush();
        em.clear();
        assertEquals(TutorReviewStatus.PENDING, tutors.view(tutor).status());
    }

    @Test void rejectionRequiresReasonAndLetsTutorResubmit() {
        var tutor = user("TUTOR");
        var admin = user("ADMIN");
        saved(tutor);
        tutors.addEvidence(tutor, pdf("bang.pdf"));
        em.flush();
        em.clear();
        tutors.submit(tutor, tutors.view(tutor).tutorVersion());
        em.flush();
        em.clear();
        var pending = tutors.view(tutor);
        reviews.decide(admin, tutor.getId(), decision("reject", "Chứng chỉ không rõ, hãy tải lại bản scan.", pending.tutorVersion()));
        em.flush();
        em.clear();
        var rejected = tutors.view(tutor);
        assertEquals(TutorReviewStatus.REJECTED, rejected.status());
        assertEquals("Chứng chỉ không rõ, hãy tải lại bản scan.", rejected.reviewNote());
        assertTrue(rejected.editable());
        assertTrue(rejected.canSubmit());
        tutors.submit(tutor, rejected.tutorVersion());
        em.flush();
        em.clear();
        var again = tutors.view(tutor);
        assertEquals(TutorReviewStatus.PENDING, again.status());
        assertNull(again.reviewNote());
    }

    @Test void evidenceIsPrivateValidatedAndLimited() {
        var tutor = user("TUTOR");
        var stranger = user("LEARNER");
        var admin = user("ADMIN");
        assertThrows(ServiceProblem.class, () -> tutors.addEvidence(tutor, new MockMultipartFile("file", "x.exe", "application/octet-stream", "MZ".getBytes())));
        assertThrows(ServiceProblem.class, () -> tutors.addEvidence(tutor, new MockMultipartFile("file", "x.pdf", "application/pdf", new byte[0])));
        tutors.addEvidence(tutor, pdf("../../etc/passwd.pdf"));
        em.flush();
        em.clear();
        var proof = tutors.view(tutor).evidence().get(0);
        assertEquals("passwd.pdf", proof.name(), "tên tệp bị bỏ đường dẫn");
        assertEquals(PDF.length, files.open(tutor, proof.fileId()).size());
        assertEquals(PDF.length, files.open(admin, proof.fileId()).size());
        var denied = assertThrows(ServiceProblem.class, () -> files.open(stranger, proof.fileId()));
        assertEquals(404, denied.getStatus().value());
        for (int i = 1; i < TutorProfileService.MAX_EVIDENCE; i++) tutors.addEvidence(tutor, pdf("f" + i + ".pdf"));
        assertThrows(ServiceProblem.class, () -> tutors.addEvidence(tutor, pdf("sau.pdf")));
        tutors.removeEvidence(tutor, proof.fileId());
        em.flush();
        em.clear();
        assertEquals(TutorProfileService.MAX_EVIDENCE - 1, tutors.view(tutor).evidence().size());
        assertThrows(ServiceProblem.class, () -> files.open(tutor, proof.fileId()));
    }

    @Test void onlyTutorsOpenTutorProfileAndOnlyAdminsReview() {
        var learner = user("LEARNER");
        var tutor = user("TUTOR");
        assertThrows(ServiceProblem.class, () -> tutors.view(learner));
        assertThrows(ServiceProblem.class, () -> reviews.queue(learner, TutorReviewStatus.PENDING, null, 0));
        assertThrows(ServiceProblem.class, () -> reviews.detail(tutor, tutor.getId()));
    }

    @Test void accountProfileSavesOnlyOwnerFieldsAndDetectsStaleVersion() {
        var learner = user("LEARNER");
        var profile = accountsService.view(learner);
        var form = accountsService.formOf(profile);
        form.setDisplayName("Tên mới");
        form.setPhone("0912 345 678");
        form.setBio("Phụ huynh tìm gia sư");
        form.setLearnerKind("PARENT");
        accountsService.update(learner, form);
        em.flush();
        em.clear();
        var reloaded = accountsService.view(learner);
        assertEquals("Tên mới", reloaded.displayName());
        assertEquals("PARENT", reloaded.learnerKind());
        assertTrue(reloaded.roleLabels().contains("Người học / Phụ huynh"));
        assertThrows(ServiceProblem.class, () -> accountsService.update(learner, form), "phiên bản cũ");
        var invalid = accountsService.formOf(reloaded);
        invalid.setPhone("abc");
        assertThrows(ServiceProblem.class, () -> accountsService.update(learner, invalid));
    }

    @Test void adminListsRealDataAndChangesAccountStatusWithReason() {
        var admin = user("ADMIN");
        var learner = user("LEARNER");
        assertTrue(manage.users(admin, "Người dùng test", null, null, 0).total() >= 2);
        assertTrue(manage.users(admin, null, "LEARNER", "ACTIVE", 0).rows().stream().anyMatch(r -> r.id().equals(learner.getId())));
        manage.offerings(admin, "Toán", null, null, 0);
        manage.orders(admin, null, null, 0);
        assertThrows(ServiceProblem.class, () -> manage.users(admin, null, null, "BAD", 0));
        assertThrows(ServiceProblem.class, () -> manage.users(learner, null, null, null, 0), "không phải admin");

        long version = em.find(com.educonnect.user.domain.UserAccount.class, learner.getId()).getVersion();
        var form = new AccountStatusForm();
        form.setStatus("LOCKED");
        form.setReason("ngắn");
        form.setVersion(version);
        assertThrows(ServiceProblem.class, () -> manage.changeStatus(admin, learner.getId(), form), "lý do quá ngắn");
        form.setReason("Vi phạm quy định nhiều lần");
        manage.changeStatus(admin, learner.getId(), form);
        em.flush();
        em.clear();
        var locked = em.find(com.educonnect.user.domain.UserAccount.class, learner.getId());
        assertEquals(AccountStatus.LOCKED, locked.getStatus());
        assertEquals(1L, locked.getAuthenticationVersion(), "thu hồi phiên đang đăng nhập");
        manage.changeStatus(admin, learner.getId(), form); // gửi lặp không lỗi, không tăng thêm
        em.flush();
        em.clear();
        assertEquals(1L, em.find(com.educonnect.user.domain.UserAccount.class, learner.getId()).getAuthenticationVersion());
        assertThrows(ServiceProblem.class, () -> manage.changeStatus(admin, admin.getId(), form), "không tự khóa mình");
        assertThrows(ServiceProblem.class, () -> manage.changeStatus(learner, learner.getId(), form), "không phải admin");
    }

    @Autowired com.educonnect.admin.service.OfferingReviewService offeringReviews;

    com.educonnect.lesson.domain.Offering reviewableOffering(AccountPrincipal tutor) {
        var offering = com.educonnect.lesson.domain.Offering.create();
        offering.setPublicCode("OFF-" + UUID.randomUUID());
        offering.setTutorId(tutor.getId());
        offering.setOfferingType(com.educonnect.lesson.domain.OfferingType.SERVICE);
        offering.setTitle("Khóa học thử duyệt");
        offering.setDescription("Mô tả khóa học.");
        offering.setSubjectId(1L);
        offering.setGradeLevelId(1L);
        offering.setAreaId(1L);
        offering.setDeliveryModeId(1L);
        offering.setUnitPrice(java.math.BigDecimal.valueOf(2000));
        offering.setCurrency("VND");
        offering.setSessionCount((short) 5);
        offering.setDurationMinutes((short) 90);
        offering.setStatus(com.educonnect.lesson.domain.OfferingStatus.IN_REVIEW);
        offering.setTermsVersion(1);
        offering.setTermsText("Điều khoản.");
        offering.setCreatedAt(Instant.now());
        offering.setUpdatedAt(Instant.now());
        em.persist(offering);
        em.flush();
        return offering;
    }

    com.educonnect.admin.dto.OfferingReviewForm offeringDecision(String action, String reason, long version) {
        var form = new com.educonnect.admin.dto.OfferingReviewForm();
        form.setAction(action);
        form.setReason(reason);
        form.setVersion(version);
        return form;
    }

    @Test void adminReviewsOfferingWithGuardsAuditAndNotification() {
        var admin = user("ADMIN");
        var tutor = user("TUTOR"); // hồ sơ gia sư còn DRAFT
        var offering = reviewableOffering(tutor);
        long version = offering.getVersion();

        assertThrows(ServiceProblem.class, () -> offeringReviews.detail(tutor, offering.getId()), "gia sư không xem trang admin");
        assertThrows(ServiceProblem.class, () -> offeringReviews.decide(admin, offering.getId(), offeringDecision("reject", "ngắn", version)));
        assertThrows(ServiceProblem.class, () -> offeringReviews.decide(admin, offering.getId(), offeringDecision("approve", null, version + 3)));
        assertThrows(ServiceProblem.class, () -> offeringReviews.decide(admin, offering.getId(), offeringDecision("approve", null, version)),
                "hồ sơ gia sư chưa duyệt thì chưa công khai khóa học");
        assertTrue(offeringReviews.pendingCount(admin) >= 1);

        assertEquals(com.educonnect.lesson.domain.OfferingStatus.REJECTED,
                offeringReviews.decide(admin, offering.getId(), offeringDecision("reject", "Mô tả cần chi tiết hơn từng buổi.", version)));
        assertEquals(com.educonnect.lesson.domain.OfferingStatus.REJECTED,
                offeringReviews.decide(admin, offering.getId(), offeringDecision("reject", "Mô tả cần chi tiết hơn từng buổi.", version)),
                "gửi lặp không lỗi");
        em.flush();
        em.clear();
        var rejected = offeringReviews.detail(admin, offering.getId());
        assertEquals("REJECTED", rejected.status());
        assertEquals("Mô tả cần chi tiết hơn từng buổi.", rejected.reviewNote());
        assertEquals(1, em.createQuery("select count(n) from Notification n where n.recipientUserId = :id", Long.class)
                .setParameter("id", tutor.getId()).getSingleResult());
    }

    @Autowired com.educonnect.common.reference.service.CustomCatalogService catalog;

    @Test void tutorCanAddCustomSubjectAndGradeWithDedupeAndLimit() {
        var tutor = user("TUTOR");
        var other = user("TUTOR");
        var form = completeForm(tutor);
        form.setCustomSubjects(List.of("Lập trình Python", "toan"));
        form.setCustomGradeLevels(List.of("Đại học"));
        tutors.save(tutor, form);
        em.flush();
        em.clear();
        var view = tutors.view(tutor);
        var chosen = view.selectedNames(view.subjects());
        assertTrue(chosen.contains("Lập trình Python"));
        assertEquals(1, chosen.stream().filter(name -> name.equalsIgnoreCase("Toán")).count(), "'toan' dùng lại môn Toán, không tạo trùng");
        assertTrue(view.selectedNames(view.gradeLevels()).contains("Đại học"));

        var otherView = tutors.view(other);
        assertTrue(otherView.subjects().stream().noneMatch(c -> c.name().equals("Lập trình Python")), "mục của người khác không thành chip");
        assertTrue(otherView.subjectSuggestions().contains("Lập trình Python"), "nhưng được gợi ý khi gõ");
        assertSame(catalog.subject(other.getId(), "LẬP TRÌNH PYTHON").getId(), catalog.subject(other.getId(), "Lập trình python").getId());

        assertThrows(ServiceProblem.class, () -> catalog.subject(tutor.getId(), "<b>x</b>"));
        assertThrows(ServiceProblem.class, () -> catalog.gradeLevel(tutor.getId(), "a"));
        for (int i = 0; i < com.educonnect.common.reference.service.CustomCatalogService.MAX_GRADES_PER_USER; i++) {
            catalog.gradeLevel(other.getId(), "Cấp thử " + i);
        }
        assertThrows(ServiceProblem.class, () -> catalog.gradeLevel(other.getId(), "Cấp thử vượt giới hạn"));
    }
}
