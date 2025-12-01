package com.jaya.dto;

import lombok.Data;
import java.util.List;

/**
 * Request DTO for bulk budget creation with old expense mappings
 */
@Data
public class BulkBudgetRequest {
    private List<BudgetWithOldExpenses> budgets;
    
    @Data
    public static class BudgetWithOldExpenses {
        private Long oldBudgetId;
        private String name;
        private String description;
        private Double amount;
        private String startDate;
        private String endDate;
        private Long userId;
        private List<Long> oldExpenseIds;
        private List<Long> newExpenseIds; // If already known
        private Double remainingAmount;
        private Boolean includeInBudget;
    }
}
