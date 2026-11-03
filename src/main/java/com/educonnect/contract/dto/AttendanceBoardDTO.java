package com.educonnect.contract.dto;

import java.time.Instant;
import java.util.List;

/**
 * Bảng điểm danh của gia sư, chia theo lớp: lớp nhóm điểm danh cả lớp một lần (cả lớp cùng một tiến độ),
 * dịch vụ 1-1 điểm danh từng học viên. Gia sư không điểm danh theo hợp đồng.
 */
public record AttendanceBoardDTO(
        List<ClassCard> classes, // Danh sách lớp nhóm để gia sư điểm danh.
        List<ServiceCard> services // Danh sách dịch vụ dạy kèm 1-1 để gia sư điểm danh.
) {

    /** Một lớp nhóm đang có học viên: tiến độ chung của lớp và danh sách học viên. next là buổi kế tiếp của lớp (null nếu đã xong). */
    public record ClassCard(
            Long offeringId, // ID dịch vụ hoặc lớp học.
            String title, // Tiêu đề hiển thị.
            String capacity, // Sĩ số tối đa của lớp nhóm.
            int enrolled, // Số học viên đã đăng ký lớp.
            boolean started, // Cho biết lớp đã có buổi được điểm danh hay chưa.
            int done, // Số buổi học đã được điểm danh.
            int total, // Tổng số buổi học.
            Integer next, // Số thứ tự buổi học kế tiếp có thể điểm danh; null nếu không còn buổi phù hợp.
            List<Learner> learners, // Danh sách học viên của lớp.
            List<Session> history // Lịch sử các buổi của lớp đã được điểm danh.
    ) {}

    /** Học viên của lớp nhóm, contractId dùng để ghi vắng. */
    public record Learner(
            Long contractId, // ID hợp đồng học.
            String name // Tên hiển thị của học viên.
    ) {}

    /** Một buổi của lớp đã điểm danh: thời điểm và số học viên vắng. */
    public record Session(
            int number, // Số thứ tự buổi học.
            Instant at, // Thời điểm gia sư điểm danh buổi học của lớp.
            int absent // Số học viên vắng trong buổi học.
    ) {}

    /** Một dịch vụ 1-1 (hoặc một hợp đồng từ lời mời/tin) với các học viên đang học. */
    public record ServiceCard(
            String title, // Tiêu đề hiển thị.
            List<Row> rows // Danh sách các dòng dữ liệu để hiển thị.
    ) {}

    /** Một học viên 1-1: tiến độ, buổi kế tiếp để điểm danh và có buổi đang chờ học viên xác nhận không. */
    public record Row(
            Long contractId, // ID hợp đồng học.
            String learner, // Tên hiển thị của học viên.
            int done, // Số buổi học đã được điểm danh.
            int total, // Tổng số buổi học.
            Integer next, // Số thứ tự buổi học kế tiếp có thể điểm danh; null nếu không còn buổi phù hợp.
            boolean waiting // Cho biết có buổi đang chờ học viên xác nhận hay không.
    ) {}
}
