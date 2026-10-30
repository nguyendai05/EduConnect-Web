package com.educonnect.contract.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.contract.dto.AttendanceBoardDTO;
import com.educonnect.contract.dto.AttendanceBoardDTO.ClassCard;
import com.educonnect.contract.dto.AttendanceBoardDTO.Learner;
import com.educonnect.contract.dto.AttendanceBoardDTO.Row;
import com.educonnect.contract.dto.AttendanceBoardDTO.ServiceCard;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.lesson.domain.Offering;
import com.educonnect.order.domain.OrderItemType;
import com.educonnect.security.AccountPrincipal;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Dựng bảng điểm danh của gia sư theo lớp từ các hợp đồng đang thực hiện. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class AttendanceService {
    private ContractJpaRepository contracts;
    private ContractSessionJpaRepository sessions;
    private EntityManager entityManager;

    public AttendanceService(ContractJpaRepository contracts, ContractSessionJpaRepository sessions, EntityManager entityManager) {
        this.contracts = contracts;
        this.sessions = sessions;
        this.entityManager = entityManager;
    }

    /** Lớp nhóm và dịch vụ 1-1 đang có học viên của gia sư (hợp đồng đã thanh toán, đang thực hiện). */
    public AttendanceBoardDTO board(AccountPrincipal user) {
        List<Contract> active = contracts.findMine(user.getId()).stream()
                .filter(c -> c.getTutorId().equals(user.getId()) && c.getStatus() == ContractStatus.ACTIVE).toList();
        if (active.isEmpty()) return new AttendanceBoardDTO(List.of(), List.of());
        Map<Long, List<ContractSession>> byContract = sessions
                .findByContractIdInOrderByContractIdAscSessionNumberAsc(active.stream().map(Contract::getId).toList()).stream()
                .collect(Collectors.groupingBy(ContractSession::getContractId));

        Map<Long, List<Contract>> classes = new LinkedHashMap<>();
        Map<String, List<Contract>> services = new LinkedHashMap<>();
        for (Contract c : active) {
            Long offering = c.getOrderItemReference().getRegistrationSourceReference().getOfferingId();
            if (c.getOrderItemReference().getOfferingTypeSnapshot() == OrderItemType.GROUP_CLASS) {
                classes.computeIfAbsent(offering, key -> new ArrayList<>()).add(c);
            } else {
                services.computeIfAbsent(offering != null ? "o" + offering : "c" + c.getId(), key -> new ArrayList<>()).add(c);
            }
        }
        List<ClassCard> classCards = classes.entrySet().stream().map(e -> classCard(e.getKey(), e.getValue(), byContract)).toList();
        List<ServiceCard> serviceCards = services.values().stream().map(list -> serviceCard(list, byContract)).toList();
        return new AttendanceBoardDTO(classCards, serviceCards);
    }

    private ClassCard classCard(Long offeringId, List<Contract> list, Map<Long, List<ContractSession>> byContract) {
        Offering offering = entityManager.find(Offering.class, offeringId);
        int total = list.get(0).getOrderItemReference().getSessionCountSnapshot();
        int done = 0;
        Integer next = null;
        Map<Integer, Instant> attendedAt = new LinkedHashMap<>();
        Map<Integer, Integer> absent = new LinkedHashMap<>();
        List<Learner> learners = new ArrayList<>();
        for (Contract c : list) {
            learners.add(new Learner(c.getId(), c.getLearnerReference().getAccount().getDisplayName()));
            List<ContractSession> own = byContract.getOrDefault(c.getId(), List.of());
            done = Math.max(done, (int) own.stream().filter(s -> s.getStatus() != ContractSessionStatus.HELD).count());
            for (ContractSession s : own) {
                if (s.getStatus() == ContractSessionStatus.HELD) {
                    next = next == null ? s.getSessionNumber() : Math.min(next, s.getSessionNumber());
                    break;
                }
                attendedAt.merge(s.getSessionNumber(), s.getAttendedAt(), (a, b) -> a.isAfter(b) ? a : b);
                absent.merge(s.getSessionNumber(), s.isAbsent() ? 1 : 0, Integer::sum);
            }
        }
        List<AttendanceBoardDTO.Session> history = attendedAt.entrySet().stream()
                .sorted(Map.Entry.<Integer, Instant>comparingByKey().reversed())
                .map(e -> new AttendanceBoardDTO.Session(e.getKey(), e.getValue(), absent.getOrDefault(e.getKey(), 0))).toList();
        String capacity = offering != null && offering.getCapacity() != null ? String.valueOf(offering.getCapacity()) : "—";
        return new ClassCard(offeringId, list.get(0).getOrderItemReference().getTitleSnapshot(), capacity, list.size(), done > 0,
                done, total, next, learners, history);
    }

    private ServiceCard serviceCard(List<Contract> list, Map<Long, List<ContractSession>> byContract) {
        List<Row> rows = new ArrayList<>();
        for (Contract c : list) {
            List<ContractSession> own = byContract.getOrDefault(c.getId(), List.of());
            int done = (int) own.stream().filter(s -> s.getStatus() == ContractSessionStatus.RELEASED).count();
            Integer next = own.stream().filter(s -> s.getStatus() == ContractSessionStatus.HELD)
                    .map(ContractSession::getSessionNumber).min(Comparator.naturalOrder()).orElse(null);
            boolean waiting = own.stream().anyMatch(s -> s.getStatus() == ContractSessionStatus.ATTENDED);
            rows.add(new Row(c.getId(), c.getLearnerReference().getAccount().getDisplayName(), done, own.size(), next, waiting));
        }
        return new ServiceCard(list.get(0).getOrderItemReference().getTitleSnapshot(), rows);
    }
}
