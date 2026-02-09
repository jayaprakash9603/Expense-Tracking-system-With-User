package com.jaya.controller;

import com.jaya.config.WebSocketConfig;
import com.jaya.dto.UserDto;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class TypingIndicatorController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private WebSocketConfig webSocketConfig;

    private final Map<String, Long> typingTimestamps = new ConcurrentHashMap<>();

    @MessageMapping("/typing")
    public void handleTyping(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        Integer senderId = extractUserId(payload, headerAccessor);
        if (senderId == null) return;

        Integer recipientId = payload.get("recipientId") != null 
            ? Integer.parseInt(payload.get("recipientId").toString()) 
            : null;
        Integer groupId = payload.get("groupId") != null 
            ? Integer.parseInt(payload.get("groupId").toString()) 
            : null;
        Boolean isTyping = payload.get("isTyping") != null 
            ? Boolean.parseBoolean(payload.get("isTyping").toString()) 
            : false;

        Map<String, Object> response = new HashMap<>();
        response.put("senderId", senderId);
        response.put("isTyping", isTyping);
        response.put("timestamp", System.currentTimeMillis());

        if (recipientId != null) {
            response.put("conversationType", "ONE_TO_ONE");
            response.put("recipientId", recipientId);
            messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/typing",
                response
            );
        } else if (groupId != null) {
            response.put("conversationType", "GROUP");
            response.put("groupId", groupId);
            messagingTemplate.convertAndSend(
                "/topic/group/" + groupId + "/typing",
                response
            );
        }
    }

    @MessageMapping("/typing/start")
    public void startTyping(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        payload.put("isTyping", true);
        handleTyping(payload, headerAccessor);
    }

    @MessageMapping("/typing/stop")
    public void stopTyping(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        payload.put("isTyping", false);
        handleTyping(payload, headerAccessor);
    }

    private Integer extractUserId(Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        // First try to get from session map (most reliable)
        String sessionId = headerAccessor.getSessionId();
        Integer userId = webSocketConfig.getUserIdBySession(sessionId);
        if (userId != null) {
            return userId;
        }

        // Then try payload
        if (payload.containsKey("senderId")) {
            return Integer.parseInt(payload.get("senderId").toString());
        }

        // Finally try session attributes
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            return (Integer) sessionAttributes.get("userId");
        }

        // Last resort - try JWT
        String jwt = null;
        if (headerAccessor.getNativeHeader("Authorization") != null) {
            jwt = headerAccessor.getNativeHeader("Authorization").get(0);
        } else if (sessionAttributes != null) {
            jwt = (String) sessionAttributes.get("jwt");
        }

        if (jwt != null) {
            try {
                UserDto user = userService.getuserProfile(jwt);
                return user != null ? user.getId() : null;
            } catch (Exception e) {
                return null;
            }
        }

        return null;
    }
}
