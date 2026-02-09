package com.jaya.dto.report;

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
public class VisualReportRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    @Builder.Default
    private ReportType reportType = ReportType.COMPREHENSIVE;
    @Builder.Default
    private boolean includeCharts = true;
    @Builder.Default
    private boolean includeFormulas = true;
    @Builder.Default
    private boolean includeConditionalFormatting = true;
    private List<SheetType> sheetsToInclude;
    private Integer targetId;
    private Integer categoryId;
    private Integer budgetId;

    public enum ReportType {
        EXPENSE,
        BUDGET,
        CATEGORY,
        COMPREHENSIVE
    }

    public enum SheetType {
        SUMMARY,
        EXPENSES,
        CATEGORY_BREAKDOWN,
        MONTHLY_TRENDS,
        DAILY_SPENDING,
        BUDGET_ANALYSIS,
        PAYMENT_METHODS,
        INSIGHTS
    }
}
