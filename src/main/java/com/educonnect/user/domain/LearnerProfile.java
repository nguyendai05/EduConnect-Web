package com.educonnect.user.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Mapping learner_profiles; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "learner_profiles")
public class LearnerProfile {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "learner_kind", nullable = false, length = 32)
    private LearnerKind learnerKind;

    @Column(name = "grade_level_id", nullable = true)
    private Long gradeLevelId;

    @Column(name = "area_id", nullable = true)
    private Long areaId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private com.educonnect.user.domain.UserAccount account;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "grade_level_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.GradeLevel gradeLevelReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "area_id", referencedColumnName = "id", nullable = true, insertable = false, updatable = false)
    private com.educonnect.common.reference.domain.Area areaReference;

    protected LearnerProfile() {}

    public static LearnerProfile create() { return new LearnerProfile(); }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LearnerKind getLearnerKind() { return learnerKind; }
    public void setLearnerKind(LearnerKind learnerKind) { this.learnerKind = learnerKind; }

    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public com.educonnect.user.domain.UserAccount getAccount() { return account; }
    public void setAccount(com.educonnect.user.domain.UserAccount account) { this.account = account; }

    public com.educonnect.common.reference.domain.GradeLevel getGradeLevelReference() { return gradeLevelReference; }

    public com.educonnect.common.reference.domain.Area getAreaReference() { return areaReference; }
}
