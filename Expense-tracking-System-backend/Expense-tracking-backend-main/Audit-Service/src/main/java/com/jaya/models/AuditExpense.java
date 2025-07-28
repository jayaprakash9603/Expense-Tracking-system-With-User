package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_expenses", indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_entity_id", columnList = "entityId"),
        @Index(name = "idx_entity_type", columnList = "entityType"),
        @Index(name = "idx_action_type", columnList = "actionType"),
        @Index(name = "idx_timestamp", columnList = "timestamp"),
        @Index(name = "idx_correlation_id", columnList = "correlationId"),
        @Index(name = "idx_user_entity", columnList = "userId, entityId, entityType")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User Information
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "user_role", length = 50)
    private String userRole;

    // Entity Information
    @Column(name = "entity_id", length = 100, nullable = false)
    private String entityId;

    @Column(name = "entity_type", length = 50, nullable = false)
    private String entityType; // EXPENSE, BUDGET, USER, CATEGORY, etc.

    @Column(name = "action_type", length = 50, nullable = false)
    private String actionType; // CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT

    // Audit Details
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues; // JSON string of previous state

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues; // JSON string of new state

    // Timing Information
    @Column(name = "timestamp", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Audit Trail
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "last_updated_by", length = 100)
    private String lastUpdatedBy;

    // Request Information
    @Column(name = "ip_address", length = 45) // IPv6 support
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "correlation_id", length = 100, unique = true)
    private String correlationId;

    @Column(name = "request_id", length = 100)
    private String requestId;

    // Service Information
    @Column(name = "service_name", length = 100)
    private String serviceName;

    @Column(name = "service_version", length = 20)
    private String serviceVersion;

    @Column(name = "environment", length = 20)
    private String environment; // DEV, STAGING, PROD

    // Status and Result
    @Column(name = "status", length = 20)
    private String status; // SUCCESS, FAILURE, PENDING

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "response_code")
    private Integer responseCode;

    // Additional Metadata
    @Column(name = "source", length = 20)
    private String source; // WEB, MOBILE, API

    @Column(name = "method", length = 10)
    private String method; // HTTP method

    @Column(name = "endpoint", length = 500)
    private String endpoint;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    // Legacy fields for backward compatibility
    @Column(name = "expense_id")
    private Integer expenseId; // Deprecated: use entityId instead

    @Column(name = "user_audit_index")
    private Integer userAuditIndex; // Per-user serial number

    @Column(name = "expense_audit_index")
    private Integer expenseAuditIndex; // Per-expense serial number

    // Utility methods
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to check if this is an expense-related audit
    @JsonIgnore
    public boolean isExpenseAudit() {
        return "EXPENSE".equalsIgnoreCase(entityType) || expenseId != null;
    }

    // Helper method to check if this is a budget-related audit
    @JsonIgnore
    public boolean isBudgetAudit() {
        return "BUDGET".equalsIgnoreCase(entityType);
    }

    // Helper method to check if this is a user-related audit
    @JsonIgnore
    public boolean isUserAudit() {
        return "USER".equalsIgnoreCase(entityType);
    }

    // Helper method to get entity identifier
    @JsonIgnore
    public String getEntityIdentifier() {
        if (entityId != null) {
            return entityId;
        }
        if (expenseId != null) {
            return expenseId.toString();
        }
        return null;
    }

    @Override
    public String toString() {
        return "AuditExpense{" +
                "id=" + id +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", entityId='" + entityId + '\'' +
                ", entityType='" + entityType + '\'' +
                ", actionType='" + actionType + '\'' +
                ", status='" + status + '\'' +
                ", timestamp=" + timestamp +
                ", correlationId='" + correlationId + '\'' +
                '}';
    }
}