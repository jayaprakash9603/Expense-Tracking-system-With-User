package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for bulk expense and budget creation
 */
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
    private Map<Long, Long> oldToNewExpenseIds; // Old expense ID -> New expense ID
    private Map<Long, Long> oldToNewBudgetIds; // Old budget ID -> New budget ID

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
