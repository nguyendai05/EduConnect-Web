package com.educonnect.lesson.service;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.repository.OfferingJpaRepository;
import com.educonnect.lesson.repository.OfferingTimeSlotJpaRepository;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.AccountStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;

@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class CatalogService {
    private OfferingJpaRepository offerings;
    private OfferingTimeSlotJpaRepository slots;
    private EnrollmentJpaRepository enrollments;

    public CatalogService(OfferingJpaRepository offerings, OfferingTimeSlotJpaRepository slots,
                          EnrollmentJpaRepository enrollments) {
        this.offerings = offerings;
        this.slots = slots;
        this.enrollments = enrollments;
    }

    public Page<Offering> list(int page) {
        return list(page, 12);
    }

    public Page<Offering> list(int page, int size) {
        return offerings.findByStatusAndTutorReferenceReviewStatusAndTutorReferenceAccountStatus(
                OfferingStatus.PUBLISHED, TutorReviewStatus.APPROVED, AccountStatus.ACTIVE,
                PageRequest.of(Math.max(0, page), size, Sort.by("id").descending()));
    }

    public Offering getPublicOffering(Long id) {
        Offering offering = offerings.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dịch vụ hoặc lớp học"));
        if (!isPublic(offering)) {
            throw new IllegalArgumentException("Dịch vụ hoặc lớp học chưa được công khai");
        }
        return offering;
    }

    public boolean isPublic(Offering offering) {
        return (offering.getStatus() == OfferingStatus.PUBLISHED || offering.getStatus() == OfferingStatus.CLOSED)
                && offering.getTutorReference().getReviewStatus() == TutorReviewStatus.APPROVED
                && offering.getTutorReference().getAccount().getStatus() == AccountStatus.ACTIVE;
    }

    public List<OfferingTimeSlot> getSchedule(Long id) {
        return slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id);
    }

    public long availableSeats(Offering offering) {
        if (offering.getOfferingType() == OfferingType.SERVICE) return 1;
        long occupied = enrollments.countSeats(offering.getId(),
                List.of(EnrollmentStatus.CONFIRMED, EnrollmentStatus.COMPLETED),
                EnrollmentStatus.RESERVED, Instant.now());
        return Math.max(0, offering.getCapacity() - occupied);
    }

    public String registrationIssue(Offering offering, int seats) {
        if (!isPublic(offering) || offering.getStatus() != OfferingStatus.PUBLISHED) {
            return "Dịch vụ hoặc lớp học hiện không nhận đăng ký";
        }
        if (seats < 1) return "Số chỗ phải lớn hơn 0";
        if (offering.getOfferingType() == OfferingType.SERVICE && seats != 1) {
            return "Dịch vụ 1 kèm 1 chỉ đăng ký một chỗ";
        }
        if (seats > availableSeats(offering)) return "Lớp không còn đủ chỗ theo lựa chọn";
        return null;
    }
}
