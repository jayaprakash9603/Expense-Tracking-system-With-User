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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
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
        private String displayName;
    }
}
