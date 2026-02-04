package com.jaya.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Internal DTO containing all data needed to generate a visual Excel report.
 * Aggregates data from multiple services into a single structure.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportData {
    
    // ==================== METADATA ====================
    private String reportTitle;
    private LocalDate generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String userName;
    
    // ==================== SUMMARY SECTION ====================
    private SummaryData summary;
    
    // ==================== EXPENSE DATA ====================
    private List<ExpenseRow> expenses;
    
    // ==================== CATEGORY DATA ====================
    private List<CategoryData> categoryBreakdown;
    
    // ==================== MONTHLY TRENDS ====================
    private List<MonthlyTrendData> monthlyTrends;
    
    // ==================== DAILY SPENDING ====================
    private List<DailySpendingData> dailySpending;
    
    // ==================== BUDGET DATA ====================
    private List<BudgetData> budgets;
    
    // ==================== PAYMENT METHOD DATA ====================
    private List<PaymentMethodData> paymentMethods;
    
    // ==================== INSIGHTS ====================
    private List<InsightData> insights;
    
    // ==================== NESTED DTOs ====================
    
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
        private String type;  // CASH, CREDIT
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
        private String month;         // e.g., "January 2026"
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
        private String dayName;       // Mon, Tue, etc.
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
        private double allocatedAmount;
        private double usedAmount;
        private double remainingAmount;
        private double utilizationPercent;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;        // ACTIVE, EXCEEDED, WARNING, EXPIRED
        private int expenseCount;
        private int daysRemaining;
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
        private String type;          // INFO, WARNING, SUGGESTION, SUCCESS
        private String title;
        private String message;
        private String icon;
        private Double value;
    }
}
