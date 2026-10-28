package com.educonnect.chat.repository;

import com.educonnect.chat.domain.ChatConversation;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** Repository JPA quản lý cuộc trò chuyện (bảng chat_conversations). */
@Profile("db-dev")
public interface ChatConversationJpaRepository extends JpaRepository<ChatConversation, Long> {
    Optional<ChatConversation> findByLearnerIdAndTutorId(Long learnerId, Long tutorId);

    /** Các cuộc trò chuyện của một người (học viên hoặc gia sư), mới nhất trước. */
    @EntityGraph(attributePaths = {"learnerReference.account", "tutorReference.account"})
    @Query("select c from ChatConversation c where c.learnerId = :userId or c.tutorId = :userId"
            + " order by coalesce(c.lastMessageAt, c.createdAt) desc")
    List<ChatConversation> findMine(@Param("userId") Long userId);

    /** Một cuộc trò chuyện mà người dùng là một trong hai bên; người khác không đọc được. */
    @EntityGraph(attributePaths = {"learnerReference.account", "tutorReference.account"})
    @Query("select c from ChatConversation c where c.id = :id and (c.learnerId = :userId or c.tutorId = :userId)")
    Optional<ChatConversation> findForParticipant(@Param("id") Long id, @Param("userId") Long userId);
}
