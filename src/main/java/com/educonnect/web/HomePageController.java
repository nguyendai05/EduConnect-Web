package com.educonnect.web;

import com.educonnect.lesson.domain.Offering;
import com.educonnect.lesson.domain.OfferingStatus;
import com.educonnect.lesson.repository.OfferingJpaRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Collections;
import java.util.List;

/**
 * Controller hiển thị trang chủ (HomePage - Đạt).
 * Lấy danh sách khóa học thật từ CSDL để hiển thị và cho phép thêm vào giỏ.
 */
@Controller
public class HomePageController {

    private ObjectProvider<OfferingJpaRepository> offeringRepoProvider;

    public HomePageController(ObjectProvider<OfferingJpaRepository> offeringRepoProvider) {
        this.offeringRepoProvider = offeringRepoProvider;
    }

    /**
     * GET / hoặc /home: Hiển thị trang chủ kèm các khóa học mới công khai từ MySQL.
     */
    @GetMapping({"/", "/home"})
    public String home(Model model) {
        OfferingJpaRepository offeringRepo = offeringRepoProvider.getIfAvailable();
        List<Offering> offerings = Collections.emptyList();
        if (offeringRepo != null) {
            // Lấy các khóa học đã được duyệt & công khai
            offerings = offeringRepo.findByStatusWithDetails(OfferingStatus.PUBLISHED);
        }
        model.addAttribute("offerings", offerings);
        return "pages/home";
    }
}
