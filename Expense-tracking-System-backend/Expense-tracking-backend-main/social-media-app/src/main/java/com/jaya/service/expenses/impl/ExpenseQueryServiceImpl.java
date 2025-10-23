package com.jaya.service.expenses.impl;

import com.jaya.dto.User;
import com.jaya.models.*;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.BudgetServices;
import com.jaya.service.CategoryServices;
import com.jaya.service.PaymentMethodServices;
import com.jaya.service.expenses.ExpenseQueryService;
import com.jaya.util.ServiceHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class ExpenseQueryServiceImpl implements ExpenseQueryService {


    public static final String OTHERS = "Others";
    private static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    private static final String CREDIT_PAID = "creditPaid";
    private static final String CASH = "cash";
    private static final String MONTH = "month";
    private static final String YEAR = "year";
    private static final String WEEK = "week";




    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;

    @Autowired
    private BudgetServices budgetService;
    @Autowired
    private CategoryServices categoryService;

    @Autowired
    private PaymentMethodServices paymentMethodService;

    @Autowired
    private ServiceHelper helper;

    public ExpenseQueryServiceImpl(ExpenseRepository expenseRepository, ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }


    @Override
    public List<Expense> getExpensesByDate(LocalDate date, Integer userId) {
        return expenseRepository.findByUserIdAndDate(userId, date);
    }

    @Override
    public List<Expense> getExpensesByDateString(String dateString, Integer userId) throws Exception {
        LocalDate specificDate;
        try {
            specificDate = LocalDate.parse(dateString);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Please use yyyy-MM-dd format.");
        }

        return getExpensesByDate(specificDate, userId);
    }

    @Override
    public List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to, Integer userId) {
        return expenseRepository.findByUserIdAndDateBetween(userId, from, to);
    }

    @Override
    public List<Expense> getExpensesForToday(Integer userId) {
        LocalDate today = LocalDate.now();
        return expenseRepository.findByUserIdAndDate(userId, today);
    }

    @Override
    public List<Expense> getExpensesForCurrentMonth(Integer userId) {
        LocalDate today = LocalDate.now();


        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);

        LocalDate lastDayOfCurrentMonth = today.withDayOfMonth(today.lengthOfMonth());


        return expenseRepository.findByUserIdAndDateBetween(userId, firstDayOfCurrentMonth, lastDayOfCurrentMonth);
    }

    @Override
    public List<Expense> getExpensesForLastMonth(Integer userId) {

        LocalDate today = LocalDate.now();


        LocalDate firstDayOfLastMonth = today.withDayOfMonth(1).minusMonths(1);

        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());


        return expenseRepository.findByUserIdAndDateBetween(userId, firstDayOfLastMonth, lastDayOfLastMonth);
    }

    @Override
    public List<Expense> getExpensesByCurrentWeek(Integer userId) {
        LocalDate startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endDate = startDate.plusDays(6);
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    @Override
    public List<Expense> getExpensesByLastWeek(Integer userId) {
        LocalDate endDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusDays(1);
        LocalDate startDate = endDate.minusDays(6);
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    @Override
    public List<Expense> getExpensesByMonthAndYear(int month, int year, Integer userId) {
        return expenseRepository.findByUserAndMonthAndYear(userId, month, year);
    }

    @Override
    public List<Expense> getExpensesByMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return expenseRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    public List<Expense> searchExpensesByName(String expenseName, Integer userId) {
        return expenseRepository.searchExpensesByUserAndName(userId, expenseName);
    }

    @Override
    public List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type, String paymentMethod, Double minAmount, Double maxAmount, Integer userId) {
        return expenseRepository.filterExpensesByUser(userId, expenseName, startDate, endDate, type, paymentMethod, minAmount, maxAmount);
    }

    @Override
    public List<Expense> getExpensesByType(String type, Integer userId) {
        return expenseRepository.findExpensesWithGainTypeByUser(userId);
    }

    @Override
    public List<Expense> getExpensesByPaymentMethod(String paymentMethod, Integer userId) {
        return expenseRepository.findByUserAndPaymentMethod(userId, paymentMethod);
    }

    @Override
    public List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod, Integer userId) {
        return expenseRepository.findByUserAndTypeAndPaymentMethod(userId, type, paymentMethod);
    }

    @Override
    public List<Expense> getLossExpenses(Integer userId) {
        return expenseRepository.findByLossTypeAndUser(userId);
    }

    @Override
    public List<Expense> getTopNExpenses(int n, Integer userId) {
        Pageable pageable = PageRequest.of(0, n);
        Page<Expense> topExpensesPage = expenseRepository.findTopNExpensesByUserAndAmount(userId, pageable);
        return topExpensesPage.getContent();
    }

    @Override
    public List<Expense> getTopGains(Integer userId) {
        Pageable pageable = PageRequest.of(0, 10);
        return expenseRepository.findTop10GainsByUser(userId, pageable);
    }

    @Override
    public List<Expense> getTopLosses(Integer userId) {
        Pageable pageable = PageRequest.of(0, 10);
        return expenseRepository.findTop10LossesByUser(userId, pageable);
    }

    @Override
    public List<ExpenseDetails> getExpenseDetailsByAmount(double amount, Integer userId) {
        return expenseRepository.findByUserAndAmount(userId, amount);
    }

    @Override
    public List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount, Integer userId) {
        return expenseRepository.findExpensesByUserAndAmountRange(userId, minAmount, maxAmount);
    }

    @Override
    public List<ExpenseDetails> getExpensesByName(String expenseName, Integer userId) {
        return expenseRepository.findExpensesByUserAndName(userId, expenseName.trim());
    }

    @Override
    public Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date) {

        List<Expense> expensesBeforeDate = expenseRepository.findByUserAndExpenseNameBeforeDate(userId, expenseName, date);
        return expensesBeforeDate.get(0);
    }

    @Override
    public List<Expense> getExpensesWithinRange(Integer userId, LocalDate startDate, LocalDate endDate, String flowType) {

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        if (flowType != null && !flowType.isEmpty()) {
            return expenses.stream().filter(expense -> {
                String type = expense.getExpense().getType();
                if ("inflow".equalsIgnoreCase(flowType)) {
                    return "gain".equalsIgnoreCase(type) || "income".equalsIgnoreCase(type);
                } else if ("outflow".equalsIgnoreCase(flowType)) {
                    return "loss".equalsIgnoreCase(type) || "expense".equalsIgnoreCase(type);
                }
                return true;
            }).collect(Collectors.toList());
        }

        return expenses;
    }

    @Override
    public List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to, Integer userId) {
        return expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(userId, from, to);
    }

    @Override
    public List<Expense> getExpensesInBudgetRangeWithIncludeFlag(LocalDate startDate, LocalDate endDate, Integer budgetId, Integer userId) throws Exception {

        Budget optionalBudget = budgetService.getBudgetById(budgetId, userId);
        if (optionalBudget == null) {
            throw new RuntimeException("Budget not found for user with ID: " + budgetId);
        }

        Budget budget = optionalBudget;


        LocalDate effectiveStartDate = (startDate != null) ? startDate : budget.getStartDate();
        LocalDate effectiveEndDate = (endDate != null) ? endDate : budget.getEndDate();

        List<Expense> expensesInRange = expenseRepository.findByUserIdAndDateBetween(userId, effectiveStartDate, effectiveEndDate);

        for (Expense expense : expensesInRange) {
            boolean isIncluded = expense.getBudgetIds() != null && expense.getBudgetIds().contains(budgetId);
            expense.setIncludeInBudget(isIncluded);
        }

        return expensesInRange;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByCategories(Integer userId, String rangeType, int offset, String flowType) throws Exception {

        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case WEEK:
                startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = now.with(DayOfWeek.SUNDAY).plusWeeks(offset);
                break;
            case MONTH:
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case YEAR:
                startDate = LocalDate.of(now.getYear(), 1, 1).plusYears(offset);
                endDate = LocalDate.of(now.getYear(), 12, 31).plusYears(offset);
                break;
            case "custom":
                startDate = now.minusDays(30);  // Default to last 30 days
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid rangeType. Valid options are: week, month, year, custom");
        }


        List<Category> userCategories = categoryService.getAllForUser(userId);


        List<Expense> filteredExpenses = getExpensesWithinRange(userId, startDate, endDate, flowType);


        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }


        for (Expense expense : filteredExpenses) {
            for (Category category : userCategories) {
                // Check if this expense is associated with this category
                if (category.getExpenseIds() != null) {
                    for (Map.Entry<Integer, Set<Integer>> entry : category.getExpenseIds().entrySet()) {
                        if (entry.getValue().contains(expense.getId())) {
                            categoryExpensesMap.get(category).add(expense);
                            break;
                        }
                    }
                }
            }
        }


        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        Map<String, Object> response = new HashMap<>();


        int totalCategories = categoryExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
            Category category = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();


            double categoryTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    categoryTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            categoryTotals.put(category.getName(), categoryTotal);


            Map<String, Object> categoryDetails = buildCategoryDetailsMap(category, expenses, categoryTotal);


            response.put(category.getName(), categoryDetails);
        }


        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);
        summary.put("dateRange", Map.of("startDate", startDate, "endDate", endDate, "rangeType", rangeType, "offset", offset, "flowType", flowType != null ? flowType : "all"));

        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType) throws Exception {


        List<Category> userCategories = categoryService.getAllForUser(userId);


        List<Expense> filteredExpenses = getExpensesWithinRange(userId, fromDate, toDate, flowType);


        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();


        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }


        for (Expense expense : filteredExpenses) {
            if (flowType != null && !flowType.isEmpty()) {
                String expenseType = expense.getExpense().getType();

                if (flowType.equalsIgnoreCase("inflow") && !expenseType.equalsIgnoreCase("gain")) {
                    continue;
                } else if (flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase("loss")) {
                    continue;
                } else if (!flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase(flowType)) {
                    continue;
                }
            }

            for (Category category : userCategories) {

                if (category.getExpenseIds() != null) {
                    for (Map.Entry<Integer, Set<Integer>> entry : category.getExpenseIds().entrySet()) {
                        if (entry.getValue().contains(expense.getId())) {
                            categoryExpensesMap.get(category).add(expense);
                            break;
                        }
                    }
                }
            }
        }


        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());


        Map<String, Object> response = new HashMap<>();

        int totalCategories = categoryExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
            Category category = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            double categoryTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    categoryTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            categoryTotals.put(category.getName(), categoryTotal);


            Map<String, Object> categoryDetails = new HashMap<>();
            categoryDetails.put("id", category.getId());
            categoryDetails.put("name", category.getName());
            categoryDetails.put("description", category.getDescription());
            categoryDetails.put("isGlobal", category.isGlobal());


            if (category.getColor() != null) {
                categoryDetails.put("color", category.getColor());
            }
            if (category.getIcon() != null) {
                categoryDetails.put("icon", category.getIcon());
            }

            categoryDetails.put("userIds", category.getUserIds());
            categoryDetails.put("editUserIds", category.getEditUserIds());


            categoryDetails.put("expenseIds", category.getExpenseIds());


            List<Map<String, Object>> formattedExpenses = new ArrayList<>();
            for (Expense expense : expenses) {
                Map<String, Object> expenseMap = new HashMap<>();
                expenseMap.put("id", expense.getId());
                expenseMap.put("date", expense.getDate());

                if (expense.getExpense() != null) {
                    ExpenseDetails details = expense.getExpense();
                    Map<String, Object> detailsMap = new HashMap<>();
                    detailsMap.put("id", details.getId());
                    detailsMap.put("expenseName", details.getExpenseName());
                    detailsMap.put("amount", details.getAmount());
                    detailsMap.put("type", details.getType());
                    detailsMap.put("paymentMethod", details.getPaymentMethod());
                    detailsMap.put("netAmount", details.getNetAmount());
                    detailsMap.put("comments", details.getComments());
                    detailsMap.put("creditDue", details.getCreditDue());

                    expenseMap.put("details", detailsMap);
                }

                formattedExpenses.add(expenseMap);
            }

            categoryDetails.put("expenses", formattedExpenses);
            categoryDetails.put("totalAmount", categoryTotal);
            categoryDetails.put("expenseCount", expenses.size());


            response.put(category.getName(), categoryDetails);
        }


        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);


        Map<String, Object> dateRangeInfo = new HashMap<>();
        dateRangeInfo.put("fromDate", fromDate);
        dateRangeInfo.put("toDate", toDate);
        dateRangeInfo.put("flowType", flowType);
        summary.put("dateRange", dateRangeInfo);

        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType) {

        // Get filtered expenses for the user
        List<Expense> filteredExpenses = getExpensesWithinRange(userId, fromDate, toDate, flowType);

        // Group expenses by payment method
        Map<String, List<Expense>> paymentMethodExpensesMap = new HashMap<>();
        for (Expense expense : filteredExpenses) {
            if (flowType != null && !flowType.isEmpty()) {
                String expenseType = expense.getExpense().getType();
                if (flowType.equalsIgnoreCase("inflow") && !expenseType.equalsIgnoreCase("gain")) {
                    continue;
                } else if (flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase("loss")) {
                    continue;
                } else if (!flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase(flowType)) {
                    continue;
                }
            }
            String paymentMethod = expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null ? expense.getExpense().getPaymentMethod() : "Unknown";
            paymentMethodExpensesMap.computeIfAbsent(paymentMethod, k -> new ArrayList<>()).add(expense);
        }

        // Remove payment methods with no expenses
        paymentMethodExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        int totalPaymentMethods = paymentMethodExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> paymentMethodTotals = new HashMap<>();

        for (Map.Entry<String, List<Expense>> entry : paymentMethodExpensesMap.entrySet()) {
            String paymentMethod = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            double methodTotal = 0.0;
            List<Map<String, Object>> formattedExpenses = new ArrayList<>();
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    methodTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
                Map<String, Object> expenseMap = new HashMap<>();
                expenseMap.put("id", expense.getId());
                expenseMap.put("date", expense.getDate());
                if (expense.getExpense() != null) {
                    ExpenseDetails details = expense.getExpense();
                    Map<String, Object> detailsMap = new HashMap<>();
                    detailsMap.put("id", details.getId());
                    detailsMap.put("expenseName", details.getExpenseName());
                    detailsMap.put("amount", details.getAmount());
                    detailsMap.put("type", details.getType());
                    detailsMap.put("paymentMethod", details.getPaymentMethod());
                    detailsMap.put("netAmount", details.getNetAmount());
                    detailsMap.put("comments", details.getComments());
                    detailsMap.put("creditDue", details.getCreditDue());
                    expenseMap.put("details", detailsMap);
                }
                formattedExpenses.add(expenseMap);
            }
            paymentMethodTotals.put(paymentMethod, methodTotal);

            // Fetch PaymentMethod entity to get additional details (description, color, icon, etc.)
            PaymentMethod pmEntity = paymentMethodService.getByNameWithService(userId, paymentMethod);
            
            Map<String, Object> methodDetails = new HashMap<>();
            methodDetails.put("id", pmEntity != null ? pmEntity.getId() : null);
            methodDetails.put("name", pmEntity != null ? pmEntity.getName() : paymentMethod);
            methodDetails.put("paymentMethod", paymentMethod);
            methodDetails.put("description", pmEntity != null ? pmEntity.getDescription() : "");
            methodDetails.put("isGlobal", pmEntity != null && pmEntity.isGlobal());
            methodDetails.put("icon", pmEntity != null ? pmEntity.getIcon() : "");
            methodDetails.put("color", pmEntity != null ? pmEntity.getColor() : "");
            methodDetails.put("editUserIds", pmEntity != null && pmEntity.getEditUserIds() != null ? pmEntity.getEditUserIds() : new ArrayList<>());
            methodDetails.put("userIds", pmEntity != null && pmEntity.getUserIds() != null ? pmEntity.getUserIds() : new ArrayList<>());
            methodDetails.put("expenseCount", expenses.size());
            methodDetails.put("totalAmount", methodTotal);
            methodDetails.put("expenses", formattedExpenses);

            response.put(paymentMethod, methodDetails);
        }

        // Add summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaymentMethods", totalPaymentMethods);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("paymentMethodTotals", paymentMethodTotals);

        // Add date range information
        Map<String, Object> dateRangeInfo = new HashMap<>();
        dateRangeInfo.put("fromDate", fromDate);
        dateRangeInfo.put("toDate", toDate);
        dateRangeInfo.put("flowType", flowType);
        summary.put("dateRange", dateRangeInfo);

        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset, String flowType) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case WEEK:
                startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = now.with(DayOfWeek.SUNDAY).plusWeeks(offset);
                break;
            case MONTH:
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case YEAR:
                startDate = LocalDate.of(now.getYear(), 1, 1).plusYears(offset);
                endDate = LocalDate.of(now.getYear(), 12, 31).plusYears(offset);
                break;
            case "custom":
                startDate = now.minusDays(30);
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid rangeType. Valid options are: week, month, year, custom");
        }

        List<Expense> filteredExpenses = getExpensesWithinRange(userId, startDate, endDate, flowType);
        Map<String, List<Expense>> paymentMethodExpensesMap = new HashMap<>();

        for (Expense expense : filteredExpenses) {
            String pmName = (expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null) ? expense.getExpense().getPaymentMethod() : "Unknown";
            paymentMethodExpensesMap.computeIfAbsent(pmName, k -> new ArrayList<>()).add(expense);
        }

        paymentMethodExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());
        Map<String, Object> response = new HashMap<>();

        int totalPaymentMethods = paymentMethodExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> paymentMethodTotals = new HashMap<>();

        for (Map.Entry<String, List<Expense>> entry : paymentMethodExpensesMap.entrySet()) {
            String pmName = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();
            double methodTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    methodTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            paymentMethodTotals.put(pmName, methodTotal);

            // Here, you would fetch the PaymentMethod entity & populate extra info:
            PaymentMethod pmEntity = paymentMethodService.getByNameWithService(userId, pmName);
            Map<String, Object> methodDetails = new HashMap<>();
            methodDetails.put("id", pmEntity != null ? pmEntity.getId() : null);
            methodDetails.put("name", pmEntity != null ? pmEntity.getName() : pmName);
            methodDetails.put("description", pmEntity != null ? pmEntity.getDescription() : "");
            methodDetails.put("isGlobal", pmEntity != null && pmEntity.isGlobal());
            methodDetails.put("icon", pmEntity != null ? pmEntity.getIcon() : "");
            methodDetails.put("color", pmEntity != null ? pmEntity.getColor() : "");
            methodDetails.put("editUserIds", pmEntity != null && pmEntity.getEditUserIds() != null ? pmEntity.getEditUserIds() : new ArrayList<>());
            methodDetails.put("userIds", pmEntity != null && pmEntity.getUserIds() != null ? pmEntity.getUserIds() : new ArrayList<>());
            methodDetails.put("expenseCount", expenses.size());
            methodDetails.put("totalAmount", methodTotal);
            methodDetails.put("expenses", formatExpensesForResponse(expenses));

            response.put(pmName, methodDetails);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaymentMethods", totalPaymentMethods);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("paymentMethodTotals", paymentMethodTotals);
        summary.put("dateRange", Map.of("startDate", startDate, "endDate", endDate, "rangeType", rangeType, "offset", offset, "flowType", flowType != null ? flowType : "all"));
        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getExpensesGroupedByDateWithValidation(Integer userId, int page, int size, String sortBy, String sortOrder) throws Exception {
        // Validate sort fields
        List<String> validSortFields = Arrays.asList("date", "amount", "expenseName", "paymentMethod");
        if (!validSortFields.contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortBy);
        }

        // Validate sort order
        if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("Invalid sort order: " + sortOrder);
        }

        // Validate pagination parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be positive");
        }

        // Get grouped expenses
        Map<String, List<Map<String, Object>>> groupedExpenses = getExpensesGroupedByDateWithPagination(userId, sortOrder, page, size, sortBy);

        if (groupedExpenses.isEmpty()) {
            return Collections.emptyMap();
        }

        // Build response with pagination info
        Map<String, Object> response = new HashMap<>();
        response.put("data", groupedExpenses);
        response.put("page", page);
        response.put("size", size);
        response.put("sortBy", sortBy);
        response.put("sortOrder", sortOrder);

        return response;
    }

























    private Map<String, Object> buildCategoryDetailsMap(Category category, List<Expense> expenses, double categoryTotal) {
        Map<String, Object> categoryDetails = new HashMap<>();
        categoryDetails.put("id", category.getId());
        categoryDetails.put("name", category.getName());
        categoryDetails.put("description", category.getDescription());
        categoryDetails.put("isGlobal", category.isGlobal());


        if (category.getColor() != null) {
            categoryDetails.put("color", category.getColor());
        }
        if (category.getIcon() != null) {
            categoryDetails.put("icon", category.getIcon());
        }


        categoryDetails.put("userIds", category.getUserIds());
        categoryDetails.put("editUserIds", category.getEditUserIds());


        categoryDetails.put("expenseIds", category.getExpenseIds());


        List<Map<String, Object>> formattedExpenses = formatExpensesForResponse(expenses);

        categoryDetails.put("expenses", formattedExpenses);
        categoryDetails.put("totalAmount", categoryTotal);
        categoryDetails.put("expenseCount", expenses.size());

        return categoryDetails;
    }

    private List<Map<String, Object>> formatExpensesForResponse(List<Expense> expenses) {
        List<Map<String, Object>> formattedExpenses = new ArrayList<>();
        for (Expense expense : expenses) {
            Map<String, Object> expenseMap = new HashMap<>();
            expenseMap.put("id", expense.getId());
            expenseMap.put("date", expense.getDate());

            if (expense.getExpense() != null) {
                ExpenseDetails details = expense.getExpense();
                Map<String, Object> detailsMap = new HashMap<>();
                detailsMap.put("id", details.getId());
                detailsMap.put("expenseName", details.getExpenseName());
                detailsMap.put("amount", details.getAmount());
                detailsMap.put("type", details.getType());
                detailsMap.put("paymentMethod", details.getPaymentMethod());
                detailsMap.put("netAmount", details.getNetAmount());
                detailsMap.put("comments", details.getComments());
                detailsMap.put("creditDue", details.getCreditDue());

                expenseMap.put("details", detailsMap);
            }

            formattedExpenses.add(expenseMap);
        }
        return formattedExpenses;
    }




