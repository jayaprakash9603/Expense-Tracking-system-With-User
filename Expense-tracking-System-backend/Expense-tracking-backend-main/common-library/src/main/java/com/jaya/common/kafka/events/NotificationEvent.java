package com.jaya.common.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Notification Event - Generic notification event used across all services.
 * This is the base notification structure that can be extended for specific use
 * cases.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Unique event ID for correlation
     */
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    /**
     * Event timestamp
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Type of notification
     */
    private String notificationType;

    /**
     * Target user ID who will receive the notification
     */
    private Integer targetUserId;

    /**
     * Source user ID who triggered the notification (if applicable)
     */
    private Integer sourceUserId;

    /**
     * Notification title
     */
    private String title;

    /**
     * Notification message
     */
    private String message;

    /**
     * Entity type related to this notification
     */
    private String entityType;

    /**
     * Entity ID related to this notification
     */
    private Long entityId;

    /**
     * Priority level
     */
    @Builder.Default
    private String priority = Priority.NORMAL;

    /**
     * Channels to send notification (push, email, in-app)
     */
    private String[] channels;

    /**
     * Additional data payload
     */
    private Map<String, Object> data;

    /**
     * Action URL for the notification
     */
    private String actionUrl;

    /**
     * Icon for the notification
     */
    private String icon;

    /**
     * Source service
     */
    private String sourceService;

    /**
     * Whether the notification has been read
     */
    @Builder.Default
    private Boolean isRead = false;

    // Notification type constants
    public static class Type {
        // Expense related
        public static final String EXPENSE_CREATED = "EXPENSE_CREATED";
        public static final String EXPENSE_UPDATED = "EXPENSE_UPDATED";
        public static final String EXPENSE_DELETED = "EXPENSE_DELETED";

        // Budget related
        public static final String BUDGET_CREATED = "BUDGET_CREATED";
        public static final String BUDGET_UPDATED = "BUDGET_UPDATED";
        public static final String BUDGET_EXCEEDED = "BUDGET_EXCEEDED";
        public static final String BUDGET_THRESHOLD_WARNING = "BUDGET_THRESHOLD_WARNING";

        // Bill related
        public static final String BILL_CREATED = "BILL_CREATED";
        public static final String BILL_DUE_SOON = "BILL_DUE_SOON";
        public static final String BILL_OVERDUE = "BILL_OVERDUE";
        public static final String BILL_PAID = "BILL_PAID";

        // Friend related
        public static final String FRIEND_REQUEST_RECEIVED = "FRIEND_REQUEST_RECEIVED";
        public static final String FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED";
        public static final String FRIEND_ACTIVITY = "FRIEND_ACTIVITY";

        // System related
        public static final String SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT";
        public static final String SECURITY_ALERT = "SECURITY_ALERT";

        private Type() {
        }
    }

    // Priority constants
    public static class Priority {
        public static final String LOW = "LOW";
        public static final String NORMAL = "NORMAL";
        public static final String HIGH = "HIGH";
        public static final String URGENT = "URGENT";

        private Priority() {
        }
    }

    // Channel constants
    public static class Channel {
        public static final String IN_APP = "IN_APP";
        public static final String PUSH = "PUSH";
        public static final String EMAIL = "EMAIL";
        public static final String SMS = "SMS";

        private Channel() {
        }
    }
}
