package com.educonnect.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
class SecurityPermitAllTest {
    @Autowired MockMvc mvc;

    @Test void anonymousGetHasCsrfMetadata() throws Exception {
        var result = mvc.perform(get("/auth/login")).andExpect(status().isOk()).andReturn();
        var html = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertTrue(html.contains("name=\"_csrf\" content=\""));
        assertTrue(html.contains("name=\"_csrf_header\""));
    }
    @Test void postWithoutCsrfIsRejected() throws Exception {
        mvc.perform(post("/auth/login")).andExpect(status().isForbidden());
    }
    @Test void validCsrfReachesGetOnlyController() throws Exception {
        mvc.perform(post("/auth/login").with(csrf())).andExpect(status().isMethodNotAllowed());
    }
}
