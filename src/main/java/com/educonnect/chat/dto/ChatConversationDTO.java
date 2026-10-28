package com.educonnect.chat.dto;

import com.educonnect.chat.domain.ChatConversation;
import java.time.Instant;

/** Một cuộc trò chuyện nhìn từ phía người dùng: tên người kia và có phải học viên không. */
public record ChatConversationDTO(Long id, String otherName, Long tutorId, boolean viewerIsLearner, Instant lastMessageAt) {

    public static ChatConversationDTO from(ChatConversation c, Long viewerId) {
        boolean learner = c.getLearnerId().equals(viewerId);
        String other = (learner ? c.getTutorReference().getAccount() : c.getLearnerReference().getAccount()).getDisplayName();
        return new ChatConversationDTO(c.getId(), other, c.getTutorId(), learner, c.getLastMessageAt());
    }
}
