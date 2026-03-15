package com.jaya.testutil;

import com.jaya.dto.*;
import com.jaya.dto.CategoryAnalyticsDTO.*;
import com.jaya.dto.report.ReportData;
import com.jaya.dto.report.VisualReportRequest;

import java.time.LocalDate;
import java.util.*;

public class TestDataFactory {

    public static final String TEST_JWT = "Bearer test-jwt-token";
    public static final Integer TEST_TARGET_ID = 1;
    public static final Integer TEST_CATEGORY_ID = 10;
    public static final Integer TEST_PAYMENT_METHOD_ID = 5;
    public static final Integer TEST_BILL_ID = 7;

    // ─── Expense Summary ────────────────────────────────────────────

    public static Map<String, Object> buildExpenseSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("currentMonthLosses", 5000.0);
        summary.put("todayExpenses", 200.0);
        summary.put("totalCreditDue", 1500.0);
        summary.put("remainingBudget", 3000.0);
        summary.put("avgDailySpendLast30Days", 166.67);
        summary.put("savingsRateLast30Days", 25.0);
        summary.put("upcomingBillsAmount", 800.0);
        summary.put("totalIncome", 10000.0);
        summary.put("netBalance", 5000.0);
        summary.put("transactionCount", 30);
        summary.put("maxExpense", 2000.0);
        summary.put("minExpense", 50.0);
        summary.put("topCategory", "Food");
        summary.put("topCategoryAmount", 2500.0);
        summary.put("topPaymentMethod", "UPI");
        summary.put("topExpenses", buildTopExpensesList());
        return summary;
    }

    public static List<Map<String, Object>> buildTopExpensesList() {
        List<Map<String, Object>> topExpenses = new ArrayList<>();
        Map<String, Object> expense1 = new HashMap<>();
        expense1.put("name", "Restaurant Dinner");
        expense1.put("amount", 2000.0);
        expense1.put("date", "2024-01-15");
        expense1.put("count", 1);
        topExpenses.add(expense1);

        Map<String, Object> expense2 = new HashMap<>();
        expense2.put("name", "Grocery Shopping");
        expense2.put("amount", 1500.0);
        expense2.put("date", "2024-01-10");
        expense2.put("count", 3);
        topExpenses.add(expense2);
        return topExpenses;
    }

    // ─── Budget Reports ─────────────────────────────────────────────

    public static List<Map<String, Object>> buildBudgetReports() {
        List<Map<String, Object>> reports = new ArrayList<>();
        Map<String, Object> report = new HashMap<>();
        report.put("id", 1);
        report.put("name", "Monthly Budget");
        report.put("description", "Main monthly budget");
        report.put("totalAmount", 10000.0);
        report.put("spentAmount", 5000.0);
        report.put("remainingAmount", 5000.0);
        report.put("budgetStatus", "ACTIVE");
        report.put("startDate", "2024-01-01");
        report.put("endDate", "2024-01-31");

        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        Map<String, Object> catBreakdown = new HashMap<>();
        catBreakdown.put("categoryId", TEST_CATEGORY_ID);
        catBreakdown.put("amount", 3000.0);
        catBreakdown.put("transactionCount", 15);
        categoryBreakdown.add(catBreakdown);
        report.put("categoryBreakdown", categoryBreakdown);

        reports.add(report);
        return reports;
    }

    // ─── Friendship Stats ───────────────────────────────────────────

    public static Map<String, Object> buildFriendshipStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFriends", 12);
        stats.put("incomingRequests", 3);
        return stats;
    }

    // ─── Group Data ─────────────────────────────────────────────────

    public static List<Map<String, Object>> buildGroupsList(int count) {
        List<Map<String, Object>> groups = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Map<String, Object> group = new HashMap<>();
            group.put("id", i);
            group.put("name", "Group " + i);
            groups.add(group);
        }
        return groups;
    }

    // ─── Category Data ──────────────────────────────────────────────

    public static Map<String, Object> buildCategoryById() {
        Map<String, Object> category = new HashMap<>();
        category.put("id", TEST_CATEGORY_ID);
        category.put("name", "Food");
        category.put("icon", "🍔");
        category.put("color", "#FF5733");
        category.put("description", "Food and dining expenses");
        category.put("type", "expense");
        return category;
    }

    public static Map<String, Object> buildCategoryExpensesResponse() {
        Map<String, Object> response = new HashMap<>();

        Map<String, Object> foodCategory = new HashMap<>();
        foodCategory.put("id", TEST_CATEGORY_ID);
        foodCategory.put("name", "Food");
        foodCategory.put("icon", "🍔");
        foodCategory.put("color", "#FF5733");
        foodCategory.put("expenses", buildExpenseWrapperList());
        response.put("Food", foodCategory);

        Map<String, Object> summaryData = new HashMap<>();
        summaryData.put("totalExpenses", 2500.0);
        response.put("summary", summaryData);

        return response;
    }

    // ─── Expense Wrapper (detailed format from Feign) ───────────────

    public static List<Map<String, Object>> buildExpenseWrapperList() {
        List<Map<String, Object>> expenses = new ArrayList<>();

        // Expense 1
        Map<String, Object> wrapper1 = new HashMap<>();
        Map<String, Object> expense1 = new HashMap<>();
        expense1.put("id", 1);
        expense1.put("expenseName", "Lunch");
        expense1.put("amount", 500.0);
        expense1.put("date", LocalDate.now().minusDays(2).toString());
        expense1.put("merchant", "McDonalds");
        expense1.put("comments", "Quick lunch");
        expense1.put("type", "outflow");
        wrapper1.put("expense", expense1);
        Map<String, Object> pm1 = new HashMap<>();
        pm1.put("name", "UPI");
        wrapper1.put("paymentMethod", pm1);
        wrapper1.put("budgetIds", List.of(1, 2));
        expenses.add(wrapper1);

        // Expense 2
        Map<String, Object> wrapper2 = new HashMap<>();
        Map<String, Object> expense2 = new HashMap<>();
        expense2.put("id", 2);
        expense2.put("expenseName", "Dinner");
        expense2.put("amount", 1200.0);
        expense2.put("date", LocalDate.now().minusDays(5).toString());
        expense2.put("merchant", "Zomato");
        expense2.put("comments", "Family dinner");
        expense2.put("type", "outflow");
        wrapper2.put("expense", expense2);
        Map<String, Object> pm2 = new HashMap<>();
        pm2.put("name", "Card");
        wrapper2.put("paymentMethod", pm2);
        wrapper2.put("budgetIds", List.of(1));
        expenses.add(wrapper2);

        // Expense 3 - current month
        Map<String, Object> wrapper3 = new HashMap<>();
        Map<String, Object> expense3 = new HashMap<>();
        expense3.put("id", 3);
        expense3.put("expenseName", "Groceries");
        expense3.put("amount", 800.0);
        expense3.put("date", LocalDate.now().minusDays(1).toString());
        expense3.put("merchant", "BigBasket");
        expense3.put("comments", "Weekly groceries");
        expense3.put("type", "outflow");
        wrapper3.put("expense", expense3);
        Map<String, Object> pm3 = new HashMap<>();
        pm3.put("name", "UPI");
        wrapper3.put("paymentMethod", pm3);
        wrapper3.put("budgetIds", Collections.emptyList());
        expenses.add(wrapper3);

        return expenses;
    }

    // ─── Payment Method Data ────────────────────────────────────────

    public static Map<String, Object> buildPaymentMethodById() {
        Map<String, Object> pm = new HashMap<>();
        pm.put("id", TEST_PAYMENT_METHOD_ID);
        pm.put("name", "UPI");
        pm.put("type", "digital");
        return pm;
    }

    // ─── Bill Data ──────────────────────────────────────────────────

    public static Map<String, Object> buildBillById() {
        Map<String, Object> bill = new HashMap<>();
        bill.put("id", TEST_BILL_ID);
        bill.put("name", "Electricity Bill");
        bill.put("description", "Monthly electricity");
        bill.put("type", "utility");
        return bill;
    }

    // ─── AnalyticsRequestDTO Builders ───────────────────────────────

    public static AnalyticsRequestDTO buildCategoryAnalyticsRequest() {
        return AnalyticsRequestDTO.builder()
                .entityType(AnalyticsEntityType.CATEGORY)
                .entityId(TEST_CATEGORY_ID)
                .startDate(LocalDate.now().minusMonths(6))
                .endDate(LocalDate.now())
                .trendType("MONTHLY")
                .targetId(TEST_TARGET_ID)
                .build();
    }

    public static AnalyticsRequestDTO buildPaymentMethodAnalyticsRequest() {
        return AnalyticsRequestDTO.builder()
                .entityType(AnalyticsEntityType.PAYMENT_METHOD)
                .entityId(TEST_PAYMENT_METHOD_ID)
                .startDate(LocalDate.now().minusMonths(6))
                .endDate(LocalDate.now())
                .trendType("MONTHLY")
                .targetId(TEST_TARGET_ID)
                .build();
    }

    public static AnalyticsRequestDTO buildBillAnalyticsRequest() {
        return AnalyticsRequestDTO.builder()
                .entityType(AnalyticsEntityType.BILL)
                .entityId(TEST_BILL_ID)
                .startDate(LocalDate.now().minusMonths(6))
                .endDate(LocalDate.now())
                .trendType("MONTHLY")
                .targetId(TEST_TARGET_ID)
                .build();
    }

    // ─── Categorized Expense Data (for VisualReportService) ─────────

    public static Map<String, Object> buildCategorizedExpenseData() {
        Map<String, Object> data = new HashMap<>();

        Map<String, Object> foodCategory = new HashMap<>();
        List<Map<String, Object>> foodExpenses = new ArrayList<>();

        Map<String, Object> e1 = new HashMap<>();
        Map<String, Object> e1Inner = new HashMap<>();
        e1Inner.put("id", 1);
        e1Inner.put("expenseName", "Lunch");
        e1Inner.put("amount", 500.0);
        e1Inner.put("date", LocalDate.now().minusDays(2).toString());
        e1Inner.put("merchant", "McDonalds");
        e1Inner.put("type", "outflow");
        e1Inner.put("creditDue", 0.0);
        e1.put("expense", e1Inner);
        e1.put("paymentMethod", Map.of("name", "UPI"));
        e1.put("budgetIds", List.of(1));
        foodExpenses.add(e1);

        foodCategory.put("expenses", foodExpenses);
        foodCategory.put("id", 10);
        foodCategory.put("name", "Food");
        foodCategory.put("icon", "🍔");
        foodCategory.put("color", "#FF5733");

        data.put("Food", foodCategory);

        Map<String, Object> summaryData = new HashMap<>();
        summaryData.put("totalExpenses", 500.0);
        data.put("summary", summaryData);

        return data;
    }

    // ─── VisualReportRequest Builder ────────────────────────────────

    public static VisualReportRequest buildDefaultVisualReportRequest() {
        return VisualReportRequest.builder()
                .startDate(LocalDate.now().minusMonths(3))
                .endDate(LocalDate.now())
                .reportType(VisualReportRequest.ReportType.COMPREHENSIVE)
                .includeCharts(true)
                .includeFormulas(true)
                .includeConditionalFormatting(true)
                .targetId(TEST_TARGET_ID)
                .build();
    }
}
