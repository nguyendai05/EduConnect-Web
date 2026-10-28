package com.educonnect.lesson;

import com.educonnect.auth.OtpMailSender;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.repository.*;
import com.educonnect.lesson.service.*;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.*;
import com.educonnect.user.domain.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/** Opt-in isolated MySQL/Flyway test, rolled back; no development schema or SMTP calls. */
@SpringBootTest
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_JPA_TESTS", matches = "true")
@Transactional
class TutorOfferingMySqlTest {
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        String url = System.getenv("EDUCONNECT_JPA_TEST_URL");
        if (url == null || !url.matches("jdbc:mysql://(?:127\\.0\\.0\\.1|localhost):[0-9]+/educonnect_test_shared(?:\\?.*)?"))
            throw new IllegalStateException("Chỉ dùng schema educonnect_test_shared trên MySQL test cô lập.");
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> System.getenv().getOrDefault("EDUCONNECT_JPA_TEST_USERNAME", "root"));
        registry.add("spring.datasource.password", () -> System.getenv().getOrDefault("EDUCONNECT_JPA_TEST_PASSWORD", ""));
    }
    @Autowired EntityManager em;
    @Autowired TutorOfferingService service;
    @Autowired OfferingJpaRepository offerings;
    @Autowired OfferingTimeSlotJpaRepository slots;
    @MockitoBean OtpMailSender mail;

    AccountPrincipal tutor() {
        Instant now = Instant.now();
        var account = UserAccount.create(); account.setPublicCode("TEST-" + UUID.randomUUID());
        account.setEmail(UUID.randomUUID() + "@example.test"); account.setPasswordHash("{noop}test-only");
        account.setDisplayName("Gia sư test DAT-01"); account.setStatus(AccountStatus.ACTIVE);
        account.setEmailVerifiedAt(now); account.setCreatedAt(now); account.setUpdatedAt(now); em.persist(account); em.flush();
        var role = UserRole.create(); role.setId(new UserRoleId(account.getId(), "TUTOR")); em.persist(role);
        var tutor = TutorProfile.create(); tutor.setAccount(account); tutor.setReviewStatus(TutorReviewStatus.DRAFT);
        tutor.setHeadline("Test"); tutor.setExperienceYears((short) 0); tutor.setUpdatedAt(now); em.persist(tutor); em.flush();
        return new AccountPrincipal(new com.educonnect.user.UserAccount(account.getId(), account.getEmail(), account.getPasswordHash(),
                account.getDisplayName(), "ACTIVE", true, 0L, Set.of("TUTOR")));
    }

    @Test void createRetryReloadUpdateSubmitAndCloseUseExistingSchema() {
        var principal = tutor(); var input = TutorOfferingServiceTest.form();
        Long id = service.createDraft(principal, input);
        assertEquals(id, service.createDraft(principal, input));
        em.flush(); em.clear();
        assertEquals(1, offerings.findByTutorIdOrderByUpdatedAtDescIdDesc(principal.getId()).size());
        assertEquals(1, slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id).size());
        assertEquals("Toán lớp 10", service.list(principal, null, null, "").get(0).title());
        var edit = service.edit(principal, id); edit.setTitle("Toán đã sửa");
        service.update(principal, id, edit); em.flush(); em.clear();
        var stored = offerings.findById(id).orElseThrow();
        assertEquals(2, stored.getTermsVersion()); assertEquals("Toán đã sửa", stored.getTitle());
        assertEquals(1, slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id).size());
        service.submitForReview(principal, id, stored.getVersion()); em.flush(); em.clear();
        stored = offerings.findById(id).orElseThrow(); assertEquals(OfferingStatus.IN_REVIEW, stored.getStatus());
        assertNull(stored.getPublishedAt());
        service.close(principal, id, stored.getVersion()); em.flush(); em.clear();
        assertEquals(OfferingStatus.CLOSED, offerings.findById(id).orElseThrow().getStatus());
    }

    @Test void anotherTutorCannotReadOrMutateTheRecord() {
        var owner = tutor(); Long id = service.createDraft(owner, TutorOfferingServiceTest.form());
        var other = tutor(); em.flush();
        assertTrue(service.list(other, null, null, "").isEmpty());
        assertThrows(OfferingProblem.class, () -> service.edit(other, id));
    }

    @Test void publishedRevisionRequiresANewApprovalAndPreservesPublicationHistory() {
        var owner = tutor(); var reviewer = tutor();
        var adminRole = UserRole.create(); adminRole.setId(new UserRoleId(reviewer.getId(), "ADMIN")); em.persist(adminRole);
        Long id = service.createDraft(owner, TutorOfferingServiceTest.form());
        var o = offerings.findById(id).orElseThrow();
        Instant firstPublication = Instant.parse("2026-10-01T00:00:00Z");
        o.setStatus(OfferingStatus.PUBLISHED); o.setFirstPublishedAt(firstPublication); o.setPublishedAt(firstPublication);
        o.setReviewedBy(reviewer.getId()); o.setReviewedAt(firstPublication); o.setReviewNote("Bản đầu đã được duyệt");
        offerings.saveAndFlush(o); em.clear();
        var edit = service.edit(owner, id); assertTrue(service.isPublished(owner, id));
        edit.setUnitPrice(new java.math.BigDecimal("200000")); service.update(owner, id, edit); em.flush(); em.clear();
        o = offerings.findById(id).orElseThrow();
        assertEquals(OfferingStatus.IN_REVIEW, o.getStatus()); assertEquals(2, o.getTermsVersion());
        assertNull(o.getReviewedBy()); assertNull(o.getReviewedAt()); assertNull(o.getReviewNote());
        assertEquals(firstPublication, o.getFirstPublishedAt()); assertEquals(firstPublication, o.getPublishedAt());
        assertTrue(service.list(owner, null, OfferingStatus.PUBLISHED, "").isEmpty());
    }
}
