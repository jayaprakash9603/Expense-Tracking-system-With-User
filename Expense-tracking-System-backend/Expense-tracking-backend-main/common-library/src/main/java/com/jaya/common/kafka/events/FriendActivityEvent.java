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
 * Friend Activity Event - Used for friend activity feed.
 * Sent when a friend performs an activity that should appear in other users'
 * feeds.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FriendActivityEvent implements Serializable {

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

    // Actor information (the friend who performed the action)
    private Integer actorUserId;
    private String actorUsername;
    private String actorFullName;
    private String actorImage;

    // Activity information
    private String activityType;
    private String entityType;
    private Long entityId;
    private String entityName;
    private String description;
    private Double amount;

    // Entity payload for rich activity display
    private Map<String, Object> entityPayload;

    // Source service
    private String sourceService;

    // Activity type constants
    public static class ActivityType {
        // Expense activities
        public static final String EXPENSE_ADDED = "EXPENSE_ADDED";
        public static final String EXPENSE_UPDATED = "EXPENSE_UPDATED";

        // Budget activities
        public static final String BUDGET_CREATED = "BUDGET_CREATED";
        public static final String BUDGET_ACHIEVED = "BUDGET_ACHIEVED";

        // Category activities
        public static final String CATEGORY_CREATED = "CATEGORY_CREATED";

        // Payment method activities
        public static final String PAYMENT_METHOD_ADDED = "PAYMENT_METHOD_ADDED";

        // Bill activities
        public static final String BILL_PAID = "BILL_PAID";

        // Achievement activities
        public static final String SAVINGS_GOAL_REACHED = "SAVINGS_GOAL_REACHED";
        public static final String STREAK_ACHIEVED = "STREAK_ACHIEVED";

        private ActivityType() {
        }
    }
}
