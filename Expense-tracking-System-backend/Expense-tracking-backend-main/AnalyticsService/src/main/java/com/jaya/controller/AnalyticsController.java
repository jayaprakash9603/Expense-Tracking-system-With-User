package com.jaya.controller;

import com.jaya.dto.ApplicationOverviewDTO;
import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.service.AnalyticsOverviewService;
import com.jaya.service.CategoryAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsOverviewService analyticsOverviewService;
    private final CategoryAnalyticsService categoryAnalyticsService;

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
}
