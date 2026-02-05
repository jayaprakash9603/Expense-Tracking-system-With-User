package com.jaya.kafka.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UnifiedActivityEventDTO {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private String eventId;

    private String sourceService;

    private String entityType;

    private Long entityId;

    private String action;

    private Long actorUserId;

    private String actorUserName;

    private Long targetUserId;

    private UserInfo actorUser;

    private UserInfo targetUser;

    private Boolean isOwnAction;

    private Boolean isFriendActivity;

    private String description;

    private BigDecimal amount;

    private Object entityPayload;

    private Map<String, Object> oldValues;

    private Map<String, Object> newValues;

    private Map<String, Object> metadata;

    @JsonSetter("metadata")
    public void setMetadata(Object value) {
        this.metadata = convertToMap(value);
    }

    @JsonSetter("oldValues")
    public void setOldValues(Object value) {
        this.oldValues = convertToMap(value);
    }

    @JsonSetter("newValues")
    public void setNewValues(Object value) {
        this.newValues = convertToMap(value);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> convertToMap(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }
        if (value instanceof String) {
            String strValue = (String) value;
            if (strValue.isEmpty() || strValue.equals("null")) {
                return null;
            }
            try {
                return OBJECT_MAPPER.readValue(strValue, new TypeReference<Map<String, Object>>() {
                });
            } catch (Exception e) {
                return null;
            }
        }
        try {
            return OBJECT_MAPPER.convertValue(value, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            return null;
        }
    }

    private String ipAddress;

    private String userAgent;

    private String correlationId;

    private LocalDateTime timestamp;

    private LocalDateTime createdAt;

    private LocalDateTime modifiedAt;

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
