package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Common Notification DTO used across all microservices.
 * Contains notification information for inter-service communication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer userId;

    private String type;

    private String title;

    private String message;

    private String priority;

    private String channel;

    private boolean read;

    private boolean dismissed;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    // Action-related fields
    private String actionType;

    private String actionUrl;

    private Map<String, Object> actionData;

    // Related entity
    private String entityType;

    private String entityId;

    // Sender information
    private Integer senderId;

    private String senderName;

    private String senderImage;

    // ==================== Notification Types ====================

    public static final String TYPE_EXPENSE = "EXPENSE";
    public static final String TYPE_BUDGET = "BUDGET";
    public static final String TYPE_BILL = "BILL";
    public static final String TYPE_FRIEND_REQUEST = "FRIEND_REQUEST";
    public static final String TYPE_FRIEND_ACTIVITY = "FRIEND_ACTIVITY";
    public static final String TYPE_SYSTEM = "SYSTEM";
    public static final String TYPE_REMINDER = "REMINDER";
    public static final String TYPE_ALERT = "ALERT";

    // ==================== Notification Priorities ====================

    public static final String PRIORITY_LOW = "LOW";
    public static final String PRIORITY_NORMAL = "NORMAL";
    public static final String PRIORITY_HIGH = "HIGH";
    public static final String PRIORITY_URGENT = "URGENT";

    // ==================== Notification Channels ====================

    public static final String CHANNEL_IN_APP = "IN_APP";
    public static final String CHANNEL_EMAIL = "EMAIL";
    public static final String CHANNEL_SMS = "SMS";
    public static final String CHANNEL_PUSH = "PUSH";

    // ==================== Factory Methods ====================

    /**
     * Create a basic notification
     */
    public static NotificationDTO basic(Integer userId, String type, String title, String message) {
        return NotificationDTO.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .priority(PRIORITY_NORMAL)
                .channel(CHANNEL_IN_APP)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Create a budget alert notification
     */
    public static NotificationDTO budgetAlert(Integer userId, String budgetName, double percentage) {
        String title = percentage >= 100 ? "Budget Exceeded!" : "Budget Warning";
        String message = String.format("Your budget '%s' has reached %.0f%% of its limit", budgetName, percentage);
        String priority = percentage >= 100 ? PRIORITY_URGENT : PRIORITY_HIGH;

        return NotificationDTO.builder()
                .userId(userId)
                .type(TYPE_BUDGET)
                .title(title)
                .message(message)
                .priority(priority)
                .channel(CHANNEL_IN_APP)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Create a friend request notification
     */
    public static NotificationDTO friendRequest(Integer userId, Integer senderId, String senderName) {
        return NotificationDTO.builder()
                .userId(userId)
                .type(TYPE_FRIEND_REQUEST)
                .title("New Friend Request")
                .message(senderName + " sent you a friend request")
                .priority(PRIORITY_NORMAL)
                .channel(CHANNEL_IN_APP)
                .senderId(senderId)
                .senderName(senderName)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Create a bill reminder notification
     */
    public static NotificationDTO billReminder(Integer userId, String billName, LocalDateTime dueDate) {
        return NotificationDTO.builder()
                .userId(userId)
                .type(TYPE_REMINDER)
                .title("Bill Due Soon")
                .message(String.format("Bill '%s' is due on %s", billName, dueDate.toLocalDate()))
                .priority(PRIORITY_HIGH)
                .channel(CHANNEL_IN_APP)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
