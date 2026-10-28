package com.educonnect.contract;

import com.educonnect.contract.dto.ContractConfirmationDTO;
import com.educonnect.contract.service.ContractService;
import com.educonnect.contract.web.ContractPageController;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.security.AccountUserDetailsService;
import com.educonnect.security.DatabaseSecurityConfig;
import com.educonnect.user.UserAccount;
import com.educonnect.user.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractPageController.class)
@ActiveProfiles("db-dev")
@Import({DatabaseSecurityConfig.class, AccountUserDetailsService.class})
class CheckoutWebTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserAccountRepository accounts;
    @MockitoBean ContractService contracts;
    AccountPrincipal principal;

    @BeforeEach void setup() {
        var user = new UserAccount(1L, "learner@example.test", "internal-hash", "Học viên", "ACTIVE", true, 0L, Set.of("LEARNER"));
        principal = new AccountPrincipal(user);
        when(accounts.findById(1L)).thenReturn(Optional.of(user));
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor learner() {
        return authentication(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @Test void getOnlyReadsDraftAndIncludesUncheckedConsentsWithContextPathAndCsrf() throws Exception {
        when(contracts.draft(any(), eq(4L))).thenReturn(new ContractConfirmationDTO(null, 4L, null, 0L, "Chưa tạo", "Chưa tạo", null,
                "Học viên", "Gia sư", "Toán", "1 kèm 1", BigDecimal.TEN, (short) 2, 1, BigDecimal.valueOf(20), "Điều khoản", "Chưa xác nhận", false));
        mvc.perform(get("/edu/contract/confirm").contextPath("/edu").param("cartItemId", "4").with(learner()))
                .andExpect(status().isOk()).andExpect(content().string(containsString("action=\"/edu/contract/sign\"")))
                .andExpect(content().string(containsString("name=\"_csrf\"")))
                .andExpect(content().string(containsString("name=\"acceptTerms\"")))
                .andExpect(content().string(not(containsString(" checked"))))
                .andExpect(content().string(not(containsString("internal-hash"))))
                .andExpect(content().string(not(containsString("jquery"))));
        verify(contracts).draft(any(), eq(4L));
        verifyNoMoreInteractions(contracts);
    }

    @Test void missingSelectionDoesNotFallBackToAnotherContract() throws Exception {
        mvc.perform(get("/contract/confirm").with(learner())).andExpect(status().isOk())
                .andExpect(content().string(containsString("Chưa có hợp đồng được chọn")));
        verifyNoInteractions(contracts);
    }

    @Test void foreignOrMissingContractReturns404InsteadOfShowingLatest() throws Exception {
        when(contracts.getContract(any(), eq(9L))).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));
        mvc.perform(get("/contract/confirm").param("contract", "9").with(learner())).andExpect(status().isNotFound());
        verify(contracts).getContract(any(), eq(9L));
        verifyNoMoreInteractions(contracts);
    }

    @Test void uncheckedOrMalformedPostNeverCreatesOrder() throws Exception {
        mvc.perform(post("/contract/sign").with(learner()).with(csrf()).param("cartItemId", "4").param("version", "0"))
                .andExpect(redirectedUrl("/cart/index")).andExpect(flash().attributeExists("error"));
        mvc.perform(post("/contract/sign").with(learner()).with(csrf()).param("cartItemId", "-4")
                        .param("acceptTerms", "true").param("acceptPayment", "true").param("acceptCancellation", "true"))
                .andExpect(redirectedUrl("/cart/index")).andExpect(flash().attributeExists("error"));
        verifyNoInteractions(contracts);
    }

    @Test void confirmationRequiresCsrfAndLearnerRole() throws Exception {
        mvc.perform(post("/contract/sign").with(learner())).andExpect(status().isForbidden());
        mvc.perform(post("/contract/sign").with(user("tutor").roles("TUTOR")).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(post("/contract/create").with(user("tutor").roles("TUTOR")).with(csrf())).andExpect(status().isForbidden());
        verifyNoInteractions(contracts);
    }

    @Test void validPostUsesPrincipalAndRedirectsToSavedContract() throws Exception {
        when(contracts.confirm(any(), any())).thenReturn(17L);
        mvc.perform(post("/contract/sign").with(learner()).with(csrf()).param("cartItemId", "4").param("version", "0")
                        .param("acceptTerms", "true").param("acceptPayment", "true").param("acceptCancellation", "true")
                        .param("learnerId", "999").param("total", "1"))
                .andExpect(redirectedUrl("/contract/confirm?contract=17"));
        verify(contracts).confirm(argThat(p -> p.getId().equals(1L)), eq(new ContractConfirmationForm(4L, 0L, true, true, true)));
    }
}
