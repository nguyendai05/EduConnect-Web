package com.educonnect.lesson;

import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.lesson.dto.OfferingOptionResponse;
import com.educonnect.lesson.dto.OfferingTimeSlotResponse;
import com.educonnect.lesson.domain.*;
import com.educonnect.lesson.dto.OfferingResponse;
import com.educonnect.lesson.service.*;
import com.educonnect.lesson.dto.OfferingRequest;
import com.educonnect.security.*;
import com.educonnect.tutor.web.TutorManagePageController;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.*;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TutorManagePageController.class)
@ActiveProfiles("db-dev")
@Import({DatabaseSecurityConfig.class, AccountUserDetailsService.class})
class TutorManageMvcTest {
    @Autowired MockMvc mvc;
    @MockitoBean TutorOfferingService service;
    @MockitoBean UserAccountRepository accounts;
    AccountPrincipal tutor;
    static final String KEY = "00000000-0000-4000-8000-000000000001";

    @BeforeEach void setup() {
        var account = new UserAccount(10L, "tutor@example.test", "{noop}test", "Gia sư Đạt", "ACTIVE", true, 0L, Set.of("TUTOR"));
        tutor = new AccountPrincipal(account); when(accounts.findById(10L)).thenReturn(Optional.of(account));
        var option = List.of(new OfferingOptionResponse(1L, "Toán"));
        when(service.options(any())).thenReturn(new OfferingOptionsResponse(option, option, option, option));
        when(service.list(any(), any(), any(), anyString())).thenReturn(List.of());
        when(service.save(any(), nullable(Long.class), any())).thenReturn(42L);
    }
    org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder validPost() {
        return post("/tutor/manage/offerings").with(user(tutor)).with(csrf())
                .param("requestKey", KEY).param("offeringType", "SERVICE").param("title", "Toán lớp 10")
                .param("description", "Nội dung học").param("subjectId", "1").param("gradeLevelId", "1")
                .param("areaId", "1").param("deliveryModeId", "1").param("unitPrice", "150000")
                .param("sessionCount", "12").param("durationMinutes", "90").param("termsText", "Điều khoản")
                .param("slots[0].weekday", "1").param("slots[0].startTime", "18:00")
                .param("slots[0].endTime", "19:30").param("slots[0].timeZone", "Asia/Ho_Chi_Minh");
    }

