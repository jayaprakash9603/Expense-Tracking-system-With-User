package com.jaya.service;

import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.dto.report.ReportData;
import com.jaya.dto.report.ReportData.*;
import com.jaya.dto.report.VisualReportRequest;
import com.jaya.service.excel.VisualReportGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Service for generating comprehensive visual Excel reports.
 * Aggregates data from multiple sources (expenses, budgets, categories) and
 * delegates to VisualReportGenerator for Excel creation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VisualReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ExpenseService expenseService;
    private final BudgetService budgetService;
    private final BudgetAnalyticsClient budgetAnalyticsClient;
    private final VisualReportGenerator reportGenerator;

    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(4);

    /**
     * Generate a visual Excel report based on the request parameters
     */
    public ByteArrayInputStream generateVisualReport(String jwt, VisualReportRequest request) throws IOException {
        log.info("Generating visual report: type={}, dateRange={} to {}",
                request.getReportType(), request.getStartDate(), request.getEndDate());

        // Set default dates if not provided
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : endDate.minusMonths(3);

        // Collect all data in parallel
        ReportData reportData = collectReportData(jwt, startDate, endDate, request.getTargetId());

        // Generate the Excel report
        return reportGenerator.generateReport(
                reportData,
                request.isIncludeCharts(),
                request.isIncludeFormulas(),
                request.isIncludeConditionalFormatting());
    }

    /**
     * Generate a quick expense report for a date range
     */
    public ByteArrayInputStream generateExpenseReport(String jwt, LocalDate startDate, LocalDate endDate,
            Integer targetId) throws IOException {
        VisualReportRequest request = VisualReportRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .targetId(targetId)
                .reportType(VisualReportRequest.ReportType.EXPENSE)
                .includeCharts(true)
                .includeFormulas(true)
                .includeConditionalFormatting(true)
                .build();

        return generateVisualReport(jwt, request);
    }

    /**
     * Generate a monthly summary report
     */
    public ByteArrayInputStream generateMonthlyReport(String jwt, int year, int month,
            Integer targetId) throws IOException {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return generateExpenseReport(jwt, startDate, endDate, targetId);
    }

    /**
     * Collect all data needed for the report from various services
     */
    private ReportData collectReportData(String jwt, LocalDate startDate, LocalDate endDate, Integer targetId) {
        log.debug("Collecting report data from {} to {}", startDate, endDate);

        try {
            // Fetch data in parallel
            CompletableFuture<Map<String, Object>> expenseDataFuture = CompletableFuture.supplyAsync(
                    () -> fetchExpenseData(jwt, startDate, endDate, targetId), asyncExecutor);

            CompletableFuture<Map<String, Object>> summaryFuture = CompletableFuture.supplyAsync(
                    () -> expenseService.getExpenseSummary(jwt, targetId), asyncExecutor);

            CompletableFuture<List<Map<String, Object>>> budgetsFuture = CompletableFuture.supplyAsync(
                    () -> fetchBudgets(jwt, targetId), asyncExecutor);

            // Wait for all to complete
            CompletableFuture.allOf(expenseDataFuture, summaryFuture, budgetsFuture).join();

            // Get results
            Map<String, Object> expenseData = expenseDataFuture.get();
            Map<String, Object> summaryData = summaryFuture.get();
            List<Map<String, Object>> budgetsData = budgetsFuture.get();

            // Build report data
            return ReportData.builder()
                    .reportTitle("Expense Report")
                    .generatedDate(LocalDate.now())
                    .startDate(startDate)
                    .endDate(endDate)
                    .summary(buildSummary(summaryData, budgetsData))
                    .expenses(buildExpenseRows(expenseData))
                    .categoryBreakdown(buildCategoryBreakdown(expenseData))
                    .monthlyTrends(buildMonthlyTrends(expenseData, startDate, endDate))
                    .dailySpending(buildDailySpending(expenseData))
                    .budgets(buildBudgetData(budgetsData))
                    .paymentMethods(buildPaymentMethodData(expenseData))
                    .weekdaySpending(buildWeekdaySpending(expenseData))
                    .yearlyComparison(buildYearlyComparison(expenseData))
                    .topExpenses(buildTopExpenses(expenseData))
                    .expenseVelocity(buildExpenseVelocity(expenseData))
                    .insights(generateInsights(summaryData, budgetsData))
                    .build();

        } catch (Exception e) {
            log.error("Error collecting report data", e);
            throw new RuntimeException("Failed to collect report data: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> fetchExpenseData(String jwt, LocalDate startDate, LocalDate endDate, Integer targetId) {
        try {
            String start = startDate.format(DATE_FORMATTER);
            String end = endDate.format(DATE_FORMATTER);
            return expenseService.getAllExpensesByCategoriesDetailed(jwt, start, end, "outflow", targetId);
        } catch (Exception e) {
            log.warn("Failed to fetch expense data: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private List<Map<String, Object>> fetchBudgets(String jwt, Integer targetId) {
        try {
            return budgetAnalyticsClient.getAllBudgetReportsForUser(jwt, targetId);
        } catch (Exception e) {
            log.warn("Failed to fetch budgets: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private SummaryData buildSummary(Map<String, Object> summaryData, List<Map<String, Object>> budgets) {
        double totalBudgetAllocated = 0;
        double totalBudgetUsed = 0;

        for (Map<String, Object> budget : budgets) {
            totalBudgetAllocated += extractDouble(budget, "allocatedAmount");
            double remaining = extractDouble(budget, "remainingAmount");
            double allocated = extractDouble(budget, "allocatedAmount");
            totalBudgetUsed += (allocated - remaining);
        }

        double totalExpenses = extractDouble(summaryData, "currentMonthLosses");
        double utilizationPercent = totalBudgetAllocated > 0 ? (totalBudgetUsed / totalBudgetAllocated) * 100 : 0;

        return SummaryData.builder()
                .totalExpenses(totalExpenses)
                .totalIncome(extractDouble(summaryData, "totalIncome"))
                .netBalance(extractDouble(summaryData, "netBalance"))
                .averageExpense(extractDouble(summaryData, "avgDailySpendLast30Days"))
                .transactionCount(extractInt(summaryData, "transactionCount"))
                .maxExpense(extractDouble(summaryData, "maxExpense"))
                .minExpense(extractDouble(summaryData, "minExpense"))
                .totalCreditDue(extractDouble(summaryData, "totalCreditDue"))
                .totalBudgetAllocated(totalBudgetAllocated)
                .totalBudgetUsed(totalBudgetUsed)
                .budgetUtilizationPercent(utilizationPercent)
                .topCategory(extractString(summaryData, "topCategory"))
                .topCategoryAmount(extractDouble(summaryData, "topCategoryAmount"))
                .topPaymentMethod(extractString(summaryData, "topPaymentMethod"))
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<ExpenseRow> buildExpenseRows(Map<String, Object> expenseData) {
        List<ExpenseRow> rows = new ArrayList<>();

        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey()))
                continue;

            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                List<Map<String, Object>> expenses = (List<Map<String, Object>>) categoryData.get("expenses");

                if (expenses != null) {
                    for (Map<String, Object> expense : expenses) {
                        rows.add(buildExpenseRow(expense, entry.getKey()));
                    }
                }
            }
        }

        // Sort by date descending
        rows.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return rows;
    }

    @SuppressWarnings("unchecked")
    private ExpenseRow buildExpenseRow(Map<String, Object> expense, String category) {
        String dateStr = extractString(expense, "date");
        LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

        // API returns 'expense' field containing ExpenseDetailsDTO, not
        // 'expenseDetails'
        Map<String, Object> details = (Map<String, Object>) expense.get("expense");
        if (details == null)
            details = expense;

        // Use Math.abs() to ensure positive amounts (expenses are losses, shown as
        // positive values)
        double amount = Math.abs(extractDouble(details, "amount"));
        double creditAmount = Math.abs(extractDouble(details, "creditDue"));

        return ExpenseRow.builder()
                .id(extractInt(expense, "id"))
                .date(date)
                .name(extractString(details, "expenseName"))
                .amount(amount)
                .category(category)
                .paymentMethod(extractString(details, "paymentMethod"))
                .type(extractString(details, "type"))
                .notes(extractString(details, "comments")) // Field is 'comments' not 'note'
                .creditAmount(creditAmount)
                .isBillPayment(extractBoolean(expense, "isBill")) // Field is 'isBill' not 'bill'
                .budgetIds((List<Integer>) expense.get("budgetIds"))
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<CategoryData> buildCategoryBreakdown(Map<String, Object> expenseData) {
        List<CategoryData> categories = new ArrayList<>();
        double totalAmount = 0;

        // First pass: calculate totals
        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey()))
                continue;

            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                // Use Math.abs to ensure positive amounts
                totalAmount += Math.abs(extractDouble(categoryData, "totalAmount"));
            }
        }

        // Second pass: build category data
        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey()))
                continue;

            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                // Use Math.abs to ensure positive amounts
                double catAmount = Math.abs(extractDouble(categoryData, "totalAmount"));
                int count = extractInt(categoryData, "expenseCount"); // Field is 'expenseCount' not 'count'

                categories.add(CategoryData.builder()
                        .categoryId(extractInt(categoryData, "id"))
                        .categoryName(entry.getKey())
                        .icon(extractString(categoryData, "icon"))
                        .color(extractString(categoryData, "color"))
                        .totalAmount(catAmount)
                        .transactionCount(count)
                        .percentage(totalAmount > 0 ? (catAmount / totalAmount) * 100 : 0)
                        .averageAmount(count > 0 ? catAmount / count : 0)
                        .build());
            }
        }

        // Sort by amount descending
        categories.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        return categories;
    }

    private List<MonthlyTrendData> buildMonthlyTrends(Map<String, Object> expenseData,
            LocalDate startDate, LocalDate endDate) {
        // Group expenses by month
        Map<String, MonthlyTrendData> monthlyMap = new LinkedHashMap<>();
        List<ExpenseRow> expenses = buildExpenseRows(expenseData);

        for (ExpenseRow expense : expenses) {
            LocalDate date = expense.getDate();
            if (date.isBefore(startDate) || date.isAfter(endDate))
                continue;

            String monthKey = date.getYear() + "-" + String.format("%02d", date.getMonthValue());
            String monthName = date.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + date.getYear();

            MonthlyTrendData trend = monthlyMap.computeIfAbsent(monthKey, k -> MonthlyTrendData.builder()
                    .month(monthName)
                    .year(date.getYear())
                    .monthNumber(date.getMonthValue())
                    .totalAmount(0)
                    .transactionCount(0)
                    .build());

            trend.setTotalAmount(trend.getTotalAmount() + expense.getAmount());
            trend.setTransactionCount(trend.getTransactionCount() + 1);
        }

        // Calculate changes
        List<MonthlyTrendData> trends = new ArrayList<>(monthlyMap.values());
        for (int i = 1; i < trends.size(); i++) {
            MonthlyTrendData current = trends.get(i);
            MonthlyTrendData previous = trends.get(i - 1);

            double change = current.getTotalAmount() - previous.getTotalAmount();
            double changePercent = previous.getTotalAmount() > 0 ? (change / previous.getTotalAmount()) * 100 : 0;

            current.setChangeFromPreviousMonth(change);
            current.setChangePercent(changePercent);
        }

        return trends;
    }

    private List<DailySpendingData> buildDailySpending(Map<String, Object> expenseData) {
        // Group expenses by day
        Map<LocalDate, DailySpendingData> dailyMap = new TreeMap<>();
        List<ExpenseRow> expenses = buildExpenseRows(expenseData);

        Map<LocalDate, Map<String, Double>> categoryAmounts = new HashMap<>();

        for (ExpenseRow expense : expenses) {
            LocalDate date = expense.getDate();

            DailySpendingData daily = dailyMap.computeIfAbsent(date, d -> DailySpendingData.builder()
                    .date(d)
                    .dayName(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .amount(0)
                    .transactionCount(0)
                    .build());

            daily.setAmount(daily.getAmount() + expense.getAmount());
            daily.setTransactionCount(daily.getTransactionCount() + 1);

            // Track top category per day
            categoryAmounts.computeIfAbsent(date, d -> new HashMap<>())
                    .merge(expense.getCategory(), expense.getAmount(), Double::sum);
        }

        // Set top category for each day
        for (DailySpendingData daily : dailyMap.values()) {
            Map<String, Double> dayCats = categoryAmounts.get(daily.getDate());
            if (dayCats != null && !dayCats.isEmpty()) {
                daily.setTopCategory(dayCats.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse(null));
            }
        }

        return new ArrayList<>(dailyMap.values());
    }

    @SuppressWarnings("unchecked")
    private List<BudgetData> buildBudgetData(List<Map<String, Object>> budgets) {
        return budgets.stream().map(budget -> {
            double allocated = extractDouble(budget, "allocatedAmount");
            double remaining = extractDouble(budget, "remainingAmount");
            double used = allocated - remaining;
            double utilization = allocated > 0 ? (used / allocated) * 100 : 0;
            double cashSpent = extractDouble(budget, "totalCashLosses");
            double creditSpent = extractDouble(budget, "totalCreditLosses");
            int expenseCount = extractInt(budget, "expenseCount");
            double dailyBudget = extractDouble(budget, "dailyBudget");
            double projectedOverspend = extractDouble(budget, "projectedOverspend");
            boolean isValid = extractBoolean(budget, "isValid");

            String status = "ACTIVE";
            if (utilization >= 100)
                status = "EXCEEDED";
            else if (utilization >= 80)
                status = "WARNING";

            String startStr = extractString(budget, "startDate");
            String endStr = extractString(budget, "endDate");
            LocalDate startDate = startStr != null ? LocalDate.parse(startStr) : null;
            LocalDate endDate = endStr != null ? LocalDate.parse(endStr) : null;

            int daysRemaining = endDate != null
                    ? (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), endDate)
                    : 0;
            int totalDays = (startDate != null && endDate != null)
                    ? (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1
                    : 0;
            int daysElapsed = totalDays - daysRemaining;
            double dailySpendRate = daysElapsed > 0 ? used / daysElapsed : 0;

            if (daysRemaining < 0) {
                status = "EXPIRED";
                daysRemaining = 0;
            }

            return BudgetData.builder()
                    .budgetId(extractInt(budget, "budgetId"))
                    .budgetName(extractString(budget, "budgetName"))
                    .description(extractString(budget, "description"))
                    .allocatedAmount(allocated)
                    .usedAmount(used)
                    .remainingAmount(remaining)
                    .utilizationPercent(utilization)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status(status)
                    .expenseCount(expenseCount)
                    .daysRemaining(daysRemaining)
                    .totalDays(totalDays)
                    .dailyBudget(dailyBudget)
                    .dailySpendRate(dailySpendRate)
                    .projectedOverspend(projectedOverspend)
                    .cashSpent(cashSpent)
                    .creditSpent(creditSpent)
                    .isValid(isValid)
                    .build();
        }).collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private List<PaymentMethodData> buildPaymentMethodData(Map<String, Object> expenseData) {
        Map<String, PaymentMethodData> methodMap = new HashMap<>();
        double totalAmount = 0;

        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey()))
                continue;

            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                List<Map<String, Object>> expenses = (List<Map<String, Object>>) categoryData.get("expenses");

                if (expenses != null) {
                    for (Map<String, Object> expense : expenses) {
                        // API returns 'expense' field containing ExpenseDetailsDTO
                        Map<String, Object> details = (Map<String, Object>) expense.get("expense");
                        if (details == null)
                            details = expense;

                        String method = extractString(details, "paymentMethod");
                        if (method == null || method.isEmpty())
                            method = "Unknown";

                        // Use Math.abs() to ensure positive amounts
                        double amount = Math.abs(extractDouble(details, "amount"));
                        totalAmount += amount;

                        PaymentMethodData pmData = methodMap.computeIfAbsent(method, m -> PaymentMethodData.builder()
                                .methodName(m)
                                .displayName(formatPaymentMethodName(m))
                                .totalAmount(0)
                                .transactionCount(0)
                                .build());

                        pmData.setTotalAmount(pmData.getTotalAmount() + amount);
                        pmData.setTransactionCount(pmData.getTransactionCount() + 1);
                    }
                }
            }
        }

        // Calculate percentages
        final double total = totalAmount;
        methodMap.values().forEach(pm -> pm.setPercentage(total > 0 ? (pm.getTotalAmount() / total) * 100 : 0));

        // Sort by amount descending
        List<PaymentMethodData> result = new ArrayList<>(methodMap.values());
        result.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        return result;
    }

    private String formatPaymentMethodName(String method) {
        if (method == null)
            return "Unknown";
        // Convert SNAKE_CASE to Title Case
        return Arrays.stream(method.toLowerCase().split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    // ==================== NEW ANALYTICS BUILDERS ====================

    private List<WeekdaySpendingData> buildWeekdaySpending(Map<String, Object> expenseData) {
        Map<Integer, WeekdaySpendingData> weekdayMap = new LinkedHashMap<>();
        List<ExpenseRow> expenses = buildExpenseRows(expenseData);
        double totalAmount = 0;

        // Initialize all days
        String[] dayNames = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
        for (int i = 1; i <= 7; i++) {
            weekdayMap.put(i, WeekdaySpendingData.builder()
                    .dayName(dayNames[i - 1])
                    .dayOfWeek(i)
                    .totalAmount(0)
                    .transactionCount(0)
                    .build());
        }

        // Aggregate by weekday
        for (ExpenseRow expense : expenses) {
            int dayOfWeek = expense.getDate().getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
            WeekdaySpendingData data = weekdayMap.get(dayOfWeek);
            data.setTotalAmount(data.getTotalAmount() + expense.getAmount());
            data.setTransactionCount(data.getTransactionCount() + 1);
            totalAmount += expense.getAmount();
        }

        // Calculate averages and percentages
        final double total = totalAmount;
        List<WeekdaySpendingData> result = new ArrayList<>(weekdayMap.values());
        result.forEach(d -> {
            d.setAverageAmount(d.getTransactionCount() > 0 ? d.getTotalAmount() / d.getTransactionCount() : 0);
            d.setPercentage(total > 0 ? (d.getTotalAmount() / total) * 100 : 0);
        });

        return result;
    }

    @SuppressWarnings("unchecked")
    private List<YearlyComparisonData> buildYearlyComparison(Map<String, Object> expenseData) {
        Map<Integer, YearlyComparisonData> yearlyMap = new TreeMap<>();
        List<ExpenseRow> expenses = buildExpenseRows(expenseData);

        // Track category totals per year
        Map<Integer, Map<String, Double>> yearCategoryTotals = new HashMap<>();

        // Aggregate by year
        for (ExpenseRow expense : expenses) {
            int year = expense.getDate().getYear();

            YearlyComparisonData data = yearlyMap.computeIfAbsent(year, y -> YearlyComparisonData.builder()
                    .year(y)
                    .totalAmount(0)
                    .transactionCount(0)
                    .build());

            data.setTotalAmount(data.getTotalAmount() + expense.getAmount());
            data.setTransactionCount(data.getTransactionCount() + 1);

            // Track category for this year
            yearCategoryTotals.computeIfAbsent(year, y -> new HashMap<>())
                    .merge(expense.getCategory(), expense.getAmount(), Double::sum);
        }

        // Calculate year-over-year changes and find top categories
        List<YearlyComparisonData> result = new ArrayList<>(yearlyMap.values());
        for (int i = 0; i < result.size(); i++) {
            YearlyComparisonData current = result.get(i);
            current.setAverageMonthlySpend(current.getTotalAmount() / 12.0);

            // Find top category for this year
            Map<String, Double> catTotals = yearCategoryTotals.get(current.getYear());
            if (catTotals != null && !catTotals.isEmpty()) {
                Map.Entry<String, Double> topCat = catTotals.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .orElse(null);
                if (topCat != null) {
                    current.setTopCategory(topCat.getKey());
                    current.setTopCategoryAmount(topCat.getValue());
                }
            }

            if (i > 0) {
                YearlyComparisonData previous = result.get(i - 1);
                double change = current.getTotalAmount() - previous.getTotalAmount();
                double changePercent = previous.getTotalAmount() > 0 ? (change / previous.getTotalAmount()) * 100 : 0;
                current.setChangeFromPreviousYear(change);
                current.setChangePercent(changePercent);
            }
        }

        return result;
    }

    private List<TopExpenseData> buildTopExpenses(Map<String, Object> expenseData) {
        List<ExpenseRow> expenses = buildExpenseRows(expenseData);

        // Sort by amount descending and take top 10
        return expenses.stream()
                .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
                .limit(10)
                .map(expense -> TopExpenseData.builder()
                        .id(expense.getId())
                        .name(expense.getName())
                        .amount(expense.getAmount())
                        .date(expense.getDate())
                        .category(expense.getCategory())
                        .paymentMethod(expense.getPaymentMethod())
                        .build())
                .collect(Collectors.toList());
    }

    private ExpenseVelocityData buildExpenseVelocity(Map<String, Object> expenseData) {
        List<ExpenseRow> expenses = buildExpenseRows(expenseData);
        LocalDate today = LocalDate.now();

        double last7Days = 0, last30Days = 0, prev7Days = 0, prev30Days = 0;
        double totalAmount = 0;
        int totalDays = 0;

        if (!expenses.isEmpty()) {
            LocalDate earliest = expenses.stream()
                    .map(ExpenseRow::getDate)
                    .min(LocalDate::compareTo)
                    .orElse(today);
            totalDays = (int) java.time.temporal.ChronoUnit.DAYS.between(earliest, today) + 1;

            for (ExpenseRow expense : expenses) {
                LocalDate date = expense.getDate();
                long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(date, today);

                totalAmount += expense.getAmount();

                if (daysAgo <= 7)
                    last7Days += expense.getAmount();
                else if (daysAgo <= 14)
                    prev7Days += expense.getAmount();

                if (daysAgo <= 30)
                    last30Days += expense.getAmount();
                else if (daysAgo <= 60)
                    prev30Days += expense.getAmount();
            }
        }

        double dailyAvg = totalDays > 0 ? totalAmount / totalDays : 0;
        double weeklyAvg = dailyAvg * 7;
        double monthlyAvg = dailyAvg * 30;

        double last7Change = prev7Days > 0 ? ((last7Days - prev7Days) / prev7Days) * 100 : 0;
        double last30Change = prev30Days > 0 ? ((last30Days - prev30Days) / prev30Days) * 100 : 0;

        String trend = "STABLE";
        if (last30Change > 10)
            trend = "INCREASING";
        else if (last30Change < -10)
            trend = "DECREASING";

        // Project monthly spend based on daily average of last 30 days
        double projectedMonthly = last30Days > 0 ? (last30Days / 30.0) * 30 : monthlyAvg;

        return ExpenseVelocityData.builder()
                .dailyAverage(dailyAvg)
                .weeklyAverage(weeklyAvg)
                .monthlyAverage(monthlyAvg)
                .last7DaysTotal(last7Days)
                .last30DaysTotal(last30Days)
                .last7DaysChange(last7Change)
                .last30DaysChange(last30Change)
                .trend(trend)
                .projectedMonthlySpend(projectedMonthly)
                .build();
    }

    private List<InsightData> generateInsights(Map<String, Object> summaryData, List<Map<String, Object>> budgets) {
        List<InsightData> insights = new ArrayList<>();

        // === BUDGET INSIGHTS ===
        int exceededBudgets = 0;
        int warningBudgets = 0;
        int healthyBudgets = 0;
        double totalAllocated = 0;
        double totalUsed = 0;

        for (Map<String, Object> budget : budgets) {
            double allocated = extractDouble(budget, "allocatedAmount");
            double remaining = extractDouble(budget, "remainingAmount");
            double used = allocated - remaining;
            double utilization = allocated > 0 ? (used / allocated) * 100 : 0;
            String budgetName = extractString(budget, "budgetName");

            totalAllocated += allocated;
            totalUsed += Math.max(0, used);

            if (utilization >= 100) {
                exceededBudgets++;
                insights.add(InsightData.builder()
                        .type("WARNING")
                        .title("Budget Exceeded: " + budgetName)
                        .message("This budget has been exceeded by " +
                                String.format("%.1f%%", utilization - 100) + ". Consider reviewing expenses.")
                        .value(Math.abs(used - allocated))
                        .build());
            } else if (utilization >= 80) {
                warningBudgets++;
                insights.add(InsightData.builder()
                        .type("WARNING")
                        .title("Budget Alert: " + budgetName)
                        .message("You've used " + String.format("%.1f%%", utilization) +
                                " of this budget. Only ₹" + String.format("%.2f", remaining) + " remaining.")
                        .value(remaining)
                        .build());
            } else if (utilization < 50) {
                healthyBudgets++;
            }
        }

        // Overall budget health summary
        if (!budgets.isEmpty()) {
            double overallUtilization = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;
            insights.add(InsightData.builder()
                    .type("INFO")
                    .title("Overall Budget Utilization")
                    .message(String.format("You've used %.1f%% of your total allocated budgets (₹%.2f of ₹%.2f)",
                            overallUtilization, totalUsed, totalAllocated))
                    .value(overallUtilization)
                    .build());

            if (exceededBudgets > 0) {
                insights.add(InsightData.builder()
                        .type("WARNING")
                        .title("Budget Alert Summary")
                        .message(exceededBudgets + " budget(s) exceeded, " + warningBudgets
                                + " in warning zone. Immediate attention needed.")
                        .value((double) exceededBudgets)
                        .build());
            }
        }

        // === SPENDING INSIGHTS ===
        double avgDaily = extractDouble(summaryData, "avgDailySpendLast30Days");
        double totalExpenses = extractDouble(summaryData, "totalExpenses");
        int expenseCount = extractInt(summaryData, "numberOfExpenses");
        double avgTransactionSize = expenseCount > 0 ? totalExpenses / expenseCount : 0;

        if (avgDaily > 0) {
            double projectedMonthly = avgDaily * 30;
            insights.add(InsightData.builder()
                    .type("INFO")
                    .title("Daily Spending Pattern")
                    .message(String.format(
                            "Your average daily spending is ₹%.2f. At this rate, you'll spend ₹%.2f this month.",
                            avgDaily, projectedMonthly))
                    .value(avgDaily)
                    .build());
        }

        if (avgTransactionSize > 0) {
            insights.add(InsightData.builder()
                    .type("INFO")
                    .title("Average Transaction Size")
                    .message(String.format("Your average expense is ₹%.2f across %d transactions.",
                            avgTransactionSize, expenseCount))
                    .value(avgTransactionSize)
                    .build());
        }

        // === PAYMENT METHOD INSIGHTS ===
        double cashSpending = extractDouble(summaryData, "totalCashLosses");
        double creditSpending = extractDouble(summaryData, "totalCreditLosses");
        double creditDue = extractDouble(summaryData, "totalCreditDue");

        if (cashSpending > 0 || creditSpending > 0) {
            double total = cashSpending + creditSpending;
            double cashPercent = total > 0 ? (cashSpending / total) * 100 : 0;
            double creditPercent = total > 0 ? (creditSpending / total) * 100 : 0;

            String dominantMethod = cashPercent > creditPercent ? "Cash" : "Credit";
            double dominantPercent = Math.max(cashPercent, creditPercent);

            insights.add(InsightData.builder()
                    .type("INFO")
                    .title("Payment Method Analysis")
                    .message(String.format(
                            "%s is your preferred payment method (%.1f%% of expenses). Cash: ₹%.2f | Credit: ₹%.2f",
                            dominantMethod, dominantPercent, cashSpending, creditSpending))
                    .value(total)
                    .build());
        }

        if (creditDue > 0) {
            insights.add(InsightData.builder()
                    .type("WARNING")
                    .title("Outstanding Credit Alert")
                    .message(String.format(
                            "You have ₹%.2f in outstanding credit payments. Consider clearing dues to avoid interest charges.",
                            creditDue))
                    .value(creditDue)
                    .build());
        }

        // === SAVINGS RECOMMENDATIONS ===
        double totalIncome = extractDouble(summaryData, "totalIncome");
        if (totalIncome > 0 && totalExpenses > 0) {
            double savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
            if (savingsRate < 0) {
                insights.add(InsightData.builder()
                        .type("WARNING")
                        .title("Spending Exceeds Income")
                        .message(String.format(
                                "Your expenses exceed your recorded income by ₹%.2f. Review your spending habits.",
                                Math.abs(totalExpenses - totalIncome)))
                        .value(Math.abs(savingsRate))
                        .build());
            } else if (savingsRate < 20) {
                insights.add(InsightData.builder()
                        .type("SUGGESTION")
                        .title("Savings Opportunity")
                        .message(String.format(
                                "Your savings rate is %.1f%%. Financial experts recommend saving at least 20%% of income.",
                                savingsRate))
                        .value(savingsRate)
                        .build());
            } else {
                insights.add(InsightData.builder()
                        .type("SUCCESS")
                        .title("Excellent Savings Rate")
                        .message(String.format("Great job! Your savings rate of %.1f%% is above the recommended 20%%.",
                                savingsRate))
                        .value(savingsRate)
                        .build());
            }
        }

        // === POSITIVE REINFORCEMENT ===
        if (healthyBudgets > 0 && exceededBudgets == 0 && warningBudgets == 0) {
            insights.add(InsightData.builder()
                    .type("SUCCESS")
                    .title("All Budgets Healthy")
                    .message("Excellent! All your budgets are under control. Keep maintaining this discipline.")
                    .build());
        }

        // Add general success if no warnings
        long warningCount = insights.stream().filter(i -> "WARNING".equals(i.getType())).count();
        if (warningCount == 0) {
            insights.add(InsightData.builder()
                    .type("SUCCESS")
                    .title("Good Financial Health")
                    .message("You're managing your finances well! No critical issues detected.")
                    .build());
        }

        return insights;
    }

    // ==================== UTILITY METHODS ====================

    private double extractDouble(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key))
            return 0.0;
        Object value = map.get(key);
        if (value instanceof Number)
            return ((Number) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private int extractInt(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key))
            return 0;
        Object value = map.get(key);
        if (value instanceof Number)
            return ((Number) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }

    private String extractString(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key))
            return null;
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private boolean extractBoolean(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key))
            return false;
        Object value = map.get(key);
        if (value instanceof Boolean)
            return (Boolean) value;
        if (value instanceof String)
            return Boolean.parseBoolean((String) value);
        return false;
    }
}
