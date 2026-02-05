package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.*;
import com.jaya.task.user.service.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;





@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    





    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAnalyticsOverviewDTO> getAnalyticsOverview(
            @RequestParam(defaultValue = "7d") String timeRange) {

        log.info("Fetching analytics overview for timeRange: {}", timeRange);
        AdminAnalyticsOverviewDTO overview = adminAnalyticsService.getAnalyticsOverview(timeRange);
        return ResponseEntity.ok(overview);
    }

    






    @GetMapping("/top-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopCategoryDTO>> getTopCategories(
            @RequestParam(defaultValue = "7d") String timeRange,
            @RequestParam(defaultValue = "5") int limit) {

        log.info("Fetching top {} categories for timeRange: {}", limit, timeRange);
        List<TopCategoryDTO> categories = adminAnalyticsService.getTopCategories(timeRange, limit);
        return ResponseEntity.ok(categories);
    }

    





    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivity(
            @RequestParam(defaultValue = "24") int hours) {

        log.info("Fetching recent activity for last {} hours", hours);
        List<RecentActivityDTO> activities = adminAnalyticsService.getRecentActivity(hours);
        return ResponseEntity.ok(activities);
    }

    






    @GetMapping("/top-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopUserDTO>> getTopUsers(
            @RequestParam(defaultValue = "7d") String timeRange,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Fetching top {} users for timeRange: {}", limit, timeRange);
        List<TopUserDTO> topUsers = adminAnalyticsService.getTopUsers(timeRange, limit);
        return ResponseEntity.ok(topUsers);
    }

    




    @GetMapping("/user-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        log.info("Fetching user statistics");
        UserStatsDTO stats = adminAnalyticsService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    





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
