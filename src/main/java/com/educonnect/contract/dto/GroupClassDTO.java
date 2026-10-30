package com.educonnect.contract.dto;

import java.util.List;

/** Một lớp nhóm đang dạy của gia sư: các học viên còn buổi cần điểm danh, để điểm danh cả lớp một lần. */
public record GroupClassDTO(Long offeringId, String title, List<Learner> learners) {

    /** Học viên của lớp: hợp đồng và buổi học kế tiếp của họ. */
    public record Learner(Long contractId, String name, int nextSession) {}
}
