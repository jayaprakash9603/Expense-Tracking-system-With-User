package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAnalyticsDTO {
    private CategoryMetadata categoryMetadata;
    private SummaryStatistics summaryStatistics;
    private TrendAnalytics trendAnalytics;
    private List<PaymentMethodDistribution> paymentMethodDistribution;
    private BudgetAnalytics budgetAnalytics;
    private ExpenseHighlights expenseHighlights;
    private TransactionData transactionData;
    private List<BudgetCategoryReport> budgetReports;
    private List<InsightItem> insights;

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
        private String type;
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
        private Integer consistency;
        private Integer activeDays;
        private Double minExpense;
        private Double maxExpense;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendAnalytics {
        private List<DailySpending> dailySpendingTrend;
        private List<WeeklySpending> weeklySpendingTrend;
        private List<MonthlySpending> monthlySpendingTrend;
        private List<YearlySpending> yearlySpendingTrend;
        private List<MonthlySpending> monthlySpendingPattern;
        private MonthComparison previousVsCurrentMonth;
        private MonthlySpending mostActiveMonth;
        private MonthlySpending leastActiveMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySpending {
        private LocalDate date;
        private String dayName;
        private Double amount;
        private Integer transactionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySpending {
        private String week;
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
        private String month;
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
        private String trend;
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
        private Double totalAllocated;
        private Double totalUsed;
        private Double remainingAmount;
        private Double usagePercentage;
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
        private String status;
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
        private List<ExpenseTransaction> recentTransactions;
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
        private String type;
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
        private String type;
        private String title;
        private String message;
        private String icon;
        private Double value;
        private String actionText;
    }
}
