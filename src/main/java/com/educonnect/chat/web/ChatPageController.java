package com.educonnect.chat.web;

import com.educonnect.chat.dto.ChatConversationDTO;
import com.educonnect.chat.dto.ChatMessageDTO;
import com.educonnect.chat.service.ChatService;
import com.educonnect.contract.service.ContractListService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;

@Controller
public class ChatPageController {
    private ObjectProvider<ChatService> services;
    private ObjectProvider<ContractListService> contractLists;

    public ChatPageController(ObjectProvider<ChatService> services, ObjectProvider<ContractListService> contractLists) {
        this.services = services;
        this.contractLists = contractLists;
    }

    /** Trang tin nhắn: danh sách cuộc trò chuyện và nội dung cuộc đang chọn (mặc định là cuộc mới nhất). */
    @GetMapping("/chat/messages")
    public String messages(@RequestParam(value = "conversation", required = false) Long conversationId,
                           @AuthenticationPrincipal AccountPrincipal user, Model model) {
        ChatService service = services.getIfAvailable();
        if (service != null) {
            List<ChatConversationDTO> list = service.conversations(user);
            model.addAttribute("conversations", list);
            Long current = conversationId != null ? conversationId : list.isEmpty() ? null : list.get(0).id();
            if (current != null) {
                ChatConversationDTO chosen = service.conversation(user, current);
                model.addAttribute("current", chosen);
                ContractListService contracts = contractLists.getIfAvailable();
                model.addAttribute("linked", contracts == null ? List.of() : contracts.with(user, chosen.otherId()));
                model.addAttribute("chatMessages", service.messages(user, current));
                service.markRead(user, current);
            }
        }
        return "pages/chat/messages";
    }

    /**
     * Mở hoặc tạo cuộc trò chuyện rồi vào trang tin nhắn: học viên truyền ?tutor=<mã gia sư>,
     * gia sư truyền ?learner=<mã học viên>.
     */
    @GetMapping("/chat/with")
    public String with(@RequestParam(value = "tutor", required = false) Long tutorId,
                       @RequestParam(value = "learner", required = false) Long learnerId,
                       @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        ChatService service = require();
        try {
            Long id = tutorId != null ? service.open(user, tutorId) : service.openWithLearner(user, learnerId);
            return "redirect:/chat/messages?conversation=" + id;
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
            return "redirect:/chat/messages";
        }
    }

    /** Gửi tin nhắn rồi quay lại cuộc trò chuyện. */
    @PostMapping("/chat/send")
    public String send(@RequestParam("conversation") Long conversationId, @RequestParam(defaultValue = "") String body,
                       @AuthenticationPrincipal AccountPrincipal user, RedirectAttributes redirect) {
        try {
            require().send(user, conversationId, body);
        } catch (IllegalArgumentException error) {
            redirect.addFlashAttribute("error", error.getMessage());
        }
        return "redirect:/chat/messages?conversation=" + conversationId;
    }

    /** Tin mới hơn mã tin `after` dạng JSON, để trang tự cập nhật. */
    @GetMapping("/chat/poll")
    @ResponseBody
    public List<ChatMessageDTO> poll(@RequestParam("conversation") Long conversationId,
                                     @RequestParam(defaultValue = "0") Long after,
                                     @AuthenticationPrincipal AccountPrincipal user) {
        ChatService service = require();
        List<ChatMessageDTO> items = service.newMessages(user, conversationId, after);
        if (!items.isEmpty()) service.markRead(user, conversationId);
        return items;
    }

    /** Danh sách cuộc trò chuyện dạng JSON cho cửa sổ chat nổi. */
    @GetMapping("/chat/widget/conversations")
    @ResponseBody
    public List<ChatConversationDTO> widgetConversations(@AuthenticationPrincipal AccountPrincipal user) {
        return require().conversations(user);
    }

    /** Tin gần nhất của một cuộc trò chuyện dạng JSON cho cửa sổ chat nổi. */
    @GetMapping("/chat/widget/messages")
    @ResponseBody
    public List<ChatMessageDTO> widgetMessages(@RequestParam("conversation") Long conversationId,
                                               @AuthenticationPrincipal AccountPrincipal user) {
        ChatService service = require();
        List<ChatMessageDTO> items = service.messages(user, conversationId);
        service.markRead(user, conversationId);
        return items;
    }

    /** Mở hoặc tạo cuộc trò chuyện như /chat/with nhưng trả JSON để cửa sổ chat nổi mở ngay, không chuyển trang. */
    @GetMapping("/chat/widget/open")
    @ResponseBody
    public ResponseEntity<?> widgetOpen(@RequestParam(value = "tutor", required = false) Long tutorId,
                                        @RequestParam(value = "learner", required = false) Long learnerId,
                                        @AuthenticationPrincipal AccountPrincipal user) {
        ChatService service = require();
        try {
            Long id = tutorId != null ? service.open(user, tutorId) : service.openWithLearner(user, learnerId);
            return ResponseEntity.ok(service.conversation(user, id));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        }
    }

    /** Gửi tin từ cửa sổ chat nổi; lỗi nội dung trả 400 kèm thông báo. */
    @PostMapping("/chat/widget/send")
    @ResponseBody
    public ResponseEntity<?> widgetSend(@RequestParam("conversation") Long conversationId, @RequestParam(defaultValue = "") String body,
                                        @AuthenticationPrincipal AccountPrincipal user) {
        try {
            require().send(user, conversationId, body);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        }
    }

    private ChatService require() {
        ChatService service = services.getIfAvailable();
        if (service == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        return service;
    }
}
