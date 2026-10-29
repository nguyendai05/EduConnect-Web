package com.educonnect.contract.dto;

import java.time.Instant;
import java.util.List;

/**
 * Bảng điểm danh của gia sư, chia theo lớp: lớp nhóm điểm danh cả lớp một lần (cả lớp cùng một tiến độ),
 * dịch vụ 1-1 điểm danh từng học viên. Gia sư không điểm danh theo hợp đồng.
 */
public record AttendanceBoardDTO(List<ClassCard> classes, List<ServiceCard> services) {

    /** Một lớp nhóm đang có học viên: tiến độ chung của lớp và danh sách học viên. next là buổi kế tiếp của lớp (null nếu đã xong). */
    public record ClassCard(Long offeringId, String title, String capacity, int enrolled, boolean started, int done, int total,
            Integer next, List<Learner> learners, List<Session> history) {}

    /** Học viên của lớp nhóm, contractId dùng để ghi vắng. */
    public record Learner(Long contractId, String name) {}

    /** Một buổi của lớp đã điểm danh: thời điểm và số học viên vắng. */
    public record Session(int number, Instant at, int absent) {}

    /** Một dịch vụ 1-1 (hoặc một hợp đồng từ lời mời/tin) với các học viên đang học. */
    public record ServiceCard(String title, List<Row> rows) {}

    /** Một học viên 1-1: tiến độ, buổi kế tiếp để điểm danh và có buổi đang chờ học viên xác nhận không. */
    public record Row(Long contractId, String learner, int done, int total, Integer next, boolean waiting) {}
}
