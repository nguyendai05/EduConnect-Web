package com.educonnect.chat.dto;

import com.educonnect.chat.domain.ChatMessage;
import java.time.Instant;

/** Một tin nhắn; mine cho biết tin do người đang xem gửi. */
public record ChatMessageDTO(Long id, boolean mine, String body, Instant sentAt) {

    public static ChatMessageDTO from(ChatMessage m, Long viewerId) {
        return new ChatMessageDTO(m.getId(), m.getSenderId().equals(viewerId), m.getBody(), m.getSentAt());
    }
}
