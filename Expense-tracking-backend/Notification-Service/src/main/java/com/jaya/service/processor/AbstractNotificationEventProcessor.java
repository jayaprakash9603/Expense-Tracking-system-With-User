package com.jaya.service.processor;

import com.jaya.modal.Notification;
import com.jaya.modal.NotificationPriority;
import com.jaya.modal.NotificationType;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractNotificationEventProcessor<T> implements NotificationEventProcessor<T> {

    protected final NotificationPreferencesChecker preferencesChecker;
    protected final NotificationRepository notificationRepository;
    protected final SimpMessagingTemplate messagingTemplate;

    @Override
    public void process(T event) {
        try {
            Integer userId = getUserId(event);
            String notificationType = getNotificationType(event);

            log.debug("Processing {} event for user {}", notificationType, userId);

            if (!preferencesChecker.shouldSendNotification(userId, notificationType)) {
                log.info("Skipping {} notification for user {} due to preferences",
                        notificationType, userId);
                return;
            }
            Notification notification = buildNotification(event);
            Notification savedNotification = notificationRepository.save(notification);
            log.info("Created notification ID {} for user {}: {}",
                    savedNotification.getId(), userId, notificationType);
            sendRealTimeNotification(userId, savedNotification);

        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage(), e);
        }
    }

    protected abstract Notification buildNotification(T event);

    protected void sendRealTimeNotification(Integer userId, Notification notification) {
        try {
            String destination = "/topic/user/" + userId + "/notifications";
            messagingTemplate.convertAndSend(destination, notification);

            log.info("Sent real-time notification to user {} via WebSocket", userId);
        } catch (Exception e) {
            log.warn("Failed to send real-time notification via WebSocket: {}", e.getMessage());
        }
    }

    protected Notification createBaseNotification(Integer userId, String type, String title,
            String message, String priority) {
        return Notification.builder()
                .userId(userId)
                .type(convertToNotificationType(type))
                .title(title)
                .message(message)
                .priority(NotificationPriority.valueOf(priority))
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private NotificationType convertToNotificationType(String notificationType) {
        String enumName = notificationType
                .replaceAll("([a-z])([A-Z])", "$1_$2")
                .toUpperCase();

        try {
            return NotificationType.valueOf(enumName);
        } catch (IllegalArgumentException e) {
            log.warn("Unknown notification type: {}. Using CUSTOM_ALERT as fallback.", notificationType);
            return NotificationType.CUSTOM_ALERT;
        }
    }
}
