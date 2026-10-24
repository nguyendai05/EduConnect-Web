package com.educonnect.web;

import com.educonnect.lesson.service.CatalogService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@Controller
public class HomePageController {
    private ObjectProvider<CatalogService> services;

    public HomePageController(ObjectProvider<CatalogService> services) {
        this.services = services;
    }

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        CatalogService service = services.getIfAvailable();
        model.addAttribute("offerings", service == null ? List.of() : service.list(0, 6).getContent());
        return "pages/home";
    }
}
