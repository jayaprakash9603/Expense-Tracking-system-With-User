package com.jaya.kafka.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for consuming unified activity events from Kafka.
 * 
 * This DTO represents events from all services in a standardized format:
 * - expense-service: EXPENSE entity events
 * - budget-service: BUDGET entity events
 * - bill-service: BILL entity events
 * - category-service: CATEGORY entity events
 * - payment-service: PAYMENT entity events
 * - friendship-service: FRIEND/FRIEND_REQUEST entity events
 * 
 * The isFriendActivity flag indicates if this is an action performed
 * by a friend on behalf of another user (vs the user's own action).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UnifiedActivityEventDTO {

    // ============== Core Event Identification ==============

    /**
     * Unique identifier for this event (UUID)
     */
    private String eventId;

    /**
     * Source service that produced this event
     * e.g., "expense-service", "budget-service", "bill-service"
     */
    private String sourceService;

    /**
     * Type of entity involved
     * e.g., "EXPENSE", "BUDGET", "BILL", "CATEGORY", "PAYMENT", "FRIEND"
     */
    private String entityType;

    /**
     * ID of the entity involved
     */
    private Long entityId;

    /**
     * Action performed
     * e.g., "CREATE", "UPDATE", "DELETE", "APPROVE"
     */
    private String action;

    // ============== User Context ==============

    /**
     * User who performed the action (actor)
     */
    private Long actorUserId;

    /**
     * Name of the actor for display purposes
     */
    private String actorUserName;

    /**
     * User who owns the entity / is affected (target)
     * May be same as actorUserId for own actions
     */
    private Long targetUserId;

    /**
     * Full actor user information
     */
    private UserInfo actorUser;

    /**
     * Full target user information
     */
    private UserInfo targetUser;

    // ============== Activity Classification ==============

    /**
     * True if actor performed action on their own entity
     * (actorUserId == targetUserId)
     */
    private Boolean isOwnAction;

    /**
     * True if this is a friend activity (friend acted on user's behalf)
     * Used by FriendShip-Service to track friend activities
     */
    private Boolean isFriendActivity;

    // ============== Entity Details ==============

    /**
     * Human-readable description of the activity
     */
    private String description;

    /**
     * Monetary amount (if applicable)
     */
    private BigDecimal amount;

    /**
     * Full payload of the entity
     */
    private Object entityPayload;

    /**
     * Previous values before update (for UPDATE actions)
     */
    private Map<String, Object> oldValues;

    /**
     * New values after update (for UPDATE actions)
     */
    private Map<String, Object> newValues;

    /**
     * Additional contextual metadata
     */
    private Map<String, Object> metadata;

    // ============== Request Context ==============

    /**
     * IP address of the request origin
     */
    private String ipAddress;

    /**
     * User agent string from the request
     */
    private String userAgent;

    /**
     * Correlation ID for request tracing
     */
    private String correlationId;

    // ============== Timestamps ==============

    /**
     * When the event/action occurred
     */
    private LocalDateTime timestamp;

    /**
     * When the entity was created
     */
    private LocalDateTime createdAt;

    /**
     * When the entity was last modified
     */
    private LocalDateTime modifiedAt;

    /**
     * Nested class representing user information.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserInfo {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String displayName;

        /**
         * Computes display name if not explicitly set
         */
        public String getDisplayName() {
            if (displayName != null && !displayName.isEmpty()) {
                return displayName;
            }
            if (firstName != null && lastName != null) {
                return firstName + " " + lastName;
            }
            if (firstName != null) {
                return firstName;
            }
            if (lastName != null) {
                return lastName;
            }
            return email != null ? email : "Unknown User";
        }
    }
}
