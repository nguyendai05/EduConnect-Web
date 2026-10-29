package com.educonnect.contract.service;

import com.educonnect.contract.domain.Contract;
import com.educonnect.contract.domain.ContractSession;
import com.educonnect.contract.dto.ContractSummaryDTO;
import com.educonnect.contract.repository.ContractJpaRepository;
import com.educonnect.contract.repository.ContractSessionJpaRepository;
import com.educonnect.security.AccountPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Danh sách hợp đồng của người dùng (học viên hoặc gia sư) kèm tiến độ buổi học. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class ContractListService {
    private ContractJpaRepository contracts;
    private ContractSessionJpaRepository sessions;

    public ContractListService(ContractJpaRepository contracts, ContractSessionJpaRepository sessions) {
        this.contracts = contracts;
        this.sessions = sessions;
    }

    /** Hợp đồng của người đăng nhập, mới nhất trước; mỗi dòng có buổi gia sư cần điểm danh hoặc học viên cần xác nhận. */
    public List<ContractSummaryDTO> mine(AccountPrincipal user) {
        List<Contract> list = contracts.findMine(user.getId());
        if (list.isEmpty()) return List.of();
        Map<Long, List<ContractSession>> byContract = sessions
                .findByContractIdInOrderByContractIdAscSessionNumberAsc(list.stream().map(Contract::getId).toList()).stream()
                .collect(Collectors.groupingBy(ContractSession::getContractId));
        return list.stream().map(c -> ContractSummaryDTO.from(c, user.getId(), byContract.getOrDefault(c.getId(), List.of()))).toList();
    }
}
