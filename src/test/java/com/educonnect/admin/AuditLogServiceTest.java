package com.educonnect.admin;

import com.educonnect.admin.dto.AuditLogDTO;
import com.educonnect.admin.service.AuditLogService;
import com.educonnect.admin.web.AuditLogsPageController;
import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.service.AccountGuard;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.ui.ExtendedModelMap;

import java.sql.ResultSet;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuditLogServiceTest {
    private AccountGuard guard;
    private JdbcTemplate jdbc;
    private AuditLogService service;
    private AccountPrincipal admin;

    @BeforeEach
    void setUp() {
        guard = mock(AccountGuard.class);
        jdbc = mock(JdbcTemplate.class);
        service = new AuditLogService(guard, jdbc, new ObjectMapper());
        admin = new AccountPrincipal(new UserAccount(
                1L, "admin@educonnect.test", "{noop}pw", "Quản trị viên", "ACTIVE", true, 0L, Set.of("ADMIN")));
    }

    @Test
    void sanitizesSensitiveMetadataRecursively() {
        Map<String, Object> raw = new LinkedHashMap<>();
        raw.put("previousStatus", "ACTIVE");
        raw.put("newStatus", "LOCKED");
        raw.put("reason", "Tài khoản vi phạm quy chế");
        raw.put("password", "PlainSecret123");
        raw.put("password_hash", "{bcrypt}$2a$10$secret");
        raw.put("resetToken", "tok-987654");
        raw.put("session_id", "sess-abc");
        raw.put("nested", Map.of(
                "otpCode", "123456",
                "bank_account", "970400001234",
                "offeringCode", "OFF-0001"));
        raw.put("items", List.of(Map.of("apiSecret", "top-secret", "label", "public-ok")));

        Map<String, Object> sanitized = AuditLogService.sanitizeMetadata(raw);

        assertEquals("ACTIVE", sanitized.get("previousStatus"));
        assertEquals("LOCKED", sanitized.get("newStatus"));
        assertEquals("Tài khoản vi phạm quy chế", sanitized.get("reason"));
        assertEquals(AuditLogService.REDACTED_VALUE, sanitized.get("password"));
        assertEquals(AuditLogService.REDACTED_VALUE, sanitized.get("password_hash"));
        assertEquals(AuditLogService.REDACTED_VALUE, sanitized.get("resetToken"));
        assertEquals(AuditLogService.REDACTED_VALUE, sanitized.get("session_id"));

        @SuppressWarnings("unchecked")
        Map<String, Object> nested = (Map<String, Object>) sanitized.get("nested");
        assertEquals(AuditLogService.REDACTED_VALUE, nested.get("otpCode"));
        assertEquals(AuditLogService.REDACTED_VALUE, nested.get("bank_account"));
        assertEquals("OFF-0001", nested.get("offeringCode"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) sanitized.get("items");
        assertEquals(AuditLogService.REDACTED_VALUE, items.get(0).get("apiSecret"));
        assertEquals("public-ok", items.get(0).get("label"));
    }

    @Test
    void validatesFilterParametersAndRequiresAdminRole() {
        AccountPrincipal learner = new AccountPrincipal(new UserAccount(
                2L, "learner@educonnect.test", "{noop}pw", "Học viên", "ACTIVE", true, 0L, Set.of("LEARNER")));
        doThrow(ServiceProblem.forbidden("Bạn không có quyền thực hiện thao tác này."))
                .when(guard).require(learner, "ADMIN");

        ServiceProblem forbidden = assertThrows(ServiceProblem.class,
                () -> service.load(learner, "all", null, "all", "all", null, null, "newest", 0));
        assertEquals(403, forbidden.getStatus().value());

        ServiceProblem tooLong = assertThrows(ServiceProblem.class,
                () -> service.load(admin, "all", "a".repeat(101), "all", "all", null, null, "newest", 0));
        assertEquals(400, tooLong.getStatus().value());

        ServiceProblem badRange = assertThrows(ServiceProblem.class,
                () -> service.load(admin, "all", null, "all", "custom", "2026-10-15", "2026-10-01", "newest", 0));
        assertEquals(400, badRange.getStatus().value());

        ServiceProblem badDate = assertThrows(ServiceProblem.class,
                () -> service.load(admin, "all", null, "all", "custom", "not-a-date", null, "newest", 0));
        assertEquals(400, badDate.getStatus().value());
    }

    @Test
    @SuppressWarnings("unchecked")
    void loadsAndFormatsAuditRowsAndControllerHandlesInvalidParams() throws Exception {
        when(jdbc.queryForObject(anyString(), eq(Long.class), any(Object[].class))).thenReturn(1L);
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenAnswer(inv -> {
            RowMapper<AuditLogDTO.Row> mapper = inv.getArgument(1);
            ResultSet rs = mock(ResultSet.class);
            when(rs.getLong("id")).thenReturn(42L);
            when(rs.getObject("actor_user_id")).thenReturn(1L);
            when(rs.getString("actor_code")).thenReturn("USR-ADMIN-01");
            when(rs.getString("actor_name")).thenReturn("Nguyễn Quản Trị");
            when(rs.getString("actor_email")).thenReturn("admin@educonnect.test");
            when(rs.getString("actor_role")).thenReturn("ADMIN");
            when(rs.getString("action_code")).thenReturn("OFFERING_REVIEW");
            when(rs.getObject("order_id")).thenReturn(null);
            when(rs.getObject("report_id")).thenReturn(null);
            when(rs.getObject("target_user_id")).thenReturn(9L);
            when(rs.getString("target_user_code")).thenReturn("USR-TUTOR-09");
            when(rs.getString("target_user_name")).thenReturn("Trần Gia Sư");
            when(rs.getString("metadata")).thenReturn(
                    "{\"offeringId\":15,\"offeringCode\":\"OFF-0015\",\"decision\":\"approve\",\"previousVersion\":1,\"resultingVersion\":2,\"token\":\"secret-tok\"}");
            when(rs.getObject("created_at", LocalDateTime.class))
                    .thenReturn(LocalDateTime.ofInstant(Instant.parse("2026-10-20T03:30:00Z"), ZoneOffset.UTC));
            return List.of(mapper.mapRow(rs, 0));
        });
        doAnswer(inv -> {
            RowCallbackHandler handler = inv.getArgument(1);
            ResultSet rs = mock(ResultSet.class);
            when(rs.getString("action_code")).thenReturn("OFFERING_REVIEW");
            when(rs.getLong("total")).thenReturn(1L);
            handler.processRow(rs);
            return null;
        }).when(jdbc).query(eq("SELECT action_code, COUNT(*) AS total FROM audit_logs GROUP BY action_code"), any(RowCallbackHandler.class));

        AuditLogsPageController controller = new AuditLogsPageController(service);
        ExtendedModelMap model = new ExtendedModelMap();
        MockHttpServletResponse response = new MockHttpServletResponse();

        String view = controller.auditLogs(admin, "offering", null, "OFF-0015", null, "admin", "all", null, null, null, null, "newest", 0, model, response);
        assertEquals("pages/admin/audit-logs", view);
        assertEquals(200, response.getStatus());

        AuditLogDTO dto = (AuditLogDTO) model.get("logs");
        assertNotNull(dto);
        assertEquals(1L, dto.total());
        assertEquals(1L, dto.count("offering"));
        AuditLogDTO.Row row = dto.rows().get(0);
        assertEquals("AUD-0042", row.refCode());
        assertEquals("/admin/offering-review-detail?id=15", row.targetHref());
        assertTrue(row.summary().contains("Đã duyệt (v1 → v2)"));
        assertFalse(row.sanitizedJson().contains("secret-tok"));
        assertTrue(row.sanitizedJson().contains(AuditLogService.REDACTED_VALUE));
    }
}
