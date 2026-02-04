package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Combined analytics DTO for dashboard initialization.
 * Returns all dashboard data in a single API call.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDTO {

    /**
     * System-wide analytics overview
     */
    private AdminAnalyticsOverviewDTO overview;

    /**
     * Top expense categories
     */
    private List<TopCategoryDTO> topCategories;

    /**
     * Recent system activity
     */
    private List<RecentActivityDTO> recentActivity;

    /**
     * Top users by activity
     */
    private List<TopUserDTO> topUsers;

    /**
     * User statistics breakdown
     */
    private UserStatsDTO userStats;
}
