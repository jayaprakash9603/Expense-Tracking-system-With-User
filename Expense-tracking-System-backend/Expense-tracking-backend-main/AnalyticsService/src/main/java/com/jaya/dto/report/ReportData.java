package com.jaya.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportData {
    private String reportTitle;
    private LocalDate generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String userName;
    private SummaryData summary;
    private List<ExpenseRow> expenses;
    private List<CategoryData> categoryBreakdown;
    private List<MonthlyTrendData> monthlyTrends;
    private List<DailySpendingData> dailySpending;
    private List<BudgetData> budgets;
    private List<PaymentMethodData> paymentMethods;
    private List<WeekdaySpendingData> weekdaySpending;
    private List<YearlyComparisonData> yearlyComparison;
    private List<TopExpenseData> topExpenses;
    private ExpenseVelocityData expenseVelocity;
    private List<InsightData> insights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryData {
        private double totalExpenses;
        private double totalIncome;
        private double netBalance;
        private double averageExpense;
        private int transactionCount;
        private double maxExpense;
        private double minExpense;
        private double totalCreditDue;
        private double totalBudgetAllocated;
        private double totalBudgetUsed;
        private double budgetUtilizationPercent;
        private String topCategory;
        private double topCategoryAmount;
        private String topPaymentMethod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseRow {
        private Integer id;
        private LocalDate date;
        private String name;
        private double amount;
        private String category;
        private String paymentMethod;
        private String type;
        private String notes;
        private double creditAmount;
        private boolean isBillPayment;
        private List<Integer> budgetIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryData {
        private Integer categoryId;
        private String categoryName;
        private String icon;
        private String color;
        private double totalAmount;
        private int transactionCount;
        private double percentage;
        private double averageAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendData {
        private String month;
        private int year;
        private int monthNumber;
        private double totalAmount;
        private int transactionCount;
        private double averageDaily;
        private double changeFromPreviousMonth;
        private double changePercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySpendingData {
        private LocalDate date;
        private String dayName;
        private double amount;
        private int transactionCount;
        private String topCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetData {
        private Integer budgetId;
        private String budgetName;
        private String description;
        private double allocatedAmount;
        private double usedAmount;
        private double remainingAmount;
        private double utilizationPercent;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private int expenseCount;
        private int daysRemaining;
        private int totalDays;
        private double dailyBudget;
        private double dailySpendRate;
        private double projectedOverspend;
        private double cashSpent;
        private double creditSpent;
        private boolean isValid;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodData {
        private String methodName;
        private String displayName;
        private double totalAmount;
        private int transactionCount;
        private double percentage;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsightData {
        private String type;
        private String title;
        private String message;
        private String icon;
        private Double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeekdaySpendingData {
        private String dayName;
        private int dayOfWeek;
        private double totalAmount;
        private int transactionCount;
        private double averageAmount;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyComparisonData {
        private int year;
        private double totalAmount;
        private int transactionCount;
        private double averageMonthlySpend;
        private double changeFromPreviousYear;
        private double changePercent;
        private String topCategory;
        private double topCategoryAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopExpenseData {
        private Integer id;
        private String name;
        private double amount;
        private LocalDate date;
        private String category;
        private String paymentMethod;
        private int rank;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseVelocityData {
        private double dailyAverage;
        private double weeklyAverage;
        private double monthlyAverage;
        private double last7DaysTotal;
        private double last30DaysTotal;
        private double last7DaysChange;
        private double last30DaysChange;
        private String trend;
        private double projectedMonthlySpend;
    }
}
