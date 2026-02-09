package com.jaya.controller;

import com.jaya.dto.ApplicationOverviewDTO;
import com.jaya.dto.AnalyticsEntityType;
import com.jaya.dto.AnalyticsRequestDTO;
import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.dto.report.VisualReportRequest;
import com.jaya.service.AnalyticsOverviewService;
import com.jaya.service.AnalyticsEntityService;
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
    private final AnalyticsEntityService analyticsEntityService;
    private final VisualReportService visualReportService;

    @GetMapping("/overview")
    public ResponseEntity<ApplicationOverviewDTO> getApplicationOverview(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId) {

        ApplicationOverviewDTO overview = analyticsOverviewService.getOverview(jwt, targetId);
        return ResponseEntity.ok(overview);
    }

    @PostMapping("/entity")
    public ResponseEntity<CategoryAnalyticsDTO> getEntityAnalytics(
            @RequestHeader("Authorization") String jwt,
            @RequestBody AnalyticsRequestDTO request) {

        // Apply default dates if not provided
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : endDate.minusMonths(6);
        String trendType = request.getTrendType() != null ? request.getTrendType() : "MONTHLY";

        log.info("Fetching {} analytics: entityId={}, startDate={}, endDate={}, trendType={}, targetId={}",
                request.getEntityType(), request.getEntityId(), startDate, endDate, trendType, request.getTargetId());

        AnalyticsRequestDTO normalizedRequest = AnalyticsRequestDTO.builder()
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .startDate(startDate)
                .endDate(endDate)
                .trendType(trendType)
                .targetId(request.getTargetId())
                .build();

        CategoryAnalyticsDTO analytics = analyticsEntityService.getAnalytics(jwt, normalizedRequest);
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
        if (allTime) {
            startDate = LocalDate.of(2000, 1, 1);
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
