package com.educonnect.chat.dto;

import com.educonnect.chat.domain.ChatMessage;
import java.time.Instant;

/** Một tin nhắn; mine cho biết tin do người đang xem gửi. */
public record ChatMessageDTO(
        Long id, // ID tin nhắn.
        boolean mine, // Cho biết tin nhắn do người đang xem gửi hay không.
        String body, // Nội dung tin nhắn.
        Instant sentAt // Thời điểm gửi tin nhắn.
) {

    public static ChatMessageDTO from(ChatMessage m, Long viewerId) {
        return new ChatMessageDTO(m.getId(), m.getSenderId().equals(viewerId), m.getBody(), m.getSentAt());
    }
}
