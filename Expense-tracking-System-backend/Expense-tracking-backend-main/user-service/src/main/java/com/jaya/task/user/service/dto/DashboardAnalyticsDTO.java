package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDTO {

    


    private AdminAnalyticsOverviewDTO overview;

    


    private List<TopCategoryDTO> topCategories;

    


    private List<RecentActivityDTO> recentActivity;

    


    private List<TopUserDTO> topUsers;

    


    private UserStatsDTO userStats;
}
