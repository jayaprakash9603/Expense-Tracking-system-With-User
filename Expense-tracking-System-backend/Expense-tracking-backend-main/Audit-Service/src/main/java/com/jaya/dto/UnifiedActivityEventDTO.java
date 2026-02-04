package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
 * Unified Activity Event DTO for receiving events from all services.
 * This single DTO enables the Audit Service to process audit logs from all
 * services.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UnifiedActivityEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    // Core identification
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Actor information
    private Integer actorUserId;
    private String actorUserName;
    private String actorEmail;
    private String actorRole;
    private UserInfo actorUser;

    // Target information
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
        private String displayName;
    }
}
