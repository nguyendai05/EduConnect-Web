package com.educonnect.tutor;

import com.educonnect.common.reference.domain.*;
import com.educonnect.lesson.domain.*;
import com.educonnect.tutor.domain.*;
import com.educonnect.tutor.dto.TutorCardResponse;
import com.educonnect.tutor.dto.TutorSearchRequest;
import com.educonnect.tutor.repository.TutorDiscoveryRepository;
import com.educonnect.user.domain.AccountStatus;
import com.educonnect.user.domain.UserAccount;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Chạy truy vấn thật trên DB trong bộ nhớ, không dùng cấu hình hay dữ liệu MySQL của ứng dụng. */
class TutorDiscoveryRepositoryTest {
    private static SessionFactory factory;
    private EntityManager em;
    private TutorDiscoveryRepository repository;
    private Subject subject;
    private GradeLevel grade;
    private Area area;
    private DeliveryMode mode;

    @BeforeAll static void database() {
        Configuration configuration = new Configuration();
        for (Class<?> entity : List.of(UserAccount.class, TutorProfile.class, Subject.class, GradeLevel.class,
                Area.class, DeliveryMode.class, TutorSubject.class, TutorGradeLevel.class, TutorArea.class,
                TutorDeliveryMode.class, Offering.class, OfferingTimeSlot.class)) {
            configuration.addAnnotatedClass(entity);
        }
        factory = configuration
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:tutor-discovery;MODE=MySQL;DB_CLOSE_DELAY=-1")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .setProperty("hibernate.hbm2ddl.halt_on_error", "true")
                .buildSessionFactory();
    }

    @AfterAll static void closeDatabase() { if (factory != null) factory.close(); }

    @BeforeEach void fixture() {
        em = factory.createEntityManager();
        em.getTransaction().begin();
        repository = new TutorDiscoveryRepository(em);
        subject = subject("Môn riêng biệt", null);
        grade = grade("Cấp riêng biệt", null);
        area = Area.create();
        area.setCode(UUID.randomUUID().toString());
        area.setName("Vùng riêng biệt");
        em.persist(area);
        mode = DeliveryMode.create();
        mode.setCode(UUID.randomUUID().toString());
        mode.setName("Hình thức riêng biệt");
        em.persist(mode);
    }

    @AfterEach void rollback() {
        if (em != null) {
            em.getTransaction().rollback();
            em.close();
        }
    }

    @Test void approvedProfileWithoutOfferingMatchesBioAndEveryExpertiseWithDefaultTimeZone() {
        TutorProfile tutor = tutor("Gia sư mới");
        expertise(tutor);
        var request = expertiseRequest();
        request.setTimeZone("Asia/Ho_Chi_Minh");
        for (String q : List.of("", "nội dung bio", subject.getName(), grade.getName(), area.getName(), mode.getName())) {
            request.setQ(q);
            var result = repository.search(request);
            assertEquals(1, result.getTotalElements(), q);
            TutorCardResponse card = result.getContent().get(0);
            assertEquals(tutor.getUserId(), card.id());
            assertNull(card.priceFrom());
            assertEquals(0L, card.offeringCount());
        }
    }

    @Test void publishedOfferingMatchesEveryExpertiseEvenWithoutProfileLinks() {
        TutorProfile tutor = tutor("Gia sư có gói");
        offering(tutor, OfferingStatus.PUBLISHED, 200);
        var request = expertiseRequest();
        for (String q : List.of("", "Tiêu đề gói", subject.getName(), grade.getName(), area.getName(), mode.getName())) {
            request.setQ(q);
            var result = repository.search(request);
            assertEquals(1, result.getTotalElements(), q);
            assertEquals(1L, result.getContent().get(0).offeringCount());
        }
    }

