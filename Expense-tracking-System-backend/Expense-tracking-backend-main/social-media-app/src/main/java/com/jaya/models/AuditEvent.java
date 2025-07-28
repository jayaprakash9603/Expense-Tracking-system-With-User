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
    // User Information
    private Integer userId;
    private String username;
    private String userRole;

    // Entity Information
    private String entityId;
    private String entityType; // EXPENSE, BUDGET, USER, etc.
    private String actionType; // CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT

    // Audit Details
    private String details;
    private String description;
    private Map<String, Object> oldValues; // Previous state for updates
    private Map<String, Object> newValues; // New state for updates

    // Timing Information
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Audit Trail
    private String createdBy;
    private String lastUpdatedBy;

    // Request Information
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String correlationId; // For tracing requests across services
    private String requestId;

    // Service Information
    private String serviceName;
    private String serviceVersion;
    private String environment; // DEV, STAGING, PROD

    // Status and Result
    private String status; // SUCCESS, FAILURE, PENDING
    private String errorMessage;
    private Integer responseCode;

    // Additional Metadata
    private String source; // WEB, MOBILE, API
    private String method; // HTTP method for API calls
    private String endpoint; // API endpoint
    private Long executionTimeMs; // Time taken for operation

    // Custom method to set creation audit fields
    public void setCreationAudit(String createdBy) {
        this.createdAt = LocalDateTime.now();
        this.createdBy = createdBy;
        this.timestamp = this.createdAt;
    }

    // Custom method to set update audit fields
    public void setUpdateAudit(String updatedBy) {
        this.updatedAt = LocalDateTime.now();
        this.lastUpdatedBy = updatedBy;
    }
}