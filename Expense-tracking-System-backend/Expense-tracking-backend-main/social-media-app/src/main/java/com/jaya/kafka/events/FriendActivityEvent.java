package com.jaya.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
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

/**
 * Event DTO for tracking friend activities across services.
 * Used when a friend (User B) performs actions on behalf of another user (User
 * A).
 * 
 * Use Case:
 * - User A gives access to User B
 * - User B creates an expense on User A's account
 * - This event is published to notify User A about the activity
 * 
 * Services producing this event:
 * - Expense Service
 * - Budget Service
 * - Category Service
 * - Payment Service
 * - Bill Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendActivityEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * The user whose data was affected (the owner)
     */
    private Integer targetUserId;

    /**
     * The friend who performed the action
     */
    private Integer actorUserId;

    /**
     * Name of the actor (friend) for display purposes
     */
    private String actorUserName;

    /**
     * Complete actor user details
     */
    private UserInfo actorUser;

    /**
     * Complete target user details
     */
    private UserInfo targetUser;

    /**
     * The service where the action was performed
     */
    private String sourceService;

    /**
     * The type of entity affected (EXPENSE, BUDGET, CATEGORY, PAYMENT, BILL)
     */
    private String entityType;

    /**
     * The ID of the affected entity
     */
    private Integer entityId;

    /**
     * The action performed (CREATE, UPDATE, DELETE, etc.)
     */
    private String action;

    /**
     * Description of the activity for display
     */
    private String description;

    /**
     * Amount involved (if applicable)
     */
    private Double amount;

    /**
     * Additional metadata as JSON string (category, type, payment method, etc.)
     */
    private String metadata;

    /**
     * The complete entity payload that was created/updated/deleted
     * Stored as a Map to accommodate different entity types
     */
    private Map<String, Object> entityPayload;

    /**
     * Previous entity state (for updates) - allows showing what changed
     */
    private Map<String, Object> previousEntityState;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    /**
     * Whether this activity has been read by the target user
     */
    private Boolean isRead;

    /**
     * IP address of the actor (for security/audit purposes)
     */
    private String actorIpAddress;

    /**
     * User agent/device info of the actor
     */
    private String actorUserAgent;

    /**
     * Inner class to hold complete user information
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
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

        /**
         * Get display name with fallback logic
         */
        public String getDisplayName() {
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

    /**
     * Source service constants - must match consumer's enum values
     */
    public static class SourceService {
        public static final String EXPENSE = "EXPENSE";
        public static final String BUDGET = "BUDGET";
        public static final String CATEGORY = "CATEGORY";
        public static final String PAYMENT = "PAYMENT";
        public static final String BILL = "BILL";

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
        public static final String PAYMENT = "PAYMENT";
        public static final String BILL = "BILL";

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
        public static final String COPY = "COPY";

        private Action() {
        }
    }
}