    @Test void authenticatedPageHasRealFormsCsrfAndContextPathWithoutDemo() throws Exception {
        mvc.perform(get("/edu/tutor/manage").contextPath("/edu").with(user(tutor)))
                .andExpect(status().isOk()).andExpect(content().string(containsString("action=\"/edu/tutor/manage/offerings\"")))
                .andExpect(content().string(containsString("name=\"_csrf\"")))
                .andExpect(content().string(not(containsString("/js/preview/"))))
                .andExpect(content().string(containsString("name=\"slots[0].weekday\"")));
    }
    @Test void recordsRenderEscapedWithServerActionsAndSchedule() throws Exception {
        var item = new OfferingResponse(42L, "OFF-42", "<script>alert(1)</script>", OfferingType.SERVICE,
                "Toán", "Lớp 10", "Hà Nội", "Trực tuyến", new BigDecimal("150000"), (short)12, (short)90,
                null, null, null, OfferingStatus.DRAFT, "Bản nháp", 1, 0L, null, true, true, true,
                List.of(new OfferingTimeSlotResponse(1, LocalTime.of(18, 0), LocalTime.of(19, 30), "Asia/Ho_Chi_Minh")),
                "Nội dung học theo mục tiêu của học viên", "Điều khoản dịch vụ đã thống nhất");
        when(service.list(any(), any(), any(), anyString())).thenReturn(List.of(item));
        mvc.perform(get("/tutor/manage").with(user(tutor))).andExpect(status().isOk())
                .andExpect(content().string(containsString("&lt;script&gt;")))
                .andExpect(content().string(containsString("/tutor/manage/offerings/42/status")))
                .andExpect(content().string(containsString("Thứ 2 18:00")))
                .andDo(result -> java.nio.file.Files.writeString(java.nio.file.Path.of("target/dat01-manage-qa.html"),
                        result.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8)));
    }
    @Test void anonymousLearnerAndMissingCsrfCannotWrite() throws Exception {
        mvc.perform(get("/tutor/manage")).andExpect(status().is3xxRedirection());
        mvc.perform(get("/tutor/manage").with(user("learner").roles("LEARNER"))).andExpect(status().isForbidden());
        mvc.perform(post("/tutor/manage/offerings").with(user(tutor))).andExpect(status().isForbidden());
        verify(service, never()).save(any(), any(), any());
    }
    @Test void validPostUsesPrincipalAndIgnoresForgedOwnerAndStatus() throws Exception {
        mvc.perform(validPost().param("tutorId", "999").param("status", "PUBLISHED").param("reviewedBy", "1"))
                .andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/tutor/manage"));
        verify(service).save(argThat(p -> p.getId().equals(10L)), isNull(), argThat(f -> f.getTitle().equals("Toán lớp 10")));
    }
    @Test void invalidFormReturnsErrorsAndPreservesInput() throws Exception {
        mvc.perform(validPost().with(request -> { request.setParameter("title", ""); request.setParameter("unitPrice", "-1"); return request; }))
                .andExpect(status().isBadRequest()).andExpect(model().attributeHasFieldErrors("offeringRequest", "title", "unitPrice"))
                .andExpect(content().string(containsString("Chưa lưu được")));
        verify(service, never()).save(any(), any(), any());
    }
    @Test void wrongOwnerAndStaleVersionRenderUsefulErrors() throws Exception {
        when(service.edit(any(), eq(99L))).thenThrow(new OfferingProblem(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ/lớp thuộc tài khoản của bạn."));
        mvc.perform(get("/tutor/manage").param("edit", "99").with(user(tutor)))
                .andExpect(status().isNotFound()).andExpect(content().string(containsString("Không tìm thấy dịch vụ/lớp")));
        doThrow(new OfferingProblem(HttpStatus.CONFLICT, "Dữ liệu đã thay đổi ở phiên khác."))
                .when(service).transition(any(), eq(42L), eq(0L), eq("close"));
        mvc.perform(post("/tutor/manage/offerings/42/status").with(user(tutor)).with(csrf()).param("version", "0").param("action", "close"))
                .andExpect(status().isConflict()).andExpect(content().string(containsString("Dữ liệu đã thay đổi")));
    }
    @Test void editedFormRendersTheExistingVersionAndWeeklySchedule() throws Exception {
        var form = TutorOfferingServiceTest.form(); form.setVersion(3L);
        when(service.edit(any(), eq(42L))).thenReturn(form);
        mvc.perform(get("/tutor/manage").param("edit", "42").with(user(tutor)))
                .andExpect(status().isOk()).andExpect(content().string(containsString("action=\"/tutor/manage/offerings/42\"")))
                .andExpect(content().string(containsString("name=\"version\" value=\"3\"")));
    }

    @Test void oversizedScheduleIndexIsRejectedWithoutServerError() throws Exception {
        mvc.perform(validPost().param("slots[14].weekday", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(model().attributeHasFieldErrors("offeringRequest", "slots"))
                .andExpect(content().string(containsString("tối đa 14 khung lịch")));
        mvc.perform(validPost().param("slots[100000].weekday", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Dữ liệu chưa hợp lệ")));
        verify(service, never()).save(any(), any(), any());
    }

    @Test void publishedEditExplainsReReviewAndServerDeterminesTheSuccessMessage() throws Exception {
        var form = TutorOfferingServiceTest.form(); form.setVersion(3L);
        when(service.edit(any(), eq(42L))).thenReturn(form);
        when(service.isPublished(any(), eq(42L))).thenReturn(true);
        mvc.perform(get("/tutor/manage").param("edit", "42").with(user(tutor)))
                .andExpect(status().isOk()).andExpect(content().string(containsString("Lưu và gửi duyệt lại")))
                .andExpect(content().string(containsString("dịch vụ sẽ tạm ngừng công khai")));
        mvc.perform(validPost().with(request -> {
                    request.setRequestURI("/tutor/manage/offerings/42");
                    request.setParameter("version", "3"); request.setParameter("publishedEdit", "false"); return request;
                }))
                .andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/tutor/manage"))
                .andExpect(flash().attribute("success", containsString("gửi duyệt lại")));
        verify(service).save(any(), eq(42L), argThat(input -> input.getVersion().equals(3L)));
    }

    @Test void filterDtoReceivesQueryTypeAndStatus() throws Exception {
        var result = mvc.perform(get("/tutor/manage").with(user(tutor))
                        .param("q", "Toán").param("type", "SERVICE").param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(model().attributeExists("filterRequest"))
                .andExpect(model().attribute("filterRequest", hasProperty("q", is("Toán"))))
                .andReturn();

        String html = org.springframework.web.util.HtmlUtils.htmlUnescape(
                result.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8)
        );
        org.junit.jupiter.api.Assertions.assertTrue(html.contains("value=\"Toán\""));

        verify(service).list(any(), eq(OfferingType.SERVICE), eq(OfferingStatus.DRAFT), eq("Toán"));
    }

    @Test void statusDtoRejectsMissingVersionInvalidTypesAndUnsupportedActions() throws Exception {
        for (String version : List.of("", "-1", "khong-phai-so")) {
            mvc.perform(post("/tutor/manage/offerings/42/status").with(user(tutor)).with(csrf())
                            .param("version", version).param("action", "close"))
                    .andExpect(status().isBadRequest())
                    .andExpect(model().attributeHasFieldErrors("statusRequest", "version"));
        }

        mvc.perform(post("/tutor/manage/offerings/42/status").with(user(tutor)).with(csrf())
                        .param("version", "3").param("action", "publish"))
                .andExpect(status().isBadRequest())
                .andExpect(model().attributeHasFieldErrors("statusRequest", "action"))
                .andExpect(content().string(containsString("Thao tác không được hỗ trợ")));

        verify(service, never()).transition(any(), any(), any(), any());
    }

    @Test void statusDtoPassesValidActionToService() throws Exception {
        mvc.perform(post("/tutor/manage/offerings/42/status").with(user(tutor)).with(csrf())
                        .param("version", "3").param("action", "submit"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/tutor/manage"));

        verify(service).transition(any(), eq(42L), eq(3L), eq("submit"));
    }

    @Test void invalidNumberStaysInFormAndDoesNotReachService() throws Exception {
        mvc.perform(validPost().with(request -> {
                    request.setParameter("unitPrice", "khong-phai-so");
                    return request;
                }))
                .andExpect(status().isBadRequest())
                .andExpect(model().attributeHasFieldErrors("offeringRequest", "unitPrice"));

        verify(service, never()).save(any(), any(), any());
    }

    @Test void groupAndNestedScheduleValidationCannotBeOverriddenByRequest() throws Exception {
        mvc.perform(validPost().with(request -> {
                    request.setParameter("offeringType", "GROUP_CLASS");
                    request.setParameter("groupDatesValid", "true");
                    request.setParameter("slots[0].endTime", "17:00");
                    request.setParameter("slots[0].timeRangeValid", "true");
                    return request;
                }))
                .andExpect(status().isBadRequest())
                .andExpect(model().attributeHasFieldErrors(
                        "offeringRequest", "groupDatesValid", "slots[0].timeRangeValid"
                ));

        verify(service, never()).save(any(), any(), any());
    }
}
