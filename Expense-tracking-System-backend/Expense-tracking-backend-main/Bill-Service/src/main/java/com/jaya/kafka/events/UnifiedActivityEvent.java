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
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnifiedActivityEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    // Core identification
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Actor information (who performed the action)
    private Integer actorUserId;
    private String actorUserName;
    private String actorEmail;
    private String actorRole;
    private UserInfo actorUser;

    // Target information (whose data was affected)
    private Integer targetUserId;
    private String targetUserName;
    private UserInfo targetUser;

    // Entity information
    private String entityType;
    private Long entityId;
    private String entityName;

    // Action information
    private String action;
    private String description;
    private Double amount;

    // Data payloads
    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;
    private Map<String, Object> entityPayload;
    private String metadata;

    // Source service information
    private String sourceService;
    private String serviceVersion;
    private String environment;

    // Request context
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String correlationId;
    private String requestId;
    private String httpMethod;
    private String endpoint;
    private Long executionTimeMs;

    // Status
    @Builder.Default
    private String status = "SUCCESS";
    private String errorMessage;
    private Integer responseCode;

    // Routing flags
    @Builder.Default
    private Boolean isOwnAction = true;
    @Builder.Default
    private Boolean requiresAudit = true;
    @Builder.Default
    private Boolean requiresNotification = true;
    @Builder.Default
    private Boolean isFriendActivity = false;

    public void calculateIsOwnAction() {
        this.isOwnAction = (actorUserId != null && actorUserId.equals(targetUserId));
        this.isFriendActivity = !this.isOwnAction;
    }

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

        public String getDisplayName() {
            if (fullName != null && !fullName.trim().isEmpty())
                return fullName;
            if (firstName != null && lastName != null)
                return firstName + " " + lastName;
            if (firstName != null)
                return firstName;
            if (username != null && !username.trim().isEmpty())
                return username;
            return email;
        }
    }

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

    public static class Status {
        public static final String SUCCESS = "SUCCESS";
        public static final String FAILURE = "FAILURE";
        public static final String PENDING = "PENDING";

        private Status() {
        }
    }

    public static UnifiedActivityEventBuilder forOwnAction(Integer userId) {
        return UnifiedActivityEvent.builder()
                .actorUserId(userId)
                .targetUserId(userId)
                .isOwnAction(true)
                .isFriendActivity(false);
    }

    public static UnifiedActivityEventBuilder forFriendAction(Integer actorUserId, Integer targetUserId) {
        return UnifiedActivityEvent.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .isOwnAction(false)
                .isFriendActivity(true);
    }
}