    @Test void individualExpertiseFiltersCanMixProfileAndOfferingMatches() {
        TutorProfile tutor = tutor("Kết hợp hồ sơ và gói");
        link(tutor, subject, grade);
        Subject otherSubject = subject("Môn khác trên gói", null);
        GradeLevel otherGrade = grade("Cấp khác trên gói", null);
        Offering published = offering(tutor, OfferingStatus.PUBLISHED, 200);
        published.setSubjectId(otherSubject.getId());
        published.setGradeLevelId(otherGrade.getId());
        var request = expertiseRequest();
        var result = repository.search(request);
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).offeringCount());
        request.setDeliveryModeId(Long.MAX_VALUE);
        assertEquals(0, repository.search(request).getTotalElements());
    }

    @Test void eachOfferingSpecificFilterExcludesTutorsWithOnlyDraftOrNoOfferings() {
        TutorProfile noOffering = tutor("Chưa có gói");
        TutorProfile draftOnly = tutor("Chỉ có gói nháp");
        expertise(noOffering);
        expertise(draftOnly);
        slot(offering(draftOnly, OfferingStatus.DRAFT, 100), 1);
        var price = expertiseRequest();
        price.setMinPrice(BigDecimal.ZERO);
        var type = expertiseRequest();
        type.setOfferingType(OfferingType.SERVICE);
        var schedule = expertiseRequest();
        schedule.setWeekdays(List.of(1));
        schedule.setTimeZone("Asia/Ho_Chi_Minh");
        for (var request : List.of(price, type, schedule)) {
            assertEquals(0, repository.search(request).getTotalElements());
        }
    }

    @Test void nonPublicTutorsAndDraftOfferingsCannotBeDiscovered() {
        TutorProfile pending = tutor("Chưa duyệt");
        pending.setReviewStatus(TutorReviewStatus.PENDING);
        TutorProfile inactive = tutor("Khóa tài khoản");
        inactive.getAccount().setStatus(AccountStatus.LOCKED);
        TutorProfile unverified = tutor("Chưa xác minh");
        unverified.getAccount().setEmailVerifiedAt(null);
        for (TutorProfile hidden : List.of(pending, inactive, unverified)) {
            expertise(hidden);
            offering(hidden, OfferingStatus.PUBLISHED, 100);
            assertTrue(repository.publicProfile(hidden.getUserId()).isEmpty());
        }
        TutorProfile visible = tutor("Có gói nháp");
        offering(visible, OfferingStatus.DRAFT, 10);
        var result = repository.search(new TutorSearchRequest());
        assertEquals(List.of(visible.getUserId()), result.getContent().stream().map(TutorCardResponse::id).toList());
        assertNull(result.getContent().get(0).priceFrom());
        var request = expertiseRequest();
        assertEquals(0, repository.search(request).getTotalElements());
        request = new TutorSearchRequest();
        request.setQ("Tiêu đề gói");
        assertEquals(0, repository.search(request).getTotalElements());
    }

    @Test void priceTypeAndSlotsMustMatchTheSamePublishedOffering() {
        TutorProfile tutor = tutor("Có nhiều gói");
        expertise(tutor);
        TutorProfile withoutOffering = tutor("Chỉ có hồ sơ");
        expertise(withoutOffering);
        Offering cheap = offering(tutor, OfferingStatus.PUBLISHED, 100);
        Offering expensive = offering(tutor, OfferingStatus.PUBLISHED, 300);
        expensive.setOfferingType(OfferingType.GROUP_CLASS);
        slot(cheap, 1);
        slot(expensive, 2);
        Offering draft = offering(tutor, OfferingStatus.DRAFT, 100);
        slot(draft, 2);
        var request = expertiseRequest();
        request.setMinPrice(new BigDecimal("50"));
        request.setMaxPrice(new BigDecimal("150"));
        request.setOfferingType(OfferingType.SERVICE);
        request.setTimeZone("Asia/Ho_Chi_Minh");
        request.setWeekdays(List.of(2));
        assertEquals(0, repository.search(request).getTotalElements());
        request.setWeekdays(List.of(1));
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(10, 0));
        var result = repository.search(request);
        assertEquals(1, result.getTotalElements());
        assertEquals(new BigDecimal("100"), result.getContent().get(0).priceFrom());
        assertEquals(1L, result.getContent().get(0).offeringCount());
    }

    @Test void selectedGradesCanCombineProfileAndOfferingsAndRequireAllGrades() {
        TutorProfile tutor = tutor("Kết hợp cấp học");
        expertise(tutor);
        GradeLevel second = grade("Cấp thứ hai", null);
        Offering offering = offering(tutor, OfferingStatus.PUBLISHED, 200);
        offering.setGradeLevelId(second.getId());
        var request = expertiseRequest();
        request.setGradeLevelIds(List.of(grade.getId(), second.getId(), second.getId()));
        request.setQ("Cấp thứ hai");
        assertEquals(1, repository.search(request).getTotalElements());
        request.setMaxPrice(new BigDecimal("100"));
        assertEquals(0, repository.search(request).getTotalElements());
        request.setMaxPrice(null);
        request.setGradeLevelIds(List.of(grade.getId(), second.getId(), Long.MAX_VALUE));
        assertEquals(0, repository.search(request).getTotalElements());
    }

    @Test void everyOfferingGradeMustAlsoMatchOtherFilters() {
        TutorProfile tutor = tutor("Hai cấp từ gói");
        GradeLevel second = grade("Cấp thứ hai", null);
        offering(tutor, OfferingStatus.PUBLISHED, 100);
        Offering other = offering(tutor, OfferingStatus.PUBLISHED, 300);
        other.setGradeLevelId(second.getId());
        var request = expertiseRequest();
        request.setGradeLevelIds(List.of(grade.getId(), second.getId()));
        assertEquals(1, repository.search(request).getTotalElements());
        request.setMaxPrice(new BigDecimal("200"));
        assertEquals(0, repository.search(request).getTotalElements());
    }

    @Test void pricesSortNullLastInBothDirectionsAndPaginationCountsTutors() {
        TutorProfile noOffering = tutor("A chưa có gói");
        TutorProfile cheap = tutor("B rẻ");
        TutorProfile expensive = tutor("C đắt");
        offering(cheap, OfferingStatus.PUBLISHED, 100);
        offering(cheap, OfferingStatus.PUBLISHED, 200);
        offering(expensive, OfferingStatus.PUBLISHED, 300);
        var request = new TutorSearchRequest();
        request.setSort("price-asc");
        assertEquals(List.of(cheap.getUserId(), expensive.getUserId(), noOffering.getUserId()),
                repository.search(request).getContent().stream().map(TutorCardResponse::id).toList());
        request.setSort("price-desc");
        assertEquals(List.of(expensive.getUserId(), cheap.getUserId(), noOffering.getUserId()),
                repository.search(request).getContent().stream().map(TutorCardResponse::id).toList());
        request.setSize(1);
        request.setPage(2);
        var result = repository.search(request);
        assertEquals(3, result.getTotalElements());
        assertEquals(3, result.getTotalPages());
        assertEquals(noOffering.getUserId(), result.getContent().get(0).id());
    }

    @Test void optionsExposeOnlySystemOrPublicProfileOrPublishedOfferingCategories() {
        TutorProfile approved = tutor("Đã duyệt");
        TutorProfile pending = tutor("Chưa duyệt");
        pending.setReviewStatus(TutorReviewStatus.PENDING);
        Subject profileSubject = subject("Môn trên hồ sơ", approved.getUserId());
        GradeLevel profileGrade = grade("Cấp trên hồ sơ", approved.getUserId());
        link(approved, profileSubject, profileGrade);
        Subject offeringSubject = subject("Môn từ gói công khai", pending.getUserId());
        GradeLevel offeringGrade = grade("Cấp từ gói công khai", pending.getUserId());
        Offering published = offering(approved, OfferingStatus.PUBLISHED, 100);
        published.setSubjectId(offeringSubject.getId());
        published.setGradeLevelId(offeringGrade.getId());
        Subject hiddenSubject = subject("Môn nháp", pending.getUserId());
        GradeLevel hiddenGrade = grade("Cấp nháp", pending.getUserId());
        link(pending, hiddenSubject, hiddenGrade);
        Offering draft = offering(approved, OfferingStatus.DRAFT, 10);
        draft.setSubjectId(hiddenSubject.getId());
        draft.setGradeLevelId(hiddenGrade.getId());
        Offering invalid = offering(pending, OfferingStatus.PUBLISHED, 20);
        invalid.setSubjectId(hiddenSubject.getId());
        invalid.setGradeLevelId(hiddenGrade.getId());
        var options = repository.options();
        assertEquals(java.util.Set.of(subject.getId(), profileSubject.getId(), offeringSubject.getId()),
                options.subjects().stream().map(o -> o.id()).collect(java.util.stream.Collectors.toSet()));
        assertEquals(java.util.Set.of(grade.getId(), profileGrade.getId(), offeringGrade.getId()),
                options.grades().stream().map(o -> o.id()).collect(java.util.stream.Collectors.toSet()));
        approved.getAccount().setStatus(AccountStatus.DISABLED);
        assertEquals(List.of(subject.getId()), repository.options().subjects().stream().map(o -> o.id()).toList());
        assertEquals(List.of(grade.getId()), repository.options().grades().stream().map(o -> o.id()).toList());
        approved.getAccount().setStatus(AccountStatus.ACTIVE);
        approved.getAccount().setEmailVerifiedAt(null);
        assertEquals(List.of(subject.getId()), repository.options().subjects().stream().map(o -> o.id()).toList());
        assertEquals(List.of(grade.getId()), repository.options().grades().stream().map(o -> o.id()).toList());
    }

    @Test void keywordWildcardsAreLiteralAndPrivateFieldsAreNotSearchable() {
        TutorProfile tutor = tutor("Gia sư 100%_!");
        tutor.getAccount().setEmail("private-email@example.test");
        tutor.getAccount().setPhone("0900123456");
        tutor.setReviewNote("private-review-note");
        var request = new TutorSearchRequest();
        request.setQ("%_!");
        assertEquals(1, repository.search(request).getTotalElements());
        for (String secret : List.of("private-email", "0900123456", "private-review-note")) {
            request.setQ(secret);
            assertEquals(0, repository.search(request).getTotalElements());
        }
    }

    private TutorSearchRequest expertiseRequest() {
        var request = new TutorSearchRequest();
        request.setSubjectId(subject.getId());
        request.setGradeLevelIds(List.of(grade.getId()));
        request.setAreaId(area.getId());
        request.setDeliveryModeId(mode.getId());
        return request;
    }

    private TutorProfile tutor(String name) {
        Instant now = Instant.now();
        UserAccount account = UserAccount.create();
        account.setPublicCode(UUID.randomUUID().toString());
        account.setEmail(UUID.randomUUID() + "@example.test");
        account.setPasswordHash("test-only");
        account.setDisplayName(name);
        account.setBio("Nội dung bio độc lập");
        account.setStatus(AccountStatus.ACTIVE);
        account.setEmailVerifiedAt(now);
        account.setCreatedAt(now);
        account.setUpdatedAt(now);
        em.persist(account);
        TutorProfile profile = TutorProfile.create();
        profile.setAccount(account);
        profile.setReviewStatus(TutorReviewStatus.APPROVED);
        profile.setHeadline("Hồ sơ gia sư");
        profile.setExperienceYears((short) 2);
        profile.setUpdatedAt(now);
        em.persist(profile);
        return profile;
    }

    private Subject subject(String name, Long creator) {
        Subject value = Subject.create();
        value.setCode(UUID.randomUUID().toString());
        value.setName(name);
        value.setCreatedBy(creator);
        em.persist(value);
        return value;
    }

    private GradeLevel grade(String name, Long creator) {
        GradeLevel value = GradeLevel.create();
        value.setCode(UUID.randomUUID().toString());
        value.setName(name);
        value.setCreatedBy(creator);
        em.persist(value);
        return value;
    }

    private void link(TutorProfile tutor, Subject subject, GradeLevel grade) {
        TutorSubject ts = TutorSubject.create();
        ts.setId(new TutorSubjectId(tutor.getUserId(), subject.getId()));
        em.persist(ts);
        TutorGradeLevel tg = TutorGradeLevel.create();
        tg.setId(new TutorGradeLevelId(tutor.getUserId(), grade.getId()));
        em.persist(tg);
    }

    private void expertise(TutorProfile tutor) {
        link(tutor, subject, grade);
        TutorArea ta = TutorArea.create();
        ta.setId(new TutorAreaId(tutor.getUserId(), area.getId()));
        em.persist(ta);
        TutorDeliveryMode tm = TutorDeliveryMode.create();
        tm.setId(new TutorDeliveryModeId(tutor.getUserId(), mode.getId()));
        em.persist(tm);
    }

    private Offering offering(TutorProfile tutor, OfferingStatus status, int price) {
        Offering offering = Offering.create();
        offering.setPublicCode(UUID.randomUUID().toString());
        offering.setTutorId(tutor.getUserId());
        offering.setOfferingType(OfferingType.SERVICE);
        offering.setTitle("Tiêu đề gói học");
        offering.setDescription("Mô tả gói học");
        offering.setSubjectId(subject.getId());
        offering.setGradeLevelId(grade.getId());
        offering.setAreaId(area.getId());
        offering.setDeliveryModeId(mode.getId());
        offering.setUnitPrice(BigDecimal.valueOf(price));
        offering.setSessionCount((short) 1);
        offering.setDurationMinutes((short) 60);
        offering.setStatus(status);
        offering.setTermsVersion(1);
        offering.setTermsText("Điều khoản");
        offering.setCreatedAt(Instant.now());
        offering.setUpdatedAt(Instant.now());
        em.persist(offering);
        return offering;
    }

    private void slot(Offering offering, int day) {
        OfferingTimeSlot slot = OfferingTimeSlot.create();
        slot.setOfferingId(offering.getId());
        slot.setWeekday((byte) day);
        slot.setStartTime(LocalTime.of(8, 0));
        slot.setEndTime(LocalTime.of(9, 0));
        slot.setTimeZone("Asia/Ho_Chi_Minh");
        em.persist(slot);
    }
}
