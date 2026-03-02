package com.jaya.service;

import com.jaya.dto.ApplicationOverviewDTO;
import com.jaya.dto.TopExpenseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class AnalyticsOverviewService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsOverviewService.class);

    private final AnalyticsExpenseClient expenseService;
    private final BudgetAnalyticsClient budgetAnalyticsClient;
    private final FriendshipAnalyticsClient friendshipAnalyticsClient;
    private final GroupAnalyticsClient groupAnalyticsClient;

    public ApplicationOverviewDTO getOverview(String jwt, Integer targetId) {
        CompletableFuture<Map<String, Object>> summaryFuture = CompletableFuture.supplyAsync(() -> expenseService.getExpenseSummary(jwt, targetId));
        
        CompletableFuture<List<Map<String, Object>>> budgetReportsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return budgetAnalyticsClient.getAllBudgetReportsForUser(jwt, targetId);
            } catch (Exception ex) {
                log.warn("Failed to fetch budget reports for analytics overview", ex);
                return null;
            }
        });

        CompletableFuture<Map<String, Object>> friendshipStatsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return friendshipAnalyticsClient.getFriendshipStats(jwt);
            } catch (Exception ex) {
                log.warn("Failed to fetch friendship stats for analytics overview", ex);
                return null;
            }
        });

        CompletableFuture<List<Map<String, Object>>> allGroupsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return groupAnalyticsClient.getAllUserGroups(jwt);
            } catch (Exception ex) {
                log.warn("Failed to fetch group stats for analytics overview", ex);
                return null;
            }
        });

        CompletableFuture<List<Map<String, Object>>> createdGroupsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return groupAnalyticsClient.getGroupsCreatedByUser(jwt);
            } catch (Exception ex) {
                log.warn("Failed to fetch created groups stats for analytics overview", ex);
                return null;
            }
        });

        CompletableFuture<List<Map<String, Object>>> memberGroupsFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return groupAnalyticsClient.getGroupsWhereUserIsMember(jwt);
            } catch (Exception ex) {
                log.warn("Failed to fetch member groups stats for analytics overview", ex);
                return null;
            }
        });

        CompletableFuture.allOf(summaryFuture, budgetReportsFuture, friendshipStatsFuture, allGroupsFuture, createdGroupsFuture, memberGroupsFuture).join();

        Map<String, Object> summary = summaryFuture.join();

        double totalExpenses = extractDouble(summary, "currentMonthLosses");
        double todayExpenses = extractDouble(summary, "todayExpenses");
        double totalCreditDue = extractDouble(summary, "totalCreditDue");
        double remainingBudget = extractDouble(summary, "remainingBudget");
        double avgDailySpendLast30Days = extractDouble(summary, "avgDailySpendLast30Days");
        double savingsRateLast30Days = extractDouble(summary, "savingsRateLast30Days");
        double upcomingBillsAmount = extractDouble(summary, "upcomingBillsAmount");
        List<TopExpenseDTO> topExpenses = extractTopExpenses(summary.get("topExpenses"));

        int totalBudgets = 0;
        int activeBudgets = 0;
        List<Map<String, Object>> budgetReports = budgetReportsFuture.join();
        if (budgetReports != null) {
            totalBudgets = budgetReports.size();
            activeBudgets = totalBudgets;
        }

        int friendsCount = 0;
        int pendingFriendRequests = 0;
        Map<String, Object> friendshipStats = friendshipStatsFuture.join();
        if (friendshipStats != null) {
            friendsCount = extractInt(friendshipStats, "totalFriends");
            pendingFriendRequests = extractInt(friendshipStats, "incomingRequests");
        }

        int totalGroups = 0;
        int groupsCreated = 0;
        int groupsMember = 0;
        List<Map<String, Object>> allGroups = allGroupsFuture.join();
        List<Map<String, Object>> createdGroups = createdGroupsFuture.join();
        List<Map<String, Object>> memberGroups = memberGroupsFuture.join();

        if (allGroups != null) {
            totalGroups = allGroups.size();
        }
        if (createdGroups != null) {
            groupsCreated = createdGroups.size();
        }
        if (memberGroups != null) {
            groupsMember = memberGroups.size();
        }

        log.debug(
                "Building ApplicationOverviewDTO: totalExpenses={}, todayExpenses={}, totalCreditDue={}, remainingBudget={}, avgDailySpendLast30Days={}, savingsRateLast30Days={}, upcomingBillsAmount={}, totalBudgets={}, activeBudgets={}, totalGroups={}, groupsCreated={}, groupsMember={}, friendsCount={}, pendingFriendRequests={}",
                totalExpenses, todayExpenses, totalCreditDue, remainingBudget,
                avgDailySpendLast30Days, savingsRateLast30Days, upcomingBillsAmount,
                totalBudgets, activeBudgets, totalGroups, groupsCreated, groupsMember,
                friendsCount, pendingFriendRequests);

        ApplicationOverviewDTO dto = new ApplicationOverviewDTO();
        dto.setTotalExpenses(totalExpenses);
        dto.setTodayExpenses(todayExpenses);
        dto.setTotalCreditDue(totalCreditDue);
        dto.setRemainingBudget(remainingBudget);
        dto.setAvgDailySpendLast30Days(avgDailySpendLast30Days);
        dto.setSavingsRateLast30Days(savingsRateLast30Days);
        dto.setUpcomingBillsAmount(upcomingBillsAmount);
        dto.setTopExpenses(topExpenses);
        dto.setTotalBudgets(totalBudgets);
        dto.setActiveBudgets(activeBudgets);
        dto.setTotalGroups(totalGroups);
        dto.setGroupsCreated(groupsCreated);
        dto.setGroupsMember(groupsMember);
        dto.setFriendsCount(friendsCount);
        dto.setPendingFriendRequests(pendingFriendRequests);

        return dto;
    }

    private double extractDouble(Map<String, Object> source, String key) {
        if (source == null || !source.containsKey(key) || source.get(key) == null) {
            return 0.0;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse numeric value for key '{}': {}", key, value, ex);
            return 0.0;
        }
    }

    private int extractInt(Map<String, Object> source, String key) {
        if (source == null || !source.containsKey(key) || source.get(key) == null) {
            return 0;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse integer value for key '{}': {}", key, value, ex);
            return 0;
        }
    }

    @SuppressWarnings("unchecked")
    private List<TopExpenseDTO> extractTopExpenses(Object raw) {
        if (!(raw instanceof List<?> list)) {
            return List.of();
        }

        return list.stream()
                .filter(item -> item instanceof Map)
                .map(item -> (Map<String, Object>) item)
                .map(map -> {
                    TopExpenseDTO dto = new TopExpenseDTO();
                    Object name = map.get("name");
                    Object amount = map.get("amount");
                    Object date = map.get("date");
                    Object count = map.get("count");

                    dto.setName(name != null ? name.toString() : null);
                    if (amount instanceof Number num) {
                        dto.setAmount(num.doubleValue());
                    } else if (amount != null) {
                        try {
                            dto.setAmount(Double.parseDouble(amount.toString()));
                        } catch (NumberFormatException ex) {
                            log.warn("Unable to parse top expense amount: {}", amount, ex);
                        }
                    }
                    dto.setDate(date != null ? date.toString() : null);
                    if (count instanceof Number numCount) {
                        dto.setCount(numCount.intValue());
                    }
                    return dto;
                })
                .toList();
    }
}
