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
        String linkedEntity = switch (entityName) {
            case "Subject" -> "TutorSubject";
            case "GradeLevel" -> "TutorGradeLevel";
            default -> null;
        };
        String query = "select new com.educonnect.lesson.dto.OfferingOptionResponse(r.id, r.name) from "
                + entityName + " r";
        if (linkedEntity == null) {
            return entityManager.createQuery(query + " order by r.name", OfferingOptionResponse.class).getResultList();
        }
        String field = entityName.equals("Subject") ? "subjectId" : "gradeLevelId";
        query += " where r.createdBy is null"
                + " or exists (select x.id from " + linkedEntity + " x join x.tutorReference t join t.account a"
                + " where x.id." + field + " = r.id and " + PUBLIC_TUTOR + ")"
                + " or exists (select o.id from Offering o join o.tutorReference t join t.account a"
                + PUBLIC + " and o." + field + " = r.id) order by r.name";
        TypedQuery<OfferingOptionResponse> options = entityManager.createQuery(query, OfferingOptionResponse.class);
        bind(options, publicParameters());
        return options.getResultList();
    }
    private static final String FROM = " from Offering o join o.tutorReference t join t.account a"
            + " join o.subjectReference subject ";
    private static final String PUBLIC_TUTOR = "t.reviewStatus = :approved"
            + " and a.status = :active and a.emailVerifiedAt is not null";
    private static final String PUBLIC = " where o.status = :published and " + PUBLIC_TUTOR + " ";

    private final EntityManager entityManager;

    public TutorDiscoveryRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /** Cùng một bộ điều kiện cho count và data; lọc/sắp xếp tại DB trước khi phân trang. */
    public Page<TutorCardResponse> search(TutorSearchRequest request) {
        Map<String, Object> parameters = publicParameters();
        StringBuilder where = new StringBuilder(" where " + PUBLIC_TUTOR + " ");
        String from = " from TutorProfile t join t.account a left join Offering o"
                + " on o.tutorId = t.userId and o.status = :published ";
        appendFilters(request, "o", where, parameters);
        appendGradeFilters(request, where, parameters);

        String selection = "select new com.educonnect.tutor.dto.TutorCardResponse("
                + "t.userId, a.displayName, t.headline, t.experienceYears, min(o.unitPrice), count(o.id))";
        String grouping = " group by t.userId, a.displayName, t.headline, t.experienceYears ";
        String order = switch (request.getSort()) {
            case "price-asc" -> "case when min(o.unitPrice) is null then 1 else 0 end, min(o.unitPrice) asc, t.userId asc";
            case "price-desc" -> "case when min(o.unitPrice) is null then 1 else 0 end, min(o.unitPrice) desc, t.userId asc";
            case "name" -> "lower(a.displayName) asc, t.userId asc";
            default -> throw new IllegalArgumentException("Tiêu chí sắp xếp chưa được hỗ trợ.");
        };
        TypedQuery<TutorCardResponse> data = entityManager.createQuery(
                selection + from + where + grouping + " order by " + order, TutorCardResponse.class);
        String countQuery = "select count(distinct t.userId)" + from + where;
        TypedQuery<Long> count = entityManager.createQuery(
                countQuery, Long.class);
        bind(data, parameters);
        bind(count, parameters);
        long total = count.getSingleResult();
        data.setFirstResult(request.getPage() * request.getSize());
        data.setMaxResults(request.getSize());
        return new PageImpl<>(data.getResultList(), PageRequest.of(request.getPage(), request.getSize()), total);
    }

    /** Các điều kiện liên quan đến gói luôn dùng cùng một Offering PUBLISHED. */
    private void appendFilters(TutorSearchRequest request, String offering,
                               StringBuilder where, Map<String, Object> parameters) {
        if (!request.getQ().isBlank()) {
            where.append(" and (lower(a.displayName) like :q escape '!' or lower(t.headline) like :q escape '!'"
                    + " or lower(a.bio) like :q escape '!'"
                    + " or exists (select ts.id from TutorSubject ts where ts.id.tutorId = t.userId and lower(ts.subjectReference.name) like :q escape '!')"
                    + " or exists (select tg.id from TutorGradeLevel tg where tg.id.tutorId = t.userId and lower(tg.gradeLevelReference.name) like :q escape '!')"
                    + " or exists (select ta.id from TutorArea ta where ta.id.tutorId = t.userId and lower(ta.areaReference.name) like :q escape '!')"
                    + " or exists (select tm.id from TutorDeliveryMode tm where tm.id.tutorId = t.userId and lower(tm.deliveryModeReference.name) like :q escape '!')"
                    + " or exists (select oq.id from Offering oq where oq.id = " + offering + ".id and ("
                    + "lower(oq.title) like :q escape '!' or lower(oq.subjectReference.name) like :q escape '!'"
                    + " or lower(oq.gradeLevelReference.name) like :q escape '!' or lower(oq.areaReference.name) like :q escape '!'"
                    + " or lower(oq.deliveryModeReference.name) like :q escape '!'))) ");
            String text = request.getQ().toLowerCase(java.util.Locale.ROOT)
                    .replace("!", "!!")
                    .replace("%", "!%")
                    .replace("_", "!_");
            parameters.put("q", "%" + text + "%");
        }
        addFilter(where, parameters, "(" + offering + ".subjectId = :subjectId or exists (select ts.id from TutorSubject ts where ts.id.tutorId = t.userId and ts.id.subjectId = :subjectId))", "subjectId", request.getSubjectId());
        addFilter(where, parameters, "(" + offering + ".areaId = :areaId or exists (select ta.id from TutorArea ta where ta.id.tutorId = t.userId and ta.id.areaId = :areaId))", "areaId", request.getAreaId());
        addFilter(where, parameters, "(" + offering + ".deliveryModeId = :modeId or exists (select tm.id from TutorDeliveryMode tm where tm.id.tutorId = t.userId and tm.id.deliveryModeId = :modeId))", "modeId", request.getDeliveryModeId());
        addFilter(where, parameters, offering + ".offeringType = :type", "type", request.getOfferingType());
        addFilter(where, parameters, offering + ".unitPrice >= :minPrice", "minPrice", request.getMinPrice());
        addFilter(where, parameters, offering + ".unitPrice <= :maxPrice", "maxPrice", request.getMaxPrice());

        // Múi giờ mặc định trên form không tự kích hoạt bộ lọc lịch học.
        if (!request.getWeekdays().isEmpty() || request.getStartTime() != null || request.getEndTime() != null) {
            where.append(" and exists (select s.id from OfferingTimeSlot s where s.offeringId = " + offering + ".id ");
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

    /** Giữ ngữ nghĩa đủ mọi cấp đã chọn, có thể kết hợp cấp từ hồ sơ và các gói phù hợp. */
    private void appendGradeFilters(TutorSearchRequest request, StringBuilder where, Map<String, Object> parameters) {
        List<Long> grades = request.getGradeLevelIds().stream().distinct().toList();
        if (grades.isEmpty()) return;
        addFilter(where, parameters, "(o.gradeLevelId in :grades or exists (select tg.id from TutorGradeLevel tg"
                + " where tg.id.tutorId = t.userId and tg.id.gradeLevelId in :grades))", "grades", grades);
        if (grades.size() == 1) return;
        for (int i = 0; i < grades.size(); i++) {
            String parameter = "grade" + i;
            where.append(" and (exists (select tg.id from TutorGradeLevel tg where tg.id.tutorId = t.userId"
                    + " and tg.id.gradeLevelId = :" + parameter + ")"
                    + " or exists (select go.id from Offering go where go.tutorId = t.userId"
                    + " and go.status = :published and go.gradeLevelId = :" + parameter);
            appendFilters(request, "go", where, parameters);
            where.append(")) ");
            parameters.put(parameter, grades.get(i));
        }
    }

    /** Chỉ trả hồ sơ có trạng thái được phép công khai; dùng list optional để tránh bắt ngoại lệ */
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
            where.append(" and not exists (select s.id from ContractSession s, Contract c where s.contractId = c.id"
                    + " and c.orderItemReference.registrationSourceReference.offeringId = o.id and s.attendedAt is not null)"
                    + " and (case when o.offeringType = :service then 1 else o.capacity end) >"
                    + " (select coalesce(sum(e.seatCount), 0) from Enrollment e where e.offeringId = o.id"
                    + " and (e.status in :occupied or (e.status = :reserved and e.reservedUntil > :now))) ");
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
        long total = count.getSingleResult(); //thực thi truy vấn và trả về long
        data.setFirstResult(page * size);
        data.setMaxResults(size);
        return new PageImpl<>(data.getResultList(), PageRequest.of(page, size), total); //quan trọng thực hiện trả về trang, tổng page, max dịch vụ 1 trang là bn
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
