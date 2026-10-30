package com.educonnect.tutor.repository;

import com.educonnect.lesson.dto.OfferingOptionResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;

import com.educonnect.lesson.domain.EnrollmentStatus;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.domain.OfferingType;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.tutor.domain.TutorReviewStatus;
import com.educonnect.tutor.dto.TutorCardResponse;
import com.educonnect.tutor.dto.TutorSearchRequest;
import com.educonnect.user.domain.AccountStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Tác giả: Trường Đạt. DAT-02: query đọc trên mapping hiện có, không tạo JpaRepository trùng. */
@Repository
@Profile("db-dev")
public class TutorDiscoveryRepository {
    /** Danh sách danh mục chỉ đọc; tên Entity là hằng nội bộ, không nhận từ request. */
    public OfferingOptionsResponse options() {
        return new OfferingOptionsResponse(options("Subject"), options("GradeLevel"), options("Area"), options("DeliveryMode"));
    }

    private List<OfferingOptionResponse> options(String entityName) {
        return entityManager.createQuery("select new com.educonnect.lesson.dto.OfferingOptionResponse(r.id, r.name) from "
                + entityName + " r order by r.name", OfferingOptionResponse.class).getResultList();
    }
    private static final String FROM = " from Offering o join o.tutorReference t join t.account a"
            + " join o.subjectReference subject ";
    private static final String PUBLIC = " where o.status = :published and t.reviewStatus = :approved"
            + " and a.status = :active and a.emailVerifiedAt is not null ";

    private final EntityManager entityManager;

    public TutorDiscoveryRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /** Cùng một bộ điều kiện cho count và data; lọc/sắp xếp tại DB trước khi phân trang. */
    public Page<TutorCardResponse> search(TutorSearchRequest request) {
        Map<String, Object> parameters = publicParameters();
        StringBuilder where = new StringBuilder(PUBLIC);
        appendFilters(request, where, parameters);

        String selection = "select new com.educonnect.tutor.dto.TutorCardResponse("
                + "t.userId, a.displayName, t.headline, t.experienceYears, min(o.unitPrice), count(o.id))";
        String grouping = " group by t.userId, a.displayName, t.headline, t.experienceYears ";
        String order = switch (request.getSort()) {
            case "price-asc" -> "min(o.unitPrice) asc, t.userId asc";
            case "price-desc" -> "min(o.unitPrice) desc, t.userId asc";
            case "name" -> "lower(a.displayName) asc, t.userId asc";
            default -> throw new IllegalArgumentException("Tiêu chí sắp xếp chưa được hỗ trợ.");
        };
        TypedQuery<TutorCardResponse> data = entityManager.createQuery(
                selection + FROM + where + grouping + " order by " + order, TutorCardResponse.class);
        TypedQuery<Long> count = entityManager.createQuery(
                "select count(distinct t.userId)" + FROM + where, Long.class);
        bind(data, parameters);
        bind(count, parameters);
        long total = count.getSingleResult();
        data.setFirstResult(request.getPage() * request.getSize());
        data.setMaxResults(request.getSize());
        return new PageImpl<>(data.getResultList(), PageRequest.of(request.getPage(), request.getSize()), total);
    }

