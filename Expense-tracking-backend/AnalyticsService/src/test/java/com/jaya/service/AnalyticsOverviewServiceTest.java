package com.jaya.service;

import com.jaya.dto.ApplicationOverviewDTO;
import com.jaya.dto.TopExpenseDTO;
import com.jaya.testutil.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsOverviewServiceTest {

    @Mock
    private AnalyticsExpenseClient expenseService;

    @Mock
    private BudgetAnalyticsClient budgetAnalyticsClient;

    @Mock
    private FriendshipAnalyticsClient friendshipAnalyticsClient;

    @Mock
    private GroupAnalyticsClient groupAnalyticsClient;

    @InjectMocks
    private AnalyticsOverviewService analyticsOverviewService;

    private static final String JWT = TestDataFactory.TEST_JWT;
    private static final Integer TARGET_ID = TestDataFactory.TEST_TARGET_ID;

    // ─── Happy Path Tests ───────────────────────────────────────────

    @Nested
    @DisplayName("getOverview - happy path")
    class HappyPathTests {

        @Test
        @DisplayName("should aggregate data from all services into overview DTO")
        void shouldAggregateAllServiceData() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildBudgetReports());
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenReturn(TestDataFactory.buildFriendshipStats());
            when(groupAnalyticsClient.getAllUserGroups(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(5));
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(2));
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(3));

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalExpenses()).isEqualTo(5000.0);
            assertThat(result.getTodayExpenses()).isEqualTo(200.0);
            assertThat(result.getTotalCreditDue()).isEqualTo(1500.0);
            assertThat(result.getRemainingBudget()).isEqualTo(3000.0);
            assertThat(result.getAvgDailySpendLast30Days()).isEqualTo(166.67);
            assertThat(result.getSavingsRateLast30Days()).isEqualTo(25.0);
            assertThat(result.getUpcomingBillsAmount()).isEqualTo(800.0);
            assertThat(result.getTotalBudgets()).isEqualTo(1);
            assertThat(result.getActiveBudgets()).isEqualTo(1);
            assertThat(result.getFriendsCount()).isEqualTo(12);
            assertThat(result.getPendingFriendRequests()).isEqualTo(3);
            assertThat(result.getTotalGroups()).isEqualTo(5);
            assertThat(result.getGroupsCreated()).isEqualTo(2);
            assertThat(result.getGroupsMember()).isEqualTo(3);
        }

        @Test
        @DisplayName("should extract top expenses correctly")
        void shouldExtractTopExpenses() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenReturn(Collections.emptyMap());
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result.getTopExpenses()).hasSize(2);
            TopExpenseDTO first = result.getTopExpenses().get(0);
            assertThat(first.getName()).isEqualTo("Restaurant Dinner");
            assertThat(first.getAmount()).isEqualTo(2000.0);
            assertThat(first.getDate()).isEqualTo("2024-01-15");
            assertThat(first.getCount()).isEqualTo(1);
        }
    }

    // ─── Service Failure Resilience Tests ───────────────────────────

    @Nested
    @DisplayName("getOverview - service failure resilience")
    class ServiceFailureTests {

        @Test
        @DisplayName("should handle budget service failure gracefully")
        void shouldHandleBudgetServiceFailure() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenThrow(new RuntimeException("Budget service down"));
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenReturn(TestDataFactory.buildFriendshipStats());
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalBudgets()).isZero();
            assertThat(result.getActiveBudgets()).isZero();
            // Other fields still populated
            assertThat(result.getTotalExpenses()).isEqualTo(5000.0);
            assertThat(result.getFriendsCount()).isEqualTo(12);
        }

        @Test
        @DisplayName("should handle friendship service failure gracefully")
        void shouldHandleFriendshipServiceFailure() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildBudgetReports());
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenThrow(new RuntimeException("Friendship service down"));
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getFriendsCount()).isZero();
            assertThat(result.getPendingFriendRequests()).isZero();
            // Budget data still populated
            assertThat(result.getTotalBudgets()).isEqualTo(1);
        }

        @Test
        @DisplayName("should handle group service failure gracefully")
        void shouldHandleGroupServiceFailure() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildBudgetReports());
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenReturn(TestDataFactory.buildFriendshipStats());
            when(groupAnalyticsClient.getAllUserGroups(JWT))
                    .thenThrow(new RuntimeException("Group service down"));
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT))
                    .thenThrow(new RuntimeException("Group service down"));
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT))
                    .thenThrow(new RuntimeException("Group service down"));

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalGroups()).isZero();
            assertThat(result.getGroupsCreated()).isZero();
            assertThat(result.getGroupsMember()).isZero();
        }

        @Test
        @DisplayName("should handle null budget reports list")
        void shouldHandleNullBudgetReports() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(null);
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenReturn(null);
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalBudgets()).isZero();
            assertThat(result.getFriendsCount()).isZero();
            assertThat(result.getTotalGroups()).isZero();
        }
    }

    // ─── Edge Case Tests ────────────────────────────────────────────

    @Nested
    @DisplayName("getOverview - edge cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("should handle empty expense summary")
        void shouldHandleEmptyExpenseSummary() {
            when(expenseService.getExpenseSummary(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyMap());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(null);
            when(friendshipAnalyticsClient.getFriendshipStats(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result.getTotalExpenses()).isZero();
            assertThat(result.getTodayExpenses()).isZero();
            assertThat(result.getTopExpenses()).isEmpty();
        }

        @Test
        @DisplayName("should handle non-numeric values in summary gracefully")
        void shouldHandleNonNumericValues() {
            Map<String, Object> summary = new HashMap<>();
            summary.put("currentMonthLosses", "not-a-number");
            summary.put("todayExpenses", null);
            summary.put("topExpenses", "not-a-list");

            when(expenseService.getExpenseSummary(JWT, TARGET_ID)).thenReturn(summary);
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID)).thenReturn(null);
            when(friendshipAnalyticsClient.getFriendshipStats(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getTotalExpenses()).isZero();
            assertThat(result.getTodayExpenses()).isZero();
            assertThat(result.getTopExpenses()).isEmpty();
        }

        @Test
        @DisplayName("should handle topExpenses with mixed valid and invalid entries")
        void shouldHandleMixedTopExpenses() {
            Map<String, Object> summary = TestDataFactory.buildExpenseSummary();
            List<Object> mixedList = new ArrayList<>();
            Map<String, Object> valid = new HashMap<>();
            valid.put("name", "Test");
            valid.put("amount", 100.0);
            valid.put("date", "2024-01-01");
            valid.put("count", 1);
            mixedList.add(valid);
            mixedList.add("not-a-map");
            summary.put("topExpenses", mixedList);

            when(expenseService.getExpenseSummary(JWT, TARGET_ID)).thenReturn(summary);
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID)).thenReturn(null);
            when(friendshipAnalyticsClient.getFriendshipStats(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, TARGET_ID);

            // Only the valid Map entry should be converted
            assertThat(result.getTopExpenses()).hasSize(1);
            assertThat(result.getTopExpenses().get(0).getName()).isEqualTo("Test");
        }

        @Test
        @DisplayName("should handle null targetId")
        void shouldHandleNullTargetId() {
            when(expenseService.getExpenseSummary(JWT, null))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, null))
                    .thenReturn(Collections.emptyList());
            when(friendshipAnalyticsClient.getFriendshipStats(JWT))
                    .thenReturn(Collections.emptyMap());
            when(groupAnalyticsClient.getAllUserGroups(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsCreatedByUser(JWT)).thenReturn(null);
            when(groupAnalyticsClient.getGroupsWhereUserIsMember(JWT)).thenReturn(null);

            ApplicationOverviewDTO result = analyticsOverviewService.getOverview(JWT, null);

            assertThat(result).isNotNull();
            assertThat(result.getTotalExpenses()).isEqualTo(5000.0);
        }
    }
}
