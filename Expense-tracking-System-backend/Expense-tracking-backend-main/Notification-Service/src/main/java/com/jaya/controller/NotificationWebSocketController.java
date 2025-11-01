package com.jaya.controller;

import com.jaya.modal.Notification;
import com.jaya.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket Controller for real-time notifications
 * Handles WebSocket connections and message routing
 */
@Controller
@Slf4j
@RequiredArgsConstructor
public class NotificationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    /**
     * Handle subscription acknowledgment
     * When a user connects to WebSocket, send them their pending notifications
     * 
     * Frontend sends to: /app/notifications/subscribe
     * Message: { "userId": 123 }
     */
    @MessageMapping("/notifications/subscribe")
    public void subscribeToNotifications(@Payload String userId, Principal principal) {
        try {
            log.info("User {} subscribed to notifications", userId);

            // Send acknowledgment using broadcast pattern
            String destination = "/topic/user/" + userId + "/notifications";
            messagingTemplate.convertAndSend(
                    destination,
                    "{\"type\":\"SUBSCRIPTION_CONFIRMED\",\"message\":\"Successfully subscribed to notifications\"}");

            log.debug("Subscription confirmed for user {}", userId);
        } catch (Exception e) {
            log.error("Error handling notification subscription: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle notification read acknowledgment from client
     * 
     * Frontend sends to: /app/notifications/read
     * Message: { "notificationId": 123, "userId": 456 }
     */
    @MessageMapping("/notifications/read")
    public void markNotificationAsRead(@Payload String message) {
        try {
            log.debug("Received read acknowledgment: {}", message);
            // Can be used to track notification delivery and read status
        } catch (Exception e) {
            log.error("Error handling read acknowledgment: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification to a specific user
     * This method can be called from anywhere in the application
     */
    public void sendNotificationToUser(Integer userId, Notification notification) {
        try {
            String destination = String.format("/user/%d/queue/notifications", userId);
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Notification sent to user {}: {}", userId, notification.getTitle());
        } catch (Exception e) {
            log.error("Error sending notification to user {}: {}", userId, e.getMessage(), e);
        }
    }

    /**
     * Broadcast notification to all connected users
     * Used for system-wide announcements
     */
    public void broadcastNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("Broadcast notification sent: {}", notification.getTitle());
        } catch (Exception e) {
            log.error("Error broadcasting notification: {}", e.getMessage(), e);
        }
    }
}
