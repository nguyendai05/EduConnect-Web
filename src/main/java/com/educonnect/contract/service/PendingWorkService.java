package com.educonnect.contract.service;

import com.educonnect.contract.domain.ContractSessionStatus;
import com.educonnect.contract.domain.ContractStatus;
import com.educonnect.invitation.domain.InvitationStatus;
import com.educonnect.security.AccountPrincipal;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Đếm việc đang chờ người dùng xử lý, để header hiện chấm đỏ. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class PendingWorkService {
    private EntityManager entityManager;

    public PendingWorkService(EntityManager entityManager) { this.entityManager = entityManager; }

    /**
     * Gia sư: lời mời đang chờ trả lời. Học viên: hợp đồng chờ thanh toán và buổi học gia sư đã điểm danh đang chờ xác nhận.
     */
    public long count(AccountPrincipal user) {
        if (user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TUTOR"))) {
            return count("select count(i) from Invitation i where i.tutorId = :user and i.status = :status",
                    user, InvitationStatus.PENDING);
        }
        if (!user.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LEARNER"))) return 0;
        return count("select count(c) from Contract c where c.learnerId = :user and c.status = :status",
                user, ContractStatus.AWAITING_PAYMENT)
                + count("select count(s) from ContractSession s, Contract c where s.contractId = c.id"
                        + " and c.learnerId = :user and s.status = :status", user, ContractSessionStatus.ATTENDED);
    }

    private long count(String query, AccountPrincipal user, Object status) {
        return entityManager.createQuery(query, Long.class)
                .setParameter("user", user.getId()).setParameter("status", status).getSingleResult();
    }
}
