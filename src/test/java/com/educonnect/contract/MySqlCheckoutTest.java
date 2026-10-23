package com.educonnect.contract;

import com.educonnect.auth.OtpMailSender;
import com.educonnect.contract.service.ContractService;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.order.service.CartService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;

/** Real MySQL regression for the PR: all fixtures belong to UUID accounts, never seed users. */
@SpringBootTest
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_MYSQL_TESTS", matches = "true")
@Transactional
class MySqlCheckoutTest {
    @Autowired ContractService contracts;
    @Autowired CartService cart;
    @Autowired UserAccountRepository users;
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @Autowired MockMvc mvc;
    @MockitoBean OtpMailSender mail;
    @MockitoSpyBean EnrollmentJpaRepository enrollments;
    AccountPrincipal first, second, tutor;
    Long offeringId, firstItem, secondItem;
    Long offeringVersion;
    boolean committed;

    @BeforeEach void setup() {
        committed = !TransactionSynchronizationManager.isActualTransactionActive();
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            first = account("LEARNER"); second = account("LEARNER"); tutor = account("TUTOR");
            jdbc.update("UPDATE tutor_profiles SET review_status='APPROVED', reviewed_by=?, reviewed_at=UTC_TIMESTAMP(6) WHERE user_id=?", tutor.getId(), tutor.getId());
            Offering offering = offering(OfferingType.SERVICE, null);
            offeringId = offering.getId(); offeringVersion = offering.getVersion();
            firstItem = add(first, offering); secondItem = add(second, offering);
        });
    }

    private AccountPrincipal account(String role) {
        String email = "checkout-" + UUID.randomUUID() + "@example.test";
        users.createVerified(email, "{noop}synthetic-test", "Kiểm thử " + role, "0912345678", role);
        return new AccountPrincipal(users.findByEmail(email).orElseThrow());
    }

    private Offering offering(OfferingType type, Integer capacity) {
        Instant now = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        var o = Offering.create();
        o.setPublicCode("CHECKOUT-" + UUID.randomUUID()); o.setTutorId(tutor.getId());
        o.setOfferingType(type); o.setTitle("Khóa kiểm thử"); o.setDescription("Dữ liệu kiểm thử riêng");
        o.setSubjectId(1L); o.setGradeLevelId(1L); o.setAreaId(1L);
        o.setDeliveryModeId(1L); o.setUnitPrice(BigDecimal.valueOf(100_000)); o.setCurrency("VND");
        o.setSessionCount((short) 2); o.setDurationMinutes((short) 60); o.setCapacity(capacity);
        if (type == OfferingType.GROUP_CLASS) { o.setStartsOn(LocalDate.now().plusDays(7)); o.setEndsOn(LocalDate.now().plusDays(14)); }
        o.setTermsVersion(1); o.setTermsText("Hai buổi học, điều khoản kiểm thử.");
        o.setStatus(OfferingStatus.PUBLISHED); o.setFirstPublishedAt(now.minusSeconds(3600)); o.setPublishedAt(now.minusSeconds(3600));
        o.setReviewedBy(tutor.getId()); o.setReviewedAt(now.minusSeconds(3600));
        o.setCreatedAt(now.minusSeconds(7200)); o.setUpdatedAt(now);
        em.persist(o); em.flush(); em.clear();
        return o;
    }

    private Long add(AccountPrincipal user, Offering offering) {
        cart.add(user, offering.getId(), 1, offering.getVersion()); em.flush(); em.clear();
        return jdbc.queryForObject("SELECT i.id FROM cart_items i JOIN carts c ON c.id=i.cart_id WHERE c.learner_id=? AND i.offering_id=?", Long.class, user.getId(), offering.getId());
    }
    private ContractConfirmationForm form(Long item, Long version) { return new ContractConfirmationForm(item, version, true, true, true); }
    private int orders(AccountPrincipal user) { return jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE learner_id=?", Integer.class, user.getId()); }
    private int itemExists(Long id) { return jdbc.queryForObject("SELECT COUNT(*) FROM cart_items WHERE id=?", Integer.class, id); }

    @Test void draftIsReadOnlyAndAnotherLearnersCartCannotBeUsed() {
        assertTrue(contracts.draft(first, firstItem).isDraft());
        assertTrue(contracts.draft(first, firstItem).isDraft());
        assertEquals(0, orders(first)); assertEquals(1, itemExists(firstItem));
        assertThrows(IllegalArgumentException.class, () -> contracts.draft(second, firstItem));
        assertThrows(IllegalArgumentException.class, () -> contracts.confirm(second, form(firstItem, offeringVersion)));
        assertEquals(0, orders(second)); assertEquals(1, itemExists(firstItem));
    }

    @Test void consentIsRequiredAtServiceBoundaryAsWell() {
        assertThrows(ConstraintViolationException.class, () -> contracts.confirm(first,
                new ContractConfirmationForm(firstItem, offeringVersion, false, true, true)));
        assertEquals(0, orders(first)); assertEquals(1, itemExists(firstItem));
    }

    @Test void confirmationStoresSnapshotReservationAndPublicationConsentAndReplaysSameId() {
        Instant published = em.find(Offering.class, offeringId).getPublishedAt();
        Long id = contracts.confirm(first, form(firstItem, offeringVersion));
        assertEquals(id, contracts.confirm(first, form(firstItem, offeringVersion)));
        assertEquals(1, orders(first)); assertEquals(0, itemExists(firstItem)); assertEquals(1, itemExists(secondItem));
        em.clear(); // Match the POST/redirect/GET boundary; scalar FK writes do not hydrate read-only navigation.
        var view = contracts.getContract(first, id);
        assertFalse(view.isDraft()); assertTrue(view.payable());
        assertEquals(0, BigDecimal.valueOf(200_000).compareTo(view.total()));
        assertEquals("Hai buổi học, điều khoản kiểm thử.", view.terms());
        assertEquals(published, jdbc.queryForObject("SELECT tutor_accepted_at FROM contracts WHERE id=?", java.sql.Timestamp.class, id).toInstant());
        assertNotNull(jdbc.queryForObject("SELECT learner_accepted_at FROM contracts WHERE id=?", java.sql.Timestamp.class, id));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM enrollments WHERE contract_id=? AND status='RESERVED' AND reserved_until>UTC_TIMESTAMP(6)", Integer.class, id));
        assertEquals("DEV-PROPOSAL", jdbc.queryForObject("SELECT fee_policy_version FROM order_items WHERE order_id=(SELECT id FROM orders WHERE learner_id=?)", String.class, first.getId()));
        var changed = em.find(Offering.class, offeringId);
        changed.setUnitPrice(BigDecimal.valueOf(900_000)); changed.setTermsText("Điều khoản mới"); em.flush(); em.clear();
        var saved = contracts.getContract(first, id);
        assertEquals(0, BigDecimal.valueOf(200_000).compareTo(saved.total()));
        assertEquals("Hai buổi học, điều khoản kiểm thử.", saved.terms());
        assertThrows(ResponseStatusException.class, () -> contracts.getContract(second, id));
    }

    @Test void expiredReservationsNoLongerConsumeGroupCapacity() {
        Offering group = offering(OfferingType.GROUP_CLASS, 2);
        Long a = add(first, group); Long b = add(second, group);
        cart.update(first, a, 2, group.getVersion()); em.flush(); em.clear();
        Long oldContract = contracts.confirm(first, form(a, group.getVersion()));
        jdbc.update("UPDATE enrollments SET reserved_until=DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 SECOND) WHERE contract_id=?", oldContract);
        em.clear();
        Long next = contracts.confirm(second, form(b, group.getVersion()));
        assertNotNull(next);
        assertEquals(1, jdbc.queryForObject("SELECT SUM(seat_count) FROM enrollments WHERE offering_id=? AND reserved_until>UTC_TIMESTAMP(6)", Integer.class, group.getId()));
    }

    @Test void changedOfferingCannotSilentlyChangePriceOrTerms() {
        var offering = em.find(Offering.class, offeringId);
        offering.setUnitPrice(BigDecimal.valueOf(500_000)); em.flush();
        assertThrows(IllegalArgumentException.class, () -> contracts.confirm(first, form(firstItem, offeringVersion)));
        assertEquals(0, orders(first)); assertEquals(1, itemExists(firstItem));
    }

    @Test void closedOfferingCannotBeConfirmedAndAcknowledgementCannotBeOmitted() {
        var offering = em.find(Offering.class, offeringId);
        offering.setStatus(OfferingStatus.CLOSED); em.flush();
        assertThrows(IllegalArgumentException.class, () -> contracts.confirm(first, form(firstItem, offering.getVersion())));
        assertThrows(IllegalArgumentException.class, () -> cart.add(first, offeringId, 1, null));
        assertEquals(0, orders(first));
    }

    @Test @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void publishedCardsHideLockedOrUnapprovedTutors() throws Exception {
        mvc.perform(get("/home")).andExpect(status().isOk()).andExpect(content().string(containsString("Khóa kiểm thử")));
        mvc.perform(get("/catalog/detail")).andExpect(status().isOk()).andExpect(content().string(containsString("Khóa kiểm thử")));
        jdbc.update("UPDATE user_accounts SET status='LOCKED' WHERE id=?", tutor.getId());
        mvc.perform(get("/home")).andExpect(status().isOk()).andExpect(content().string(not(containsString("Khóa kiểm thử"))));
        assertNotNull(cart.getCartDTO(first).items().get(0).issue());
        assertThrows(IllegalArgumentException.class, () -> contracts.confirm(first, form(firstItem, offeringVersion)));
        assertEquals(0, orders(first));
    }

    @Test @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void failedReservationRollsBackAllRowsAndRestoresCartItem() {
        doThrow(new DataIntegrityViolationException("synthetic write failure")).when(enrollments).save(any());
        assertThrows(DataIntegrityViolationException.class, () -> contracts.confirm(first, form(firstItem, offeringVersion)));
        assertEquals(0, orders(first)); assertEquals(1, itemExists(firstItem));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM registration_sources WHERE learner_id=?", Integer.class, first.getId()));
    }

    @Test @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void simultaneousRetriesReturnOneOrderAndOneContract() throws Exception {
        Long[] result = concurrent(() -> contracts.confirm(first, form(firstItem, offeringVersion)),
                () -> contracts.confirm(first, form(firstItem, offeringVersion)));
        assertEquals(result[0], result[1]); assertNotNull(result[0]);
        assertEquals(1, orders(first));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM contracts WHERE learner_id=?", Integer.class, first.getId()));
    }

    @Test @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void onlyOneLearnerCanReserveTheLastGroupSeat() throws Exception {
        Long[] group = new TransactionTemplate(transactions).execute(status -> {
            Offering o = offering(OfferingType.GROUP_CLASS, 2);
            return new Long[]{add(first, o), add(second, o), o.getVersion(), o.getId()};
        });
        contracts.confirm(first, form(group[0], group[2])); // One of two seats is already reserved.
        Long retryItem = new TransactionTemplate(transactions).execute(status -> add(first, em.find(Offering.class, group[3])));
        Callable<Long> one = () -> tryConfirm(first, retryItem, group[2]);
        Callable<Long> two = () -> tryConfirm(second, group[1], group[2]);
        Long[] ids = concurrent(one, two);
        assertEquals(1, java.util.Arrays.stream(ids).filter(java.util.Objects::nonNull).count());
        assertEquals(2, orders(first) + orders(second));
        assertEquals(2, jdbc.queryForObject("SELECT SUM(seat_count) FROM enrollments WHERE offering_id=?", Integer.class, group[3]));
    }

    private Long tryConfirm(AccountPrincipal user, Long item, Long version) {
        try { return contracts.confirm(user, form(item, version)); }
        catch (IllegalArgumentException expected) { return null; }
    }
    private Long[] concurrent(Callable<Long> firstAction, Callable<Long> secondAction) throws Exception {
        var pool = Executors.newFixedThreadPool(2);
        var ready = new CountDownLatch(2); var start = new CountDownLatch(1);
        try {
            java.util.function.Function<Callable<Long>, Callable<Long>> task = action -> () -> {
                ready.countDown(); assertTrue(start.await(10, TimeUnit.SECONDS)); return action.call();
            };
            var one = pool.submit(task.apply(firstAction)); var two = pool.submit(task.apply(secondAction));
            assertTrue(ready.await(10, TimeUnit.SECONDS)); start.countDown();
            return new Long[]{one.get(20, TimeUnit.SECONDS), two.get(20, TimeUnit.SECONDS)};
        } finally { pool.shutdownNow(); assertTrue(pool.awaitTermination(10, TimeUnit.SECONDS)); }
    }

    @AfterEach void cleanupCommittedFixtures() {
        if (!committed || first == null) return;
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            for (AccountPrincipal user : new AccountPrincipal[]{first, second}) {
                Long id = user.getId();
                jdbc.update("DELETE FROM enrollments WHERE learner_id=?", id);
                jdbc.update("DELETE FROM contracts WHERE learner_id=?", id);
                jdbc.update("DELETE oi FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.learner_id=?", id);
                jdbc.update("DELETE FROM orders WHERE learner_id=?", id);
                jdbc.update("DELETE FROM registration_sources WHERE learner_id=?", id);
                jdbc.update("DELETE i FROM cart_items i JOIN carts c ON c.id=i.cart_id WHERE c.learner_id=?", id);
                jdbc.update("DELETE FROM carts WHERE learner_id=?", id);
            }
            jdbc.update("DELETE FROM offerings WHERE tutor_id=?", tutor.getId());
            for (AccountPrincipal user : new AccountPrincipal[]{first, second, tutor}) {
                jdbc.update("DELETE FROM learner_profiles WHERE user_id=?", user.getId());
                jdbc.update("DELETE FROM tutor_profiles WHERE user_id=?", user.getId());
                jdbc.update("DELETE FROM user_roles WHERE user_id=?", user.getId());
                jdbc.update("DELETE FROM user_accounts WHERE id=? AND email LIKE 'checkout-%@example.test'", user.getId());
            }
        });
    }
}
