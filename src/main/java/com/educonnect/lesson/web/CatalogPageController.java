package com.educonnect.lesson.web;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.service.CatalogService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class CatalogPageController {
    private ObjectProvider<CatalogService> services;

    public CatalogPageController(ObjectProvider<CatalogService> services) {
        this.services = services;
    }

    @GetMapping("/catalog/detail")
    public String detail(@RequestParam(required = false) Long id,
                         @RequestParam(defaultValue = "0") int page, Model model) {
        CatalogService service = services.getIfAvailable();
        if (service != null && id == null) {
            model.addAttribute("offerings", service.list(page));
            return "pages/catalog/index";
        }
        if (service != null && id != null && id > 0) {
            try {
                Offering offering = service.getPublicOffering(id);
                model.addAttribute("offering", offering);
                model.addAttribute("timeSlots", service.getSchedule(id));
                model.addAttribute("issue", service.registrationIssue(offering, 1));
                model.addAttribute("availableSeats", service.availableSeats(offering));
            } catch (IllegalArgumentException error) {
                model.addAttribute("error", error.getMessage());
            }
        }
        return "pages/catalog/detail";
    }
}
