package com.educonnect.chat.dto;

import com.educonnect.chat.domain.ChatConversation;
import java.time.Instant;

/** Một cuộc trò chuyện nhìn từ phía người dùng: tên người kia và có phải học viên không. */
public record ChatConversationDTO(
        Long id, // ID cuộc trò chuyện.
        String otherName, // Tên hiển thị của người trò chuyện cùng.
        Long tutorId, // ID tài khoản gia sư.
        boolean viewerIsLearner, // Cho biết người đang xem là học viên trong cuộc trò chuyện hay không.
        Instant lastMessageAt, // Thời điểm tin nhắn gần nhất trong cuộc trò chuyện.
        Long otherId // ID tài khoản của người trò chuyện cùng.
) {

    public static ChatConversationDTO from(ChatConversation c, Long viewerId) {
        boolean learner = c.getLearnerId().equals(viewerId);
        String other = (learner ? c.getTutorReference().getAccount() : c.getLearnerReference().getAccount()).getDisplayName();
        return new ChatConversationDTO(c.getId(), other, c.getTutorId(), learner, c.getLastMessageAt(),
                learner ? c.getTutorId() : c.getLearnerId());
    }
}
