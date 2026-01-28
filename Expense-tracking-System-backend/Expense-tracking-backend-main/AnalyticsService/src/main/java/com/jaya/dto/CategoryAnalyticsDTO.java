package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Comprehensive Category Analytics DTO
 * Returns all analytics for a selected category within a given date range.
 * This is the single response object for GET
 * /api/analytics/categories/{categoryId}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAnalyticsDTO {

    // ==================== 1. CATEGORY METADATA ====================
    private CategoryMetadata categoryMetadata;

    // ==================== 2. SUMMARY STATISTICS ====================
    private SummaryStatistics summaryStatistics;

    // ==================== 3. TREND ANALYTICS ====================
    private TrendAnalytics trendAnalytics;

    // ==================== 4. PAYMENT METHOD DISTRIBUTION ====================
    private List<PaymentMethodDistribution> paymentMethodDistribution;

    // ==================== 5. BUDGET ANALYTICS ====================
    private BudgetAnalytics budgetAnalytics;

    // ==================== 6. EXPENSE HIGHLIGHTS ====================
    private ExpenseHighlights expenseHighlights;

    // ==================== 7. TRANSACTIONS & EXPENSE LIST ====================
    private TransactionData transactionData;

    // ==================== 8. REPORTS SECTION ====================
    private List<BudgetCategoryReport> budgetReports;

    // ==================== 9. INSIGHTS ====================
    private List<InsightItem> insights;

    // ==================== NESTED DTOs ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryMetadata {
        private Integer categoryId;
        private String categoryName;
        private String icon;
        private String color;
        private String description;
        private String type; // expense, income, transfer
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStatistics {
        private Double totalSpent;
        private Integer totalTransactions;
        private Double averageExpense;
        private Double costPerDay;
        private Double categoryPercentageOfAllExpenses;
        private Integer consistency; // Number of months category has appeared
        private Integer activeDays; // Days with at least one expense
        private Double minExpense;
        private Double maxExpense;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendAnalytics {
        // Time-series spending data
        private List<DailySpending> dailySpendingTrend;
        private List<WeeklySpending> weeklySpendingTrend;
        private List<MonthlySpending> monthlySpendingTrend;
        private List<YearlySpending> yearlySpendingTrend;

        // Monthly spending pattern
        private List<MonthlySpending> monthlySpendingPattern;

        // Month comparison
        private MonthComparison previousVsCurrentMonth;

        // Most/Least active months
        private MonthlySpending mostActiveMonth;
        private MonthlySpending leastActiveMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySpending {
        private LocalDate date;
        private String dayName; // Mon, Tue, etc.
        private Double amount;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySpending {
        private String week; // Week identifier (e.g., "2026-W04")
        private LocalDate weekStart;
        private LocalDate weekEnd;
        private Double amount;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySpending {
        private String month; // e.g., "January 2026"
        private Integer year;
        private Integer monthNumber;
        private Double amount;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlySpending {
        private Integer year;
        private Double amount;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthComparison {
        private Double previousMonthAmount;
        private Double currentMonthAmount;
        private Double percentageChange;
        private String trend; // INCREASED, DECREASED, STABLE
        private String previousMonthName;
        private String currentMonthName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodDistribution {
        private String paymentMethod;
        private String displayName;
        private Double totalAmount;
        private Double percentage;
        private Integer transactionCount;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetAnalytics {
        // Overall budget status for this category
        private Double totalAllocated;
        private Double totalUsed;
        private Double remainingAmount;
        private Double usagePercentage;

        // List of budgets containing this category
        private List<BudgetCategoryInfo> linkedBudgets;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetCategoryInfo {
        private Integer budgetId;
        private String budgetName;
        private String description;
        private Double totalBudgetAmount;
        private Double categorySpentAmount;
        private Integer numberOfExpensesInThisCategory;
        private Double categoryUsagePercentageInBudget;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status; // ACTIVE, EXCEEDED, EXPIRED, etc.
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseHighlights {
        private ExpenseHighlightItem highestExpense;
        private ExpenseHighlightItem lowestExpense;
        private ExpenseHighlightItem mostRecentExpense;
        private ExpenseHighlightItem oldestExpense;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseHighlightItem {
        private Integer expenseId;
        private Double amount;
        private LocalDate date;
        private String description;
        private String merchant;
        private String paymentMethod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionData {
        // Recent transactions (limited list)
        private List<ExpenseTransaction> recentTransactions;

        // Full expense list for detailed view
        private List<ExpenseTransaction> fullExpenseList;

        private Integer totalCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseTransaction {
        private Integer expenseId;
        private String expenseName;
        private Double amount;
        private LocalDate date;
        private String merchant;
        private String paymentMethod;
        private String note;
        private String type; // EXPENSE, CREDIT
        private List<Integer> associatedBudgetIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetCategoryReport {
        private Integer budgetId;
        private String budgetName;
        private Integer totalExpensesCountInCategory;
        private Double totalAmountSpentInCategory;
        private Double budgetAllocation;
        private Double percentageOfBudget;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsightItem {
        private String type; // INFO, WARNING, SUGGESTION
        private String title;
        private String message;
        private String icon;
        private Double value; // Optional numeric value for the insight
        private String actionText; // Optional action suggestion
    }
}
