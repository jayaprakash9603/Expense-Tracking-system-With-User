package com.jaya.dto;

import lombok.Data;
import java.util.List;

/**
 * Request DTO for bulk expense and budget creation with linking
 * Updated structure: expenses and budgets are in separate arrays (no
 * duplicates)
 */
@Data
public class BulkExpenseBudgetRequest {
    private List<ExpenseBudgetMapping> mappings;

    @Data
    public static class ExpenseBudgetMapping {
        private List<ExpenseData> expenses; // Array of unique expenses
        private List<BudgetData> budgets; // Array of unique budgets
    }

    @Data
    public static class ExpenseData {
        private Long id; // Old expense ID for reference
        private String date;
        private Long categoryId;
        private String categoryName;
        private ExpenseDetails expense;
        private Boolean includeInBudget;
        private Long userId;
        private List<Long> budgetIds; // Old budget IDs
        private Boolean bill;
    }

    @Data
    public static class ExpenseDetails {
        private Long id;
        private String expenseName;
        private Double amount;
        private String type;
        private String paymentMethod;
        private Double netAmount;
        private String comments;
        private Double creditDue;
        private Boolean masked;
    }

    @Data
    public static class BudgetData {
        private Long id; // Old budget ID
        private String name;
        private String description;
        private Double amount;
        private String startDate;
        private String endDate;
        private Long userId;
        private List<Long> expenseIds; // Old expense IDs
        private Double remainingAmount;
        private Boolean includeInBudget;
        private Boolean budgetHasExpenses;
    }
}
