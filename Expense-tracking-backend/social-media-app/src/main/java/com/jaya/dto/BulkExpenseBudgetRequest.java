package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;






@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BulkExpenseBudgetRequest {
    private List<ExpenseBudgetMapping> mappings;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExpenseBudgetMapping {
        private List<ExpenseData> expenses; 
        private List<BudgetData> budgets; 
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExpenseData {
        private Long id; 
        private String date;
        private Long categoryId;
        private String categoryName;
        private ExpenseDetails expense;
        private Boolean includeInBudget;
        private Long userId;
        private List<Long> budgetIds; 
        private Boolean bill;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BudgetData {
        private Long id; 
        private String name;
        private String description;
        private Double amount;
        private String startDate;
        private String endDate;
        private Long userId;
        private List<Long> expenseIds; 
        private Double remainingAmount;
        private Boolean includeInBudget;
        private Boolean budgetHasExpenses;
    }
}