@Override
    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId, String sortOrder, int page, int size, String sortBy) throws Exception {
        Sort sort = Sort.by(Sort.Order.by(sortBy).with(Sort.Direction.fromString(sortOrder)));
        User user = helper.validateUser(userId);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Expense> expensesPage = expenseRepository.findByUserId(userId, pageable);

        Map<String, List<Map<String, Object>>> groupedExpenses = new LinkedHashMap<>();
        Map<String, Integer> dateIndexMap = new LinkedHashMap<>();

        for (Expense expense : expensesPage.getContent()) {
            String date = expense.getDate().toString();

            Map<String, Object> expenseMap = new LinkedHashMap<>();
            expenseMap.put("id", expense.getId());

            int index = dateIndexMap.getOrDefault(date, 0) + 1;
            expenseMap.put("index", index);

            dateIndexMap.put(date, index);

            if (expense.getExpense() != null) {
                expenseMap.put("expenseName", expense.getExpense().getExpenseName());
                expenseMap.put("amount", expense.getExpense().getAmount());
                expenseMap.put("type", expense.getExpense().getType());
                expenseMap.put("comments", expense.getExpense().getComments());
                expenseMap.put("paymentMethod", expense.getExpense().getPaymentMethod());
                expenseMap.put("netAmount", expense.getExpense().getNetAmount());
            } else {
                expenseMap.put("expenseName", "No details available");
                expenseMap.put("amount", 0.0);
                expenseMap.put("type", "N/A");
            }

            groupedExpenses.computeIfAbsent(date, k -> new ArrayList<>()).add(expenseMap);
        }

        Map<String, List<Map<String, Object>>> sortedGroupedExpenses = new LinkedHashMap<>();
        groupedExpenses.entrySet().stream().sorted((entry1, entry2) -> {
            LocalDate date1 = LocalDate.parse(entry1.getKey());
            LocalDate date2 = LocalDate.parse(entry2.getKey());
            return "desc".equalsIgnoreCase(sortOrder) ? date2.compareTo(date1) : date1.compareTo(date2);
        }).forEach(entry -> sortedGroupedExpenses.put(entry.getKey(), entry.getValue()));

        return sortedGroupedExpenses;
    }
}
