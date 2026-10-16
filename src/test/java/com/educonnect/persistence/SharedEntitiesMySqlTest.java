package com.educonnect.persistence;

import com.educonnect.user.domain.*;
import com.educonnect.tutor.domain.*;
import com.educonnect.lesson.domain.*;
import com.educonnect.payment.domain.*;
import com.educonnect.wallet.domain.*;
import com.educonnect.admin.domain.AuditLog;
import com.educonnect.user.UserAccountRepository;
import com.educonnect.auth.OtpMailSender;
import jakarta.persistence.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

/** Chỉ chạy trên schema test được chỉ định; không seed, clean hoặc gửi mail. */
@SpringBootTest
@ActiveProfiles("db-dev")
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_JPA_TESTS", matches = "true")
@Transactional
class SharedEntitiesMySqlTest {
    @DynamicPropertySource static void isolatedDatabase(DynamicPropertyRegistry registry) {
        String url = System.getenv("EDUCONNECT_JPA_TEST_URL");
        if (url == null || !url.matches("jdbc:mysql://(?:127\\.0\\.0\\.1|localhost):[0-9]+/educonnect_test_shared(?:\\?.*)?"))
            throw new IllegalStateException("EDUCONNECT_JPA_TEST_URL phải chỉ đến educonnect_test_shared trên MySQL cô lập.");
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> System.getenv().getOrDefault("EDUCONNECT_JPA_TEST_USERNAME", "root"));
        registry.add("spring.datasource.password", () -> System.getenv().getOrDefault("EDUCONNECT_JPA_TEST_PASSWORD", ""));
    }
    @Autowired EntityManager em;
    @Autowired JdbcTemplate jdbc;
    @Autowired ApplicationContext context;
    @Autowired UserAccountRepository accounts;
    @Autowired PlatformTransactionManager transactions;
    @Autowired DataSource dataSource;
    @MockitoBean OtpMailSender mail;
    static final Instant NOW = Instant.parse("2026-10-16T03:04:05.123456Z");

    UserAccount account() {
        var a = UserAccount.create();
        a.setPublicCode("TEST-" + UUID.randomUUID());
        a.setEmail(UUID.randomUUID() + "@example.test");
        a.setPasswordHash("{noop}synthetic-test-only");
        a.setStatus(AccountStatus.ACTIVE); a.setDisplayName("Kiểm thử tổng hợp");
        a.setCreatedAt(NOW); a.setUpdatedAt(NOW); em.persist(a); em.flush(); return a;
    }
    TutorProfile tutor(UserAccount account) {
        var t = TutorProfile.create(); t.setAccount(account); t.setHeadline("Synthetic tutor");
        t.setReviewStatus(TutorReviewStatus.DRAFT); t.setExperienceYears((short) 0); t.setUpdatedAt(NOW);
        em.persist(t); em.flush(); return t;
    }
    LearnerProfile learner(UserAccount account) {
        var l = LearnerProfile.create(); l.setAccount(account); l.setLearnerKind(LearnerKind.SELF);
        em.persist(l); em.flush(); return l;
    }
    Offering offering(Long tutorId) {
        var o = Offering.create(); o.setPublicCode("OFF-" + UUID.randomUUID()); o.setTutorId(tutorId);
        o.setOfferingType(OfferingType.SERVICE); o.setTitle("Synthetic offering"); o.setDescription("Test");
        o.setSubjectId(1L); o.setGradeLevelId(1L); o.setAreaId(1L); o.setDeliveryModeId(1L);
        o.setUnitPrice(new BigDecimal("123456789012345")); o.setSessionCount((short) 2); o.setDurationMinutes((short) 60);
        o.setStatus(OfferingStatus.DRAFT); o.setTermsVersion(1); o.setTermsText("Synthetic terms");
        o.setCreatedAt(NOW); o.setUpdatedAt(NOW); em.persist(o); em.flush(); return o;
    }
    @Test void allRepositoriesAndMetamodelBootstrapWithFlywayAndValidation() {
        assertEquals(51, em.getMetamodel().getEntities().size());
        assertEquals(51, context.getBeansOfType(JpaRepository.class).size());
        assertNotNull(context.getBean("userAccountJpaRepository"));
        assertNotNull(context.getBean("userAccountRepository"));
        assertNotNull(context.getBean("pendingRegistrationJpaRepository"));
        assertNotNull(context.getBean("pendingRegistrationRepository"));
        assertInstanceOf(JpaTransactionManager.class, transactions);
        assertEquals(1, context.getBeansOfType(PlatformTransactionManager.class).size());
        assertTrue(TransactionSynchronizationManager.hasResource(dataSource));
        assertEquals(4, jdbc.queryForObject("SELECT COUNT(*) FROM flyway_schema_history WHERE success=1", Integer.class));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM dev_seed_runs", Integer.class));
    }
    @Test void sharedPrimaryKeysAndCompositeAssociationsRoundTrip() {
        var a=account(); var l=learner(a); var t=tutor(a);
        var role=UserRole.create(); role.setId(new UserRoleId(a.getId(),"LEARNER")); em.persist(role);
        var subject=TutorSubject.create(); subject.setId(new TutorSubjectId(t.getUserId(),1L)); em.persist(subject);
        var ledger=LedgerAccount.create(); ledger.setAccountCode("W-"+UUID.randomUUID());
        ledger.setAccountKind(LedgerAccountKind.USER_WALLET); ledger.setOwnerUserId(a.getId()); em.persist(ledger); em.flush();
        var wallet=Wallet.create(); wallet.setAccount(a); wallet.setLedgerAccountId(ledger.getId()); em.persist(wallet);
        em.flush(); em.clear();
        assertEquals(a.getId(),em.find(LearnerProfile.class,l.getUserId()).getAccount().getId());
        assertEquals(a.getId(),em.find(TutorProfile.class,t.getUserId()).getAccount().getId());
        assertEquals(ledger.getId(),em.find(Wallet.class,a.getId()).getLedgerAccountId());
        assertNotNull(em.find(UserRole.class,new UserRoleId(a.getId(),"LEARNER")));
        assertNotNull(em.find(TutorSubject.class,new TutorSubjectId(a.getId(),1L)));
    }
    @Test void varcharEnumsBinaryJsonDecimalsAndUtcTimestampsRoundTrip() {
        var a=account(); var t=tutor(a); var o=offering(t.getUserId());
        var audit=AuditLog.create(); audit.setActorUserId(a.getId()); audit.setActionCode("TEST");
        audit.setMetadata(Map.of("count",3,"label","Tiếng Việt")); audit.setCreatedAt(NOW); em.persist(audit);
        var file=com.educonnect.file.domain.PrivateFile.create(); file.setOwnerUserId(a.getId());
        file.setStorageKey("test/"+UUID.randomUUID()); file.setPurpose(com.educonnect.file.domain.FilePurpose.TUTOR_EVIDENCE);
        file.setOriginalName("synthetic.txt"); file.setMimeType("text/plain"); file.setByteSize(10L);
        byte[] digest=new byte[32]; Arrays.fill(digest,(byte)0xA5); file.setSha256(digest); file.setCreatedAt(NOW); em.persist(file);
        em.flush(); em.clear();
        Offering loaded=em.find(Offering.class,o.getId());
        assertEquals(OfferingType.SERVICE,loaded.getOfferingType());
        assertEquals(new BigDecimal("123456789012345"),loaded.getUnitPrice());
        assertEquals(NOW,loaded.getCreatedAt()); assertEquals("VND",loaded.getCurrency());
        assertEquals("Tiếng Việt",em.find(AuditLog.class,audit.getId()).getMetadata().get("label"));
        assertArrayEquals(digest,em.find(com.educonnect.file.domain.PrivateFile.class,file.getId()).getSha256());
        assertEquals("varchar",jdbc.queryForObject("SELECT DATA_TYPE FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='offerings' AND column_name='status'",String.class));
    }
    @Test void overlappingForeignKeysRejectMismatchedTutorWithoutWeakeningSql() {
        var a=account(); learner(a); var t=tutor(a); var other=tutor(account()); var o=offering(t.getUserId());
        var invitation=com.educonnect.invitation.domain.Invitation.create();
        invitation.setPublicCode("INV-"+UUID.randomUUID()); invitation.setLearnerId(a.getId()); invitation.setTutorId(t.getUserId());
        invitation.setOfferingId(o.getId()); invitation.setSubjectId(1L); invitation.setGradeLevelId(1L);
        invitation.setAreaId(1L); invitation.setDeliveryModeId(1L); invitation.setProposedUnitPrice(BigDecimal.TEN);
        invitation.setSessionCount((short)1); invitation.setTermsVersion(1); invitation.setTermsText("Test");
        invitation.setStatus(com.educonnect.invitation.domain.InvitationStatus.PENDING); invitation.setCreatedAt(NOW); invitation.setExpiresAt(NOW.plusSeconds(600));
        em.persist(invitation); em.flush(); em.clear();
        assertEquals(o.getId(),em.find(com.educonnect.invitation.domain.Invitation.class,invitation.getId()).getOfferingId());
        assertThrows(DataIntegrityViolationException.class,()->jdbc.update("UPDATE invitations SET tutor_id=? WHERE id=?",other.getUserId(),invitation.getId()));
    }
    @Test void staleJpaUpdateIsRejectedAfterAnotherWriterChangesVersion() {
        var a=account();
        jdbc.update("UPDATE user_accounts SET display_name='JDBC', version=version+1 WHERE id=?",a.getId());
        a.setDisplayName("Stale JPA");
        assertThrows(OptimisticLockException.class,()->em.flush());
    }
    @Test void jdbcVerificationIncrementsBothStampsAndInvalidatesLoadedJpaAccount() {
        var a=account();
        assertEquals(1,accounts.markEmailVerified(a.getId()));
        assertEquals(0,accounts.markEmailVerified(a.getId()));
        assertEquals(1L,jdbc.queryForObject("SELECT version FROM user_accounts WHERE id=?",Long.class,a.getId()));
        assertEquals(1L,jdbc.queryForObject("SELECT authentication_version FROM user_accounts WHERE id=?",Long.class,a.getId()));
        // The caller that mixes JDBC/JPA must refresh before changing this managed instance.
        a.setDisplayName("Stale after verification");
        assertThrows(OptimisticLockException.class,()->em.flush());
    }
    @Test void explicitRefreshAllowsMixedJdbcJpaWritesInOneTransaction() {
        var a=account(); assertEquals(1,accounts.markEmailVerified(a.getId()));
        em.refresh(a); assertEquals(1L,a.getVersion()); assertNotNull(a.getEmailVerifiedAt());
        a.setDisplayName("Refreshed"); em.flush(); assertEquals(2L,a.getVersion());
    }

    @Test void springDataSaveRecognizesNewSharedPrimaryKeyVersionedEntity() {
        var accountRepository=context.getBean(com.educonnect.user.repository.UserAccountJpaRepository.class);
        var a=UserAccount.create(); a.setPublicCode("REPO-"+UUID.randomUUID());a.setEmail(UUID.randomUUID()+"@example.test");
        a.setPasswordHash("{noop}synthetic-only");a.setStatus(AccountStatus.ACTIVE);a.setDisplayName("Repository create");a.setCreatedAt(NOW);a.setUpdatedAt(NOW);
        assertNull(a.getVersion()); assertSame(a,accountRepository.saveAndFlush(a)); assertEquals(0L,a.getVersion());
        var profile=TutorProfile.create();profile.setAccount(a);profile.setUserId(a.getId());profile.setReviewStatus(TutorReviewStatus.DRAFT);
        profile.setHeadline("New shared PK");profile.setExperienceYears((short)0);profile.setUpdatedAt(NOW);
        var repository=context.getBean(com.educonnect.tutor.repository.TutorProfileJpaRepository.class);
        assertSame(profile,repository.saveAndFlush(profile)); assertEquals(a.getId(),profile.getUserId());assertEquals(0L,profile.getVersion());
    }
    @Test void jobSelectionAndRegistrationSourceKeepTheWholeCompositeReference() {
        var a=account();learner(a);var t=tutor(a);var other=tutor(account());
        long job=insert("job_posts","public_code","J-"+UUID.randomUUID(),"learner_id",a.getId(),"title","Test","description","Test","subject_id",1,"grade_level_id",1,"area_id",1,"delivery_mode_id",1,"budget_per_session",100,"session_count",1,"status","OPEN","created_at",NOW);
        long application=insert("job_applications","job_id",job,"tutor_id",t.getUserId(),"proposed_unit_price",100,"message","Test","status","SUBMITTED","created_at",NOW);
        var selection=com.educonnect.job.domain.JobSelection.create();selection.setJobId(job);selection.setApplicationId(application);selection.setTutorId(t.getUserId());
        selection.setSelectedBy(a.getId());selection.setTermsVersion(1);selection.setTermsText("Test");selection.setSelectedAt(NOW);em.persist(selection);em.flush();
        var source=com.educonnect.order.domain.RegistrationSource.create();source.setSourceKind(com.educonnect.order.domain.RegistrationSourceKind.JOB_APPLICATION);
        source.setLearnerId(a.getId());source.setTutorId(t.getUserId());source.setJobId(job);source.setApplicationId(application);source.setCreatedAt(NOW);em.persist(source);em.flush();em.clear();
        assertEquals(application,em.find(com.educonnect.job.domain.JobSelection.class,job).getApplicationId());
        assertEquals(application,em.find(com.educonnect.order.domain.RegistrationSource.class,source.getId()).getApplicationId());
        assertThrows(DataIntegrityViolationException.class,()->jdbc.update("UPDATE job_selections SET tutor_id=? WHERE job_id=?",other.getUserId(),job));
        assertThrows(DataIntegrityViolationException.class,()->jdbc.update("UPDATE registration_sources SET tutor_id=? WHERE id=?",other.getUserId(),source.getId()));
    }
    /** Static identifiers only; every value is bound. No developer records or fixtures. */
    long insert(String table,Object... pairs) {
        LinkedHashMap<String,Object> values=new LinkedHashMap<>();
        for(int i=0;i<pairs.length;i+=2) values.put((String)pairs[i],pairs[i+1]);
        String sql="INSERT INTO "+table+" ("+String.join(",",values.keySet())+") VALUES ("+String.join(",",Collections.nCopies(values.size(),"?"))+")";
        var keys=new GeneratedKeyHolder();
        jdbc.update(connection->{var ps=connection.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS); int i=1;
            for(Object value:values.values()) ps.setObject(i++,value instanceof Instant instant?Timestamp.from(instant):value);return ps;},keys);
        return Objects.requireNonNull(keys.getKey()).longValue();
    }
    @Test void allocationRefundGeneratedColumnAndEscrowSharedKeyRoundTrip() {
        var a=account(); learner(a); var t=tutor(a); var o=offering(t.getUserId());
        long source=insert("registration_sources","source_kind","CATALOG","learner_id",a.getId(),"tutor_id",t.getUserId(),"offering_id",o.getId(),"created_at",NOW);
        long order=insert("orders","public_code","O-"+UUID.randomUUID(),"learner_id",a.getId(),"status","AWAITING_PAYMENT","total_amount",100,"creation_key",UUID.randomUUID().toString(),"created_at",NOW,"updated_at",NOW);
        var history=com.educonnect.order.domain.OrderStatusHistory.create();history.setOrderId(order);history.setFromStatus("NEW");history.setToStatus("AWAITING_PAYMENT");
        history.setActorUserId(a.getId());history.setActorRoleCode("LEARNER");history.setEntityVersion(0L);history.setReason("Initial marker");history.setChangedAt(NOW);em.persist(history);em.flush();
        assertThrows(DataIntegrityViolationException.class,()->jdbc.update("UPDATE order_status_history SET to_status='COMPLETED' WHERE id=?",history.getId()));
        long item=insert("order_items","order_id",order,"line_number",1,"registration_source_id",source,"tutor_id",t.getUserId(),"title_snapshot","Test","offering_type_snapshot","SERVICE","unit_price_snapshot",100,"session_count_snapshot",1,"seat_count",1,"line_total",100,"fee_rate_snapshot",new BigDecimal("0.100000"),"fee_policy_version","test","terms_version_snapshot",1,"terms_text_snapshot","Test","terms_hash",new byte[32],"created_at",NOW);
        long contract=insert("contracts","public_code","C-"+UUID.randomUUID(),"order_item_id",item,"learner_id",a.getId(),"tutor_id",t.getUserId(),"status","AWAITING_PAYMENT","agreed_terms_text","Test","agreed_terms_hash",new byte[32],"learner_accepted_at",NOW,"tutor_accepted_at",NOW,"created_at",NOW);
        long payment=insert("payments","public_code","P-"+UUID.randomUUID(),"order_id",order,"amount",100,"wallet_amount",100,"provider_amount",0,"status","PENDING","created_at",NOW);
        var allocation=PaymentAllocation.create(); allocation.setId(new PaymentAllocationId(payment,contract));
        allocation.setAmount(new BigDecimal("100")); allocation.setWalletAmount(new BigDecimal("100")); allocation.setProviderAmount(BigDecimal.ZERO); em.persist(allocation); em.flush();
        var r=Refund.create(); r.setPaymentId(payment); r.setContractId(contract); r.setRequestKey(UUID.randomUUID().toString());
        r.setBasisAmountSnapshot(new BigDecimal("100")); r.setRefundRateSnapshot(new BigDecimal("0.500000")); r.setAmount(new BigDecimal("50"));
        r.setPolicyVersion("test"); r.setDestination(RefundDestination.WALLET); r.setStatus(RefundStatus.REQUESTED);
        r.setRequestedBy(a.getId()); r.setReason("Synthetic refund"); r.setRequestedAt(NOW); em.persist(r); em.flush();
        assertEquals(contract,r.getPendingContractId());
        assertThrows(DataIntegrityViolationException.class,()->jdbc.update("UPDATE refunds SET payment_id=? WHERE id=?",-1L,r.getId()));
        r.setStatus(RefundStatus.SUCCEEDED); r.setProcessedAt(NOW); em.flush(); assertNull(r.getPendingContractId());
        var ledger=LedgerAccount.create(); ledger.setAccountCode("ESC-"+UUID.randomUUID());ledger.setAccountKind(LedgerAccountKind.ESCROW);em.persist(ledger);em.flush();
        var escrow=EscrowAccount.create();escrow.setContract(em.getReference(com.educonnect.contract.domain.Contract.class,contract));escrow.setLedgerAccountId(ledger.getId());em.persist(escrow);em.flush();em.clear();
        assertNotNull(em.find(EscrowAccount.class,contract));
        assertEquals(new BigDecimal("0.500000"),em.find(Refund.class,r.getId()).getRefundRateSnapshot());
        assertNotNull(em.find(PaymentAllocation.class,new PaymentAllocationId(payment,contract)));
    }
}
