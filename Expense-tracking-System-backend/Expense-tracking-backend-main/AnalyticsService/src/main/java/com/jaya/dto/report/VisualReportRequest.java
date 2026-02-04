package com.jaya.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for generating visual Excel reports.
 * Allows customization of report contents and date ranges.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualReportRequest {

    /**
     * Start date for the report period
     */
    private LocalDate startDate;

    /**
     * End date for the report period
     */
    private LocalDate endDate;

    /**
     * Report type: EXPENSE, BUDGET, CATEGORY, COMPREHENSIVE
     */
    @Builder.Default
    private ReportType reportType = ReportType.COMPREHENSIVE;

    /**
     * Include charts in the report
     */
    @Builder.Default
    private boolean includeCharts = true;

    /**
     * Include formulas for dynamic calculations
     */
    @Builder.Default
    private boolean includeFormulas = true;

    /**
     * Include conditional formatting (traffic lights, data bars)
     */
    @Builder.Default
    private boolean includeConditionalFormatting = true;

    /**
     * Specific sheets to include (null = all)
     */
    private List<SheetType> sheetsToInclude;

    /**
     * Target user ID (for viewing friend's expenses)
     */
    private Integer targetId;

    /**
     * Category ID filter (for category-specific reports)
     */
    private Integer categoryId;

    /**
     * Budget ID filter (for budget-specific reports)
     */
    private Integer budgetId;

    public enum ReportType {
        EXPENSE, // Basic expense list with summaries
        BUDGET, // Budget analysis and tracking
        CATEGORY, // Category-wise analytics
        COMPREHENSIVE // Full report with all sections
    }

    public enum SheetType {
        SUMMARY, // KPI summary with overview charts
        EXPENSES, // Detailed expense transactions
        CATEGORY_BREAKDOWN, // Category-wise breakdown
        MONTHLY_TRENDS, // Monthly spending trends
        DAILY_SPENDING, // Daily spending patterns
        BUDGET_ANALYSIS, // Budget utilization
        PAYMENT_METHODS, // Payment method distribution
        INSIGHTS // AI-generated insights
    }
}
