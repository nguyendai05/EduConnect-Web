package com.educonnect.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import com.educonnect.security.AccountPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.core.env.Environment;

/** Shared presentation metadata and a safe projection of the authenticated account. */
@ControllerAdvice
public class PageModelAdvice {

    private final boolean uiPreviewEnabled;
    private final boolean authenticationEnabled;

    public PageModelAdvice(@Value("${app.ui-preview.enabled:true}") boolean uiPreviewEnabled, Environment environment) {
        this.uiPreviewEnabled = uiPreviewEnabled;
        this.authenticationEnabled = environment.matchesProfiles("db-dev");
    }

    @ModelAttribute
    void sharedModel(Model model, @AuthenticationPrincipal AccountPrincipal user) {
        model.addAttribute("uiPreviewEnabled", uiPreviewEnabled);
        model.addAttribute("authenticationEnabled", authenticationEnabled);
        model.addAttribute("currentUser", user == null ? null : new CurrentUser(user.getId(), user.getUsername(),
                user.getDisplayName(), user.getHomeUrl()));
    }

    public record CurrentUser(Long id, String email, String displayName, String homeUrl) {}
}
