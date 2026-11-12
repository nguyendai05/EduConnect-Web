package com.educonnect.contract.dto;

import java.util.List;

/** Một lớp nhóm đang dạy của gia sư: các học viên còn buổi cần điểm danh, để điểm danh cả lớp một lần. */
public record GroupClassDTO(
        Long offeringId, // ID dịch vụ hoặc lớp học.
        String title, // Tiêu đề hiển thị.
        List<Learner> learners // Danh sách học viên của lớp.
) {

    /** Học viên của lớp: hợp đồng và buổi học kế tiếp của họ. */
    public record Learner(
            Long contractId, // ID hợp đồng học.
            String name, // Tên hiển thị của học viên.
            int nextSession // Số thứ tự buổi học tiếp theo của học viên.
    ) {}
}
