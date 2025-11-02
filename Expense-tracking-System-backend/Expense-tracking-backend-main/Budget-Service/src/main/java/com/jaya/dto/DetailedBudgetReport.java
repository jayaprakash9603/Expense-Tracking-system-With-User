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

    // Basic Budget Info
    private Integer budgetId;
    private String budgetName;
    private String description;
    private double allocatedAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isValid;

    // Financial Summary
    private double totalSpent;
    private double remainingAmount;
    private double totalCashSpent;
    private double totalCreditSpent;
    private double percentageUsed;
    private int daysElapsed;
    private int daysRemaining;
    private int totalDays;

    // Spending Statistics
    private double averageDailySpending;
    private double projectedTotalSpending;
    private double projectedOverUnder;
    private int totalTransactions;
    private double averageTransactionAmount;
    private double largestTransaction;
    private double smallestTransaction;

    // Category Breakdown
    private List<CategoryExpense> categoryBreakdown;

    // Payment Method Breakdown
    private List<PaymentMethodExpense> paymentMethodBreakdown;

    // Timeline Data (Daily spending)
    private List<DailySpending> dailySpending;

    // Weekly Data
    private List<WeeklySpending> weeklySpending;

    // Expense Transactions
    private List<ExpenseTransaction> transactions;

    // Budget Health Metrics
    private BudgetHealthMetrics healthMetrics;

    // Insights and Recommendations
    private List<String> insights;
    private String budgetStatus; // "on-track", "over-budget", "under-budget"
    private String riskLevel; // "low", "medium", "high"

    // Additional Analytics Data
    private List<ComparisonData> comparisonData; // Budget vs Previous Period
    private List<ForecastData> forecastData; // Future spending predictions
    private List<SpendingPattern> spendingPatterns; // Detected patterns
    private List<BudgetGoal> budgetGoals; // Goals and achievements
    private List<HourlySpending> hourlySpending; // Hourly spending pattern
    private List<CategoryTrend> categoryTrends; // Category trends over time

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
        private String day; // Day name (Mon, Tue, etc.)
        private double amount;
        private int transactionCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySpending {
        private String week; // Week number or name
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
        private String status; // "healthy", "warning", "critical"
        private double burnRate; // Amount spent per day
        private double projectedEndBalance;
        private boolean onTrack;
        private double paceScore; // 0-100, comparing actual pace vs expected pace
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private String category;
        private double current;
        private double previous;
        private double change; // Percentage change
        private String status; // "increased", "decreased", "stable"
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastData {
        private String day;
        private double predicted;
        private double confidence; // 0-100
        private String category;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingPattern {
        private String pattern;
        private String description;
        private String impact; // "high", "medium", "low"
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
        private double progress; // Percentage
        private String status; // "on-track", "behind", "exceeded"
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

