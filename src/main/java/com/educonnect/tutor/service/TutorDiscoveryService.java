package com.educonnect.tutor.service;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.dto.OfferingCardResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.lesson.service.OfferingProblem;
import com.educonnect.tutor.dto.TutorCardResponse;
import com.educonnect.tutor.dto.TutorProfileResponse;
import com.educonnect.tutor.dto.TutorSearchRequest;
import com.educonnect.tutor.dto.TutorSearchResponse;
import com.educonnect.tutor.repository.TutorDiscoveryRepository;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/** Tác giả: Trường Đạt. DAT-02: chuẩn bị dữ liệu thật cho home/search/profile. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class TutorDiscoveryService {
    private final TutorDiscoveryRepository repository;
    private final Validator validator;

    public TutorDiscoveryService(TutorDiscoveryRepository repository, Validator validator) {
        this.repository = repository;
        this.validator = validator;
    }

    /** Danh mục thật dùng để render bộ lọc công khai. */
    public OfferingOptionsResponse options() { return repository.options(); }

    /** Tác giả: Trường Đạt. /tutor/search: các điều kiện phải khớp trên cùng dịch vụ của gia sư. */
    public TutorSearchResponse search(TutorSearchRequest request) {
        if (request == null) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Thiếu điều kiện tìm kiếm.");
        }
        var errors = validator.validate(request);
        if (!errors.isEmpty()) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, errors.iterator().next().getMessage());
        }
        Page<TutorCardResponse> page = repository.search(request);
        return new TutorSearchResponse(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.hasPrevious(), page.hasNext());
    }

    /** Tác giả: Trường Đạt. /home: tối đa 6 dịch vụ còn nhận đăng ký; chưa đổi mốc công khai Q10. */
    public List<OfferingCardResponse> homeOfferings() {
        return cards(repository.publicOfferings(null, 0, 8, true)).getContent();
    }

    /** Tác giả: Trường Đạt. /tutor/profile: DTO hồ sơ và dịch vụ công khai để render view. */
    public TutorProfileResponse profile(Long id, int page, int size) {
        if (id == null || id < 1 || page < 0 || page > 100000 || size < 1 || size > 48) {
            throw new OfferingProblem(HttpStatus.BAD_REQUEST, "Mã gia sư hoặc số trang không hợp lệ.");
        }
        var tutor = repository.publicProfile(id).orElseThrow(() -> new OfferingProblem(
                HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ gia sư công khai."));
        return new TutorProfileResponse(tutor.getUserId(), tutor.getAccount().getDisplayName(),
                tutor.getHeadline(), tutor.getExperienceYears(), cards(repository.publicOfferings(id, page, size, false)));
    }

    /** Tác giả: Trường Đạt. Chuyển Entity sang DTO công khai trong transaction đọc của DAT-02. */
    private Page<OfferingCardResponse> cards(Page<Offering> offerings) {
        List<OfferingCardResponse> cards = new ArrayList<>();
        for (Offering offering : offerings.getContent()) {
            cards.add(OfferingCardResponse.from(offering));
        }
        return new PageImpl<>(cards, offerings.getPageable(), offerings.getTotalElements());
    }
}
