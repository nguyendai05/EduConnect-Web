package com.educonnect.contract.web;

import com.educonnect.chat.service.ChatService;
import com.educonnect.contract.service.PendingWorkService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Số liệu cho chấm đỏ trên header: việc đang chờ và tin nhắn chưa đọc. */
@RestController
public class HeaderBadgesController {
    private ObjectProvider<PendingWorkService> pending;
    private ObjectProvider<ChatService> chat;

    public HeaderBadgesController(ObjectProvider<PendingWorkService> pending, ObjectProvider<ChatService> chat) {
        this.pending = pending;
        this.chat = chat;
    }

    /** Trả {pending, chatUnread}; thiếu dịch vụ (chế độ xem trước) thì trả 0. */
    @GetMapping("/header/badges")
    public Map<String, Long> badges(@AuthenticationPrincipal AccountPrincipal user) {
        PendingWorkService work = pending.getIfAvailable();
        ChatService messages = chat.getIfAvailable();
        return Map.of("pending", work == null ? 0L : work.count(user), "chatUnread", messages == null ? 0L : messages.unread(user));
    }
}
