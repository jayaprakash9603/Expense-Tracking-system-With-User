package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkExpenseBudgetResponse {
    private Boolean success;
    private String message;
    private Integer totalProcessed;
    private Integer successCount;
    private Integer failureCount;
    private List<MappingResult> results;
    private Map<Long, Long> oldToNewExpenseIds;
    private Map<Long, Long> oldToNewBudgetIds;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MappingResult {
        private Long oldExpenseId;
        private Long newExpenseId;
        private List<BudgetMapping> budgetMappings;
        private Boolean success;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetMapping {
        private Long oldBudgetId;
        private Long newBudgetId;
        private Boolean success;
        private String errorMessage;
    }
}
