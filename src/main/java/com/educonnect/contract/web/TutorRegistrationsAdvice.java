package com.educonnect.contract.web;

import com.educonnect.contract.dto.ContractSummaryDTO;
import com.educonnect.contract.service.ContractListService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.web.TutorManagePageController;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

/** Thêm danh sách học viên đã đăng ký (tab "Đơn đăng ký") vào trang quản lý lớp của gia sư. */
@ControllerAdvice(assignableTypes = TutorManagePageController.class)
public class TutorRegistrationsAdvice {
    private ObjectProvider<ContractListService> lists;

    public TutorRegistrationsAdvice(ObjectProvider<ContractListService> lists) { this.lists = lists; }

    @ModelAttribute("registrations")
    public List<ContractSummaryDTO> registrations(@AuthenticationPrincipal AccountPrincipal user) {
        ContractListService service = lists.getIfAvailable();
        return service == null || user == null ? List.of() : service.mine(user);
    }
}
