package com.educonnect.tutor;

import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Controller → service → HQL/SQL → Thymeleaf thật, không mock dữ liệu tìm kiếm hoặc danh mục. */
@SpringBootTest(classes = TutorDiscoveryUiApplication.class)
@ActiveProfiles({"db-dev", "discovery-ui-test"})
@AutoConfigureMockMvc
class TutorDiscoveryUiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserAccountRepository accounts;

    @Test void defaultFormSubmissionKeepsTutorWithoutOfferingsAndHidesPrivateCategories() throws Exception {
        mvc.perform(get("/tutor/search").param("timeZone", "Asia/Ho_Chi_Minh"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("4 gia sư phù hợp")))
                .andExpect(content().string(containsString("An - Chỉ có hồ sơ")))
                .andExpect(content().string(containsString("Theo thỏa thuận")))
                .andExpect(content().string(containsString("Nhận lời mời dạy riêng")))
                .andExpect(content().string(containsString("Môn từ hồ sơ đã duyệt")))
                .andExpect(content().string(containsString("Môn từ gói công khai")))
                .andExpect(content().string(containsString("Cấp từ hồ sơ đã duyệt")))
                .andExpect(content().string(containsString("Cấp từ gói công khai")))
                .andExpect(content().string(not(containsString("PRIVATE_"))))
                .andExpect(content().string(not(containsString("private-tutor"))))
                .andExpect(content().string(not(containsString("0900000"))));
    }

    @Test void bioAndAllProfileExpertiseCanBeSearchedThroughTheRenderedForm() throws Exception {
        for (String q : new String[]{"trực quan độc đáo", "Môn từ hồ sơ đã duyệt", "Cấp từ hồ sơ đã duyệt",
                "Khu vực hồ sơ", "Trực tuyến hồ sơ"}) {
            mvc.perform(get("/tutor/search").param("q", q).param("subjectId", "11")
                            .param("gradeLevelIds", "11").param("areaId", "1").param("deliveryModeId", "1")
                            .param("timeZone", "Asia/Ho_Chi_Minh"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("1 gia sư phù hợp")))
                    .andExpect(content().string(containsString("An - Chỉ có hồ sơ")))
                    .andExpect(content().string(containsString("Theo thỏa thuận")));
        }
    }

    @Test void offeringExpertiseAndPriceTypeSlotsFilterActualRenderedCards() throws Exception {
        for (String q : new String[]{"Môn từ gói công khai", "Cấp từ gói công khai", "Khu vực gói", "Tại nhà qua gói"}) {
            mvc.perform(get("/tutor/search").param("q", q).param("subjectId", "12")
                            .param("gradeLevelIds", "12").param("areaId", "2").param("deliveryModeId", "2")
                            .param("minPrice", "150000").param("maxPrice", "250000").param("offeringType", "SERVICE")
                            .param("weekdays", "1").param("startTime", "08:00").param("endTime", "09:00")
                            .param("timeZone", "Asia/Ho_Chi_Minh"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("1 gia sư phù hợp")))
                    .andExpect(content().string(containsString("Bình - Có gói công khai")))
                    .andExpect(content().string(containsString("200.000 ₫")))
                    .andExpect(content().string(not(containsString("An - Chỉ có hồ sơ"))))
                    .andExpect(content().string(not(containsString("Chi - Gói học phí cao"))));
        }
    }

    @Test void renderedSortAndPaginationPutNegotiablePricesLast() throws Exception {
        for (String sort : new String[]{"price-asc", "price-desc"}) {
            mvc.perform(get("/tutor/search").param("sort", sort).param("size", "2").param("page", "1"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("Trang 2 / 2 · 4 gia sư")))
                    .andExpect(content().string(containsString("An - Chỉ có hồ sơ")))
                    .andExpect(content().string(containsString("Dung - Chỉ có gói nháp")))
                    .andExpect(content().string(not(containsString("Bình - Có gói công khai"))))
                    .andExpect(content().string(not(containsString("Chi - Gói học phí cao"))));
        }
    }

    @Test void publicProfileShowsOnlyPublicFieldsAndLearnerInvitationWithoutOfferings() throws Exception {
        AccountPrincipal learner = new AccountPrincipal(accounts.findById(900L).orElseThrow());
        mvc.perform(get("/tutor/profile").param("id", "101").with(user(learner)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("An - Chỉ có hồ sơ")))
                .andExpect(content().string(containsString("Dạy bằng phương pháp trực quan độc đáo")))
                .andExpect(content().string(containsString("Gia sư nhận lời mời học riêng")))
                .andExpect(content().string(containsString("3 năm kinh nghiệm")))
                .andExpect(content().string(containsString("Môn từ hồ sơ đã duyệt")))
                .andExpect(content().string(containsString("Cấp từ hồ sơ đã duyệt")))
                .andExpect(content().string(containsString("Khu vực hồ sơ")))
                .andExpect(content().string(containsString("Trực tuyến hồ sơ")))
                .andExpect(content().string(containsString("/invitation/create?tutorId=101")))
                .andExpect(content().string(not(containsString("PRIVATE_"))))
                .andExpect(content().string(not(containsString("private-tutor"))))
                .andExpect(content().string(not(containsString("0900000101"))));
        for (String id : new String[]{"103", "104", "105"}) {
            mvc.perform(get("/tutor/profile").param("id", id))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string(not(containsString("PRIVATE_"))));
        }
    }
}
