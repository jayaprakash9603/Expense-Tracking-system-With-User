package com.jaya.service;

import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.dto.CategoryAnalyticsDTO.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(CategoryAnalyticsService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String DEFAULT_FLOW_TYPE = "outflow";

    private final CategoryAnalyticsClient categoryAnalyticsClient;
    private final BudgetAnalyticsClient budgetAnalyticsClient;
    private final PaymentMethodAnalyticsClient paymentMethodAnalyticsClient;
    private final BillAnalyticsClient billAnalyticsClient;
    private final ExpenseClient expenseService;
    private final BudgetClient budgetService;

    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(4);

    private static final double BUDGET_WARNING_THRESHOLD = 80.0;
    private static final double SPENDING_INCREASE_THRESHOLD = 10.0;
    private static final double CONSISTENCY_GOOD_THRESHOLD = 6;

    public CategoryAnalyticsDTO getCategoryAnalytics(
            String jwt,
            Integer categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String trendType,
            Integer targetId) {

        log.info("Building category analytics for categoryId={}, dateRange={} to {}, trendType={}",
                categoryId, startDate, endDate, trendType);

        try {
            CompletableFuture<Map<String, Object>> categoryDataFuture = CompletableFuture.supplyAsync(
                    () -> fetchAllCategoryDataDetailed(jwt, startDate, endDate, targetId),
                    asyncExecutor);

            CompletableFuture<List<Map<String, Object>>> budgetsFuture = CompletableFuture.supplyAsync(
                    () -> fetchAllBudgets(jwt, targetId),
                    asyncExecutor);

            CompletableFuture.allOf(categoryDataFuture, budgetsFuture).join();

            Map<String, Object> allCategoryData = categoryDataFuture.get();
            List<Map<String, Object>> allBudgets = budgetsFuture.get();

            Map<String, Object> categoryData = extractCategoryData(allCategoryData, categoryId);

            CategoryMetadata metadata;
            if (categoryData.isEmpty()) {
                log.info("Category {} has no expenses in date range, fetching metadata from Category Service",
                        categoryId);
                metadata = fetchCategoryMetadata(jwt, categoryId, targetId);
            } else {
                metadata = buildCategoryMetadataFromData(categoryData, categoryId);
            }

            List<Map<String, Object>> expenses = extractExpensesFromCategoryData(categoryData);

            log.info("Found {} expenses for categoryId={}", expenses.size(), categoryId);

            Map<String, Object> summaryData = extractSummary(allCategoryData);

            return buildAnalyticsFromExpenses(
                    expenses,
                    summaryData,
                    categoryData,
                    allBudgets,
                    startDate,
                    endDate,
                    trendType,
                    metadata);

        } catch (Exception e) {
            log.error("Error building category analytics for categoryId={}", categoryId, e);
            throw new RuntimeException("Failed to build category analytics: " + e.getMessage(), e);
        }
    }

    public CategoryAnalyticsDTO getPaymentMethodAnalytics(
            String jwt,
            Integer paymentMethodId,
            LocalDate startDate,
            LocalDate endDate,
            String trendType,
            Integer targetId) {

        log.info("Building payment method analytics for paymentMethodId={}, dateRange={} to {}, trendType={}",
                paymentMethodId, startDate, endDate, trendType);

        try {
            CompletableFuture<Map<String, Object>> paymentDataFuture = CompletableFuture.supplyAsync(
                    () -> fetchAllPaymentMethodDataDetailed(jwt, startDate, endDate, targetId),
                    asyncExecutor);

            CompletableFuture<List<Map<String, Object>>> budgetsFuture = CompletableFuture.supplyAsync(
                    () -> fetchAllBudgets(jwt, targetId),
                    asyncExecutor);

            CompletableFuture.allOf(paymentDataFuture, budgetsFuture).join();

            Map<String, Object> allPaymentData = paymentDataFuture.get();
            List<Map<String, Object>> allBudgets = budgetsFuture.get();

            Map<String, Object> paymentMethodData = extractCategoryData(allPaymentData, paymentMethodId);
            CategoryMetadata metadata = paymentMethodData.isEmpty()
                    ? fetchPaymentMethodMetadata(jwt, paymentMethodId, targetId)
                    : buildPaymentMethodMetadataFromData(paymentMethodData, paymentMethodId);

            if (paymentMethodData.isEmpty()) {
                paymentMethodData = buildEntityDataFromMetadata(paymentMethodId, metadata);
            }

            List<Map<String, Object>> expenses = extractExpensesFromCategoryData(paymentMethodData);

            Map<String, Object> summaryData = extractSummary(allPaymentData);

            return buildAnalyticsFromExpenses(
                    expenses,
                    summaryData,
                    paymentMethodData,
                    allBudgets,
                    startDate,
                    endDate,
                    trendType,
                    metadata);

        } catch (Exception e) {
            log.error("Error building payment method analytics for paymentMethodId={}", paymentMethodId, e);
            throw new RuntimeException("Failed to build payment method analytics: " + e.getMessage(), e);
        }
    }

    public CategoryAnalyticsDTO getBillAnalytics(
            String jwt,
            Integer billId,
            LocalDate startDate,
            LocalDate endDate,
            String trendType,
            Integer targetId) {

        log.info("Building bill analytics for billId={}, dateRange={} to {}, trendType={}",
                billId, startDate, endDate, trendType);

        try {
            CompletableFuture<Map<String, Object>> billFuture = CompletableFuture.supplyAsync(
                    () -> billAnalyticsClient.getBillById(jwt, billId, targetId),
                    asyncExecutor);

            CompletableFuture<List<Map<String, Object>>> budgetsFuture = CompletableFuture.supplyAsync(
                    () -> fetchAllBudgets(jwt, targetId),
                    asyncExecutor);

            CompletableFuture<Map<String, Object>> summaryFuture = CompletableFuture.supplyAsync(
                    () -> fetchAllCategoryDataDetailed(jwt, startDate, endDate, targetId),
                    asyncExecutor);

            CompletableFuture.allOf(billFuture, budgetsFuture, summaryFuture).join();

            Map<String, Object> billData = billFuture.get();
            List<Map<String, Object>> allBudgets = budgetsFuture.get();
            Map<String, Object> summaryData = extractSummary(summaryFuture.get());

            CategoryMetadata metadata = buildBillMetadataFromData(billData, billId);
            List<Map<String, Object>> expenses = buildBillExpenses(billData);
            Map<String, Object> billEntityData = buildBillEntityData(billData, billId, expenses);

            return buildAnalyticsFromExpenses(
                    expenses,
                    summaryData,
                    billEntityData,
                    allBudgets,
                    startDate,
                    endDate,
                    trendType,
                    metadata);

        } catch (Exception e) {
            log.error("Error building bill analytics for billId={}", billId, e);
            throw new RuntimeException("Failed to build bill analytics: " + e.getMessage(), e);
        }
    }

    private CategoryAnalyticsDTO buildAnalyticsFromExpenses(
            List<Map<String, Object>> expenses,
            Map<String, Object> summaryData,
            Map<String, Object> entityData,
            List<Map<String, Object>> allBudgets,
            LocalDate startDate,
            LocalDate endDate,
            String trendType,
            CategoryMetadata metadata) throws ExecutionException, InterruptedException {

        Set<Integer> entityBudgetIds = extractBudgetIdsFromExpenses(expenses);
        List<Map<String, Object>> entityBudgets = filterBudgetsForCategory(allBudgets, entityBudgetIds);

        CompletableFuture<SummaryStatistics> summaryFuture = CompletableFuture.supplyAsync(
                () -> calculateSummaryStatistics(expenses, startDate, endDate, summaryData, entityData),
                asyncExecutor);

        CompletableFuture<TrendAnalytics> trendFuture = CompletableFuture.supplyAsync(
                () -> calculateTrendAnalytics(expenses, startDate, endDate, trendType),
                asyncExecutor);

        CompletableFuture<List<PaymentMethodDistribution>> paymentFuture = CompletableFuture.supplyAsync(
                () -> calculatePaymentMethodDistribution(expenses),
                asyncExecutor);

        CompletableFuture<BudgetAnalytics> budgetAnalyticsFuture = CompletableFuture.supplyAsync(
                () -> calculateBudgetAnalyticsFromBudgets(entityBudgets, expenses),
                asyncExecutor);

        CompletableFuture<ExpenseHighlights> highlightsFuture = CompletableFuture.supplyAsync(
                () -> calculateExpenseHighlights(expenses),
                asyncExecutor);

        CompletableFuture<TransactionData> transactionFuture = CompletableFuture.supplyAsync(
                () -> buildTransactionData(expenses),
                asyncExecutor);

        CompletableFuture<List<BudgetCategoryReport>> budgetReportsFuture = CompletableFuture.supplyAsync(
                () -> buildBudgetReportsFromBudgets(entityBudgets),
                asyncExecutor);

        CompletableFuture.allOf(
                summaryFuture, trendFuture, paymentFuture, budgetAnalyticsFuture,
                highlightsFuture, transactionFuture, budgetReportsFuture).join();

        SummaryStatistics summaryStats = summaryFuture.get();
        TrendAnalytics trendAnalytics = trendFuture.get();
        List<PaymentMethodDistribution> paymentDistribution = paymentFuture.get();
        BudgetAnalytics budgetAnalytics = budgetAnalyticsFuture.get();
        ExpenseHighlights highlights = highlightsFuture.get();
        TransactionData transactionData = transactionFuture.get();
        List<BudgetCategoryReport> budgetReports = budgetReportsFuture.get();

        List<InsightItem> insights = generateInsights(summaryStats, trendAnalytics, budgetAnalytics,
                paymentDistribution);

        return CategoryAnalyticsDTO.builder()
                .categoryMetadata(metadata)
                .summaryStatistics(summaryStats)
                .trendAnalytics(trendAnalytics)
                .paymentMethodDistribution(paymentDistribution)
                .budgetAnalytics(budgetAnalytics)
                .expenseHighlights(highlights)
                .transactionData(transactionData)
                .budgetReports(budgetReports)
                .insights(insights)
                .build();
    }

    private Map<String, Object> fetchAllCategoryDataDetailed(String jwt, LocalDate startDate, LocalDate endDate,
            Integer targetId) {
        try {
            String start = startDate != null ? startDate.format(DATE_FORMATTER) : null;
            String end = endDate != null ? endDate.format(DATE_FORMATTER) : null;
            Map<String, Object> data = expenseService.getAllExpensesByCategoriesDetailed(jwt, start, end, "outflow",
                    targetId);
            return data != null ? data : Collections.emptyMap();
        } catch (Exception e) {
            log.warn("Failed to fetch category data: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private Map<String, Object> fetchAllPaymentMethodDataDetailed(String jwt, LocalDate startDate, LocalDate endDate,
            Integer targetId) {
        try {
            String start = startDate != null ? startDate.format(DATE_FORMATTER) : null;
            String end = endDate != null ? endDate.format(DATE_FORMATTER) : null;
            Map<String, Object> data = expenseService.getAllExpensesByPaymentMethodDetailed(jwt, start, end,
                    DEFAULT_FLOW_TYPE, targetId);
            return data != null ? data : Collections.emptyMap();
        } catch (Exception e) {
            log.warn("Failed to fetch payment method data: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private CategoryMetadata buildPaymentMethodMetadataFromData(Map<String, Object> paymentMethodData,
            Integer paymentMethodId) {
        if (paymentMethodData == null || paymentMethodData.isEmpty()) {
            return CategoryMetadata.builder()
                    .categoryId(paymentMethodId)
                    .categoryName("Unknown Payment Method")
                    .type("PAYMENT_METHOD")
                    .build();
        }
        return CategoryMetadata.builder()
                .categoryId(extractInt(paymentMethodData, "id"))
                .categoryName(extractString(paymentMethodData, "name"))
                .icon(extractString(paymentMethodData, "icon"))
                .color(extractString(paymentMethodData, "color"))
                .description(extractString(paymentMethodData, "description"))
                .type(extractString(paymentMethodData, "type"))
                .build();
    }

    private CategoryMetadata fetchPaymentMethodMetadata(String jwt, Integer paymentMethodId, Integer targetId) {
        try {
            Map<String, Object> paymentMethod = paymentMethodAnalyticsClient.getPaymentMethodById(jwt,
                    paymentMethodId, targetId);
            return buildPaymentMethodMetadataFromData(paymentMethod, paymentMethodId);
        } catch (Exception e) {
            log.warn("Failed to fetch payment method metadata for id={}: {}", paymentMethodId, e.getMessage());
            return CategoryMetadata.builder()
                    .categoryId(paymentMethodId)
                    .categoryName("Unknown Payment Method")
                    .type("PAYMENT_METHOD")
                    .build();
        }
    }

    private CategoryMetadata buildBillMetadataFromData(Map<String, Object> billData, Integer billId) {
        if (billData == null || billData.isEmpty()) {
            return CategoryMetadata.builder()
                    .categoryId(billId)
                    .categoryName("Unknown Bill")
                    .type("BILL")
                    .build();
        }
        return CategoryMetadata.builder()
                .categoryId(extractInt(billData, "id"))
                .categoryName(extractString(billData, "name"))
                .description(extractString(billData, "description"))
                .type(extractString(billData, "type"))
                .build();
    }

    private Map<String, Object> buildEntityDataFromMetadata(Integer entityId, CategoryMetadata metadata) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", entityId);
        data.put("name", metadata != null ? metadata.getCategoryName() : "Unknown");
        data.put("icon", metadata != null ? metadata.getIcon() : null);
        data.put("color", metadata != null ? metadata.getColor() : null);
        data.put("description", metadata != null ? metadata.getDescription() : null);
        data.put("type", metadata != null ? metadata.getType() : null);
        data.put("totalAmount", 0.0);
        data.put("expenseCount", 0);
        data.put("expenses", Collections.emptyList());
        return data;
    }

    private Map<String, Object> buildBillEntityData(Map<String, Object> billData, Integer billId,
            List<Map<String, Object>> expenses) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", billId);
        data.put("name", extractString(billData, "name"));
        data.put("description", extractString(billData, "description"));
        data.put("type", extractString(billData, "type"));
        data.put("totalAmount", extractDouble(billData, "amount"));
        data.put("expenseCount", expenses != null ? expenses.size() : 0);
        data.put("expenses", expenses != null ? expenses : Collections.emptyList());
        return data;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildBillExpenses(Map<String, Object> billData) {
        if (billData == null || billData.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Object> expense = new HashMap<>();
        Integer billId = extractInt(billData, "id");
        String name = extractString(billData, "name");
        String description = extractString(billData, "description");
        String paymentMethod = extractString(billData, "paymentMethod");
        String type = extractString(billData, "type");
        String date = extractString(billData, "date");
        Double amount = extractDouble(billData, "amount");

        expense.put("id", billId);
        expense.put("expenseName", name);
        expense.put("comments", description);
        expense.put("paymentMethod", paymentMethod);
        expense.put("type", type != null && !type.isBlank() ? type : "bill");
        expense.put("date", date);
        expense.put("amount", amount);

        Map<String, Object> wrapper = new HashMap<>();
        wrapper.put("expense", expense);
        wrapper.put("date", date);
        wrapper.put("amount", amount);
        wrapper.put("paymentMethod", paymentMethod);

        Object budgetIdsObj = billData.get("budgetIds");
        List<Integer> budgetIds = new ArrayList<>();
        if (budgetIdsObj instanceof Collection) {
            for (Object id : (Collection<?>) budgetIdsObj) {
                if (id instanceof Number) {
                    budgetIds.add(((Number) id).intValue());
                }
            }
        }
        wrapper.put("budgetIds", budgetIds);

        return Collections.singletonList(wrapper);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractCategoryData(Map<String, Object> allData, Integer categoryId) {
        log.debug("Searching for categoryId={} in response with {} entries", categoryId, allData.size());

        for (Map.Entry<String, Object> entry : allData.entrySet()) {
            if ("summary".equals(entry.getKey()))
                continue;

            if (entry.getValue() instanceof Map) {
                Map<String, Object> catData = (Map<String, Object>) entry.getValue();
                Integer catId = extractInt(catData, "id");
                log.debug("Checking category entry '{}' with id={}", entry.getKey(), catId);
                if (categoryId.equals(catId)) {
                    log.debug("Found matching category data for id={}", categoryId);
                    return catData;
                }
            }
        }
        log.info("Category with id={} not found in expense response - category may have no expenses in the date range",
                categoryId);
        return Collections.emptyMap();
    }

    private CategoryMetadata buildCategoryMetadataFromData(Map<String, Object> categoryData, Integer categoryId) {
        if (categoryData.isEmpty()) {
            return CategoryMetadata.builder()
                    .categoryId(categoryId)
                    .categoryName("Unknown Category")
                    .build();
        }
        return CategoryMetadata.builder()
                .categoryId(extractInt(categoryData, "id"))
                .categoryName(extractString(categoryData, "name"))
                .icon(extractString(categoryData, "icon"))
                .color(extractString(categoryData, "color"))
                .description(extractString(categoryData, "description"))
                .type(extractString(categoryData, "type"))
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractExpensesFromCategoryData(Map<String, Object> categoryData) {
        if (categoryData == null || categoryData.isEmpty()) {
            return Collections.emptyList();
        }
        Object expensesObj = categoryData.get("expenses");
        if (expensesObj instanceof List) {
            return (List<Map<String, Object>>) expensesObj;
        }
        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractSummary(Map<String, Object> allData) {
        Object summaryObj = allData.get("summary");
        if (summaryObj instanceof Map) {
            return (Map<String, Object>) summaryObj;
        }
        return Collections.emptyMap();
    }

    private List<Map<String, Object>> fetchAllBudgets(String jwt, Integer targetId) {
        try {
            log.info("Fetching budgets from Budget Service for targetId={}", targetId);
            List<Map<String, Object>> budgets = budgetService.getAllBudgets(jwt, targetId);
            log.info("Successfully fetched {} budgets", budgets != null ? budgets.size() : 0);
            return budgets != null ? budgets : Collections.emptyList();
        } catch (Exception e) {
            log.warn("Failed to fetch budgets from Budget Service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private Set<Integer> extractBudgetIdsFromExpenses(List<Map<String, Object>> expenses) {
        Set<Integer> budgetIds = new HashSet<>();
        for (Map<String, Object> expense : expenses) {
            Object budgetIdsObj = expense.get("budgetIds");
            if (budgetIdsObj instanceof List) {
                List<?> ids = (List<?>) budgetIdsObj;
                for (Object id : ids) {
                    if (id instanceof Number) {
                        budgetIds.add(((Number) id).intValue());
                    }
                }
            }
        }
        return budgetIds;
    }

    private List<Map<String, Object>> filterBudgetsForCategory(List<Map<String, Object>> allBudgets,
            Set<Integer> categoryBudgetIds) {
        if (categoryBudgetIds.isEmpty()) {
            return Collections.emptyList();
        }
        return allBudgets.stream()
                .filter(budget -> {
                    Integer budgetId = extractInt(budget, "id");
                    return categoryBudgetIds.contains(budgetId);
                })
                .collect(Collectors.toList());
    }

    private BudgetAnalytics calculateBudgetAnalyticsFromBudgets(List<Map<String, Object>> budgets,
            List<Map<String, Object>> expenses) {
        if (budgets.isEmpty()) {
            return BudgetAnalytics.builder()
                    .totalAllocated(0.0)
                    .totalUsed(0.0)
                    .remainingAmount(0.0)
                    .usagePercentage(0.0)
                    .linkedBudgets(Collections.emptyList())
                    .build();
        }

        double totalAllocated = budgets.stream()
                .mapToDouble(b -> extractDouble(b, "totalAmount"))
                .sum();

        double totalUsed = budgets.stream()
                .mapToDouble(b -> extractDouble(b, "spentAmount"))
                .sum();

        double remaining = totalAllocated - totalUsed;
        double usagePercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

        List<BudgetCategoryInfo> linkedBudgets = budgets.stream()
                .map(budget -> BudgetCategoryInfo.builder()
                        .budgetId(extractInt(budget, "id"))
                        .budgetName(extractString(budget, "name"))
                        .totalBudgetAmount(extractDouble(budget, "totalAmount"))
                        .categorySpentAmount(extractDouble(budget, "spentAmount"))
                        .numberOfExpensesInThisCategory(0)
                        .categoryUsagePercentageInBudget(extractDouble(budget, "totalAmount") > 0
                                ? (extractDouble(budget, "spentAmount") / extractDouble(budget, "totalAmount")) * 100
                                : 0)
                        .build())
                .collect(Collectors.toList());

        return BudgetAnalytics.builder()
                .totalAllocated(totalAllocated)
                .totalUsed(totalUsed)
                .remainingAmount(remaining)
                .usagePercentage(Math.round(usagePercentage * 100.0) / 100.0)
                .linkedBudgets(linkedBudgets)
                .build();
    }

    private List<BudgetCategoryReport> buildBudgetReportsFromBudgets(List<Map<String, Object>> budgets) {
        return budgets.stream()
                .map(budget -> BudgetCategoryReport.builder()
                        .budgetId(extractInt(budget, "id"))
                        .budgetName(extractString(budget, "name"))
                        .budgetAllocation(extractDouble(budget, "totalAmount"))
                        .totalAmountSpentInCategory(extractDouble(budget, "spentAmount"))
                        .totalExpensesCountInCategory(0)
                        .percentageOfBudget(extractDouble(budget, "totalAmount") > 0
                                ? (extractDouble(budget, "spentAmount") / extractDouble(budget, "totalAmount")) * 100
                                : 0)
                        .build())
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private CategoryMetadata fetchCategoryMetadata(String jwt, Integer categoryId, Integer targetId) {
        try {
            Map<String, Object> response = categoryAnalyticsClient.getCategoryById(jwt, categoryId, targetId);

            // Unwrap ApiResponse - the actual category data is inside "data" field
            Map<String, Object> category = response;
            if (response.containsKey("data") && response.get("data") instanceof Map) {
                category = (Map<String, Object>) response.get("data");
            }

            return CategoryMetadata.builder()
                    .categoryId(extractInt(category, "id"))
                    .categoryName(extractString(category, "name"))
                    .icon(extractString(category, "icon"))
                    .color(extractString(category, "color"))
                    .description(extractString(category, "description"))
                    .type(extractString(category, "type"))
                    .build();
        } catch (Exception e) {
            log.warn("Failed to fetch category metadata for categoryId={}: {}", categoryId, e.getMessage());
            return CategoryMetadata.builder()
                    .categoryId(categoryId)
                    .categoryName("Unknown Category")
                    .build();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchCategoryExpenses(
            String jwt, Integer categoryId, LocalDate startDate, LocalDate endDate, Integer targetId) {
        try {
            String start = startDate != null ? startDate.format(DATE_FORMATTER) : null;
            String end = endDate != null ? endDate.format(DATE_FORMATTER) : null;
            Map<String, Object> response = categoryAnalyticsClient.getCategoryExpenses(jwt, categoryId, start,
                    end, targetId);

            // Unwrap ApiResponse - the actual expenses list is inside "data" field
            if (response != null && response.containsKey("data") && response.get("data") instanceof List) {
                return (List<Map<String, Object>>) response.get("data");
            }
            return Collections.emptyList();
        } catch (Exception e) {
            log.warn("Failed to fetch category expenses: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private Map<String, Object> fetchAllExpensesSummary(String jwt, Integer targetId) {
        try {
            return expenseService.getExpenseSummary(jwt, targetId);
        } catch (Exception e) {
            log.warn("Failed to fetch expense summary: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private SummaryStatistics calculateSummaryStatistics(
            List<Map<String, Object>> expenses,
            LocalDate startDate,
            LocalDate endDate,
            Map<String, Object> summaryData,
            Map<String, Object> categoryData) {

        if (expenses.isEmpty()) {
            return SummaryStatistics.builder()
                    .totalSpent(0.0)
                    .totalTransactions(0)
                    .averageExpense(0.0)
                    .costPerDay(0.0)
                    .categoryPercentageOfAllExpenses(0.0)
                    .consistency(0)
                    .activeDays(0)
                    .minExpense(0.0)
                    .maxExpense(0.0)
                    .build();
        }

        double totalSpent = extractDouble(categoryData, "totalAmount");
        if (totalSpent == 0) {
            totalSpent = expenses.stream()
                    .mapToDouble(this::extractExpenseAmount)
                    .sum();
        }

        int totalTransactions = expenses.size();
        double averageExpense = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

        Set<LocalDate> activeDates = expenses.stream()
                .map(this::extractExpenseDate)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        int activeDays = activeDates.size();
        long totalDays = startDate != null && endDate != null
                ? java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1
                : activeDays;

        double costPerDay = totalDays > 0 ? totalSpent / totalDays : 0;

        Set<String> activeMonths = expenses.stream()
                .map(e -> {
                    LocalDate date = extractExpenseDate(e);
                    return date != null ? date.getYear() + "-" + date.getMonthValue() : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        double totalAllExpenses = extractDouble(summaryData, "totalAmount");
        double categoryPercentage = totalAllExpenses > 0 ? (totalSpent / totalAllExpenses) * 100 : 0;

        DoubleSummaryStatistics stats = expenses.stream()
                .mapToDouble(this::extractExpenseAmount)
                .summaryStatistics();

        return SummaryStatistics.builder()
                .totalSpent(totalSpent)
                .totalTransactions(totalTransactions)
                .averageExpense(Math.round(averageExpense * 100.0) / 100.0)
                .costPerDay(Math.round(costPerDay * 100.0) / 100.0)
                .categoryPercentageOfAllExpenses(Math.round(categoryPercentage * 100.0) / 100.0)
                .consistency(activeMonths.size())
                .activeDays(activeDays)
                .minExpense(stats.getMin() == Double.POSITIVE_INFINITY ? 0 : stats.getMin())
                .maxExpense(stats.getMax() == Double.NEGATIVE_INFINITY ? 0 : stats.getMax())
                .build();
    }

    @SuppressWarnings("unchecked")
    private double extractExpenseAmount(Map<String, Object> expenseWrapper) {
        Object expenseObj = expenseWrapper.get("expense");
        if (expenseObj instanceof Map) {
            Map<String, Object> expense = (Map<String, Object>) expenseObj;
            return extractDouble(expense, "amount");
        }
        return extractDouble(expenseWrapper, "amount");
    }

    @SuppressWarnings("unchecked")
    private LocalDate extractExpenseDate(Map<String, Object> expenseWrapper) {
        String date = extractString(expenseWrapper, "date");
        if (date != null && !date.isEmpty()) {
            return parseDate(date);
        }
        Object expenseObj = expenseWrapper.get("expense");
        if (expenseObj instanceof Map) {
            Map<String, Object> expense = (Map<String, Object>) expenseObj;
            date = extractString(expense, "date");
            if (date != null && !date.isEmpty()) {
                return parseDate(date);
            }
        }
        return null;
    }

    private TrendAnalytics calculateTrendAnalytics(
            List<Map<String, Object>> expenses,
            LocalDate startDate,
            LocalDate endDate,
            String trendType) {

        List<DailySpending> dailyTrend = calculateDailySpending(expenses);

        List<WeeklySpending> weeklyTrend = calculateWeeklySpending(expenses);

        List<MonthlySpending> monthlyTrend = calculateMonthlySpending(expenses);

        List<YearlySpending> yearlyTrend = calculateYearlySpending(expenses);

        MonthComparison monthComparison = calculateMonthComparison(expenses);

        MonthlySpending mostActive = monthlyTrend.stream()
                .max(Comparator.comparingDouble(MonthlySpending::getAmount))
                .orElse(null);

        MonthlySpending leastActive = monthlyTrend.stream()
                .filter(m -> m.getAmount() > 0)
                .min(Comparator.comparingDouble(MonthlySpending::getAmount))
                .orElse(null);

        return TrendAnalytics.builder()
                .dailySpendingTrend(dailyTrend)
                .weeklySpendingTrend(weeklyTrend)
                .monthlySpendingTrend(monthlyTrend)
                .yearlySpendingTrend(yearlyTrend)
                .monthlySpendingPattern(monthlyTrend)
                .previousVsCurrentMonth(monthComparison)
                .mostActiveMonth(mostActive)
                .leastActiveMonth(leastActive)
                .build();
    }

    private List<DailySpending> calculateDailySpending(List<Map<String, Object>> expenses) {
        Map<LocalDate, List<Map<String, Object>>> groupedByDate = expenses.stream()
                .filter(e -> extractExpenseDate(e) != null)
                .collect(Collectors.groupingBy(this::extractExpenseDate));

        return groupedByDate.entrySet().stream()
                .map(entry -> DailySpending.builder()
                        .date(entry.getKey())
                        .dayName(entry.getKey().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .amount(entry.getValue().stream().mapToDouble(this::extractExpenseAmount).sum())
                        .transactionCount(entry.getValue().size())
                        .build())
                .sorted(Comparator.comparing(DailySpending::getDate))
                .collect(Collectors.toList());
    }

    private List<WeeklySpending> calculateWeeklySpending(List<Map<String, Object>> expenses) {
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        Map<String, List<Map<String, Object>>> groupedByWeek = expenses.stream()
                .filter(e -> extractExpenseDate(e) != null)
                .collect(Collectors.groupingBy(e -> {
                    LocalDate date = extractExpenseDate(e);
                    int weekNum = date.get(weekFields.weekOfWeekBasedYear());
                    int year = date.getYear();
                    return year + "-W" + String.format("%02d", weekNum);
                }));

        return groupedByWeek.entrySet().stream()
                .map(entry -> {
                    List<LocalDate> dates = entry.getValue().stream()
                            .map(this::extractExpenseDate)
                            .filter(Objects::nonNull)
                            .sorted()
                            .collect(Collectors.toList());

                    return WeeklySpending.builder()
                            .week(entry.getKey())
                            .weekStart(dates.isEmpty() ? null : dates.get(0).with(DayOfWeek.MONDAY))
                            .weekEnd(dates.isEmpty() ? null : dates.get(0).with(DayOfWeek.SUNDAY))
                            .amount(entry.getValue().stream().mapToDouble(this::extractExpenseAmount).sum())
                            .transactionCount(entry.getValue().size())
                            .build();
                })
                .sorted(Comparator.comparing(WeeklySpending::getWeek))
                .collect(Collectors.toList());
    }

    private List<MonthlySpending> calculateMonthlySpending(List<Map<String, Object>> expenses) {
        Map<String, List<Map<String, Object>>> groupedByMonth = expenses.stream()
                .filter(e -> extractExpenseDate(e) != null)
                .collect(Collectors.groupingBy(e -> {
                    LocalDate date = extractExpenseDate(e);
                    return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                }));

        return groupedByMonth.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);

                    return MonthlySpending.builder()
                            .month(LocalDate.of(year, month, 1).getMonth().getDisplayName(TextStyle.FULL,
                                    Locale.ENGLISH) + " " + year)
                            .year(year)
                            .monthNumber(month)
                            .amount(entry.getValue().stream().mapToDouble(this::extractExpenseAmount).sum())
                            .transactionCount(entry.getValue().size())
                            .build();
                })
                .sorted(Comparator.comparing(MonthlySpending::getYear)
                        .thenComparing(MonthlySpending::getMonthNumber))
                .collect(Collectors.toList());
    }

    private List<YearlySpending> calculateYearlySpending(List<Map<String, Object>> expenses) {
        Map<Integer, List<Map<String, Object>>> groupedByYear = expenses.stream()
                .filter(e -> extractExpenseDate(e) != null)
                .collect(Collectors.groupingBy(e -> extractExpenseDate(e).getYear()));

        return groupedByYear.entrySet().stream()
                .map(entry -> YearlySpending.builder()
                        .year(entry.getKey())
                        .amount(entry.getValue().stream().mapToDouble(this::extractExpenseAmount).sum())
                        .transactionCount(entry.getValue().size())
                        .build())
                .sorted(Comparator.comparing(YearlySpending::getYear))
                .collect(Collectors.toList());
    }

    private MonthComparison calculateMonthComparison(List<Map<String, Object>> expenses) {
        LocalDate now = LocalDate.now();
        LocalDate currentMonthStart = now.withDayOfMonth(1);
        LocalDate previousMonthStart = currentMonthStart.minusMonths(1);

        double currentMonthAmount = expenses.stream()
                .filter(e -> {
                    LocalDate date = extractExpenseDate(e);
                    return date != null && !date.isBefore(currentMonthStart);
                })
                .mapToDouble(this::extractExpenseAmount)
                .sum();

        double previousMonthAmount = expenses.stream()
                .filter(e -> {
                    LocalDate date = extractExpenseDate(e);
                    return date != null && !date.isBefore(previousMonthStart) && date.isBefore(currentMonthStart);
                })
                .mapToDouble(this::extractExpenseAmount)
                .sum();

        double percentageChange = previousMonthAmount > 0
                ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100
                : 0;

        String trend = percentageChange > 5 ? "INCREASED" : percentageChange < -5 ? "DECREASED" : "STABLE";

        return MonthComparison.builder()
                .previousMonthAmount(previousMonthAmount)
                .currentMonthAmount(currentMonthAmount)
                .percentageChange(Math.round(percentageChange * 100.0) / 100.0)
                .trend(trend)
                .previousMonthName(previousMonthStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH))
                .currentMonthName(currentMonthStart.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH))
                .build();
    }

    private List<PaymentMethodDistribution> calculatePaymentMethodDistribution(List<Map<String, Object>> expenses) {
        double totalAmount = expenses.stream().mapToDouble(this::extractExpenseAmount).sum();

        Map<String, List<Map<String, Object>>> groupedByPayment = expenses.stream()
                .collect(Collectors.groupingBy(this::extractPaymentMethod));

        Map<String, String> paymentColors = Map.of(
                "UPI", "#6366f1",
                "Cash", "#22c55e",
                "Card", "#f97316",
                "Credit Card", "#ef4444",
                "Debit Card", "#3b82f6",
                "NetBanking", "#8b5cf6");

        return groupedByPayment.entrySet().stream()
                .map(entry -> {
                    String method = entry.getKey();
                    double amount = entry.getValue().stream().mapToDouble(this::extractExpenseAmount).sum();
                    double percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

                    return PaymentMethodDistribution.builder()
                            .paymentMethod(method)
                            .displayName(formatPaymentMethodName(method))
                            .totalAmount(amount)
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .transactionCount(entry.getValue().size())
                            .color(paymentColors.getOrDefault(method, "#64748b"))
                            .build();
                })
                .sorted(Comparator.comparingDouble(PaymentMethodDistribution::getTotalAmount).reversed())
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private String extractPaymentMethod(Map<String, Object> expenseWrapper) {
        Object paymentMethodObj = expenseWrapper.get("paymentMethod");
        if (paymentMethodObj instanceof Map) {
            Map<String, Object> paymentMethod = (Map<String, Object>) paymentMethodObj;
            return extractString(paymentMethod, "name");
        }
        Object expenseObj = expenseWrapper.get("expense");
        if (expenseObj instanceof Map) {
            Map<String, Object> expense = (Map<String, Object>) expenseObj;
            return extractString(expense, "paymentMethod");
        }
        return extractString(expenseWrapper, "paymentMethod");
    }

    private BudgetAnalytics calculateBudgetAnalytics(String jwt, Integer categoryId, Integer targetId) {
        try {
            List<Map<String, Object>> budgetReports = budgetAnalyticsClient.getAllBudgetReportsForUser(jwt, targetId);

            List<BudgetCategoryInfo> linkedBudgets = new ArrayList<>();
            double totalAllocated = 0;
            double totalUsed = 0;

            if (budgetReports != null) {
                for (Map<String, Object> budget : budgetReports) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> categoryBreakdown = (List<Map<String, Object>>) budget
                            .get("categoryBreakdown");

                    if (categoryBreakdown != null) {
                        Optional<Map<String, Object>> categoryData = categoryBreakdown.stream()
                                .filter(c -> Objects.equals(extractInt(c, "categoryId"), categoryId))
                                .findFirst();

                        if (categoryData.isPresent()) {
                            Map<String, Object> catInfo = categoryData.get();
                            double budgetAmount = extractDouble(budget, "allocatedAmount");
                            double categoryAmount = extractDouble(catInfo, "amount");

                            linkedBudgets.add(BudgetCategoryInfo.builder()
                                    .budgetId(extractInt(budget, "budgetId"))
                                    .budgetName(extractString(budget, "budgetName"))
                                    .description(extractString(budget, "description"))
                                    .totalBudgetAmount(budgetAmount)
                                    .categorySpentAmount(categoryAmount)
                                    .numberOfExpensesInThisCategory(extractInt(catInfo, "transactionCount"))
                                    .categoryUsagePercentageInBudget(
                                            budgetAmount > 0 ? (categoryAmount / budgetAmount) * 100 : 0)
                                    .startDate(parseDate(extractString(budget, "startDate")))
                                    .endDate(parseDate(extractString(budget, "endDate")))
                                    .status(extractString(budget, "budgetStatus"))
                                    .build());

                            totalAllocated += budgetAmount;
                            totalUsed += categoryAmount;
                        }
                    }
                }
            }

            return BudgetAnalytics.builder()
                    .totalAllocated(totalAllocated)
                    .totalUsed(totalUsed)
                    .remainingAmount(totalAllocated - totalUsed)
                    .usagePercentage(totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0)
                    .linkedBudgets(linkedBudgets)
                    .build();

        } catch (Exception e) {
            log.warn("Failed to calculate budget analytics: {}", e.getMessage());
            return BudgetAnalytics.builder()
                    .totalAllocated(0.0)
                    .totalUsed(0.0)
                    .remainingAmount(0.0)
                    .usagePercentage(0.0)
                    .linkedBudgets(Collections.emptyList())
                    .build();
        }
    }

    private ExpenseHighlights calculateExpenseHighlights(List<Map<String, Object>> expenses) {
        if (expenses.isEmpty()) {
            return ExpenseHighlights.builder().build();
        }

        Comparator<Map<String, Object>> byAmount = Comparator.comparingDouble(this::extractExpenseAmount);
        Comparator<Map<String, Object>> byDate = Comparator.comparing(e -> {
            LocalDate date = extractExpenseDate(e);
            return date != null ? date : LocalDate.MIN;
        });

        Map<String, Object> highest = expenses.stream().max(byAmount).orElse(null);
        Map<String, Object> lowest = expenses.stream().min(byAmount).orElse(null);
        Map<String, Object> mostRecent = expenses.stream().max(byDate).orElse(null);
        Map<String, Object> oldest = expenses.stream().min(byDate).orElse(null);

        return ExpenseHighlights.builder()
                .highestExpense(buildExpenseHighlightItem(highest))
                .lowestExpense(buildExpenseHighlightItem(lowest))
                .mostRecentExpense(buildExpenseHighlightItem(mostRecent))
                .oldestExpense(buildExpenseHighlightItem(oldest))
                .build();
    }

    @SuppressWarnings("unchecked")
    private ExpenseHighlightItem buildExpenseHighlightItem(Map<String, Object> expenseWrapper) {
        if (expenseWrapper == null)
            return null;

        Map<String, Object> expense = expenseWrapper;
        Object expenseObj = expenseWrapper.get("expense");
        if (expenseObj instanceof Map) {
            expense = (Map<String, Object>) expenseObj;
        }

        return ExpenseHighlightItem.builder()
                .expenseId(extractInt(expense, "id"))
                .amount(extractExpenseAmount(expenseWrapper))
                .date(extractExpenseDate(expenseWrapper))
                .description(extractString(expense, "expenseName"))
                .merchant(extractString(expense, "merchant"))
                .paymentMethod(extractPaymentMethod(expenseWrapper))
                .build();
    }

    private TransactionData buildTransactionData(List<Map<String, Object>> expenses) {
        List<ExpenseTransaction> allTransactions = expenses.stream()
                .map(this::mapToExpenseTransaction)
                .sorted(Comparator.comparing(ExpenseTransaction::getDate).reversed())
                .collect(Collectors.toList());

        List<ExpenseTransaction> recentTransactions = allTransactions.stream()
                .limit(10)
                .collect(Collectors.toList());

        return TransactionData.builder()
                .recentTransactions(recentTransactions)
                .fullExpenseList(allTransactions)
                .totalCount(allTransactions.size())
                .build();
    }

    @SuppressWarnings("unchecked")
    private ExpenseTransaction mapToExpenseTransaction(Map<String, Object> expenseWrapper) {
        List<Integer> budgetIds = Collections.emptyList();
        Object budgetIdsObj = expenseWrapper.get("budgetIds");
        if (budgetIdsObj instanceof List) {
            budgetIds = ((List<?>) budgetIdsObj).stream()
                    .filter(id -> id instanceof Number)
                    .map(id -> ((Number) id).intValue())
                    .collect(Collectors.toList());
        }

        Map<String, Object> expense = expenseWrapper;
        Object expenseObj = expenseWrapper.get("expense");
        if (expenseObj instanceof Map) {
            expense = (Map<String, Object>) expenseObj;
        }

        return ExpenseTransaction.builder()
                .expenseId(extractInt(expense, "id"))
                .expenseName(extractString(expense, "expenseName"))
                .amount(extractExpenseAmount(expenseWrapper))
                .date(extractExpenseDate(expenseWrapper))
                .merchant(extractString(expense, "merchant"))
                .paymentMethod(extractPaymentMethod(expenseWrapper))
                .note(extractString(expense, "comments"))
                .type(extractString(expense, "type"))
                .associatedBudgetIds(budgetIds)
                .build();
    }

    private List<BudgetCategoryReport> buildBudgetReports(String jwt, Integer categoryId, Integer targetId) {
        try {
            List<Map<String, Object>> budgetReports = budgetAnalyticsClient.getAllBudgetReportsForUser(jwt, targetId);

            if (budgetReports == null)
                return Collections.emptyList();

            List<BudgetCategoryReport> reports = new ArrayList<>();

            for (Map<String, Object> budget : budgetReports) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> categoryBreakdown = (List<Map<String, Object>>) budget
                        .get("categoryBreakdown");

                if (categoryBreakdown != null) {
                    categoryBreakdown.stream()
                            .filter(c -> Objects.equals(extractInt(c, "categoryId"), categoryId))
                            .findFirst()
                            .ifPresent(catInfo -> {
                                double budgetAllocation = extractDouble(budget, "allocatedAmount");
                                double categoryAmount = extractDouble(catInfo, "amount");

                                reports.add(BudgetCategoryReport.builder()
                                        .budgetId(extractInt(budget, "budgetId"))
                                        .budgetName(extractString(budget, "budgetName"))
                                        .totalExpensesCountInCategory(extractInt(catInfo, "transactionCount"))
                                        .totalAmountSpentInCategory(categoryAmount)
                                        .budgetAllocation(budgetAllocation)
                                        .percentageOfBudget(
                                                budgetAllocation > 0 ? (categoryAmount / budgetAllocation) * 100 : 0)
                                        .build());
                            });
                }
            }

            return reports;

        } catch (Exception e) {
            log.warn("Failed to build budget reports: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<InsightItem> generateInsights(
            SummaryStatistics summaryStats,
            TrendAnalytics trendAnalytics,
            BudgetAnalytics budgetAnalytics,
            List<PaymentMethodDistribution> paymentDistribution) {

        List<InsightItem> insights = new ArrayList<>();

        MonthComparison monthComp = trendAnalytics.getPreviousVsCurrentMonth();
        if (monthComp != null && monthComp.getPercentageChange() != null) {
            if (monthComp.getPercentageChange() > SPENDING_INCREASE_THRESHOLD) {
                insights.add(InsightItem.builder()
                        .type("WARNING")
                        .title("Spending Increase Alert")
                        .message(String.format(
                                "Food spending increased by %.0f%% this month compared to last month. You might exceed your budget!",
                                monthComp.getPercentageChange()))
                        .icon("warning")
                        .value(monthComp.getPercentageChange())
                        .actionText("Consider reviewing your expenses this weekend")
                        .build());
            } else if (monthComp.getPercentageChange() < -SPENDING_INCREASE_THRESHOLD) {
                insights.add(InsightItem.builder()
                        .type("INFO")
                        .title("Great Progress!")
                        .message(String.format("Your spending decreased by %.0f%% compared to last month. Keep it up!",
                                Math.abs(monthComp.getPercentageChange())))
                        .icon("celebration")
                        .value(monthComp.getPercentageChange())
                        .build());
            }
        }

        if (budgetAnalytics != null && budgetAnalytics.getUsagePercentage() != null) {
            double usagePercent = budgetAnalytics.getUsagePercentage();
            if (usagePercent >= BUDGET_WARNING_THRESHOLD) {
                insights.add(InsightItem.builder()
                        .type("WARNING")
                        .title("Budget Alert")
                        .message(String.format("You've used %.0f%% of your allocated budget. Only ₹%.0f remaining.",
                                usagePercent, budgetAnalytics.getRemainingAmount()))
                        .icon("alert")
                        .value(usagePercent)
                        .actionText("Set a lower budget next month")
                        .build());
            }
        }

        if (summaryStats.getConsistency() >= CONSISTENCY_GOOD_THRESHOLD) {
            insights.add(InsightItem.builder()
                    .type("INFO")
                    .title("Consistent Spending")
                    .message(String.format(
                            "You've tracked expenses in this category for %d months. Regular tracking helps manage budgets better.",
                            summaryStats.getConsistency()))
                    .icon("trending_up")
                    .value((double) summaryStats.getConsistency())
                    .build());
        }

        if (!paymentDistribution.isEmpty()) {
            PaymentMethodDistribution topMethod = paymentDistribution.get(0);
            if (topMethod.getPercentage() > 50) {
                insights.add(InsightItem.builder()
                        .type("INFO")
                        .title("Payment Preference")
                        .message(String.format(
                                "%s is your preferred payment method (%.0f%% of transactions) for this category.",
                                topMethod.getDisplayName(), topMethod.getPercentage()))
                        .icon("payment")
                        .value(topMethod.getPercentage())
                        .build());
            }
        }

        if (summaryStats.getCostPerDay() > 0) {
            insights.add(InsightItem.builder()
                    .type("SUGGESTION")
                    .title("Daily Spending Rate")
                    .message(String.format("You're spending an average of ₹%.0f per day in this category.",
                            summaryStats.getCostPerDay()))
                    .icon("calendar_today")
                    .value(summaryStats.getCostPerDay())
                    .build());
        }

        return insights;
    }

    private String formatPaymentMethodName(String method) {
        if (method == null || method.isEmpty())
            return "Unknown";
        return method.substring(0, 1).toUpperCase() + method.substring(1).toLowerCase();
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty())
            return null;
        try {
            return LocalDate.parse(dateStr.substring(0, 10));
        } catch (Exception e) {
            return null;
        }
    }

    private String extractString(Map<String, Object> source, String key) {
        if (source == null || !source.containsKey(key) || source.get(key) == null) {
            return "";
        }
        return source.get(key).toString();
    }

    private Double extractDouble(Map<String, Object> source, String key) {
        if (source == null || !source.containsKey(key) || source.get(key) == null) {
            return 0.0;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private Integer extractInt(Map<String, Object> source, String key) {
        if (source == null || !source.containsKey(key) || source.get(key) == null) {
            return 0;
        }
        Object value = source.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
