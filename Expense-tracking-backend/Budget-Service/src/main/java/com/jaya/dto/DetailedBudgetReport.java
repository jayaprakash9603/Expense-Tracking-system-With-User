package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetailedBudgetReport {
    private Integer budgetId;
    private String budgetName;
    private String description;
    private double allocatedAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isValid;

    private double totalSpent;
    private double remainingAmount;
    private double totalCashSpent;
    private double totalCreditSpent;
    private double percentageUsed;
    private int daysElapsed;
    private int daysRemaining;
    private int totalDays;

    private double averageDailySpending;
    private double projectedTotalSpending;
    private double projectedOverUnder;
    private int totalTransactions;
    private double averageTransactionAmount;
    private double largestTransaction;
    private double smallestTransaction;

    private List<CategoryExpense> categoryBreakdown;

    private List<PaymentMethodExpense> paymentMethodBreakdown;

    private List<DailySpending> dailySpending;

    private List<WeeklySpending> weeklySpending;

    private List<ExpenseTransaction> transactions;

    private BudgetHealthMetrics healthMetrics;

    private List<String> insights;
    private String budgetStatus;
    private String riskLevel;
    private List<ComparisonData> comparisonData;
    private List<ForecastData> forecastData;
    private List<SpendingPattern> spendingPatterns;
    private List<BudgetGoal> budgetGoals;
    private List<HourlySpending> hourlySpending;
    private List<CategoryTrend> categoryTrends;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryExpense {
        private String categoryName;
        private Integer categoryId;
        private double amount;
        private double percentage;
        private int transactionCount;
        private double averagePerTransaction;
        private String color;
        private List<SubcategoryExpense> subcategories;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubcategoryExpense {
        private String name;
        private double amount;
        private int count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodExpense {
        private String paymentMethod;
        private double amount;
        private double percentage;
        private int transactionCount;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySpending {
        private LocalDate date;
        private String day;
        private double amount;
        private int transactionCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySpending {
        private String week;
        private double amount;
        private int transactionCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseTransaction {
        private Integer expenseId;
        private String expenseName;
        private String categoryName;
        private double amount;
        private String paymentMethod;
        private LocalDate date;
        private String comments;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetHealthMetrics {
        private String status;
        private double burnRate;
        private double projectedEndBalance;
        private boolean onTrack;
        private double paceScore;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private String category;
        private double current;
        private double previous;
        private double change;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastData {
        private String day;
        private double predicted;
        private double confidence;
        private String category;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingPattern {
        private String pattern;
        private String description;
        private String impact;
        private String recommendation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetGoal {
        private String goal;
        private double target;
        private double current;
        private double progress;
        private String status;
        private String deadline;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlySpending {
        private int hour;
        private double amount;
        private int transactions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryTrend {
        private String category;
        private List<MonthlyAmount> data;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyAmount {
        private String month;
        private double amount;
    }
}
