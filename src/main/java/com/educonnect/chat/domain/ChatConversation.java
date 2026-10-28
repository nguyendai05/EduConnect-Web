package com.educonnect.chat.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.user.domain.LearnerProfile;

/** Mapping chat_conversations; maintainer: Huy. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "chat_conversations", uniqueConstraints = {@UniqueConstraint(name = "uq_chat_pair", columnNames = {"learner_id", "tutor_id"})})
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "learner_id", nullable = false)
    private Long learnerId;

    @Column(name = "tutor_id", nullable = false)
    private Long tutorId;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "last_message_at", nullable = true, columnDefinition = "datetime(6)")
    private Instant lastMessageAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private LearnerProfile learnerReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id", referencedColumnName = "user_id", nullable = false, insertable = false, updatable = false)
    private TutorProfile tutorReference;

    protected ChatConversation() {}

    public static ChatConversation create() { return new ChatConversation(); }

    public Long getId() { return id; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public Instant getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Instant lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public LearnerProfile getLearnerReference() { return learnerReference; }

    public TutorProfile getTutorReference() { return tutorReference; }
}
