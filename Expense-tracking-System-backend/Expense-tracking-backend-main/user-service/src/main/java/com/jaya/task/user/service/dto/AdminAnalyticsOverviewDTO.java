package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for system-wide analytics overview
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsOverviewDTO {

    // User metrics
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long suspendedUsers;
    private long newUsersThisMonth;
    private double userGrowthPercentage;
    private double activeGrowthPercentage;

    // Expense metrics
    private long totalExpenses;
    private double totalExpenseAmount;
    private double expenseGrowthPercentage;

    // Revenue/Income metrics
    private double totalRevenue;
    private double revenueGrowthPercentage;

    // Averages
    private double avgExpensePerUser;
    private double avgExpenseAmount;

    // Time range info
    private String timeRange;
    private String startDate;
    private String endDate;
}
