package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Common Audit Log DTO used across all microservices.
 * Contains audit trail information for inter-service communication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String eventId;

    private String serviceName;

    private Integer userId;

    private String userName;

    private String action;

    private String entityType;

    private String entityId;

    private String description;

    private String severity;

    private LocalDateTime timestamp;

    private String ipAddress;

    private String userAgent;

    private String correlationId;

    // Change tracking
    private Map<String, Object> oldValues;

    private Map<String, Object> newValues;

    // Additional context
    private Map<String, Object> metadata;

    // ==================== Severity Levels ====================

    public static final String SEVERITY_INFO = "INFO";
    public static final String SEVERITY_WARNING = "WARNING";
    public static final String SEVERITY_ERROR = "ERROR";
    public static final String SEVERITY_CRITICAL = "CRITICAL";

    // ==================== Common Actions ====================

    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String ACTION_DELETE = "DELETE";
    public static final String ACTION_VIEW = "VIEW";
    public static final String ACTION_LOGIN = "LOGIN";
    public static final String ACTION_LOGOUT = "LOGOUT";
    public static final String ACTION_EXPORT = "EXPORT";
    public static final String ACTION_IMPORT = "IMPORT";

    // ==================== Factory Methods ====================

    /**
     * Create a basic audit log entry
     */
    public static AuditLogDTO basic(String serviceName, Integer userId, String action, String entityType,
            String entityId) {
        return AuditLogDTO.builder()
                .serviceName(serviceName)
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .severity(SEVERITY_INFO)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a CREATE action audit log
     */
    public static AuditLogDTO create(String serviceName, Integer userId, String entityType, String entityId,
            Map<String, Object> newValues) {
        return AuditLogDTO.builder()
                .serviceName(serviceName)
                .userId(userId)
                .action(ACTION_CREATE)
                .entityType(entityType)
                .entityId(entityId)
                .newValues(newValues)
                .severity(SEVERITY_INFO)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an UPDATE action audit log
     */
    public static AuditLogDTO update(String serviceName, Integer userId, String entityType, String entityId,
            Map<String, Object> oldValues, Map<String, Object> newValues) {
        return AuditLogDTO.builder()
                .serviceName(serviceName)
                .userId(userId)
                .action(ACTION_UPDATE)
                .entityType(entityType)
                .entityId(entityId)
                .oldValues(oldValues)
                .newValues(newValues)
                .severity(SEVERITY_INFO)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a DELETE action audit log
     */
    public static AuditLogDTO delete(String serviceName, Integer userId, String entityType, String entityId,
            Map<String, Object> oldValues) {
        return AuditLogDTO.builder()
                .serviceName(serviceName)
                .userId(userId)
                .action(ACTION_DELETE)
                .entityType(entityType)
                .entityId(entityId)
                .oldValues(oldValues)
                .severity(SEVERITY_WARNING)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a login audit log
     */
    public static AuditLogDTO login(String serviceName, Integer userId, String ipAddress, String userAgent) {
        return AuditLogDTO.builder()
                .serviceName(serviceName)
                .userId(userId)
                .action(ACTION_LOGIN)
                .entityType("USER")
                .entityId(String.valueOf(userId))
                .severity(SEVERITY_INFO)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