    private void appendFilters(TutorSearchRequest request, StringBuilder where, Map<String, Object> parameters) {
        if (!request.getQ().isBlank()) {
            where.append(" and (lower(a.displayName) like :q escape '!' or lower(t.headline) like :q escape '!'"
                    + " or lower(o.title) like :q escape '!' or lower(subject.name) like :q escape '!') ");
            String text = request.getQ().toLowerCase(java.util.Locale.ROOT)
                    .replace("!", "!!").replace("%", "!%").replace("_", "!_");
            parameters.put("q", "%" + text + "%");
        }
        addFilter(where, parameters, "o.subjectId = :subjectId", "subjectId", request.getSubjectId());
        if (!request.getGradeLevelIds().isEmpty()) {
            addFilter(where, parameters, "o.gradeLevelId in :grades", "grades", request.getGradeLevelIds());
        }
        addFilter(where, parameters, "o.areaId = :areaId", "areaId", request.getAreaId());
        addFilter(where, parameters, "o.deliveryModeId = :modeId", "modeId", request.getDeliveryModeId());
        addFilter(where, parameters, "o.offeringType = :type", "type", request.getOfferingType());
        addFilter(where, parameters, "o.unitPrice >= :minPrice", "minPrice", request.getMinPrice());
        addFilter(where, parameters, "o.unitPrice <= :maxPrice", "maxPrice", request.getMaxPrice());

        if (!request.getWeekdays().isEmpty() || request.getStartTime() != null || request.getTimeZone() != null) {
            where.append(" and exists (select s.id from OfferingTimeSlot s where s.offeringId = o.id ");
            if (!request.getWeekdays().isEmpty()) {
                List<Byte> days = new ArrayList<>();
                for (Integer day : request.getWeekdays()) {
                    days.add(day.byteValue());
                }
                addFilter(where, parameters, "s.weekday in :days", "days", days);
            }
            addFilter(where, parameters, "s.startTime >= :startTime", "startTime", request.getStartTime());
            addFilter(where, parameters, "s.endTime <= :endTime", "endTime", request.getEndTime());
            addFilter(where, parameters, "s.timeZone = :timeZone", "timeZone", request.getTimeZone());
            where.append(") ");
        }
    }

    /** Chỉ trả hồ sơ có trạng thái được phép công khai; không lấy email/điện thoại/minh chứng ra DTO. */
    public Optional<TutorProfile> publicProfile(Long id) {
        List<TutorProfile> result = entityManager.createQuery("""
                select t from TutorProfile t join fetch t.account a
                where t.userId = :id and t.reviewStatus = :approved
                  and a.status = :active and a.emailVerifiedAt is not null
                """, TutorProfile.class)
                .setParameter("id", id)
                .setParameter("approved", TutorReviewStatus.APPROVED)
                .setParameter("active", AccountStatus.ACTIVE)
                .getResultList();
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    /** Danh sách công khai theo ID ổn định; cách sắp xếp mới nhất sẽ nối sau khi chốt Q10. */
    public Page<Offering> publicOfferings(Long tutorId, int page, int size, boolean availableOnly) {
        Map<String, Object> parameters = publicParameters();
        StringBuilder where = new StringBuilder(PUBLIC);
        addFilter(where, parameters, "o.tutorId = :tutorId", "tutorId", tutorId);
        if (availableOnly) {
            where.append(" and (o.offeringType = :service or o.capacity >"
                    + " (select coalesce(sum(e.seatCount), 0) from Enrollment e where e.offeringId = o.id"
                    + " and (e.status in :occupied or (e.status = :reserved and e.reservedUntil > :now)))) ");
            parameters.put("service", OfferingType.SERVICE);
            parameters.put("occupied", List.of(EnrollmentStatus.CONFIRMED, EnrollmentStatus.COMPLETED));
            parameters.put("reserved", EnrollmentStatus.RESERVED);
            parameters.put("now", Instant.now());
        }
        String fetch = " from Offering o join fetch o.tutorReference t join fetch t.account a"
                + " join fetch o.subjectReference join fetch o.gradeLevelReference"
                + " join fetch o.areaReference join fetch o.deliveryModeReference ";
        TypedQuery<Offering> data = entityManager.createQuery("select o" + fetch + where
                + " order by o.id desc", Offering.class);
        TypedQuery<Long> count = entityManager.createQuery("select count(o.id)" + FROM + where, Long.class);
        bind(data, parameters);
        bind(count, parameters);
        long total = count.getSingleResult();
        data.setFirstResult(page * size);
        data.setMaxResults(size);
        return new PageImpl<>(data.getResultList(), PageRequest.of(page, size), total);
    }

    private Map<String, Object> publicParameters() {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("published", OfferingStatus.PUBLISHED);
        parameters.put("approved", TutorReviewStatus.APPROVED);
        parameters.put("active", AccountStatus.ACTIVE);
        return parameters;
    }

    private void addFilter(StringBuilder where, Map<String, Object> parameters,
                           String condition, String name, Object value) {
        if (value != null) {
            where.append(" and ").append(condition).append(' ');
            parameters.put(name, value);
        }
    }

    private void bind(TypedQuery<?> query, Map<String, Object> parameters) {
        for (Map.Entry<String, Object> parameter : parameters.entrySet()) {
            query.setParameter(parameter.getKey(), parameter.getValue());
        }
    }
}
