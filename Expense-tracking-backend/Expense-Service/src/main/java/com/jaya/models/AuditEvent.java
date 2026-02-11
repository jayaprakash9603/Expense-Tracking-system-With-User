package com.jaya.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditEvent {
    private Integer userId;
    private String username;
    private String userRole;

    private String entityId;
    private String entityType;
    private String actionType;

    private String details;
    private String description;
    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    private String createdBy;
    private String lastUpdatedBy;

    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String correlationId;
    private String requestId;

    private String serviceName;
    private String serviceVersion;
    private String environment;

    private String status;
    private String errorMessage;
    private Integer responseCode;

    private String source;
    private String method;
    private String endpoint;
    private Long executionTimeMs;

    public void setCreationAudit(String createdBy) {
        this.createdAt = LocalDateTime.now();
        this.createdBy = createdBy;
        this.timestamp = this.createdAt;
    }

    public void setUpdateAudit(String updatedBy) {
        this.updatedAt = LocalDateTime.now();
        this.lastUpdatedBy = updatedBy;
    }
}
