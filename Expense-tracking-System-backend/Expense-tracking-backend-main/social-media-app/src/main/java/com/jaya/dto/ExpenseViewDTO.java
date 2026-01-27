package com.jaya.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for detailed expense view containing:
 * - Expense details
 * - Linked budget information
 * - Category details
 * - Payment method details
 * - Occurrence/frequency information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseViewDTO {

    // Core expense information
    private Integer id;
    private LocalDate date;
    private String expenseName;
    private Double amount;
    private Double netAmount;
    private String type;
    private String paymentMethod;
    private String comments;
    private Double creditDue;
    private boolean includeInBudget;
    private boolean isBill;

    // Category information
    private CategoryInfo category;

    // Payment method details
    private PaymentMethodInfo paymentMethodInfo;

    // Linked budgets
    private List<BudgetInfo> linkedBudgets;

    // Occurrence statistics
    private OccurrenceInfo occurrenceInfo;

    // User information
    private Integer userId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Integer id;
        private String name;
        private String color;
        private String icon;
        private Long totalExpensesInCategory;
        private Double totalAmountInCategory;
        // Additional stats
        private Double averageAmountInCategory;
        private Double minAmountInCategory;
        private Double maxAmountInCategory;
        private Long expensesThisMonthInCategory;
        private Double percentageOfTotalExpenses; // What % of user's total expenses is in this category
        private LocalDate firstExpenseInCategory;
        private LocalDate lastExpenseInCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodInfo {
        private String name;
        private String displayName;
        private Long totalExpensesWithMethod;
        private Double totalAmountWithMethod;
        // Additional stats
        private Double averageAmountWithMethod;
        private Double minAmountWithMethod;
        private Double maxAmountWithMethod;
        private Long expensesThisMonthWithMethod;
        private Double percentageOfTotalExpenses; // What % of user's total expenses use this method
        private LocalDate firstExpenseWithMethod;
        private LocalDate lastExpenseWithMethod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetInfo {
        private Integer id;
        private String name;
        private String description;
        private LocalDate startDate;
        private LocalDate endDate;
        private Double amount;
        private Double remainingAmount;
        private Double usedAmount;
        private Double percentageUsed;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccurrenceInfo {
        private Long totalOccurrences;
        private Long occurrencesThisMonth;
        private Long occurrencesThisYear;
        private LocalDate firstOccurrence;
        private LocalDate lastOccurrence;
        private Double averageAmount;
        private Double totalAmountAllTime;
        private Double minAmount;
        private Double maxAmount;
    }
}
