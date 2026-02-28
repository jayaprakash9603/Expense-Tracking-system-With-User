package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private Long newBudgetId;
    private Long oldBudgetId;
    private List<Long> budgetIdsToRemove;
    private String timestamp;

    private BudgetDetails budgetDetails;

    public enum EventType {
        EXPENSE_CREATED_WITH_OLD_BUDGETS,
        BUDGET_CREATED_WITH_OLD_EXPENSES,
        EXPENSE_CREATED_WITH_EXISTING_BUDGETS,
        EXPENSE_BUDGET_LINK_UPDATE,
        BUDGET_EXPENSE_LINK_UPDATE,
        BUDGET_DELETED_REMOVE_FROM_EXPENSES
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
        private List<Long> expenseIds;
    }
}
