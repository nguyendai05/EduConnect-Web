package com.educonnect.web;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.ui-preview.enabled=false")
@org.springframework.test.context.ActiveProfiles("ui-preview")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
class PreviewDisabledTest {
    @Autowired MockMvc mvc;
    static Stream<PagesSmokeTest.Page> pages() { return PagesSmokeTest.pages(); }

    @ParameterizedTest @MethodSource("pages")
    void previewScriptsCanBeDisabled(PagesSmokeTest.Page page) throws Exception {
        if (PagesSmokeTest.requiresDatabase(page.url())) {
            mvc.perform(get(page.url())).andExpect(status().isNotFound());
            return;
        }

        var result = mvc.perform(get(page.url())).andExpect(status().isOk()).andReturn();
        var html = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertTrue(PagesSmokeTest.scriptUrls(html).stream().noneMatch(url -> url.startsWith("/js/preview/")));
    }
}
