package com.educonnect.tutor;

import com.educonnect.lesson.dto.OfferingOptionResponse;
import com.educonnect.lesson.dto.OfferingOptionsResponse;
import com.educonnect.lesson.service.OfferingProblem;
import com.educonnect.security.AccountUserDetailsService;
import com.educonnect.security.DatabaseSecurityConfig;
import com.educonnect.tutor.dto.TutorCardResponse;
import com.educonnect.tutor.dto.TutorProfileResponse;
import com.educonnect.tutor.dto.TutorSearchResponse;
import com.educonnect.tutor.service.TutorDiscoveryService;
import com.educonnect.tutor.web.TutorDiscoveryPageController;
import com.educonnect.user.UserAccountRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TutorDiscoveryPageController.class)
@ActiveProfiles("db-dev")
@Import({DatabaseSecurityConfig.class, AccountUserDetailsService.class})
class TutorDiscoveryMvcTest {
    @Autowired MockMvc mvc;
    @MockitoBean TutorDiscoveryService service;
    @MockitoBean UserAccountRepository accounts;

    @BeforeEach void options() {
        var options = List.of(new OfferingOptionResponse(1L, "Toán"));
        when(service.options()).thenReturn(new OfferingOptionsResponse(options, options, options, options));
        when(service.search(any())).thenReturn(new TutorSearchResponse(
                List.of(new TutorCardResponse(320L, "Ngọc <script>", "Gia sư IELTS", (short) 8,
                        new BigDecimal("180000"), 4L)), 0, 12, 1, 1, false, false));
    }

    @Test void publicSearchUsesRealIdsAndContextPathWithoutFixtures() throws Exception {
        mvc.perform(get("/edu/tutor/search").contextPath("/edu").param("subjectId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/edu/tutor/profile?id=320")))
                .andExpect(content().string(containsString("Ngọc &lt;script&gt;")))
                .andExpect(content().string(containsString("name=\"subjectId\"")))
                .andExpect(content().string(not(containsString("/js/preview/"))));
        verify(service).search(argThat(request -> request.getSubjectId().equals(1L)));
    }

    @Test void invalidPriceRangeStaysInSearchViewWithoutQueryingResults() throws Exception {
        mvc.perform(get("/tutor/search").param("minPrice", "300000").param("maxPrice", "100000"))
                .andExpect(status().isBadRequest())
                .andExpect(view().name("pages/tutor/search"))
                .andExpect(content().string(containsString("Bộ lọc không hợp lệ")))
                .andExpect(content().string(containsString("value=\"300000\"")));
        verify(service, never()).search(any());
    }

    @Test void numericProfileFromHomeRendersPublicDtoAndInvitationLink() throws Exception {
        when(service.profile(320L, 0, 12)).thenReturn(new TutorProfileResponse(
                320L, "Phạm Bảo Ngọc", "Gia sư IELTS", (short) 8, Page.empty()));
        mvc.perform(get("/tutor/profile").param("id", "320"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Phạm Bảo Ngọc")))
                .andExpect(content().string(containsString("/invitation/create?tutorId=320")))
                .andExpect(content().string(not(containsString("/js/preview/"))));
    }

    @Test void missingOrInvalidProfileHasStyledErrorInsteadOfFixtureFallback() throws Exception {
        when(service.profile(999L, 0, 12)).thenThrow(new OfferingProblem(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ."));
        mvc.perform(get("/tutor/profile").param("id", "999"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("Chưa thể hiển thị hồ sơ")));
        mvc.perform(get("/tutor/profile").param("id", "invalid"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Mã gia sư hoặc số trang không hợp lệ")));
    }
}
