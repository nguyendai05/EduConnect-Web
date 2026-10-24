package com.educonnect.lesson;

import com.educonnect.lesson.dto.OfferingTimeSlotRequest;
import com.educonnect.common.reference.repository.*;
import com.educonnect.lesson.domain.*;
import com.educonnect.lesson.repository.*;
import com.educonnect.lesson.service.*;
import com.educonnect.lesson.dto.OfferingRequest;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.tutor.repository.TutorProfileJpaRepository;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.validation.*;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class TutorOfferingServiceTest {
    static ValidatorFactory factory;
    OfferingJpaRepository offerings;
    OfferingTimeSlotJpaRepository slots;
    UserAccountRepository accounts;
    TutorProfileJpaRepository tutors;
    SubjectJpaRepository subjects;
    GradeLevelJpaRepository grades;
    AreaJpaRepository areas;
    DeliveryModeJpaRepository modes;
    TutorOfferingService service;
    AccountPrincipal principal;

    @BeforeAll static void validation() { factory = Validation.buildDefaultValidatorFactory(); }
    @AfterAll static void cleanup() { factory.close(); }
    @BeforeEach void setup() {
        offerings = mock(OfferingJpaRepository.class); slots = mock(OfferingTimeSlotJpaRepository.class);
        accounts = mock(UserAccountRepository.class); tutors = mock(TutorProfileJpaRepository.class);
        subjects = mock(SubjectJpaRepository.class); grades = mock(GradeLevelJpaRepository.class);
        areas = mock(AreaJpaRepository.class); modes = mock(DeliveryModeJpaRepository.class);
        service = new TutorOfferingService(offerings, slots, accounts, tutors, subjects, grades, areas, modes,
                mock(EntityManager.class), factory.getValidator());
        var account = new UserAccount(10L, "tutor@example.test", "{noop}test", "Gia sư", "ACTIVE", true, 0L, Set.of("TUTOR"));
        principal = new AccountPrincipal(account);
        when(accounts.findById(10L)).thenReturn(Optional.of(account));
        var tutor = TutorProfile.create(); tutor.setUserId(10L);
        when(tutors.findById(10L)).thenReturn(Optional.of(tutor));
        when(subjects.existsById(1L)).thenReturn(true); when(grades.existsById(1L)).thenReturn(true);
        when(areas.existsById(1L)).thenReturn(true); when(modes.existsById(1L)).thenReturn(true);
        when(offerings.saveAndFlush(any())).thenAnswer(call -> {
            Offering o = call.getArgument(0);
            if (o.getId() == null) ReflectionTestUtils.setField(o, "id", 42L);
            return o;
        });
    }
    static OfferingRequest form() {
        var f = new OfferingRequest(); f.setRequestKey(UUID.randomUUID().toString()); f.setTitle("Toán lớp 10");
        f.setDescription("Học theo mục tiêu đã thống nhất"); f.setSubjectId(1L); f.setGradeLevelId(1L);
        f.setAreaId(1L); f.setDeliveryModeId(1L); f.setUnitPrice(new BigDecimal("150000"));
        f.setSessionCount((short) 12); f.setDurationMinutes((short) 90); f.setTermsText("Điều khoản rõ ràng");
        var s = new OfferingTimeSlotRequest(); s.setWeekday((byte) 1); s.setStartTime(LocalTime.of(18, 0));
        s.setEndTime(LocalTime.of(19, 30)); f.getSlots().add(s); return f;
    }
    Offering existing(OfferingStatus status) {
        var o = Offering.create(); ReflectionTestUtils.setField(o, "id", 42L); ReflectionTestUtils.setField(o, "version", 3L);
        o.setTutorId(10L); o.setOfferingType(OfferingType.SERVICE); o.setStatus(status); o.setTermsVersion(2);
        when(offerings.findOwnedForUpdate(42L, 10L)).thenReturn(Optional.of(o)); return o;
    }

    @Test void newDraftUsesAuthenticatedOwnerAndPersistsSchedule() {
        assertEquals(42L, service.save(principal, null, form()));
        var captor = org.mockito.ArgumentCaptor.forClass(Offering.class);
        verify(offerings).saveAndFlush(captor.capture());
        assertEquals(10L, captor.getValue().getTutorId()); assertEquals(OfferingStatus.DRAFT, captor.getValue().getStatus());
        assertNull(captor.getValue().getReviewedBy()); assertNull(captor.getValue().getCapacity());
        verify(slots).saveAll(argThat(rows -> ((List<OfferingTimeSlot>) rows).get(0).getOfferingId().equals(42L)));
    }
    @Test void repeatingCreateReturnsOriginalWithoutAnotherWrite() {
        var f = form(); var o = Offering.create(); o.setTutorId(10L); ReflectionTestUtils.setField(o, "id", 42L);
        when(offerings.findCodeForUpdate("OFF-" + f.getRequestKey())).thenReturn(Optional.of(o));
        assertEquals(42L, service.save(principal, null, f)); verify(offerings, never()).saveAndFlush(any()); verifyNoInteractions(slots);
    }
    @Test void anotherOwnersIdCannotBeEditedOrClosed() {
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(OfferingProblem.class, () -> service.edit(principal, 99L)).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(OfferingProblem.class, () -> service.transition(principal, 99L, 0L, "close")).getStatus());
        verify(offerings, never()).saveAndFlush(any());
    }

    @Test void publishedFlagComesFromOwnedRecordAndChecksEditableState() {
        Offering offering = existing(OfferingStatus.PUBLISHED);
        when(offerings.findByIdAndTutorId(42L, 10L)).thenReturn(Optional.of(offering));
        assertTrue(service.isPublished(principal, 42L));

        offering.setStatus(OfferingStatus.DRAFT);
        assertFalse(service.isPublished(principal, 42L));

        offering.setStatus(OfferingStatus.IN_REVIEW);
        assertEquals(HttpStatus.CONFLICT, assertThrows(
                OfferingProblem.class, () -> service.isPublished(principal, 42L)
        ).getStatus());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(
                OfferingProblem.class, () -> service.isPublished(principal, 99L)
        ).getStatus());
    }
    @Test void learnerAndDisabledAccountCannotWriteEvenWhenCallingServiceDirectly() {
        for (var a : List.of(new UserAccount(10L, "a@example.test", "{noop}x", "A", "ACTIVE", true, 0L, Set.of("LEARNER")),
                new UserAccount(10L, "a@example.test", "{noop}x", "A", "LOCKED", true, 0L, Set.of("TUTOR")))) {
            when(accounts.findById(10L)).thenReturn(Optional.of(a));
            assertEquals(HttpStatus.FORBIDDEN, assertThrows(OfferingProblem.class, () -> service.save(principal, null, form())).getStatus());
        }
        verifyNoInteractions(offerings, slots);
    }
    @Test void staleVersionAndPendingOrClosedEditsAreRejected() {
        var o = existing(OfferingStatus.DRAFT); var f = form(); f.setVersion(2L);
        assertEquals(HttpStatus.CONFLICT, assertThrows(OfferingProblem.class, () -> service.save(principal, 42L, f)).getStatus());
        o.setStatus(OfferingStatus.PUBLISHED);
        assertThrows(OfferingProblem.class, () -> service.save(principal, 42L, f));
        f.setVersion(3L);
        for (var status : List.of(OfferingStatus.IN_REVIEW, OfferingStatus.CLOSED)) {
            o.setStatus(status);
            assertThrows(OfferingProblem.class, () -> service.save(principal, 42L, f));
        }
        verify(offerings, never()).saveAndFlush(any());
    }
    @Test void editAdvancesTermsAndReturnsRejectedItemToDraft() {
        var o = existing(OfferingStatus.REJECTED); var f = form(); f.setVersion(3L);
        service.save(principal, 42L, f);
        assertEquals(3, o.getTermsVersion()); assertEquals(OfferingStatus.DRAFT, o.getStatus());
        assertEquals(f.getUnitPrice(), o.getUnitPrice()); verify(slots).deleteSlots(42L);
    }
    @Test void groupRequiresCapacityAndOrderedDates() {
        var f = form(); f.setOfferingType(OfferingType.GROUP_CLASS);
        assertThrows(ConstraintViolationException.class, () -> service.save(principal, null, f));
        f.setCapacity(5); f.setStartsOn(LocalDate.of(2026, 11, 1)); f.setEndsOn(LocalDate.of(2026, 10, 1));
        assertThrows(ConstraintViolationException.class, () -> service.save(principal, null, f));
        f.setEndsOn(LocalDate.of(2026, 12, 1)); assertEquals(42L, service.save(principal, null, f));
    }
    @Test void rejectsOverlappingScheduleAndInvalidZone() {
        var f = form(); var other = new OfferingTimeSlotRequest(); other.setWeekday((byte) 1);
        other.setStartTime(LocalTime.of(19, 0)); other.setEndTime(LocalTime.of(20, 0)); f.getSlots().add(other);
        assertThrows(OfferingProblem.class, () -> service.save(principal, null, f));
        f.getSlots().remove(other); f.getSlots().get(0).setTimeZone("not-a-zone");
        assertThrows(ConstraintViolationException.class, () -> service.save(principal, null, f));
        verify(offerings, never()).saveAndFlush(any());
    }
    @Test void unknownReferencesAndExistingEnrollmentsAreNotSilentlyAccepted() {
        when(subjects.existsById(1L)).thenReturn(false);
        assertThrows(OfferingProblem.class, () -> service.save(principal, null, form()));
        when(subjects.existsById(1L)).thenReturn(true); existing(OfferingStatus.DRAFT);
        when(offerings.countEnrollments(42L)).thenReturn(1L); var f = form(); f.setVersion(3L);
        assertThrows(OfferingProblem.class, () -> service.save(principal, 42L, f));
        verify(offerings, never()).saveAndFlush(any());
    }
    @Test void closeIsRepeatableButCannotOverrideAStaleFirstRequest() {
        var o = existing(OfferingStatus.PUBLISHED);
        assertThrows(OfferingProblem.class, () -> service.transition(principal, 42L, 2L, "close"));
        service.transition(principal, 42L, 3L, "close"); service.transition(principal, 42L, 3L, "close");
        assertEquals(OfferingStatus.CLOSED, o.getStatus()); verify(offerings, times(1)).saveAndFlush(o);
    }
    @Test void tutorCannotPublishThroughForgedAction() {
        existing(OfferingStatus.DRAFT);
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(OfferingProblem.class,
                () -> service.transition(principal, 42L, 3L, "publish")).getStatus());
        verify(offerings, never()).saveAndFlush(any());
    }

    @Test void submitQueuesTheDraftWithoutPublishingAndCanBeRetried() {
        var o = existing(OfferingStatus.DRAFT); var input = form(); input.setVersion(3L);
        service.save(principal, 42L, input);
        when(offerings.findByIdAndTutorId(42L, 10L)).thenReturn(Optional.of(o));
        var slot = OfferingTimeSlot.create(); slot.setOfferingId(42L); slot.setWeekday((byte)1);
        slot.setStartTime(LocalTime.of(18, 0)); slot.setEndTime(LocalTime.of(19, 30)); slot.setTimeZone("Asia/Ho_Chi_Minh");
        when(slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(42L)).thenReturn(List.of(slot));
        service.transition(principal, 42L, 3L, "submit"); service.transition(principal, 42L, 3L, "submit");
        assertEquals(OfferingStatus.IN_REVIEW, o.getStatus()); assertNull(o.getPublishedAt()); assertNull(o.getReviewedBy());
        verify(offerings, times(2)).saveAndFlush(o); // One draft save, one status transition.
    }

    @Test void publishedEditQueuesReviewHidesCurrentListingAndClearsPriorApproval() {
        var o = existing(OfferingStatus.PUBLISHED); var input = form(); input.setVersion(3L);
        Instant published = Instant.parse("2026-10-01T00:00:00Z");
        o.setReviewedBy(1L); o.setReviewedAt(published); o.setReviewNote("Duyệt bản cũ");
        o.setFirstPublishedAt(published); o.setPublishedAt(published);
        service.save(principal, 42L, input);
        assertEquals(OfferingStatus.IN_REVIEW, o.getStatus()); assertEquals(3, o.getTermsVersion());
        assertNull(o.getReviewedBy()); assertNull(o.getReviewedAt()); assertNull(o.getReviewNote());
        assertEquals(published, o.getFirstPublishedAt()); assertEquals(published, o.getPublishedAt());
        when(offerings.findByTutorIdOrderByUpdatedAtDescIdDesc(10L)).thenReturn(List.of(o));
        assertTrue(service.list(principal, null, OfferingStatus.PUBLISHED, "").isEmpty());
    }

    @Test void enrolledPublishedOfferingAllowsNewPriceButKeepsExistingTeachingPlan() {
        var o = existing(OfferingStatus.DRAFT); var input = form(); input.setVersion(3L);
        service.save(principal, 42L, input); o.setStatus(OfferingStatus.PUBLISHED);
        when(offerings.countEnrollments(42L)).thenReturn(1L);
        var slot = OfferingTimeSlot.create(); slot.setWeekday((byte)1); slot.setStartTime(LocalTime.of(18, 0));
        slot.setEndTime(LocalTime.of(19, 30)); slot.setTimeZone("Asia/Ho_Chi_Minh");
        when(slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(42L)).thenReturn(List.of(slot));
        clearInvocations(offerings, slots);
        input.setUnitPrice(new BigDecimal("200000")); input.setTermsText("Điều khoản cho đăng ký mới");
        service.save(principal, 42L, input);
        assertEquals(OfferingStatus.IN_REVIEW, o.getStatus()); assertEquals(input.getUnitPrice(), o.getUnitPrice());
        verify(slots, never()).deleteSlots(anyLong()); verify(slots, never()).saveAll(any());
        o.setStatus(OfferingStatus.PUBLISHED); clearInvocations(offerings, slots);
        input.getSlots().get(0).setStartTime(LocalTime.of(17, 0));
        assertThrows(OfferingProblem.class, () -> service.save(principal, 42L, input));
        assertEquals(OfferingStatus.PUBLISHED, o.getStatus()); verify(offerings, never()).saveAndFlush(any());
    }

    @Test void publishedOfferingCannotBeSubmittedWithoutSavingARevision() {
        var o = existing(OfferingStatus.PUBLISHED);
        assertThrows(OfferingProblem.class, () -> service.transition(principal, 42L, 3L, "submit"));
        assertEquals(OfferingStatus.PUBLISHED, o.getStatus()); verify(offerings, never()).saveAndFlush(any());
    }
}
