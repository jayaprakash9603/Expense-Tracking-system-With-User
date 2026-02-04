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
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

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

    // ==================== VISUAL EXCEL REPORT ENDPOINTS ====================

    /**
     * Generate and download a comprehensive visual Excel report.
     * Includes charts, formulas, conditional formatting, and multiple sheets.
     *
     * @param jwt        Authorization token
     * @param startDate  Start date for the report (YYYY-MM-DD)
     * @param endDate    End date for the report (YYYY-MM-DD)
     * @param includeCharts Include charts in the report (default: true)
     * @param includeFormulas Include dynamic formulas (default: true)
     * @param includeConditionalFormatting Include conditional formatting (default: true)
     * @param targetId   Optional target user ID for friend expense viewing
     * @return Excel file download
     */
    @GetMapping("/report/excel")
    public ResponseEntity<InputStreamResource> downloadVisualReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "includeCharts", required = false, defaultValue = "true") boolean includeCharts,
            @RequestParam(value = "includeFormulas", required = false, defaultValue = "true") boolean includeFormulas,
            @RequestParam(value = "includeConditionalFormatting", required = false, defaultValue = "true") boolean includeConditionalFormatting,
            @RequestParam(value = "targetId", required = false) Integer targetId) throws IOException {

        log.info("Generating visual Excel report: startDate={}, endDate={}, charts={}, formulas={}, formatting={}",
                startDate, endDate, includeCharts, includeFormulas, includeConditionalFormatting);

        // Set default dates if not provided (last 3 months)
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusMonths(3);
        }

        VisualReportRequest request = VisualReportRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .reportType(VisualReportRequest.ReportType.COMPREHENSIVE)
                .includeCharts(includeCharts)
                .includeFormulas(includeFormulas)
                .includeConditionalFormatting(includeConditionalFormatting)
                .targetId(targetId)
                .build();

        ByteArrayInputStream reportStream = visualReportService.generateVisualReport(jwt, request);

        String filename = String.format("expense_report_%s_to_%s.xlsx",
                startDate.format(FILE_DATE_FORMAT),
                endDate.format(FILE_DATE_FORMAT));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(reportStream));
    }

    /**
     * Generate and download a monthly expense report.
     *
     * @param jwt   Authorization token
     * @param year  Year for the report
     * @param month Month for the report (1-12)
     * @param targetId Optional target user ID
     * @return Excel file download
     */
    @GetMapping("/report/excel/monthly")
    public ResponseEntity<InputStreamResource> downloadMonthlyReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @RequestParam(value = "targetId", required = false) Integer targetId) throws IOException {

        log.info("Generating monthly Excel report: year={}, month={}", year, month);

        ByteArrayInputStream reportStream = visualReportService.generateMonthlyReport(jwt, year, month, targetId);

        String filename = String.format("expense_report_%d_%02d.xlsx", year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(reportStream));
    }

    /**
     * Generate and download a current month expense report.
     *
     * @param jwt Authorization token
     * @param targetId Optional target user ID
     * @return Excel file download
     */
    @GetMapping("/report/excel/current-month")
    public ResponseEntity<InputStreamResource> downloadCurrentMonthReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId) throws IOException {

        LocalDate now = LocalDate.now();
        log.info("Generating current month Excel report: {}/{}", now.getYear(), now.getMonthValue());

        ByteArrayInputStream reportStream = visualReportService.generateMonthlyReport(
                jwt, now.getYear(), now.getMonthValue(), targetId);

        String filename = String.format("expense_report_current_month_%s.xlsx", now.format(FILE_DATE_FORMAT));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(reportStream));
    }

    /**
     * Generate a custom visual report with POST body for more options.
     *
     * @param jwt     Authorization token
     * @param request Report configuration request
     * @return Excel file download
     */
    @PostMapping("/report/excel/custom")
    public ResponseEntity<InputStreamResource> downloadCustomReport(
            @RequestHeader("Authorization") String jwt,
            @RequestBody VisualReportRequest request) throws IOException {

        log.info("Generating custom Excel report: type={}, dateRange={} to {}",
                request.getReportType(), request.getStartDate(), request.getEndDate());

        ByteArrayInputStream reportStream = visualReportService.generateVisualReport(jwt, request);

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().minusMonths(3);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();
        String filename = String.format("expense_report_custom_%s_to_%s.xlsx",
                startDate.format(FILE_DATE_FORMAT),
                endDate.format(FILE_DATE_FORMAT));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(reportStream));
    }
}
