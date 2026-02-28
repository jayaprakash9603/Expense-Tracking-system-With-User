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

@Controller
@Slf4j
@RequiredArgsConstructor
public class NotificationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @MessageMapping("/notifications/subscribe")
    public void subscribeToNotifications(@Payload String userId, Principal principal) {
        try {
            log.info("User {} subscribed to notifications", userId);
            String destination = "/topic/user/" + userId + "/notifications";
            messagingTemplate.convertAndSend(
                    destination,
                    "{\"type\":\"SUBSCRIPTION_CONFIRMED\",\"message\":\"Successfully subscribed to notifications\"}");

            log.debug("Subscription confirmed for user {}", userId);
        } catch (Exception e) {
            log.error("Error handling notification subscription: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/notifications/read")
    public void markNotificationAsRead(@Payload String message) {
        try {
            log.debug("Received read acknowledgment: {}", message);
        } catch (Exception e) {
            log.error("Error handling read acknowledgment: {}", e.getMessage(), e);
        }
    }

    public void sendNotificationToUser(Integer userId, Notification notification) {
        try {
            String destination = String.format("/user/%d/queue/notifications", userId);
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Notification sent to user {}: {}", userId, notification.getTitle());
        } catch (Exception e) {
            log.error("Error sending notification to user {}: {}", userId, e.getMessage(), e);
        }
    }

    public void broadcastNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("Broadcast notification sent: {}", notification.getTitle());
        } catch (Exception e) {
            log.error("Error broadcasting notification: {}", e.getMessage(), e);
        }
    }
}
