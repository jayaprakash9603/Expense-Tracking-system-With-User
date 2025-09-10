package com.jaya.service.expenses.impl;

import com.jaya.exceptions.InvalidLimitException;
import com.jaya.models.CashSummary;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.models.MonthlySummary;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.expenses.ExpenseAnalyticsService;
import com.jaya.service.expenses.ExpenseCoreService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseAnalyticsServiceImpl implements ExpenseAnalyticsService {

    private static final String LABELS = "labels";
    private static final String LABEL = "label";
    private static final String DATA_SETS = "datasets";
    // Constants
    private static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    private static final String CREDIT_PAID = "creditPaid";
    private static final String CASH = "cash";
    private static final String GAIN = "gain";
    private static final String INCOME = "income";
    private static final String LOSS = "loss";
    private static final String EXPENSE = "expense";
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final String[] MONTH_NAMES = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
    };
    private static final String[] MONTH_LABELS = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    private final ExpenseRepository expenseRepository;


    public ExpenseAnalyticsServiceImpl(ExpenseRepository expenseRepository, ExpenseCoreService expenseCoreService) {
        this.expenseRepository = expenseRepository;
        this.expenseCoreService = expenseCoreService;
    }

    private ExpenseCoreService expenseCoreService;



    @Override
    public MonthlySummary getMonthlySummary(Integer year, Integer month, Integer userId) {
        DatePeriod creditDuePeriod = getCreditDuePeriod(year, month);
        DatePeriod monthPeriod = getMonthPeriod(year, month);

        List<Expense> creditDueExpenses = getExpensesForPeriod(userId, creditDuePeriod);
        List<Expense> generalExpenses = getExpensesForPeriod(userId, monthPeriod);

        CreditCalculationResult creditResult = calculateCreditAmounts(creditDueExpenses);
        ExpenseCalculationResult expenseResult = calculateExpenseAmounts(generalExpenses);

        MonthlySummary summary = buildMonthlySummary(expenseResult, creditResult);
        summary.setCreditDueMessage(formatCreditDueMessage(creditDuePeriod));

        return summary;
    }

    @Override
    public Map<String, MonthlySummary> getYearlySummary(Integer year, Integer userId) {
        Map<String, MonthlySummary> yearlySummary = new LinkedHashMap<>();

        for (int month = 1; month <= 12; month++) {
            MonthlySummary monthlySummary = getMonthlySummary(year, month, userId);
            if (hasRelevantData(monthlySummary)) {
                yearlySummary.put(MONTH_NAMES[month - 1], monthlySummary);
            }
        }

        return yearlySummary;
    }

    @Override
    public List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth,
                                                       Integer endYear, Integer endMonth, Integer userId) {
        List<MonthlySummary> summaries = new ArrayList<>();
        LocalDate currentDate = LocalDate.of(startYear, startMonth, 1);
        LocalDate endDate = LocalDate.of(endYear, endMonth, 1)
                .withDayOfMonth(LocalDate.of(endYear, endMonth, 1).lengthOfMonth());

        while (!currentDate.isAfter(endDate)) {
            MonthlySummary summary = getMonthlySummary(currentDate.getYear(), currentDate.getMonthValue(), userId);
            summaries.add(summary);
            currentDate = currentDate.plusMonths(1);
        }

        return summaries;
    }

    @Override
    public Map<String, Object> generateExpenseSummary(Integer userId) {
        List<Expense> expenses = expenseCoreService.getAllExpenses(userId);
        DatePeriod currentPeriod = getCurrentCreditPeriod();

        ExpenseSummaryCalculator calculator = new ExpenseSummaryCalculator();

        for (Expense expense : expenses) {
            calculator.processExpense(expense, currentPeriod);
        }

        List<Expense> lastFiveExpenses = getLastNExpenses(expenses, 5);

        return calculator.buildSummaryResponse(lastFiveExpenses);
    }

    @Override
    public Map<String, Double> getTotalByDate(Integer userId) {
        List<Object[]> results = expenseRepository.findTotalExpensesGroupedByDate(userId);
        return convertToDateTotalMap(results);
    }

    @Override
    public Double getTotalForToday(Integer userId) {
        LocalDate today = LocalDate.now();
        return expenseRepository.findTotalExpensesForToday(today, userId);
    }

    @Override
    public Double getTotalForCurrentMonth(Integer userId) {
        LocalDate today = LocalDate.now();
        return expenseRepository.findTotalExpensesForCurrentMonth(
                today.getMonthValue(), today.getYear(), userId);
    }

    @Override
    public Double getTotalForMonthAndYear(int month, int year, Integer userId) {
        return expenseRepository.getTotalByMonthAndYear(month, year, userId);
    }

    @Override
    public Double getTotalByDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {
        return expenseRepository.getTotalByDateRange(startDate, endDate, userId);
    }

    @Override
    public Double getTotalExpenseByName(String expenseName) {
        return expenseRepository.getTotalExpenseByName(expenseName.trim());
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForCurrentMonth(Integer userId) {
        LocalDate now = LocalDate.now();
        List<Object[]> results = expenseRepository.findTotalByPaymentMethodForCurrentMonth(
                now.getMonthValue(), now.getYear(), userId);
        return convertToPaymentMethodMap(results);
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForLastMonth(Integer userId) {
        DatePeriod lastMonth = getLastMonthPeriod();
        List<Object[]> results = expenseRepository.findTotalByPaymentMethodForLastMonth(
                lastMonth.getStartDate().getMonthValue(), lastMonth.getStartDate().getYear(), userId);
        return convertToPaymentMethodMap(results);
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {
        List<Object[]> results = expenseRepository.findTotalByPaymentMethodBetweenDates(startDate, endDate, userId);
        return convertToPaymentMethodMap(results);
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForMonth(int month, int year, Integer userId) {
        List<Object[]> results = expenseRepository.findTotalByPaymentMethodForMonth(month, year, userId);
        return convertToPaymentMethodMap(results);
    }

    @Override
    public Map<String, Map<String, Double>> getPaymentMethodSummary(Integer userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        Map<String, Map<String, Double>> paymentMethodSummary = new HashMap<>();

        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            String paymentMethod = details.getPaymentMethod();
            String expenseType = details.getType();
            double amount = details.getAmount();

            Map<String, Double> methodSummary = paymentMethodSummary.computeIfAbsent(paymentMethod, k -> new HashMap<>());
            String key = createPaymentMethodKey(paymentMethod, expenseType);
            methodSummary.merge(key, amount, Double::sum);
        }

        return paymentMethodSummary;
    }

    @Override
    public Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod(Integer userId) {
        List<Object[]> results = expenseRepository.findTotalExpensesGroupedByCategoryAndPaymentMethod(userId);
        return processGroupedExpenseResults(results);
    }

    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year, Integer userId) {
        List<Object[]> results = expenseRepository.findTotalByExpenseNameAndPaymentMethodForMonth(month, year, userId);
        return processExpenseNamePaymentMethodResults(results);
    }

    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(
            LocalDate startDate, LocalDate endDate, Integer userId) {
        List<Object[]> results = expenseRepository.findTotalByExpenseNameAndPaymentMethodForDateRange(
                startDate, endDate, userId);
        return processExpenseNamePaymentMethodResults(results);
    }

    @Override
    public Map<String, Object> getMonthlySpendingInsights(int year, int month, Integer userId) {
        DatePeriod period = new DatePeriod(
                LocalDate.of(year, Month.of(month), 1),
                LocalDate.of(year, Month.of(month), 1).withDayOfMonth(LocalDate.of(year, Month.of(month), 1).lengthOfMonth())
        );

        List<Expense> expenses = getExpensesForPeriod(userId, period);
        Map<String, Double> categoryWiseSpending = calculateCategoryWiseSpending(expenses);

        double averageDailyExpenses = calculateAverageDailyExpenses(categoryWiseSpending, period);

        Map<String, Object> insights = new HashMap<>();
        insights.put("totalExpenses", categoryWiseSpending.get(LOSS));
        insights.put("averageDailyExpenses", averageDailyExpenses);
        insights.put("categoryWiseSpending", categoryWiseSpending);

        return insights;
    }

    @Override
    public Map<String, Object> getExpenseNameOverTime(Integer userId, int year, int limit) throws Exception {
        validateYearAndLimit(year, limit);

        List<Expense> expenses = expenseRepository.findByYearAndUser(year, userId);
        ExpenseTimeAnalyzer analyzer = new ExpenseTimeAnalyzer();

        return analyzer.analyzeExpensesOverTime(expenses, limit);
    }

    @Override
    public Map<String, Object> getPaymentMethodDistribution(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findPaymentMethodDistributionByUserId(year, userId);
        return createDistributionChart(results);
    }

    @Override
    public Map<String, Object> getMonthlyExpenses(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findMonthlyLossExpensesByUserId(year, userId);
        Double[] data = processMonthlyData(results);

        return createSingleDatasetChart("Expenses ($)", MONTH_LABELS, data);
    }

    @Override
    public Map<String, Object> getExpenseByName(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findExpenseByNameAndUserId(year, userId);
        return createTopExpensesChart(results, 5);
    }

    @Override
    public Map<String, Object> getExpenseTrend(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findMonthlyLossExpensesByUserId(year, userId);
        Double[] data = processMonthlyData(results);

        return createSingleDatasetChart("Expense Trend ($)", MONTH_LABELS, data);
    }

    @Override
    public Map<String, Object> getCumulativeExpenses(Integer userId, int year) throws Exception {
        validateYear(year);

        List<Expense> expenses = expenseRepository.findExpensesWithDetailsByUserIdAndYear(year, userId);
        CumulativeExpenseCalculator calculator = new CumulativeExpenseCalculator();

        return calculator.calculateCumulativeExpenses(expenses);
    }

    @Override
    public List<Map<String, Object>> getExpenseDistributionCurrentMonth(Integer userId) {
        DatePeriod currentMonth = getCurrentMonthPeriod();
        List<Expense> expenses = getExpensesForPeriod(userId, currentMonth);

        return expenses.stream()
                .filter(e -> e.getExpense() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getExpense().getExpenseName(),
                        Collectors.summingDouble(e -> e.getExpense().getAmount())
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .map(this::createNameValueMap)
                .toList();
    }

    @Override
    public List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(Integer userId) {
        DatePeriod currentMonth = getCurrentMonthPeriod();
        List<Expense> expenses = getExpensesForPeriod(userId, currentMonth);

        double totalSpending = calculateTotalSpending(expenses);
        double totalIncome = calculateTotalIncome(expenses);

        List<Map<String, Object>> response = new ArrayList<>();
        response.add(createNameValueMap("Spending", totalSpending));
        response.add(createNameValueMap("Income", totalIncome));

        return response;
    }

    @Override
    public List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId) {
        DatePeriod currentMonth = getCurrentMonthPeriod();
        List<Expense> expenses = getExpensesForPeriod(userId, currentMonth);

        Map<LocalDate, Double> dailySpending = calculateDailySpending(expenses);

        return generateDailySpendingResponse(currentMonth, dailySpending);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId, String type) {
        DatePeriod currentMonth = getCurrentMonthPeriod();
        List<Expense> expenses = getExpensesForPeriod(userId, currentMonth);

        Map<LocalDate, Double> dailySpending = calculateDailySpendingByType(expenses, type);

        return generateDailySpendingResponse(currentMonth, dailySpending);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year) {
        DatePeriod monthPeriod = getMonthPeriod(year, month);
        List<Expense> expenses = getExpensesForPeriod(userId, monthPeriod);

        Map<LocalDate, Double> dailySpending = calculateDailySpending(expenses);

        return generateDailySpendingResponse(monthPeriod, dailySpending);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year, String type) {
        DatePeriod monthPeriod = getMonthPeriod(year, month);
        List<Expense> expenses = getExpensesForPeriod(userId, monthPeriod);

        Map<LocalDate, Double> dailySpending = calculateDailySpendingByType(expenses, type);

        return generateDailySpendingResponse(monthPeriod, dailySpending);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate) {
        DatePeriod dateRangePeriod = new DatePeriod(fromDate, toDate);
        List<Expense> expenses = getExpensesForPeriod(userId, dateRangePeriod);

        Map<LocalDate, Double> dailySpending = calculateDailySpending(expenses);

        return generateDailySpendingResponse(dateRangePeriod, dailySpending);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String type) {
        DatePeriod dateRangePeriod = new DatePeriod(fromDate, toDate);
        List<Expense> expenses = getExpensesForPeriod(userId, dateRangePeriod);

        Map<LocalDate, Double> dailySpending = calculateDailySpendingByType(expenses, type);

        return generateDailySpendingResponse(dateRangePeriod, dailySpending);
    }

    // Helper Classes and Methods

    private static class DatePeriod {
        private final LocalDate startDate;
        private final LocalDate endDate;

        public DatePeriod(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
    }

    private static class CreditCalculationResult {
        private final BigDecimal creditDue;
        private final BigDecimal currentMonthCreditDue;

        public CreditCalculationResult(BigDecimal creditDue, BigDecimal currentMonthCreditDue) {
            this.creditDue = creditDue;
            this.currentMonthCreditDue = currentMonthCreditDue;
        }

        public BigDecimal getCreditDue() { return creditDue; }
        public BigDecimal getCurrentMonthCreditDue() { return currentMonthCreditDue; }
    }

    private static class ExpenseCalculationResult {
        private final BigDecimal totalGain;
        private final BigDecimal totalLoss;
        private final BigDecimal totalCreditPaid;
        private final Map<String, BigDecimal> categoryBreakdown;
        private final CashSummary cashSummary;

        public ExpenseCalculationResult(BigDecimal totalGain, BigDecimal totalLoss, BigDecimal totalCreditPaid,
                                        Map<String, BigDecimal> categoryBreakdown, CashSummary cashSummary) {
            this.totalGain = totalGain;
            this.totalLoss = totalLoss;
            this.totalCreditPaid = totalCreditPaid;
            this.categoryBreakdown = categoryBreakdown;
            this.cashSummary = cashSummary;
        }

        public BigDecimal getTotalGain() { return totalGain; }
        public BigDecimal getTotalLoss() { return totalLoss; }
        public BigDecimal getTotalCreditPaid() { return totalCreditPaid; }
        public Map<String, BigDecimal> getCategoryBreakdown() { return categoryBreakdown; }
        public CashSummary getCashSummary() { return cashSummary; }
    }



    private class ExpenseSummaryCalculator {
        private double totalGains = 0.0;
        private double totalLosses = 0.0;
        private double totalCreditDue = 0.0;
        private double totalCreditPaid = 0.0;
        private double todayExpenses = 0.0;
        private double currentMonthLosses = 0.0;
        private final Map<String, Double> lossesByPaymentMethod = new HashMap<>();
        private final LocalDate today = LocalDate.now();
        private double creditPaidLastMonth = 0.0;

        private double lastMonthLosses = 0.0;
        private double lastMonthCreditDue = 0.0;
        private double lastMonthRemainingBudget = 0.0;
        private double lastMonthCreditPaidAmount = 0.0;

        // New fields for credit card bill payment tracking
        private double lastCreditBillPaidAmount = 0.0;
        private LocalDate lastCreditBillPaidDate = null;
        private double previousCreditBillPaidAmount = 0.0;
        private LocalDate previousCreditBillPaidDate = null;
        private double currentMonthBillPaid = 0.0; // New field for current month bill paid

        public void processExpense(Expense expense, DatePeriod currentPeriod) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) return;

            LocalDate date = expense.getDate();
            if (date == null) return;

            String type = details.getType();
            String paymentMethod = details.getPaymentMethod();
            double amount = details.getAmount();

            processGainExpense(type, paymentMethod, amount);
            processLossExpense(type, paymentMethod, amount, date, currentPeriod);
            processTodayExpense(type, amount, date);
            processCreditExpense(paymentMethod, amount);
            processCreditPaidLastMonth(paymentMethod, amount, date);
            processLastMonthComparison(type, paymentMethod, amount, date);
            processCreditBillPayments(paymentMethod, amount, date); // Updated method
        }

        private void processGainExpense(String type, String paymentMethod, double amount) {
            if (GAIN.equalsIgnoreCase(type) && CASH.equals(paymentMethod)) {
                totalGains += amount;
            }
        }

        private void processLossExpense(String type, String paymentMethod, double amount,
                                        LocalDate date, DatePeriod currentPeriod) {
            if (LOSS.equalsIgnoreCase(type) && CASH.equalsIgnoreCase(paymentMethod)) {
                totalLosses += amount;
                lossesByPaymentMethod.merge(paymentMethod.toLowerCase(), amount, Double::sum);

                if (isDateInPeriod(date, currentPeriod)) {
                    currentMonthLosses += amount;
                }
            }
        }

        private boolean isDateInPeriod(LocalDate date, DatePeriod period) {
            return !date.isBefore(period.getStartDate()) && !date.isAfter(period.getEndDate());
        }

        private void processTodayExpense(String type, double amount, LocalDate date) {
            if (date.isEqual(today) && LOSS.equalsIgnoreCase(type)) {
                todayExpenses += amount;
            }
        }

        private void processCreditExpense(String paymentMethod, double amount) {
            if (CREDIT_NEED_TO_PAID.equalsIgnoreCase(paymentMethod)) {
                totalCreditDue += amount;
            } else if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                totalCreditDue -= amount;
                totalCreditPaid += amount;
            }
        }

        private void processCreditPaidLastMonth(String paymentMethod, double amount, LocalDate date) {
            if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                DatePeriod lastMonthCreditPeriod = getLastMonthCreditPeriod();
                if (isDateInPeriod(date, lastMonthCreditPeriod)) {
                    creditPaidLastMonth += amount;
                }
            }
        }

        // Updated method to track credit bill payments for comparison
        private void processCreditBillPayments(String paymentMethod, double amount, LocalDate date) {
            if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                DatePeriod lastMonthCreditPeriod = getLastMonthCreditPeriod();
                DatePeriod currentMonthBillPeriod = getCurrentMonthBillPeriod();

                // Check if this payment is within the current month bill period (17th to 5th next month)
                if (isDateInPeriod(date, currentMonthBillPeriod)) {
                    currentMonthBillPaid += amount;
                    // Update last credit bill payment if this is more recent or first one found
                    if (lastCreditBillPaidDate == null || date.isAfter(lastCreditBillPaidDate)) {
                        lastCreditBillPaidAmount = amount;
                        lastCreditBillPaidDate = date;
                    }
                } else if (isDateInPeriod(date, lastMonthCreditPeriod)) {
                    // This is a payment within the last month credit period (17th to 16th)
                    // Update last credit bill payment if this is more recent or first one found
                    if (lastCreditBillPaidDate == null || date.isAfter(lastCreditBillPaidDate)) {
                        lastCreditBillPaidAmount = amount;
                        lastCreditBillPaidDate = date;
                    }
                } else if (date.isBefore(lastMonthCreditPeriod.getStartDate())) {
                    // This is a payment before the last month credit period
                    // Update previous credit bill payment if this is more recent or first one found
                    if (previousCreditBillPaidDate == null || date.isAfter(previousCreditBillPaidDate)) {
                        previousCreditBillPaidAmount = amount;
                        previousCreditBillPaidDate = date;
                    }
                }
            }
        }

        private DatePeriod getLastMonthCreditPeriod() {
            LocalDate today = LocalDate.now();
            // Calculate from 17th of previous month to 16th of current month
            LocalDate startDate = today.minusMonths(1).withDayOfMonth(17);
            LocalDate endDate = today.withDayOfMonth(16);
            return new DatePeriod(startDate, endDate);
        }

        // New method to get current month bill payment period (17th to 5th next month)
        private DatePeriod getCurrentMonthBillPeriod() {
            LocalDate today = LocalDate.now();
            LocalDate startDate = today.withDayOfMonth(17);
            LocalDate endDate = today.plusMonths(1).withDayOfMonth(5);
            return new DatePeriod(startDate, endDate);
        }

        private void processLastMonthComparison(String type, String paymentMethod, double amount, LocalDate date) {
            DatePeriod lastMonthPeriod = getLastMonthPeriod();

            if (isDateInPeriod(date, lastMonthPeriod)) {
                // Last month losses (for currentMonthLosses comparison)
                if (LOSS.equalsIgnoreCase(type) && CASH.equalsIgnoreCase(paymentMethod)) {
                    lastMonthLosses += amount;
                }

                // Last month credit calculations
                if (CREDIT_NEED_TO_PAID.equalsIgnoreCase(paymentMethod)) {
                    lastMonthCreditDue += amount;
                } else if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                    lastMonthCreditDue -= amount;
                    lastMonthCreditPaidAmount += amount;
                }

                // Calculate last month remaining budget
                if (GAIN.equalsIgnoreCase(type) && CASH.equals(paymentMethod)) {
                    lastMonthRemainingBudget += amount;
                } else if (LOSS.equalsIgnoreCase(type) && CASH.equalsIgnoreCase(paymentMethod)) {
                    lastMonthRemainingBudget -= amount;
                } else if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                    lastMonthRemainingBudget -= amount;
                }
            }
        }

        private DatePeriod getLastMonthPeriod() {
            LocalDate now = LocalDate.now();
            int lastMonth = now.getMonthValue() - 1;
            int lastYear = now.getYear();

            if (lastMonth == 0) {
                lastMonth = 12;
                lastYear -= 1;
            }

            LocalDate startDate = LocalDate.of(lastYear, lastMonth, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            return new DatePeriod(startDate, endDate);
        }

        private Map<String, Object> calculateComparison(String label, double currentValue, double lastMonthValue) {
            Map<String, Object> comparison = new HashMap<>();

            // Convert values to positive for proper comparison
            double currentForComparison = currentValue;
            double lastMonthForComparison = lastMonthValue;

            if ("totalCreditDue".equals(label) || "remainingBudget".equals(label)) {
                currentForComparison = Math.abs(currentValue);
                lastMonthForComparison = Math.abs(lastMonthValue);
            }

            comparison.put("current", currentValue); // Keep original values in response
            comparison.put("lastMonth", lastMonthValue);

            if (lastMonthForComparison == 0.0) {
                if (currentForComparison > 0) {
                    comparison.put("percentageChange", "100% increase");
                    comparison.put("trend", "increase");
                } else {
                    comparison.put("percentageChange", "No change");
                    comparison.put("trend", "stable");
                }
            } else {
                double percentageChange = ((currentForComparison - lastMonthForComparison) / lastMonthForComparison) * 100;
                String trend;
                String changeText;

                if (percentageChange > 0) {
                    trend = "increase";
                    changeText = String.format("%.1f%% more than last month", percentageChange);
                } else if (percentageChange < 0) {
                    trend = "decrease";
                    changeText = String.format("%.1f%% less than last month", Math.abs(percentageChange));
                } else {
                    trend = "stable";
                    changeText = "Same as last month";
                }

                comparison.put("percentageChange", changeText);
                comparison.put("trend", trend);
                comparison.put("rawPercentage", Math.round(percentageChange * 100.0) / 100.0);
            }

            return comparison;
        }

        // Updated method to calculate credit bill payment comparison
        private Map<String, Object> calculateCreditBillComparison() {
            Map<String, Object> comparison = new HashMap<>();

            comparison.put("lastCreditBillPaid", lastCreditBillPaidAmount);
            comparison.put("lastCreditBillPaidDate", lastCreditBillPaidDate != null ? lastCreditBillPaidDate.toString() : null);
            comparison.put("previousCreditBillPaid", previousCreditBillPaidAmount);
            comparison.put("previousCreditBillPaidDate", previousCreditBillPaidDate != null ? previousCreditBillPaidDate.toString() : null);
            comparison.put("currentMonthBillPaid", currentMonthBillPaid); // New field

            if (previousCreditBillPaidAmount == 0.0) {
                if (lastCreditBillPaidAmount > 0) {
                    comparison.put("percentageChange", "First credit bill payment recorded");
                    comparison.put("trend", "new");
                    comparison.put("rawPercentage", 0.0);
                } else {
                    comparison.put("percentageChange", "No credit bill payments found");
                    comparison.put("trend", "none");
                    comparison.put("rawPercentage", 0.0);
                }
            } else {
                double percentageChange = ((lastCreditBillPaidAmount - previousCreditBillPaidAmount) / previousCreditBillPaidAmount) * 100;
                String trend;
                String changeText;

                if (percentageChange > 0) {
                    trend = "increase";
                    changeText = String.format("%.1f%% more than previous payment", percentageChange);
                } else if (percentageChange < 0) {
                    trend = "decrease";
                    changeText = String.format("%.1f%% less than previous payment", Math.abs(percentageChange));
                } else {
                    trend = "stable";
                    changeText = "Same as previous payment";
                }

                comparison.put("percentageChange", changeText);
                comparison.put("trend", trend);
                comparison.put("rawPercentage", Math.round(percentageChange * 100.0) / 100.0);
            }

            return comparison;
        }

        public Map<String, Object> buildSummaryResponse(List<Expense> lastFiveExpenses) {
            double remainingBudget = totalGains - totalLosses - totalCreditPaid;

            Map<String, Object> response = new HashMap<>();
            response.put("totalGains", totalGains);
            response.put("totalLosses", totalLosses);
            response.put("totalCreditDue", totalCreditDue);
            response.put("totalCreditPaid", totalCreditPaid);
            response.put("lossesByPaymentMethod", lossesByPaymentMethod);
            response.put("lastFiveExpenses", lastFiveExpenses);
            response.put("todayExpenses", todayExpenses);
            response.put("remainingBudget", remainingBudget);
            response.put("currentMonthLosses", currentMonthLosses);
            response.put("creditPaidLastMonth", creditPaidLastMonth);

            // Last month values for specific fields
            response.put("lastMonthLosses", lastMonthLosses);
            response.put("lastMonthCreditDue", lastMonthCreditDue);
            response.put("lastMonthRemainingBudget", lastMonthRemainingBudget);
            response.put("lastMonthCreditPaidAmount", lastMonthCreditPaidAmount);

            // Credit bill payment tracking
            response.put("lastCreditBillPaidAmount", lastCreditBillPaidAmount);
            response.put("lastCreditBillPaidDate", lastCreditBillPaidDate != null ? lastCreditBillPaidDate.toString() : null);
            response.put("previousCreditBillPaidAmount", previousCreditBillPaidAmount);
            response.put("previousCreditBillPaidDate", previousCreditBillPaidDate != null ? previousCreditBillPaidDate.toString() : null);
            response.put("currentMonthBillPaid", currentMonthBillPaid); // New field

            // Comparisons with percentage changes for specific fields only
            response.put("currentMonthLossesComparison", calculateComparison("currentMonthLosses", currentMonthLosses, lastMonthLosses));
            response.put("creditPaidLastMonthComparison", calculateComparison("creditPaidLastMonth", creditPaidLastMonth, lastMonthCreditPaidAmount));
            response.put("totalCreditDueComparison", calculateComparison("totalCreditDue", totalCreditDue, lastMonthCreditDue));
            response.put("remainingBudgetComparison", calculateComparison("remainingBudget", remainingBudget, lastMonthRemainingBudget));

            // Credit bill payment comparison
            response.put("creditBillPaymentComparison", calculateCreditBillComparison());

            return response;
        }
    }

    private class ExpenseTimeAnalyzer {
        public Map<String, Object> analyzeExpensesOverTime(List<Expense> expenses, int limit) {
            Map<String, Map<Integer, Double>> monthlySums = new HashMap<>();
            Map<String, Double> totalPerExpense = new HashMap<>();

            processExpensesForTimeAnalysis(expenses, monthlySums, totalPerExpense);
            List<String> topExpenseNames = getTopExpenseNames(totalPerExpense, limit);

            return buildTimeAnalysisResponse(monthlySums, topExpenseNames);
        }

        private void processExpensesForTimeAnalysis(List<Expense> expenses,
                                                    Map<String, Map<Integer, Double>> monthlySums,
                                                    Map<String, Double> totalPerExpense) {
            for (Expense expense : expenses) {
                ExpenseDetails details = expense.getExpense();
                if (expense.getExpense() == null || expense.getDate() == null || details.getExpenseName().toLowerCase().contains("given")) continue;

                String expenseName = details.getExpenseName();


                int month = expense.getDate().getMonthValue();
                double amount = details.getAmount();

                monthlySums.computeIfAbsent(expenseName, k -> new HashMap<>()).merge(month, amount, Double::sum);
                totalPerExpense.merge(expenseName, amount, Double::sum);
            }
        }

        private List<String> getTopExpenseNames(Map<String, Double> totalPerExpense, int limit) {
            return totalPerExpense.entrySet().stream()
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .limit(limit)
                    .map(Map.Entry::getKey)
                    .toList();
        }

        private Map<String, Object> buildTimeAnalysisResponse(Map<String, Map<Integer, Double>> monthlySums,
                                                              List<String> topExpenseNames) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put(LABELS, MONTH_LABELS);

            List<Map<String, Object>> datasets = new ArrayList<>();
            for (String name : topExpenseNames) {
                List<Double> data = new ArrayList<>(Collections.nCopies(12, 0.0));
                Map<Integer, Double> monthData = monthlySums.getOrDefault(name, new HashMap<>());

                for (Map.Entry<Integer, Double> entry : monthData.entrySet()) {
                    data.set(entry.getKey() - 1, entry.getValue());
                }

                datasets.add(Map.of(LABEL, name, "data", data));
            }

            response.put(DATA_SETS, datasets);
            return response;
        }
    }

    private class CumulativeExpenseCalculator {
        public Map<String, Object> calculateCumulativeExpenses(List<Expense> expenses) {
            Map<Month, Double> monthlyTotals = calculateMonthlyTotals(expenses);
            List<Double> cumulativeData = calculateCumulativeData(monthlyTotals);
            Double[] data = mapCumulativeDataToArray(monthlyTotals, cumulativeData);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put(LABELS, MONTH_LABELS);
            response.put(DATA_SETS, List.of(Map.of(LABEL, "Cumulative Expenses ($)", "data", data)));

            return response;
        }

        private Map<Month, Double> calculateMonthlyTotals(List<Expense> expenses) {
            Map<Month, Double> monthlyTotals = new TreeMap<>();

            for (Expense expense : expenses) {
                ExpenseDetails details = expense.getExpense();
                if (details == null) continue;

                Month month = expense.getDate().getMonth();
                double amount = details.getAmount();
                monthlyTotals.merge(month, amount, Double::sum);
            }

            return monthlyTotals;
        }

        private List<Double> calculateCumulativeData(Map<Month, Double> monthlyTotals) {
            List<Double> cumulativeData = new ArrayList<>();
            double cumulativeSum = 0.0;

            for (Double monthlyTotal : monthlyTotals.values()) {
                cumulativeSum += monthlyTotal;
                cumulativeData.add(cumulativeSum);
            }

            return cumulativeData;
        }

        private Double[] mapCumulativeDataToArray(Map<Month, Double> monthlyTotals, List<Double> cumulativeData) {
            Double[] data = new Double[12];
            Arrays.fill(data, 0.0);

            Map<Month, Integer> monthToIndex = createMonthToIndexMap();

            int dataIndex = 0;
            for (Month month : monthlyTotals.keySet()) {
                Integer index = monthToIndex.get(month);
                if (index != null && dataIndex < cumulativeData.size()) {
                    data[index] = cumulativeData.get(dataIndex);
                    dataIndex++;
                }
            }

            fillRemainingMonths(data, cumulativeData);
            return data;
        }

        private Map<Month, Integer> createMonthToIndexMap() {
            Map<Month, Integer> monthToIndex = new EnumMap<>(Month.class);
            Month[] months = Month.values();
            for (int i = 0; i < months.length; i++) {
                monthToIndex.put(months[i], i);
            }
            return monthToIndex;
        }

        private void fillRemainingMonths(Double[] data, List<Double> cumulativeData) {
            if (!cumulativeData.isEmpty()) {
                double lastCumulative = cumulativeData.get(cumulativeData.size() - 1);
                for (int i = 0; i < data.length; i++) {
                    if (data[i] == 0.0) {
                        data[i] = lastCumulative;
                    }
                }
            }
        }
    }

    // Core calculation methods

    private List<Expense> getExpensesForPeriod(Integer userId, DatePeriod period) {
        return expenseRepository.findByUserIdAndDateBetween(userId, period.getStartDate(), period.getEndDate());
    }

    private CreditCalculationResult calculateCreditAmounts(List<Expense> creditDueExpenses) {
        BigDecimal creditDue = BigDecimal.ZERO;
        BigDecimal currentMonthCreditDue = BigDecimal.ZERO;

        for (Expense expense : creditDueExpenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            BigDecimal amount = BigDecimal.valueOf(details.getAmount());
            String paymentMethod = details.getPaymentMethod();

            if (CREDIT_NEED_TO_PAID.equalsIgnoreCase(paymentMethod)) {
                creditDue = creditDue.add(amount);
                currentMonthCreditDue = currentMonthCreditDue.add(amount);
            } else if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
                currentMonthCreditDue = currentMonthCreditDue.subtract(amount);
            }
        }

        return new CreditCalculationResult(creditDue, currentMonthCreditDue);
    }

    private ExpenseCalculationResult calculateExpenseAmounts(List<Expense> generalExpenses) {
        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        BigDecimal totalCreditPaid = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        CashSummary cashSummary = new CashSummary();

        for (Expense expense : generalExpenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            String category = details.getType();
            String paymentMethod = details.getPaymentMethod();
            BigDecimal amount = BigDecimal.valueOf(details.getAmount());

            if (isGainCategory(category)) {
                totalGain = totalGain.add(amount);
                updateCashSummaryForGain(cashSummary, paymentMethod, amount);
                categoryBreakdown.merge(category, amount, BigDecimal::add);
            } else if (isLossCategory(category)) {
                BigDecimal negativeAmount = amount.negate();
                totalLoss = totalLoss.add(negativeAmount);
                updateCashSummaryForLoss(cashSummary, paymentMethod, negativeAmount);
                updateCreditPaid(totalCreditPaid, paymentMethod, amount);
                categoryBreakdown.merge(category, negativeAmount, BigDecimal::add);
            }
        }

        cashSummary.calculateDifference();
        return new ExpenseCalculationResult(totalGain, totalLoss, totalCreditPaid, categoryBreakdown, cashSummary);
    }

    private MonthlySummary buildMonthlySummary(ExpenseCalculationResult expenseResult, CreditCalculationResult creditResult) {
        BigDecimal balanceRemaining = expenseResult.getTotalGain()
                .subtract(expenseResult.getTotalLoss())
                .setScale(SCALE, ROUNDING_MODE);

        MonthlySummary summary = new MonthlySummary();
        summary.setTotalAmount(expenseResult.getTotalGain().add(expenseResult.getTotalLoss()).setScale(SCALE, ROUNDING_MODE));
        summary.setCategoryBreakdown(expenseResult.getCategoryBreakdown());
        summary.setBalanceRemaining(balanceRemaining);
        summary.setCurrentMonthCreditDue(creditResult.getCurrentMonthCreditDue().setScale(SCALE, ROUNDING_MODE));
        summary.setCash(expenseResult.getCashSummary());
        summary.setCreditPaid(expenseResult.getTotalCreditPaid().setScale(SCALE, ROUNDING_MODE));
        summary.setCreditDue(creditResult.getCreditDue().setScale(SCALE, ROUNDING_MODE));

        return summary;
    }

    // Utility methods

    private boolean isGainCategory(String category) {
        return GAIN.equalsIgnoreCase(category) || INCOME.equalsIgnoreCase(category);
    }

    private boolean isLossCategory(String category) {
        return LOSS.equalsIgnoreCase(category) || EXPENSE.equalsIgnoreCase(category);
    }

    private void updateCashSummaryForGain(CashSummary cashSummary, String paymentMethod, BigDecimal amount) {
        if (CASH.equalsIgnoreCase(paymentMethod)) {
            cashSummary.setGain(cashSummary.getGain().add(amount));
        }
    }

    private void updateCashSummaryForLoss(CashSummary cashSummary, String paymentMethod, BigDecimal negativeAmount) {
        if (CASH.equalsIgnoreCase(paymentMethod)) {
            cashSummary.setLoss(cashSummary.getLoss().add(negativeAmount));
        }
    }

    private BigDecimal updateCreditPaid(BigDecimal totalCreditPaid, String paymentMethod, BigDecimal amount) {
        if (CREDIT_PAID.equalsIgnoreCase(paymentMethod)) {
            return totalCreditPaid.add(amount);
        }
        return totalCreditPaid;
    }

    private DatePeriod getCreditDuePeriod(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1).minusMonths(1).withDayOfMonth(17);
        LocalDate endDate = LocalDate.of(year, month, 1).withDayOfMonth(16);
        return new DatePeriod(startDate, endDate);
    }

    private DatePeriod getMonthPeriod(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return new DatePeriod(startDate, endDate);
    }

    private DatePeriod getCurrentMonthPeriod() {
        YearMonth currentMonth = YearMonth.now();
        return new DatePeriod(currentMonth.atDay(1), currentMonth.atEndOfMonth());
    }

    private DatePeriod getCurrentCreditPeriod() {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusMonths(1).withDayOfMonth(17);
        LocalDate endDate = today.withDayOfMonth(16);
        return new DatePeriod(startDate, endDate);
    }

    private DatePeriod getLastMonthPeriod() {
        LocalDate now = LocalDate.now();
        int lastMonth = now.getMonthValue() - 1;
        int lastYear = now.getYear();

        if (lastMonth == 0) {
            lastMonth = 12;
            lastYear -= 1;
        }

        LocalDate startDate = LocalDate.of(lastYear, lastMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return new DatePeriod(startDate, endDate);
    }

    private String formatCreditDueMessage(DatePeriod creditDuePeriod) {
        String startDate = creditDuePeriod.getStartDate().format(DATE_FORMATTER);
        String endDate = creditDuePeriod.getEndDate().format(DATE_FORMATTER);
        return "Credit Due is calculated from " + startDate + " to " + endDate;
    }

    private boolean hasRelevantData(MonthlySummary summary) {
        return summary.getTotalAmount().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getBalanceRemaining().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getCurrentMonthCreditDue().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getCash().getGain().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getCash().getLoss().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getCash().getDifference().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getCreditPaid().compareTo(BigDecimal.ZERO) != 0 ||
                summary.getCreditDue().compareTo(BigDecimal.ZERO) != 0 ||
                (summary.getCategoryBreakdown() != null && !summary.getCategoryBreakdown().isEmpty());
    }

    private List<Expense> getLastNExpenses(List<Expense> expenses, int n) {
        return expenses.stream()
                .sorted(Comparator.comparing(Expense::getDate).reversed())
                .limit(n)
                .toList();
    }

    private Map<String, Double> convertToDateTotalMap(List<Object[]> results) {
        Map<String, Double> totalExpensesByDate = new HashMap<>();
        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            Double totalAmount = (Double) row[1];
            totalExpensesByDate.put(date.toString(), totalAmount);
        }
        return totalExpensesByDate;
    }

    private Map<String, Double> convertToPaymentMethodMap(List<Object[]> results) {
        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : results) {
            result.put((String) obj[0], (Double) obj[1]);
        }
        return result;
    }

    private String createPaymentMethodKey(String paymentMethod, String expenseType) {
        return paymentMethod + (LOSS.equals(expenseType) ? " loss" : " gain");
    }

    private Map<String, Map<String, Double>> processGroupedExpenseResults(List<Object[]> results) {
        Map<String, Map<String, Double>> groupedExpenses = new HashMap<>();
        for (Object[] result : results) {
            String expenseName = ((String) result[0]).trim().toLowerCase();
            String paymentMethod = (String) result[1];
            Double totalAmount = (Double) result[2];
            groupedExpenses.computeIfAbsent(expenseName, k -> new HashMap<>()).merge(paymentMethod, totalAmount, Double::sum);
        }
        return groupedExpenses;
    }

    private Map<String, Map<String, Double>> processExpenseNamePaymentMethodResults(List<Object[]> results) {
        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Object[] obj : results) {
            String expenseName = (String) obj[0];
            String paymentMethod = (String) obj[1];
            Double totalAmount = (Double) obj[2];
            result.computeIfAbsent(expenseName, k -> new HashMap<>()).put(paymentMethod, totalAmount);
        }
        return result;
    }

    private Map<String, Double> calculateCategoryWiseSpending(List<Expense> expenses) {
        Map<String, Double> categoryWiseSpending = new HashMap<>();
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details != null) {
                String category = details.getType();
                categoryWiseSpending.merge(category, details.getAmount(), Double::sum);
            }
        }
        return categoryWiseSpending;
    }

    private double calculateAverageDailyExpenses(Map<String, Double> categoryWiseSpending, DatePeriod period) {
        Double lossAmount = categoryWiseSpending.get(LOSS);
        if (lossAmount == null) return 0.0;

        int daysInMonth = period.getStartDate().lengthOfMonth();
        if (daysInMonth > 0) {
            double average = lossAmount / daysInMonth;
            return Math.round(average * 100.0) / 100.0;
        }
        return 0.0;
    }

    private void validateYearAndLimit(int year, int limit) throws InvalidLimitException {
        validateYear(year);
        if (limit <= 0) {
            throw new InvalidLimitException("Limit must be greater than zero");
        }
    }

    private void validateYear(int year) throws InvalidLimitException {
        int actualYear = (year == 0) ? Year.now().getValue() : year;
        if (actualYear < 2000 || actualYear > 2100) {
            throw new InvalidLimitException("Year must be between 2000 and 2100");
        }
    }

    private Map<String, Object> createDistributionChart(List<Object[]> results) {
        Map<String, Object> response = new LinkedHashMap<>();
        String[] labels = new String[results.size()];
        Double[] data = new Double[results.size()];

        for (int i = 0; i < results.size(); i++) {
            labels[i] = (String) results.get(i)[0];
            data[i] = (Double) results.get(i)[1];
        }

        response.put(LABELS, labels);
        response.put(DATA_SETS, List.of(Map.of("data", data)));
        return response;
    }

    private Double[] processMonthlyData(List<Object[]> results) {
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);

        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();
            double total = ((Number) result[1]).doubleValue();
            if (month >= 1 && month <= 12) {
                data[month - 1] = total;
            }
        }

        return data;
    }

    private Map<String, Object> createTopExpensesChart(List<Object[]> results, int limit) {
        Map<String, Object> response = new LinkedHashMap<>();
        int size = Math.min(results.size(), limit);
        String[] labels = new String[size];
        Double[] data = new Double[size];

        for (int i = 0; i < size; i++) {
            labels[i] = (String) results.get(i)[0];
            data[i] = (Double) results.get(i)[1];
        }

        response.put(LABELS, labels);
        response.put(DATA_SETS, List.of(Map.of("data", data)));
        return response;
    }

    private Map<String, Object> createSingleDatasetChart(String label, String[] labels, Double[] data) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put(LABELS, labels);
        response.put(DATA_SETS, List.of(Map.of(LABEL, label, "data", data)));
        return response;
    }

    private Map<String, Object> createNameValueMap(Map.Entry<String, Double> entry) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", entry.getKey());
        data.put("value", entry.getValue());
        return data;
    }

    private Map<String, Object> createNameValueMap(String name, double value) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", name);
        data.put("value", value);
        return data;
    }

    private double calculateTotalSpending(List<Expense> expenses) {
        return expenses.stream()
                .filter(e -> e.getExpense() != null)
                .filter(e -> LOSS.equalsIgnoreCase(e.getExpense().getType()))
                .filter(e -> !CREDIT_PAID.equalsIgnoreCase(e.getExpense().getPaymentMethod()))
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();
    }

    private double calculateTotalIncome(List<Expense> expenses) {
        return expenses.stream()
                .filter(e -> e.getExpense() != null)
                .filter(e -> GAIN.equalsIgnoreCase(e.getExpense().getType()))
                .filter(e -> CASH.equalsIgnoreCase(e.getExpense().getPaymentMethod()))
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();
    }

    private Map<LocalDate, Double> calculateDailySpending(List<Expense> expenses) {
        Map<LocalDate, Double> dailySpending = new HashMap<>();

        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details != null &&
                    LOSS.equalsIgnoreCase(details.getType()) &&
                    !CREDIT_PAID.equalsIgnoreCase(details.getPaymentMethod())) {

                LocalDate date = expense.getDate();
                double amount = details.getAmount();
                dailySpending.merge(date, amount, Double::sum);
            }
        }

        return dailySpending;
    }

    private List<Map<String, Object>> generateDailySpendingResponse(DatePeriod period, Map<LocalDate, Double> dailySpending) {
        List<Map<String, Object>> response = new ArrayList<>();
        LocalDate date = period.getStartDate();

        while (!date.isAfter(period.getEndDate())) {
            Map<String, Object> dayEntry = new HashMap<>();
            dayEntry.put("day", date.toString());
            dayEntry.put("spending", dailySpending.getOrDefault(date, 0.0));
            response.add(dayEntry);
            date = date.plusDays(1);
        }

        return response;
    }




    private Map<LocalDate, Double> calculateDailySpendingByType(List<Expense> expenses, String type) {
        Map<LocalDate, Double> dailySpending = new HashMap<>();

        for (Expense expense : expenses) {
            if (shouldIncludeExpenseInCalculation(expense, type)) {
                LocalDate date = expense.getDate();
                double amount = expense.getExpense().getAmount();
                dailySpending.merge(date, amount, Double::sum);
            }
        }
        return dailySpending;
    }

    private boolean shouldIncludeExpenseInCalculation(Expense expense, String type) {
        ExpenseDetails details = expense.getExpense();

        if (details == null || CREDIT_PAID.equalsIgnoreCase(details.getPaymentMethod())) {
            return false;
        }

        return isExpenseTypeMatching(details.getType(), type);
    }

    private boolean isExpenseTypeMatching(String expenseType, String filterType) {
        if (filterType != null && !filterType.trim().isEmpty()) {
            return filterType.equalsIgnoreCase(expenseType);
        }
        // Default behavior: only include LOSS type expenses
        return LOSS.equalsIgnoreCase(expenseType);
    }



    


}