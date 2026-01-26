package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for generating a new report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateReportRequest {
    private String type; // user-activity, expense-summary, budget-analysis, audit-trail,
                         // category-breakdown
    private String dateRange; // 7d, 30d, 90d, 1y, custom
    private String format; // pdf, excel, csv
    private String name; // Optional custom name
}
