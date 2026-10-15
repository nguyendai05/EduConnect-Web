package com.educonnect.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/** Shared presentation metadata only; preview identity stays in browser demo data. */
@ControllerAdvice
public class PageModelAdvice {

    private final boolean uiPreviewEnabled;

    public PageModelAdvice(@Value("${app.ui-preview.enabled:true}") boolean uiPreviewEnabled) {
        this.uiPreviewEnabled = uiPreviewEnabled;
    }

    @ModelAttribute
    void sharedModel(Model model) {
        model.addAttribute("uiPreviewEnabled", uiPreviewEnabled);
        model.addAttribute("currentUser", null);
    }
}
