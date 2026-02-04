package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.*;
import com.jaya.task.user.service.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for admin analytics endpoints.
 * Provides system-wide statistics and metrics for the admin dashboard.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    /**
     * Get system-wide analytics overview
     * 
     * @param timeRange Time range: 24h, 7d, 30d, 90d, 1y
     * @return Analytics overview with user, expense, and revenue stats
     */
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAnalyticsOverviewDTO> getAnalyticsOverview(
            @RequestParam(defaultValue = "7d") String timeRange) {

        log.info("Fetching analytics overview for timeRange: {}", timeRange);
        AdminAnalyticsOverviewDTO overview = adminAnalyticsService.getAnalyticsOverview(timeRange);
        return ResponseEntity.ok(overview);
    }

    /**
     * Get top expense categories across all users
     * 
     * @param timeRange Time range for category analysis
     * @param limit     Maximum number of categories to return
     * @return List of top categories with counts and amounts
     */
    @GetMapping("/top-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopCategoryDTO>> getTopCategories(
            @RequestParam(defaultValue = "7d") String timeRange,
            @RequestParam(defaultValue = "5") int limit) {

        log.info("Fetching top {} categories for timeRange: {}", limit, timeRange);
        List<TopCategoryDTO> categories = adminAnalyticsService.getTopCategories(timeRange, limit);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get recent system activity
     * 
     * @param hours Number of hours to look back
     * @return List of recent activities with counts
     */
    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivity(
            @RequestParam(defaultValue = "24") int hours) {

        log.info("Fetching recent activity for last {} hours", hours);
        List<RecentActivityDTO> activities = adminAnalyticsService.getRecentActivity(hours);
        return ResponseEntity.ok(activities);
    }

    /**
     * Get top users by expense activity
     * 
     * @param timeRange Time range for user analysis
     * @param limit     Maximum number of users to return
     * @return List of top users with expense counts and totals
     */
    @GetMapping("/top-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopUserDTO>> getTopUsers(
            @RequestParam(defaultValue = "7d") String timeRange,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Fetching top {} users for timeRange: {}", limit, timeRange);
        List<TopUserDTO> topUsers = adminAnalyticsService.getTopUsers(timeRange, limit);
        return ResponseEntity.ok(topUsers);
    }

    /**
     * Get user statistics
     * 
     * @return User stats including counts by status and role
     */
    @GetMapping("/user-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        log.info("Fetching user statistics");
        UserStatsDTO stats = adminAnalyticsService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all analytics data in a single call (for dashboard initialization)
     * 
     * @param timeRange Time range for analysis
     * @return Combined analytics response
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardAnalyticsDTO> getDashboardAnalytics(
            @RequestParam(defaultValue = "7d") String timeRange) {

        log.info("Fetching complete dashboard analytics for timeRange: {}", timeRange);

        DashboardAnalyticsDTO dashboard = DashboardAnalyticsDTO.builder()
                .overview(adminAnalyticsService.getAnalyticsOverview(timeRange))
                .topCategories(adminAnalyticsService.getTopCategories(timeRange, 5))
                .recentActivity(adminAnalyticsService.getRecentActivity(24))
                .topUsers(adminAnalyticsService.getTopUsers(timeRange, 10))
                .userStats(adminAnalyticsService.getUserStats())
                .build();

        return ResponseEntity.ok(dashboard);
    }
}
