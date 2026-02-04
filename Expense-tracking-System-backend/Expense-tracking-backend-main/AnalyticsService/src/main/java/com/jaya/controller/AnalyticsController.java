package com.jaya.controller;

import com.jaya.dto.ApplicationOverviewDTO;
import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.dto.report.VisualReportRequest;
import com.jaya.service.AnalyticsOverviewService;
import com.jaya.service.CategoryAnalyticsService;
import com.jaya.service.VisualReportService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final AnalyticsOverviewService analyticsOverviewService;
    private final CategoryAnalyticsService categoryAnalyticsService;
    private final VisualReportService visualReportService;

    @GetMapping("/overview")
    public ResponseEntity<ApplicationOverviewDTO> getApplicationOverview(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId) {

        ApplicationOverviewDTO overview = analyticsOverviewService.getOverview(jwt, targetId);
        return ResponseEntity.ok(overview);
    }

    /**
     * Get comprehensive analytics for a specific category.
     * Returns all analytics data including trends, budgets, payments, transactions,
     * and insights.
     *
     * @param jwt        Authorization token
     * @param categoryId The category ID to analyze
     * @param startDate  Start date for the analysis period (YYYY-MM-DD)
     * @param endDate    End date for the analysis period (YYYY-MM-DD)
     * @param trendType  Type of trend aggregation: DAILY, WEEKLY, MONTHLY, YEARLY
     * @param targetId   Optional target user ID for friend expense viewing
     * @return Complete category analytics DTO
     */
    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<CategoryAnalyticsDTO> getCategoryAnalytics(
            @RequestHeader("Authorization") String jwt,
            @PathVariable("categoryId") Integer categoryId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "trendType", required = false, defaultValue = "MONTHLY") String trendType,
            @RequestParam(value = "targetId", required = false) Integer targetId) {

        log.info("Fetching category analytics: categoryId={}, startDate={}, endDate={}, trendType={}, targetId={}",
                categoryId, startDate, endDate, trendType, targetId);

        // Default date range to last 6 months if not provided
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusMonths(6);
        }

        CategoryAnalyticsDTO analytics = categoryAnalyticsService.getCategoryAnalytics(
                jwt, categoryId, startDate, endDate, trendType, targetId);

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/report/excel")
    public ResponseEntity<InputStreamResource> downloadVisualReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "allTime", required = false, defaultValue = "false") boolean allTime,
            @RequestParam(value = "reportType", required = false, defaultValue = "COMPREHENSIVE") String reportType,
            @RequestParam(value = "includeCharts", required = false, defaultValue = "true") boolean includeCharts,
            @RequestParam(value = "includeFormulas", required = false, defaultValue = "true") boolean includeFormulas,
            @RequestParam(value = "includeConditionalFormatting", required = false, defaultValue = "true") boolean includeConditionalFormatting,
            @RequestParam(value = "targetId", required = false) Integer targetId) throws IOException {

        log.info("Generating Excel report: type={}, year={}, month={}, startDate={}, endDate={}, allTime={}",
                reportType, year, month, startDate, endDate, allTime);

        // Handle allTime option - use a very early start date
        if (allTime) {
            startDate = LocalDate.of(2000, 1, 1); // Start from year 2000 to capture all data
            endDate = LocalDate.now();
        } else if (year != null && month != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else {
            if (endDate == null)
                endDate = LocalDate.now();
            if (startDate == null)
                startDate = endDate.minusMonths(3);
        }

        VisualReportRequest request = VisualReportRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .reportType(VisualReportRequest.ReportType.valueOf(reportType))
                .includeCharts(includeCharts)
                .includeFormulas(includeFormulas)
                .includeConditionalFormatting(includeConditionalFormatting)
                .targetId(targetId)
                .build();

        ByteArrayInputStream reportStream = visualReportService.generateVisualReport(jwt, request);

        // Generate filename with timestamp
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        String dateRange = allTime ? "all_time"
                : (startDate.format(FILE_DATE_FORMAT) + "_to_" + endDate.format(FILE_DATE_FORMAT));
        String filename = String.format("expense_report_%s_%s.xlsx", dateRange, timestamp);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(reportStream));
    }
}
