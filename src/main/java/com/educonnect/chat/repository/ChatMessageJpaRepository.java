package com.educonnect.chat.repository;

import com.educonnect.chat.domain.ChatMessage;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/** Repository JPA quản lý tin nhắn (bảng chat_messages). */
@Profile("db-dev")
public interface ChatMessageJpaRepository extends JpaRepository<ChatMessage, Long> {
    /** 100 tin gần nhất, mới nhất trước. */
    List<ChatMessage> findTop100ByConversationIdOrderByIdDesc(Long conversationId);

    /** Tin mới hơn một mã tin (cho trang hỏi định kỳ). */
    List<ChatMessage> findByConversationIdAndIdGreaterThanOrderById(Long conversationId, Long afterId);

    /** Số tin người khác gửi mà người dùng chưa xem, cộng dồn qua mọi cuộc trò chuyện của họ. */
    @Query("select count(m) from ChatMessage m, ChatConversation c where m.conversationId = c.id and m.senderId <> :userId"
            + " and ((c.learnerId = :userId and (c.learnerReadAt is null or m.sentAt > c.learnerReadAt))"
            + " or (c.tutorId = :userId and (c.tutorReadAt is null or m.sentAt > c.tutorReadAt)))")
    long countUnread(@Param("userId") Long userId);
}
