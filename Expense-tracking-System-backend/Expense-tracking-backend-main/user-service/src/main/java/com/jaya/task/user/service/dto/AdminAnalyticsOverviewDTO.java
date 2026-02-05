package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;




@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsOverviewDTO {

    
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long suspendedUsers;
    private long newUsersThisMonth;
    private double userGrowthPercentage;
    private double activeGrowthPercentage;

    
    private long totalExpenses;
    private double totalExpenseAmount;
    private double expenseGrowthPercentage;

    
    private double totalRevenue;
    private double revenueGrowthPercentage;

    
    private double avgExpensePerUser;
    private double avgExpenseAmount;

    
    private String timeRange;
    private String startDate;
    private String endDate;
}
