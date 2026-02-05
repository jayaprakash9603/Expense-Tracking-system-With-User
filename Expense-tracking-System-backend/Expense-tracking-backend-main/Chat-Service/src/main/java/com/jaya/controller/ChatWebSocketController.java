package com.jaya.controller;

import com.jaya.config.WebSocketConfig;
import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import com.jaya.dto.UserDto;
import com.jaya.service.ChatService;
import com.jaya.service.PresenceService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatWebSocketController {
    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private PresenceService presenceService;

    @Autowired
    private WebSocketConfig webSocketConfig;

    @MessageMapping("/send/one-to-one")
    public void sendOneToOneChat(@Payload ChatRequest request, SimpMessageHeaderAccessor headerAccessor) {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null) return;

        ChatResponse response = chatService.sendOneToOneChat(request, userId);
        
        messagingTemplate.convertAndSendToUser(
            request.getRecipientId().toString(),
            "/queue/chats",
            response
        );
        
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/chats",
            response
        );
    }

    @MessageMapping("/send/group")
    public void sendGroupChat(@Payload ChatRequest request, SimpMessageHeaderAccessor headerAccessor) {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null) return;

        chatService.sendGroupChat(request, userId);
    }

    @MessageMapping("/forward")
    public void forwardMessage(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null) return;

        Integer originalMessageId = Integer.parseInt(payload.get("messageId").toString());
        @SuppressWarnings("unchecked")
        java.util.List<Integer> recipientIds = (java.util.List<Integer>) payload.get("recipientIds");
        
        if (recipientIds == null || recipientIds.isEmpty()) return;
        
        for (Integer recipientId : recipientIds) {
            try {
                ChatResponse response = chatService.forwardMessage(originalMessageId, recipientId, userId);
                
                messagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/chats",
                    response
                );
                
                messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/chats",
                    response
                );
            } catch (Exception e) {
                // Log error but continue with other recipients
            }
        }
    }

    @MessageMapping("/mark-read")
    public void markChatAsRead(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null) return;

        Integer chatId = Integer.parseInt(payload.get("chatId").toString());
        ChatResponse response = chatService.markChatAsRead(chatId, userId);

        if (response.getSenderId() != null) {
            Map<String, Object> readReceipt = new HashMap<>();
            readReceipt.put("chatId", chatId);
            readReceipt.put("readBy", userId);
            readReceipt.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSendToUser(
                response.getSenderId().toString(),
                "/queue/read-receipts",
                readReceipt
            );
        }
    }

    @MessageMapping("/mark-delivered")
    public void markChatAsDelivered(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null) return;

        Integer chatId = Integer.parseInt(payload.get("chatId").toString());
        
        Map<String, Object> deliveryReceipt = new HashMap<>();
        deliveryReceipt.put("chatId", chatId);
        deliveryReceipt.put("deliveredTo", userId);
        deliveryReceipt.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/delivery-receipts", deliveryReceipt);
    }

    @MessageMapping("/reaction")
    public void handleReaction(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null) return;

        Integer messageId = Integer.parseInt(payload.get("messageId").toString());
        String emoji = payload.get("emoji") != null ? payload.get("emoji").toString() : null;
        boolean remove = payload.get("remove") != null && Boolean.parseBoolean(payload.get("remove").toString());

        ChatResponse response;
        if (remove) {
            response = chatService.removeReaction(messageId, userId);
        } else {
            response = chatService.addReaction(messageId, emoji, userId, true);
        }

        if (response.getRecipientId() != null) {
            messagingTemplate.convertAndSendToUser(
                response.getRecipientId().toString(),
                "/queue/reactions",
                response
            );
        }
        if (response.getGroupId() != null) {
            messagingTemplate.convertAndSend(
                "/topic/group/" + response.getGroupId() + "/reactions",
                response
            );
        }
    }

    @MessageMapping("/connect")
    public void handleConnect(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        Integer userId = extractUserId(headerAccessor);
        if (userId == null && payload.containsKey("userId")) {
            userId = Integer.parseInt(payload.get("userId").toString());
        }
        
        if (userId != null) {
            String sessionId = headerAccessor.getSessionId();
            webSocketConfig.registerUserSession(sessionId, userId);
            presenceService.setUserOnline(userId, sessionId);
        }
    }

    private Integer extractUserId(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        Integer userId = webSocketConfig.getUserIdBySession(sessionId);
        
        if (userId != null) {
            return userId;
        }

        String jwt = null;
        if (headerAccessor.getNativeHeader("Authorization") != null 
            && !headerAccessor.getNativeHeader("Authorization").isEmpty()) {
            jwt = headerAccessor.getNativeHeader("Authorization").get(0);
        } else if (headerAccessor.getSessionAttributes() != null) {
            jwt = (String) headerAccessor.getSessionAttributes().get("jwt");
        }

        if (jwt != null) {
            try {
                UserDto user = userService.getuserProfile(jwt);
                if (user != null) {
                    webSocketConfig.registerUserSession(sessionId, user.getId());
                    return user.getId();
                }
            } catch (Exception e) {
                return null;
            }
        }

        return null;
    }
}