package com.educonnect.lesson.service;

import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.dto.OfferingDetail;
import com.educonnect.lesson.dto.OfferingDetail.TimeSlot;
import com.educonnect.lesson.repository.EnrollmentJpaRepository;
import com.educonnect.lesson.repository.OfferingJpaRepository;
import com.educonnect.lesson.repository.OfferingTimeSlotJpaRepository;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.user.domain.AccountStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;

@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class OfferingDetailService {
    private OfferingJpaRepository offerings;
    private OfferingTimeSlotJpaRepository timeSlots;
    private EnrollmentJpaRepository enrollments;

    public OfferingDetailService(OfferingJpaRepository offerings,
                                 OfferingTimeSlotJpaRepository timeSlots,
                                 EnrollmentJpaRepository enrollments) {
        this.offerings = offerings;
        this.timeSlots = timeSlots;
        this.enrollments = enrollments;
    }

    public OfferingDetail getDetail(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lớp không hợp lệ");
        }
        var offering = offerings.findById(id).orElseThrow(() -> notFound());
        if (offering.getStatus() != OfferingStatus.PUBLISHED
                && offering.getStatus() != OfferingStatus.CLOSED) {
            throw notFound();
        }
        var tutor = offering.getTutorReference();
        if (tutor.getReviewStatus() != TutorReviewStatus.APPROVED
                || tutor.getAccount().getStatus() != AccountStatus.ACTIVE) {
            throw notFound();
        }
        Long remainingSeats = offering.getCapacity() == null ? null
                : Math.max(0L, offering.getCapacity() - enrollments.countOccupiedSeats(id, Instant.now()));
        boolean closed = offering.getStatus() == OfferingStatus.CLOSED;
        boolean full = remainingSeats != null && remainingSeats == 0;
        String message = closed ? "Lớp đã đóng đăng ký" : full ? "Lớp đã đủ chỗ" : "Có thể đăng ký";
        var schedule = timeSlots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id).stream()
                .map(TimeSlot::from)
                .toList();
        return OfferingDetail.from(offering, remainingSeats, schedule, !closed && !full, message);
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học công khai");
    }
}
