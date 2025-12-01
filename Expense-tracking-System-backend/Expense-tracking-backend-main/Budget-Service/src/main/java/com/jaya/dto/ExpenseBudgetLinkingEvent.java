package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Event for syncing expense-budget linking across services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseBudgetLinkingEvent {
    private EventType eventType;
    private Long userId;
    private Long newExpenseId;
    private Long oldExpenseId;
    private List<Long> oldBudgetIds;
    private List<Long> newBudgetIds;
    private Long newBudgetId; // Single budget ID for simpler events
    private Long oldBudgetId; // Single old budget ID
    private List<Long> budgetIdsToRemove; // Budget IDs to remove from expenses (for bulk delete)
    private String timestamp;
    
    // Budget details for creation
    private BudgetDetails budgetDetails;
    
    public enum EventType {
        EXPENSE_CREATED_WITH_OLD_BUDGETS,      // Expense created, needs budget mapping (budgets don't exist yet)
        BUDGET_CREATED_WITH_OLD_EXPENSES,      // Budget created, needs expense mapping (expenses don't exist yet)
        EXPENSE_CREATED_WITH_EXISTING_BUDGETS, // Expense created, budgets already exist (replace old expense ID)
        EXPENSE_BUDGET_LINK_UPDATE,            // Update expense with new budget IDs
        BUDGET_EXPENSE_LINK_UPDATE,            // Update budget with new expense IDs
        BUDGET_DELETED_REMOVE_FROM_EXPENSES    // Budget deleted, remove budget IDs from expenses
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetDetails {
        private String name;
        private String description;
        private Double amount;
        private String startDate;
        private String endDate;
        private Boolean includeInBudget;
        private Double remainingAmount;
        private List<Long> expenseIds; // Old expense IDs
    }
}
