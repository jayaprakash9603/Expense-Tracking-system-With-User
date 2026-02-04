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
                request.isIncludeConditionalFormatting()
        );
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
        double utilizationPercent = totalBudgetAllocated > 0 ? 
                (totalBudgetUsed / totalBudgetAllocated) * 100 : 0;
        
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
            if ("summary".equals(entry.getKey())) continue;
            
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
        
        Map<String, Object> details = (Map<String, Object>) expense.get("expenseDetails");
        if (details == null) details = expense;
        
        return ExpenseRow.builder()
                .id(extractInt(expense, "id"))
                .date(date)
                .name(extractString(details, "expenseName"))
                .amount(extractDouble(details, "amount"))
                .category(category)
                .paymentMethod(extractString(details, "paymentMethod"))
                .type(extractString(details, "type"))
                .notes(extractString(details, "note"))
                .creditAmount(extractDouble(details, "creditAmount"))
                .isBillPayment(extractBoolean(expense, "bill"))
                .budgetIds((List<Integer>) expense.get("budgetIds"))
                .build();
    }
    
    @SuppressWarnings("unchecked")
    private List<CategoryData> buildCategoryBreakdown(Map<String, Object> expenseData) {
        List<CategoryData> categories = new ArrayList<>();
        double totalAmount = 0;
        
        // First pass: calculate totals
        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey())) continue;
            
            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                totalAmount += extractDouble(categoryData, "totalAmount");
            }
        }
        
        // Second pass: build category data
        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey())) continue;
            
            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                double catAmount = extractDouble(categoryData, "totalAmount");
                int count = extractInt(categoryData, "count");
                
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
            if (date.isBefore(startDate) || date.isAfter(endDate)) continue;
            
            String monthKey = date.getYear() + "-" + String.format("%02d", date.getMonthValue());
            String monthName = date.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + date.getYear();
            
            MonthlyTrendData trend = monthlyMap.computeIfAbsent(monthKey, k -> 
                    MonthlyTrendData.builder()
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
            double changePercent = previous.getTotalAmount() > 0 ? 
                    (change / previous.getTotalAmount()) * 100 : 0;
            
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
            
            DailySpendingData daily = dailyMap.computeIfAbsent(date, d -> 
                    DailySpendingData.builder()
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
            
            String status = "ACTIVE";
            if (utilization >= 100) status = "EXCEEDED";
            else if (utilization >= 80) status = "WARNING";
            
            String startStr = extractString(budget, "startDate");
            String endStr = extractString(budget, "endDate");
            LocalDate startDate = startStr != null ? LocalDate.parse(startStr) : null;
            LocalDate endDate = endStr != null ? LocalDate.parse(endStr) : null;
            
            int daysRemaining = endDate != null ? 
                    (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), endDate) : 0;
            if (daysRemaining < 0) {
                status = "EXPIRED";
                daysRemaining = 0;
            }
            
            return BudgetData.builder()
                    .budgetId(extractInt(budget, "budgetId"))
                    .budgetName(extractString(budget, "budgetName"))
                    .allocatedAmount(allocated)
                    .usedAmount(used)
                    .remainingAmount(remaining)
                    .utilizationPercent(utilization)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status(status)
                    .daysRemaining(daysRemaining)
                    .build();
        }).collect(Collectors.toList());
    }
    
    @SuppressWarnings("unchecked")
    private List<PaymentMethodData> buildPaymentMethodData(Map<String, Object> expenseData) {
        Map<String, PaymentMethodData> methodMap = new HashMap<>();
        double totalAmount = 0;
        
        for (Map.Entry<String, Object> entry : expenseData.entrySet()) {
            if ("summary".equals(entry.getKey())) continue;
            
            if (entry.getValue() instanceof Map) {
                Map<String, Object> categoryData = (Map<String, Object>) entry.getValue();
                List<Map<String, Object>> expenses = (List<Map<String, Object>>) categoryData.get("expenses");
                
                if (expenses != null) {
                    for (Map<String, Object> expense : expenses) {
                        Map<String, Object> details = (Map<String, Object>) expense.get("expenseDetails");
                        if (details == null) details = expense;
                        
                        String method = extractString(details, "paymentMethod");
                        if (method == null || method.isEmpty()) method = "Unknown";
                        
                        double amount = extractDouble(details, "amount");
                        totalAmount += amount;
                        
                        PaymentMethodData pmData = methodMap.computeIfAbsent(method, m ->
                                PaymentMethodData.builder()
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
        methodMap.values().forEach(pm -> 
                pm.setPercentage(total > 0 ? (pm.getTotalAmount() / total) * 100 : 0));
        
        // Sort by amount descending
        List<PaymentMethodData> result = new ArrayList<>(methodMap.values());
        result.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        return result;
    }
    
    private String formatPaymentMethodName(String method) {
        if (method == null) return "Unknown";
        // Convert SNAKE_CASE to Title Case
        return Arrays.stream(method.toLowerCase().split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .collect(Collectors.joining(" "));
    }
    
    private List<InsightData> generateInsights(Map<String, Object> summaryData, List<Map<String, Object>> budgets) {
        List<InsightData> insights = new ArrayList<>();
        
        // Budget insights
        for (Map<String, Object> budget : budgets) {
            double allocated = extractDouble(budget, "allocatedAmount");
            double remaining = extractDouble(budget, "remainingAmount");
            double used = allocated - remaining;
            double utilization = allocated > 0 ? (used / allocated) * 100 : 0;
            String budgetName = extractString(budget, "budgetName");
            
            if (utilization >= 100) {
                insights.add(InsightData.builder()
                        .type("WARNING")
                        .title("Budget Exceeded")
                        .message("Your '" + budgetName + "' budget has been exceeded by " + 
                                String.format("%.1f%%", utilization - 100))
                        .value(used - allocated)
                        .build());
            } else if (utilization >= 80) {
                insights.add(InsightData.builder()
                        .type("WARNING")
                        .title("Budget Alert")
                        .message("You've used " + String.format("%.1f%%", utilization) + 
                                " of your '" + budgetName + "' budget")
                        .value(remaining)
                        .build());
            }
        }
        
        // Spending insights
        double avgDaily = extractDouble(summaryData, "avgDailySpendLast30Days");
        if (avgDaily > 0) {
            insights.add(InsightData.builder()
                    .type("INFO")
                    .title("Daily Spending Average")
                    .message("Your average daily spending is $" + String.format("%.2f", avgDaily))
                    .value(avgDaily)
                    .build());
        }
        
        // Credit insights
        double creditDue = extractDouble(summaryData, "totalCreditDue");
        if (creditDue > 0) {
            insights.add(InsightData.builder()
                    .type("WARNING")
                    .title("Outstanding Credit")
                    .message("You have $" + String.format("%.2f", creditDue) + " in outstanding credit payments")
                    .value(creditDue)
                    .build());
        }
        
        // Add success insight if doing well
        if (insights.stream().noneMatch(i -> "WARNING".equals(i.getType()))) {
            insights.add(InsightData.builder()
                    .type("SUCCESS")
                    .title("Good Financial Health")
                    .message("You're managing your finances well! Keep up the good work.")
                    .build());
        }
        
        return insights;
    }
    
    // ==================== UTILITY METHODS ====================
    
    private double extractDouble(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return 0.0;
        Object value = map.get(key);
        if (value instanceof Number) return ((Number) value).doubleValue();
        if (value instanceof String) {
            try { return Double.parseDouble((String) value); } 
            catch (NumberFormatException e) { return 0.0; }
        }
        return 0.0;
    }
    
    private int extractInt(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return 0;
        Object value = map.get(key);
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try { return Integer.parseInt((String) value); } 
            catch (NumberFormatException e) { return 0; }
        }
        return 0;
    }
    
    private String extractString(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return null;
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    private boolean extractBoolean(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return false;
        Object value = map.get(key);
        if (value instanceof Boolean) return (Boolean) value;
        if (value instanceof String) return Boolean.parseBoolean((String) value);
        return false;
    }
}
