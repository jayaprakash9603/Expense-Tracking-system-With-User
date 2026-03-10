package com.jaya.service;

import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.dto.CategoryAnalyticsDTO.*;
import com.jaya.testutil.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryAnalyticsServiceTest {

    @Mock private CategoryAnalyticsClient categoryAnalyticsClient;
    @Mock private BudgetAnalyticsClient budgetAnalyticsClient;
    @Mock private PaymentMethodAnalyticsClient paymentMethodAnalyticsClient;
    @Mock private BillAnalyticsClient billAnalyticsClient;
    @Mock private AnalyticsExpenseClient expenseService;
    @Mock private BudgetClient budgetService;

    @InjectMocks
    private CategoryAnalyticsService categoryAnalyticsService;

    private static final String JWT = TestDataFactory.TEST_JWT;
    private static final Integer TARGET_ID = TestDataFactory.TEST_TARGET_ID;
    private static final Integer CATEGORY_ID = TestDataFactory.TEST_CATEGORY_ID;
    private static final Integer PAYMENT_ID = TestDataFactory.TEST_PAYMENT_METHOD_ID;
    private static final Integer BILL_ID = TestDataFactory.TEST_BILL_ID;
    private static final LocalDate START = LocalDate.now().minusMonths(6);
    private static final LocalDate END = LocalDate.now();

    // ─── Helper: build categorized data like Feign returns ──────────

    private Map<String, Object> buildCategorizedData(Integer categoryId, String categoryName,
                                                     List<Map<String, Object>> expenses) {
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> categoryEntry = new HashMap<>();
        categoryEntry.put("id", categoryId);
        categoryEntry.put("name", categoryName);
        categoryEntry.put("icon", "🍔");
        categoryEntry.put("color", "#FF5733");
        categoryEntry.put("expenses", expenses);
        data.put(categoryName, categoryEntry);

        Map<String, Object> summaryEntry = new HashMap<>();
        double total = expenses.stream()
                .mapToDouble(e -> {
                    Object exp = e.get("expense");
                    if (exp instanceof Map) {
                        Object amt = ((Map<?, ?>) exp).get("amount");
                        return amt instanceof Number ? ((Number) amt).doubleValue() : 0;
                    }
                    Object amt = e.get("amount");
                    return amt instanceof Number ? ((Number) amt).doubleValue() : 0;
                })
                .sum();
        summaryEntry.put("totalExpenses", total);
        data.put("summary", summaryEntry);
        return data;
    }

    private Map<String, Object> buildPaymentMethodData(Integer pmId, String pmName,
                                                       List<Map<String, Object>> expenses) {
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> entry = new HashMap<>();
        entry.put("id", pmId);
        entry.put("name", pmName);
        entry.put("expenses", expenses);
        data.put(pmName, entry);

        Map<String, Object> summaryEntry = new HashMap<>();
        summaryEntry.put("totalExpenses", 500.0);
        data.put("summary", summaryEntry);
        return data;
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── getCategoryAnalytics ─────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getCategoryAnalytics")
    class GetCategoryAnalyticsTests {

        @Test
        @DisplayName("should return analytics with metadata when expenses exist")
        void shouldReturnAnalyticsWithExpenses() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildBudgetReports());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getCategoryMetadata()).isNotNull();
            assertThat(result.getCategoryMetadata().getCategoryName()).isEqualTo("Food");
            assertThat(result.getCategoryMetadata().getCategoryId()).isEqualTo(CATEGORY_ID);
            assertThat(result.getSummaryStatistics()).isNotNull();
            assertThat(result.getSummaryStatistics().getTotalTransactions()).isEqualTo(3);
            assertThat(result.getTrendAnalytics()).isNotNull();
            assertThat(result.getTransactionData()).isNotNull();
            assertThat(result.getTransactionData().getTotalCount()).isEqualTo(3);
        }

        @Test
        @DisplayName("should fetch metadata from category service when no expenses in range")
        void shouldFetchMetadataForEmptyExpenses() {
            Map<String, Object> emptyCategorized = new HashMap<>();
            emptyCategorized.put("summary", Map.of("totalExpenses", 0.0));

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(emptyCategorized);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(categoryAnalyticsClient.getCategoryById(JWT, CATEGORY_ID, TARGET_ID))
                    .thenReturn(TestDataFactory.buildCategoryById());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getCategoryMetadata()).isNotNull();
            verify(categoryAnalyticsClient).getCategoryById(JWT, CATEGORY_ID, TARGET_ID);
        }

        @Test
        @DisplayName("should handle fetch failure gracefully with fallback metadata")
        void shouldHandleFetchFailureGracefully() {
            // fetchAllCategoryDataDetailed catches exceptions internally and returns emptyMap
            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenThrow(new RuntimeException("Service unavailable"));
            // budgetService unstubbed returns null, handled by fetchAllBudgets null-check
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            // categoryAnalyticsClient.getCategoryById is called when categoryData is empty;
            // stub to throw so the catch block returns "Unknown Category" fallback
            when(categoryAnalyticsClient.getCategoryById(JWT, CATEGORY_ID, TARGET_ID))
                    .thenThrow(new RuntimeException("Category service unavailable"));

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getCategoryMetadata()).isNotNull();
            assertThat(result.getCategoryMetadata().getCategoryName()).isEqualTo("Unknown Category");
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── getPaymentMethodAnalytics ────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getPaymentMethodAnalytics")
    class GetPaymentMethodAnalyticsTests {

        @Test
        @DisplayName("should return analytics for payment method with expenses")
        void shouldReturnPaymentMethodAnalytics() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> pmData = buildPaymentMethodData(PAYMENT_ID, "UPI", expenses);

            when(expenseService.getAllExpensesByPaymentMethodDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(pmData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getPaymentMethodAnalytics(
                    JWT, PAYMENT_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getSummaryStatistics()).isNotNull();
            assertThat(result.getTrendAnalytics()).isNotNull();
        }

        @Test
        @DisplayName("should fetch metadata from payment service when no expenses")
        void shouldFetchPaymentMetadataWhenEmpty() {
            Map<String, Object> emptyCategorized = new HashMap<>();
            emptyCategorized.put("summary", Map.of("totalExpenses", 0.0));

            when(expenseService.getAllExpensesByPaymentMethodDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(emptyCategorized);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(paymentMethodAnalyticsClient.getPaymentMethodById(JWT, PAYMENT_ID, TARGET_ID))
                    .thenReturn(TestDataFactory.buildPaymentMethodById());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getPaymentMethodAnalytics(
                    JWT, PAYMENT_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            verify(paymentMethodAnalyticsClient).getPaymentMethodById(JWT, PAYMENT_ID, TARGET_ID);
        }

        @Test
        @DisplayName("should handle payment data fetch failure gracefully")
        void shouldHandlePaymentFetchFailureGracefully() {
            // fetchAllPaymentMethodDataDetailed catches exceptions internally and returns emptyMap
            when(expenseService.getAllExpensesByPaymentMethodDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenThrow(new RuntimeException("Payment service down"));

            CategoryAnalyticsDTO result = categoryAnalyticsService.getPaymentMethodAnalytics(
                    JWT, PAYMENT_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getCategoryMetadata()).isNotNull();
            assertThat(result.getCategoryMetadata().getCategoryName()).isEqualTo("Unknown Payment Method");
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── getBillAnalytics ─────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getBillAnalytics")
    class GetBillAnalyticsTests {

        @Test
        @DisplayName("should return analytics for bill entity")
        void shouldReturnBillAnalytics() {
            Map<String, Object> billData = TestDataFactory.buildBillById();
            billData.put("amount", 1500.0);
            billData.put("date", LocalDate.now().minusDays(10).toString());

            Map<String, Object> summaryData = new HashMap<>();
            summaryData.put("summary", Map.of("totalExpenses", 1500.0));

            when(billAnalyticsClient.getBillById(JWT, BILL_ID, TARGET_ID))
                    .thenReturn(billData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(summaryData);

            CategoryAnalyticsDTO result = categoryAnalyticsService.getBillAnalytics(
                    JWT, BILL_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getCategoryMetadata()).isNotNull();
        }

        @Test
        @DisplayName("should throw on bill fetch failure")
        void shouldThrowOnBillFetchFailure() {
            when(billAnalyticsClient.getBillById(JWT, BILL_ID, TARGET_ID))
                    .thenThrow(new RuntimeException("Bill service down"));

            assertThatThrownBy(() -> categoryAnalyticsService.getBillAnalytics(
                    JWT, BILL_ID, START, END, "MONTHLY", TARGET_ID))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Summary Statistics ───────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Summary Statistics calculations")
    class SummaryStatisticsTests {

        @Test
        @DisplayName("should calculate total spent correctly")
        void shouldCalculateTotalSpent() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            SummaryStatistics stats = result.getSummaryStatistics();
            assertThat(stats.getTotalSpent()).isEqualTo(2500.0); // 500 + 1200 + 800
            assertThat(stats.getTotalTransactions()).isEqualTo(3);
            assertThat(stats.getAverageExpense()).isCloseTo(833.33, within(1.0));
            assertThat(stats.getMinExpense()).isEqualTo(500.0);
            assertThat(stats.getMaxExpense()).isEqualTo(1200.0);
        }

        @Test
        @DisplayName("should handle empty expense list for summary")
        void shouldHandleEmptySummary() {
            Map<String, Object> emptyCategorized = new HashMap<>();
            emptyCategorized.put("summary", Map.of("totalExpenses", 0.0));

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(emptyCategorized);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(categoryAnalyticsClient.getCategoryById(JWT, CATEGORY_ID, TARGET_ID))
                    .thenReturn(TestDataFactory.buildCategoryById());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            SummaryStatistics stats = result.getSummaryStatistics();
            assertThat(stats.getTotalSpent()).isZero();
            assertThat(stats.getTotalTransactions()).isZero();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Trend Analytics ──────────────────────────────────════════
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Trend Analytics calculations")
    class TrendAnalyticsTests {

        @Test
        @DisplayName("should calculate daily spending trends")
        void shouldCalculateDailyTrends() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "DAILY", TARGET_ID);

            TrendAnalytics trends = result.getTrendAnalytics();
            assertThat(trends).isNotNull();
            assertThat(trends.getDailySpendingTrend()).isNotEmpty();
        }

        @Test
        @DisplayName("should calculate monthly spending trends")
        void shouldCalculateMonthlyTrends() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            TrendAnalytics trends = result.getTrendAnalytics();
            assertThat(trends).isNotNull();
            assertThat(trends.getMonthlySpendingTrend()).isNotEmpty();
        }

        @Test
        @DisplayName("should calculate weekly spending trends")
        void shouldCalculateWeeklyTrends() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "WEEKLY", TARGET_ID);

            TrendAnalytics trends = result.getTrendAnalytics();
            assertThat(trends).isNotNull();
            assertThat(trends.getWeeklySpendingTrend()).isNotEmpty();
        }

        @Test
        @DisplayName("should calculate yearly spending trends")
        void shouldCalculateYearlyTrends() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "YEARLY", TARGET_ID);

            TrendAnalytics trends = result.getTrendAnalytics();
            assertThat(trends).isNotNull();
            assertThat(trends.getYearlySpendingTrend()).isNotEmpty();
        }

        @Test
        @DisplayName("should calculate month comparison")
        void shouldCalculateMonthComparison() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            MonthComparison monthComp = result.getTrendAnalytics().getPreviousVsCurrentMonth();
            assertThat(monthComp).isNotNull();
            assertThat(monthComp.getCurrentMonthName()).isNotEmpty();
            assertThat(monthComp.getPreviousMonthName()).isNotEmpty();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Payment Method Distribution ──────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Payment Method Distribution")
    class PaymentMethodDistributionTests {

        @Test
        @DisplayName("should calculate distribution across payment methods")
        void shouldCalculateDistribution() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            List<PaymentMethodDistribution> dist = result.getPaymentMethodDistribution();
            assertThat(dist).isNotEmpty();
            double totalPercentage = dist.stream()
                    .mapToDouble(PaymentMethodDistribution::getPercentage)
                    .sum();
            assertThat(totalPercentage).isCloseTo(100.0, within(1.0));
        }

        @Test
        @DisplayName("should assign colors from predefined palette")
        void shouldAssignPaymentColors() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            result.getPaymentMethodDistribution().forEach(d ->
                    assertThat(d.getColor()).isNotEmpty());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Budget Analytics ─────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Budget Analytics calculations")
    class BudgetAnalyticsTests {

        @Test
        @DisplayName("should calculate budget analytics with linked budgets")
        void shouldCalculateBudgetAnalytics() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildBudgetReports());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            BudgetAnalytics budget = result.getBudgetAnalytics();
            assertThat(budget).isNotNull();
            assertThat(budget.getLinkedBudgets()).isNotEmpty();
            assertThat(budget.getTotalAllocated()).isPositive();
        }

        @Test
        @DisplayName("should handle budget fetch failure gracefully")
        void shouldHandleBudgetFetchFailure() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            // fetchAllBudgets catches exceptions internally and returns emptyList
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenThrow(new RuntimeException("Budget service down"));

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result).isNotNull();
            assertThat(result.getBudgetAnalytics()).isNotNull();
            assertThat(result.getBudgetAnalytics().getTotalAllocated()).isZero();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Expense Highlights ───────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Expense Highlights")
    class ExpenseHighlightsTests {

        @Test
        @DisplayName("should identify highest and lowest expenses")
        void shouldIdentifyHighAndLow() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            ExpenseHighlights highlights = result.getExpenseHighlights();
            assertThat(highlights).isNotNull();
            assertThat(highlights.getHighestExpense()).isNotNull();
            assertThat(highlights.getHighestExpense().getAmount()).isEqualTo(1200.0);
            assertThat(highlights.getLowestExpense()).isNotNull();
            assertThat(highlights.getLowestExpense().getAmount()).isEqualTo(500.0);
        }

        @Test
        @DisplayName("should identify most recent and oldest expenses")
        void shouldIdentifyRecentAndOldest() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            ExpenseHighlights highlights = result.getExpenseHighlights();
            assertThat(highlights.getMostRecentExpense()).isNotNull();
            assertThat(highlights.getOldestExpense()).isNotNull();
            assertThat(highlights.getMostRecentExpense().getDate())
                    .isAfterOrEqualTo(highlights.getOldestExpense().getDate());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Transaction Data ─────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Transaction Data")
    class TransactionDataTests {

        @Test
        @DisplayName("should build transaction list sorted by date descending")
        void shouldBuildSortedTransactions() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            TransactionData txData = result.getTransactionData();
            assertThat(txData).isNotNull();
            assertThat(txData.getTotalCount()).isEqualTo(3);
            assertThat(txData.getFullExpenseList()).hasSize(3);

            List<ExpenseTransaction> transactions = txData.getFullExpenseList();
            for (int i = 0; i < transactions.size() - 1; i++) {
                assertThat(transactions.get(i).getDate())
                        .isAfterOrEqualTo(transactions.get(i + 1).getDate());
            }
        }

        @Test
        @DisplayName("should limit recent transactions to 10")
        void shouldLimitRecentTransactions() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result.getTransactionData().getRecentTransactions().size())
                    .isLessThanOrEqualTo(10);
        }

        @Test
        @DisplayName("should extract budget IDs for transactions")
        void shouldExtractBudgetIds() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            List<ExpenseTransaction> all = result.getTransactionData().getFullExpenseList();
            boolean hasBudgetIds = all.stream()
                    .anyMatch(tx -> tx.getAssociatedBudgetIds() != null && !tx.getAssociatedBudgetIds().isEmpty());
            assertThat(hasBudgetIds).isTrue();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── Insights Generation ──────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Insights Generation")
    class InsightsTests {

        @Test
        @DisplayName("should generate insights list")
        void shouldGenerateInsights() {
            List<Map<String, Object>> expenses = TestDataFactory.buildExpenseWrapperList();
            Map<String, Object> categorizedData = buildCategorizedData(CATEGORY_ID, "Food", expenses);

            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), eq("outflow"), eq(TARGET_ID)))
                    .thenReturn(categorizedData);
            when(budgetService.getAllBudgets(JWT, TARGET_ID))
                    .thenReturn(TestDataFactory.buildBudgetReports());

            CategoryAnalyticsDTO result = categoryAnalyticsService.getCategoryAnalytics(
                    JWT, CATEGORY_ID, START, END, "MONTHLY", TARGET_ID);

            assertThat(result.getInsights()).isNotNull();
            if (!result.getInsights().isEmpty()) {
                result.getInsights().forEach(insight -> {
                    assertThat(insight.getType()).isIn("WARNING", "INFO", "SUGGESTION");
                    assertThat(insight.getTitle()).isNotEmpty();
                    assertThat(insight.getMessage()).isNotEmpty();
                });
            }
        }
    }
}
