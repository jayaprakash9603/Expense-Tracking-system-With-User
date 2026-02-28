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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetNotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;
    public static final String CREATE = "CREATE";
    public static final String UPDATE = "UPDATE";
    public static final String DELETE = "DELETE";
    public static final String EXCEEDED = "EXCEEDED";
    public static final String WARNING = "WARNING";
    public static final String LIMIT_APPROACHING = "LIMIT_APPROACHING";

    private Integer budgetId;
    private Integer userId;

    private String action;

    private String budgetName;
    private Double amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private Map<String, Object> metadata;

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

    public boolean isCreate() {
        return CREATE.equals(action);
    }

    public boolean isUpdate() {
        return UPDATE.equals(action);
    }

    public boolean isDelete() {
        return DELETE.equals(action);
    }

    public boolean isExceeded() {
        return EXCEEDED.equals(action);
    }

    public boolean isWarning() {
        return WARNING.equals(action);
    }

    public boolean isLimitApproaching() {
        return LIMIT_APPROACHING.equals(action);
    }
}
