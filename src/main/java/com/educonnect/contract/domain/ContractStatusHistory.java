package com.educonnect.contract.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import com.educonnect.user.domain.UserAccount;

/** Mapping contract_status_history; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "contract_status_history", uniqueConstraints = {@UniqueConstraint(name = "uq_contract_status_history_version", columnNames = {"contract_id", "entity_version"})})
public class ContractStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "from_status", nullable = true, length = 32)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 32)
    private String toStatus;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "reason", nullable = false, length = 600)
    private String reason;

    @Column(name = "entity_version", nullable = false)
    private Long entityVersion;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "changed_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant changedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Contract contractReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private UserAccount actorUserReference;

    protected ContractStatusHistory() {}

    public static ContractStatusHistory create() { return new ContractStatusHistory(); }

    public Long getId() { return id; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }

    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getEntityVersion() { return entityVersion; }
    public void setEntityVersion(Long entityVersion) { this.entityVersion = entityVersion; }

    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }

    public Contract getContractReference() { return contractReference; }

    public UserAccount getActorUserReference() { return actorUserReference; }
}
