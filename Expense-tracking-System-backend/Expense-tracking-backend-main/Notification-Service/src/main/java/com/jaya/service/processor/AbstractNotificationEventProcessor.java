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

/**
 * Abstract base class for notification event processors
 * Implements Template Method pattern and DRY principle
 * Follows Single Responsibility Principle - handles common processing logic
 */
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

            // Check if notification should be sent based on user preferences
            if (!preferencesChecker.shouldSendNotification(userId, notificationType)) {
                log.info("Skipping {} notification for user {} due to preferences",
                        notificationType, userId);
                return;
            }

            // Create notification entity
            Notification notification = buildNotification(event);

            // Save to database
            Notification savedNotification = notificationRepository.save(notification);
            log.info("Created notification ID {} for user {}: {}",
                    savedNotification.getId(), userId, notificationType);

            // Send real-time notification via WebSocket
            sendRealTimeNotification(userId, savedNotification);

        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage(), e);
            // Don't throw exception to avoid breaking Kafka consumer
        }
    }

    /**
     * Build notification entity from event
     * Template method to be implemented by subclasses
     * 
     * @param event Event to build notification from
     * @return Notification entity
     */
    protected abstract Notification buildNotification(T event);

    /**
     * Send real-time notification via WebSocket
     * 
     * @param userId       User ID to send notification to
     * @param notification Notification to send
     */
    protected void sendRealTimeNotification(Integer userId, Notification notification) {
        try {
            // Use broadcast pattern /topic/user/{userId}/notifications
            // This works WITHOUT requiring Principal/authenticated session
            String destination = "/topic/user/" + userId + "/notifications";
            messagingTemplate.convertAndSend(destination, notification);

            log.info("Sent real-time notification to user {} via WebSocket", userId);
        } catch (Exception e) {
            log.warn("Failed to send real-time notification via WebSocket: {}", e.getMessage());
            // Don't fail the whole process if WebSocket fails
        }
    }

    /**
     * Helper method to create common notification fields
     */
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

    /**
     * Converts camelCase notification type string to enum
     * Examples: "expenseAdded" -> EXPENSE_ADDED, "budgetExceeded" ->
     * BUDGET_EXCEEDED
     */
    private NotificationType convertToNotificationType(String notificationType) {
        // Convert camelCase to UPPER_SNAKE_CASE
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
