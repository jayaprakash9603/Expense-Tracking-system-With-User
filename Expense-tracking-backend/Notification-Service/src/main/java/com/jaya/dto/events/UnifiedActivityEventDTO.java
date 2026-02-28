package com.jaya.dto.events;

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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnifiedActivityEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private Integer actorUserId;
    private String actorUserName;
    private String actorEmail;
    private String actorRole;
    private UserInfo actorUser;

    private Integer targetUserId;
    private String targetUserName;
    private UserInfo targetUser;

    private String entityType;
    private Long entityId;
    private String entityName;

    private String action;
    private String description;
    private Double amount;

    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;
    private Map<String, Object> entityPayload;
    private String metadata;

    private String sourceService;
    private String serviceVersion;
    private String environment;

    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String correlationId;
    private String requestId;
    private String httpMethod;
    private String endpoint;
    private Long executionTimeMs;

    @Builder.Default
    private String status = "SUCCESS";
    private String errorMessage;
    private Integer responseCode;

    @Builder.Default
    private Boolean isOwnAction = true;
    @Builder.Default
    private Boolean requiresAudit = true;
    @Builder.Default
    private Boolean requiresNotification = true;
    @Builder.Default
    private Boolean isFriendActivity = false;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
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

        public String getDisplayName() {
            if (displayName != null && !displayName.trim().isEmpty())
                return displayName;
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

        private Action() {
        }
    }

    public boolean shouldProcessAsFriendActivity() {
        return Boolean.TRUE.equals(isFriendActivity) ||
                (actorUserId != null && targetUserId != null && !actorUserId.equals(targetUserId));
    }

    public boolean shouldProcessAsRegularNotification() {
        return Boolean.TRUE.equals(requiresNotification) && Boolean.TRUE.equals(isOwnAction);
    }
}
