package com.jaya.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ApplicationOverviewDTO {

    // Expense-related metrics
    private double totalExpenses;
    private double todayExpenses;
    private double totalCreditDue;
    private double remainingBudget;
    private double avgDailySpendLast30Days;
    private double savingsRateLast30Days;
    private double upcomingBillsAmount;

    // Aggregated expenses for last 30 days
    private List<TopExpenseDTO> topExpenses;

    // Budget-related metrics
    private int totalBudgets;
    private int activeBudgets;

    // Group-related metrics
    private int totalGroups;
    private int groupsCreated;
    private int groupsMember;

    // Friendship-related metrics
    private int friendsCount;
    private int pendingFriendRequests;
}
