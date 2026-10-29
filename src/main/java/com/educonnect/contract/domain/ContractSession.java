package com.educonnect.contract.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/** Mapping contract_sessions; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "contract_sessions", uniqueConstraints = {@UniqueConstraint(name = "uq_session_number", columnNames = {"contract_id", "session_number"}), @UniqueConstraint(name = "uq_session_release", columnNames = {"release_id"})})
public class ContractSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "session_number", nullable = false)
    private Integer sessionNumber;

    @Column(name = "amount", nullable = false, precision = 19, scale = 0)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 32)
    private ContractSessionStatus status;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "attended_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant attendedAt;

    @Column(name = "absent", nullable = false)
    private boolean absent;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "confirmed_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant confirmedAt;

    @Column(name = "release_id", nullable = true)
    private Long releaseId;

    @Version
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    protected ContractSession() {}

    public static ContractSession create() { return new ContractSession(); }

    public Long getId() { return id; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public Integer getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(Integer sessionNumber) { this.sessionNumber = sessionNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public ContractSessionStatus getStatus() { return status; }
    public void setStatus(ContractSessionStatus status) { this.status = status; }

    public Instant getAttendedAt() { return attendedAt; }
    public void setAttendedAt(Instant attendedAt) { this.attendedAt = attendedAt; }

    public boolean isAbsent() { return absent; }
    public void setAbsent(boolean absent) { this.absent = absent; }

    public Instant getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(Instant confirmedAt) { this.confirmedAt = confirmedAt; }

    public Long getReleaseId() { return releaseId; }
    public void setReleaseId(Long releaseId) { this.releaseId = releaseId; }

    public Long getVersion() { return version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
