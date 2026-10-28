package com.educonnect.chat.repository;

import com.educonnect.chat.domain.ChatMessage;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Repository JPA quản lý tin nhắn (bảng chat_messages). */
@Profile("db-dev")
public interface ChatMessageJpaRepository extends JpaRepository<ChatMessage, Long> {
    /** 100 tin gần nhất, mới nhất trước. */
    List<ChatMessage> findTop100ByConversationIdOrderByIdDesc(Long conversationId);

    /** Tin mới hơn một mã tin (cho trang hỏi định kỳ). */
    List<ChatMessage> findByConversationIdAndIdGreaterThanOrderById(Long conversationId, Long afterId);
}
