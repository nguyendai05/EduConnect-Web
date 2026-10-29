package com.educonnect.chat.service;

import com.educonnect.chat.domain.ChatConversation;
import com.educonnect.chat.domain.ChatMessage;
import com.educonnect.chat.dto.ChatConversationDTO;
import com.educonnect.chat.dto.ChatMessageDTO;
import com.educonnect.chat.repository.ChatConversationJpaRepository;
import com.educonnect.chat.repository.ChatMessageJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.tutor.domain.TutorProfile;
import com.educonnect.user.domain.LearnerProfile;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.util.Collections;
import java.util.List;

/** Nhắn tin giữa người học và gia sư; chỉ hai bên của cuộc trò chuyện được đọc và gửi. */
@Service
@Profile("db-dev")
@Transactional
public class ChatService {
    private ChatConversationJpaRepository conversations;
    private ChatMessageJpaRepository messages;
    private EntityManager entityManager;
    private Clock clock;

    public ChatService(ChatConversationJpaRepository conversations, ChatMessageJpaRepository messages,
                       EntityManager entityManager, Clock clock) {
        this.conversations = conversations;
        this.messages = messages;
        this.entityManager = entityManager;
        this.clock = clock;
    }

    /** Người học mở cuộc trò chuyện với một gia sư, tạo mới nếu chưa có. Trả về mã cuộc trò chuyện. */
    public Long open(AccountPrincipal user, Long tutorId) {
        requireRole(user, "ROLE_LEARNER");
        if (user.getId().equals(tutorId) || entityManager.find(TutorProfile.class, tutorId) == null) {
            throw new IllegalArgumentException("Không tìm thấy gia sư");
        }
        return conversation(user.getId(), tutorId);
    }

    /** Gia sư mở cuộc trò chuyện với một học viên (ví dụ người đăng tin), tạo mới nếu chưa có. */
    public Long openWithLearner(AccountPrincipal user, Long learnerId) {
        requireRole(user, "ROLE_TUTOR");
        if (user.getId().equals(learnerId) || entityManager.find(LearnerProfile.class, learnerId) == null) {
            throw new IllegalArgumentException("Không tìm thấy học viên");
        }
        return conversation(learnerId, user.getId());
    }

    /** Cuộc trò chuyện của một cặp học viên - gia sư; tạo mới nếu chưa có. */
    private Long conversation(Long learnerId, Long tutorId) {
        return conversations.findByLearnerIdAndTutorId(learnerId, tutorId).orElseGet(() -> {
            ChatConversation c = ChatConversation.create();
            c.setLearnerId(learnerId);
            c.setTutorId(tutorId);
            c.setCreatedAt(clock.instant());
            return conversations.save(c);
        }).getId();
    }

    private static void requireRole(AccountPrincipal user, String role) {
        if (!user.getAuthorities().contains(new SimpleGrantedAuthority(role))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    /** Danh sách cuộc trò chuyện của người đăng nhập, mới nhất trước. */
    @Transactional(readOnly = true)
    public List<ChatConversationDTO> conversations(AccountPrincipal user) {
        return conversations.findMine(user.getId()).stream().map(c -> ChatConversationDTO.from(c, user.getId())).toList();
    }

    /** Một cuộc trò chuyện của người đăng nhập; người ngoài nhận 404. */
    @Transactional(readOnly = true)
    public ChatConversationDTO conversation(AccountPrincipal user, Long id) {
        return ChatConversationDTO.from(own(user, id), user.getId());
    }

    /** 100 tin gần nhất, cũ trước. */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> messages(AccountPrincipal user, Long id) {
        own(user, id);
        List<ChatMessage> latest = messages.findTop100ByConversationIdOrderByIdDesc(id);
        Collections.reverse(latest);
        return latest.stream().map(m -> ChatMessageDTO.from(m, user.getId())).toList();
    }

    /** Tin mới hơn mã tin afterId, cho trang hỏi định kỳ. */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> newMessages(AccountPrincipal user, Long id, Long afterId) {
        own(user, id);
        return messages.findByConversationIdAndIdGreaterThanOrderById(id, afterId).stream()
                .map(m -> ChatMessageDTO.from(m, user.getId())).toList();
    }

    /** Đánh dấu người dùng đã xem cuộc trò chuyện tới thời điểm hiện tại. */
    public void markRead(AccountPrincipal user, Long id) {
        ChatConversation conversation = own(user, id);
        if (conversation.getLearnerId().equals(user.getId())) conversation.setLearnerReadAt(clock.instant());
        else conversation.setTutorReadAt(clock.instant());
    }

    /** Tổng số tin chưa xem của người dùng. */
    @Transactional(readOnly = true)
    public long unread(AccountPrincipal user) {
        return messages.countUnread(user.getId());
    }

    /** Gửi một tin văn bản (1 đến 1000 ký tự) vào cuộc trò chuyện của mình. */
    public void send(AccountPrincipal user, Long id, String body) {
        ChatConversation conversation = own(user, id);
        String text = body == null ? "" : body.trim();
        if (text.isEmpty() || text.length() > 1000) throw new IllegalArgumentException("Tin nhắn cần từ 1 đến 1000 ký tự");
        ChatMessage message = ChatMessage.create();
        message.setConversationId(id);
        message.setSenderId(user.getId());
        message.setBody(text);
        message.setSentAt(clock.instant());
        messages.save(message);
        conversation.setLastMessageAt(message.getSentAt());
    }

    private ChatConversation own(AccountPrincipal user, Long id) {
        return conversations.findForParticipant(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cuộc trò chuyện"));
    }
}
