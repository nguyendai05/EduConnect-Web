package com.educonnect.lesson.service;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.lesson.domain.OfferingTimeSlot;
import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.dto.OfferingCardResponse;
import com.educonnect.lesson.dto.OfferingDetailResponse;
import com.educonnect.lesson.dto.OfferingTimeSlotResponse;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import java.util.ArrayList;
import java.util.List;

/** Tác giả: Trường Đạt. DAT-01: dữ liệu công khai cho catalog và đầu vào giao dịch của Huy. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class CatalogService {
    private final OfferingJpaRepository offerings;
    private final OfferingTimeSlotJpaRepository slots;
    private final EnrollmentJpaRepository enrollments;

    public CatalogService(OfferingJpaRepository offerings, OfferingTimeSlotJpaRepository slots,
                          EnrollmentJpaRepository enrollments) {
        this.offerings = offerings;
        this.slots = slots;
        this.enrollments = enrollments;
    }

    /** Tác giả: Trường Đạt. Đọc danh sách công khai; Entity chỉ dùng bên trong backend. */
    public Page<Offering> list(int page) {
        return offerings.findPublicPage(
                OfferingStatus.PUBLISHED, TutorReviewStatus.APPROVED, AccountStatus.ACTIVE,
                PageRequest.of(Math.max(0, page), 12, Sort.by("id").descending()));
    }

    /** Tác giả: Trường Đạt. Kiểm công khai khi catalog/giỏ/hợp đồng đọc một dịch vụ. */
    public Offering getPublicOffering(Long id) {
        Offering offering = offerings.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dịch vụ hoặc lớp học"));
        if (!isPublic(offering)) {
            throw new IllegalArgumentException("Dịch vụ hoặc lớp học chưa được công khai");
        }
        return offering;
    }

    /** Tác giả: Trường Đạt. Danh sách DTO cho /catalog/detail khi chưa chọn dịch vụ. */
    public Page<OfferingCardResponse> publicPage(int page) {
        if (page < 0 || page > 100000) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Số trang không hợp lệ.");
        }
        Page<Offering> result = list(page);
        List<OfferingCardResponse> cards = new ArrayList<>();
        for (Offering offering : result.getContent()) {
            cards.add(OfferingCardResponse.from(offering));
        }
        return new PageImpl<>(cards, result.getPageable(), result.getTotalElements());
    }

    /** Tác giả: Trường Đạt. Nạp chi tiết và số chỗ tham khảo trong cùng giao dịch đọc. */
    public OfferingDetailResponse detail(Long id) {
        if (id == null || id < 1) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Mã dịch vụ/lớp không hợp lệ.");
        }
        Offering offering;
        try {
            offering = getPublicOffering(id);
        } catch (IllegalArgumentException missing) {
            throw new OfferingProblem(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ/lớp được công khai.");
        }
        List<OfferingTimeSlotResponse> schedule = new ArrayList<>();
        for (OfferingTimeSlot slot : getSchedule(id)) {
            schedule.add(new OfferingTimeSlotResponse(slot.getWeekday(), slot.getStartTime(),
                    slot.getEndTime(), slot.getTimeZone()));
        }
        long remaining = availableSeats(offering);
        String issue = null;
        if (offering.getStatus() != OfferingStatus.PUBLISHED) {
            issue = "Dịch vụ/lớp đã đóng và không nhận đăng ký mới.";
        } else if (remaining == 0) {
            issue = "Lớp đã hết chỗ đăng ký.";
        }
        return new OfferingDetailResponse(OfferingCardResponse.from(offering), offering.getDescription(),
                offering.getTermsText(), offering.getTermsVersion(), offering.getCapacity(),
                offering.getStartsOn(), offering.getEndsOn(), schedule, remaining, issue);
    }

    /** Tác giả: Trường Đạt. Kiểm trạng thái dịch vụ, duyệt gia sư và tài khoản trước khi công khai. */
    public boolean isPublic(Offering offering) {
        return (offering.getStatus() == OfferingStatus.PUBLISHED || offering.getStatus() == OfferingStatus.CLOSED)
                && offering.getTutorReference().getReviewStatus() == TutorReviewStatus.APPROVED
                && offering.getTutorReference().getAccount().getStatus() == AccountStatus.ACTIVE
                && offering.getTutorReference().getAccount().getEmailVerifiedAt() != null;
    }

    /** Tác giả: Trường Đạt. Lịch của dịch vụ đã được kiểm quyền/công khai, sắp theo ngày và giờ. */
    public List<OfferingTimeSlot> getSchedule(Long id) {
        return slots.findByOfferingIdOrderByWeekdayAscStartTimeAsc(id);
    }

    /** Tác giả: Trường Đạt. Số chỗ tham khảo; không giữ/trả chỗ hoặc ghi Enrollment. */
    public long availableSeats(Offering offering) {
        if (offering.getOfferingType() == OfferingType.SERVICE) {
            return 1;
        }
        long occupied = enrollments.countSeats(offering.getId(),
                List.of(EnrollmentStatus.CONFIRMED, EnrollmentStatus.COMPLETED),
                EnrollmentStatus.RESERVED, Instant.now());
        return Math.max(0, offering.getCapacity() - occupied);
    }

    /** Tác giả: Trường Đạt. Kiểm điều kiện đăng ký; Huy kiểm lại trong transaction giao dịch. */
    public String registrationIssue(Offering offering, int seats) {
        if (!isPublic(offering) || offering.getStatus() != OfferingStatus.PUBLISHED) {
            return "Dịch vụ hoặc lớp học hiện không nhận đăng ký";
        }
        if (seats < 1) {
            return "Số chỗ phải lớn hơn 0";
        }
        if (offering.getOfferingType() == OfferingType.SERVICE && seats != 1) {
            return "Dịch vụ 1 kèm 1 chỉ đăng ký một chỗ";
        }
        if (seats > availableSeats(offering)) {
            return "Lớp không còn đủ chỗ theo lựa chọn";
        }
        return null;
    }
}
