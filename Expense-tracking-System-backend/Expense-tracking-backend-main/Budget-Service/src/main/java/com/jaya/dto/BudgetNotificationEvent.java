package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * BudgetNotificationEvent
 * Event DTO for budget-related notifications sent to Kafka
 * Follows DRY principle by reusing common event structure
 * 
 * @author Budget Service Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetNotificationEvent implements Serializable {
    
    private static final long serialVersionUID = 1L;

    // Action Constants
    public static final String CREATE = "CREATE";
    public static final String UPDATE = "UPDATE";
    public static final String DELETE = "DELETE";
    public static final String EXCEEDED = "EXCEEDED";
    public static final String WARNING = "WARNING";
    public static final String LIMIT_APPROACHING = "LIMIT_APPROACHING";

    // Core Identifiers
    private Integer budgetId;
    private Integer userId;
    
    // Action Type
    private String action;
    
    // Budget Details
    private String budgetName;
    private Double amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    
    // Date Information
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    // Timestamp
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    // Additional metadata (optional)
    private Map<String, Object> metadata;

    /**
     * Validate the event has required fields
     */
    public void validate() {
        if (budgetId == null) {
            throw new IllegalArgumentException("Budget ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty");
        }
        if (timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    /**
     * Check if this is a CREATE action
     */
    public boolean isCreate() {
        return CREATE.equals(action);
    }

    /**
     * Check if this is an UPDATE action
     */
    public boolean isUpdate() {
        return UPDATE.equals(action);
    }

    /**
     * Check if this is a DELETE action
     */
    public boolean isDelete() {
        return DELETE.equals(action);
    }

    /**
     * Check if this is an EXCEEDED action
     */
    public boolean isExceeded() {
        return EXCEEDED.equals(action);
    }

    /**
     * Check if this is a WARNING action
     */
    public boolean isWarning() {
        return WARNING.equals(action);
    }

    /**
     * Check if this is a LIMIT_APPROACHING action
     */
    public boolean isLimitApproaching() {
        return LIMIT_APPROACHING.equals(action);
    }
}
