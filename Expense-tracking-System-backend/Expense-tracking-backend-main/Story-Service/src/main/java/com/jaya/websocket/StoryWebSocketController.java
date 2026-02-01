package com.jaya.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * WebSocket Controller for handling story-related client messages
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class StoryWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle story subscription from client
     * Client sends to: /app/stories/subscribe
     */
    @MessageMapping("/stories/subscribe")
    public void subscribeToStories(@Payload Map<String, Object> payload, Principal principal) {
        try {
            String userId = payload.get("userId") != null ? payload.get("userId").toString() : "unknown";
            log.info("User {} subscribed to stories", userId);

            // Send subscription confirmation
            String destination = "/topic/stories/user/" + userId;
            messagingTemplate.convertAndSend(destination, Map.of(
                    "type", "SUBSCRIPTION_CONFIRMED",
                    "message", "Successfully subscribed to story updates",
                    "timestamp", System.currentTimeMillis()));

        } catch (Exception e) {
            log.error("Error handling story subscription: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle story seen acknowledgment from client
     * Client sends to: /app/stories/seen
     */
    @MessageMapping("/stories/seen")
    public void markStorySeen(@Payload Map<String, Object> payload) {
        try {
            String storyId = payload.get("storyId").toString();
            String userId = payload.get("userId").toString();
            log.debug("Story {} marked as seen by user {}", storyId, userId);
            // The actual marking is done via REST API, this is just for
            // logging/acknowledgment
        } catch (Exception e) {
            log.error("Error handling story seen: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle story dismissed from client
     * Client sends to: /app/stories/dismiss
     */
    @MessageMapping("/stories/dismiss")
    public void dismissStory(@Payload Map<String, Object> payload) {
        try {
            String storyId = payload.get("storyId").toString();
            String userId = payload.get("userId").toString();
            log.debug("Story {} dismissed by user {}", storyId, userId);
        } catch (Exception e) {
            log.error("Error handling story dismiss: {}", e.getMessage(), e);
        }
    }
}
