package com.jaya.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ApplicationOverviewDTO {
    private double totalExpenses;
    private double todayExpenses;
    private double totalCreditDue;
    private double remainingBudget;
    private double avgDailySpendLast30Days;
    private double savingsRateLast30Days;
    private double upcomingBillsAmount;
    private List<TopExpenseDTO> topExpenses;
    private int totalBudgets;
    private int activeBudgets;
    private int totalGroups;
    private int groupsCreated;
    private int groupsMember;
    private int friendsCount;
    private int pendingFriendRequests;
}
