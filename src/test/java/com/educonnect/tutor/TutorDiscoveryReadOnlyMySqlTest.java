package com.educonnect.tutor;

import com.educonnect.config.DBConnect;
import com.educonnect.tutor.dto.TutorSearchRequest;
import com.educonnect.tutor.repository.TutorDiscoveryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.datasource.AbstractDataSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/** Opt-in: đối chiếu HQL với SQL độc lập trên dữ liệu hiện có; chỉ đọc, không migrate/seed. */
@DataJpaTest(showSql = false, properties = {"spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=validate"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("db-dev")
@Import({TutorDiscoveryRepository.class, TutorDiscoveryReadOnlyMySqlTest.Database.class})
@EnabledIfEnvironmentVariable(named = "EDUCONNECT_DISCOVERY_READ_TESTS", matches = "true")
@Transactional(readOnly = true)
class TutorDiscoveryReadOnlyMySqlTest {
    @TestConfiguration
    static class Database {
        @Bean DataSource dataSource() {
            return new AbstractDataSource() {
                @Override public Connection getConnection() throws SQLException {
                    try {
                        Connection connection = DBConnect.getConnection();
                        connection.setReadOnly(true);
                        return connection;
                    } catch (java.io.IOException error) {
                        throw new SQLException("Không đọc được cấu hình database local.", error);
                    }
                }
                @Override public Connection getConnection(String user, String password) throws SQLException {
                    return getConnection();
                }
            };
        }
    }

    private static final String PUBLIC = " from offerings o join tutor_profiles t on t.user_id=o.tutor_id"
            + " join user_accounts a on a.id=t.user_id where o.status='PUBLISHED'"
            + " and t.review_status='APPROVED' and a.status='ACTIVE' and a.email_verified_at is not null";
    record Expected(Long id, BigDecimal price, long offerings) {}
    @Autowired TutorDiscoveryRepository repository;
    @Autowired DataSource dataSource;

    private List<Long> grades() {
        var result = new NamedParameterJdbcTemplate(dataSource).queryForList(
                "select distinct o.grade_level_id" + PUBLIC + " order by o.grade_level_id",
                new MapSqlParameterSource(), Long.class);
        assumeTrue(result.size() >= 2, "Cần dữ liệu công khai cho ít nhất hai cấp để kiểm tra AND.");
        return result;
    }

    private List<Expected> expected(TutorSearchRequest request) {
        var params = new MapSqlParameterSource();
        String where = PUBLIC;
        var grades = request.getGradeLevelIds().stream().distinct().toList();
        if (!grades.isEmpty()) {
            where += " and o.grade_level_id in (:grades)";
            params.addValue("grades", grades);
        }
        if (request.getSubjectId() != null) {
            where += " and o.subject_id=:subject";
            params.addValue("subject", request.getSubjectId());
        }
        if (request.getMinPrice() != null) {
            where += " and o.unit_price>=:price";
            params.addValue("price", request.getMinPrice());
        }
        String having = grades.isEmpty() ? "" : " having count(distinct o.grade_level_id)=:required";
        if (!grades.isEmpty()) params.addValue("required", grades.size());
        String order = switch (request.getSort()) {
            case "price-asc" -> "min(o.unit_price) asc, o.tutor_id asc";
            case "price-desc" -> "min(o.unit_price) desc, o.tutor_id asc";
            default -> "lower(a.display_name) asc, o.tutor_id asc";
        };
        return new NamedParameterJdbcTemplate(dataSource).query(
                "select o.tutor_id, min(o.unit_price) price, count(*) offerings" + where
                        + " group by o.tutor_id, a.display_name" + having + " order by " + order,
                params, (rs, row) -> new Expected(rs.getLong("tutor_id"), rs.getBigDecimal("price"), rs.getLong("offerings")));
    }

    private void assertMatches(TutorSearchRequest request) {
        var expected = expected(request);
        var actual = repository.search(request);
        assertEquals(expected.size(), actual.getTotalElements());
        int from = Math.min(request.getPage() * request.getSize(), expected.size());
        int to = Math.min(from + request.getSize(), expected.size());
        assertEquals(expected.subList(from, to), actual.getContent().stream()
                .map(card -> new Expected(card.id(), card.priceFrom(), card.offeringCount())).toList());
    }

    @Test void requiresEverySelectedGradeAndCountsBeforePagination() {
        var grades = grades();
        for (int i = 0; i < grades.size(); i++) {
            for (int j = i + 1; j < grades.size(); j++) {
                var request = new TutorSearchRequest();
                request.setGradeLevelIds(List.of(grades.get(i), grades.get(j)));
                request.setSize(1);
                assertMatches(request);
                request.setPage(1);
                assertMatches(request);
            }
        }
    }

    @Test void otherFiltersMustMatchForEveryGradeAndAllSortsStillWork() {
        var grades = grades();
        var subjects = new NamedParameterJdbcTemplate(dataSource).queryForList(
                "select distinct o.subject_id" + PUBLIC, new MapSqlParameterSource(), Long.class);
        for (Long subject : subjects) {
            var request = new TutorSearchRequest();
            request.setGradeLevelIds(grades);
            request.setSubjectId(subject);
            request.setMinPrice(new BigDecimal("150000"));
            for (String sort : List.of("name", "price-asc", "price-desc")) {
                request.setSort(sort);
                assertMatches(request);
            }
        }
    }

    @Test void singleNoDuplicateAndUnknownGradesHaveConsistentResults() {
        var grades = grades();
        var request = new TutorSearchRequest();
        assertMatches(request);
        request.setGradeLevelIds(List.of(grades.get(0)));
        assertMatches(request);
        request.setGradeLevelIds(List.of(grades.get(0), grades.get(1), grades.get(0)));
        assertMatches(request);
        var withUnknown = new ArrayList<>(grades);
        withUnknown.add(Long.MAX_VALUE);
        request.setGradeLevelIds(withUnknown);
        assertMatches(request);
        assertEquals(0, repository.search(request).getTotalElements());
    }
}
