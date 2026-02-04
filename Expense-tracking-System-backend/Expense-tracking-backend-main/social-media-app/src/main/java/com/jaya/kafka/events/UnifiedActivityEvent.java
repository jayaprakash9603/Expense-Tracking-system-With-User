package com.jaya.kafka.events;

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
 * Unified Activity Event - Single event DTO that carries all information needed
 * by:
 * 1. Audit Service - For audit logging
 * 2. Notification Service - For user notifications
 * 3. Friend Activity Service - For friend activity tracking
 * 
 * This eliminates the need for multiple separate event producers and reduces
 * duplicate Kafka messages across the system.
 * 
 * Architecture:
 * - Producer Services: Expense, Budget, Bill, Category, Payment-Method
 * - Consumers: Notification-Service (routes to appropriate handlers),
 * Audit-Service
 * - Single Topic: unified-activity-events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnifiedActivityEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    // =============================================
    // CORE IDENTIFICATION
    // =============================================

    /**
     * Unique event identifier for correlation and deduplication
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

    // =============================================
    // ACTOR INFORMATION (Who performed the action)
    // =============================================

    /**
     * User ID of the person who performed the action
     */
    private Integer actorUserId;

    /**
     * Username of the actor
     */
    private String actorUserName;

    /**
     * Email of the actor
     */
    private String actorEmail;

    /**
     * Role of the actor
     */
    private String actorRole;

    /**
     * Complete actor user details (for rich notifications)
     */
    private UserInfo actorUser;

    // =============================================
    // TARGET INFORMATION (Whose data was affected)
    // =============================================

    /**
     * User ID of the data owner (may be same as actor for own actions)
     */
    private Integer targetUserId;

    /**
     * Username of the target user
     */
    private String targetUserName;

    /**
     * Complete target user details
     */
    private UserInfo targetUser;

    // =============================================
    // ENTITY INFORMATION
    // =============================================

    /**
     * Type of entity: EXPENSE, BILL, BUDGET, CATEGORY, PAYMENT_METHOD
     */
    private String entityType;

    /**
     * ID of the affected entity
     */
    private Long entityId;

    /**
     * Human-readable name of the entity (e.g., expense description, budget name)
     */
    private String entityName;

    // =============================================
    // ACTION INFORMATION
    // =============================================

    /**
     * Action performed: CREATE, UPDATE, DELETE
     */
    private String action;

    /**
     * Human-readable description of the activity
     */
    private String description;

    /**
     * Amount involved (for financial entities)
     */
    private Double amount;

    // =============================================
    // DATA PAYLOADS (For audit and detailed notifications)
    // =============================================

    /**
     * Previous state of the entity (for updates)
     */
    private Map<String, Object> oldValues;

    /**
     * New state of the entity (for creates and updates)
     */
    private Map<String, Object> newValues;

    /**
     * Complete entity payload (for friend activity notifications)
     */
    private Map<String, Object> entityPayload;

    /**
     * Additional metadata as JSON string
     */
    private String metadata;

    // =============================================
    // SOURCE SERVICE INFORMATION
    // =============================================

    /**
     * Source service: EXPENSE-SERVICE, BILL-SERVICE, BUDGET-SERVICE, etc.
     */
    private String sourceService;

    /**
     * Service version for audit tracking
     */
    private String serviceVersion;

    /**
     * Environment: DEV, STAGING, PROD
     */
    private String environment;

    // =============================================
    // REQUEST CONTEXT (For audit trail)
    // =============================================

    /**
     * IP address of the request origin
     */
    private String ipAddress;

    /**
     * User agent/device information
     */
    private String userAgent;

    /**
     * Session ID
     */
    private String sessionId;

    /**
     * Correlation ID for distributed tracing
     */
    private String correlationId;

    /**
     * Request ID
     */
    private String requestId;

    /**
     * HTTP method
     */
    private String httpMethod;

    /**
     * API endpoint
     */
    private String endpoint;

    /**
     * Execution time in milliseconds
     */
    private Long executionTimeMs;

    // =============================================
    // STATUS AND RESULT
    // =============================================

    /**
     * Status: SUCCESS, FAILURE
     */
    @Builder.Default
    private String status = "SUCCESS";

    /**
     * Error message if status is FAILURE
     */
    private String errorMessage;

    /**
     * HTTP response code
     */
    private Integer responseCode;

    // =============================================
    // ROUTING FLAGS (For consumers to determine processing)
    // =============================================

    /**
     * True if actor is the same as target (performing action on own data)
     */
    @Builder.Default
    private Boolean isOwnAction = true;

    /**
     * True if this event should be audited
     */
    @Builder.Default
    private Boolean requiresAudit = true;

    /**
     * True if notification should be sent
     */
    @Builder.Default
    private Boolean requiresNotification = true;

    /**
     * True if this is a friend activity (for Friend Activity Service)
     */
    @Builder.Default
    private Boolean isFriendActivity = false;

    // =============================================
    // INNER CLASSES
    // =============================================

    /**
     * Inner class to hold complete user information
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        private Integer id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String image;
        private String coverImage;
        private String phoneNumber;
        private String location;
        private String bio;
        private String displayName;

        /**
         * Get display name with fallback logic
         */
        public String getDisplayName() {
            if (displayName != null && !displayName.trim().isEmpty()) {
                return displayName;
            }
            if (fullName != null && !fullName.trim().isEmpty()) {
                return fullName;
            }
            if (firstName != null && lastName != null) {
                return firstName + " " + lastName;
            }
            if (firstName != null) {
                return firstName;
            }
            if (username != null && !username.trim().isEmpty()) {
                return username;
            }
            return email;
        }
    }

    // =============================================
    // CONSTANTS
    // =============================================

    /**
     * Source service constants
     */
    public static class SourceService {
        public static final String EXPENSE_SERVICE = "EXPENSE-SERVICE";
        public static final String BUDGET_SERVICE = "BUDGET-SERVICE";
        public static final String BILL_SERVICE = "BILL-SERVICE";
        public static final String CATEGORY_SERVICE = "CATEGORY-SERVICE";
        public static final String PAYMENT_METHOD_SERVICE = "PAYMENT-METHOD-SERVICE";
        public static final String FRIENDSHIP_SERVICE = "FRIENDSHIP-SERVICE";
        public static final String USER_SERVICE = "USER-SERVICE";

        private SourceService() {
        }
    }

    /**
     * Entity type constants
     */
    public static class EntityType {
        public static final String EXPENSE = "EXPENSE";
        public static final String BUDGET = "BUDGET";
        public static final String CATEGORY = "CATEGORY";
        public static final String PAYMENT_METHOD = "PAYMENT_METHOD";
        public static final String BILL = "BILL";
        public static final String USER = "USER";
        public static final String FRIENDSHIP = "FRIENDSHIP";

        private EntityType() {
        }
    }

    /**
     * Action constants
     */
    public static class Action {
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";
        public static final String VIEW = "VIEW";
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";

        private Action() {
        }
    }

    /**
     * Status constants
     */
    public static class Status {
        public static final String SUCCESS = "SUCCESS";
        public static final String FAILURE = "FAILURE";
        public static final String PENDING = "PENDING";

        private Status() {
        }
    }

    // =============================================
    // BUILDER HELPERS
    // =============================================

    /**
     * Set isOwnAction based on actor and target user IDs
     */
    public void calculateIsOwnAction() {
        this.isOwnAction = (actorUserId != null && actorUserId.equals(targetUserId));
        this.isFriendActivity = !this.isOwnAction;
    }

    /**
     * Convenience method to create event for own action
     */
    public static UnifiedActivityEventBuilder forOwnAction(Integer userId) {
        return UnifiedActivityEvent.builder()
                .actorUserId(userId)
                .targetUserId(userId)
                .isOwnAction(true)
                .isFriendActivity(false);
    }

    /**
     * Convenience method to create event for friend action
     */
    public static UnifiedActivityEventBuilder forFriendAction(Integer actorUserId, Integer targetUserId) {
        return UnifiedActivityEvent.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .isOwnAction(false)
                .isFriendActivity(true);
    }
}
