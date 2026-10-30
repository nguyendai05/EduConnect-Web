package com.educonnect.contract.web;

import com.educonnect.contract.dto.AttendanceBoardDTO;
import com.educonnect.contract.service.AttendanceService;
import com.educonnect.order.dto.TutorOrderRowDTO;
import com.educonnect.order.service.OrderService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.web.TutorManagePageController;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

/** Thêm hai tab "Đơn đăng ký" và "Điểm danh" của gia sư vào trang quản lý lớp. */
@ControllerAdvice(assignableTypes = TutorManagePageController.class)
public class TutorRegistrationsAdvice {
    private ObjectProvider<OrderService> orders;
    private ObjectProvider<AttendanceService> attendance;

    public TutorRegistrationsAdvice(ObjectProvider<OrderService> orders, ObjectProvider<AttendanceService> attendance) {
        this.orders = orders;
        this.attendance = attendance;
    }

    @ModelAttribute("tutorOrders")
    public List<TutorOrderRowDTO> tutorOrders(@AuthenticationPrincipal AccountPrincipal user) {
        OrderService service = orders.getIfAvailable();
        return service == null || user == null ? List.of() : service.tutorOrders(user);
    }

    @ModelAttribute("attendance")
    public AttendanceBoardDTO attendance(@AuthenticationPrincipal AccountPrincipal user) {
        AttendanceService service = attendance.getIfAvailable();
        return service == null || user == null ? new AttendanceBoardDTO(List.of(), List.of()) : service.board(user);
    }
}
